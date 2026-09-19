from datetime import datetime
import time

from backend.app.prevention_engine import (
    enforce_action,
    get_source_status
)


# ============================================================
# CYVORA V21.1 - CONFIDENCE AWARE RESPONSE ENGINE
# + PREVENTION ENFORCEMENT
# ============================================================

BLOCK_THRESHOLD = 0.90
RATE_LIMIT_THRESHOLD = 0.70


# ============================================================
# RESPONSE PROCESSING
# ============================================================

def process_response(
    prediction_result,
    source_id="unknown"
):

    prediction = prediction_result.get(
        "prediction",
        "UNKNOWN"
    )

    confidence = float(
        prediction_result.get(
            "confidence",
            0.0
        )
    )

    is_attack = bool(
        prediction_result.get(
            "is_attack",
            False
        )
    )

    severity = prediction_result.get(
        "severity",
        "LOW"
    )

    # ========================================================
    # 1. CHECK EXISTING PREVENTION STATUS
    # ========================================================

    existing_status = get_source_status(
        source_id
    )

    if existing_status == "BLOCKED":

        action = "BLOCK"

        prevention_result = enforce_action(
            action,
            source_id
        )

        return {
            "response_action": action,
            "response_status": "ATTACK_BLOCKED",
            "reason": "Source is already blocked",
            "prediction": prediction,
            "confidence": round(
                confidence,
                6
            ),
            "severity": severity,
            "source_id": source_id,
            "prevention": prevention_result,
            "timestamp": datetime.now().isoformat()
        }


    if existing_status == "RATE_LIMITED":

        action = "RATE_LIMIT"

        prevention_result = enforce_action(
            action,
            source_id
        )

        return {
            "response_action": action,
            "response_status": "TRAFFIC_RATE_LIMITED",
            "reason": "Source is currently rate limited",
            "prediction": prediction,
            "confidence": round(
                confidence,
                6
            ),
            "severity": severity,
            "source_id": source_id,
            "prevention": prevention_result,
            "timestamp": datetime.now().isoformat()
        }


    # ========================================================
    # 2. BENIGN TRAFFIC
    # ========================================================

    if not is_attack:

        action = "ALLOW"

        prevention_result = enforce_action(
            action,
            source_id
        )

        return {
            "response_action": action,
            "response_status": "TRAFFIC_ALLOWED",
            "reason": "Benign traffic detected",
            "prediction": prediction,
            "confidence": round(
                confidence,
                6
            ),
            "severity": severity,
            "source_id": source_id,
            "prevention": prevention_result,
            "timestamp": datetime.now().isoformat()
        }


    # ========================================================
    # 3. HIGH CONFIDENCE ATTACK
    # ========================================================

    if confidence >= BLOCK_THRESHOLD:

        action = "BLOCK"

        prevention_result = enforce_action(
            action,
            source_id
        )

        return {
            "response_action": action,
            "response_status": "ATTACK_BLOCKED",
            "reason": "High-confidence malicious traffic",
            "prediction": prediction,
            "confidence": round(
                confidence,
                6
            ),
            "severity": severity,
            "source_id": source_id,
            "block_duration_seconds": 300,
            "prevention": prevention_result,
            "timestamp": datetime.now().isoformat()
        }


    # ========================================================
    # 4. MEDIUM CONFIDENCE ATTACK
    # ========================================================

    if confidence >= RATE_LIMIT_THRESHOLD:

        action = "RATE_LIMIT"

        prevention_result = enforce_action(
            action,
            source_id
        )

        return {
            "response_action": action,
            "response_status": "TRAFFIC_RATE_LIMITED",
            "reason": "Medium-confidence suspicious traffic",
            "prediction": prediction,
            "confidence": round(
                confidence,
                6
            ),
            "severity": severity,
            "source_id": source_id,
            "rate_limit_duration_seconds": 120,
            "prevention": prevention_result,
            "timestamp": datetime.now().isoformat()
        }


    # ========================================================
    # 5. LOW CONFIDENCE ATTACK
    # ========================================================

    action = "ALERT"

    prevention_result = enforce_action(
        action,
        source_id
    )

    return {
        "response_action": action,
        "response_status": "SUSPICIOUS_TRAFFIC_ALERT",
        "reason": "Low-confidence attack prediction; monitoring only",
        "prediction": prediction,
        "confidence": round(
            confidence,
            6
        ),
        "severity": severity,
        "source_id": source_id,
        "prevention": prevention_result,
        "timestamp": datetime.now().isoformat()
    }


# ============================================================
# RESPONSE STATUS
# ============================================================

def get_response_status(source_id):

    return get_source_status(
        source_id
    )