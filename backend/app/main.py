import logging
from typing import Annotated

from contextlib import asynccontextmanager
from fastapi import Depends, FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import Response

from app.core.config import settings, is_origin_allowed
from app.core.database import engine, Base
from app.api import api_router
from app.middleware.logging import LoggingMiddleware
from app.middleware.rate_limit import RateLimitMiddleware
import app.models  # noqa: F401

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        return response


@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        import app.models  # noqa: F401 — ensure all models are imported
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        logger.info("Database tables initialized successfully.")
    except Exception as exc:
        if "SSL" in str(exc) or "CERTIFICATE" in str(exc):
            logger.error(
                "Database SSL connection failed. For local development, set DB_SSL_VERIFY=False in .env. Error: %s", exc
            )
        else:
            logger.error("Database auto-initialization failed: %s", exc, exc_info=True)
        raise RuntimeError(f"Database initialization failed: {exc}") from exc
    yield


from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse

app = FastAPI(title=settings.APP_NAME, version=settings.VERSION, lifespan=lifespan)


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """Format Pydantic validation errors into a clean, user-friendly message."""
    messages = []
    for error in exc.errors():
        # Extract field name from location, skipping 'body' prefix
        loc = [str(l) for l in error.get("loc", []) if l != "body"]
        field = loc[-1] if loc else "input"
        msg = error.get("msg", "Invalid value")
        # Clean up common Pydantic error messages
        msg = msg.replace("Value error, ", "")
        messages.append(f"{field}: {msg}")
    clean_msg = "; ".join(messages) if messages else "Invalid request input."
    return JSONResponse(
        status_code=422,
        content={"detail": clean_msg},
    )


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Catch uncaught exceptions gracefully without exposing tracebacks to users."""
    logger.error("Uncaught exception processing %s %s: %s", request.method, request.url.path, exc, exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "An unexpected error occurred. Please try again later."},
    )


app.add_middleware(LoggingMiddleware)
app.add_middleware(SecurityHeadersMiddleware)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_origin_regex=r"^http://(localhost|127\.0\.0\.1):\d+$|^https://ncl-[a-zA-Z0-9-]+\.vercel\.app$|^https://ncl-nexacargologistics-[a-zA-Z0-9-]+\.onrender\.com$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router)


@app.get("/")
async def root():
    return {"message": "NexaCargo API", "docs": "/docs", "health": "/health"}


if __name__ == "__main__":
    import uvicorn
    import os
    host = os.getenv("HOST", "127.0.0.1")
    uvicorn.run("app.main:app", host=host, port=8000, reload=True)
