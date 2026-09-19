"""
CYVORA — PostgreSQL Setup Helper
=================================
Run this script as ADMINISTRATOR in PowerShell:

  Right-click PowerShell → Run as Administrator
  cd F:\BUILDATHON_FINAL\CYVORA-main
  python setup_postgres.py

This script will:
1. Find the PostgreSQL 17 installer (already downloaded)
2. Run it fully silently with --mode unattended
3. Create the cyvora database
4. Print the DATABASE_URL to paste into your terminal
"""

import os
import subprocess
import sys
import time

INSTALLER = (
    r"C:\Users\HAI\AppData\Local\Temp\WinGet"
    r"\PostgreSQL.PostgreSQL.17.17.11-4"
    r"\postgresql-17.11-4-windows-x64.exe"
)
PSQL = r"C:\Program Files\PostgreSQL\17\bin\psql.exe"
PG_PASSWORD = "postgres"
SERVICE_NAME = "postgresql-x64-17"
DATA_DIR = r"C:\Program Files\PostgreSQL\17\data"
PREFIX = r"C:\Program Files\PostgreSQL\17"


def run(cmd, **kwargs):
    print(f"  >> {' '.join(cmd) if isinstance(cmd, list) else cmd}")
    return subprocess.run(cmd, **kwargs)


def step1_install():
    print("\n[1/4] Installing PostgreSQL 17 binaries...")
    if os.path.exists(PSQL):
        print("  psql.exe already exists — skipping install.")
        return True

    if not os.path.exists(INSTALLER):
        print(f"  ERROR: Installer not found at {INSTALLER}")
        print("  Download it from: https://www.enterprisedb.com/downloads/postgres-postgresql-downloads")
        return False

    result = run([
        INSTALLER,
        "--mode", "unattended",
        "--superpassword", PG_PASSWORD,
        "--servicename", SERVICE_NAME,
        "--servicepassword", PG_PASSWORD,
        "--datadir", DATA_DIR,
        "--prefix", PREFIX,
        "--install-runtimes", "1",
    ], timeout=300)

    if result.returncode != 0:
        print(f"  ERROR: Installer returned exit code {result.returncode}")
        return False

    print("  PostgreSQL 17 installed successfully.")
    return True


def step2_start_service():
    print(f"\n[2/4] Starting service '{SERVICE_NAME}'...")
    run(["net", "start", SERVICE_NAME], capture_output=True)
    time.sleep(3)

    result = run(
        ["sc", "query", SERVICE_NAME],
        capture_output=True, text=True
    )
    if "RUNNING" in result.stdout:
        print(f"  Service is RUNNING.")
        return True
    else:
        print(f"  Service state: {result.stdout.strip()[:100]}")
        return False


def step3_create_db():
    print("\n[3/4] Creating database 'cyvora'...")

    env = os.environ.copy()
    env["PGPASSWORD"] = PG_PASSWORD

    # Check if cyvora already exists
    check = run(
        [PSQL, "-U", "postgres", "-h", "localhost", "-p", "5432",
         "-tc", "SELECT 1 FROM pg_database WHERE datname='cyvora'"],
        capture_output=True, text=True, env=env, timeout=10
    )
    if "1" in check.stdout:
        print("  Database 'cyvora' already exists.")
        return True

    result = run(
        [PSQL, "-U", "postgres", "-h", "localhost", "-p", "5432",
         "-c", "CREATE DATABASE cyvora;"],
        capture_output=True, text=True, env=env, timeout=10
    )
    if result.returncode == 0:
        print("  Database 'cyvora' created successfully.")
        return True
    else:
        print(f"  ERROR: {result.stderr.strip()}")
        return False


def step4_verify():
    print("\n[4/4] Verifying connection...")

    env = os.environ.copy()
    env["PGPASSWORD"] = PG_PASSWORD

    result = run(
        [PSQL, "-U", "postgres", "-h", "localhost", "-p", "5432",
         "-d", "cyvora", "-c", "SELECT version();"],
        capture_output=True, text=True, env=env, timeout=10
    )
    if result.returncode == 0:
        version_line = [l for l in result.stdout.splitlines() if "PostgreSQL" in l]
        print(f"  Connected! {version_line[0].strip() if version_line else 'OK'}")
        return True
    else:
        print(f"  ERROR: {result.stderr.strip()}")
        return False


def main():
    print("=" * 60)
    print("  CYVORA PostgreSQL Setup")
    print("=" * 60)

    # Check running as admin
    import ctypes
    if not ctypes.windll.shell32.IsUserAnAdmin():
        print("\nERROR: This script must be run as Administrator!")
        print("Right-click PowerShell -> 'Run as Administrator'")
        print("Then: cd F:\\BUILDATHON_FINAL\\CYVORA-main")
        print("      python setup_postgres.py")
        sys.exit(1)

    ok = step1_install()
    if not ok:
        sys.exit(1)

    ok = step2_start_service()
    if not ok:
        print("  Trying to continue anyway...")

    ok = step3_create_db()
    if not ok:
        sys.exit(1)

    ok = step4_verify()

    print("\n" + "=" * 60)
    if ok:
        print("  Setup complete!")
        print("\n  Now run these commands in your regular PowerShell:")
        print()
        print(f'  $env:DATABASE_URL="postgresql://postgres:{PG_PASSWORD}@localhost:5432/cyvora"')
        print()
        print("  python -m uvicorn backend.app.main:app --host 0.0.0.0 --port 8000")
        print()
        print("  Then in another terminal:")
        print(f'  $env:DATABASE_URL="postgresql://postgres:{PG_PASSWORD}@localhost:5432/cyvora"')
        print("  python test_db_integration.py")
    else:
        print("  Setup encountered errors. Check output above.")
    print("=" * 60)


if __name__ == "__main__":
    main()
