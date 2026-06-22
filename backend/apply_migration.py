"""Generic migration runner: apply_migration.py <path-to-sql>.

Runs the whole script via asyncpg's simple-query protocol (allows multiple
statements / DO blocks in one shot), then reports remaining RLS tables.
"""
import asyncio, sys
from app.core.database import engine

async def main(path: str):
    with open(path, "r", encoding="utf-8") as f:
        sql = f.read()
    raw = await engine.raw_connection()
    try:
        ac = raw.driver_connection  # underlying asyncpg.Connection
        await ac.execute(sql)
        rls = await ac.fetchval(
            "select count(*) from pg_class c join pg_namespace n on n.oid=c.relnamespace "
            "where n.nspname='public' and c.relrowsecurity=true")
        print(f"Applied {path}. RLS-enabled public tables now: {rls}")
    finally:
        raw.close()
    await engine.dispose()

asyncio.run(main(sys.argv[1]))
