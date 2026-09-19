"""
CYVORA — Context Analysis & Risk Engine
========================================
Implements deterministic context analysis and false-positive reduction:
  1. Integrates supervised classifier evidence, Isolation Forest anomaly score,
     and bounded historical source telemetry (recent event, anomaly, and attack counts).
  2. Applies transparent weighted combination:
       risk_score = W_threat * ThreatEvidence
                  + W_anomaly * AnomalyEvidence
                  + W_context * ContextEvidence
     Clamped to [0.0, 1.0].
  3. Evaluates explicit false-positive indicators (e.g. isolated statistical anomaly
     on benign flow with clean source history) to prevent premature escalation.
  4. Core Principle: ANOMALY != ATTACK. An anomaly score deviation by itself is
     not assumed to be an attack; it is triaged alongside context.

Note: The output is a deterministic heuristic composite risk score for alert
prioritization and monitoring; it does not claim to be a scientifically validated probability.
"""

import os
import logging
from typing import Dict, Any, List

logger = logging.getLogger("cyvora.risk_engine")

# ------------------------------------------------------------------ #
# CONFIGURABLE WEIGHTS & THRESHOLDS                                   #
# ------------------------------------------------------------------ #
# Starting point: 40% threat evidence, 35% anomaly indication, 25% behavioral context
WEIGHT_THREAT = float(os.getenv("CYVORA_WEIGHT_THREAT", "0.40"))
WEIGHT_ANOMALY = float(os.getenv("CYVORA_WEIGHT_ANOMALY", "0.35"))
WEIGHT_CONTEXT = float(os.getenv("CYVORA_WEIGHT_CONTEXT", "0.25"))

# Normalize weights so they strictly sum to 1.0
_TOTAL_WEIGHT = WEIGHT_THREAT + WEIGHT_ANOMALY + WEIGHT_CONTEXT
if _TOTAL_WEIGHT > 0:
    W_THREAT = WEIGHT_THREAT / _TOTAL_WEIGHT
    W_ANOMALY = WEIGHT_ANOMALY / _TOTAL_WEIGHT
    W_CONTEXT = WEIGHT_CONTEXT / _TOTAL_WEIGHT
else:
    W_THREAT, W_ANOMALY, W_CONTEXT = 0.40, 0.35, 0.25

# Time window for historical context queries (minutes)
CONTEXT_WINDOW_MINUTES = int(os.getenv("CYVORA_CONTEXT_WINDOW_MINUTES", "10"))
CONTEXT_RECENT_EVENT_LIMIT = int(os.getenv("CYVORA_CONTEXT_RECENT_EVENT_LIMIT", "50"))

# Risk Level Classification Thresholds
RISK_THRESHOLD_MEDIUM = float(os.getenv("CYVORA_RISK_MEDIUM", "0.30"))
RISK_THRESHOLD_HIGH = float(os.getenv("CYVORA_RISK_HIGH", "0.60"))
RISK_THRESHOLD_CRITICAL = float(os.getenv("CYVORA_RISK_CRITICAL", "0.85"))


def assess_risk(
    prediction_result: Dict[str, Any],
    anomaly_result: Dict[str, Any],
    context_data: Dict[str, Any],
) -> Dict[str, Any]:
    """
    Computes a transparent composite risk score, risk level, and reasons.

    Args:
      prediction_result: Output from predict_attack (is_attack, confidence, prediction, severity)
      anomaly_result: Output from detect_anomaly (anomaly_score, is_anomalous, detector)
      context_data: Output from get_source_context (recent_event_count, recent_anomaly_count, recent_attack_count)

    Returns:
      {
        "risk_score": float,  # 0.0 to 1.0
        "risk_level": "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
        "reasons": List[str],
        "false_positive_indicators": List[str],
        "context": Dict[str, Any],
      }
    """
    reasons: List[str] = []
    fp_indicators: List[str] = []

    # --------------------------------------------------------------
    # 1. Extract Signals
    # --------------------------------------------------------------
    is_attack = bool(prediction_result.get("is_attack", False))
    prediction_label = str(prediction_result.get("prediction", "BENIGN"))
    confidence = float(prediction_result.get("confidence", 0.0) or 0.0)
    confidence = max(0.0, min(1.0, confidence))

    anomaly_score = float(anomaly_result.get("anomaly_score", 0.0) or 0.0)
    anomaly_score = max(0.0, min(1.0, anomaly_score))
    is_anomalous = bool(anomaly_result.get("is_anomalous", False))

    recent_events = int(context_data.get("recent_event_count", 0) or 0)
    recent_anomalies = int(context_data.get("recent_anomaly_count", 0) or 0)
    recent_attacks = int(context_data.get("recent_attack_count", 0) or 0)
    is_blocked = bool(context_data.get("is_source_blocked", False))
    is_rate_limited = bool(context_data.get("is_source_rate_limited", False))
    window_min = int(context_data.get("window_minutes", CONTEXT_WINDOW_MINUTES))

    # --------------------------------------------------------------
    # 2. Compute Individual Evidence Contributions
    # --------------------------------------------------------------

    # A. Threat Evidence (0.0 to 1.0)
    if is_attack:
        threat_evidence = confidence
        reasons.append(
            f"Supervised classifier detected '{prediction_label}' with confidence {confidence * 100:.1f}%."
        )
    else:
        # Benign flow: threat evidence is minimal
        threat_evidence = max(0.0, (1.0 - confidence) * 0.10)
        reasons.append(
            f"Supervised classifier classified traffic as BENIGN ({confidence * 100:.1f}% confidence)."
        )

    # B. Anomaly Evidence (0.0 to 1.0)
    anomaly_evidence = anomaly_score
    if anomaly_score >= 0.60:
        reasons.append(
            f"Isolation Forest observed significant statistical deviation from normal traffic (anomaly score={anomaly_score:.3f})."
        )
    elif anomaly_score >= 0.50:
        reasons.append(
            f"Isolation Forest flagged borderline anomaly (score={anomaly_score:.3f})."
        )
    else:
        reasons.append(
            f"Isolation Forest confirmed traffic aligns with normal benign baseline (score={anomaly_score:.3f})."
        )

    # C. Behavioral Context Evidence (0.0 to 1.0)
    # Scales: 3+ attacks or anomalies in 10m indicate high persistence
    attack_ratio = min(1.0, recent_attacks / 3.0)
    anomaly_ratio = min(1.0, recent_anomalies / 4.0)
    burst_ratio = min(1.0, recent_events / 20.0)
    status_penalty = 0.40 if (is_blocked or is_rate_limited) else 0.0

    context_evidence = min(
        1.0,
        (0.45 * attack_ratio) + (0.35 * anomaly_ratio) + (0.10 * burst_ratio) + (0.10 * status_penalty)
    )

    if recent_attacks > 0:
        reasons.append(
            f"Source has {recent_attacks} recorded attack flow(s) in the last {window_min} minutes."
        )
    if recent_anomalies > 1:
        reasons.append(
            f"Source shows recurring abnormal telemetry ({recent_anomalies} anomalies in {window_min}m)."
        )
    if is_blocked:
        reasons.append("Source is currently BLOCKED by enforcement engine.")
    elif is_rate_limited:
        reasons.append("Source is currently RATE_LIMITED by enforcement engine.")

    # --------------------------------------------------------------
    # 3. Weighted Raw Composite Score
    # --------------------------------------------------------------
    raw_risk = (
        (W_THREAT * threat_evidence)
        + (W_ANOMALY * anomaly_evidence)
        + (W_CONTEXT * context_evidence)
    )

    # Clamp raw risk to [0.0, 1.0]
    risk_score = max(0.0, min(1.0, raw_risk))

    # --------------------------------------------------------------
    # 4. Explicit False-Positive Reduction Logic
    # --------------------------------------------------------------

    # Case A: Isolated anomaly on benign traffic
    # High anomaly, but classifier is confident BENIGN and source has no attack history
    if not is_attack and anomaly_score >= 0.50 and recent_attacks == 0 and recent_anomalies <= 1:
        fp_indicators.append(
            "ISOLATED_BENIGN_ANOMALY: High statistical anomaly observed on traffic classified as BENIGN "
            "with zero prior attack history for this source."
        )
        # Moderate risk to prevent over-escalation (clamp below HIGH boundary)
        risk_score = min(risk_score * 0.65, 0.45)
        reasons.append(
            "Risk tempered by clean source telemetry and high-confidence benign classification (false-positive reduction applied)."
        )

    # Case B: Clean source with completely normal traffic
    elif not is_attack and anomaly_score < 0.50 and recent_attacks == 0:
        fp_indicators.append("NORMAL_TRAFFIC_CONCURRENCE: Classifier and Isolation Forest both indicate normal flow.")
        risk_score = min(risk_score, 0.20)

    # Case C: Confirmed attack corroboration
    elif is_attack and recent_attacks >= 1:
        reasons.append("Repeated hostile flows confirm malicious source pattern.")
        risk_score = min(1.0, max(risk_score, 0.75))

    # Final clamp guarantees 0.0 <= risk_score <= 1.0
    risk_score = round(max(0.0, min(1.0, risk_score)), 4)

    # --------------------------------------------------------------
    # 5. Risk Level Assignment
    # --------------------------------------------------------------
    if risk_score >= RISK_THRESHOLD_CRITICAL:
        risk_level = "CRITICAL"
    elif risk_score >= RISK_THRESHOLD_HIGH:
        risk_level = "HIGH"
    elif risk_score >= RISK_THRESHOLD_MEDIUM:
        risk_level = "MEDIUM"
    else:
        risk_level = "LOW"

    return {
        "risk_score": risk_score,
        "risk_level": risk_level,
        "reasons": reasons,
        "false_positive_indicators": fp_indicators,
        "context": {
            "source_id": context_data.get("source_id", "unknown"),
            "window_minutes": window_min,
            "recent_event_count": recent_events,
            "recent_anomaly_count": recent_anomalies,
            "recent_attack_count": recent_attacks,
            "recent_actions": context_data.get("recent_actions", []),
            "is_source_blocked": is_blocked,
            "is_source_rate_limited": is_rate_limited,
        },
    }
