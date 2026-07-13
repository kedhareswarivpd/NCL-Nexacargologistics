import logging

from contextlib import asynccontextmanager
from fastapi import Depends, FastAPI, Request
from fastapi.responses import Response
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings, is_origin_allowed
from app.core.database import engine, get_db
from app.api import api_router
from app.middleware.logging import LoggingMiddleware

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    import asyncio
    for attempt in range(5):
        try:
            async with engine.connect() as conn:
                await conn.execute(text("SELECT 1"))
            logger.info("Database connection pool warmed up.")
            break
        except Exception as exc:
            logger.warning("DB warm-up attempt %d failed: %s", attempt + 1, exc)
            if attempt < 4:
                await asyncio.sleep(2 ** attempt)
    yield


app = FastAPI(title=settings.APP_NAME, version=settings.VERSION, lifespan=lifespan)


@app.middleware("http")
async def cors_middleware(request: Request, call_next):
    origin = request.headers.get("origin", "")
    allowed = is_origin_allowed(origin, settings.cors_origin_list)

    if request.method == "OPTIONS":
        response = Response(status_code=204)
        if allowed and origin:
            response.headers["Access-Control-Allow-Origin"] = origin
            response.headers["Access-Control-Allow-Credentials"] = "true"
            response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, PATCH, DELETE, OPTIONS"
            response.headers["Access-Control-Allow-Headers"] = "*"
            response.headers["Access-Control-Max-Age"] = "86400"
        return response

    response = await call_next(request)

    if origin:
        if allowed:
            response.headers["Access-Control-Allow-Origin"] = origin
        else:
            # Still set wildcard so browser doesn't hard-block the response
            response.headers["Access-Control-Allow-Origin"] = "*"
        response.headers["Access-Control-Allow-Credentials"] = "true"
        response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, PATCH, DELETE, OPTIONS"
        response.headers["Access-Control-Allow-Headers"] = "*"
        response.headers["Vary"] = "Origin"

    return response


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
