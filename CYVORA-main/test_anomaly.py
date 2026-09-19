"""
CYVORA — Anomaly and Novelty Detection Test Suite
==================================================
Verifies:
  1. Anomaly model and feature metadata load cleanly
  2. Feature schema matches predictor.py (83 features in exact order)
  3. Benign flow produces non-anomalous result (is_anomalous=False, score < 0.55)
  4. Anomalous flow produces anomalous result (is_anomalous=True, score >= 0.60)
  5. Deterministic assess_novelty() correctly tags UNKNOWN_ANOMALOUS vs KNOWN_THREAT
  6. GET /model-info reports anomaly detector status active
  7. JWT protection remains enforced on /predict (401 without Bearer token)
  8. Authenticated /predict returns structured anomaly and novelty objects
  9. UNKNOWN_ANOMALOUS logic escalates response to ALERT (monitoring, non-blocking)
  10. Anomaly score and novelty_label are persisted in PostgreSQL predictions table
  11. Known attack prediction (Heartbleed) still executes accurately
  12. GET /events/recent returns anomaly_score, is_anomalous, and novelty_label
"""

import os
import sys
import time
import json
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

from backend.app.anomaly_detector import (
    load_anomaly_model,
    get_anomaly_features,
    detect_anomaly,
    assess_novelty,
    ANOMALY_THRESHOLD,
    ANOMALY_HIGH_THRESHOLD,
    CONFIDENCE_LOW_THRESHOLD,
)
from backend.app.predictor import MODEL_FEATURES, BASE_FEATURES

BASE = "http://127.0.0.1:8000"
RESULTS = []
SERVER_PROC = None

# Pure ASCII status symbols to prevent Windows charmap cp1252 encode errors
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
    "Max Packet Length": 1473.75,
    "Packet Length Mean": 300.36,
    "Packet Length Std": 43.27,
    "Packet Length Variance": 1668.49,
    "FIN Flag Count": 0.0,
    "SYN Flag Count": 1.0,
    "RST Flag Count": 0.0,
    "PSH Flag Count": 0.0,
    "ACK Flag Count": 1.0,
    "URG Flag Count": 0.0,
    "ECE Flag Count": 0.0,
    "Down/Up Ratio": 0.72,
    "Average Packet Size": 300.36,
    "Init_Win_bytes_forward": 65535.0,
    "Init_Win_bytes_backward": 65535.0,
    "act_data_pkt_fwd": 10.0,
    "min_seg_size_forward": 20.0,
}

# Extreme Outlier / Novel Telemetry (High rate, abnormal packet sizes and timing)
NOVEL_ANOMALOUS_FEATURES = {
    "Destination Port": 49152,
    "Flow Duration": 15,
    "Total Fwd Packets": 12000,
    "Total Backward Packets": 0,
    "Total Length of Fwd Packets": 38400000,
    "Total Length of Bwd Packets": 0,
    "Fwd Packet Length Max": 65535,
    "Fwd Packet Length Min": 1000,
    "Fwd Packet Length Mean": 3200.0,
    "Fwd Packet Length Std": 4500.0,
    "Bwd Packet Length Max": 0,
    "Bwd Packet Length Min": 0,
    "Bwd Packet Length Mean": 0.0,
    "Bwd Packet Length Std": 0.0,
    "Flow Bytes/s": 2560000000.0,
    "Flow Packets/s": 800000.0,
    "Flow IAT Mean": 0.001,
    "Flow IAT Std": 0.0005,
    "Flow IAT Max": 0.005,
    "Flow IAT Min": 0.0001,
    "Fwd IAT Total": 15.0,
    "Fwd IAT Mean": 0.001,
    "Fwd IAT Std": 0.0005,
    "Fwd IAT Max": 0.005,
    "Fwd IAT Min": 0.0001,
    "Bwd IAT Total": 0.0,
    "Bwd IAT Mean": 0.0,
    "Bwd IAT Std": 0.0,
    "Bwd IAT Max": 0.0,
    "Bwd IAT Min": 0.0,
    "Fwd PSH Flags": 1,
    "Bwd PSH Flags": 0,
    "Fwd URG Flags": 1,
    "Bwd URG Flags": 0,
    "Fwd Header Length": 240000,
    "Bwd Header Length": 0,
    "Fwd Packets/s": 800000.0,
    "Bwd Packets/s": 0.0,
    "Min Packet Length": 1000,
    "Max Packet Length": 65535,
    "Packet Length Mean": 3200.0,
    "Packet Length Std": 4500.0,
    "Packet Length Variance": 20250000.0,
    "FIN Flag Count": 1,
    "SYN Flag Count": 1,
    "RST Flag Count": 1,
    "PSH Flag Count": 1,
    "ACK Flag Count": 0,
    "URG Flag Count": 1,
    "ECE Flag Count": 1,
    "Down/Up Ratio": 0.0,
    "Average Packet Size": 3200.0,
    "Init_Win_bytes_forward": 65535,
    "Init_Win_bytes_backward": 0,
    "act_data_pkt_fwd": 12000,
    "min_seg_size_forward": 32,
}

# Known Threat Sample: Heartbleed attack signature
HEARTBLEED_FEATURES = {
    "Destination Port": 444,
    "Flow Duration": 119301666,
    "Total Fwd Packets": 2445,
    "Total Backward Packets": 3495,
    "Total Length of Fwd Packets": 98664,
    "Total Length of Bwd Packets": 13917812,
    "Fwd Packet Length Max": 4013,
    "Fwd Packet Length Min": 0,
    "Fwd Packet Length Mean": 40.353374,
    "Fwd Packet Length Std": 247.939223,
    "Bwd Packet Length Max": 14480,
    "Bwd Packet Length Min": 0,
    "Bwd Packet Length Mean": 3982.206581,
    "Bwd Packet Length Std": 3317.070005,
    "Flow Bytes/s": 117487.6798,
    "Flow Packets/s": 49.789751,
    "Flow IAT Mean": 20087.83735,
    "Flow IAT Std": 298118.8256,
    "Flow IAT Max": 10000000,
    "Flow IAT Min": 1,
    "Fwd IAT Total": 119000000,
    "Fwd IAT Mean": 48814.09902,
    "Fwd IAT Std": 476839.2991,
    "Fwd IAT Max": 10000000,
    "Fwd IAT Min": 1,
    "Bwd IAT Total": 119000000,
    "Bwd IAT Mean": 34144.59473,
    "Bwd IAT Std": 396860.1064,
    "Bwd IAT Max": 10000000,
    "Bwd IAT Min": 1,
    "Fwd PSH Flags": 0,
    "Bwd PSH Flags": 0,
    "Fwd URG Flags": 0,
    "Bwd URG Flags": 0,
    "Fwd Header Length": 78248,
    "Bwd Header Length": 111848,
    "Fwd Packets/s": 20.494265,
    "Bwd Packets/s": 29.295485,
    "Min Packet Length": 0,
    "Max Packet Length": 14480,
    "Packet Length Mean": 2359.824272,
    "Packet Length Std": 3139.739486,
    "Packet Length Variance": 9857964.045,
    "FIN Flag Count": 0,
    "SYN Flag Count": 0,
    "RST Flag Count": 0,
    "PSH Flag Count": 1,
    "ACK Flag Count": 0,
    "URG Flag Count": 0,
    "ECE Flag Count": 0,
    "Down/Up Ratio": 1,
    "Average Packet Size": 2360.221714,
    "Init_Win_bytes_forward": 29200,
    "Init_Win_bytes_backward": 243,
    "act_data_pkt_fwd": 24,
    "min_seg_size_forward": 32,
}


def ensure_server():
    global SERVER_PROC
    try:
        r = requests.get(f"{BASE}/health", timeout=2)
        if r.status_code == 200:
            print("  [INFO] Using existing CYVORA server on port 8000")
            return
    except Exception:
        pass

    print("  [INFO] Starting CYVORA server...")
    env = os.environ.copy()
    env["DATABASE_URL"] = os.getenv(
        "DATABASE_URL",
        "postgresql://postgres:postgres@localhost:5432/cyvora"
    )
    env["PYTHONIOENCODING"] = "utf-8"
    SERVER_PROC = subprocess.Popen(
        [sys.executable, "-m", "uvicorn", "backend.app.main:app", "--host", "127.0.0.1", "--port", "8000"],
        cwd=WORKSPACE,
        env=env,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
    )
    for _ in range(30):
        time.sleep(1)
        try:
            r = requests.get(f"{BASE}/health", timeout=2)
            if r.status_code == 200:
                print("  [INFO] CYVORA server is ready.")
                return
        except Exception:
            pass
    raise RuntimeError("CYVORA server failed to start within 30s")


def run_tests():
    print("============================================================")
    print("CYVORA — ANOMALY & NOVELTY DETECTION TEST SUITE")
    print("============================================================")

    # ----------------------------------------------------------
    # PART 1: Module-Level Isolation Forest Verification
    # ----------------------------------------------------------
    print("\n--- PART 1: Module & Feature Pipeline Verification ---")

    # Test 1: Model loads cleanly
    model = load_anomaly_model()
    record(
        "T01_Anomaly_Model_Loaded",
        model is not None,
        f"IsolationForest artifact loaded from models/anomaly_model.pkl"
    )

    # Test 2: Feature alignment (83 features in exact order)
    features_meta = get_anomaly_features()
    schema_ok = (
        len(features_meta) == len(MODEL_FEATURES) == 83
        and features_meta == MODEL_FEATURES
    )
    record(
        "T02_Feature_Schema_Aligned",
        schema_ok,
        f"Feature count: {len(features_meta)}, perfectly matches predictor.py MODEL_FEATURES"
    )

    # Test 3: Benign flow evaluation
    benign_res = detect_anomaly(BENIGN_FEATURES)
    b_score = benign_res.get("anomaly_score", 1.0)
    b_is_anom = benign_res.get("is_anomalous", True)
    benign_pass = (not b_is_anom) and (b_score < ANOMALY_THRESHOLD)
    record(
        "T03_Benign_Sample_Detected_Normal",
        benign_pass,
        f"is_anomalous={b_is_anom}, anomaly_score={b_score:.4f} (threshold={ANOMALY_THRESHOLD})"
    )

    # Test 4: Anomalous test sample evaluation
    anom_res = detect_anomaly(NOVEL_ANOMALOUS_FEATURES)
    a_score = anom_res.get("anomaly_score", 0.0)
    a_is_anom = anom_res.get("is_anomalous", False)
    anom_pass = a_is_anom and (a_score >= ANOMALY_HIGH_THRESHOLD)
    record(
        "T04_Anomalous_Sample_Detected_Novelty",
        anom_pass,
        f"is_anomalous={a_is_anom}, anomaly_score={a_score:.4f} (high_threshold={ANOMALY_HIGH_THRESHOLD})"
    )

    # Test 5: assess_novelty() deterministic rule logic
    # Case A: High anomaly + Benign / Low confidence -> UNKNOWN_ANOMALOUS
    mock_pred_benign = {"prediction": "BENIGN", "confidence": 0.65, "is_attack": False}
    novelty_a = assess_novelty(mock_pred_benign, anom_res)
    case_a_ok = (
        novelty_a["novelty_label"] == "UNKNOWN_ANOMALOUS"
        and novelty_a["recommendation"] == "ALERT"
    )

    # Case B: Low anomaly + Benign -> KNOWN_BENIGN
    novelty_b = assess_novelty(mock_pred_benign, benign_res)
    case_b_ok = (
        novelty_b["novelty_label"] == "KNOWN_BENIGN"
        and novelty_b["recommendation"] == "ALLOW"
    )

    # Case C: High confidence attack -> KNOWN_THREAT
    mock_pred_attack = {"prediction": "DDoS", "confidence": 0.95, "is_attack": True}
    novelty_c = assess_novelty(mock_pred_attack, anom_res)
    case_c_ok = (
        novelty_c["novelty_label"] == "KNOWN_THREAT"
        and novelty_c["recommendation"] == "BLOCK"
    )

    record(
        "T05_Deterministic_Novelty_Triage",
        case_a_ok and case_b_ok and case_c_ok,
        f"A(Unknown): {novelty_a['novelty_label']}, B(Benign): {novelty_b['novelty_label']}, C(Attack): {novelty_c['novelty_label']}"
    )

    # ----------------------------------------------------------
    # PART 2: End-to-End API Integration & PostgreSQL Persistence
    # ----------------------------------------------------------
    print("\n--- PART 2: API Integration & PostgreSQL Persistence ---")
    ensure_server()

    # Test 6: GET /model-info reports anomaly detector metadata
    r_info = requests.get(f"{BASE}/model-info", timeout=5)
    info_data = r_info.json()
    ad_meta = info_data.get("anomaly_detector", {})
    record(
        "T06_Model_Info_Anomaly_Metadata",
        r_info.status_code == 200 and ad_meta.get("status") == "active",
        f"anomaly_detector={ad_meta.get('detector')} status={ad_meta.get('status')}"
    )

    # Test 7: JWT Protection preserved on /predict
    r_unauth = requests.post(f"{BASE}/predict", json={"features": BENIGN_FEATURES}, timeout=5)
    record(
        "T07_JWT_Protection_Enforced",
        r_unauth.status_code == 401,
        f"Unauthenticated request status={r_unauth.status_code} (detail={r_unauth.json().get('detail')})"
    )

    # Register & Login user for authenticated tests
    test_email = f"anomaly_tester_{uuid.uuid4().hex[:6]}@cyvora.org"
    test_pass = "SecurePass2026!"
    requests.post(
        f"{BASE}/auth/register",
        json={"email": test_email, "password": test_pass, "full_name": "Anomaly Tester"},
        timeout=5,
    )
    r_login = requests.post(
        f"{BASE}/auth/login",
        json={"email": test_email, "password": test_pass},
        timeout=5,
    )
    token = r_login.json().get("access_token")
    headers = {"Authorization": f"Bearer {token}"}

    # Test 8: Authenticated /predict returns structured anomaly object
    source_benign = f"TEST_BENIGN_{uuid.uuid4().hex[:6]}"
    r_pred_b = requests.post(
        f"{BASE}/predict",
        json={"features": BENIGN_FEATURES, "source_id": source_benign},
        headers=headers,
        timeout=5,
    )
    pred_b_data = r_pred_b.json()
    anom_in_pred = "anomaly" in pred_b_data and "anomaly_score" in pred_b_data["anomaly"]
    record(
        "T08_Predict_Returns_Anomaly_Result",
        r_pred_b.status_code == 200 and anom_in_pred,
        f"anomaly={pred_b_data.get('anomaly', {}).get('detector')}, score={pred_b_data.get('anomaly', {}).get('anomaly_score')}"
    )

    # Test 9: Novel anomalous traffic triggers UNKNOWN_ANOMALOUS triage (escalates to ALERT, non-blocking)
    source_novel = f"TEST_NOVEL_{uuid.uuid4().hex[:6]}"
    r_pred_novel = requests.post(
        f"{BASE}/predict",
        json={"features": NOVEL_ANOMALOUS_FEATURES, "source_id": source_novel},
        headers=headers,
        timeout=5,
    )
    novel_data = r_pred_novel.json()
    novel_label = novel_data.get("novelty", {}).get("novelty_label")
    resp_action = novel_data.get("response", {}).get("response_action")
    novel_ok = (
        r_pred_novel.status_code == 200
        and novel_label == "UNKNOWN_ANOMALOUS"
        and resp_action == "ALERT"
    )
    record(
        "T09_Unknown_Anomalous_Escalates_To_Alert",
        novel_ok,
        f"novelty_label={novel_label}, response_action={resp_action} (non-blocking monitoring)"
    )

    # Test 10: PostgreSQL persistence of anomaly fields
    # Query database directly to confirm columns were written
    import backend.app.database as db_mod
    db_mod._init_engine()
    session = db_mod._SessionLocal()
    persisted_row = (
        session.query(db_mod.Prediction)
        .filter(db_mod.Prediction.source_id == source_novel)
        .first()
    )
    db_ok = (
        persisted_row is not None
        and persisted_row.anomaly_score is not None
        and persisted_row.is_anomalous is True
        and persisted_row.novelty_label == "UNKNOWN_ANOMALOUS"
    )
    session.close()
    record(
        "T10_Postgres_Persists_Anomaly_Fields",
        db_ok,
        f"Stored: anomaly_score={getattr(persisted_row, 'anomaly_score', None):.4f}, "
        f"is_anomalous={getattr(persisted_row, 'is_anomalous', None)}, "
        f"novelty_label={getattr(persisted_row, 'novelty_label', None)}"
    )

    # Test 11: Known attack classification still works accurately
    source_attack = f"TEST_ATTACK_{uuid.uuid4().hex[:6]}"
    r_attack = requests.post(
        f"{BASE}/predict",
        json={"features": HEARTBLEED_FEATURES, "source_id": source_attack},
        headers=headers,
        timeout=5,
    )
    # If high confidence, main.py raises 403 ATTACK_BLOCKED with details
    attack_classified = False
    if r_attack.status_code == 403:
        err_detail = r_attack.json().get("detail", {})
        pred_label = err_detail.get("prediction", {}).get("prediction")
        attack_classified = (pred_label == "Heartbleed")
    elif r_attack.status_code == 200:
        pred_label = r_attack.json().get("result", {}).get("prediction")
        attack_classified = (pred_label == "Heartbleed")

    record(
        "T11_Known_Attack_Classification_Preserved",
        attack_classified,
        f"Status: {r_attack.status_code}, Predicted: {pred_label}"
    )

    # Test 12: GET /events/recent returns anomaly_score, is_anomalous, novelty_label
    r_events = requests.get(
        f"{BASE}/events/recent?limit=10",
        headers=headers,
        timeout=5,
    )
    events_data = r_events.json().get("events", [])
    recent_event = next((e for e in events_data if e.get("source_id") == source_novel), None)
    event_has_anomaly = (
        recent_event is not None
        and "anomaly_score" in recent_event
        and recent_event.get("anomaly_score") is not None
        and recent_event.get("novelty_label") == "UNKNOWN_ANOMALOUS"
    )
    record(
        "T12_Events_Recent_Includes_Anomaly",
        event_has_anomaly,
        f"Event found: {recent_event.get('security_event_id') if recent_event else 'None'}, "
        f"novelty_label={recent_event.get('novelty_label') if recent_event else 'None'}"
    )

    # ----------------------------------------------------------
    # SUMMARY
    # ----------------------------------------------------------
    print("\n============================================================")
    total = len(RESULTS)
    passed = sum(1 for r in RESULTS if r["passed"])
    print(f"ANOMALY DETECTION TEST RESULTS: {passed}/{total} PASSED")
    print("============================================================")

    print("\n--- HONEST EVALUATION SCOPE DOCUMENTATION ---")
    print("[1] Test T03 demonstrates: BENIGN normal flow recognition (low anomaly indication).")
    print("[2] Test T04 demonstrates: UNCALIBRATED / NOVEL statistical outlier anomaly detection.")
    print("[3] Test T09 demonstrates: UNKNOWN_ANOMALOUS triage logic (high anomaly + non-attack).")
    print("[4] Test T11 demonstrates: SUPERVISED known threat classification (Heartbleed).")
    print("NOTE: Isolation Forest detects deviation from normal traffic distribution.")
    print("It does NOT claim to identify specific zero-day attack family signatures.")

    if SERVER_PROC:
        SERVER_PROC.terminate()

    if passed != total:
        sys.exit(1)


if __name__ == "__main__":
    run_tests()
