
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from typing import Dict, List
import json
from app.firebase import realtime_db
from datetime import datetime

router = APIRouter()

class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, List[WebSocket]] = {}

    async def connect(self, bus_id: str, websocket: WebSocket):
        await websocket.accept()
        if bus_id not in self.active_connections:
            self.active_connections[bus_id] = []
        self.active_connections[bus_id].append(websocket)

    def disconnect(self, bus_id: str, websocket: WebSocket):
        if bus_id in self.active_connections:
            self.active_connections[bus_id].remove(websocket)
            if not self.active_connections[bus_id]:
                del self.active_connections[bus_id]

    async def broadcast(self, bus_id: str, data: dict):
        if bus_id in self.active_connections:
            for connection in self.active_connections[bus_id]:
                await connection.send_json(data)

manager = ConnectionManager()


@router.websocket("/ws/bus-location/{bus_id}")
async def bus_location_ws(websocket: WebSocket, bus_id: str):
    await manager.connect(bus_id, websocket)
    try:
        while True:
            msg = await websocket.receive_text()
            try:
                data = json.loads(msg)
                # Validate required fields
                lat = data.get('latitude')
                lon = data.get('longitude')
                speed = data.get('speed')
                driver_id = data.get('driver_id')
                timestamp = data.get('timestamp') or datetime.utcnow().isoformat()
                if lat is None or lon is None or speed is None or driver_id is None:
                    continue  # skip invalid
                # Update Firebase Realtime DB
                loc_data = {
                    'latitude': lat,
                    'longitude': lon,
                    'driver_id': driver_id,
                    'speed': speed,
                    'timestamp': timestamp,
                }
                realtime_db.child('bus_locations').child(bus_id).set(loc_data)
                # Broadcast to all clients
                await manager.broadcast(bus_id, loc_data)
            except Exception as e:
                # Optionally log error
                continue
    except WebSocketDisconnect:
        manager.disconnect(bus_id, websocket)