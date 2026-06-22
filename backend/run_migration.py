"""One-off runner for migration 0001 (backend JWT auth). Uses the app engine."""
import asyncio
from sqlalchemy import text
from app.core.database import engine


async def main():
    async with engine.begin() as conn:
        await conn.execute(text(
            "alter table public.profiles add column if not exists password_hash text"
        ))
        await conn.execute(text(
            "alter table public.profiles drop constraint if exists profiles_id_fkey"
        ))
        # Verify.
        col = await conn.execute(text(
            "select column_name from information_schema.columns "
            "where table_schema='public' and table_name='profiles' "
            "and column_name='password_hash'"
        ))
        fk = await conn.execute(text(
            "select constraint_name from information_schema.table_constraints "
            "where table_schema='public' and table_name='profiles' "
            "and constraint_name='profiles_id_fkey'"
        ))
        print("password_hash column present:", col.first() is not None)
        print("profiles_id_fkey still present:", fk.first() is not None)
    await engine.dispose()


asyncio.run(main())
