import os
import uuid
import logging
import warnings
import asyncio
from typing import Dict, Any

from fastapi import FastAPI, Depends, HTTPException, Body, Request
from fastapi.responses import JSONResponse
from starlette.status import HTTP_500_INTERNAL_SERVER_ERROR
from fastapi.middleware.cors import CORSMiddleware

from app.rate_limit import limiter, _rate_limit_exceeded_handler, RateLimitExceeded

from app.middleware import HTTPSRedirectMiddleware
from app.utils.env_loader import load_env
from app.routes import (
    sos_admin,
    reverse_geocode,
    auth,
    otp,
    feedback,
    lostfound,
    contact,
    analytics,
    users,
    buses,
    routes,
    bus_locations_realtime,
    bus_location_update,
    batch_upload,
    user_dashboard_analytics,
    sos,
    notifications,
)
from app.routes import sms_webhook
from app.routes import driver_status, timetable,bus_locations_realtime_update
from app.routes.otp import start_cleanup_task
from app.firebase import firestore_db, realtime_db
from app.routes import bus_location_ws
from app.routes import open_data

# ---------------------------------------------------------------------
# Suppress noisy logs and CancelledError tracebacks
# ---------------------------------------------------------------------

logging.getLogger("uvicorn.error").setLevel(logging.WARNING)
logging.getLogger("uvicorn.access").setLevel(logging.INFO)


asyncio.get_event_loop().set_exception_handler(
    lambda loop, context: None
    if isinstance(context.get("exception"), asyncio.CancelledError)
    else loop.default_exception_handler(context)
)

# ---------------------------------------------------------------------
# Load environment
# ---------------------------------------------------------------------
load_env()

# ---------------------------------------------------------------------
# App setup
# ---------------------------------------------------------------------
app = FastAPI()

# ---------------------------------------------------------------------
# Compression Middleware (try starlette-compress, then brotli-asgi)
# ---------------------------------------------------------------------
compression_enabled = False
try:
    from starlette_compress import CompressMiddleware

    app.add_middleware(
        CompressMiddleware,
        minimum_size=500,
        gzip_level=6,
        brotli_quality=5,
    )
    print("Compression middleware enabled (starlette-compress).")
    compression_enabled = True
except ImportError:
    try:
        from brotli_asgi import BrotliMiddleware
        app.add_middleware(
            BrotliMiddleware,
            quality=5,
            gzip_fallback=True,
            minimum_size=500,
        )
        print("Compression middleware enabled (brotli-asgi).")
        compression_enabled = True
    except ImportError:
        print("No compression middleware installed. Skipping.")

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# ---------------------------------------------------------------------
# Global error handler
# ---------------------------------------------------------------------
@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception):
    # Log internally
    print(f"Internal error: {exc}")
    return JSONResponse(
        status_code=HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "Internal server error. Please try again later."},
    )

# ---------------------------------------------------------------------
# CORS
# ---------------------------------------------------------------------

# Harden CORS: always use whitelist except for explicit local dev
env = os.getenv("ENV", "development")
if env == "development":
    origins = ["*"]
else:
    origins = [o.rstrip('/') for o in os.getenv("ALLOWED_ORIGINS", "").split(",") if o]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------
# HTTPS redirect (prod only)
# ---------------------------------------------------------------------
if os.getenv("ENV", "development") == "production":
    app.add_middleware(HTTPSRedirectMiddleware)

# ---------------------------------------------------------------------
 # Routers
 # ---------------------------------------------------------------------
app.include_router(timetable.router, prefix="/api", tags=["timetable"])
app.include_router(sos_admin.router, prefix="/api", tags=["sos-admin"])
app.include_router(reverse_geocode.router, prefix="/api")
app.include_router(notifications.router, prefix="/api/notifications", tags=["notifications"])
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(otp.router, prefix="/api/auth", tags=["otp"])
app.include_router(feedback.router, prefix="/api", tags=["feedback"])
app.include_router(lostfound.router, prefix="/api", tags=["lostfound"])
app.include_router(contact.router, prefix="/api", tags=["contact"])
app.include_router(analytics.router, prefix="/api", tags=["analytics"])
app.include_router(users.router, prefix="/api", tags=["users"])
app.include_router(buses.router, prefix="/api", tags=["buses"])
app.include_router(routes.router, prefix="/api", tags=["routes"])
app.include_router(bus_locations_realtime.router, prefix="/api", tags=["bus-locations-realtime"])
app.include_router(bus_locations_realtime_update.router, prefix="/api", tags=["bus-locations-realtime-update"])
app.include_router(bus_location_update.router, prefix="/api", tags=["bus-location-update"])
app.include_router(batch_upload.router, prefix="/api", tags=["batch-upload"])
app.include_router(user_dashboard_analytics.router, prefix="/api", tags=["user-dashboard-analytics"])
app.include_router(sos.router, prefix="/api", tags=["sos", "incident"])
app.include_router(driver_status.router, prefix="/api/drivers", tags=["drivers"])
app.include_router(bus_location_ws.router)
app.include_router(open_data.router, prefix="/api")
app.include_router(sms_webhook.router, prefix="/api", tags=["sms-webhook"])

# ---------------------------------------------------------------------
# Utility: Dashboard analytics
# ---------------------------------------------------------------------
def get_dashboard_analytics(user_id: str) -> Dict[str, Any]:
    user_ref = firestore_db.collection("users").document(user_id)
    user_doc = user_ref.get()
    if not user_doc.exists:
        raise HTTPException(status_code=404, detail="User not found")

    user_data = user_doc.to_dict()
    points = user_data.get("points", 0)
    level = user_data.get("level", 1)

    achievements_ref = firestore_db.collection("achievements")
    achievements = [a for a in achievements_ref.stream()]
    total_achievements = len(achievements)

    user_achievements_ref = user_ref.collection("achievements")
    user_achievements = [
        a for a in user_achievements_ref.stream() if a.to_dict().get("isCompleted")
    ]
    completed_achievements = len(user_achievements)

    buses_ref = firestore_db.collection("buses")
    buses = [b for b in buses_ref.stream()]
    total_buses = len(buses)
    active_buses = len([b for b in buses if b.to_dict().get("status") == "active"])

    return {
        "points": points,
        "level": level,
        "total_achievements": total_achievements,
        "completed_achievements": completed_achievements,
        "total_buses": total_buses,
        "active_buses": active_buses,
    }

# ---------------------------------------------------------------------
# Health check
# ---------------------------------------------------------------------
@app.get("/api/health")
def health_check():
    return {"status": "ok", "compression": compression_enabled}

# ---------------------------------------------------------------------
# Startup tasks
# ---------------------------------------------------------------------
@app.on_event("startup")
def startup_event():
    start_cleanup_task()
