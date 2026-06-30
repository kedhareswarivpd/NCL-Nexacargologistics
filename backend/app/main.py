import logging

from fastapi import FastAPI, Request
from fastapi.responses import Response

from app.core.config import settings, is_origin_allowed
from app.api import api_router
from app.middleware.logging import LoggingMiddleware

logging.basicConfig(level=logging.INFO)

app = FastAPI(title=settings.APP_NAME, version=settings.VERSION)


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
async def health():
    return {"status": "ok", "service": settings.APP_NAME, "version": settings.VERSION}


@app.get("/")
async def root():
    return {"message": "NexaCargo API", "docs": "/docs", "health": "/health"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
