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
