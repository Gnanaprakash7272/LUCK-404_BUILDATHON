"""Migration: add password_hash column to users table"""
import os
import sys

# DATABASE_URL must already be set in the environment
db_url = os.environ.get("DATABASE_URL", "")
if not db_url:
    print("ERROR: DATABASE_URL not set")
    sys.exit(1)

from sqlalchemy import create_engine, text

engine = create_engine(db_url, connect_args={"connect_timeout": 5})

with engine.connect() as conn:
    conn.execute(text(
        "ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255)"
    ))
    conn.commit()
    print("password_hash column: OK")

    # Verify
    result = conn.execute(text(
        "SELECT column_name FROM information_schema.columns "
        "WHERE table_name='users' ORDER BY ordinal_position"
    ))
    cols = [r[0] for r in result]
    print(f"users columns: {cols}")

print("Migration complete.")
