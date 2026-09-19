import time
from datetime import datetime
from threading import Lock


# ============================================================
# CYVORA V21.1 - PREVENTION ENGINE
# ============================================================
# API-Level Prevention / Enforcement
#
# ALLOW       -> Traffic allowed
# ALERT       -> Traffic monitored
# RATE_LIMIT  -> Source temporarily restricted
# BLOCK       -> Source temporarily blocked
# ============================================================


BLOCK_DURATION = 300
RATE_LIMIT_DURATION = 120


blocked_sources = {}
rate_limited_sources = {}

_lock = Lock()


# ============================================================
# CLEAN EXPIRED ENTRIES
# ============================================================

def _cleanup_expired():

    current_time = time.time()

    expired_blocked = [
        source_id
        for source_id, expiry in blocked_sources.items()
        if expiry <= current_time
    ]

    for source_id in expired_blocked:
        del blocked_sources[source_id]


    expired_rate_limited = [
        source_id
        for source_id, expiry in rate_limited_sources.items()
        if expiry <= current_time
    ]

    for source_id in expired_rate_limited:
        del rate_limited_sources[source_id]


# ============================================================
# CHECK SOURCE STATUS
# ============================================================

def get_source_status(source_id: str):

    with _lock:

        _cleanup_expired()

        if source_id in blocked_sources:
            return "BLOCKED"

        if source_id in rate_limited_sources:
            return "RATE_LIMITED"

        return "ALLOWED"


# ============================================================
# ENFORCE RESPONSE ACTION
# ============================================================

def enforce_action(
    action: str,
    source_id: str = "unknown"
):

    action = str(action).upper()

    current_time = time.time()

    with _lock:

        _cleanup_expired()

        # ----------------------------------------------------
        # ALLOW
        # ----------------------------------------------------

        if action == "ALLOW":

            return {
                "enforced": True,
                "action": "ALLOW",
                "status": "TRAFFIC_ALLOWED",
                "source_id": source_id,
                "message": "Traffic allowed",
                "timestamp": datetime.now().isoformat()
            }


        # ----------------------------------------------------
        # ALERT
        # ----------------------------------------------------

        if action == "ALERT":

            return {
                "enforced": True,
                "action": "ALERT",
                "status": "TRAFFIC_MONITORED",
                "source_id": source_id,
                "message": "Suspicious traffic monitored",
                "timestamp": datetime.now().isoformat()
            }


        # ----------------------------------------------------
        # RATE LIMIT
        # ----------------------------------------------------

        if action == "RATE_LIMIT":

            rate_limited_sources[source_id] = (
                current_time + RATE_LIMIT_DURATION
            )

            return {
                "enforced": True,
                "action": "RATE_LIMIT",
                "status": "TRAFFIC_RATE_LIMITED",
                "source_id": source_id,
                "duration_seconds": RATE_LIMIT_DURATION,
                "message": "Source temporarily rate limited",
                "timestamp": datetime.now().isoformat()
            }


        # ----------------------------------------------------
        # BLOCK
        # ----------------------------------------------------

        if action == "BLOCK":

            blocked_sources[source_id] = (
                current_time + BLOCK_DURATION
            )

            # Remove rate limit if source becomes blocked
            rate_limited_sources.pop(
                source_id,
                None
            )

            return {
                "enforced": True,
                "action": "BLOCK",
                "status": "ATTACK_BLOCKED",
                "source_id": source_id,
                "duration_seconds": BLOCK_DURATION,
                "message": "Malicious source temporarily blocked",
                "timestamp": datetime.now().isoformat()
            }


        # ----------------------------------------------------
        # INVALID ACTION
        # ----------------------------------------------------

        return {
            "enforced": False,
            "action": action,
            "status": "INVALID_ACTION",
            "source_id": source_id,
            "message": "Unknown prevention action",
            "timestamp": datetime.now().isoformat()
        }


# ============================================================
# PREVENTION STATUS
# ============================================================

def prevention_status():

    with _lock:

        _cleanup_expired()

        return {
            "status": "active",
            "blocked_sources": len(
                blocked_sources
            ),
            "rate_limited_sources": len(
                rate_limited_sources
            ),
            "block_duration_seconds":
                BLOCK_DURATION,
            "rate_limit_duration_seconds":
                RATE_LIMIT_DURATION
        }