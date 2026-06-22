"""
Authentication token handling.

The backend supports two kinds of access token, side by side:

1. **Backend-issued JWTs** — minted by `/api/auth/login` and `/api/auth/register`,
   signed HS256 with `settings.JWT_SECRET` and tagged with `iss=JWT_ISSUER`.
2. **Supabase JWTs** — obtained by the Supabase client on the frontend. Verified
   locally via `SUPABASE_JWT_SECRET`, or remotely via `/auth/v1/user`.

`verify_access_token` tries (1) then falls back to (2). All verifiers return a
normalised claims dict: {id, email, role, name, phone, company, metadata}.
Password hashing for backend-issued auth also lives here.
"""

from datetime import datetime, timedelta, timezone
from typing import Optional

import bcrypt
import httpx
from jose import jwt, JWTError

from app.core.config import settings


class TokenError(Exception):
    """Raised when an access token cannot be verified."""


# --------------------------------------------------------------------------
# Password hashing (backend-issued auth)
# --------------------------------------------------------------------------
# bcrypt operates on at most 72 bytes; longer inputs must be truncated by the
# caller (bcrypt>=4.1 raises instead of silently truncating).
def _pw_bytes(password: str) -> bytes:
    return password.encode("utf-8")[:72]


def hash_password(password: str) -> str:
    return bcrypt.hashpw(_pw_bytes(password), bcrypt.gensalt()).decode("utf-8")


def verify_password(password: str, password_hash: Optional[str]) -> bool:
    if not password_hash:
        return False
    try:
        return bcrypt.checkpw(_pw_bytes(password), password_hash.encode("utf-8"))
    except (ValueError, TypeError):
        # Malformed / non-bcrypt hash.
        return False


# --------------------------------------------------------------------------
# Backend-issued JWTs
# --------------------------------------------------------------------------
def create_access_token(
    *,
    subject: str,
    email: Optional[str],
    role: str,
    name: Optional[str] = None,
    expires_minutes: Optional[int] = None,
) -> str:
    """Mint an HS256 access token for a locally-authenticated user."""
    if not settings.JWT_SECRET:
        raise TokenError("Backend JWT auth is not configured (JWT_SECRET is empty)")
    now = datetime.now(timezone.utc)
    expire = now + timedelta(minutes=expires_minutes or settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    payload = {
        "sub": str(subject),
        "email": email,
        "role": role,
        "name": name,
        "iss": settings.JWT_ISSUER,
        "iat": now,
        "exp": expire,
    }
    return jwt.encode(payload, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)


def create_password_reset_token(subject: str, expires_minutes: int = 30) -> str:
    """Mint a short-lived token usable only for resetting a password."""
    if not settings.JWT_SECRET:
        raise TokenError("Backend JWT auth is not configured (JWT_SECRET is empty)")
    now = datetime.now(timezone.utc)
    payload = {
        "sub": str(subject),
        "purpose": "pwd_reset",
        "iss": settings.JWT_ISSUER,
        "iat": now,
        "exp": now + timedelta(minutes=expires_minutes),
    }
    return jwt.encode(payload, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)


def verify_password_reset_token(token: str) -> str:
    """Return the subject (user id) of a valid password-reset token, else raise."""
    if not settings.JWT_SECRET:
        raise TokenError("Backend JWT auth is not configured")
    try:
        payload = jwt.decode(
            token,
            settings.JWT_SECRET,
            algorithms=[settings.JWT_ALGORITHM],
            issuer=settings.JWT_ISSUER,
            options={"verify_aud": False},
        )
    except JWTError as exc:
        raise TokenError("Invalid or expired reset token") from exc
    if payload.get("purpose") != "pwd_reset" or not payload.get("sub"):
        raise TokenError("Invalid reset token")
    return payload["sub"]


def _verify_backend(token: str) -> Optional[dict]:
    if not settings.JWT_SECRET:
        return None
    try:
        payload = jwt.decode(
            token,
            settings.JWT_SECRET,
            algorithms=[settings.JWT_ALGORITHM],
            issuer=settings.JWT_ISSUER,
            options={"verify_aud": False},
        )
    except JWTError:
        # Not a (valid) backend token — caller falls back to Supabase.
        return None
    return {
        "id": payload.get("sub"),
        "email": payload.get("email"),
        "role": payload.get("role") or "customer",
        "name": payload.get("name"),
        "phone": None,
        "company": None,
        "metadata": {},
    }


def _normalise(payload: dict) -> dict:
    meta = payload.get("user_metadata") or payload.get("raw_user_meta_data") or {}
    return {
        "id": payload.get("sub") or payload.get("id"),
        "email": payload.get("email"),
        # app-level role lives in user_metadata.role; fall back to 'customer'.
        "role": (meta.get("role") or "customer"),
        "name": meta.get("name"),
        "phone": meta.get("phone"),
        "company": meta.get("company"),
        "metadata": meta,
    }


def _verify_local(token: str) -> Optional[dict]:
    if not settings.SUPABASE_JWT_SECRET:
        return None
    try:
        payload = jwt.decode(
            token,
            settings.SUPABASE_JWT_SECRET,
            algorithms=["HS256"],
            audience=settings.SUPABASE_JWT_AUDIENCE,
            options={"verify_aud": True},
        )
        return _normalise(payload)
    except JWTError:
        return None


async def _verify_remote(token: str) -> Optional[dict]:
    if not settings.SUPABASE_URL or not settings.SUPABASE_ANON_KEY:
        return None
    url = f"{settings.SUPABASE_URL.rstrip('/')}/auth/v1/user"
    headers = {"Authorization": f"Bearer {token}", "apikey": settings.SUPABASE_ANON_KEY}
    try:
        async with httpx.AsyncClient(timeout=8.0) as client:
            resp = await client.get(url, headers=headers)
    except httpx.HTTPError:
        return None
    if resp.status_code != 200:
        return None
    return _normalise(resp.json())


async def verify_supabase_token(token: str) -> dict:
    """Return normalised claims for a valid Supabase access token, else raise."""
    claims = _verify_local(token)
    if claims is None:
        claims = await _verify_remote(token)
    if claims is None or not claims.get("id"):
        raise TokenError("Invalid or expired authentication token")
    return claims


async def verify_access_token(token: str) -> dict:
    """Verify a token from either source: backend-issued first, then Supabase."""
    claims = _verify_backend(token)
    if claims and claims.get("id"):
        return claims
    return await verify_supabase_token(token)
