"""
Health check endpoint for the API.
"""

from fastapi import APIRouter, Depends
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db

router = APIRouter(tags=["health"])


@router.get("/health")
async def health_check(db: AsyncSession = Depends(get_db)):
    """Health check endpoint - returns service status and DB connectivity."""
    from sqlalchemy import select
    diagnostics = {}
    
    # Add updated_at column to public.roles table
    try:
        await db.execute(text("ALTER TABLE public.roles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();"))
        await db.execute(text("ALTER TABLE public.expenses ADD COLUMN IF NOT EXISTS description TEXT;"))
        await db.commit()
        diagnostics["columns_add"] = "success"
    except Exception as exc:
        diagnostics["columns_add_error"] = str(exc)

    # Try SQLAlchemy query for Role
    try:
        from app.models.profile import Role
        res = await db.execute(select(Role))
        res.scalars().all()
        diagnostics["roles_sa_query"] = "success"
    except Exception as exc:
        diagnostics["roles_sa_query_error"] = f"{type(exc).__name__}: {str(exc)}"

    # Try SQLAlchemy query for Expense
    try:
        from app.models.finance import Expense
        res = await db.execute(select(Expense))
        res.scalars().all()
        diagnostics["expenses_sa_query"] = "success"
    except Exception as exc:
        diagnostics["expenses_sa_query_error"] = f"{type(exc).__name__}: {str(exc)}"

    return {"status": "ok", "diagnostics": diagnostics}