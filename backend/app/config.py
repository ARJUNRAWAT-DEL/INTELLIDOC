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

    # OAuth / Auth provider settings (read from .env if present)
    google_client_id: Optional[str] = None
    google_client_secret: Optional[str] = None
    github_client_id: Optional[str] = None
    github_client_secret: Optional[str] = None
    public_base_url: Optional[str] = None
    # Secret used for signing short-lived tokens (password reset)
    secret_key: Optional[str] = None
    # SMTP settings (optional) - when provided the server will attempt to send reset emails
    smtp_host: Optional[str] = None
    smtp_port: Optional[int] = None
    smtp_user: Optional[str] = None
    smtp_pass: Optional[str] = None
    smtp_from: Optional[str] = None
    # Frontend base URL used for building reset links (e.g. http://localhost:5173)
    frontend_base_url: Optional[str] = None
    
    class Config:
        # Try to find a .env file in common places: app folder, backend folder, or repo root.
        # This helps when uvicorn is started from different working directories.
        env_file = None
        case_sensitive = False

        @staticmethod
        def _find_env_file():
            # Candidate locations relative to this file
            candidates = [
                os.path.join(os.path.dirname(__file__), '.env'),  # backend/app/.env
                os.path.join(os.path.dirname(__file__), '..', '.env'),  # backend/.env
                os.path.join(os.path.dirname(__file__), '..', '..', '.env'),  # repo-root/.env
            ]
            for c in candidates:
                try:
                    if os.path.exists(c):
                        return os.path.abspath(c)
                except Exception:
                    continue
            # Fallback to default (no file)
            return None

        # Compute env_file at import-time
        env_file = _find_env_file()
        case_sensitive = False

# Global settings instance
settings = Settings()

# Ensure upload directory exists
try:
    os.makedirs(settings.upload_dir, exist_ok=True)
except Exception:
    pass  # Handle silently during import