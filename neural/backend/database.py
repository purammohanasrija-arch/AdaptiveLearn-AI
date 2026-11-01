import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# SQLite database file located in the backend folder
DB_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "adaptive_learn.db")
SQLALCHEMY_DATABASE_URL = f"sqlite:///{DB_FILE}"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False}  # Needed for SQLite in multi-threaded FastAPI
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def ensure_schema_migrations():
    """
    Safely executes non-destructive column migrations for SQLite.
    Adds any missing columns to existing tables without dropping data.
    """
    with engine.connect() as conn:
        # Check users table columns
        cursor = conn.connection.cursor()
        cursor.execute("PRAGMA table_info(users)")
        existing_cols = {row[1] for row in cursor.fetchall()}

        if "email_verified" not in existing_cols:
            cursor.execute("ALTER TABLE users ADD COLUMN email_verified BOOLEAN DEFAULT 1")
        if "profile_image" not in existing_cols:
            cursor.execute("ALTER TABLE users ADD COLUMN profile_image VARCHAR(512) DEFAULT ''")
        if "failed_login_attempts" not in existing_cols:
            cursor.execute("ALTER TABLE users ADD COLUMN failed_login_attempts INTEGER DEFAULT 0")
        if "locked_until" not in existing_cols:
            cursor.execute("ALTER TABLE users ADD COLUMN locked_until DATETIME")
        if "updated_at" not in existing_cols:
            cursor.execute("ALTER TABLE users ADD COLUMN updated_at DATETIME")
        conn.connection.commit()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

