# Service to get ETA and next stop for a bus number
from app.firebase import firestore_db
import math

def haversine(lat1, lon1, lat2, lon2):
    R = 6371  # km
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)
    a = math.sin(delta_phi/2)**2 + math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda/2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
    return R * c

def get_eta_and_next_stop_for_bus(bus_number: str):
    # Find bus by number
    buses_ref = firestore_db.collection('buses')
    bus_docs = buses_ref.where('number', '==', bus_number).stream()
    bus = None
    for doc in bus_docs:
        bus = doc.to_dict()
        bus['id'] = doc.id
        break
    if not bus or 'currentLocation' not in bus or not bus['currentLocation']:
        return None
    # Get route
    route_id = bus.get('route')
    if not route_id:
        return None
    route_doc = firestore_db.collection('routes').document(route_id).get()
    if not route_doc.exists:
        return None
    route = route_doc.to_dict()
    stops = route.get('stops', [])
    if not stops:
        return None
    # For demo: next stop is first in list
    next_stop_name = stops[0] if isinstance(stops[0], str) else stops[0].get('name', '-')
    # Dummy: use route end as next stop location
    end_lat = route.get('end_latitude')
    end_lon = route.get('end_longitude')
    bus_lat = bus['currentLocation'].get('latitude')
    bus_lon = bus['currentLocation'].get('longitude')
    if None in (bus_lat, bus_lon, end_lat, end_lon):
        return None
    distance_km = haversine(bus_lat, bus_lon, end_lat, end_lon)
    speed = bus.get('speed', 20)  # fallback speed
    eta = int(distance_km / speed * 60) if speed > 0 else None

    # Reverse geocode current location
    import requests
    try:
        url = f"https://nominatim.openstreetmap.org/reverse?format=json&lat={bus_lat}&lon={bus_lon}&accept-language=en"
        headers = {"User-Agent": "YatraOne/1.0 (contact@yatraone.com)"}
        resp = requests.get(url, headers=headers, timeout=5)
        resp.raise_for_status()
        data = resp.json()
        address = data.get('display_name', f"{bus_lat},{bus_lon}")
    except Exception:
        address = f"{bus_lat},{bus_lon}"

    return {
        "bus_number": bus_number,
        "current_location": address,
        "eta": eta,
        "next_stop": next_stop_name
    }
from app.firebase import firestore_db
import math
