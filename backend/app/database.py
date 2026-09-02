import os

from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker


backend_dir = os.path.dirname(
    os.path.dirname(os.path.abspath(__file__))
)

DB_PATH = os.path.join(
    backend_dir,
    "warehouse.db"
)

DATABASE_URL = f"sqlite:///{DB_PATH}"

print("[DATABASE] Using local SQLite database.")
print(f"[DATABASE] Database file: {DB_PATH}")


engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False}
)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()