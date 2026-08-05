import logging

from contextlib import asynccontextmanager
from fastapi import Depends, FastAPI, Request
from fastapi.responses import Response
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings, is_origin_allowed
from app.core.database import engine, get_db, Base
from app.api import api_router
from app.middleware.logging import LoggingMiddleware
import app.models  # noqa: F401

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        logger.info("Database tables initialized successfully.")
    except Exception as exc:
        logger.warning("Database auto-initialization skipped/failed: %s", exc)
    yield


from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse, Response

app = FastAPI(title=settings.APP_NAME, version=settings.VERSION, lifespan=lifespan)


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """Format Pydantic validation errors into a clean, user-friendly message."""
    messages = []
    for error in exc.errors():
        field = " -> ".join(str(loc) for loc in error.get("loc", []) if loc != "body")
        msg = error.get("msg", "Invalid value")
        messages.append(f"Field '{field}': {msg}" if field else msg)
    clean_msg = "; ".join(messages) if messages else "Invalid request input."
    return JSONResponse(
        status_code=422,
        content={"detail": clean_msg, "errors": exc.errors()},
    )


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Catch uncaught exceptions gracefully without exposing tracebacks to users."""
    logger.error("Uncaught exception processing %s %s: %s", request.method, request.url.path, exc, exc_info=True)
    msg = f"Server Error ({type(exc).__name__}): {str(exc)}"
    return JSONResponse(
        status_code=500,
        content={"detail": msg},
    )


app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_origin_regex=r"^http://(localhost|127\.0\.0\.1):\d+$|^https://ncl-[a-zA-Z0-9-]+\.vercel\.app$|^https://ncl-nexacargologistics-[a-zA-Z0-9-]+\.onrender\.com$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(LoggingMiddleware)
app.include_router(api_router)


@app.get("/health")
async def health(db: AsyncSession = Depends(get_db)):
    await db.execute(text("SELECT 1"))
    return {"status": "ok", "service": settings.APP_NAME, "version": settings.VERSION}


@app.get("/")
async def root():
    return {"message": "NexaCargo API", "docs": "/docs", "health": "/health"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
