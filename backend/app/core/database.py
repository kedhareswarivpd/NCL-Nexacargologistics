from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase
from sqlalchemy.pool import NullPool

from app.core.config import settings


def _build_connect_args(url: str) -> dict:
    if "sqlite" in url:
        return {}
    import ssl as _ssl
    import os
    # statement_cache_size=0 required for PgBouncer/Supabase transaction pooler.
    ssl_ctx = _ssl.create_default_context(_ssl.Purpose.SERVER_AUTH)
    ssl_ctx.minimum_version = _ssl.TLSVersion.TLSv1_2

    db_ssl_verify = os.getenv("DB_SSL_VERIFY", "True").lower() in ("true", "1", "yes")
    if db_ssl_verify:
        ssl_ctx.check_hostname = True
        ssl_ctx.verify_mode = _ssl.CERT_REQUIRED
        ssl_ca_path = os.getenv("DB_SSL_CA_PATH")
        if ssl_ca_path and os.path.exists(ssl_ca_path):
            ssl_ctx.load_verify_locations(ssl_ca_path)
    else:
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
            yield session  # NOSONAR
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()
