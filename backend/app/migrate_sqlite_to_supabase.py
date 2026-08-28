import os
import sys
from dotenv import load_dotenv
from sqlalchemy import create_engine, select, text, func
from sqlalchemy.orm import sessionmaker

# Ensure backend directory is in path
backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if backend_dir not in sys.path:
    sys.path.append(backend_dir)

env_path = os.path.join(backend_dir, ".env")
load_dotenv(env_path)

from app.models import Base

def run_migration():
    sqlite_db_path = os.path.join(backend_dir, "warehouse.db")
    if not os.path.exists(sqlite_db_path):
        print(f"[ERROR] Source SQLite database not found at: {sqlite_db_path}")
        sys.exit(1)

    target_db_url = os.getenv("DATABASE_URL")
    if not target_db_url:
        print("[ERROR] DATABASE_URL is not set in backend/.env!")
        print("Please create backend/.env with your Supabase PostgreSQL connection string, e.g.:")
        print("DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[REF].supabase.co:5432/postgres")
        sys.exit(1)

    if target_db_url.startswith("postgres://"):
        target_db_url = target_db_url.replace("postgres://", "postgresql://", 1)

    print(f"[MIGRATION] Source DB: {sqlite_db_path}")
    print(f"[MIGRATION] Target Supabase PostgreSQL: {target_db_url.split('@')[-1]}")

    # Source SQLite engine & session
    sqlite_engine = create_engine(f"sqlite:///{sqlite_db_path}")
    SqliteSession = sessionmaker(bind=sqlite_engine)
    sqlite_db = SqliteSession()

    # Target PostgreSQL engine & session
    target_engine = create_engine(target_db_url)
    TargetSession = sessionmaker(bind=target_engine)
    target_db = TargetSession()

    print("\n[MIGRATION] Creating tables on target database if needed...")
    Base.metadata.create_all(bind=target_engine)

    # Order tables according to foreign key dependencies
    tables_in_order = [
        "users",
        "warehouses",
        "zones",
        "racks",
        "shelves",
        "bins",
        "suppliers",
        "products",
        "inventories",
        "inventory_transactions",
        "receivings",
        "workers",
        "attendances",
        "cameras",
        "safety_events",
        "vehicles",
        "vehicle_telemetries",
        "energy_meters",
        "energy_readings",
        "alerts",
        "stock_outs"
    ]

    print("\n[MIGRATION] Transferring data table by table...")

    for model_cls in Base.__subclasses__():
        table_name = model_cls.__tablename__
        if table_name not in tables_in_order:
            tables_in_order.append(table_name)

    total_records = 0

    for table_name in tables_in_order:
        # Find matching model class
        model_cls = next((m for m in Base.__subclasses__() if m.__tablename__ == table_name), None)
        if not model_cls:
            continue

        src_records = sqlite_db.query(model_cls).all()
        count = len(src_records)

        if count == 0:
            print(f"  - {table_name:25s}: 0 records (skipped)")
            continue

        inserted = 0
        for item in src_records:
            # Extract column attributes
            data = {c.name: getattr(item, c.name) for c in item.__table__.columns}
            
            # Check if record already exists in target DB by primary key 'id'
            existing = None
            if 'id' in data:
                existing = target_db.query(model_cls).filter(model_cls.id == data['id']).first()

            if not existing:
                new_record = model_cls(**data)
                target_db.add(new_record)
                inserted += 1

        target_db.commit()
        total_records += inserted
        print(f"  ✓ {table_name:25s}: {count:4d} source records -> {inserted:4d} new records migrated")

        # Sync PostgreSQL primary key auto-increment sequence
        try:
            target_db.execute(text(f"SELECT setval(pg_get_serial_sequence('{table_name}', 'id'), coalesce(max(id), 1)) FROM {table_name};"))
            target_db.commit()
        except Exception:
            target_db.rollback()

    print(f"\n[SUCCESS] Migration completed successfully! Total new records migrated: {total_records}")
    print("[VERIFICATION] You can now run the application with DATABASE_URL set in backend/.env.")

if __name__ == "__main__":
    run_migration()
