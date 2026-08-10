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
    diagnostics = {}
    
    # Check roles table columns/query
    try:
        res = await db.execute(text("SELECT * FROM public.roles LIMIT 1"))
        res.fetchall()
        diagnostics["roles_query"] = "success"
    except Exception as exc:
        diagnostics["roles_query_error"] = f"{type(exc).__name__}: {str(exc)}"

    # Check expenses table columns/query
    try:
        res = await db.execute(text("SELECT * FROM public.expenses LIMIT 1"))
        res.fetchall()
        diagnostics["expenses_query"] = "success"
    except Exception as exc:
        diagnostics["expenses_query_error"] = f"{type(exc).__name__}: {str(exc)}"

    return {"status": "ok", "diagnostics": diagnostics}