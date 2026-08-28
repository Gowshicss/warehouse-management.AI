import os
from dotenv import load_dotenv
from sqlalchemy import create_engine, text
from sqlalchemy.orm import declarative_base, sessionmaker

backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
env_path = os.path.join(backend_dir, ".env")
load_dotenv(env_path)

DATABASE_URL = os.getenv("DATABASE_URL")
ENVIRONMENT = os.getenv("ENVIRONMENT", "production").lower()

engine = None

if DATABASE_URL:
    # Standardize legacy postgres:// prefix for SQLAlchemy 2.0+
    if DATABASE_URL.startswith("postgres://"):
        DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)
    
    try:
        engine = create_engine(
            DATABASE_URL,
            pool_pre_ping=True,
            pool_size=10,
            max_overflow=20,
            connect_args={"connect_timeout": 10}
        )
        # Test connection at startup
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        print("[DATABASE] Successfully connected to primary PostgreSQL database.")
    except Exception as e:
        print("[DATABASE ERROR] Critical: Failed to connect to PostgreSQL database.")
        print(f"[DATABASE ERROR] Reason: {e}")
        # Fail loudly in production - DO NOT silently fallback to SQLite
        raise RuntimeError("Failed to connect to primary PostgreSQL database. Startup aborted.") from e
else:
    # Local development mode fallback only when explicitly enabled or in development mode
    if ENVIRONMENT == "development" or os.getenv("USE_SQLITE", "false").lower() == "true":
        print("[DATABASE] DATABASE_URL not set. Running in local development mode using SQLite (warehouse.db).")
        DB_PATH = os.path.join(backend_dir, "warehouse.db")
        SQLALCHEMY_DATABASE_URL = f"sqlite:///{DB_PATH}"
        engine = create_engine(
            SQLALCHEMY_DATABASE_URL,
            connect_args={"check_same_thread": False}
        )
    else:
        print("[DATABASE ERROR] Critical: DATABASE_URL environment variable is missing.")
        raise RuntimeError("DATABASE_URL environment variable is missing. Startup aborted.")

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
