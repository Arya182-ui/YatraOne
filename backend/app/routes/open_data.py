from fastapi import APIRouter
from app.firebase import realtime_db
from fastapi.responses import JSONResponse

router = APIRouter()

@router.get("/open/bus-locations", tags=["open-data"])
async def get_open_bus_locations():
    """
    Public API: Get live locations of all buses (Open Data API).
    Returns: List of {bus_id, latitude, longitude, speed, timestamp}
    """
    bus_locations = realtime_db.child('bus_locations').get().val() or {}
    result = []
    for bus_id, loc in bus_locations.items():
        result.append({
            "bus_id": bus_id,
            "latitude": loc.get("latitude"),
            "longitude": loc.get("longitude"),
            "speed": loc.get("speed"),
            "timestamp": loc.get("timestamp"),
        })
    return JSONResponse(result)
