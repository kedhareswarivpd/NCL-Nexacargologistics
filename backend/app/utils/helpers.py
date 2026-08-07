"""
Utility helpers — reference/code generation and model serialization.
"""

import re
import uuid
from datetime import datetime, timezone
from enum import Enum
from urllib.parse import urlparse


def _rand(n: int = 6) -> str:
    return uuid.uuid4().hex[:n].upper()


def generate_tracking_id() -> str:
    return f"SHP-{_rand(6)}"


def generate_ref(prefix: str, n: int = 6) -> str:
    """Generic reference generator, e.g. generate_ref('INV') -> 'INV-3F9A2B'."""
    return f"{prefix}-{_rand(n)}"


def validate_email(email: str) -> bool:
    return bool(re.match(r"^[^@]+@[^@]+\.[^@]+$", email))  # NOSONAR


# Column names never exposed in API responses.
SENSITIVE_COLUMNS = {"password_hash"}


def serialize(obj) -> dict:
    """Serialize a SQLAlchemy model instance to a JSON-friendly dict.

    UUIDs -> str, datetimes -> ISO string, enums -> value. Safe for async
    contexts because it only reads already-loaded column attributes.
    Sensitive columns (e.g. password_hash) are omitted.
    """
    data: dict = {}
    for column in obj.__table__.columns:
        if column.name in SENSITIVE_COLUMNS:
            continue
        value = getattr(obj, column.name)
        if isinstance(value, uuid.UUID):
            value = str(value)
        elif isinstance(value, datetime):
            value = value.isoformat()
        elif isinstance(value, Enum):
            value = value.value
        data[column.name] = value
    return data


def serialize_all(items) -> list:
    """Serialize an iterable of SQLAlchemy model instances."""
    return [serialize(item) for item in items]


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def is_safe_file_url(url: str) -> bool:
    """Validate that the file URL scheme and host are safe (localhost or Supabase)."""
    if not url:
        return False
    try:
        parsed = urlparse(url)
        if parsed.scheme not in ("http", "https"):
            return False
        host = parsed.hostname
        if not host:
            return False
        if host in ("localhost", "127.0.0.1"):
            return True
        if host.endswith(".supabase.co") or host == "supabase.co":
            return True
        return False
    except Exception:
        return False
