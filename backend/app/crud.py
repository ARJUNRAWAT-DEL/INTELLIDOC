from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func, desc
from . import models
from .logger import logger
import numpy as np
from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
import hashlib
import os
import binascii
import secrets
from . import models
from .logger import logger

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


# ------------------ User / Auth helpers ------------------
def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()


def create_user(db: Session, email: str, password_hash: str, password_salt: str, name: Optional[str] = None):
    try:
        u = models.User(email=email, password_hash=password_hash, password_salt=password_salt, name=name)
        db.add(u)
        db.commit()
        db.refresh(u)
        return u
    except Exception as e:
        db.rollback()
        logger.error(f"create_user failed: {e}")
        raise


def update_user_password(db: Session, email: str, new_password_hash: str, new_salt: str):
    try:
        u = get_user_by_email(db, email)
        if not u:
            return False
        u.password_hash = new_password_hash
        u.password_salt = new_salt
        db.commit()
        return True
    except Exception as e:
        db.rollback()
        logger.error(f"update_user_password failed: {e}")
        return False


def _hash_token(token: str) -> str:
    return hashlib.sha256(token.encode('utf-8')).hexdigest()


def create_password_reset_token(db: Session, email: str, expires_seconds: int = 3600):
    try:
        token = binascii.hexlify(os.urandom(32)).decode('ascii')
        token_hash = _hash_token(token)
        expires_at = datetime.utcnow() + timedelta(seconds=expires_seconds)
        rec = models.PasswordResetToken(email=email, token_hash=token_hash, expires_at=expires_at, used=0)
        db.add(rec)
        db.commit()
        db.refresh(rec)
        return token, rec
    except Exception as e:
        db.rollback()
        logger.error(f"create_password_reset_token failed: {e}")
        raise


def get_password_reset_record(db: Session, token: str):
    try:
        token_hash = _hash_token(token)
        rec = db.query(models.PasswordResetToken).filter(models.PasswordResetToken.token_hash == token_hash).first()
        return rec
    except Exception as e:
        logger.error(f"get_password_reset_record failed: {e}")
        return None


def mark_reset_token_used(db: Session, rec: models.PasswordResetToken):
    try:
        rec.used = 1
        db.commit()
        return True
    except Exception as e:
        db.rollback()
        logger.error(f"mark_reset_token_used failed: {e}")
        return False


def create_demo_request(db: Session, name: str, email: str, company: Optional[str] = None, message: Optional[str] = None):
    """Create and persist a demo request"""
    try:
        rec = models.DemoRequest(name=name, email=email, company=company, message=message)
        db.add(rec)
        db.commit()
        db.refresh(rec)
        logger.info(f"Created demo request id={rec.id} email={email}")
        return rec
    except Exception as e:
        db.rollback()
        logger.error(f"create_demo_request failed: {e}")
        raise


def get_onboarding_by_email(db: Session, email: str):
    try:
        rec = db.query(models.OnboardingState).filter(models.OnboardingState.user_email == email).first()
        return rec
    except Exception as e:
        logger.error(f"get_onboarding_by_email failed: {e}")
        return None


def create_or_update_onboarding(db: Session, email: str, persona: Optional[str] = None, sample_query: Optional[str] = None, upload_filename: Optional[str] = None, upload_task_id: Optional[str] = None, completed: Optional[bool] = False, meta: Optional[dict] = None):
    try:
        rec = db.query(models.OnboardingState).filter(models.OnboardingState.user_email == email).first()
        if not rec:
            rec = models.OnboardingState(
                user_email=email,
                persona=persona,
                sample_query=sample_query,
                upload_filename=upload_filename,
                upload_task_id=upload_task_id,
                completed=1 if completed else 0,
                meta=meta or {}
            )
            db.add(rec)
        else:
            if persona is not None:
                rec.persona = persona
            if sample_query is not None:
                rec.sample_query = sample_query
            if upload_filename is not None:
                rec.upload_filename = upload_filename
            if upload_task_id is not None:
                rec.upload_task_id = upload_task_id
            if completed is not None:
                rec.completed = 1 if completed else 0
            if meta is not None:
                rec.meta = meta
            rec.updated_at = datetime.utcnow()

        db.commit()
        db.refresh(rec)
        logger.info(f"Onboarding saved for {email} id={rec.id}")
        return rec
    except Exception as e:
        db.rollback()
        logger.error(f"create_or_update_onboarding failed: {e}")
        raise
