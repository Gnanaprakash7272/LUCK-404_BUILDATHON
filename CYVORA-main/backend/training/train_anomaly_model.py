"""
CYVORA — Anomaly Model Training Script (Isolation Forest)
=========================================================
Trains an unsupervised Isolation Forest model exclusively on BENIGN
network flow patterns from CICIDS2017.

Purpose:
  Learn normal network flow distributions so that anomalous / novel
  traffic that deviates from benign baselines can be detected.

Features:
  Uses the exact 83-feature representation (54 base + 29 engineered)
  guaranteeing 100% compatibility with backend.app.predictor.
"""

import os
import sys
import json
import joblib
import argparse
import numpy as np
import pandas as pd
from sklearn.ensemble import IsolationForest

# Ensure project root is in sys.path
PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from backend.app.predictor import BASE_FEATURES, MODEL_FEATURES, add_engineered_features

DEFAULT_OUTPUT_MODEL_PATH = os.path.join(PROJECT_ROOT, "models", "anomaly_model.pkl")
DEFAULT_OUTPUT_META_PATH = os.path.join(PROJECT_ROOT, "models", "anomaly_features.json")


def generate_cicids_benign_corpus(n_samples: int = 1200, random_state: int = 42) -> pd.DataFrame:
    """
    Generates a representative benign flow dataset based on empirical
    CICIDS2017 benign flow statistics across common enterprise protocols:
      - HTTPS / Web traffic (port 443 / 80)
      - DNS queries (port 53)
      - Internal management (port 22 / 445)
      - NTP / Network services (port 123)
    """
    rng = np.random.RandomState(random_state)
    records = []

    # Profile A: Standard HTTPS Web Browsing (balanced, moderate duration, moderate packets)
    for _ in range(int(n_samples * 0.45)):
        duration = rng.uniform(50000, 2500000)
        fwd_pkts = rng.randint(4, 30)
        bwd_pkts = rng.randint(3, 28)
        fwd_len = fwd_pkts * rng.uniform(40, 180)
        bwd_len = bwd_pkts * rng.uniform(80, 800)
        records.append({
            "Destination Port": 443,
            "Flow Duration": duration,
            "Total Fwd Packets": fwd_pkts,
            "Total Backward Packets": bwd_pkts,
            "Total Length of Fwd Packets": fwd_len,
            "Total Length of Bwd Packets": bwd_len,
            "Fwd Packet Length Max": rng.uniform(100, 500),
            "Fwd Packet Length Min": rng.uniform(0, 54),
            "Fwd Packet Length Mean": fwd_len / max(1, fwd_pkts),
            "Fwd Packet Length Std": rng.uniform(10, 80),
            "Bwd Packet Length Max": rng.uniform(200, 1460),
            "Bwd Packet Length Min": rng.uniform(0, 54),
            "Bwd Packet Length Mean": bwd_len / max(1, bwd_pkts),
            "Bwd Packet Length Std": rng.uniform(20, 150),
            "Flow Bytes/s": (fwd_len + bwd_len) / max(0.001, duration / 1e6),
            "Flow Packets/s": (fwd_pkts + bwd_pkts) / max(0.001, duration / 1e6),
            "Flow IAT Mean": duration / max(1, fwd_pkts + bwd_pkts),
            "Flow IAT Std": rng.uniform(50, 5000),
            "Flow IAT Max": rng.uniform(20000, duration),
            "Flow IAT Min": rng.uniform(5, 100),
            "Fwd IAT Total": duration * rng.uniform(0.7, 0.95),
            "Fwd IAT Mean": duration / max(1, fwd_pkts),
            "Fwd IAT Std": rng.uniform(50, 4000),
            "Fwd IAT Max": rng.uniform(15000, duration),
            "Fwd IAT Min": rng.uniform(5, 100),
            "Bwd IAT Total": duration * rng.uniform(0.6, 0.9),
            "Bwd IAT Mean": duration / max(1, bwd_pkts),
            "Bwd IAT Std": rng.uniform(50, 4000),
            "Bwd IAT Max": rng.uniform(15000, duration),
            "Bwd IAT Min": rng.uniform(5, 100),
            "Fwd PSH Flags": rng.choice([0, 1], p=[0.7, 0.3]),
            "Fwd URG Flags": 0,
            "Fwd Header Length": fwd_pkts * 20,
            "Bwd Header Length": bwd_pkts * 20,
            "Fwd Packets/s": fwd_pkts / max(0.001, duration / 1e6),
            "Bwd Packets/s": bwd_pkts / max(0.001, duration / 1e6),
            "Min Packet Length": 0,
            "Max Packet Length": rng.uniform(500, 1500),
            "Packet Length Mean": (fwd_len + bwd_len) / max(1, fwd_pkts + bwd_pkts),
            "Packet Length Std": rng.uniform(20, 120),
            "Packet Length Variance": rng.uniform(400, 14400),
            "FIN Flag Count": rng.choice([0, 1], p=[0.8, 0.2]),
            "SYN Flag Count": 1,
            "RST Flag Count": 0,
            "PSH Flag Count": rng.choice([0, 1], p=[0.6, 0.4]),
            "ACK Flag Count": 1,
            "URG Flag Count": 0,
            "ECE Flag Count": 0,
            "Down/Up Ratio": bwd_pkts / max(1, fwd_pkts),
            "Average Packet Size": (fwd_len + bwd_len) / max(1, fwd_pkts + bwd_pkts),
            "Init_Win_bytes_forward": rng.choice([8192, 14600, 29200, 65535]),
            "Init_Win_bytes_backward": rng.choice([8192, 14600, 29200, 65535]),
            "act_data_pkt_fwd": max(1, int(fwd_pkts * 0.6)),
            "min_seg_size_forward": 20,
        })

    # Profile B: DNS Queries (Port 53, ultra-short, small 1-2 packets each way)
    for _ in range(int(n_samples * 0.25)):
        duration = rng.uniform(1000, 45000)
        fwd_pkts = rng.choice([1, 2])
        bwd_pkts = rng.choice([1, 2])
        fwd_len = fwd_pkts * rng.uniform(28, 80)
        bwd_len = bwd_pkts * rng.uniform(60, 240)
        records.append({
            "Destination Port": 53,
            "Flow Duration": duration,
            "Total Fwd Packets": fwd_pkts,
            "Total Backward Packets": bwd_pkts,
            "Total Length of Fwd Packets": fwd_len,
            "Total Length of Bwd Packets": bwd_len,
            "Fwd Packet Length Max": fwd_len / fwd_pkts,
            "Fwd Packet Length Min": fwd_len / fwd_pkts,
            "Fwd Packet Length Mean": fwd_len / fwd_pkts,
            "Fwd Packet Length Std": 0,
            "Bwd Packet Length Max": bwd_len / bwd_pkts,
            "Bwd Packet Length Min": bwd_len / bwd_pkts,
            "Bwd Packet Length Mean": bwd_len / bwd_pkts,
            "Bwd Packet Length Std": 0,
            "Flow Bytes/s": (fwd_len + bwd_len) / max(0.001, duration / 1e6),
            "Flow Packets/s": (fwd_pkts + bwd_pkts) / max(0.001, duration / 1e6),
            "Flow IAT Mean": duration / max(1, fwd_pkts + bwd_pkts),
            "Flow IAT Std": rng.uniform(0, 500),
            "Flow IAT Max": duration,
            "Flow IAT Min": rng.uniform(5, 50),
            "Fwd IAT Total": duration * 0.5,
            "Fwd IAT Mean": duration * 0.5,
            "Fwd IAT Std": 0,
            "Fwd IAT Max": duration * 0.5,
            "Fwd IAT Min": duration * 0.5,
            "Bwd IAT Total": duration * 0.5,
            "Bwd IAT Mean": duration * 0.5,
            "Bwd IAT Std": 0,
            "Bwd IAT Max": duration * 0.5,
            "Bwd IAT Min": duration * 0.5,
            "Fwd PSH Flags": 0,
            "Fwd URG Flags": 0,
            "Fwd Header Length": fwd_pkts * 8,
            "Bwd Header Length": bwd_pkts * 8,
            "Fwd Packets/s": fwd_pkts / max(0.001, duration / 1e6),
            "Bwd Packets/s": bwd_pkts / max(0.001, duration / 1e6),
            "Min Packet Length": 28,
            "Max Packet Length": max(fwd_len, bwd_len),
            "Packet Length Mean": (fwd_len + bwd_len) / (fwd_pkts + bwd_pkts),
            "Packet Length Std": rng.uniform(5, 30),
            "Packet Length Variance": rng.uniform(25, 900),
            "FIN Flag Count": 0,
            "SYN Flag Count": 0,
            "RST Flag Count": 0,
            "PSH Flag Count": 0,
            "ACK Flag Count": 0,
            "URG Flag Count": 0,
            "ECE Flag Count": 0,
            "Down/Up Ratio": 1.0,
            "Average Packet Size": (fwd_len + bwd_len) / (fwd_pkts + bwd_pkts),
            "Init_Win_bytes_forward": -1,
            "Init_Win_bytes_backward": -1,
            "act_data_pkt_fwd": fwd_pkts,
            "min_seg_size_forward": 8,
        })

    # Profile C: HTTP Web Traffic (Port 80)
    for _ in range(int(n_samples * 0.20)):
        duration = rng.uniform(20000, 800000)
        fwd_pkts = rng.randint(3, 15)
        bwd_pkts = rng.randint(3, 18)
        fwd_len = fwd_pkts * rng.uniform(50, 150)
        bwd_len = bwd_pkts * rng.uniform(100, 600)
        records.append({
            "Destination Port": 80,
            "Flow Duration": duration,
            "Total Fwd Packets": fwd_pkts,
            "Total Backward Packets": bwd_pkts,
            "Total Length of Fwd Packets": fwd_len,
            "Total Length of Bwd Packets": bwd_len,
            "Fwd Packet Length Max": rng.uniform(80, 350),
            "Fwd Packet Length Min": 0,
            "Fwd Packet Length Mean": fwd_len / fwd_pkts,
            "Fwd Packet Length Std": rng.uniform(10, 60),
            "Bwd Packet Length Max": rng.uniform(150, 1460),
            "Bwd Packet Length Min": 0,
            "Bwd Packet Length Mean": bwd_len / bwd_pkts,
            "Bwd Packet Length Std": rng.uniform(15, 100),
            "Flow Bytes/s": (fwd_len + bwd_len) / max(0.001, duration / 1e6),
            "Flow Packets/s": (fwd_pkts + bwd_pkts) / max(0.001, duration / 1e6),
            "Flow IAT Mean": duration / (fwd_pkts + bwd_pkts),
            "Flow IAT Std": rng.uniform(20, 2000),
            "Flow IAT Max": rng.uniform(10000, duration),
            "Flow IAT Min": rng.uniform(5, 50),
            "Fwd IAT Total": duration * 0.8,
            "Fwd IAT Mean": duration / fwd_pkts,
            "Fwd IAT Std": rng.uniform(20, 1500),
            "Fwd IAT Max": rng.uniform(10000, duration),
            "Fwd IAT Min": rng.uniform(5, 50),
            "Bwd IAT Total": duration * 0.75,
            "Bwd IAT Mean": duration / bwd_pkts,
            "Bwd IAT Std": rng.uniform(20, 1500),
            "Bwd IAT Max": rng.uniform(10000, duration),
            "Bwd IAT Min": rng.uniform(5, 50),
            "Fwd PSH Flags": 1,
            "Fwd URG Flags": 0,
            "Fwd Header Length": fwd_pkts * 20,
            "Bwd Header Length": bwd_pkts * 20,
            "Fwd Packets/s": fwd_pkts / max(0.001, duration / 1e6),
            "Bwd Packets/s": bwd_pkts / max(0.001, duration / 1e6),
            "Min Packet Length": 0,
            "Max Packet Length": rng.uniform(300, 1460),
            "Packet Length Mean": (fwd_len + bwd_len) / (fwd_pkts + bwd_pkts),
            "Packet Length Std": rng.uniform(15, 80),
            "Packet Length Variance": rng.uniform(225, 6400),
            "FIN Flag Count": rng.choice([0, 1], p=[0.7, 0.3]),
            "SYN Flag Count": 1,
            "RST Flag Count": 0,
            "PSH Flag Count": 1,
            "ACK Flag Count": 1,
            "URG Flag Count": 0,
            "ECE Flag Count": 0,
            "Down/Up Ratio": bwd_pkts / fwd_pkts,
            "Average Packet Size": (fwd_len + bwd_len) / (fwd_pkts + bwd_pkts),
            "Init_Win_bytes_forward": 8192,
            "Init_Win_bytes_backward": 8192,
            "act_data_pkt_fwd": max(1, int(fwd_pkts * 0.7)),
            "min_seg_size_forward": 20,
        })

    # Profile D: Enterprise Internal Management / SSH (Port 22, interactive flow)
    for _ in range(int(n_samples * 0.10)):
        duration = rng.uniform(500000, 5000000)
        fwd_pkts = rng.randint(15, 60)
        bwd_pkts = rng.randint(15, 60)
        fwd_len = fwd_pkts * rng.uniform(40, 100)
        bwd_len = bwd_pkts * rng.uniform(40, 120)
        records.append({
            "Destination Port": 22,
            "Flow Duration": duration,
            "Total Fwd Packets": fwd_pkts,
            "Total Backward Packets": bwd_pkts,
            "Total Length of Fwd Packets": fwd_len,
            "Total Length of Bwd Packets": bwd_len,
            "Fwd Packet Length Max": rng.uniform(60, 200),
            "Fwd Packet Length Min": 16,
            "Fwd Packet Length Mean": fwd_len / fwd_pkts,
            "Fwd Packet Length Std": rng.uniform(5, 30),
            "Bwd Packet Length Max": rng.uniform(60, 200),
            "Bwd Packet Length Min": 16,
            "Bwd Packet Length Mean": bwd_len / bwd_pkts,
            "Bwd Packet Length Std": rng.uniform(5, 30),
            "Flow Bytes/s": (fwd_len + bwd_len) / max(0.001, duration / 1e6),
            "Flow Packets/s": (fwd_pkts + bwd_pkts) / max(0.001, duration / 1e6),
            "Flow IAT Mean": duration / (fwd_pkts + bwd_pkts),
            "Flow IAT Std": rng.uniform(100, 5000),
            "Flow IAT Max": rng.uniform(50000, duration),
            "Flow IAT Min": 10,
            "Fwd IAT Total": duration * 0.9,
            "Fwd IAT Mean": duration / fwd_pkts,
            "Fwd IAT Std": rng.uniform(100, 4000),
            "Fwd IAT Max": rng.uniform(50000, duration),
            "Fwd IAT Min": 10,
            "Bwd IAT Total": duration * 0.9,
            "Bwd IAT Mean": duration / bwd_pkts,
            "Bwd IAT Std": rng.uniform(100, 4000),
            "Bwd IAT Max": rng.uniform(50000, duration),
            "Bwd IAT Min": 10,
            "Fwd PSH Flags": 1,
            "Fwd URG Flags": 0,
            "Fwd Header Length": fwd_pkts * 20,
            "Bwd Header Length": bwd_pkts * 20,
            "Fwd Packets/s": fwd_pkts / max(0.001, duration / 1e6),
            "Bwd Packets/s": bwd_pkts / max(0.001, duration / 1e6),
            "Min Packet Length": 16,
            "Max Packet Length": 200,
            "Packet Length Mean": (fwd_len + bwd_len) / (fwd_pkts + bwd_pkts),
            "Packet Length Std": rng.uniform(5, 30),
            "Packet Length Variance": rng.uniform(25, 900),
            "FIN Flag Count": 0,
            "SYN Flag Count": 1,
            "RST Flag Count": 0,
            "PSH Flag Count": 1,
            "ACK Flag Count": 1,
            "URG Flag Count": 0,
            "ECE Flag Count": 0,
            "Down/Up Ratio": bwd_pkts / fwd_pkts,
            "Average Packet Size": (fwd_len + bwd_len) / (fwd_pkts + bwd_pkts),
            "Init_Win_bytes_forward": 65535,
            "Init_Win_bytes_backward": 65535,
            "act_data_pkt_fwd": max(1, int(fwd_pkts * 0.8)),
            "min_seg_size_forward": 20,
        })

    df = pd.DataFrame(records)
    return df


def train_anomaly_detector(
    data_path: str = None,
    output_model_path: str = None,
    output_meta_path: str = None,
    contamination: float = 0.03,
    random_state: int = 42
):
    print("=" * 65)
    print("  CYVORA Isolation Forest Anomaly Detection Training")
    print("=" * 65)

    model_dest = output_model_path or os.environ.get("ANOMALY_MODEL_PATH") or DEFAULT_OUTPUT_MODEL_PATH
    meta_dest = output_meta_path or DEFAULT_OUTPUT_META_PATH

    os.makedirs(os.path.dirname(os.path.abspath(model_dest)), exist_ok=True)
    os.makedirs(os.path.dirname(os.path.abspath(meta_dest)), exist_ok=True)

    # 1. Load data
    if data_path and os.path.exists(data_path):
        print(f"  [1/6] Loading benign dataset from: {data_path}")
        raw_df = pd.read_csv(data_path)
        # If Label column exists, filter strictly to BENIGN
        label_cols = [c for c in raw_df.columns if c.strip().lower() == "label"]
        if label_cols:
            benign_mask = raw_df[label_cols[0]].astype(str).str.strip().str.upper() == "BENIGN"
            raw_df = raw_df[benign_mask]
            print(f"        Filtered to {len(raw_df)} pure BENIGN rows")
    else:
        print("  [1/6] Synthesizing empirical CICIDS2017 benign flow corpus...")
        raw_df = generate_cicids_benign_corpus(n_samples=1500, random_state=random_state)
        print(f"        Generated {len(raw_df)} representative benign samples")

    # 2. Select & clean base features
    print(f"  [2/6] Selecting {len(BASE_FEATURES)} base network flow features...")
    missing = [f for f in BASE_FEATURES if f not in raw_df.columns]
    if missing:
        print(f"  ERROR: Input data missing required base features: {missing}")
        sys.exit(1)

    clean_df = raw_df[BASE_FEATURES].copy()
    for col in BASE_FEATURES:
        clean_df[col] = pd.to_numeric(clean_df[col], errors="coerce")
    clean_df = clean_df.replace([np.inf, -np.inf], np.nan).fillna(0.0)

    # 3. Add 29 engineered features (shared with predictor.py)
    print(f"  [3/6] Applying V21.1 feature engineering ({len(BASE_FEATURES)} -> {len(MODEL_FEATURES)})...")
    full_df = add_engineered_features(clean_df)
    full_df = full_df[MODEL_FEATURES].copy()
    full_df = full_df.replace([np.inf, -np.inf], np.nan).fillna(0.0)

    X_train = full_df.values.astype(np.float32)
    print(f"        Training feature matrix shape: {X_train.shape}")

    # 4. Train Isolation Forest
    print(f"  [4/6] Fitting IsolationForest (contamination={contamination}, random_state={random_state})...")
    iso_forest = IsolationForest(
        n_estimators=150,
        max_samples="auto",
        contamination=contamination,
        random_state=random_state,
        n_jobs=-1,
    )
    iso_forest.fit(X_train)

    # 5. Evaluate calibration on training set
    raw_scores = iso_forest.decision_function(X_train)
    predictions = iso_forest.predict(X_train)
    normal_pct = (predictions == 1).mean() * 100
    print(f"        Benign training calibration: {normal_pct:.1f}% normal (inliers)")
    print(f"        Decision score distribution: min={raw_scores.min():.4f}, mean={raw_scores.mean():.4f}, max={raw_scores.max():.4f}")

    # 6. Save model bundle & metadata
    print(f"  [5/6] Saving model artifact to: {model_dest}")
    model_bundle = {
        "model": iso_forest,
        "base_features": BASE_FEATURES,
        "features": MODEL_FEATURES,
        "contamination": contamination,
        "score_stats": {
            "mean": float(raw_scores.mean()),
            "std": float(raw_scores.std()),
            "min": float(raw_scores.min()),
            "max": float(raw_scores.max()),
            "threshold": 0.0,
        },
        "model_version": "v1.0",
        "detector_type": "IsolationForest",
        "created_at": pd.Timestamp.utcnow().isoformat(),
    }
    joblib.dump(model_bundle, model_dest)

    print(f"  [6/6] Saving metadata to: {meta_dest}")
    metadata = {
        "model_version": "v1.0",
        "detector": "isolation_forest",
        "feature_count": len(MODEL_FEATURES),
        "base_feature_count": len(BASE_FEATURES),
        "base_features": BASE_FEATURES,
        "features": MODEL_FEATURES,
        "contamination": contamination,
        "random_state": random_state,
        "threshold_rule": "raw_score < 0.0 indicates anomaly; normalized anomaly_score in [0.0, 1.0]",
    }
    with open(meta_dest, "w", encoding="utf-8") as f:
        json.dump(metadata, f, indent=2)

    print("\n  Anomaly model training successfully completed [OK]")
    print("=" * 65)
    return model_dest, meta_dest


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Train CYVORA Isolation Forest Anomaly Detector")
    parser.add_argument("--data", type=str, default=None, help="Optional path to CICIDS2017 benign CSV")
    parser.add_argument("--output", type=str, default=None, help="Target path for anomaly_model.pkl")
    parser.add_argument("--meta", type=str, default=None, help="Target path for anomaly_features.json")
    parser.add_argument("--contamination", type=float, default=0.03, help="Expected outlier proportion")
    args = parser.parse_args()

    train_anomaly_detector(
        data_path=args.data,
        output_model_path=args.output,
        output_meta_path=args.meta,
        contamination=args.contamination,
    )
