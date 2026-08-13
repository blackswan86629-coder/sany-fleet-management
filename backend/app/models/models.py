"""Database models for KMC Fleet Management Platform."""
from datetime import datetime, timezone
from sqlalchemy import (
    Column, Integer, String, Float, Boolean, DateTime, Text, Enum, ForeignKey, Index
)
from sqlalchemy.orm import relationship
from app.core.database import Base
import enum


# ═══════════════════════════════════════════════
# Enums
# ═══════════════════════════════════════════════

class VehicleType(str, enum.Enum):
    WATER_FOAM = "water_foam"           # 水与泡沫消防车
    MUNICIPAL_PUMP = "municipal_pump"    # 市政消防泵车
    LADDER = "ladder"                    # 云梯消防车
    DRONE = "drone"                      # 配备无人机系统的消防车
    ROBOT = "robot"                      # 配备机器人消防系统的消防车
    SMALL = "small"                      # 小型消防车
    MOTORCYCLE = "motorcycle"            # 消防摩托车


class VehicleStatus(str, enum.Enum):
    MOVING = "moving"
    IDLE = "idle"
    OFFLINE = "offline"
    MAINTENANCE = "maintenance"


class AlertType(str, enum.Enum):
    SPEED = "speed"                      # 超速
    GEOFENCE = "geofence"                # 地理围栏
    ROUTE_DEVIATION = "route_deviation"  # 路线偏离
    IDLE = "idle"                        # 怠速超时
    IMMOBILE = "immobile"                # 静止报警
    EMERGENCY = "emergency"              # 紧急报警
    COLLISION = "collision"              # 碰撞
    COMM_LOST = "comm_lost"              # 通信中断
    DTC = "dtc"                          # DTC故障码
    LOW_FUEL = "low_fuel"                # 低油量
    OVERHEAT = "overheat"                # 发动机过热
    LOW_VOLTAGE = "low_voltage"          # 低电压
    TAMPER = "tamper"                    # 篡改
    PTO = "pto"                          # PTO事件
    FUEL_THEFT = "fuel_theft"            # 偷油


class AlertSeverity(str, enum.Enum):
    CRITICAL = "critical"
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"
    INFO = "info"


class AlertStatus(str, enum.Enum):
    ACTIVE = "active"
    ACKNOWLEDGED = "acknowledged"
    RESOLVED = "resolved"


class UserRole(str, enum.Enum):
    SUPER_ADMIN = "super_admin"
    ADMIN = "admin"
    OPERATOR = "operator"
    VIEWER = "viewer"


# ═══════════════════════════════════════════════
# Models
# ═══════════════════════════════════════════════

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, autoincrement=True)
    username = Column(String(50), unique=True, nullable=False, index=True)
    password_hash = Column(String(128), nullable=False)
    name = Column(String(100), nullable=False)
    email = Column(String(120))
    phone = Column(String(20))
    role = Column(String(20), default=UserRole.OPERATOR)
    department = Column(String(100))
    is_active = Column(Boolean, default=True)
    last_login = Column(DateTime)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))


class Vehicle(Base):
    __tablename__ = "vehicles"

    id = Column(Integer, primary_key=True, autoincrement=True)
    plate_number = Column(String(20), unique=True, nullable=False, index=True)
    name = Column(String(100), nullable=False)
    vehicle_type = Column(String(30), nullable=False)
    brand = Column(String(50))
    model = Column(String(50))
    year = Column(Integer)
    vin = Column(String(17))
    fleet_id = Column(String(50))  # 车队/中队编号
    status = Column(String(20), default=VehicleStatus.OFFLINE)
    current_lat = Column(Float)
    current_lng = Column(Float)
    current_speed = Column(Float, default=0)
    last_report_time = Column(DateTime)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    device = relationship("Device", back_populates="vehicle", uselist=False)
    alerts = relationship("Alert", back_populates="vehicle")


class Device(Base):
    __tablename__ = "devices"

    id = Column(Integer, primary_key=True, autoincrement=True)
    imei = Column(String(20), unique=True, nullable=False, index=True)
    sim_1 = Column(String(20))
    sim_2 = Column(String(20))
    firmware_version = Column(String(20))
    hardware_version = Column(String(20))
    status = Column(String(20), default="offline")  # online/offline/maintenance
    last_heartbeat = Column(DateTime)
    vehicle_id = Column(Integer, ForeignKey("vehicles.id"), unique=True)
    installed_at = Column(DateTime)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    vehicle = relationship("Vehicle", back_populates="device")


class GpsTrack(Base):
    __tablename__ = "gps_tracks"
    __table_args__ = (
        Index("idx_gps_device_time", "device_id", "timestamp"),
    )

    id = Column(Integer, primary_key=True, autoincrement=True)
    device_id = Column(Integer, ForeignKey("devices.id"), nullable=False)
    timestamp = Column(DateTime, nullable=False, index=True)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    speed = Column(Float, default=0)
    heading = Column(Float, default=0)
    altitude = Column(Float)
    satellites = Column(Integer)
    hdop = Column(Float)


class CanData(Base):
    __tablename__ = "can_data"
    __table_args__ = (
        Index("idx_can_device_time", "device_id", "timestamp"),
    )

    id = Column(Integer, primary_key=True, autoincrement=True)
    device_id = Column(Integer, ForeignKey("devices.id"), nullable=False)
    timestamp = Column(DateTime, nullable=False, index=True)
    rpm = Column(Integer)
    vehicle_speed = Column(Float)
    fuel_level = Column(Float)
    coolant_temp = Column(Float)
    engine_load = Column(Float)
    odometer = Column(Float)
    battery_voltage = Column(Float)
    dtc_codes = Column(Text)  # JSON array of DTC codes
    ignition_state = Column(Boolean)
    pto_state = Column(Boolean)


class Alert(Base):
    __tablename__ = "alerts"
    __table_args__ = (
        Index("idx_alert_vehicle_time", "vehicle_id", "timestamp"),
    )

    id = Column(Integer, primary_key=True, autoincrement=True)
    device_id = Column(Integer, ForeignKey("devices.id"))
    vehicle_id = Column(Integer, ForeignKey("vehicles.id"))
    alert_type = Column(String(30), nullable=False)
    severity = Column(String(20), nullable=False)
    latitude = Column(Float)
    longitude = Column(Float)
    timestamp = Column(DateTime, nullable=False, index=True)
    value = Column(Float)
    threshold = Column(Float)
    description = Column(Text)
    status = Column(String(20), default=AlertStatus.ACTIVE)
    acknowledged_by = Column(Integer, ForeignKey("users.id"))
    acknowledged_at = Column(DateTime)
    resolved_at = Column(DateTime)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationships
    vehicle = relationship("Vehicle", back_populates="alerts")
    acknowledger = relationship("User")


class Geofence(Base):
    __tablename__ = "geofences"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(100), nullable=False)
    fence_type = Column(String(20), nullable=False)  # circle/polygon/route
    # Circle: {lat, lng, radius_meters}
    # Polygon: {coordinates: [[lat,lng], ...]}
    geometry = Column(Text, nullable=False)  # JSON
    alert_on_enter = Column(Boolean, default=True)
    alert_on_exit = Column(Boolean, default=True)
    enabled = Column(Boolean, default=True)
    created_by = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))


class DailyStats(Base):
    """Aggregated daily statistics per vehicle."""
    __tablename__ = "daily_stats"
    __table_args__ = (
        Index("idx_daily_vehicle_date", "vehicle_id", "date", unique=True),
    )

    id = Column(Integer, primary_key=True, autoincrement=True)
    vehicle_id = Column(Integer, ForeignKey("vehicles.id"), nullable=False)
    date = Column(DateTime, nullable=False)
    total_distance_km = Column(Float, default=0)
    total_driving_minutes = Column(Integer, default=0)
    total_idle_minutes = Column(Integer, default=0)
    total_fuel_consumed = Column(Float, default=0)
    avg_speed = Column(Float, default=0)
    max_speed = Column(Float, default=0)
    alert_count = Column(Integer, default=0)
    engine_on_minutes = Column(Integer, default=0)
