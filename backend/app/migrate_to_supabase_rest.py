import os
import sys
import requests
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if backend_dir not in sys.path:
    sys.path.append(backend_dir)

env_path = os.path.join(backend_dir, ".env")
load_dotenv(env_path)

from app.models import Base

SUPABASE_URL = os.getenv("SUPABASE_URL", "https://nnygqbghwarlxdrwtjcq.supabase.co")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_SERVICE_KEY:
    print("[ERROR] SUPABASE_SERVICE_ROLE_KEY is missing!")
    sys.exit(1)

# Format REST base URL
rest_base = SUPABASE_URL.rstrip('/')
if not rest_base.endswith('/rest/v1'):
    rest_base = f"{rest_base}/rest/v1"

headers = {
    'apikey': SUPABASE_SERVICE_KEY,
    'Authorization': f'Bearer {SUPABASE_SERVICE_KEY}',
    'Content-Type': 'application/json',
    'Prefer': 'resolution=merge-duplicates'
}

def migrate_all_data():
    sqlite_db_path = os.path.join(backend_dir, "warehouse.db")
    if not os.path.exists(sqlite_db_path):
        print(f"[ERROR] SQLite database not found at {sqlite_db_path}")
        sys.exit(1)

    print("==================================================")
    print("MIGRATING SQLITE DATA TO SUPABASE POSTGRESQL")
    print(f"Source: {sqlite_db_path}")
    print(f"Target Supabase REST: {rest_base}")
    print("==================================================")

    sqlite_engine = create_engine(f"sqlite:///{sqlite_db_path}")
    SqliteSession = sessionmaker(bind=sqlite_engine)
    sqlite_db = SqliteSession()

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

    total_migrated = 0

    for table_name in tables_in_order:
        model_cls = next((m for m in Base.__subclasses__() if m.__tablename__ == table_name), None)
        if not model_cls:
            continue

        records = sqlite_db.query(model_cls).all()
        if not records:
            print(f"  - {table_name:25s}: 0 records (skipped)")
            continue

        payloads = []
        for item in records:
            data = {}
            for col in item.__table__.columns:
                val = getattr(item, col.name)
                # Convert datetime objects to ISO strings
                if hasattr(val, 'isoformat'):
                    val = val.isoformat()
                data[col.name] = val
            payloads.append(data)

        # Post data to Supabase PostgREST
        endpoint = f"{rest_base}/{table_name}"
        res = requests.post(endpoint, headers=headers, json=payloads)

        if res.status_code in [200, 201]:
            migrated_count = len(payloads)
            total_migrated += migrated_count
            print(f"  [OK] {table_name:25s}: {migrated_count:4d} records successfully migrated!")
        else:
            print(f"  ❌ {table_name:25s}: Failed with status {res.status_code} - {res.text[:100]}")

    print("==================================================")
    print(f"[SUCCESS] Migration completed! Total records migrated to Supabase: {total_migrated}")
    print("==================================================")

if __name__ == "__main__":
    migrate_all_data()
