from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from sqlalchemy.pool import QueuePool
from .config import settings

# Use configuration-based database URL - prioritize SQLite for development
DATABASE_URL = settings.database_url

# Create engine with connection pooling and better error handling
print(f"Attempting to connect to database: {DATABASE_URL}")

try:
    if DATABASE_URL.startswith("sqlite"):
        # SQLite doesn't need connection pooling
        engine = create_engine(
            DATABASE_URL, 
            echo=False,
            connect_args={"check_same_thread": False}  # Allow SQLite to work with FastAPI
        )
        print("Using SQLite database")
    else:
        # PostgreSQL with connection pooling
        engine = create_engine(
            DATABASE_URL,
            poolclass=QueuePool,
            pool_size=10,
            max_overflow=20,
            pool_pre_ping=True,  # Verify connections before use
            echo=False  # Set to True for SQL debugging
        )
        print("Using PostgreSQL database")
except Exception as e:
    print(f"Failed to create database engine: {e}")
    # Fallback to in-memory SQLite
    print("Falling back to in-memory SQLite database")
    engine = create_engine(
        "sqlite:///:memory:", 
        echo=False,
        connect_args={"check_same_thread": False}
    )

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_db():
    # Import models so tables get registered
    from . import models  
    print("Creating tables if they don't exist...")
    Base.metadata.create_all(bind=engine)
    print("Tables ready!")
