
from fastapi import Body
import math
from fastapi import APIRouter, HTTPException
from app.firebase import realtime_db, firestore_db
from pydantic import BaseModel
from datetime import datetime

router = APIRouter()

def haversine_distance(lat1, lon1, lat2, lon2):
    R = 6371  
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lon2 - lon1)
    a = math.sin(dphi/2)**2 + math.cos(phi1)*math.cos(phi2)*math.sin(dlambda/2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
    return R * c

class BusLocationUpdate(BaseModel):
    bus_id: str
    latitude: float
    longitude: float
    speed: float = None  
    timestamp: str = None  

@router.post("/bus-locations-realtime/update")
def update_bus_location(data: BusLocationUpdate):
    """
    Update the real-time location of a bus in the database.
    Args:
        data (BusLocationUpdate): Bus location and status fields.
    Returns:
        dict: Success status and updated location data.
    """
    if not data.timestamp:
        data.timestamp = datetime.utcnow().isoformat() + 'Z'
    location_data = {
        "bus_id": data.bus_id,
        "latitude": data.latitude,
        "longitude": data.longitude,
        "timestamp": data.timestamp
    }
    if data.speed is not None:
        location_data["speed"] = data.speed
    realtime_db.child('bus_locations').child(data.bus_id).set(location_data)
    return {"success": True, "location": location_data}

@router.post("/bus-eta")
def calculate_eta(
    bus_lat: float = Body(...),
    bus_lon: float = Body(...),
    speed: float = Body(None),  # Make speed optional
    route_id: str = Body(None),
    stop_lat: float = Body(None),
    stop_lon: float = Body(None)
):
    """
    Calculate ETA (in minutes) for a bus to reach a stop using Haversine distance and speed.
    Args:
        bus_lat (float): Bus latitude.
        bus_lon (float): Bus longitude.
        speed (float, optional): Real-time speed.
        route_id (str, optional): Route ID for speed limit fallback.
        stop_lat (float, optional): Stop latitude.
        stop_lon (float, optional): Stop longitude.
    Returns:
        dict: ETA in minutes, distance in km, and speed used.
    """
    route_speed_limit = None
    if route_id:
        doc = firestore_db.collection('routes').document(route_id).get()
        if not doc.exists:
            return {"error": "Route not found"}
        route = doc.to_dict()
        stop_lat = route.get('end_latitude')
        stop_lon = route.get('end_longitude')
        route_speed_limit = route.get('speed_limit')
    if stop_lat is None or stop_lon is None:
        return {"error": "Destination coordinates required"}
    distance_km = haversine_distance(bus_lat, bus_lon, stop_lat, stop_lon)
    # Prefer realtime speed, else fallback to route speed_limit
    use_speed = speed if speed is not None and speed > 0 else route_speed_limit
    if use_speed is None or use_speed <= 0:
        return {"eta_minutes": None, "error": "Invalid speed (neither realtime nor route speed_limit available)"}
    eta_hours = distance_km / use_speed
    eta_minutes = int(eta_hours * 60)
    return {"eta_minutes": eta_minutes, "distance_km": round(distance_km, 2), "used_speed": use_speed}

