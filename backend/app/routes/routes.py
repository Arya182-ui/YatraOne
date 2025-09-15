from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import List, Optional

import math
import requests
# --------------------------
# Geocoding Helper (OpenStreetMap Nominatim)
# --------------------------
def geocode_address(address):
    url = "https://nominatim.openstreetmap.org/search"
    params = {
        "q": address,
        "format": "json",
        "limit": 1
    }
    try:
        response = requests.get(url, params=params, headers={"User-Agent": "YatraOne/1.0"}, timeout=5)
        data = response.json()
        if data:
            return float(data[0]["lat"]), float(data[0]["lon"])
    except Exception:
        pass
    return None, None

# For stops: list of names -> list of dicts with lat/lon
def geocode_stops(stop_names):
    stops = []
    for name in stop_names:
        lat, lon = geocode_address(name)
        stops.append({"name": name, "latitude": lat, "longitude": lon})
    return stops

from app.firebase import firestore_db  # Firestore client

router = APIRouter()

# --------------------------
# Pydantic Route Model
# --------------------------
class Route(BaseModel):
    start_latitude: float
    start_longitude: float
    end_latitude: float
    end_longitude: float
    route_name: str = Field(..., description="Unique name of the route")  # required & unique
    stops: Optional[List[str]] = None
    speed_limit: Optional[float] = Field(None, description="Speed limit for this route in km/h")

# --------------------------
# Haversine Distance Function
# --------------------------
def haversine(lat1, lon1, lat2, lon2):
    R = 6371  # km
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)
    a = math.sin(delta_phi/2)**2 + math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda/2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
    return R * c

# --------------------------
# GET all routes
# --------------------------
@router.get("/routes")
def get_routes():
    routes_ref = firestore_db.collection('routes')
    routes_docs = list(routes_ref.stream())
    routes = []
    for doc in routes_docs:
        d = doc.to_dict()
        d['id'] = doc.id
        routes.append(d)
    return routes

# --------------------------
# POST create new route
# --------------------------
@router.post("/routes")

def add_route(route: Route):
    # Check if route_name already exists
    existing = firestore_db.collection('routes').where("route_name", "==", route.route_name).stream()
    if any(existing):
        raise HTTPException(status_code=400, detail=f"Route name '{route.route_name}' already exists")

    route_data = route.dict()

    # Geocode start/end if missing or zero
    if (not route_data.get('start_latitude') or not route_data.get('start_longitude')) and route_data.get('start_location_name'):
        lat, lon = geocode_address(route_data['start_location_name'])
        route_data['start_latitude'], route_data['start_longitude'] = lat, lon
    if (not route_data.get('end_latitude') or not route_data.get('end_longitude')) and route_data.get('end_location_name'):
        lat, lon = geocode_address(route_data['end_location_name'])
        route_data['end_latitude'], route_data['end_longitude'] = lat, lon

    # Geocode stops if provided as names (list of str)
    stops = route_data.get('stops')
    if stops and isinstance(stops, list) and (isinstance(stops[0], str) or stops == []):
        route_data['stops'] = geocode_stops(stops)

    # Calculate distance
    total_distance = haversine(
        route_data['start_latitude'], route_data['start_longitude'],
        route_data['end_latitude'], route_data['end_longitude']
    )
    route_data['total_distance_km'] = total_distance

    try:
        doc_ref = firestore_db.collection('routes').document()
        doc_ref.set(route_data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Firestore error: {str(e)}")

    return {"id": doc_ref.id, **route_data}

# --------------------------
# PATCH update existing route
# --------------------------
@router.patch("/routes/{route_id}")
def update_route(route_id: str, route: dict):
    doc_ref = firestore_db.collection('routes').document(route_id)
    if not doc_ref.get().exists:
        raise HTTPException(status_code=404, detail="Route not found")

    # Unique route_name check if route_name is being updated
    if 'route_name' in route:
        existing = firestore_db.collection('routes')\
            .where("route_name", "==", route['route_name']).stream()
        for doc in existing:
            if doc.id != route_id:
                raise HTTPException(status_code=400, detail=f"Route name '{route['route_name']}' already exists")


    # Distance update if all coordinates provided
    mandatory_fields = ['start_latitude', 'start_longitude', 'end_latitude', 'end_longitude']
    if all(field in route for field in mandatory_fields):
        distance = haversine(
            route['start_latitude'], route['start_longitude'],
            route['end_latitude'], route['end_longitude']
        )
        route['total_distance_km'] = distance

    doc_ref.update(route)
    return {"id": route_id, **route}

# --------------------------
# DELETE a route
# --------------------------
@router.delete("/routes/{route_id}")
def delete_route(route_id: str):
    doc_ref = firestore_db.collection('routes').document(route_id)
    if not doc_ref.get().exists:
        raise HTTPException(status_code=404, detail="Route not found")
    doc_ref.delete()
    return {"success": True}
