from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from typing import Dict, List

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
            await websocket.receive_text()  # Keeps the connection alive
    except WebSocketDisconnect:
        manager.disconnect(bus_id, websocket)