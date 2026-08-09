"""
Rate limiting middleware for API endpoints.
Simple in-memory token bucket algorithm.
Applied globally but only enforced on auth routes.
"""

import os
import time
from collections import defaultdict

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import JSONResponse

_buckets: dict[str, list[float]] = defaultdict(list)

# Routes to rate limit: (path_prefix, max_requests, window_seconds)
_RATE_LIMITED_ROUTES = [
    ("/auth/login", 10, 60),
    ("/auth/register", 5, 60),
    ("/auth/forgot-password", 3, 60),
]


class RateLimitMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        if os.environ.get("TESTING") == "true":
            return await call_next(request)

        path = request.url.path
        for prefix, max_requests, window in _RATE_LIMITED_ROUTES:
            if path.startswith(prefix or ""):
                client_ip = request.client.host if request.client else "unknown"
                now = time.time()
                key = f"{client_ip}:{path}"
                _buckets[key] = [t for t in _buckets[key] if now - t < window]
                if len(_buckets[key]) >= max_requests:
                    return JSONResponse(
                        status_code=429,
                        content={"detail": f"Rate limit exceeded. Try again in {window} seconds."},
                        headers={"Retry-After": str(window)},
                    )
                _buckets[key].append(now)
                break

        return await call_next(request)
