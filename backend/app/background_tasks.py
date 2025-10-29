import uuid
from typing import Dict, Any
from sqlalchemy.orm import Session
import os
import time
import shutil

from . import crud, db
from .logger import logger
from .config import settings
from .validators import get_safe_filename, detect_file_type

# Import both AI backends - choice will be made at runtime
from . import ai_utils
from . import mcp_ai_utils
from .mcp_client import mcp_client

def get_ai_utils():
    """Get appropriate AI utils based on current configuration"""
    use_mcp = getattr(settings, 'use_mcp', True)
    if use_mcp:
        try:
            # Test if MCP client is available
            if hasattr(mcp_client, '_connected') and mcp_client._connected:
                return mcp_ai_utils
        except:
            pass
    return ai_utils

# In-memory storage for task status (in production, use Redis or a DB table)
task_status: Dict[str, Dict[str, Any]] = {}

def generate_task_id() -> str:
    """Generate unique task ID"""
    return str(uuid.uuid4())

def update_task_status(
    task_id: str,
    status: str,
    progress: int = 0,
    message: str = "",
    result: Any = None
):
    """Update task status"""
    task_status[task_id] = {
        "status": status,      # "processing", "completed", "failed"
        "progress": progress,  # 0-100
        "message": message,
        "result": result,
        "updated_at": time.time()
    }
    logger.info(f"Task {task_id}: {status} - {message} ({progress}%)")

def get_task_status(task_id: str) -> Dict[str, Any]:
    """Get task status"""
    return task_status.get(task_id, {"status": "not_found", "message": "Task not found"})

def process_document_async(
    file_content: bytes,
    filename: str,
    task_id: str,
) -> None:
    """Process document asynchronously (runs in Starlette background task)."""
    session: Session = db.SessionLocal()
    file_path = None
    try:
        update_task_status(task_id, "processing", 10, "Starting document processing")

        # Ensure the upload directory exists
        os.makedirs(settings.upload_dir, exist_ok=True)

        # Save file to disk
        safe_filename = get_safe_filename(filename)
        file_path = os.path.join(settings.upload_dir, f"{task_id}_{safe_filename}")
        with open(file_path, "wb") as f:
            f.write(file_content)
        logger.info(f"Saved uploaded file to {file_path}")
        update_task_status(task_id, "processing", 20, "File saved, extracting text")

        # Extract text
        ai_backend = get_ai_utils()
        content = ai_backend.extract_text_from_file(file_path)
        if not content or not content.strip():
            # Provide a more actionable failure message so frontend/users know why upload "succeeds"
            # but processing fails. Common causes: image-only (scanned) PDFs and missing OCR
            # dependencies (poppler/pdftoppm, pdf2image, pytesseract / Tesseract OCR).
            hint = (
                "Could not extract text from file. The PDF may be image-only (scanned), or text extraction "
                "failed. To enable OCR fallback install poppler (pdftoppm) and Tesseract, and add the Python "
                "packages `pdf2image` and `pytesseract`."
            )
            update_task_status(task_id, "failed", 0, hint)
            # Preserve a copy of the failed upload for debugging
            try:
                failed_dir = os.path.join(settings.upload_dir, "failed_uploads")
                os.makedirs(failed_dir, exist_ok=True)
                failed_copy = os.path.join(failed_dir, os.path.basename(file_path))
                shutil.copy(file_path, failed_copy)
                logger.info(f"Copied failed upload to {failed_copy} for inspection")
            except Exception as e:
                logger.warning(f"Could not copy failed upload for inspection: {e}")
            return

        update_task_status(task_id, "processing", 40, "Text extracted, generating summary")

        # Generate summary on a preview slice (keeps things fast and safe)
        preview = " ".join(content.split()[:1500])
        summary = ai_backend.generate_summary(preview)

        update_task_status(task_id, "processing", 60, "Summary generated, creating embeddings")

        # Generate embeddings
        chunk_data = ai_backend.generate_embeddings_in_chunks(
            content,
            chunk_size=settings.chunk_size,
            overlap=settings.chunk_overlap
        )
        if not chunk_data:
            update_task_status(task_id, "failed", 0, "Embedding generation failed")
            return

        update_task_status(task_id, "processing", 80, "Embeddings created, saving to database")

        # Save to database
        doc = crud.create_document(
            session,
            title=filename,
            content=content,
            summary=summary,
            chunks=chunk_data
        )

        # Detect file metadata
        file_type = detect_file_type(file_path)
        file_size = os.path.getsize(file_path)

        # Update document with metadata
        crud.update_document_metadata(session, doc.id, file_type, file_size)

        update_task_status(
            task_id,
            "completed",
            100,
            "Document processed successfully",
            {
                "document_id": doc.id,
                "title": doc.title,
                "chunks_count": len(chunk_data),
                "file_size": file_size,
                "file_type": file_type
            }
        )
        logger.info(f"Document processed successfully: {filename} (ID: {doc.id})")

    except Exception as e:
        logger.error(f"Document processing failed for {filename}: {e}")
        update_task_status(task_id, "failed", 0, f"Processing failed: {e}")

    finally:
        # Always close DB session
        try:
            session.close()
        except Exception:
            pass

        # Clean up temp file
        if file_path and os.path.exists(file_path):
            try:
                os.remove(file_path)
            except Exception as e:
                logger.warning(f"Could not remove temp file {file_path}: {e}")

def cleanup_old_tasks(max_age_hours: int = 24):
    """Clean up old task statuses"""
    current_time = time.time()
    cutoff_time = current_time - (max_age_hours * 3600)

    old_tasks = [
        task_id for task_id, status in list(task_status.items())
        if status.get("updated_at", 0) < cutoff_time
    ]

    for task_id in old_tasks:
        del task_status[task_id]

    if old_tasks:
        logger.info(f"Cleaned up {len(old_tasks)} old tasks")
