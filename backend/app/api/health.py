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
    
    # Run self-healing table creations for public.expenses and public.reviews
    try:
        # Create expenses table
        await db.execute(text("""
            CREATE TABLE IF NOT EXISTS public.expenses (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                category TEXT NOT NULL DEFAULT 'Operational',
                amount DOUBLE PRECISION NOT NULL DEFAULT 0 CHECK (amount >= 0),
                currency TEXT NOT NULL DEFAULT 'USD',
                branch_id UUID REFERENCES public.branches(id) ON DELETE SET NULL,
                description TEXT,
                created_at TIMESTAMPTZ DEFAULT NOW(),
                updated_at TIMESTAMPTZ DEFAULT NOW()
            );
        """))
        await db.execute(text("CREATE INDEX IF NOT EXISTS idx_expenses_branch ON public.expenses(branch_id);"))
        await db.execute(text("ALTER TABLE public.expenses DISABLE ROW LEVEL SECURITY;"))
        diagnostics["expenses_table_creation"] = "success_or_exists"
    except Exception as exc:
        diagnostics["expenses_table_creation_error"] = str(exc)

    try:
        # Create reviews table
        await db.execute(text("""
            CREATE TABLE IF NOT EXISTS public.reviews (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                customer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
                customer_name VARCHAR(255) NOT NULL,
                customer_company VARCHAR(255),
                customer_role VARCHAR(100),
                rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
                title VARCHAR(255),
                comment TEXT NOT NULL,
                approved BOOLEAN NOT NULL DEFAULT FALSE,
                created_at TIMESTAMPTZ DEFAULT NOW()
            );
        """))
        await db.execute(text("CREATE INDEX IF NOT EXISTS idx_reviews_customer ON public.reviews(customer_id);"))
        await db.execute(text("CREATE INDEX IF NOT EXISTS idx_reviews_approved ON public.reviews(approved) WHERE approved = true;"))
        await db.execute(text("ALTER TABLE public.reviews DISABLE ROW LEVEL SECURITY;"))
        diagnostics["reviews_table_creation"] = "success_or_exists"
    except Exception as exc:
        diagnostics["reviews_table_creation_error"] = str(exc)

    # Commit the DDL changes
    try:
        await db.commit()
        diagnostics["commit"] = "success"
    except Exception as exc:
        diagnostics["commit_error"] = str(exc)

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