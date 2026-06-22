"""
Application configuration loaded from environment / .env.

Authentication is delegated to Supabase. The backend only *verifies* the
Supabase-issued JWT — it never issues or stores passwords. All business data
lives in the same Supabase Postgres database (DATABASE_URL).
"""

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    APP_NAME: str = "NexaCargo API"
    VERSION: str = "1.0.0"
    DEBUG: bool = True

    API_PREFIX: str = "/api/v1"

    # Supabase Postgres connection string.
    # Format: postgresql+asyncpg://USER:PASSWORD@HOST:6543/postgres
    # NOTE: any special character in the password (e.g. '@') must be URL-encoded.
    DATABASE_URL: str

    # --- Supabase auth ---------------------------------------------------
    # Project URL, e.g. https://<ref>.supabase.co
    SUPABASE_URL: str = ""
    # Public anon key (used as apikey for remote token verification fallback).
    SUPABASE_ANON_KEY: str = ""
    # Service-role key (server-side admin operations: list/create auth users).
    SUPABASE_SERVICE_ROLE_KEY: str = ""
    # Legacy HS256 JWT secret (Project Settings -> API -> JWT Secret).
    # When set, tokens are verified locally (fast path). Otherwise the backend
    # falls back to calling Supabase's /auth/v1/user endpoint.
    SUPABASE_JWT_SECRET: str = ""
    SUPABASE_JWT_AUDIENCE: str = "authenticated"

    # --- Backend-issued JWTs (alongside Supabase) ------------------------
    # When set, /api/auth/login and /api/auth/register issue HS256 tokens
    # signed with this secret. Leave empty to disable backend-issued auth
    # (Supabase token verification keeps working regardless). Generate one
    # with e.g. `python -c "import secrets; print(secrets.token_urlsafe(48))"`.
    JWT_SECRET: str = ""
    JWT_ALGORITHM: str = "HS256"
    # Identifies our own tokens so they can be told apart from Supabase tokens.
    JWT_ISSUER: str = "nexacargo-api"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24h

    CORS_ORIGINS: str = "http://localhost:3000"

    UPLOAD_DIR: str = "uploads"

    model_config = SettingsConfigDict(
        env_file=".env",
        case_sensitive=True,
        extra="ignore",
    )

    @property
    def cors_origin_list(self) -> list[str]:
        return [o.strip() for o in self.CORS_ORIGINS.split(",") if o.strip()]


settings = Settings()
