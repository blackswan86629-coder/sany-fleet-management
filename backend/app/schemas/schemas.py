"""Pydantic schemas for request/response validation."""
from datetime import datetime
from pydantic import BaseModel, Field


# ═══════════════════════════════════════════════
# Auth
# ═══════════════════════════════════════════════

class LoginRequest(BaseModel):
    username: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"

class UserInfo(BaseModel):
    id: int
    username: str
    name: str
    role: str
    email: str | None = None
    department: str | None = None


# ═══════════════════════════════════════════════
# Vehicle
# ═══════════════════════════════════════════════

class VehicleCreate(BaseModel):
    plate_number: str
    name: str
    vehicle_type: str
    brand: str | None = None
    model: str | None = None
    year: int | None = None
    vin: str | None = None
    fleet_id: str | None = None

class VehicleUpdate(BaseModel):
    name: str | None = None
    vehicle_type: str | None = None
    brand: str | None = None
    model: str | None = None
    year: int | None = None
    fleet_id: str | None = None

class VehicleResponse(BaseModel):
    id: int
    plate_number: str
    name: str
    vehicle_type: str
    brand: str | None
    model: str | None
    year: int | None
    fleet_id: str | None
    status: str
    current_lat: float | None
    current_lng: float | None
    current_speed: float | None
    last_report_time: datetime | None
    created_at: datetime

    class Config:
        from_attributes = True

class VehicleListResponse(BaseModel):
    total: int
    items: list[VehicleResponse]


# ═══════════════════════════════════════════════
# Device
# ═══════════════════════════════════════════════

class DeviceCreate(BaseModel):
    imei: str
    sim_1: str | None = None
    sim_2: str | None = None
    firmware_version: str | None = None
    hardware_version: str | None = None
    vehicle_id: int | None = None

class DeviceResponse(BaseModel):
    id: int
    imei: str
    sim_1: str | None
    sim_2: str | None
    firmware_version: str | None
    status: str
    vehicle_id: int | None
    last_heartbeat: datetime | None
    installed_at: datetime | None
    created_at: datetime

    class Config:
        from_attributes = True


# ═══════════════════════════════════════════════
# GPS Track
# ═══════════════════════════════════════════════

class GpsReport(BaseModel):
    """TBOX GPS data report."""
    device_imei: str
    timestamp: datetime
    latitude: float
    longitude: float
    speed: float = 0
    heading: float = 0
    altitude: float | None = None
    satellites: int | None = None
    hdop: float | None = None

class GpsTrackResponse(BaseModel):
    id: int
    device_id: int
    timestamp: datetime
    latitude: float
    longitude: float
    speed: float
    heading: float

    class Config:
        from_attributes = True

class TrackQueryParams(BaseModel):
    device_id: int
    start_time: datetime
    end_time: datetime


# ═══════════════════════════════════════════════
# CAN Data
# ═══════════════════════════════════════════════

class CanReport(BaseModel):
    """TBOX CAN/OBD data report."""
    device_imei: str
    timestamp: datetime
    rpm: int | None = None
    vehicle_speed: float | None = None
    fuel_level: float | None = None
    coolant_temp: float | None = None
    engine_load: float | None = None
    odometer: float | None = None
    battery_voltage: float | None = None
    dtc_codes: list[str] | None = None
    ignition_state: bool | None = None
    pto_state: bool | None = None

class CanDataResponse(BaseModel):
    id: int
    device_id: int
    timestamp: datetime
    rpm: int | None
    vehicle_speed: float | None
    fuel_level: float | None
    coolant_temp: float | None
    odometer: float | None
    battery_voltage: float | None
    dtc_codes: str | None
    ignition_state: bool | None
    pto_state: bool | None

    class Config:
        from_attributes = True


# ═══════════════════════════════════════════════
# Alert
# ═══════════════════════════════════════════════

class AlertResponse(BaseModel):
    id: int
    vehicle_id: int | None
    alert_type: str
    severity: str
    latitude: float | None
    longitude: float | None
    timestamp: datetime
    value: float | None
    threshold: float | None
    description: str | None
    status: str
    created_at: datetime

    class Config:
        from_attributes = True

class AlertListResponse(BaseModel):
    total: int
    items: list[AlertResponse]

class AlertAcknowledge(BaseModel):
    status: str = "acknowledged"


# ═══════════════════════════════════════════════
# Geofence
# ═══════════════════════════════════════════════

class GeofenceCreate(BaseModel):
    name: str
    fence_type: str  # circle/polygon
    geometry: str  # JSON string
    alert_on_enter: bool = True
    alert_on_exit: bool = True
    enabled: bool = True

class GeofenceResponse(BaseModel):
    id: int
    name: str
    fence_type: str
    geometry: str
    alert_on_enter: bool
    alert_on_exit: bool
    enabled: bool
    created_at: datetime

    class Config:
        from_attributes = True


# ═══════════════════════════════════════════════
# Dashboard
# ═══════════════════════════════════════════════

class DashboardStats(BaseModel):
    total_vehicles: int
    online_vehicles: int
    moving_vehicles: int
    idle_vehicles: int
    offline_vehicles: int
    alert_count_today: int
    total_distance_today: float
    total_fuel_today: float

class VehicleRealtime(BaseModel):
    """Realtime vehicle state pushed via WebSocket."""
    vehicle_id: int
    plate_number: str
    name: str
    vehicle_type: str
    status: str
    latitude: float | None
    longitude: float | None
    speed: float
    heading: float
    fuel_level: float | None
    rpm: int | None
    coolant_temp: float | None
    ignition: bool | None
    pto_state: bool | None
    timestamp: datetime


# ═══════════════════════════════════════════════
# Daily Stats
# ═══════════════════════════════════════════════

class DailyStatsResponse(BaseModel):
    vehicle_id: int
    date: datetime
    total_distance_km: float
    total_driving_minutes: int
    total_idle_minutes: int
    total_fuel_consumed: float
    avg_speed: float
    max_speed: float
    alert_count: int

    class Config:
        from_attributes = True
