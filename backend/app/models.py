from sqlalchemy import Column, Integer, String, ForeignKey, Float, DateTime, Index, Text, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from .db import Base

class Document(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), index=True)
    content = Column(Text)
    summary = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    file_size = Column(Integer)
    file_type = Column(String(100))
    
    chunks = relationship("Chunk", back_populates="document", cascade="all, delete-orphan")

    __table_args__ = (
        Index('ix_document_title_created', 'title', 'created_at'),
        Index('ix_document_type_created', 'file_type', 'created_at'),
    )

class Chunk(Base):
    __tablename__ = "chunks"

    id = Column(Integer, primary_key=True, index=True)
    text = Column(Text)
    # Store embeddings as JSON for SQLite compatibility
    embedding = Column(JSON)
    doc_id = Column(Integer, ForeignKey("documents.id", ondelete="CASCADE"))

    document = relationship("Document", back_populates="chunks")
    
    __table_args__ = (
        Index('ix_chunk_doc_id', 'doc_id'),
    )


class User(Base):
    __tablename__ = 'users'

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    name = Column(String(255), nullable=True)
    password_hash = Column(String(512), nullable=True)
    password_salt = Column(String(128), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class PasswordResetToken(Base):
    __tablename__ = 'password_reset_tokens'

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), index=True, nullable=False)
    token_hash = Column(String(128), nullable=False, index=True)
    expires_at = Column(DateTime, nullable=False)
    used = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)


class DemoRequest(Base):
    __tablename__ = 'demo_requests'

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=True)
    email = Column(String(255), index=True, nullable=False)
    company = Column(String(255), nullable=True)
    message = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)


class OnboardingState(Base):
    __tablename__ = 'onboarding_states'

    id = Column(Integer, primary_key=True, index=True)
    user_email = Column(String(255), index=True, nullable=False)
    persona = Column(String(100), nullable=True)
    sample_query = Column(Text, nullable=True)
    upload_filename = Column(String(512), nullable=True)
    upload_task_id = Column(String(128), nullable=True)
    completed = Column(Integer, default=0)
    meta = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow)
