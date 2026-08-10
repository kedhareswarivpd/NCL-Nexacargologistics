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
    try:
        await db.execute(text("SELECT 1"))
        diagnostics["database"] = "connected"
    except Exception as exc:
        diagnostics["database"] = f"error: {str(exc)}"

    # Diagnose tables
    try:
        res = await db.execute(text("SELECT table_name FROM information_schema.tables WHERE table_schema='public'"))
        diagnostics["tables"] = [r[0] for r in res.fetchall()]
    except Exception as exc:
        diagnostics["tables_error"] = str(exc)

    # Diagnose expenses query
    try:
        res_exp = await db.execute(text("SELECT * FROM public.expenses LIMIT 1"))
        diagnostics["expenses_query"] = "success"
    except Exception as exc:
        diagnostics["expenses_query_error"] = f"{type(exc).__name__}: {str(exc)}"

    return {"status": "ok", "diagnostics": diagnostics}