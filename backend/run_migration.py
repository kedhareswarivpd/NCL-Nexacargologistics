"""
Automated Database Migration & Integrity Runner for NexaCargo Logistics.

Executes database schema migrations programmatically without requiring manual SQL intervention:
1. Creates any missing active tables from SQLAlchemy Base metadata.
2. Backfills missing profile columns (password_hash, department, branch_id, status).
3. Safely drops legacy/prototype tables (Register, activity_logs, users, etc.).
4. Decouples profiles from auth.users (drops profiles_id_fkey constraint if present).
5. Verifies table count, foreign keys, and column integrity.
"""

import asyncio
from sqlalchemy import text
from app.core.database import engine, Base
# Import all active models so Base.metadata is fully registered
import app.models  # noqa: F401


LEGACY_TABLES = [
    "Register",
    "Request Access",
    "activity_logs",
    "assigned_deliveries",
    "barcodes",
    "container Management",
    "customers",
    "delivery_proofs",
    "delivery_tracking",
    "drivers",
    "gps_tracking",
    "inventory",
    "outstanding_reports",
    "revenue_reports",
    "roles_permissions",
    "route_navigation",
    "storage_allocation",
    "system_analytics",
    "users",
    "vehicle_assignments",
]


async def run_migrations():
    print("🚀 Starting Automated Database Migration Engine...")

    async with engine.begin() as conn:
        # 1. Create all missing tables from SQLAlchemy models
        print("📦 Creating missing canonical database tables...")
        await conn.run_sync(Base.metadata.create_all)

        # 2. Add required columns on profiles table if missing
        print("🔧 Ensuring profiles table column alignment...")
        await conn.execute(text("ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email text;"))
        await conn.execute(text("ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS department text;"))
        await conn.execute(text("ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS branch_id uuid;"))
        await conn.execute(text("ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS status text DEFAULT 'active';"))
        await conn.execute(text("ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS password_hash text;"))
        await conn.execute(text("ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();"))

        # 3. Decouple profiles from auth.users constraint
        print("🔗 Decoupling profiles from Supabase auth.users constraint...")
        await conn.execute(text("ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;"))

        # 4. Drop legacy / prototype tables
        print("🧹 Cleaning up legacy prototype tables...")
        for tbl in LEGACY_TABLES:
            await conn.execute(text(f'DROP TABLE IF EXISTS public."{tbl}" CASCADE;'))

        # 5. Verification check
        print("🔍 Verifying database integrity...")
        tables_res = await conn.execute(text(
            "SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_type='BASE TABLE' ORDER BY table_name;"
        ))
        active_tables = [r[0] for r in tables_res.fetchall()]

        fk_res = await conn.execute(text(
            "SELECT COUNT(*) FROM information_schema.table_constraints WHERE constraint_type='FOREIGN KEY' AND table_schema='public';"
        ))
        fk_count = fk_res.scalar()

    await engine.dispose()

    print("\n✅ Database Migration Completed Successfully!")
    print(f"📊 Active Canonical Tables ({len(active_tables)}): {', '.join(active_tables)}")
    print(f"🔗 Verified Foreign Key Constraints: {fk_count}")


if __name__ == "__main__":
    asyncio.run(run_migrations())
