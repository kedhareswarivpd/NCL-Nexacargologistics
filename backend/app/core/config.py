import re
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    APP_NAME: str = "NexaCargo API"
    VERSION: str = "1.0.0"
    DEBUG: bool = True

    API_PREFIX: str = "/api/v1"

    DATABASE_URL: str

    SUPABASE_URL: str = ""
    SUPABASE_ANON_KEY: str = ""
    SUPABASE_SERVICE_ROLE_KEY: str = ""
    SUPABASE_JWT_SECRET: str = ""
    SUPABASE_JWT_AUDIENCE: str = "authenticated"

    JWT_SECRET: str = ""
    JWT_ALGORITHM: str = "HS256"
    JWT_ISSUER: str = "nexacargo-api"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24

    # Comma-separated explicit origins. Vercel/localhost handled by regex below.
    CORS_ORIGINS: str = "*"

    UPLOAD_DIR: str = "uploads"

    model_config = SettingsConfigDict(
        env_file=".env",
        case_sensitive=True,
        extra="ignore",
    )

    @property
    def cors_origin_list(self) -> list[str]:
        if self.CORS_ORIGINS.strip() == "*":
            return ["*"]
        return [o.strip() for o in self.CORS_ORIGINS.split(",") if o.strip()]


# Always-allowed origin patterns regardless of env var
CORS_ORIGIN_PATTERNS: list[re.Pattern] = [
    re.compile(r"^http://localhost:\d+$"),
    re.compile(r"^http://127\.0\.0\.1:\d+$"),
    re.compile(r"^https://.*\.vercel\.app$"),
    re.compile(r"^https://ncl-nexacargologistics-3\.onrender\.com$"),
]


def is_origin_allowed(origin: str, allowed_list: list[str]) -> bool:
    if "*" in allowed_list:
        return True
    if origin in allowed_list:
        return True
    return any(p.match(origin) for p in CORS_ORIGIN_PATTERNS)


settings = Settings()
