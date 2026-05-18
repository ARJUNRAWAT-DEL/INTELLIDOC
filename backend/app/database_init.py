"""
Database initialization script that creates tables.
Run this before starting the application for the first time.
"""

from .db import engine, Base
from . import models

def create_tables():
    """Create all database tables and run any required migrations."""
    try:
        print("Creating database tables...")
        Base.metadata.create_all(bind=engine)
        print("Database tables created successfully!")
        _migrate_add_user_email()
        return True
    except Exception as e:
        print(f"Error creating tables: {e}")
        return False


def _migrate_add_user_email():
    """Add user_email column to documents table if it doesn't exist (SQLite migration)."""
    try:
        from sqlalchemy import inspect as sa_inspect, text
        insp = sa_inspect(engine)
        cols = [c["name"] for c in insp.get_columns("documents")]
        if "user_email" not in cols:
            with engine.connect() as conn:
                conn.execute(text("ALTER TABLE documents ADD COLUMN user_email VARCHAR(255)"))
                conn.commit()
            print("Migration: added user_email column to documents table")
    except Exception as e:
        print(f"Migration warning (user_email): {e}")

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