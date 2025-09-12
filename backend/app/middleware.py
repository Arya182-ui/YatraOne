import os
from fastapi import Request
from fastapi.responses import RedirectResponse
from starlette.middleware.base import BaseHTTPMiddleware

class HTTPSRedirectMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        if os.getenv("ENV", "development") == "production" and request.url.scheme != "https":
            url = request.url.replace(scheme="https")
            return RedirectResponse(url)
        return await call_next(request)
