from pydantic import BaseModel, Field, validator
from typing import Optional, List, Dict, Any
from datetime import datetime

class ChunkBase(BaseModel):
    text: str = Field(..., min_length=1, max_length=10000)

class Chunk(ChunkBase):
    id: int
    doc_id: int
    class Config:
        from_attributes = True

class DocumentBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    content: str = Field(..., min_length=1)

class DocumentCreate(DocumentBase):
    summary: Optional[str] = None
    chunks: Optional[List[ChunkBase]] = None

class Document(DocumentBase):
    id: int
    summary: Optional[str] = None
    created_at: Optional[datetime] = None
    file_size: Optional[int] = None
    file_type: Optional[str] = None
    chunks: List[Chunk] = []
    
    class Config:
        from_attributes = True

class DocumentSummary(BaseModel):
    """Lightweight document info for listings"""
    id: int
    title: str
    summary: Optional[str] = None
    created_at: Optional[datetime] = None
    file_size: Optional[int] = None
    file_type: Optional[str] = None
    chunks_count: Optional[int] = None
    
    class Config:
        from_attributes = True

# Search schemas
class SearchQuery(BaseModel):
    q: str = Field(..., min_length=1, max_length=500, description="Search query")
    limit: int = Field(10, ge=1, le=50, description="Number of results to return")
    offset: int = Field(0, ge=0, description="Number of results to skip")
    doc_id: Optional[int] = Field(None, description="Search within specific document")

class Source(BaseModel):
    doc_id: int
    doc_title: str

class DualAnswerInfo(BaseModel):
    """Information about dual answer generation"""
    local_answer: str
    groq_answer: str
    selected_source: str  # "local" or "groq"
    selection_reason: str
    dual_answers_enabled: bool

class AnswerOut(BaseModel):
    query: str
    answer: str  # The selected best answer
    sources: List[Source]
    processing_time: Optional[float] = None
    dual_answers: Optional[DualAnswerInfo] = None  # Dual answer details

# Task management schemas
class TaskStatus(BaseModel):
    task_id: str
    status: str  # "processing", "completed", "failed"
    progress: int = Field(..., ge=0, le=100)
    message: str
    result: Optional[Dict[str, Any]] = None

class UploadResponse(BaseModel):
    task_id: str
    status: str
    message: str

# Health and metrics schemas
class HealthCheck(BaseModel):
    status: str
    database: str
    models: Dict[str, Any]
    timestamp: datetime

class Metrics(BaseModel):
    documents_count: int
    chunks_count: int
    avg_chunks_per_doc: float
    total_file_size: int
    model_info: Dict[str, Any]
