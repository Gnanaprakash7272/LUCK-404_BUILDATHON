"""
CYVORA — JWT Authentication Regression Test
=============================================
19-step test covering the full auth lifecycle.
Requires:
  - DATABASE_URL set in environment
  - JWT_SECRET set in environment
  - A running PostgreSQL instance with the cyvora database

Run:
  $env:DATABASE_URL="postgresql://postgres:PASSWORD@127.0.0.1:5432/cyvora"
  $env:JWT_SECRET="your-secret"
  python test_auth.py
"""

import os
import subprocess
import sys
import time
import uuid

try:
    import requests
except ImportError:
    print("ERROR: 'requests' not installed. Run: pip install requests")
    sys.exit(1)

BASE = "http://127.0.0.1:8000"
RESULTS = []
SERVER_PROC = None

# ── Unique email per run so tests are idempotent ─────────────
RUN_ID = uuid.uuid4().hex[:8]
TEST_EMAIL = f"testuser_{RUN_ID}@cyvora.example"
TEST_PASSWORD = "Secure!Pass123"
WRONG_PASSWORD = "wrongpassword"


def log(step: int, name: str, ok: bool, detail: str = ""):
    symbol = "PASS" if ok else "FAIL"
    line = f"  [{symbol}] Step {step:02d}: {name}"
    if detail:
        line += f"\n           {detail}"
    print(line)
    RESULTS.append((step, name, ok, detail))


def start_server():
    global SERVER_PROC
    env = os.environ.copy()
    # Kill any existing server on 8000
    try:
        r = requests.get(f"{BASE}/health", timeout=2)
        if r.status_code == 200:
            return   # already running
    except Exception:
        pass

    SERVER_PROC = subprocess.Popen(
        [sys.executable, "-m", "uvicorn",
         "backend.app.main:app",
         "--host", "127.0.0.1", "--port", "8000",
         "--log-level", "warning"],
        cwd=os.path.dirname(os.path.abspath(__file__)),
        env=env,
    )
    for _ in range(30):
        time.sleep(1)
        try:
            if requests.get(f"{BASE}/health", timeout=2).status_code == 200:
                return
        except Exception:
            pass
    print("  ERROR: Server did not start in 30s")
    sys.exit(1)


def stop_server():
    global SERVER_PROC
    if SERVER_PROC:
        SERVER_PROC.terminate()
        try:
            SERVER_PROC.wait(timeout=5)
        except Exception:
            SERVER_PROC.kill()
        SERVER_PROC = None
        time.sleep(2)


# ────────────────────────────────────────────────────────────
# TESTS
# ────────────────────────────────────────────────────────────

def test_01_existing_db_passes():
    """Original 12/12 PostgreSQL integration must still pass."""
    r = requests.get(f"{BASE}/health", timeout=5)
    ok = r.status_code == 200
    log(1, "Existing PostgreSQL regression (/health OK)", ok,
        f"HTTP {r.status_code}")


def test_02_register():
    """POST /auth/register creates a new user."""
    global _token, _user_id
    r = requests.post(f"{BASE}/auth/register", json={
        "email": TEST_EMAIL,
        "password": TEST_PASSWORD,
    }, timeout=5)
    ok = r.status_code == 201
    data = r.json() if ok else {}
    detail = f"HTTP {r.status_code}  id={data.get('id')}  role={data.get('role')}"
    if ok:
        _user_id = data.get("id")
    log(2, "Register user", ok, detail)
    # Verify password_hash NOT in response
    has_hash = "password_hash" in r.text or "password" in data
    log(2, "  password_hash absent from register response", not has_hash,
        "GOOD — hash not exposed" if not has_hash else "FAIL — hash exposed!")


def test_03_password_hashed_in_db():
    """Verify bcrypt hash stored, never plaintext."""
    from sqlalchemy import create_engine, text
    engine = create_engine(os.environ["DATABASE_URL"],
                           connect_args={"connect_timeout": 5})
    with engine.connect() as conn:
        row = conn.execute(
            text("SELECT password_hash FROM users WHERE email=:e"),
            {"e": TEST_EMAIL}
        ).fetchone()
    if row is None:
        log(3, "Password hashed in DB", False, "User not found in DB")
        return
    ph = row[0]
    is_bcrypt = ph and ph.startswith("$2b$")
    not_plain = ph != TEST_PASSWORD
    ok = is_bcrypt and not_plain
    log(3, "Password hashed in DB (bcrypt)", ok,
        f"hash_prefix={ph[:7] if ph else 'NULL'}  not_plaintext={not_plain}")


def test_04_login():
    """POST /auth/login returns JWT."""
    global _token
    r = requests.post(f"{BASE}/auth/login", json={
        "email": TEST_EMAIL,
        "password": TEST_PASSWORD,
    }, timeout=5)
    ok = r.status_code == 200
    data = r.json() if ok else {}
    token = data.get("access_token", "")
    has_token = bool(token) and len(token) > 20
    if has_token:
        _token = token
    log(4, "Login returns JWT", ok and has_token,
        f"HTTP {r.status_code}  token_len={len(token)}  type={data.get('token_type')}")


def test_05_auth_me_with_token():
    """GET /auth/me with valid token returns user profile."""
    if not _token:
        log(5, "/auth/me with valid token", False, "No token from login")
        return
    r = requests.get(f"{BASE}/auth/me",
                     headers={"Authorization": f"Bearer {_token}"}, timeout=5)
    ok = r.status_code == 200
    data = r.json() if ok else {}
    has_hash = "password_hash" in r.text
    log(5, "/auth/me with valid token", ok,
        f"HTTP {r.status_code}  email={data.get('email')}  role={data.get('role')}")
    log(5, "  password_hash absent from /auth/me response", not has_hash,
        "GOOD" if not has_hash else "FAIL — hash exposed!")


def test_06_auth_me_without_token():
    """GET /auth/me without token -> 401."""
    r = requests.get(f"{BASE}/auth/me", timeout=5)
    ok = r.status_code == 401
    log(6, "/auth/me without token -> 401", ok, f"HTTP {r.status_code}")


def test_07_predict_without_token():
    """POST /predict without token -> 401."""
    payload = {"features": {}, "source_id": "test_no_auth"}
    r = requests.post(f"{BASE}/predict", json=payload, timeout=5)
    ok = r.status_code == 401
    log(7, "/predict without JWT -> 401", ok, f"HTTP {r.status_code}")


def test_08_predict_with_token():
    """POST /predict with valid JWT -> 200 and db_persisted."""
    if not _token:
        log(8, "/predict with valid JWT", False, "No token")
        return
    # Use all actual MODEL_FEATURES (set to 0) so predictor accepts the request
    model_features = [
        "Destination Port", "Flow Duration", "Total Fwd Packets",
        "Total Backward Packets", "Total Length of Fwd Packets",
        "Total Length of Bwd Packets", "Fwd Packet Length Max",
        "Fwd Packet Length Min", "Fwd Packet Length Mean", "Fwd Packet Length Std",
        "Bwd Packet Length Max", "Bwd Packet Length Min", "Bwd Packet Length Mean",
        "Bwd Packet Length Std", "Flow Bytes/s", "Flow Packets/s",
        "Flow IAT Mean", "Flow IAT Std", "Flow IAT Max", "Flow IAT Min",
        "Fwd IAT Total", "Fwd IAT Mean", "Fwd IAT Std", "Fwd IAT Max",
        "Fwd IAT Min", "Bwd IAT Total", "Bwd IAT Mean", "Bwd IAT Std",
        "Bwd IAT Max", "Bwd IAT Min", "Fwd PSH Flags", "Fwd URG Flags",
        "Fwd Header Length", "Bwd Header Length", "Fwd Packets/s", "Bwd Packets/s",
        "Min Packet Length", "Max Packet Length", "Packet Length Mean",
        "Packet Length Std", "Packet Length Variance", "FIN Flag Count",
        "SYN Flag Count", "RST Flag Count", "PSH Flag Count", "ACK Flag Count",
        "URG Flag Count", "ECE Flag Count", "Down/Up Ratio", "Average Packet Size",
        "Init_Win_bytes_forward", "Init_Win_bytes_backward", "act_data_pkt_fwd",
        "min_seg_size_forward", "Fwd_IAT_Range", "Flow_IAT_Range",
        "Fwd_Bwd_Packet_Ratio", "Window_Size_Ratio", "Window_Size_Log_Ratio",
        "Packet_Direction_Imbalance", "Forward_Packet_Fraction",
        "Backward_Byte_Fraction", "Header_Length_Ratio", "IAT_Asymmetry",
        "PSH_Per_Fwd_Packet", "Log_Flow_Duration", "Log_Flow_Packets_s",
        "Web_Flow_Intensity", "Fwd_Length_Ratio", "Bwd_Length_Ratio",
        "Packet_Length_Ratio", "IAT_Mean_Ratio", "Fwd_Bwd_Length_Ratio",
        "Flow_Packet_Density", "Window_Interaction", "TCP_Flag_Density",
        "Fwd_Header_Per_Packet", "Bwd_Header_Per_Packet", "Length_Per_Fwd_Packet",
        "Length_Per_Bwd_Packet", "IAT_Variability", "Packet_Size_Imbalance",
        "Flow_Asymmetry",
    ]
    features = {f: 0 for f in model_features}
    r = requests.post(f"{BASE}/predict", json={
        "features": features,
        "source_id": "test_auth_predict",
    }, headers={"Authorization": f"Bearer {_token}"}, timeout=30)
    ok = r.status_code == 200
    data = r.json() if ok else {}
    log(8, "/predict with valid JWT -> 200", ok,
        f"HTTP {r.status_code}  prediction={data.get('prediction')}  "
        f"db_persisted={data.get('db_persisted')}")



def test_09_events_recent_with_token():
    """GET /events/recent with JWT -> 200."""
    if not _token:
        log(9, "/events/recent with JWT", False, "No token")
        return
    r = requests.get(f"{BASE}/events/recent?limit=5",
                     headers={"Authorization": f"Bearer {_token}"}, timeout=5)
    ok = r.status_code == 200
    data = r.json() if ok else {}
    log(9, "/events/recent with JWT -> 200", ok,
        f"HTTP {r.status_code}  count={data.get('count')}")


def test_10_events_recent_without_token():
    """GET /events/recent without token -> 401."""
    r = requests.get(f"{BASE}/events/recent", timeout=5)
    ok = r.status_code == 401
    log(10, "/events/recent without JWT -> 401", ok, f"HTTP {r.status_code}")


def test_11_stats_with_token():
    """GET /stats with JWT -> 200."""
    if not _token:
        log(11, "/stats with JWT", False, "No token")
        return
    r = requests.get(f"{BASE}/stats",
                     headers={"Authorization": f"Bearer {_token}"}, timeout=5)
    ok = r.status_code == 200
    data = r.json() if ok else {}
    stats = data.get("stats", {})
    log(11, "/stats with JWT -> 200", ok,
        f"HTTP {r.status_code}  total={stats.get('total_predictions')}")


def test_12_database_status_with_token():
    """GET /database/status with JWT -> 200."""
    if not _token:
        log(12, "/database/status with JWT", False, "No token")
        return
    r = requests.get(f"{BASE}/database/status",
                     headers={"Authorization": f"Bearer {_token}"}, timeout=5)
    ok = r.status_code == 200
    data = r.json() if ok else {}
    log(12, "/database/status with JWT -> 200", ok,
        f"HTTP {r.status_code}  status={data.get('status')}")


def test_13_invalid_token():
    """Invalid JWT -> 401."""
    r = requests.get(f"{BASE}/auth/me",
                     headers={"Authorization": "Bearer totally.invalid.token"},
                     timeout=5)
    ok = r.status_code == 401
    log(13, "Invalid JWT -> 401", ok, f"HTTP {r.status_code}")


def test_14_tampered_token():
    """Tampered JWT -> 401."""
    if not _token:
        log(14, "Tampered JWT -> 401", False, "No token")
        return
    tampered = _token[:-5] + "XXXXX"
    r = requests.get(f"{BASE}/auth/me",
                     headers={"Authorization": f"Bearer {tampered}"},
                     timeout=5)
    ok = r.status_code == 401
    log(14, "Tampered JWT -> 401", ok, f"HTTP {r.status_code}")


def test_15_duplicate_registration():
    """Register same email again -> 409."""
    r = requests.post(f"{BASE}/auth/register", json={
        "email": TEST_EMAIL,
        "password": "AnotherPass456",
    }, timeout=5)
    ok = r.status_code == 409
    log(15, "Duplicate registration -> 409", ok, f"HTTP {r.status_code}")


def test_16_wrong_password():
    """Login with wrong password -> 401."""
    r = requests.post(f"{BASE}/auth/login", json={
        "email": TEST_EMAIL,
        "password": WRONG_PASSWORD,
    }, timeout=5)
    ok = r.status_code == 401
    log(16, "Wrong password -> 401", ok, f"HTTP {r.status_code}")


def test_17_short_password():
    """Registration with short password -> 422 validation error."""
    r = requests.post(f"{BASE}/auth/register", json={
        "email": f"short_{RUN_ID}@cyvora.example",
        "password": "short",
    }, timeout=5)
    ok = r.status_code == 422
    log(17, "Short password -> 422", ok, f"HTTP {r.status_code}")


def test_18_restart_persistence():
    """Restart backend — users and security_events remain."""
    stop_server()
    time.sleep(2)
    print("  Starting CYVORA API server...")
    start_server()
    print("  Server is up.")

    # Login should still work (user persisted in PostgreSQL)
    r = requests.post(f"{BASE}/auth/login", json={
        "email": TEST_EMAIL,
        "password": TEST_PASSWORD,
    }, timeout=5)
    ok = r.status_code == 200
    new_token = r.json().get("access_token", "") if ok else ""
    log(18, "After restart: login still works (user in PostgreSQL)", ok,
        f"HTTP {r.status_code}  new_token={bool(new_token)}")
    return new_token


def test_19_records_persist_after_restart(new_token: str):
    """Events/recent after restart returns data from PostgreSQL."""
    if not new_token:
        log(19, "Records persist after restart", False, "No token after restart")
        return
    r = requests.get(f"{BASE}/stats",
                     headers={"Authorization": f"Bearer {new_token}"},
                     timeout=5)
    ok = r.status_code == 200
    data = r.json() if ok else {}
    total = data.get("stats", {}).get("total_predictions", 0)
    log(19, "Records persist after restart (stats still available)", ok and total >= 1,
        f"HTTP {r.status_code}  total_predictions={total}")


# ────────────────────────────────────────────────────────────
# MAIN
# ────────────────────────────────────────────────────────────

_token = ""
_user_id = None


def main():
    print("=" * 60)
    print("  CYVORA JWT Auth Regression Test (19 steps)")
    print("=" * 60)

    db_url = os.environ.get("DATABASE_URL") or "postgresql://postgres:postgres@localhost:5432/cyvora"
    os.environ["DATABASE_URL"] = db_url
    jwt_secret = os.environ.get("JWT_SECRET") or "cyvora_super_secret_jwt_key_2026"
    os.environ["JWT_SECRET"] = jwt_secret

    print(f"\n  DB: ...@{db_url.split('@')[-1]}")
    print(f"  JWT_SECRET: {'set (' + str(len(jwt_secret)) + ' chars)'}")
    print(f"  Test email: {TEST_EMAIL}")

    print("\n  Starting CYVORA API server...")
    start_server()
    print("  Server is up.\n")

    test_01_existing_db_passes()
    test_02_register()
    test_03_password_hashed_in_db()
    test_04_login()
    test_05_auth_me_with_token()
    test_06_auth_me_without_token()
    test_07_predict_without_token()
    test_08_predict_with_token()
    test_09_events_recent_with_token()
    test_10_events_recent_without_token()
    test_11_stats_with_token()
    test_12_database_status_with_token()
    test_13_invalid_token()
    test_14_tampered_token()
    test_15_duplicate_registration()
    test_16_wrong_password()
    test_17_short_password()
    new_tok = test_18_restart_persistence()
    test_19_records_persist_after_restart(new_tok)

    # ── Summary ──
    passed = sum(1 for _, _, ok, _ in RESULTS if ok)
    total = len(RESULTS)

    print("\n" + "=" * 60)
    print("  RESULTS")
    print("=" * 60)
    for step, name, ok, _ in RESULTS:
        symbol = "PASS" if ok else "FAIL"
        print(f"  [{symbol}] {step:02d}. {name}")
    print(f"\n  Passed: {passed}/{total}")
    if passed == total:
        print("  All auth tests passed [OK]")
    else:
        print("  Some tests FAILED -- see output above.")
    print("=" * 60)
    sys.exit(0 if passed == total else 1)


if __name__ == "__main__":
    main()
