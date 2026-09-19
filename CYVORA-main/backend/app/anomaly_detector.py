"""
CYVORA — Anomaly & Novelty Detector (Isolation Forest)
======================================================
Provides unsupervised network-flow anomaly scoring alongside the existing
supervised attack classifier.

Architecture:
  1. Receives the same raw features as predictor.py.
  2. Uses the shared add_engineered_features transformation to ensure
     100% feature schema compatibility (83 features).
  3. Evaluates flow deviance against empirical CICIDS2017 benign baseline.
  4. Applies deterministic UNKNOWN_ANOMALOUS triage logic when a flow
     deviates from benign patterns but has no strong match to known attack signatures.
"""

import os
import logging
import joblib
import numpy as np
import pandas as pd
from typing import Dict, Any, Optional

logger = logging.getLogger("cyvora.anomaly_detector")

# Threshold configuration (configurable via environment variables)
# Anomaly score in [0.0, 1.0]. Values >= 0.50 indicate an outlier relative to benign training.
ANOMALY_THRESHOLD = float(os.environ.get("CYVORA_ANOMALY_THRESHOLD", "0.50"))
# Anomaly score >= 0.60 combined with low classifier confidence (< 0.70) triggers UNKNOWN_ANOMALOUS triage
ANOMALY_HIGH_THRESHOLD = float(os.environ.get("CYVORA_ANOMALY_HIGH_THRESHOLD", "0.60"))
CONFIDENCE_LOW_THRESHOLD = float(os.environ.get("CYVORA_CONFIDENCE_LOW_THRESHOLD", "0.70"))

# Locate model bundle
DEFAULT_MODEL_PATH = os.path.join(
    os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))),
    "models",
    "anomaly_model.pkl",
)
ALT_MODEL_PATH = r"C:\CYVORA\models\anomaly_model.pkl"

MODEL_PATH = (
    os.environ.get("ANOMALY_MODEL_PATH")
    or (DEFAULT_MODEL_PATH if os.path.exists(DEFAULT_MODEL_PATH) else ALT_MODEL_PATH)
)

_model_bundle: Optional[Dict[str, Any]] = None
_iso_forest = None
_features_list = None
_base_features_list = None
_model_version = "v1.0"
_model_loaded = False

try:
    if os.path.exists(MODEL_PATH):
        _model_bundle = joblib.load(MODEL_PATH)
        _iso_forest = _model_bundle.get("model")
        _features_list = _model_bundle.get("features")
        _base_features_list = _model_bundle.get("base_features")
        _model_version = _model_bundle.get("model_version", "v1.0")
        _model_loaded = True
        logger.info("Loaded Isolation Forest anomaly model from %s", MODEL_PATH)
    else:
        logger.warning("Anomaly model file not found at %s. Anomaly detection unavailable.", MODEL_PATH)
except Exception as exc:
    logger.error("Failed to load anomaly model from %s: %s", MODEL_PATH, exc)


def is_anomaly_detector_loaded() -> bool:
    return _model_loaded and _iso_forest is not None


def detect_anomaly(features: dict) -> dict:
    """
    Evaluates an input flow against the trained Isolation Forest benign baseline.

    Returns:
      {
        "is_anomalous": bool,
        "anomaly_score": float,       # Normalized [0.0, 1.0] (0.0 = completely normal, 1.0 = extreme anomaly)
        "raw_score": float,           # Raw decision_function score (negative = outlier, positive = inlier)
        "detector": "isolation_forest",
        "model_version": str,
        "model_loaded": bool,
      }
    """
    if not is_anomaly_detector_loaded():
        return {
            "is_anomalous": False,
            "anomaly_score": None,
            "raw_score": None,
            "detector": "isolation_forest",
            "model_version": _model_version,
            "model_loaded": False,
            "error": "Anomaly model not loaded",
        }

    from backend.app.predictor import BASE_FEATURES, MODEL_FEATURES, add_engineered_features

    # 1. Build DataFrame and ensure all 54 base features exist
    input_df = pd.DataFrame([features])
    for col in BASE_FEATURES:
        if col not in input_df.columns:
            input_df[col] = 0.0
        input_df[col] = pd.to_numeric(input_df[col], errors="coerce").fillna(0.0)

    # 2. Re-use shared V21.1 feature engineering logic (exact 83 features)
    engineered_df = add_engineered_features(input_df)
    for col in MODEL_FEATURES:
        if col not in engineered_df.columns:
            engineered_df[col] = 0.0
        engineered_df[col] = pd.to_numeric(engineered_df[col], errors="coerce").fillna(0.0)

    # Align columns strictly to MODEL_FEATURES order
    X = engineered_df[MODEL_FEATURES].values.astype(np.float32)
    X = np.nan_to_num(X, nan=0.0, posinf=1e9, neginf=-1e9)

    # 3. Predict with Isolation Forest
    # raw decision_function: positive for inliers (normal), negative for outliers (anomalous)
    raw_decision = float(_iso_forest.decision_function(X)[0])
    raw_pred = int(_iso_forest.predict(X)[0])  # 1: inlier, -1: outlier

    # Calibrate to continuous [0.0, 1.0] anomaly score where:
    #   0.0 -> deeply within benign distribution
    #   0.5 -> right at the anomaly decision boundary
    #   1.0 -> extreme statistical outlier
    # Sigmoid transformation centered at 0: 1 / (1 + exp(decision * 12))
    calibrated_score = 1.0 / (1.0 + np.exp(np.clip(raw_decision * 12.0, -50.0, 50.0)))
    calibrated_score = round(float(calibrated_score), 4)

    is_anomalous = bool(raw_pred == -1 or calibrated_score >= ANOMALY_THRESHOLD)

    return {
        "is_anomalous": is_anomalous,
        "anomaly_score": calibrated_score,
        "raw_score": round(raw_decision, 4),
        "detector": "isolation_forest",
        "model_version": _model_version,
        "model_loaded": True,
    }


def assess_novelty(prediction_result: dict, anomaly_result: dict) -> dict:
    """
    Combines supervised classifier output with unsupervised Isolation Forest
    anomaly detection using transparent deterministic triage logic:

    1. UNKNOWN_ANOMALOUS:
       Flow exhibits high anomaly deviance (anomaly_score >= ANOMALY_HIGH_THRESHOLD)
       BUT classifier confidence is low (< CONFIDENCE_LOW_THRESHOLD) or classifier
       predicted BENIGN despite anomalous characteristics.
       -> Flagged as UNKNOWN_ANOMALOUS for SOC monitoring/alert (not automatically blocked).

    2. KNOWN_ATTACK_ANOMALOUS:
       Classifier identifies a known attack family AND Isolation Forest also flags
       it as anomalous. High threat confidence.

    3. KNOWN_ATTACK:
       Classifier identifies an attack family with standard statistical profile.

    4. BENIGN_NORMAL:
       Conforms to normal benign profile with low anomaly score.
    """
    prediction = prediction_result.get("prediction", "BENIGN")
    confidence = float(prediction_result.get("confidence") or 0.0)
    is_attack = bool(prediction_result.get("is_attack", False))

    is_anomalous = bool(anomaly_result.get("is_anomalous", False))
    anomaly_score = float(anomaly_result.get("anomaly_score") or 0.0)

    # Transparent rule:
    is_anomaly_high = anomaly_score >= ANOMALY_HIGH_THRESHOLD
    is_classifier_uncertain = (confidence < CONFIDENCE_LOW_THRESHOLD) or (prediction == "BENIGN")

    if is_anomaly_high and is_classifier_uncertain:
        novelty_label = "UNKNOWN_ANOMALOUS"
        severity_override = "MEDIUM"
        action_override = "ALERT"
        recommendation = "ALERT"
        explanation = (
            f"Novel anomalous network pattern detected (anomaly_score={anomaly_score:.2f} >= {ANOMALY_HIGH_THRESHOLD}). "
            f"Unmatched to known threat signatures (confidence={confidence:.2f}). Triaged for SOC inspection."
        )
    elif is_attack and confidence >= 0.90:
        novelty_label = "KNOWN_THREAT"
        severity_override = None
        action_override = "BLOCK"
        recommendation = "BLOCK"
        explanation = f"Known attack '{prediction}' recognized by CYVORA classifier with high confidence."
    elif is_attack:
        novelty_label = "KNOWN_THREAT"
        severity_override = None
        action_override = "RATE_LIMIT"
        recommendation = "RATE_LIMIT"
        explanation = f"Known attack signature '{prediction}' recognized by CYVORA classifier."
    else:
        novelty_label = "KNOWN_BENIGN"
        severity_override = None
        action_override = "ALLOW"
        recommendation = "ALLOW"
        explanation = "Normal traffic profile matching CICIDS2017 benign baseline."

    return {
        "novelty_label": novelty_label,
        "is_anomalous": is_anomalous,
        "anomaly_score": anomaly_score,
        "severity_override": severity_override,
        "action_override": action_override,
        "recommendation": recommendation,
        "explanation": explanation,
    }


def get_anomaly_model():
    return _iso_forest


def load_anomaly_model():
    return _iso_forest


def get_anomaly_features():
    return _features_list or []

