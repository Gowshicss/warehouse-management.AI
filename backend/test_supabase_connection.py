import os
import sys
from dotenv import load_dotenv
from sqlalchemy import create_engine, text

backend_dir = os.path.dirname(os.path.abspath(__file__))
env_path = os.path.join(backend_dir, ".env")
load_dotenv(env_path)

db_url = os.getenv("DATABASE_URL")

print("==================================================")
print("SUPABASE POSTGRESQL CONNECTION VERIFICATION")
print("==================================================")

if not db_url:
    print("[STATUS] DATABASE_URL is not set in backend/.env.")
    print("Falling back to local SQLite database: warehouse.db")
    print("App is currently running in SQLite mode.")
else:
    if db_url.startswith("postgres://"):
        db_url = db_url.replace("postgres://", "postgresql://", 1)
    
    print(f"[TARGET] Connecting to: {db_url.split('@')[-1]}")
    try:
        engine = create_engine(db_url)
        with engine.connect() as conn:
            res = conn.execute(text("SELECT version();")).fetchone()
            print("[SUCCESS] Connected to Supabase PostgreSQL!")
            print(f"[VERSION] {res[0]}")
            
            # Check user records
            user_count = conn.execute(text("SELECT count(*) FROM users;")).fetchone()
            print(f"[VERIFY] Users count in Supabase: {user_count[0]}")

            # Check products
            prod_count = conn.execute(text("SELECT count(*) FROM products;")).fetchone()
            print(f"[VERIFY] Products count in Supabase: {prod_count[0]}")
    except Exception as e:
        print(f"[ERROR] Failed to connect to Supabase PostgreSQL: {e}")

print("==================================================")
