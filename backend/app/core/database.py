from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase
from sqlalchemy.pool import NullPool

from app.core.config import settings


def _build_connect_args(url: str) -> dict:
    if "sqlite" in url:
        return {}
    # statement_cache_size=0 is required for PgBouncer/Supabase transaction pooler.
    # ssl="require" forces encrypted connection and IPv4-friendly resolution.
    args: dict = {
        "statement_cache_size": 0,
        "ssl": "require",
    }
    return args


db_url = settings.DATABASE_URL
if db_url.startswith("postgresql://"):
    db_url = db_url.replace("postgresql://", "postgresql+asyncpg://", 1)
elif db_url.startswith("postgres://"):
    db_url = db_url.replace("postgres://", "postgresql+asyncpg://", 1)


engine = create_async_engine(
    db_url,
    echo=settings.DEBUG,
    poolclass=NullPool,
    connect_args=_build_connect_args(db_url),
)

async_session_factory = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


class Base(DeclarativeBase):
    pass


async def get_db() -> AsyncSession:
    async with async_session_factory() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()
