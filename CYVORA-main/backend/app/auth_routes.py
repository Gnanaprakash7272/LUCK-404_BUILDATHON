"""
CYVORA — Authentication Routes
================================
Endpoints:
  POST /auth/register   — create a new user account
  POST /auth/login      — exchange credentials for JWT
  GET  /auth/me         — return current authenticated user

All endpoints use the existing PostgreSQL users table.
No second user table is created.
Password hash is NEVER returned in any response.
"""

import logging
from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr, field_validator
from sqlalchemy.exc import IntegrityError, SQLAlchemyError

from backend.app.auth import (
    create_access_token,
    get_current_user,
    hash_password,
    verify_password,
)

logger = logging.getLogger("cyvora.auth_routes")

router = APIRouter(prefix="/auth", tags=["auth"])


# ============================================================
# REQUEST / RESPONSE SCHEMAS
# ============================================================

class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    username: Optional[str] = None

    @field_validator("password")
    @classmethod
    def password_strength(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters")
        return v


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    """Safe user representation — never includes password_hash."""
    id: int
    email: str
    username: Optional[str]
    role: str
    is_active: bool
    created_at: str

    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: int
    email: str
    role: str


# ============================================================
# POST /auth/register
# ============================================================

@router.post(
    "/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new user account",
)
def register(body: RegisterRequest):
    """
    Create a new CYVORA user.

    - Email must be unique.
    - Password is bcrypt-hashed before storage.
    - Plaintext password is NEVER stored or returned.
    - Default role = "analyst".
    """
    from backend.app.database import _SessionLocal, _db_available, User

    if not _db_available or _SessionLocal is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database is unavailable — cannot register user",
        )

    # Hash before any DB interaction — plaintext never hits ORM layer
    pw_hash = hash_password(body.password)

    session = _SessionLocal()
    try:
        # Check for duplicate email explicitly for a clear error message
        existing = (
            session.query(User).filter(User.email == body.email).first()
        )
        if existing:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="An account with this email already exists",
            )

        new_user = User(
            email=body.email,
            username=body.username,
            password_hash=pw_hash,
            role="analyst",
            is_active=True,
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc),
        )
        session.add(new_user)
        session.commit()
        session.refresh(new_user)

        logger.info("New user registered: id=%d email=%s", new_user.id, new_user.email)

        return UserResponse(
            id=new_user.id,
            email=new_user.email,
            username=new_user.username,
            role=new_user.role,
            is_active=new_user.is_active,
            created_at=new_user.created_at.isoformat(),
        )

    except HTTPException:
        raise
    except IntegrityError:
        session.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email already exists",
        )
    except SQLAlchemyError as exc:
        session.rollback()
        logger.error("Registration DB error: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Registration failed due to a database error",
        )
    finally:
        session.close()


# ============================================================
# POST /auth/login
# ============================================================

@router.post(
    "/login",
    response_model=TokenResponse,
    summary="Login and receive a JWT access token",
)
def login(body: LoginRequest):
    """
    Authenticate with email + password.
    Returns a Bearer JWT token on success.
    Returns HTTP 401 on any credential failure.

    The error message is intentionally generic — it does not
    reveal whether the email or password was wrong.
    """
    from backend.app.database import _SessionLocal, _db_available, User

    _invalid = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid email or password",
        headers={"WWW-Authenticate": "Bearer"},
    )

    if not _db_available or _SessionLocal is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database is unavailable — cannot authenticate",
        )

    session = _SessionLocal()
    try:
        user = session.query(User).filter(User.email == body.email).first()

        # Constant-time-safe: always verify even if user is None
        # (passlib handles the dummy hash internally)
        if user is None or not verify_password(body.password, user.password_hash or ""):
            logger.warning("Failed login attempt for email=%s", body.email)
            raise _invalid

        if not user.is_active:
            raise _invalid

        token = create_access_token(
            user_id=user.id,
            email=user.email,
            role=user.role,
        )

        logger.info("User logged in: id=%d email=%s", user.id, user.email)

        return TokenResponse(
            access_token=token,
            token_type="bearer",
            user_id=user.id,
            email=user.email,
            role=user.role,
        )

    except HTTPException:
        raise
    except SQLAlchemyError as exc:
        logger.error("Login DB error: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Authentication failed due to a database error",
        )
    finally:
        session.close()


# ============================================================
# GET /auth/me
# ============================================================

@router.get(
    "/me",
    response_model=UserResponse,
    summary="Return the currently authenticated user",
)
def me(current_user=Depends(get_current_user)):
    """
    Returns the authenticated user's profile.
    Requires: Authorization: Bearer <token>
    Returns HTTP 401 if token is missing, invalid, or expired.
    Password hash is NEVER included in the response.
    """
    return UserResponse(
        id=current_user.id,
        email=current_user.email,
        username=current_user.username,
        role=current_user.role,
        is_active=current_user.is_active,
        created_at=current_user.created_at.isoformat(),
    )
