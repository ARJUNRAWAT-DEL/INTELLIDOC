from pydantic_settings import BaseSettings
from typing import Optional
import os

class Settings(BaseSettings):
    # Database
    database_url: str = "sqlite:///./ai_docs.db"
    postgres_url: Optional[str] = None
    
    # File processing
    chunk_size: int = 800
    chunk_overlap: int = 120
    max_file_size: int = 25 * 1024 * 1024  # 10MB
    upload_dir: str = "uploads"
    
    # AI Models - SAFE AND COMPATIBLE VERSIONS
    embedding_model: str = "sentence-transformers/all-MiniLM-L6-v2"  # Better embeddings
    summarization_model: str = "facebook/bart-large-cnn"
    reranker_model: str = "cross-encoder/ms-marco-MiniLM-L-6-v2"
    text_generation_model: str = "google/flan-t5-base"  
    
    # Search
    default_search_limit: int = 10
    max_search_limit: int = 50
    top_k_retrieval: int = 10
    top_k_synthesis: int = 3
    
    # CORS
    allowed_origins: list = ["*"]
    
    # Logging
    log_level: str = "INFO"
    log_file: str = "app.log"
    
    # Security
    allowed_extensions: set = {".pdf", ".docx", ".txt", ".doc"}
    
    # Hugging Face
    hf_token: Optional[str] = None
    huggingface_hub_token: Optional[str] = None
    
    # Dual Answer System Configuration
    use_dual_answers: bool = True  # Enable dual answers (local + GROQ)
    use_groq: bool = True  # Enable GROQ for second opinion
    groq_api_key: Optional[str] = None
    
    # Transformer/Tokenizer settings
    transformers_verbosity: Optional[str] = None
    tokenizers_parallelism: Optional[str] = None
    
    class Config:
        env_file = ".env"
        case_sensitive = False

# Global settings instance
settings = Settings()

# Ensure upload directory exists
try:
    os.makedirs(settings.upload_dir, exist_ok=True)
except Exception:
    pass  # Handle silently during import