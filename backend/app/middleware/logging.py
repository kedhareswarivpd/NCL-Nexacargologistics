import time
import logging
from starlette.middleware.base import BaseHTTPMiddleware

logger = logging.getLogger(__name__)


class LoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        start = time.time()
        response = await call_next(request)
        duration = time.time() - start
        logger.info(
            "%s %s %s %sB %.3fs",
            request.method,
            request.url.path,
            response.status_code,
            response.headers.get("content-length", "0"),
            duration,
        )
        return response
