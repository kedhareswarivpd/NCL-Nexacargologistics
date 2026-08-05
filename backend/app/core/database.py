from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase
from sqlalchemy.pool import NullPool

from app.core.config import settings


def _build_connect_args(url: str) -> dict:
    if "sqlite" in url:
        return {}
    import ssl as _ssl
    # statement_cache_size=0 required for PgBouncer/Supabase transaction pooler.
    # We create an SSL context that does NOT verify the Supabase self-signed cert
    # but still uses TLS encryption — this forces IPv4 DNS resolution on Render.
    ssl_ctx = _ssl.create_default_context()
    ssl_ctx.check_hostname = False
    ssl_ctx.verify_mode = _ssl.CERT_NONE
    return {
        "statement_cache_size": 0,
        "ssl": ssl_ctx,
        "command_timeout": 60,
        "server_settings": {
            "statement_timeout": "60000",
            "idle_in_transaction_session_timeout": "60000"
        }
    }


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
