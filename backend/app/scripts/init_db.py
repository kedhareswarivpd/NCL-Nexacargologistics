"""
Database migration script — creates all tables defined in the ORM models.
Run this once against your Supabase database to ensure all tables exist.

Usage:
    python -m app.scripts.init_db
"""

import asyncio
import logging

from app.core.database import engine, Base
import app.models  # noqa: F401 — imports all models so metadata is populated

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


async def create_tables():
    """Create all tables defined in ORM models."""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    logger.info("All tables created successfully.")


async def verify_tables():
    """Verify that all expected tables exist."""
    from sqlalchemy import text

    expected_tables = [
        "profiles", "branches", "quotes", "shipments", "shipment_status_history",
        "documents", "containers", "routes", "vehicles", "deliveries",
        "warehouses", "inventory_items", "warehouse_tasks", "invoices",
        "payments", "expenses", "customs_entries", "insurance_policies",
        "support_tickets", "ticket_messages", "notifications", "audit_logs",
        "roles", "reviews", "job_applications",
    ]

    async with engine.begin() as conn:
        result = await conn.execute(text(
            "SELECT tablename FROM pg_tables WHERE schemaname = 'public'"
        ))
        existing = {row[0] for row in result}

    missing = [t for t in expected_tables if t not in existing]
    if missing:
        logger.warning("Missing tables: %s", ", ".join(missing))
        return False
    logger.info("All %d expected tables exist.", len(expected_tables))
    return True


async def main():
    logger.info("Creating tables...")
    await create_tables()
    logger.info("Verifying tables...")
    if await verify_tables():
        logger.info("Database initialization complete.")
    else:
        logger.error("Some tables are still missing. Check connection and models.")


if __name__ == "__main__":
    asyncio.run(main())
