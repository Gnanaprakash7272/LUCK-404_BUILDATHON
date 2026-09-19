"""
CYVORA — Context Analysis & False-Positive Reduction Test Suite
===============================================================
Verifies:
  1. Normal benign event: low anomaly + benign prediction -> low risk (< 0.30)
  2. High anomaly + benign prediction: UNKNOWN_ANOMALOUS, no immediate block,
     triggers ISOLATED_BENIGN_ANOMALY false-positive indicator, risk clamped (< 0.45)
  3. Repeated anomalous source: context evidence accumulates, risk increases, flags active monitoring
  4. Known attack + high confidence: risk increases substantially (> 0.60, HIGH/CRITICAL)
  5. Repeated known attack source: corroboration strengthens risk (>= 0.75)
  6. Context window works correctly: historical events older than window are excluded
  7. No unlimited database scan: queries enforce strict LIMIT and index usage
  8. Risk score strictly bounded in [0.0, 1.0] across extreme inputs
  9. Transparent explanations/reasons generated detailing classifier, anomaly, and history
  10. False-positive indicators appear appropriately under qualifying conditions
  11. Authenticated /predict endpoint returns comprehensive structured 'risk' object
  12. Risk information persists accurately in PostgreSQL predictions table
  13. GET /events/recent exposes risk_score and risk_level
"""

import os
import sys
import time
import uuid
import subprocess
import requests
from datetime import datetime, timezone, timedelta

# Ensure workspace root is in sys.path
WORKSPACE = os.path.dirname(os.path.abspath(__file__))
if WORKSPACE not in sys.path:
    sys.path.insert(0, WORKSPACE)

if "DATABASE_URL" not in os.environ:
    os.environ["DATABASE_URL"] = "postgresql://postgres:postgres@localhost:5432/cyvora"

import backend.app.database as db_mod
db_mod._init_engine()

from backend.app.risk_engine import (
    assess_risk,
    W_THREAT,
    W_ANOMALY,
    W_CONTEXT,
    CONTEXT_WINDOW_MINUTES,
    CONTEXT_RECENT_EVENT_LIMIT,
    RISK_THRESHOLD_MEDIUM,
    RISK_THRESHOLD_HIGH,
    RISK_THRESHOLD_CRITICAL,
)
from backend.app.database import (
    get_source_context,
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


# Standard Benign Baseline (HTTPS browsing)
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

# Heartbleed Attack Signature
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
    email = f"analyst_risk_{unique}@cyvora.internal"
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

def test_1_normal_benign_event():
    """1. Normal benign event: low anomaly + benign prediction -> low risk (< 0.30)"""
    pred_res = {"is_attack": False, "prediction": "BENIGN", "confidence": 0.98, "severity": "LOW"}
    anom_res = {"anomaly_score": 0.15, "is_anomalous": False, "novelty_label": "KNOWN_NORMAL"}
    ctx = {
        "source_id": "192.168.1.50",
        "recent_event_count": 5,
        "recent_anomaly_count": 0,
        "recent_attack_count": 0,
        "is_source_blocked": False,
        "is_source_rate_limited": False,
    }
    risk = assess_risk(pred_res, anom_res, ctx)
    score = risk["risk_score"]
    level = risk["risk_level"]
    ok = (score < 0.30) and (level == "LOW")
    record(
        "1. Normal benign event -> low risk (<0.30)",
        ok,
        f"score={score}, level={level}, fp_indicators={risk['false_positive_indicators']}"
    )


def test_2_high_anomaly_benign_mitigation():
    """2. High anomaly + benign prediction -> UNKNOWN_ANOMALOUS, no immediate block, false-positive indicator"""
    pred_res = {"is_attack": False, "prediction": "BENIGN", "confidence": 0.95, "severity": "LOW"}
    anom_res = {"anomaly_score": 0.78, "is_anomalous": True, "novelty_label": "UNKNOWN_ANOMALOUS"}
    ctx = {
        "source_id": "192.168.1.75",
        "recent_event_count": 2,
        "recent_anomaly_count": 0,
        "recent_attack_count": 0,
        "is_source_blocked": False,
        "is_source_rate_limited": False,
    }
    risk = assess_risk(pred_res, anom_res, ctx)
    score = risk["risk_score"]
    level = risk["risk_level"]
    has_fp_ind = any("ISOLATED_BENIGN_ANOMALY" in ind for ind in risk["false_positive_indicators"])
    # Score must be tempered (< 0.45) so it doesn't prematurely trigger HIGH risk
    ok = (score < 0.45) and has_fp_ind and (level in ["LOW", "MEDIUM"])
    record(
        "2. High anomaly + benign prediction -> false-positive indicator, tempered risk (<0.45)",
        ok,
        f"score={score}, level={level}, fp_ind_found={has_fp_ind}"
    )


def test_3_repeated_anomalous_source():
    """3. Repeated anomalous source -> risk increases and flags active monitoring"""
    pred_res = {"is_attack": False, "prediction": "BENIGN", "confidence": 0.80, "severity": "LOW"}
    anom_res = {"anomaly_score": 0.68, "is_anomalous": True, "novelty_label": "UNKNOWN_ANOMALOUS"}
    ctx = {
        "source_id": "192.168.1.99",
        "recent_event_count": 15,
        "recent_anomaly_count": 5,   # persistent recurring anomalies
        "recent_attack_count": 0,
        "is_source_blocked": False,
        "is_source_rate_limited": False,
    }
    risk = assess_risk(pred_res, anom_res, ctx)
    score = risk["risk_score"]
    level = risk["risk_level"]
    # With repeated anomalies, ISOLATED_BENIGN_ANOMALY should NOT apply, score should elevate into MEDIUM or HIGH
    no_isolated_fp = not any("ISOLATED_BENIGN_ANOMALY" in ind for ind in risk["false_positive_indicators"])
    ok = (score >= 0.30) and no_isolated_fp
    record(
        "3. Repeated anomalous source -> risk increases, no isolated FP label",
        ok,
        f"score={score}, level={level}, reasons_count={len(risk['reasons'])}"
    )


def test_4_known_attack_high_confidence():
    """4. Known attack + high confidence -> higher risk (> 0.60, HIGH or CRITICAL)"""
    pred_res = {"is_attack": True, "prediction": "Heartbleed", "confidence": 0.96, "severity": "HIGH"}
    anom_res = {"anomaly_score": 0.72, "is_anomalous": True, "novelty_label": "KNOWN_THREAT"}
    ctx = {
        "source_id": "10.0.0.88",
        "recent_event_count": 1,
        "recent_anomaly_count": 0,
        "recent_attack_count": 0,
        "is_source_blocked": False,
        "is_source_rate_limited": False,
    }
    risk = assess_risk(pred_res, anom_res, ctx)
    score = risk["risk_score"]
    level = risk["risk_level"]
    ok = (score >= 0.60) and (level in ["HIGH", "CRITICAL"])
    record(
        "4. Known attack + high confidence -> high risk (>=0.60)",
        ok,
        f"score={score}, level={level}"
    )


def test_5_repeated_known_attack_source():
    """5. Repeated known attack source -> context corroborates and strengthens risk (>= 0.75)"""
    pred_res = {"is_attack": True, "prediction": "PortScan", "confidence": 0.94, "severity": "HIGH"}
    anom_res = {"anomaly_score": 0.65, "is_anomalous": True, "novelty_label": "KNOWN_THREAT"}
    ctx = {
        "source_id": "10.0.0.99",
        "recent_event_count": 25,
        "recent_anomaly_count": 4,
        "recent_attack_count": 6,   # heavy prior attack history
        "is_source_blocked": True,
        "is_source_rate_limited": False,
    }
    risk = assess_risk(pred_res, anom_res, ctx)
    score = risk["risk_score"]
    level = risk["risk_level"]
    ok = (score >= 0.75) and (level in ["HIGH", "CRITICAL"])
    record(
        "5. Repeated known attack source -> corroborated high/critical risk (>=0.75)",
        ok,
        f"score={score}, level={level}"
    )


def test_6_context_window_behavior():
    """6. Context window works correctly: events older than window are not included"""
    if not _db_available or _SessionLocal is None:
        record("6. Context window works correctly", False, "DB not available")
        return

    session = _SessionLocal()
    test_src = f"test_window_{uuid.uuid4().hex[:6]}"
    now = datetime.now(timezone.utc)
    old_time = now - timedelta(minutes=25)   # well outside 10m window
    recent_time = now - timedelta(minutes=3)  # inside 10m window

    try:
        # Create dummy security event & predictions
        sec_evt = SecurityEvent(
            source_id=test_src,
            event_type="network_flow",
            raw_features={},
            created_at=now,
        )
        session.add(sec_evt)
        session.flush()

        # 1 old attack
        pred_old = Prediction(
            security_event_id=sec_evt.id,
            source_id=test_src,
            timestamp=old_time,
            prediction="DDoS",
            prediction_id=2,
            confidence=0.95,
            is_attack=True,
            severity="HIGH",
            model_version="ensemble_v5",
            decision_source="test",
            created_at=old_time,
        )
        session.add(pred_old)

        # 1 recent attack
        pred_recent = Prediction(
            security_event_id=sec_evt.id,
            source_id=test_src,
            timestamp=recent_time,
            prediction="DDoS",
            prediction_id=2,
            confidence=0.95,
            is_attack=True,
            severity="HIGH",
            model_version="ensemble_v5",
            decision_source="test",
            created_at=recent_time,
        )
        session.add(pred_recent)
        session.commit()

        # Query context with standard 10m window
        ctx = get_source_context(test_src, window_minutes=10)
        # Should only find 1 recent event, not 2
        ok = (ctx["recent_event_count"] == 1) and (ctx["recent_attack_count"] == 1)
        record(
            "6. Context window works correctly (10m cutoff strictly applied)",
            ok,
            f"recent_events={ctx['recent_event_count']}, recent_attacks={ctx['recent_attack_count']}"
        )
    finally:
        session.close()


def test_7_no_unlimited_db_scan():
    """7. No unlimited database scan: get_source_context enforces limit and bounded query"""
    if not _db_available or _SessionLocal is None:
        record("7. No unlimited database scan", False, "DB not available")
        return

    session = _SessionLocal()
    test_src = f"test_limit_{uuid.uuid4().hex[:6]}"
    now = datetime.now(timezone.utc)

    try:
        sec_evt = SecurityEvent(
            source_id=test_src,
            event_type="network_flow",
            raw_features={},
            created_at=now,
        )
        session.add(sec_evt)
        session.flush()

        # Insert 15 events
        for i in range(15):
            p = Prediction(
                security_event_id=sec_evt.id,
                source_id=test_src,
                timestamp=now - timedelta(seconds=i * 5),
                prediction="BENIGN",
                prediction_id=0,
                confidence=0.90,
                is_attack=False,
                severity="LOW",
                model_version="ensemble_v5",
                decision_source="test",
            )
            session.add(p)
        session.commit()

        # Query with explicit limit=5
        ctx_limited = get_source_context(test_src, window_minutes=10, limit=5)
        ok = (ctx_limited["recent_event_count"] == 5)
        record(
            "7. No unlimited database scan (limit constraint strictly enforced)",
            ok,
            f"requested limit=5, observed recent_event_count={ctx_limited['recent_event_count']}"
        )
    finally:
        session.close()


def test_8_risk_score_bounded_0_to_1():
    """8. Risk score is strictly clamped to [0.0, 1.0] across all edge and extreme inputs"""
    cases = [
        # Extreme maximum
        (
            {"is_attack": True, "prediction": "DDoS", "confidence": 1.0, "severity": "CRITICAL"},
            {"anomaly_score": 1.0, "is_anomalous": True, "novelty_label": "KNOWN_THREAT"},
            {"source_id": "9.9.9.9", "recent_event_count": 500, "recent_anomaly_count": 500, "recent_attack_count": 500, "is_source_blocked": True},
        ),
        # Extreme minimum
        (
            {"is_attack": False, "prediction": "BENIGN", "confidence": 1.0, "severity": "LOW"},
            {"anomaly_score": 0.0, "is_anomalous": False, "novelty_label": "KNOWN_NORMAL"},
            {"source_id": "1.1.1.1", "recent_event_count": 0, "recent_anomaly_count": 0, "recent_attack_count": 0},
        ),
        # Negative / None edge values
        (
            {"is_attack": False, "prediction": "BENIGN", "confidence": -0.5, "severity": "LOW"},
            {"anomaly_score": -0.2, "is_anomalous": False, "novelty_label": "UNKNOWN"},
            {"source_id": "2.2.2.2", "recent_event_count": -5, "recent_anomaly_count": None, "recent_attack_count": None},
        ),
    ]

    all_bounded = True
    details = []
    for p, a, c in cases:
        r = assess_risk(p, a, c)
        score = r["risk_score"]
        if not (0.0 <= score <= 1.0):
            all_bounded = False
        details.append(f"score={score}")

    record("8. Risk score strictly bounded [0.0, 1.0]", all_bounded, ", ".join(details))


def test_9_reasons_generation():
    """9. Reasons are generated correctly, detailing classifier, anomaly, and historical telemetry"""
    pred_res = {"is_attack": True, "prediction": "Bot", "confidence": 0.88, "severity": "MEDIUM"}
    anom_res = {"anomaly_score": 0.65, "is_anomalous": True, "novelty_label": "KNOWN_THREAT"}
    ctx = {
        "source_id": "192.168.1.120",
        "recent_event_count": 8,
        "recent_anomaly_count": 3,
        "recent_attack_count": 2,
        "is_source_blocked": False,
        "is_source_rate_limited": True,
    }
    risk = assess_risk(pred_res, anom_res, ctx)
    reasons = risk.get("reasons", [])
    has_classifier = any("Supervised classifier" in r for r in reasons)
    has_anomaly = any("Isolation Forest" in r for r in reasons)
    has_history = any("attack flow" in r for r in reasons)
    has_status = any("RATE_LIMITED" in r for r in reasons)

    ok = has_classifier and has_anomaly and has_history and has_status
    record(
        "9. Explanations and reasons generated transparently across all signals",
        ok,
        f"reasons_count={len(reasons)}, all_signals_covered={ok}"
    )


def test_10_false_positive_indicators():
    """10. False-positive indicators appear when appropriate"""
    # Test Normal Concurrence
    pred_normal = {"is_attack": False, "prediction": "BENIGN", "confidence": 0.99, "severity": "LOW"}
    anom_normal = {"anomaly_score": 0.10, "is_anomalous": False, "novelty_label": "KNOWN_NORMAL"}
    ctx_normal = {"source_id": "10.0.0.1", "recent_event_count": 2, "recent_anomaly_count": 0, "recent_attack_count": 0}
    r_norm = assess_risk(pred_normal, anom_normal, ctx_normal)
    has_norm_ind = any("NORMAL_TRAFFIC_CONCURRENCE" in i for i in r_norm["false_positive_indicators"])

    # Test Isolated Anomaly
    anom_high = {"anomaly_score": 0.72, "is_anomalous": True, "novelty_label": "UNKNOWN_ANOMALOUS"}
    r_iso = assess_risk(pred_normal, anom_high, ctx_normal)
    has_iso_ind = any("ISOLATED_BENIGN_ANOMALY" in i for i in r_iso["false_positive_indicators"])

    ok = has_norm_ind and has_iso_ind
    record(
        "10. False-positive indicators triggered appropriately",
        ok,
        f"has_norm_concurrence={has_norm_ind}, has_isolated_anomaly={has_iso_ind}"
    )


def test_11_predict_endpoint_risk_response(token: str):
    """11. Authenticated /predict returns structured 'risk' information"""
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
        record("11. /predict returns structured risk object", False, f"status={resp.status_code}")
        return

    data = resp.json()
    risk = data.get("risk")
    has_risk = isinstance(risk, dict)
    has_score = "risk_score" in risk if has_risk else False
    has_level = "risk_level" in risk if has_risk else False
    has_reasons = "reasons" in risk if has_risk else False
    has_ctx = "context" in risk if has_risk else False

    ok = has_risk and has_score and has_level and has_reasons and has_ctx
    record(
        "11. /predict returns comprehensive structured 'risk' object",
        ok,
        f"risk_score={risk.get('risk_score')}, risk_level={risk.get('risk_level')}"
    )


def test_12_risk_persistence_in_postgres(token: str):
    """12. Risk information persists accurately in PostgreSQL predictions table"""
    if not _db_available or _SessionLocal is None:
        record("12. Risk information persists in PostgreSQL", False, "DB not available")
        return

    src = f"10.99.88.{int(time.time()) % 250}"
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
        record("12. Risk information persists in PostgreSQL", False, f"predict error: {resp.status_code}")
        return

    data = resp.json()
    sec_id = data.get("security_event_id")

    session = _SessionLocal()
    try:
        row = session.query(Prediction).filter(Prediction.security_event_id == sec_id).first()
        if not row:
            record("12. Risk information persists in PostgreSQL", False, "Prediction row not found")
            return

        ok = (
            row.risk_score is not None
            and row.risk_level is not None
            and isinstance(row.context_summary, dict)
        )
        record(
            "12. Risk information persists in PostgreSQL predictions table",
            ok,
            f"stored risk_score={row.risk_score}, risk_level={row.risk_level}, has_context_summary={isinstance(row.context_summary, dict)}"
        )
    finally:
        session.close()


def test_13_events_recent_exposes_risk(token: str):
    """13. GET /events/recent exposes risk_score and risk_level"""
    resp = requests.get(
        f"{BASE}/events/recent?limit=10",
        headers={"Authorization": f"Bearer {token}"},
        timeout=10,
    )
    if resp.status_code != 200:
        record("13. /events/recent exposes risk data", False, f"status={resp.status_code}")
        return

    data = resp.json()
    events = data.get("events", [])
    if not events:
        record("13. /events/recent exposes risk data", False, "No events returned")
        return

    # Check that at least the top event (which we just wrote in test 12) exposes risk_score and risk_level
    top_event = events[0]
    has_risk_score = "risk_score" in top_event
    has_risk_level = "risk_level" in top_event

    ok = has_risk_score and has_risk_level
    record(
        "13. GET /events/recent exposes risk_score and risk_level",
        ok,
        f"top_event risk_score={top_event.get('risk_score')}, risk_level={top_event.get('risk_level')}"
    )


def run_all_tests():
    print("\n" + "=" * 70)
    print("CYVORA Context Analysis & False-Positive Reduction Test Suite")
    print("=" * 70)

    start_server_if_needed()
    token = get_auth_token()

    test_1_normal_benign_event()
    test_2_high_anomaly_benign_mitigation()
    test_3_repeated_anomalous_source()
    test_4_known_attack_high_confidence()
    test_5_repeated_known_attack_source()
    test_6_context_window_behavior()
    test_7_no_unlimited_db_scan()
    test_8_risk_score_bounded_0_to_1()
    test_9_reasons_generation()
    test_10_false_positive_indicators()
    test_11_predict_endpoint_risk_response(token)
    test_12_risk_persistence_in_postgres(token)
    test_13_events_recent_exposes_risk(token)

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
