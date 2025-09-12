from fastapi import APIRouter, HTTPException

from app.firebase import realtime_db

router = APIRouter()

@router.get("/bus-locations-realtime")
def get_bus_locations_realtime():
    locations_ref = realtime_db.child('bus_locations')
    locations_data = locations_ref.get()
    if not locations_data:
        return []
    # locations_data is a dict of bus_id: {...locationData...}
    buses = []
    for bus_id, loc in locations_data.items():
        loc['id'] = bus_id
        buses.append(loc)
    return buses
