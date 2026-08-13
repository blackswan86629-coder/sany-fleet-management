"""WebSocket manager for real-time vehicle position updates."""
import json
import asyncio
from datetime import datetime, timezone
from fastapi import WebSocket
from typing import Dict, Set


class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, Set[WebSocket]] = {"vehicles": set(), "alerts": set()}

    async def connect(self, websocket: WebSocket, channel: str):
        await websocket.accept()
        if channel not in self.active_connections:
            self.active_connections[channel] = set()
        self.active_connections[channel].add(websocket)

    def disconnect(self, websocket: WebSocket, channel: str):
        self.active_connections.get(channel, set()).discard(websocket)

    async def broadcast(self, channel: str, data: dict):
        message = json.dumps(data, default=str)
        dead = []
        for ws in self.active_connections.get(channel, set()):
            try:
                await ws.send_text(message)
            except Exception:
                dead.append(ws)
        for ws in dead:
            self.active_connections.get(channel, set()).discard(ws)


ws_manager = ConnectionManager()
