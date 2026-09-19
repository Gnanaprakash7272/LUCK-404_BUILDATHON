"""
CYVORA — Response Verification & Enforcement Test Suite
========================================================
Verifies:
  1. BLOCK action enforced in application state and verified
  2. RATE_LIMIT action enforced in application state and verified
  3. ALERT action recorded and verified
  4. ALLOW action correctly classified as NOT_APPLICABLE
  5. BLOCK verification fails if source is not present in blocked state
  6. RATE_LIMIT verification fails if source is not present in rate-limited state
  7. Verification result persists to PostgreSQL response_actions table (verified, verification_status, verification_evidence)
  8. Audit logs include verification entries (RESPONSE_VERIFIED / RESPONSE_VERIFICATION_FAILED)
  9. Authenticated /predict returns structured verification block
  10. GET /events/recent exposes verification data (verified, verification_status, verification_evidence)
  11. JWT protection remains enforced (401 without Bearer token)
  12. Deterministic demo scenario: High-risk attack triggers BLOCK -> verified -> subsequent request rejected with 403 ATTACK_BLOCKED
"""

import os
import sys
import time
import uuid
import subprocess
import requests

# Ensure workspace root is in sys.path
WORKSPACE = os.path.dirname(os.path.abspath(__file__))
if WORKSPACE not in sys.path:
    sys.path.insert(0, WORKSPACE)

if "DATABASE_URL" not in os.environ:
    os.environ["DATABASE_URL"] = "postgresql://postgres:postgres@localhost:5432/cyvora"
if "JWT_SECRET" not in os.environ:
    os.environ["JWT_SECRET"] = "cyvora_super_secret_jwt_key_2026"

import backend.app.database as db_mod
db_mod._init_engine()

from backend.app.prevention_engine import (
    enforce_action,
    get_source_status,
    blocked_sources,
    rate_limited_sources,
    _lock,
)
from backend.app.response_verifier import verify_response
from backend.app.database import (
    _SessionLocal,
    _db_available,
    Prediction,
    SecurityEvent,
    ResponseAction,
    AuditLog,
)

BASE = "http://127.0.0.1:8000"
RESULTS = []
SERVER_PROC = None

PASS_STR = "[PASS]"
FAIL_STR = "[FAIL]"


def record(name: str, passed: bool, detail: str = ""):
    status = PASS_STR if passed else FAIL_STR
    RESULTS.append({"name": name, "passed": passed, "detail": detail})
    print(f"  {status} {name}")
    if detail:
        print(f"         {detail}")


# Standard Benign Baseline
BENIGN_FEATURES = {
    "Destination Port": 443.0,
    "Flow Duration": 967623.29,
    "Total Fwd Packets": 18.0,
    "Total Backward Packets": 13.0,
    "Total Length of Fwd Packets": 2684.82,
    "Total Length of Bwd Packets": 6626.51,
    "Fwd Packet Length Max": 278.33,
    "Fwd Packet Length Min": 5.39,
    "Fwd Packet Length Mean": 149.15,
    "Fwd Packet Length Std": 42.14,
    "Bwd Packet Length Max": 620.47,
    "Bwd Packet Length Min": 7.71,
    "Bwd Packet Length Mean": 509.73,
    "Bwd Packet Length Std": 104.61,
    "Flow Bytes/s": 9622.89,
    "Flow Packets/s": 32.03,
    "Flow IAT Mean": 31213.65,
    "Flow IAT Std": 329.23,
    "Flow IAT Max": 704182.85,
    "Flow IAT Min": 94.16,
    "Fwd IAT Total": 677524.69,
    "Fwd IAT Mean": 53756.84,
    "Fwd IAT Std": 3969.23,
    "Fwd IAT Max": 603227.26,
    "Fwd IAT Min": 63.10,
    "Bwd IAT Total": 582625.23,
    "Bwd IAT Mean": 74432.56,
    "Bwd IAT Std": 141.09,
    "Bwd IAT Max": 514912.56,
    "Bwd IAT Min": 42.98,
    "Fwd PSH Flags": 0.0,
    "Bwd PSH Flags": 0.0,
    "Fwd URG Flags": 0.0,
    "Bwd URG Flags": 0.0,
    "Fwd Header Length": 360.0,
    "Bwd Header Length": 260.0,
    "Fwd Packets/s": 18.60,
    "Bwd Packets/s": 13.43,
    "Min Packet Length": 0.0,
    "Max Packet Length": 620.47,
    "Packet Length Mean": 298.53,
    "Packet Length Std": 184.21,
    "Packet Length Variance": 33933.32,
    "FIN Flag Count": 0.0,
    "SYN Flag Count": 0.0,
    "RST Flag Count": 0.0,
    "PSH Flag Count": 0.0,
    "ACK Flag Count": 1.0,
    "URG Flag Count": 0.0,
    "CWE Flag Count": 0.0,
    "ECE Flag Count": 0.0,
    "Down/Up Ratio": 0.72,
    "Average Packet Size": 308.16,
    "Avg Fwd Segment Size": 149.15,
    "Avg Bwd Segment Size": 509.73,
    "Fwd Header Length.1": 360.0,
    "Subflow Fwd Packets": 18.0,
    "Subflow Fwd Bytes": 2684.82,
    "Subflow Bwd Packets": 13.0,
    "Subflow Bwd Bytes": 6626.51,
    "Init_Win_bytes_forward": 29200.0,
    "Init_Win_bytes_backward": 28960.0,
    "act_data_pkt_fwd": 8.0,
    "min_seg_size_forward": 20.0,
    "Active Mean": 0.0,
    "Active Std": 0.0,
    "Active Max": 0.0,
    "Active Min": 0.0,
    "Idle Mean": 0.0,
    "Idle Std": 0.0,
    "Idle Max": 0.0,
    "Idle Min": 0.0,
    "Fwd Avg Bytes/Bulk": 0.0,
    "Fwd Avg Packets/Bulk": 0.0,
    "Fwd Avg Bulk Rate": 0.0,
    "Bwd Avg Bytes/Bulk": 0.0,
    "Bwd Avg Packets/Bulk": 0.0,
    "Bwd Avg Bulk Rate": 0.0,
    "Fwd Packets Length Std": 42.14,
    "Bwd Packets Length Std": 104.61,
    "FIN Flag": 0.0,
    "SYN Flag": 0.0,
    "RST Flag": 0.0,
    "PSH Flag": 0.0,
    "ACK Flag": 1.0,
}

# Heartbleed Attack Signature (High-confidence attack -> triggers BLOCK)
HEARTBLEED_FEATURES = {
    "Destination Port": 444.0,
    "Flow Duration": 119326262.0,
    "Total Fwd Packets": 2772.0,
    "Total Backward Packets": 4603.0,
    "Total Length of Fwd Packets": 51104.0,
    "Total Length of Bwd Packets": 19448832.0,
    "Fwd Packet Length Max": 240.0,
    "Fwd Packet Length Min": 0.0,
    "Fwd Packet Length Mean": 18.43,
    "Fwd Packet Length Std": 15.65,
    "Bwd Packet Length Max": 14480.0,
    "Bwd Packet Length Min": 0.0,
    "Bwd Packet Length Mean": 4225.25,
    "Bwd Packet Length Std": 3280.99,
    "Flow Bytes/s": 163417.0,
    "Flow Packets/s": 61.8,
    "Flow IAT Mean": 16181.0,
    "Flow IAT Std": 222625.0,
    "Flow IAT Max": 10000000.0,
    "Flow IAT Min": 1.0,
    "Fwd IAT Total": 119000000.0,
    "Fwd IAT Mean": 43062.0,
    "Fwd IAT Std": 357417.0,
    "Fwd IAT Max": 10000000.0,
    "Fwd IAT Min": 1.0,
    "Bwd IAT Total": 119000000.0,
    "Bwd IAT Mean": 25932.0,
    "Bwd IAT Std": 272635.0,
    "Bwd IAT Max": 10000000.0,
    "Bwd IAT Min": 1.0,
    "Fwd PSH Flags": 0.0,
    "Bwd PSH Flags": 0.0,
    "Fwd URG Flags": 0.0,
    "Bwd URG Flags": 0.0,
    "Fwd Header Length": 88720.0,
    "Bwd Header Length": 147312.0,
    "Fwd Packets/s": 23.23,
    "Bwd Packets/s": 38.57,
    "Min Packet Length": 0.0,
    "Max Packet Length": 14480.0,
    "Packet Length Mean": 2643.68,
    "Packet Length Std": 3087.05,
    "Packet Length Variance": 9530000.0,
    "FIN Flag Count": 0.0,
    "SYN Flag Count": 0.0,
    "RST Flag Count": 0.0,
    "PSH Flag Count": 1.0,
    "ACK Flag Count": 0.0,
    "URG Flag Count": 0.0,
    "CWE Flag Count": 0.0,
    "ECE Flag Count": 0.0,
    "Down/Up Ratio": 1.0,
    "Average Packet Size": 2644.04,
    "Avg Fwd Segment Size": 18.43,
    "Avg Bwd Segment Size": 4225.25,
    "Fwd Header Length.1": 88720.0,
    "Subflow Fwd Packets": 2772.0,
    "Subflow Fwd Bytes": 51104.0,
    "Subflow Bwd Packets": 4603.0,
    "Subflow Bwd Bytes": 19448832.0,
    "Init_Win_bytes_forward": 29200.0,
    "Init_Win_bytes_backward": 243.0,
    "act_data_pkt_fwd": 250.0,
    "min_seg_size_forward": 32.0,
    "Active Mean": 28410.0,
    "Active Std": 4627.0,
    "Active Max": 35359.0,
    "Active Min": 22443.0,
    "Idle Mean": 9974261.0,
    "Idle Std": 26487.0,
    "Idle Max": 10000000.0,
    "Idle Min": 9912079.0,
    "Fwd Avg Bytes/Bulk": 0.0,
    "Fwd Avg Packets/Bulk": 0.0,
    "Fwd Avg Bulk Rate": 0.0,
    "Bwd Avg Bytes/Bulk": 0.0,
    "Bwd Avg Packets/Bulk": 0.0,
    "Bwd Avg Bulk Rate": 0.0,
    "Fwd Packets Length Std": 15.65,
    "Bwd Packets Length Std": 3280.99,
    "FIN Flag": 0.0,
    "SYN Flag": 0.0,
    "RST Flag": 0.0,
    "PSH Flag": 1.0,
    "ACK Flag": 0.0,
}


def start_server_if_needed():
    global SERVER_PROC
    try:
        r = requests.get(f"{BASE}/health", timeout=1.5)
        if r.status_code == 200:
            print("[INFO] Server is already running on port 8000.")
            return
    except requests.exceptions.RequestException:
        pass

    print("[INFO] Starting CYVORA backend server on port 8000...")
    env = os.environ.copy()
    env["DATABASE_URL"] = env.get(
        "DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/cyvora"
    )
    env["JWT_SECRET"] = env.get("JWT_SECRET", "cyvora_super_secret_jwt_key_2026")
    env["PYTHONUNBUFFERED"] = "1"

    cmd = [sys.executable, "-m", "uvicorn", "backend.app.main:app", "--port", "8000"]
    SERVER_PROC = subprocess.Popen(cmd, env=env, stdout=subprocess.PIPE, stderr=subprocess.PIPE)

    for _ in range(30):
        time.sleep(0.5)
        try:
            r = requests.get(f"{BASE}/health", timeout=1.0)
            if r.status_code == 200:
                print("[INFO] CYVORA backend server is healthy.")
                return
        except requests.exceptions.RequestException:
            pass
    raise RuntimeError("Backend server failed to start within 15 seconds.")


def stop_server():
    global SERVER_PROC
    if SERVER_PROC:
        print("[INFO] Stopping CYVORA server process...")
        SERVER_PROC.terminate()
        try:
            SERVER_PROC.wait(timeout=5)
        except subprocess.TimeoutExpired:
            SERVER_PROC.kill()
        SERVER_PROC = None


def get_auth_token():
    unique = uuid.uuid4().hex[:8]
    email = f"analyst_verif_{unique}@cyvora.internal"
    pwd = f"SecretPass_{unique}!"

    requests.post(
        f"{BASE}/auth/register",
        json={"email": email, "password": pwd, "username": f"analyst_{unique}"},
        timeout=5,
    )
    lr = requests.post(
        f"{BASE}/auth/login",
        json={"email": email, "password": pwd},
        timeout=5,
    )
    if lr.status_code == 200:
        return lr.json().get("access_token")
    raise RuntimeError(f"Auth login failed: {lr.status_code} {lr.text}")


# ==================================================================
# TEST IMPLEMENTATIONS
# ==================================================================

def test_1_block_enforced_and_verified():
    """1. BLOCK action enforced and verified in application state"""
    src = f"test_block_src_{uuid.uuid4().hex[:6]}"
    # Enforce BLOCK in prevention engine
    p_res = enforce_action("BLOCK", src)
    # Verify response
    v_res = verify_response("BLOCK", src, p_res)

    ok = (
        v_res["verified"] is True
        and v_res["verification_status"] == "VERIFIED"
        and v_res["action"] == "BLOCK"
        and "active application-level blocked state" in v_res["evidence"]
    )
    record("1. BLOCK action enforced and verified", ok, v_res["evidence"])


def test_2_rate_limit_enforced_and_verified():
    """2. RATE_LIMIT action enforced and verified in application state"""
    src = f"test_rl_src_{uuid.uuid4().hex[:6]}"
    # Enforce RATE_LIMIT in prevention engine
    p_res = enforce_action("RATE_LIMIT", src)
    # Verify response
    v_res = verify_response("RATE_LIMIT", src, p_res)

    ok = (
        v_res["verified"] is True
        and v_res["verification_status"] == "VERIFIED"
        and v_res["action"] == "RATE_LIMIT"
        and "active application-level rate-limited state" in v_res["evidence"]
    )
    record("2. RATE_LIMIT action enforced and verified", ok, v_res["evidence"])


def test_3_alert_action_verified():
    """3. ALERT action recorded and verified"""
    src = f"test_alert_src_{uuid.uuid4().hex[:6]}"
    p_res = enforce_action("ALERT", src)
    v_res = verify_response("ALERT", src, p_res)

    ok = (
        v_res["verified"] is True
        and v_res["verification_status"] == "VERIFIED"
        and v_res["action"] == "ALERT"
        and "recorded" in v_res["evidence"]
    )
    record("3. ALERT action recorded and verified", ok, v_res["evidence"])


def test_4_allow_action_not_applicable():
    """4. ALLOW action correctly classified as NOT_APPLICABLE"""
    src = f"test_allow_src_{uuid.uuid4().hex[:6]}"
    p_res = enforce_action("ALLOW", src)
    v_res = verify_response("ALLOW", src, p_res)

    ok = (
        v_res["verified"] is True
        and v_res["verification_status"] == "NOT_APPLICABLE"
        and v_res["action"] == "ALLOW"
    )
    record("4. ALLOW action returns NOT_APPLICABLE", ok, v_res["evidence"])


def test_5_block_verification_fails_when_state_absent():
    """5. BLOCK verification fails if source is not present in blocked state"""
    src = f"absent_block_src_{uuid.uuid4().hex[:6]}"
    # Do NOT enforce; source is absent from blocked_sources
    v_res = verify_response("BLOCK", src)

    ok = (
        v_res["verified"] is False
        and v_res["verification_status"] == "FAILED"
        and "not found" in v_res["evidence"]
    )
    record("5. BLOCK verification fails if state is absent", ok, v_res["evidence"])


def test_6_rate_limit_verification_fails_when_state_absent():
    """6. RATE_LIMIT verification fails if source is not present in rate-limited state"""
    src = f"absent_rl_src_{uuid.uuid4().hex[:6]}"
    # Do NOT enforce; source is absent from rate_limited_sources
    v_res = verify_response("RATE_LIMIT", src)

    ok = (
        v_res["verified"] is False
        and v_res["verification_status"] == "FAILED"
        and "not found" in v_res["evidence"]
    )
    record("6. RATE_LIMIT verification fails if state is absent", ok, v_res["evidence"])


def test_7_verification_persists_in_postgres(token: str):
    """7. Verification result persists in PostgreSQL response_actions table"""
    if not _db_available or _SessionLocal is None:
        record("7. Verification result persists to PostgreSQL", False, "DB not available")
        return

    src = f"10.200.5.{int(time.time()) % 250}"
    resp = requests.post(
        f"{BASE}/predict",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "source_id": src,
            "features": HEARTBLEED_FEATURES,
        },
        timeout=10,
    )
    if resp.status_code != 200:
        record("7. Verification result persists to PostgreSQL", False, f"status={resp.status_code}")
        return

    data = resp.json()
    sec_id = data.get("security_event_id")

    session = _SessionLocal()
    try:
        pred_row = session.query(Prediction).filter(Prediction.security_event_id == sec_id).first()
        if not pred_row or not pred_row.response_action:
            record("7. Verification result persists to PostgreSQL", False, "ResponseAction row missing")
            return

        resp_act = pred_row.response_action
        ok = (
            resp_act.verified is True
            and resp_act.verification_status == "VERIFIED"
            and resp_act.verification_evidence is not None
            and resp_act.verified_at is not None
        )
        record(
            "7. Verification result persists to PostgreSQL response_actions table",
            ok,
            f"verified={resp_act.verified}, status={resp_act.verification_status}, evidence={resp_act.verification_evidence[:40]}..."
        )
    finally:
        session.close()


def test_8_audit_logs_created(token: str):
    """8. Audit logs include verification entries (RESPONSE_VERIFIED)"""
    if not _db_available or _SessionLocal is None:
        record("8. Audit entry is created", False, "DB not available")
        return

    src = f"10.200.8.{int(time.time()) % 250}"
    resp = requests.post(
        f"{BASE}/predict",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "source_id": src,
            "features": BENIGN_FEATURES,
        },
        timeout=10,
    )
    if resp.status_code != 200:
        record("8. Audit entry is created", False, f"status={resp.status_code}")
        return

    sec_id = resp.json().get("security_event_id")

    session = _SessionLocal()
    try:
        audits = session.query(AuditLog).filter(AuditLog.event_id == sec_id).all()
        actions = [a.action for a in audits]
        has_verif_audit = any("RESPONSE_VERIFIED" in a for a in actions)

        ok = has_verif_audit and len(audits) >= 3
        record(
            "8. Audit entry is created for response verification",
            ok,
            f"audit_actions={actions}"
        )
    finally:
        session.close()


def test_9_predict_returns_verification_data(token: str):
    """9. /predict returns verification block"""
    src = f"192.168.10.{int(time.time()) % 250}"
    resp = requests.post(
        f"{BASE}/predict",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "source_id": src,
            "features": BENIGN_FEATURES,
        },
        timeout=10,
    )
    if resp.status_code != 200:
        record("9. /predict returns verification data", False, f"status={resp.status_code}")
        return

    data = resp.json()
    verif = data.get("verification")
    ok = (
        isinstance(verif, dict)
        and "verified" in verif
        and "verification_status" in verif
        and "action" in verif
        and "evidence" in verif
    )
    record(
        "9. /predict returns structured verification block",
        ok,
        f"verification={verif}"
    )


def test_10_events_recent_returns_verification_data(token: str):
    """10. GET /events/recent returns verification data"""
    resp = requests.get(
        f"{BASE}/events/recent?limit=10",
        headers={"Authorization": f"Bearer {token}"},
        timeout=10,
    )
    if resp.status_code != 200:
        record("10. /events/recent returns verification data", False, f"status={resp.status_code}")
        return

    events = resp.json().get("events", [])
    if not events:
        record("10. /events/recent returns verification data", False, "No events returned")
        return

    top = events[0]
    has_verified = "verified" in top
    has_status = "verification_status" in top
    has_evidence = "verification_evidence" in top

    ok = has_verified and has_status and has_evidence
    record(
        "10. /events/recent returns verification data",
        ok,
        f"verified={top.get('verified')}, status={top.get('verification_status')}"
    )


def test_11_jwt_protection_enforced():
    """11. JWT protection remains enforced on /predict"""
    resp = requests.post(
        f"{BASE}/predict",
        json={"source_id": "9.9.9.9", "features": BENIGN_FEATURES},
        timeout=5,
    )
    ok = resp.status_code == 401
    record("11. JWT protection remains enforced (401 without Bearer)", ok, f"status={resp.status_code}")


def test_12_deterministic_demo_scenario(token: str):
    """
    12. Deterministic Demo Scenario:
      Step 1: High-risk attack event is processed.
      Step 2: Selected response is BLOCK.
      Step 3: Prevention engine enforces application-level blocked state.
      Step 4: Response verifier confirms the blocked state.
      Step 5: Outcome returned with action=BLOCK, status=ATTACK_BLOCKED, verification=VERIFIED.
      Step 6: Subsequent request from the same blocked source is rejected with HTTP 403 ATTACK_BLOCKED.
    """
    demo_src = f"demo_attacker_{uuid.uuid4().hex[:6]}"

    # Request 1: Initial Attack
    r1 = requests.post(
        f"{BASE}/predict",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "source_id": demo_src,
            "features": HEARTBLEED_FEATURES,
        },
        timeout=10,
    )
    if r1.status_code != 200:
        record("12. Deterministic demo scenario", False, f"Request 1 failed: {r1.status_code}")
        return

    d1 = r1.json()
    resp_block = d1.get("response", {})
    verif_block = d1.get("verification", {})

    r1_action_ok = resp_block.get("response_action") == "BLOCK"
    r1_verif_ok = (
        verif_block.get("verified") is True
        and verif_block.get("verification_status") == "VERIFIED"
    )

    # Request 2: Subsequent request from blocked source -> Rejection pre-check
    r2 = requests.post(
        f"{BASE}/predict",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "source_id": demo_src,
            "features": BENIGN_FEATURES,
        },
        timeout=10,
    )
    r2_blocked = (r2.status_code == 403)
    r2_detail = r2.json().get("detail", {}) if r2_blocked else {}
    r2_status_ok = r2_detail.get("status") == "ATTACK_BLOCKED"

    ok = r1_action_ok and r1_verif_ok and r2_blocked and r2_status_ok
    record(
        "12. Deterministic demo scenario (enforced -> verified -> API 403 rejection on replay)",
        ok,
        f"Req1: action={resp_block.get('response_action')}, verif={verif_block.get('verification_status')}; "
        f"Req2: HTTP {r2.status_code} ({r2_detail.get('status')})"
    )


def run_all_tests():
    print("\n" + "=" * 70)
    print("CYVORA Response Verification & Application Enforcement Test Suite")
    print("=" * 70)

    start_server_if_needed()
    token = get_auth_token()

    test_1_block_enforced_and_verified()
    test_2_rate_limit_enforced_and_verified()
    test_3_alert_action_verified()
    test_4_allow_action_not_applicable()
    test_5_block_verification_fails_when_state_absent()
    test_6_rate_limit_verification_fails_when_state_absent()
    test_7_verification_persists_in_postgres(token)
    test_8_audit_logs_created(token)
    test_9_predict_returns_verification_data(token)
    test_10_events_recent_returns_verification_data(token)
    test_11_jwt_protection_enforced()
    test_12_deterministic_demo_scenario(token)

    passed_count = sum(1 for r in RESULTS if r["passed"])
    total_count = len(RESULTS)

    print("\n" + "=" * 70)
    print(f"Results: {passed_count}/{total_count} PASSED")
    print("=" * 70)

    if passed_count < total_count:
        sys.exit(1)


if __name__ == "__main__":
    try:
        run_all_tests()
    finally:
        stop_server()
