"""
Database engine & session factory (SQLAlchemy async, asyncpg driver).

Connects to the Supabase Postgres instance. We use the Supabase connection
pooler (port 6543, PgBouncer in transaction mode), so prepared-statement
caching must be disabled and we let PgBouncer own the pooling (NullPool here).
"""

from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase
from sqlalchemy.pool import NullPool

from app.core.config import settings


def _build_connect_args(url: str) -> dict:
    # Disable asyncpg statement cache — required behind PgBouncer (transaction mode).
    args: dict = {"statement_cache_size": 0}
    if "supabase.co" in url or "pooler.supabase.com" in url:
        # asyncpg can't validate Supabase's self-signed pooler cert chain on some
        # setups; SSL is still negotiated. Keep simple + compatible.
        args["server_settings"] = {"application_name": "nexacargo-api"}
    return args


engine = create_async_engine(
    settings.DATABASE_URL,
    echo=settings.DEBUG,
    poolclass=NullPool,
    connect_args=_build_connect_args(settings.DATABASE_URL),
)

async_session_factory = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


class Base(DeclarativeBase):
    pass


async def get_db() -> AsyncSession:
    """FastAPI dependency that yields an async DB session (commit on success)."""
    async with async_session_factory() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()
