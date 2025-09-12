from fastapi import APIRouter, HTTPException, Body, Depends
from app.firebase import realtime_db, firestore_db
from pydantic import BaseModel
from typing import Optional
from app.routes.bus_location_ws import manager
from datetime import datetime

router = APIRouter()

class LocationUpdateRequest(BaseModel):
    bus_id: str
    latitude: float
    longitude: float
    speed: float  # Now required
    timestamp: Optional[str] = None
    driver_id: str

@router.post("/bus-locations-realtime/update")
async def update_bus_location(data: LocationUpdateRequest):
    """
    Update the real-time location and speed of a bus. Only the assigned driver can update.
    Speed is now required and must be sent by the driver app (from Android GPS).
    """
    bus_ref = firestore_db.collection('buses').document(data.bus_id)
    bus_doc = bus_ref.get()
    if not bus_doc.exists:
        raise HTTPException(status_code=404, detail="Bus not found")
    bus = bus_doc.to_dict()
    assigned_driver = bus.get('driverId') or bus.get('driver_id')
    if not assigned_driver or assigned_driver != data.driver_id:
        raise HTTPException(status_code=403, detail="You are not assigned to this bus")
    if data.speed is None:
        raise HTTPException(status_code=400, detail="Speed is required and must be sent from the app.")
    loc_data = {
        'latitude': data.latitude,
        'longitude': data.longitude,
        'driver_id': data.driver_id,
        'speed': data.speed,
    }
    if data.timestamp is not None:
        loc_data['timestamp'] = data.timestamp
    realtime_db.child('bus_locations').child(data.bus_id).set(loc_data)

    # Broadcast to all websocket clients for this bus
    await manager.broadcast(
        data.bus_id,
        {
            "latitude": data.latitude,
            "longitude": data.longitude,
            "speed": data.speed,
            "timestamp": datetime.utcnow().isoformat()
        }
    )
    return {"success": True, "bus_id": data.bus_id, "location": loc_data}
