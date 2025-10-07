from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func, desc
from . import models
from .logger import logger
import numpy as np
from typing import List, Optional, Dict, Any

# ------------------ Create document ------------------
def create_document(db: Session, title: str, content: str, summary: str, chunks: list):
    """
    Creates a document and its associated chunks with embeddings.
    `chunks` should be a list of dicts: { "text": str, "embedding": list[float] }
    """
    try:
        db_doc = models.Document(
            title=title,
            content=content,
            summary=summary
        )
        db.add(db_doc)
        db.commit()
        db.refresh(db_doc)

        # Add chunks with embeddings
        for chunk in chunks:
            db_chunk = models.Chunk(
                doc_id=db_doc.id,
                text=chunk["text"],
                embedding=chunk["embedding"]  # already normalized in ai_utils
            )
            db.add(db_chunk)

        db.commit()
        logger.info(f"Created document {db_doc.id} with {len(chunks)} chunks")
        return db_doc

    except Exception as e:
        db.rollback()
        logger.error(f"Failed to create document: {e}")
        raise

def update_document_metadata(db: Session, doc_id: int, file_type: str, file_size: int):
    """Update document metadata"""
    try:
        doc = db.query(models.Document).filter(models.Document.id == doc_id).first()
        if doc:
            doc.file_type = file_type
            doc.file_size = file_size
            db.commit()
            logger.info(f"Updated metadata for document {doc_id}")
    except Exception as e:
        db.rollback()
        logger.error(f"Failed to update document metadata: {e}")

# ------------------ Document CRUD operations ------------------
def get_documents(db: Session, skip: int = 0, limit: int = 100) -> List[models.Document]:
    """Get documents with pagination"""
    return (
        db.query(models.Document)
        .order_by(desc(models.Document.created_at))
        .offset(skip)
        .limit(limit)
        .all()
    )

def get_documents_summary(db: Session, skip: int = 0, limit: int = 100) -> List[Dict[str, Any]]:
    """Get documents summary with chunk counts"""
    result = (
        db.query(
            models.Document.id,
            models.Document.title,
            models.Document.summary,
            models.Document.created_at,
            models.Document.file_size,
            models.Document.file_type,
            func.count(models.Chunk.id).label('chunks_count')
        )
        .outerjoin(models.Chunk)
        .group_by(models.Document.id)
        .order_by(desc(models.Document.created_at))
        .offset(skip)
        .limit(limit)
        .all()
    )

    return [
        {
            "id": row.id,
            "title": row.title,
            "summary": row.summary,
            "created_at": row.created_at,
            "file_size": row.file_size,
            "file_type": row.file_type,
            "chunks_count": row.chunks_count
        }
        for row in result
    ]

def get_document(db: Session, doc_id: int) -> Optional[models.Document]:
    """Get document by ID"""
    return db.query(models.Document).filter(models.Document.id == doc_id).first()

def delete_document(db: Session, doc_id: int) -> bool:
    """Delete document and its chunks"""
    try:
        doc = get_document(db, doc_id)
        if doc:
            db.delete(doc)
            db.commit()
            logger.info(f"Deleted document {doc_id}")
            return True
        return False
    except Exception as e:
        db.rollback()
        logger.error(f"Failed to delete document {doc_id}: {e}")
        return False

def count_documents(db: Session) -> int:
    """Count total documents"""
    return db.query(models.Document).count()

def get_total_file_size(db: Session) -> int:
    """Get total file size of all documents"""
    result = db.query(func.sum(models.Document.file_size)).scalar()
    return result or 0

# ------------------ Cosine similarity ------------------
def cosine_similarity(a, b):
    a = np.array(a, dtype=np.float32)
    b = np.array(b, dtype=np.float32)
    denom = (np.linalg.norm(a) * np.linalg.norm(b))
    if denom == 0:
        return 0.0
    return float(np.dot(a, b) / denom)

# ------------------ Search chunks ------------------
def search_chunks(
    db: Session,
    query_embedding: list,
    top_k: int = 5,
    offset: int = 0,
    doc_id: Optional[int] = None
) -> List[Dict[str, Any]]:
    """
    Optimized search with early termination and batch processing.
    Uses in-memory cosine similarity for now (works fine for small/mid scale).
    If scaling up, switch to pgvector or FAISS for ANN search.
    """
    query = db.query(models.Chunk).options(joinedload(models.Chunk.document))

    # Filter by document if specified
    if doc_id:
        query = query.filter(models.Chunk.doc_id == doc_id)

    chunks = query.all()
    if not chunks:
        return []

    # Convert query embedding to numpy for faster computation
    query_emb = np.array(query_embedding, dtype=np.float32)
    
    results = []
    for c in chunks:
        try:
            # Faster vectorized cosine similarity
            chunk_emb = np.array(c.embedding, dtype=np.float32)
            score = float(np.dot(query_emb, chunk_emb) / (np.linalg.norm(query_emb) * np.linalg.norm(chunk_emb)))
        except Exception as e:
            logger.warning(f"Failed to compute similarity for chunk {c.id}: {e}")
            score = 0.0
        
        results.append({
            "text": c.text,
            "doc_id": c.doc_id,
            "doc_title": c.document.title if c.document else None,
            "score": score
        })

    # Sort by similarity and apply pagination
    results = sorted(results, key=lambda x: x["score"], reverse=True)
    start_idx = offset
    end_idx = offset + top_k
    return results[start_idx:end_idx]

def count_chunks(db: Session) -> int:
    """Count total chunks"""
    return db.query(models.Chunk).count()
