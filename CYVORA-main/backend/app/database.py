"""
CYVORA — PostgreSQL Persistence Layer
======================================
5-table schema:
  users  →  security_events  →  predictions  →  response_actions
                           ↘                 ↗
                           audit_logs

All persistence for one /predict request goes through a single
SQLAlchemy session (one transaction). Rollback on any failure.

DATABASE_URL environment variable is the ONLY way to configure the
connection string.  No credentials are hardcoded here.
Example values:
  postgresql://user:password@localhost:5432/cyvora
  postgresql://postgres:secret@db-host:5432/cyvora_prod
"""

import logging
import os
from datetime import datetime, timezone, timedelta
from typing import Optional, Dict, Any

from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    Float,
    ForeignKey,
    Index,
    Integer,
    String,
    Text,
    create_engine,
    func,
    text,
)
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.exc import OperationalError, SQLAlchemyError
from sqlalchemy.orm import DeclarativeBase, relationship, sessionmaker

logger = logging.getLogger("cyvora.database")


# ============================================================
# ENGINE SETUP
# ============================================================

DATABASE_URL: str = os.environ.get("DATABASE_URL", "")

_engine = None
_SessionLocal = None
_db_available: bool = False
_db_error: str = ""


def _init_engine() -> None:
    """
    Attempt to create the SQLAlchemy engine and verify connectivity.
    Sets module-level _db_available flag.  Called once at startup.
    """
    global _engine, _SessionLocal, _db_available, _db_error

    if not DATABASE_URL:
        _db_available = False
        _db_error = (
            "DATABASE_URL environment variable is not set. "
            "PostgreSQL persistence is disabled."
        )
        logger.error(_db_error)
        return

    try:
        _engine = create_engine(
            DATABASE_URL,
            pool_pre_ping=True,        # validates connections before use
            pool_size=5,
            max_overflow=10,
            connect_args={"connect_timeout": 5},
        )
        # Verify actual connectivity
        with _engine.connect() as conn:
            conn.execute(text("SELECT 1"))

        _SessionLocal = sessionmaker(
            bind=_engine,
            autocommit=False,
            autoflush=False,
        )
        _db_available = True
        _db_error = ""
        logger.info("PostgreSQL connection established: %s", _masked_url())

    except OperationalError as exc:
        _db_available = False
        _db_error = f"PostgreSQL connection failed: {exc}"
        logger.error(_db_error)
    except Exception as exc:
        _db_available = False
        _db_error = f"Database initialisation error: {exc}"
        logger.error(_db_error)


def _masked_url() -> str:
    """Return DATABASE_URL with password replaced by ***."""
    try:
        from urllib.parse import urlparse, urlunparse
        parsed = urlparse(DATABASE_URL)
        if parsed.password:
            masked = parsed._replace(
                netloc=parsed.netloc.replace(
                    f":{parsed.password}@", ":***@"
                )
            )
            return urlunparse(masked)
    except Exception:
        pass
    return "<database-url>"


# ============================================================
# ORM BASE
# ============================================================

class Base(DeclarativeBase):
    pass


# ============================================================
# TABLE: users
# ============================================================

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, autoincrement=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    username = Column(String(100), nullable=True)
    password_hash = Column(String(255), nullable=True)   # bcrypt hash — NEVER plaintext
    role = Column(String(50), nullable=False, default="analyst")
    is_active = Column(Boolean, nullable=False, default=True)
    created_at = Column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
    )
    updated_at = Column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    security_events = relationship("SecurityEvent", back_populates="user")


# ============================================================
# TABLE: security_events
# ============================================================

class SecurityEvent(Base):
    __tablename__ = "security_events"

    id = Column(Integer, primary_key=True, autoincrement=True)
    timestamp = Column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
        index=True,
    )
    source_id = Column(String(255), nullable=False, index=True)
    event_type = Column(String(100), nullable=False, default="PREDICTION_REQUEST")
    raw_features = Column(JSONB, nullable=True)   # original request features
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
    )

    user = relationship("User", back_populates="security_events")
    prediction = relationship(
        "Prediction", back_populates="security_event", uselist=False
    )
    audit_logs = relationship("AuditLog", back_populates="security_event")

    __table_args__ = (
        Index("ix_security_events_source_timestamp", "source_id", "timestamp"),
    )


# ============================================================
# TABLE: predictions
# ============================================================

class Prediction(Base):
    __tablename__ = "predictions"

    id = Column(Integer, primary_key=True, autoincrement=True)
    security_event_id = Column(
        Integer,
        ForeignKey("security_events.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    source_id = Column(String(255), nullable=False, index=True)
    timestamp = Column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
        index=True,
    )

    # ML result fields
    prediction = Column(String(100), nullable=False, index=True)
    prediction_id = Column(Integer, nullable=False)
    confidence = Column(Float, nullable=False)
    is_attack = Column(Boolean, nullable=False, index=True)
    severity = Column(String(20), nullable=False)
    model_version = Column(String(20), nullable=False)
    decision_source = Column(String(50), nullable=False)

    # Ensemble detail
    global_prediction = Column(String(100), nullable=True)
    global_confidence = Column(Float, nullable=True)
    web_specialist_prediction = Column(String(100), nullable=True)
    web_specialist_confidence = Column(Float, nullable=True)
    web_specialist_margin = Column(Float, nullable=True)
    threshold = Column(Float, nullable=True)
    margin_threshold = Column(Float, nullable=True)
    global_confidence_threshold = Column(Float, nullable=True)

    # Anomaly detection & novelty fields
    anomaly_score = Column(Float, nullable=True)
    is_anomalous = Column(Boolean, nullable=True)
    novelty_label = Column(String(50), nullable=True)

    # Risk & Context Analysis fields
    risk_score = Column(Float, nullable=True)
    risk_level = Column(String(20), nullable=True)
    context_summary = Column(JSONB, nullable=True)

    created_at = Column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
    )

    security_event = relationship("SecurityEvent", back_populates="prediction")
    response_action = relationship(
        "ResponseAction", back_populates="prediction", uselist=False
    )

    __table_args__ = (
        Index("ix_predictions_is_attack_timestamp", "is_attack", "timestamp"),
        Index("ix_predictions_source_timestamp", "source_id", "timestamp"),
    )


# ============================================================
# TABLE: response_actions
# ============================================================

class ResponseAction(Base):
    __tablename__ = "response_actions"

    id = Column(Integer, primary_key=True, autoincrement=True)
    prediction_id = Column(
        Integer,
        ForeignKey("predictions.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    source_id = Column(String(255), nullable=False, index=True)
    timestamp = Column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
        index=True,
    )

    # Response engine fields
    response_action = Column(String(50), nullable=False)   # ALLOW/ALERT/RATE_LIMIT/BLOCK
    response_status = Column(String(100), nullable=False)
    reason = Column(Text, nullable=True)
    action = Column(String(50), nullable=False)            # mirrors response_action for clarity

    # Full response + prevention payloads stored as JSONB
    response_details = Column(JSONB, nullable=True)
    prevention_details = Column(JSONB, nullable=True)

    # Response verification fields
    verified = Column(Boolean, nullable=True, default=False)
    verification_status = Column(String(50), nullable=True)
    verification_evidence = Column(Text, nullable=True)
    verified_at = Column(DateTime(timezone=True), nullable=True)

    created_at = Column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
    )

    prediction = relationship("Prediction", back_populates="response_action")


# ============================================================
# TABLE: audit_logs
# ============================================================

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, autoincrement=True)
    event_id = Column(
        Integer,
        ForeignKey("security_events.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    timestamp = Column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
        index=True,
    )
    actor = Column(String(255), nullable=False)   # source_id or "SYSTEM"
    action = Column(String(100), nullable=False)  # e.g. PREDICTION_MADE, TRAFFIC_BLOCKED
    outcome = Column(String(50), nullable=False)  # SUCCESS / FAILURE
    details = Column(JSONB, nullable=True)        # arbitrary context

    created_at = Column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
    )

    security_event = relationship("SecurityEvent", back_populates="audit_logs")

    __table_args__ = (
        Index("ix_audit_logs_event_timestamp", "event_id", "timestamp"),
    )


# ============================================================
# TABLE CREATION
# ============================================================

def create_tables() -> None:
    """
    Create all tables if they do not exist.
    Called once at application startup.
    Safe to call multiple times (CREATE TABLE IF NOT EXISTS semantics).
    """
    global _db_available, _db_error

    _init_engine()

    if not _db_available:
        logger.warning(
            "Skipping table creation — database is not available. %s", _db_error
        )
        return

    try:
        Base.metadata.create_all(bind=_engine)
        # Ensure anomaly & risk columns exist on predictions table if table was created previously
        with _engine.connect() as conn:
            for col_name, col_type in [
                ("anomaly_score", "FLOAT"),
                ("is_anomalous", "BOOLEAN"),
                ("novelty_label", "VARCHAR(50)"),
                ("risk_score", "FLOAT"),
                ("risk_level", "VARCHAR(20)"),
                ("context_summary", "JSONB"),
            ]:
                try:
                    conn.execute(text(
                        f"ALTER TABLE predictions ADD COLUMN IF NOT EXISTS {col_name} {col_type}"
                    ))
                    conn.commit()
                except Exception as exc:
                    logger.debug("Auto-migrate column check %s: %s", col_name, exc)

            for col_name, col_type in [
                ("verified", "BOOLEAN DEFAULT FALSE"),
                ("verification_status", "VARCHAR(50)"),
                ("verification_evidence", "TEXT"),
                ("verified_at", "TIMESTAMPTZ"),
            ]:
                try:
                    conn.execute(text(
                        f"ALTER TABLE response_actions ADD COLUMN IF NOT EXISTS {col_name} {col_type}"
                    ))
                    conn.commit()
                except Exception as exc:
                    logger.debug("Auto-migrate response_actions column check %s: %s", col_name, exc)

            try:
                conn.execute(text(
                    "CREATE INDEX IF NOT EXISTS ix_predictions_source_timestamp "
                    "ON predictions (source_id, timestamp DESC)"
                ))
                conn.commit()
            except Exception as exc:
                logger.debug("Auto-migrate index check: %s", exc)
        logger.info("CYVORA database tables verified / created.")
    except SQLAlchemyError as exc:
        _db_available = False
        _db_error = f"Table creation failed: {exc}"
        logger.error(_db_error)


# ============================================================
# DATABASE STATUS
# ============================================================

def get_db_status() -> dict:
    """
    Perform a live connectivity probe and return honest status.
    Never returns 'available' when the database is actually unreachable.
    """
    if not DATABASE_URL:
        return {
            "status": "unavailable",
            "reason": "DATABASE_URL environment variable is not set",
            "tables": [],
        }

    if _engine is None:
        return {
            "status": "unavailable",
            "reason": _db_error or "Engine not initialised",
            "tables": [],
        }

    try:
        with _engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        table_names = [
            "users",
            "security_events",
            "predictions",
            "response_actions",
            "audit_logs",
        ]
        return {
            "status": "available",
            "database_url": _masked_url(),
            "tables": table_names,
            "error": None,
        }
    except Exception as exc:
        return {
            "status": "unavailable",
            "reason": str(exc),
            "tables": [],
        }


# ============================================================
# SINGLE-TRANSACTION PERSISTENCE
# ============================================================

def save_predict_transaction(
    source_id: str,
    raw_features: dict,
    prediction_result: dict,
    response_result: dict,
    prevention_result: dict,
    anomaly_result: Optional[dict] = None,
    risk_result: Optional[dict] = None,
    verification_result: Optional[dict] = None,
) -> dict:
    """
    Persist one full /predict lifecycle in a single session/transaction:
      SecurityEvent → Prediction → ResponseAction → AuditLog (×3)

    Returns:
      {"persisted": True, "security_event_id": int, "prediction_id": int}
      {"persisted": False, "error": str}   ← on any failure (after rollback)

    Does NOT fabricate success.  Raises nothing — failure is returned as a dict.
    """
    if not _db_available or _SessionLocal is None:
        reason = _db_error or "Database not available"
        logger.error(
            "DB persistence skipped for source_id=%s — %s", source_id, reason
        )
        return {"persisted": False, "error": reason}

    session = _SessionLocal()
    try:
        now = datetime.now(timezone.utc)

        # ----------------------------------------------------------
        # 1. SecurityEvent
        # ----------------------------------------------------------
        sec_event = SecurityEvent(
            timestamp=now,
            source_id=source_id,
            event_type="PREDICTION_REQUEST",
            raw_features=raw_features,
        )
        session.add(sec_event)
        session.flush()   # get sec_event.id without committing

        # ----------------------------------------------------------
        # 2. Prediction
        # ----------------------------------------------------------
        pred_row = Prediction(
            security_event_id=sec_event.id,
            source_id=source_id,
            timestamp=now,
            prediction=str(prediction_result.get("prediction", "")),
            prediction_id=int(prediction_result.get("prediction_id", 0)),
            confidence=float(prediction_result.get("confidence", 0.0)),
            is_attack=bool(prediction_result.get("is_attack", False)),
            severity=str(prediction_result.get("severity", "LOW")),
            model_version=str(prediction_result.get("model_version", "V21.1")),
            decision_source=str(prediction_result.get("decision_source", "")),
            global_prediction=str(
                prediction_result.get("global_prediction", "")
            ),
            global_confidence=float(
                prediction_result.get("global_confidence", 0.0)
            ),
            web_specialist_prediction=str(
                prediction_result.get("web_specialist_prediction", "")
            ),
            web_specialist_confidence=float(
                prediction_result.get("web_specialist_confidence", 0.0)
            ),
            web_specialist_margin=float(
                prediction_result.get("web_specialist_margin", 0.0)
            ),
            threshold=float(prediction_result.get("threshold", 0.0)),
            margin_threshold=float(
                prediction_result.get("margin_threshold", 0.0)
            ),
            global_confidence_threshold=float(
                prediction_result.get("global_confidence_threshold", 0.0)
            ),
            anomaly_score=anomaly_result.get("anomaly_score") if anomaly_result else None,
            is_anomalous=anomaly_result.get("is_anomalous") if anomaly_result else None,
            novelty_label=anomaly_result.get("novelty_label") if anomaly_result else None,
            risk_score=risk_result.get("risk_score") if risk_result else None,
            risk_level=risk_result.get("risk_level") if risk_result else None,
            context_summary=risk_result.get("context") if risk_result else None,
        )
        session.add(pred_row)
        session.flush()   # get pred_row.id

        # ----------------------------------------------------------
        # 3. ResponseAction
        # ----------------------------------------------------------
        # response_engine returns key "response_action"; use it directly.
        resp_action_str = str(
            response_result.get("response_action", "ALLOW")
        ).upper()

        # Parse verified_at if present
        v_at = None
        if verification_result and verification_result.get("verified_at"):
            try:
                v_at = datetime.fromisoformat(verification_result["verified_at"])
            except Exception:
                v_at = now

        resp_row = ResponseAction(
            prediction_id=pred_row.id,
            source_id=source_id,
            timestamp=now,
            response_action=resp_action_str,
            response_status=str(
                response_result.get("response_status", "")
            ),
            reason=str(response_result.get("reason", "")),
            action=resp_action_str,   # intentional mirror for query convenience
            response_details=response_result,
            prevention_details=prevention_result,
            verified=bool(verification_result.get("verified", False)) if verification_result else False,
            verification_status=str(verification_result.get("verification_status")) if verification_result else None,
            verification_evidence=str(verification_result.get("evidence")) if verification_result else None,
            verified_at=v_at,
        )
        session.add(resp_row)

        # ----------------------------------------------------------
        # 4. AuditLog — prediction made
        # ----------------------------------------------------------
        audit_pred = AuditLog(
            event_id=sec_event.id,
            timestamp=now,
            actor=source_id,
            action="PREDICTION_MADE",
            outcome="SUCCESS",
            details={
                "prediction": prediction_result.get("prediction"),
                "confidence": prediction_result.get("confidence"),
                "is_attack": prediction_result.get("is_attack"),
                "severity": prediction_result.get("severity"),
                "model_version": prediction_result.get("model_version"),
            },
        )
        session.add(audit_pred)

        # 4b. AuditLog — response/prevention enforced
        audit_resp = AuditLog(
            event_id=sec_event.id,
            timestamp=now,
            actor="SYSTEM",
            action=f"RESPONSE_{resp_action_str}",
            outcome="SUCCESS",
            details={
                "response_action": resp_action_str,
                "response_status": response_result.get("response_status"),
                "reason": response_result.get("reason"),
                "prevention_action": prevention_result.get("action"),
                "prevention_status": prevention_result.get("status"),
            },
        )
        session.add(audit_resp)

        # 4c. AuditLog — response verification
        if verification_result:
            v_status = verification_result.get("verification_status", "UNKNOWN")
            audit_action = (
                "RESPONSE_VERIFIED"
                if v_status in ["VERIFIED", "NOT_APPLICABLE"]
                else "RESPONSE_VERIFICATION_FAILED"
            )
            audit_verif = AuditLog(
                event_id=sec_event.id,
                timestamp=now,
                actor="SYSTEM",
                action=audit_action,
                outcome="SUCCESS" if verification_result.get("verified") else "FAILURE",
                details={
                    "action": resp_action_str,
                    "verification_status": v_status,
                    "evidence": verification_result.get("evidence"),
                    "verified_at": verification_result.get("verified_at"),
                },
            )
            session.add(audit_verif)

        # ----------------------------------------------------------
        # Commit everything atomically
        # ----------------------------------------------------------
        session.commit()

        logger.info(
            "Persisted predict transaction: "
            "security_event_id=%d prediction_id=%d source_id=%s "
            "prediction=%s action=%s",
            sec_event.id,
            pred_row.id,
            source_id,
            prediction_result.get("prediction"),
            resp_action_str,
        )

        return {
            "persisted": True,
            "security_event_id": sec_event.id,
            "prediction_id": pred_row.id,
        }

    except SQLAlchemyError as exc:
        session.rollback()
        err = f"Transaction rolled back — SQLAlchemy error: {exc}"
        logger.error(err)
        return {"persisted": False, "error": err}

    except Exception as exc:
        session.rollback()
        err = f"Transaction rolled back — unexpected error: {exc}"
        logger.error(err)
        return {"persisted": False, "error": err}

    finally:
        session.close()


# ============================================================
# QUERY HELPERS
# ============================================================

class DatabaseUnavailableError(Exception):
    """Raised when a query is attempted but the DB is not reachable."""


def _require_db() -> None:
    """Raise DatabaseUnavailableError if the DB is not available."""
    if not _db_available or _SessionLocal is None:
        raise DatabaseUnavailableError(
            _db_error or "Database is not available"
        )


def get_recent_events(limit: int = 50) -> list:
    """
    Return the most recent security events with their predictions
    and response actions.
    Raises DatabaseUnavailableError if DB is unreachable.
    """
    _require_db()

    session = _SessionLocal()
    try:
        rows = (
            session.query(SecurityEvent)
            .order_by(SecurityEvent.timestamp.desc())
            .limit(limit)
            .all()
        )

        results = []
        for ev in rows:
            pred = ev.prediction
            resp = pred.response_action if pred else None
            results.append(
                {
                    "security_event_id": ev.id,
                    "timestamp": ev.timestamp.isoformat(),
                    "source_id": ev.source_id,
                    "event_type": ev.event_type,
                    "raw_features": ev.raw_features or {},
                    "prediction": pred.prediction if pred else None,
                    "confidence": pred.confidence if pred else None,
                    "is_attack": pred.is_attack if pred else None,
                    "severity": pred.severity if pred else None,
                    "anomaly_score": pred.anomaly_score if pred else None,
                    "is_anomalous": pred.is_anomalous if pred else None,
                    "novelty_label": pred.novelty_label if pred else None,
                    "risk_score": pred.risk_score if pred else None,
                    "risk_level": pred.risk_level if pred else None,
                    "response_action": (
                        resp.response_action if resp else None
                    ),
                    "response_status": (
                        resp.response_status if resp else None
                    ),
                    "verified": (
                        resp.verified if resp else None
                    ),
                    "verification_status": (
                        resp.verification_status if resp else None
                    ),
                    "verification_evidence": (
                        resp.verification_evidence if resp else None
                    ),
                }
            )
        return results

    except DatabaseUnavailableError:
        raise
    except SQLAlchemyError as exc:
        raise DatabaseUnavailableError(
            f"Query failed: {exc}"
        ) from exc
    finally:
        session.close()


def get_source_context(
    source_id: str,
    window_minutes: int = 10,
    limit: int = 50,
) -> dict:
    """
    Fetches recent history for source_id within a bounded time window (e.g. 10m).
    Enforces a strict query limit (default 50) to prevent unbounded DB scans.
    Returns structured context metrics; never raises exceptions.
    """
    default_context = {
        "source_id": source_id,
        "window_minutes": window_minutes,
        "recent_event_count": 0,
        "recent_anomaly_count": 0,
        "recent_attack_count": 0,
        "recent_actions": [],
        "is_source_blocked": False,
        "is_source_rate_limited": False,
    }

    if not _db_available or _SessionLocal is None:
        return default_context

    session = _SessionLocal()
    try:
        cutoff = datetime.now(timezone.utc) - timedelta(minutes=window_minutes)

        # Bounded query using source_id and timestamp index
        recent_rows = (
            session.query(
                Prediction.prediction,
                Prediction.confidence,
                Prediction.is_attack,
                Prediction.is_anomalous,
                Prediction.anomaly_score,
            )
            .filter(Prediction.source_id == source_id)
            .filter(Prediction.timestamp >= cutoff)
            .order_by(Prediction.timestamp.desc())
            .limit(limit)
            .all()
        )

        recent_actions = (
            session.query(ResponseAction.response_action)
            .filter(ResponseAction.source_id == source_id)
            .filter(ResponseAction.timestamp >= cutoff)
            .order_by(ResponseAction.timestamp.desc())
            .limit(limit)
            .all()
        )

        from backend.app.prevention_engine import get_source_status
        status = get_source_status(source_id)

        recent_event_count = len(recent_rows)
        recent_anomaly_count = sum(
            1 for r in recent_rows
            if bool(r.is_anomalous) or (r.anomaly_score is not None and r.anomaly_score >= 0.50)
        )
        recent_attack_count = sum(1 for r in recent_rows if bool(r.is_attack))
        actions_list = [str(a[0]).upper() for a in recent_actions if a[0]]

        return {
            "source_id": source_id,
            "window_minutes": window_minutes,
            "recent_event_count": recent_event_count,
            "recent_anomaly_count": recent_anomaly_count,
            "recent_attack_count": recent_attack_count,
            "recent_actions": actions_list,
            "is_source_blocked": (status == "BLOCKED"),
            "is_source_rate_limited": (status == "RATE_LIMITED"),
        }
    except Exception as exc:
        logger.warning("Error fetching source context for %s: %s", source_id, exc)
        return default_context
    finally:
        session.close()


def get_stats() -> dict:
    """
    Return aggregate statistics from the predictions table.
    Raises DatabaseUnavailableError if DB is unreachable.
    """
    _require_db()

    session = _SessionLocal()
    try:
        total = session.query(func.count(Prediction.id)).scalar() or 0
        attacks = (
            session.query(func.count(Prediction.id))
            .filter(Prediction.is_attack.is_(True))
            .scalar()
            or 0
        )
        benign = total - attacks

        # Breakdown by prediction label
        label_counts_raw = (
            session.query(Prediction.prediction, func.count(Prediction.id))
            .group_by(Prediction.prediction)
            .all()
        )
        label_counts = {label: cnt for label, cnt in label_counts_raw}

        # Breakdown by response action
        action_counts_raw = (
            session.query(
                ResponseAction.response_action,
                func.count(ResponseAction.id),
            )
            .group_by(ResponseAction.response_action)
            .all()
        )
        action_counts = {action: cnt for action, cnt in action_counts_raw}

        return {
            "total_predictions": total,
            "total_attacks": attacks,
            "total_benign": benign,
            "attack_rate_pct": (
                round(attacks / total * 100, 2) if total > 0 else 0.0
            ),
            "predictions_by_label": label_counts,
            "response_actions_by_type": action_counts,
        }

    except DatabaseUnavailableError:
        raise
    except SQLAlchemyError as exc:
        raise DatabaseUnavailableError(
            f"Stats query failed: {exc}"
        ) from exc
    finally:
        session.close()
