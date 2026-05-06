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


class PageRange(BaseModel):
    start: Optional[int] = None
    end: Optional[int] = None


class Source(BaseModel):
    doc_id: int
    doc_title: str


class Citation(BaseModel):
    """Citation for a specific piece of evidence"""
    quote: str
    chunk_id: int
    doc_id: int
    doc_title: str
    confidence: Optional[float] = None
    page_number: Optional[int] = None
    paragraph_number: Optional[int] = None
    section_title: Optional[str] = None


class AnswerRequestIn(BaseModel):
    document_id: Optional[int] = None
    question: str = Field(..., min_length=1, max_length=500)
    answer_length: str = Field("balanced", description="short|balanced|detailed")
    answer_mode: str = Field("summary", description="summary|qa|keypoints|pageexplanation|actionitems")
    page_range: Optional[PageRange] = None
    export_format: Optional[str] = Field(None, description="pdf|docx")


class AnswerExportIn(BaseModel):
    document_id: Optional[int] = None
    document_name: Optional[str] = None
    question: str = Field(..., min_length=1, max_length=500)
    answer: str = Field(..., min_length=1)
    answer_length: str = Field("balanced")
    answer_mode: str = Field("summary")
    page_range: Optional[PageRange] = None
    sources: List[Dict[str, Any]] = []
    citations: List[Dict[str, Any]] = []
    generated_at: Optional[datetime] = None

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
    citations: Optional[List['Citation']] = None
    answer_length: Optional[str] = None
    answer_mode: Optional[str] = None
    page_range: Optional[PageRange] = None
    document_name: Optional[str] = None
    generated_at: Optional[datetime] = None

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


class DemoRequestIn(BaseModel):
    name: Optional[str] = None
    email: str
    company: Optional[str] = None
    message: Optional[str] = None


class DemoRequestOut(BaseModel):
    id: int
    name: Optional[str] = None
    email: str
    company: Optional[str] = None
    message: Optional[str] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class OnboardingIn(BaseModel):
    user_email: str
    persona: Optional[str] = None
    sample_query: Optional[str] = None
    upload_filename: Optional[str] = None
    upload_task_id: Optional[str] = None
    completed: Optional[bool] = False
    meta: Optional[Dict[str, Any]] = None


class OnboardingOut(BaseModel):
    id: int
    user_email: str
    persona: Optional[str] = None
    sample_query: Optional[str] = None
    upload_filename: Optional[str] = None
    upload_task_id: Optional[str] = None
    completed: bool = False
    meta: Optional[Dict[str, Any]] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# Phase 1: Conversation Threading and Citations
class ConversationMessageOut(BaseModel):
    id: int
    query: str
    answer: str
    sources: Optional[List[Source]] = None
    citations: Optional[List[Citation]] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class ConversationThreadOut(BaseModel):
    id: int
    thread_id: str
    title: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    messages: List[ConversationMessageOut] = []

    class Config:
        from_attributes = True


class AnswerOutWithCitations(BaseModel):
    """Extended AnswerOut with chunk-level citations"""
    query: str
    answer: str
    sources: List[Source]
    citations: List[Citation]  # Chunk-level citations
    processing_time: Optional[float] = None
    dual_answers: Optional[DualAnswerInfo] = None
    thread_id: Optional[str] = None  # If part of a conversation thread
    answer_length: Optional[str] = None
    answer_mode: Optional[str] = None
    page_range: Optional[PageRange] = None
    document_name: Optional[str] = None
    generated_at: Optional[datetime] = None


# Phase 2: Entity Extraction
class ExtractedEntity(BaseModel):
    """Extracted entity from document"""
    type: str  # "EMAIL", "DATE", "PHONE", "AMOUNT", "PERSON", "ORGANIZATION", "LOCATION"
    value: str
    text: str  # Original text from document
    start_char: int  # Position in chunk
    end_char: int
    confidence: float  # 0-1


class ExtractionResult(BaseModel):
    """Result of entity extraction from documents"""
    doc_id: int
    doc_title: str
    entities: List[ExtractedEntity]


# Phase 3: Document Comparison
class ComparisonSection(BaseModel):
    """Section of comparison between documents"""
    category: str  # "common_themes", "unique_to_doc_1", "unique_to_doc_2", "similarities"
    content: str
    referenced_docs: List[int]  # Which docs contain this
    evidence: Optional[List[str]] = None  # Supporting quotes


class DocumentComparison(BaseModel):
    """Comparison of multiple documents"""
    doc_ids: List[int]
    doc_titles: List[str]
    common_themes: List[str]
    unique_points: Dict[str, List[str]]  # {doc_title: [unique_points]}
    similarities: List[str]
    differences: List[str]
    comparison_summary: str
    sections: List[ComparisonSection]


# Phase 4: Multilingual Support
class TranslationResult(BaseModel):
    """Result of text translation"""
    original_text: str
    original_language: str
    target_language: str
    translated_text: str


class LanguageDetectionResult(BaseModel):
    """Language detection result"""
    text: str
    detected_language: str
    language_code: str
    confidence: float


class MultilingualSummary(BaseModel):
    """Summary in multiple languages"""
    doc_id: int
    doc_title: str
    summaries: Dict[str, str]  # {language_code: summary_text}
    available_languages: List[str]
