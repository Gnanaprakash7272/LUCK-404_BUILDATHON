"""
CYVORA — JWT Authentication Utilities
======================================
Provides:
  - Password hashing via bcrypt (passlib)
  - JWT creation and validation (python-jose / HS256)
  - FastAPI dependency: get_current_user()

Configuration (environment variables):
  JWT_SECRET          — required, no default
  JWT_ALGORITHM       — optional, default HS256
  JWT_EXPIRE_MINUTES  — optional, default 60

JWT_SECRET MUST be set before starting the server.
If it is missing the process will log an error and refuse to create tokens.
"""

import logging
import os
from datetime import datetime, timedelta, timezone
from typing import Optional

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy.exc import SQLAlchemyError

logger = logging.getLogger("cyvora.auth")

# ============================================================
# CONFIGURATION — environment variables only, no hardcoding
# ============================================================

JWT_SECRET: str = os.environ.get("JWT_SECRET", "")
JWT_ALGORITHM: str = os.environ.get("JWT_ALGORITHM", "HS256")
JWT_EXPIRE_MINUTES: int = int(os.environ.get("JWT_EXPIRE_MINUTES", "60"))

if not JWT_SECRET:
    logger.warning(
        "JWT_SECRET environment variable is not set. "
        "Authentication endpoints will return 500 until it is configured."
    )

# ============================================================
# PASSWORD HASHING — bcrypt via passlib
# ============================================================

_pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(plaintext: str) -> str:
    """Return bcrypt hash of plaintext password. Never store plaintext."""
    return _pwd_context.hash(plaintext)


def verify_password(plaintext: str, hashed: str) -> bool:
    """Return True if plaintext matches stored bcrypt hash."""
    return _pwd_context.verify(plaintext, hashed)


# ============================================================
# JWT CREATION
# ============================================================

def create_access_token(
    user_id: int,
    email: str,
    role: str,
) -> str:
    """
    Create a signed JWT access token.
    Raises RuntimeError if JWT_SECRET is not configured.
    """
    if not JWT_SECRET:
        raise RuntimeError(
            "JWT_SECRET environment variable is not set. "
            "Cannot issue tokens."
        )

    now = datetime.now(timezone.utc)
    expire = now + timedelta(minutes=JWT_EXPIRE_MINUTES)

    payload = {
        "sub": str(user_id),      # subject — user id as string (JWT standard)
        "email": email,
        "role": role,
        "iat": now,                # issued-at
        "exp": expire,             # expiration
    }

    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


# ============================================================
# JWT VALIDATION
# ============================================================

def decode_access_token(token: str) -> dict:
    """
    Decode and validate a JWT token.
    Returns the payload dict on success.
    Raises HTTPException 401 on any failure.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid or expired authentication token",
        headers={"WWW-Authenticate": "Bearer"},
    )

    if not JWT_SECRET:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Authentication service is not configured",
        )

    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_id: Optional[str] = payload.get("sub")
        if user_id is None:
            raise credentials_exception
        return payload
    except JWTError:
        raise credentials_exception


# ============================================================
# FASTAPI DEPENDENCY — Bearer token extractor
# ============================================================

_bearer_scheme = HTTPBearer(auto_error=False)


def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(_bearer_scheme),
):
    """
    FastAPI dependency — validates Bearer token and returns the live
    User ORM object from PostgreSQL.

    Usage:
        @app.get("/protected")
        def protected(current_user = Depends(get_current_user)):
            ...

    Raises HTTP 401 if:
      - Authorization header is missing or malformed
      - JWT is invalid or expired
      - User no longer exists in the database
      - User account is inactive
    """
    _unauthorized = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Authentication required",
        headers={"WWW-Authenticate": "Bearer"},
    )

    if credentials is None:
        raise _unauthorized
    # Import here to avoid circular dependency at module level
    from backend.app.database import _SessionLocal, _db_available, User

    token = credentials.credentials
    payload = decode_access_token(token)

    user_id_str = payload.get("sub")
    try:
        user_id = int(user_id_str)
    except (ValueError, TypeError):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token subject",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not _db_available or _SessionLocal is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Authentication database is unavailable",
        )

    session = _SessionLocal()
    try:
        user = session.query(User).filter(User.id == user_id).first()
    except SQLAlchemyError as exc:
        logger.error("DB error loading user %d: %s", user_id, exc)
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Authentication database error",
        )
    finally:
        session.close()

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User account is disabled",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return user
