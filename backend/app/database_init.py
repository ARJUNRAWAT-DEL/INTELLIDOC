"""
Database initialization script that creates tables.
Run this before starting the application for the first time.
"""

from .db import engine, Base
from . import models

def create_tables():
    """Create all database tables"""
    try:
        print("Creating database tables...")
        Base.metadata.create_all(bind=engine)
        print("Database tables created successfully!")
        return True
    except Exception as e:
        print(f"Error creating tables: {e}")
        return False

def drop_tables():
    """Drop all database tables (use with caution!)"""
    try:
        print("Dropping all database tables...")
        Base.metadata.drop_all(bind=engine)
        print("All tables dropped successfully!")
        return True
    except Exception as e:
        print(f"Error dropping tables: {e}")
        return False

def reset_database():
    """Drop and recreate all tables"""
    print("Resetting database...")
    if drop_tables():
        return create_tables()
    return False

if __name__ == "__main__":
    create_tables()