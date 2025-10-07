import os
from fastapi import HTTPException, UploadFile
from .config import settings
from .logger import logger

# Optional import for file type detection
try:
    import magic
    MAGIC_AVAILABLE = True
except ImportError:
    MAGIC_AVAILABLE = False
    magic = None

def validate_file(file: UploadFile) -> None:
    """Validate uploaded file for security and format compliance"""

    if not file or not file.filename:
        raise HTTPException(status_code=400, detail="Filename is required")

    # NOTE: Some ASGI servers don't populate file.size; leave size check to server limits
    ext = os.path.splitext(file.filename)[1].lower()

    allowed = (
        settings.allowed_extensions
        if isinstance(settings.allowed_extensions, (list, set, tuple))
        else [settings.allowed_extensions]
    )
    if ext not in allowed:
        logger.warning(f"Unsupported file type: {file.filename} ({ext})")
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type: {ext}. Allowed: {', '.join(allowed)}"
        )

    logger.info(f"File validation passed: {file.filename}")

def get_safe_filename(filename: str) -> str:
    """Generate safe filename to prevent directory traversal"""
    # Remove path components and dangerous characters
    safe_name = os.path.basename(filename)
    safe_name = "".join(c for c in safe_name if c.isalnum() or c in "._-")

    if not safe_name:
        safe_name = "uploaded_file"
    return safe_name

def detect_file_type(file_path: str) -> str:
    """Detect actual file type using python-magic or fallback to extension-based detection"""
    if MAGIC_AVAILABLE:
        try:
            mime_type = magic.from_file(file_path, mime=True)
            return mime_type
        except Exception as e:
            logger.warning(f"Could not detect file type for {file_path}: {e}")

    # Fallback to extension-based detection
    ext = os.path.splitext(file_path)[1].lower()
    mime_types = {
        '.pdf': 'application/pdf',
        '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        '.doc': 'application/msword',
        '.txt': 'text/plain'
    }
    return mime_types.get(ext, "application/octet-stream")
