"""
Supabase Admin API client (service-role) — used to provision auth users for
staff accounts created by an admin. Authentication for normal users happens on
the frontend via the Supabase JS client; this is only for server-side creation.
"""

from typing import Optional

import httpx

from app.core.config import settings


def is_configured() -> bool:
    return bool(settings.SUPABASE_URL and settings.SUPABASE_SERVICE_ROLE_KEY)


async def create_auth_user(email: str, password: str, metadata: Optional[dict] = None) -> Optional[str]:
    """Create a confirmed Supabase auth user. Returns the new user id, or None."""
    if not is_configured():
        return None
    url = f"{settings.SUPABASE_URL.rstrip('/')}/auth/v1/admin/users"
    headers = {
        "apikey": settings.SUPABASE_SERVICE_ROLE_KEY,
        "Authorization": f"Bearer {settings.SUPABASE_SERVICE_ROLE_KEY}",
        "Content-Type": "application/json",
    }
    body = {
        "email": email,
        "password": password,
        "email_confirm": True,
        "user_metadata": metadata or {},
    }
    async with httpx.AsyncClient(timeout=10.0) as client:
        resp = await client.post(url, headers=headers, json=body)
    if resp.status_code not in (200, 201):
        raise RuntimeError(f"Supabase admin create failed: {resp.status_code} {resp.text}")
    return resp.json().get("id")
