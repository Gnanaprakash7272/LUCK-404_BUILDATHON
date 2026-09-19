"""
CYVORA — PostgreSQL Password Reset
=====================================
Run this as ADMINISTRATOR:

  Right-click PowerShell -> Run as Administrator
  cd F:\BUILDATHON_FINAL\CYVORA-main
  python reset_pg_password.py

What it does:
1. Temporarily sets pg_hba.conf to trust (no password needed)
2. Restarts PostgreSQL service
3. Connects without password and sets postgres password to 'postgres'
4. Restores pg_hba.conf to scram-sha-256
5. Restarts service again
6. Creates 'cyvora' database
7. Prints the working DATABASE_URL
"""

import os
import subprocess
import sys
import time
import shutil
import ctypes

PG_DATA = r"C:\Program Files\PostgreSQL\17\data"
PG_BIN  = r"C:\Program Files\PostgreSQL\17\bin"
PSQL    = os.path.join(PG_BIN, "psql.exe")
PG_CTL  = os.path.join(PG_BIN, "pg_ctl.exe")
HBA     = os.path.join(PG_DATA, "pg_hba.conf")
HBA_BAK = os.path.join(PG_DATA, "pg_hba.conf.bak")
SVC     = "postgresql-x64-17"
NEW_PW  = "postgres"


def is_admin():
    try:
        return ctypes.windll.shell32.IsUserAnAdmin()
    except Exception:
        return False


def run(cmd, **kw):
    if isinstance(cmd, list):
        print(f"  >> {' '.join(cmd)}")
    else:
        print(f"  >> {cmd}")
    return subprocess.run(cmd, **kw)


def service_ctrl(action):
    result = run(["net", action, SVC], capture_output=True, text=True)
    time.sleep(4)
    return result.returncode == 0


def wait_for_pg(timeout=20):
    env = os.environ.copy()
    env["PGPASSWORD"] = ""
    for _ in range(timeout):
        r = run(
            [PSQL, "-U", "postgres", "-h", "127.0.0.1", "-p", "5432",
             "-c", "SELECT 1"],
            capture_output=True, text=True, env=env
        )
        if r.returncode == 0:
            return True
        time.sleep(1)
    return False


def main():
    print("=" * 60)
    print("  CYVORA — PostgreSQL Password Reset")
    print("=" * 60)

    if not is_admin():
        print("\nERROR: Must be run as Administrator!")
        print("Right-click PowerShell -> 'Run as Administrator'")
        print("Then:  cd F:\\BUILDATHON_FINAL\\CYVORA-main")
        print("       python reset_pg_password.py")
        sys.exit(1)

    if not os.path.exists(PSQL):
        print(f"\nERROR: psql.exe not found at {PSQL}")
        print("PostgreSQL binaries are not installed.")
        sys.exit(1)

    # ----------------------------------------------------------------
    # 1. Backup pg_hba.conf
    # ----------------------------------------------------------------
    print("\n[1] Backing up pg_hba.conf...")
    shutil.copy2(HBA, HBA_BAK)
    print(f"  Backed up to {HBA_BAK}")

    # ----------------------------------------------------------------
    # 2. Write trust-mode pg_hba.conf
    # ----------------------------------------------------------------
    print("\n[2] Setting pg_hba.conf to TRUST mode (no password)...")
    trust_content = """\
# Temporary trust mode for password reset
local   all             all                                     trust
host    all             all             127.0.0.1/32            trust
host    all             all             ::1/128                 trust
local   replication     all                                     trust
host    replication     all             127.0.0.1/32            trust
host    replication     all             ::1/128                 trust
"""
    with open(HBA, "w") as f:
        f.write(trust_content)
    print("  Done.")

    # ----------------------------------------------------------------
    # 3. Restart service
    # ----------------------------------------------------------------
    print(f"\n[3] Restarting service '{SVC}'...")
    service_ctrl("stop")
    ok = service_ctrl("start")
    if not ok:
        print(f"  WARNING: 'net start {SVC}' returned non-zero. Trying pg_ctl...")
        run([PG_CTL, "restart", "-D", PG_DATA, "-w"], capture_output=True)
        time.sleep(4)

    print("  Waiting for PostgreSQL to accept connections...")
    if not wait_for_pg(20):
        print("  WARNING: Could not connect in trust mode after 20s.")
        print("  Restoring pg_hba.conf backup and exiting.")
        shutil.copy2(HBA_BAK, HBA)
        service_ctrl("stop")
        service_ctrl("start")
        sys.exit(1)
    print("  Connected in trust mode!")

    # ----------------------------------------------------------------
    # 4. Reset password
    # ----------------------------------------------------------------
    print(f"\n[4] Setting postgres password to '{NEW_PW}'...")
    env = os.environ.copy()
    env["PGPASSWORD"] = ""
    result = run(
        [PSQL, "-U", "postgres", "-h", "127.0.0.1", "-p", "5432",
         "-c", f"ALTER USER postgres WITH PASSWORD '{NEW_PW}';"],
        capture_output=True, text=True, env=env
    )
    if result.returncode == 0:
        print("  Password set successfully.")
    else:
        print(f"  ERROR: {result.stderr.strip()}")

    # ----------------------------------------------------------------
    # 5. Create cyvora database
    # ----------------------------------------------------------------
    print("\n[5] Creating database 'cyvora'...")
    run(
        [PSQL, "-U", "postgres", "-h", "127.0.0.1", "-p", "5432",
         "-c", "CREATE DATABASE cyvora;"],
        capture_output=True, text=True, env=env
    )
    # Ignore "already exists" error
    print("  Done (or already exists).")

    # ----------------------------------------------------------------
    # 6. Restore scram-sha-256 pg_hba.conf
    # ----------------------------------------------------------------
    print("\n[6] Restoring secure pg_hba.conf (scram-sha-256)...")
    shutil.copy2(HBA_BAK, HBA)
    print("  Restored.")

    # ----------------------------------------------------------------
    # 7. Final restart
    # ----------------------------------------------------------------
    print(f"\n[7] Final service restart with secure auth...")
    service_ctrl("stop")
    service_ctrl("start")
    time.sleep(3)

    # ----------------------------------------------------------------
    # 8. Verify with new password
    # ----------------------------------------------------------------
    print("\n[8] Verifying with new password...")
    env2 = os.environ.copy()
    env2["PGPASSWORD"] = NEW_PW
    result = run(
        [PSQL, "-U", "postgres", "-h", "127.0.0.1", "-p", "5432",
         "-d", "cyvora", "-c", "SELECT version();"],
        capture_output=True, text=True, env=env2
    )
    if result.returncode == 0:
        lines = [l for l in result.stdout.splitlines() if "PostgreSQL" in l]
        ver = lines[0].strip() if lines else "OK"
        print(f"  SUCCESS! {ver}")
    else:
        print(f"  ERROR: {result.stderr.strip()}")
        sys.exit(1)

    # ----------------------------------------------------------------
    # Done
    # ----------------------------------------------------------------
    print("\n" + "=" * 60)
    print("  PostgreSQL reset complete!")
    print()
    print("  Paste this into your regular PowerShell terminal:")
    print()
    print(f'  $env:DATABASE_URL="postgresql://postgres:{NEW_PW}@localhost:5432/cyvora"')
    print()
    print("  Then start CYVORA:")
    print("  python -m uvicorn backend.app.main:app --host 0.0.0.0 --port 8000")
    print()
    print("  And in another terminal, run the 12-step test:")
    print(f'  $env:DATABASE_URL="postgresql://postgres:{NEW_PW}@localhost:5432/cyvora"')
    print("  python test_db_integration.py")
    print("=" * 60)


if __name__ == "__main__":
    main()
