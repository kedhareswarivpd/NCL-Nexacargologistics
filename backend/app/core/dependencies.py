"""
Common FastAPI dependencies — role-based access guards.

Roles come from the `profiles.role` column (synced from Supabase). Admin is a
super-role that passes every guard.
"""

from fastapi import Depends, HTTPException, status

from app.middleware.auth import get_current_user
from app.models.profile import Profile, UserRole


def require_roles(*allowed: str):
    """Factory that builds a dependency allowing the given roles (admin always allowed)."""

    allowed_set = set(allowed) | {UserRole.ADMIN}

    async def _guard(current_user: Profile = Depends(get_current_user)) -> Profile:
        if current_user.role not in allowed_set:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Requires one of roles: {', '.join(sorted(allowed_set))}",
            )
        return current_user

    return _guard


# Convenience guards used across routers.
get_admin_user = require_roles(UserRole.ADMIN)
get_finance_user = require_roles(UserRole.FINANCE)
get_logistics_user = require_roles(UserRole.LOGISTICS)
get_warehouse_user = require_roles(UserRole.WAREHOUSE)
get_customs_user = require_roles(UserRole.CUSTOMS)
get_driver_user = require_roles(UserRole.DRIVER)
get_support_user = require_roles(UserRole.SUPPORT)
