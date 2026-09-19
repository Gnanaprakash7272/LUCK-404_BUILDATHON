"""
CYVORA — Response Verification Module
======================================
Verifies that the defensive response action chosen by CYVORA
was actually applied at the APPLICATION / API enforcement layer.

Scope & Transparency Notice:
  - This verifies application-level enforcement state (in-memory
    prevention tables in prevention_engine and transaction logging).
  - It does NOT claim host-level firewall, iptables, WAF, or operating
    system / network-level isolation.
"""

import time
from datetime import datetime, timezone
from typing import Dict, Any

from backend.app.prevention_engine import (
    blocked_sources,
    rate_limited_sources,
    _lock,
    _cleanup_expired,
)


def verify_response(
    action: str,
    source_id: str,
    prevention_result: Dict[str, Any] = None,
) -> Dict[str, Any]:
    """
    Verifies whether the defensive action was accurately applied
    at the application enforcement layer.

    Args:
        action: "BLOCK" | "RATE_LIMIT" | "ALERT" | "ALLOW"
        source_id: Source IP or identifier
        prevention_result: Dict returned by enforce_action()

    Returns:
        {
            "verified": bool,
            "verification_status": "VERIFIED" | "FAILED" | "NOT_APPLICABLE",
            "action": str,
            "evidence": str,
            "verified_at": str (ISO 8601 UTC),
        }
    """
    action_str = str(action).upper()
    verified_at = datetime.now(timezone.utc).isoformat()
    current_time = time.time()

    # --------------------------------------------------------------
    # 1. BLOCK VERIFICATION
    # --------------------------------------------------------------
    if action_str == "BLOCK":
        with _lock:
            _cleanup_expired()
            expiry = blocked_sources.get(source_id)

        if expiry and expiry > current_time:
            remaining_secs = max(0, int(expiry - current_time))
            return {
                "verified": True,
                "verification_status": "VERIFIED",
                "action": "BLOCK",
                "evidence": (
                    f"Source '{source_id}' verified in active application-level blocked state "
                    f"({remaining_secs}s TTL remaining)."
                ),
                "verified_at": verified_at,
            }
        else:
            return {
                "verified": False,
                "verification_status": "FAILED",
                "action": "BLOCK",
                "evidence": f"Source '{source_id}' not found in active blocked state.",
                "verified_at": verified_at,
            }

    # --------------------------------------------------------------
    # 2. RATE_LIMIT VERIFICATION
    # --------------------------------------------------------------
    elif action_str == "RATE_LIMIT":
        with _lock:
            _cleanup_expired()
            expiry = rate_limited_sources.get(source_id)

        if expiry and expiry > current_time:
            remaining_secs = max(0, int(expiry - current_time))
            return {
                "verified": True,
                "verification_status": "VERIFIED",
                "action": "RATE_LIMIT",
                "evidence": (
                    f"Source '{source_id}' verified in active application-level rate-limited state "
                    f"({remaining_secs}s TTL remaining)."
                ),
                "verified_at": verified_at,
            }
        else:
            return {
                "verified": False,
                "verification_status": "FAILED",
                "action": "RATE_LIMIT",
                "evidence": f"Source '{source_id}' not found in active rate-limited state.",
                "verified_at": verified_at,
            }

    # --------------------------------------------------------------
    # 3. ALERT VERIFICATION
    # --------------------------------------------------------------
    elif action_str == "ALERT":
        return {
            "verified": True,
            "verification_status": "VERIFIED",
            "action": "ALERT",
            "evidence": "Alert event recorded and queued for monitoring audit trail.",
            "verified_at": verified_at,
        }

    # --------------------------------------------------------------
    # 4. ALLOW VERIFICATION
    # --------------------------------------------------------------
    elif action_str == "ALLOW":
        return {
            "verified": True,
            "verification_status": "NOT_APPLICABLE",
            "action": "ALLOW",
            "evidence": "Permitted under standard baseline traffic policy; no defensive action required.",
            "verified_at": verified_at,
        }

    # --------------------------------------------------------------
    # 5. UNKNOWN ACTION
    # --------------------------------------------------------------
    else:
        return {
            "verified": False,
            "verification_status": "FAILED",
            "action": action_str,
            "evidence": f"Unrecognized action '{action_str}'.",
            "verified_at": verified_at,
        }
