"""Seed script — creates demo data for KMC Fleet Management Platform."""
import asyncio
import json
import random
from datetime import datetime, timedelta, timezone
from app.core.database import engine, async_session, init_db, Base
from app.core.security import get_password_hash
from app.models.models import User, Vehicle, Device, GpsTrack, CanData, Alert, Geofence, DailyStats
from app.models.models import VehicleType, VehicleStatus, AlertType, AlertSeverity, AlertStatus, UserRole

# Karachi center coordinates
KARACHI_LAT = 24.8607
KARACHI_LNG = 67.0011

VEHICLES = [
    ("FW-001", "水罐消防车 FW-001", VehicleType.WATER_FOAM, "SANY", "SY5360GXFPM150", 2024),
    ("FW-003", "泡沫消防车 FW-003", VehicleType.WATER_FOAM, "SANY", "SY5360GXFPM180", 2024),
    ("LP-002", "云梯消防车 LP-002", VehicleType.LADDER, "SANY", "SY5420JXFDG32", 2023),
    ("PM-005", "市政泵车 PM-005", VehicleType.MUNICIPAL_PUMP, "SANY", "SY5250GXFPM100", 2024),
    ("FW-007", "消防车 FW-007", VehicleType.WATER_FOAM, "SANY", "SY5360GXFPM150", 2023),
    ("DR-001", "消防无人机车 DR-001", VehicleType.DRONE, "SANY", "SY5160GXFPM60", 2024),
    ("RB-001", "机器人消防车 RB-001", VehicleType.ROBOT, "SANY", "SY5200TXFQZ100", 2024),
    ("MC-003", "消防摩托 MC-003", VehicleType.MOTORCYCLE, "CFMOTO", "CF250", 2023),
    ("FW-008", "水罐消防车 FW-008", VehicleType.WATER_FOAM, "SANY", "SY5360GXFPM150", 2024),
    ("LP-004", "云梯消防车 LP-004", VehicleType.LADDER, "SANY", "SY5420JXFDG32", 2024),
    ("PM-006", "市政泵车 PM-006", VehicleType.MUNICIPAL_PUMP, "SANY", "SY5250GXFPM100", 2023),
    ("FW-009", "泡沫消防车 FW-009", VehicleType.WATER_FOAM, "SANY", "SY5360GXFPM180", 2024),
    ("SM-001", "小型消防车 SM-001", VehicleType.SMALL, "ISUZU", "QL1100", 2023),
    ("SM-002", "小型消防车 SM-002", VehicleType.SMALL, "ISUZU", "QL1100", 2024),
    ("FW-010", "消防车 FW-010", VehicleType.WATER_FOAM, "SANY", "SY5360GXFPM150", 2024),
]


async def seed():
    await init_db()
    async with async_session() as db:
        # Check if already seeded
        from sqlalchemy import select, func
        count = (await db.execute(select(func.count(User.id)))).scalar()
        if count and count > 0:
            print("Database already seeded, skipping.")
            return

        # ─── Users ───
        users = [
            User(username="admin", password_hash=get_password_hash("admin123"),
                 name="System Admin", role=UserRole.SUPER_ADMIN, email="admin@kmc.gov.pk",
                 department="IT Department"),
            User(username="operator1", password_hash=get_password_hash("operator123"),
                 name="Ahmad Khan", role=UserRole.OPERATOR, email="ahmad@kmc.gov.pk",
                 department="Fire Station Alpha"),
            User(username="viewer1", password_hash=get_password_hash("viewer123"),
                 name="Inspector Ali", role=UserRole.VIEWER, email="ali@kmc.gov.pk",
                 department="KMC HQ"),
        ]
        db.add_all(users)
        await db.flush()

        # ─── Vehicles & Devices ───
        now = datetime.now(timezone.utc)
        vehicles_list = []
        for i, (plate, name, vtype, brand, model, year) in enumerate(VEHICLES):
            status = random.choice([VehicleStatus.MOVING, VehicleStatus.MOVING, VehicleStatus.IDLE, VehicleStatus.OFFLINE])
            lat = KARACHI_LAT + random.uniform(-0.08, 0.08)
            lng = KARACHI_LNG + random.uniform(-0.08, 0.08)
            speed = random.uniform(20, 90) if status == VehicleStatus.MOVING else 0

            v = Vehicle(
                plate_number=plate, name=name, vehicle_type=vtype.value,
                brand=brand, model=model, year=year,
                fleet_id=random.choice(["Alpha", "Bravo", "Charlie"]),
                status=status.value, current_lat=lat, current_lng=lng,
                current_speed=speed, last_report_time=now,
            )
            db.add(v)
            await db.flush()
            vehicles_list.append(v)

            d = Device(
                imei=f"86{random.randint(1000000000000, 9999999999999)}",
                sim_1=f"92{random.randint(3000000000, 3999999999)}",
                firmware_version="1.2.0",
                hardware_version="TBOX-v2",
                status="online" if status != VehicleStatus.OFFLINE else "offline",
                last_heartbeat=now,
                vehicle_id=v.id,
                installed_at=now - timedelta(days=random.randint(30, 180)),
            )
            db.add(d)

        # ─── Alerts ───
        alert_types = [
            ("speed", AlertSeverity.HIGH, "超速 92km/h"),
            ("low_fuel", AlertSeverity.MEDIUM, "油量 12%"),
            ("dtc", AlertSeverity.MEDIUM, "DTC: P0300"),
            ("emergency", AlertSeverity.CRITICAL, "紧急按钮触发"),
            ("idle", AlertSeverity.LOW, "怠速超时 25分钟"),
            ("overheat", AlertSeverity.HIGH, "冷却液温度 108°C"),
            ("geofence", AlertSeverity.MEDIUM, "驶出围栏区域"),
            ("comm_lost", AlertSeverity.HIGH, "通信中断 15分钟"),
        ]
        for i, (atype, severity, desc) in enumerate(alert_types):
            v = random.choice(vehicles_list)
            alert = Alert(
                vehicle_id=v.id, alert_type=atype, severity=severity,
                latitude=v.current_lat + random.uniform(-0.01, 0.01),
                longitude=v.current_lng + random.uniform(-0.01, 0.01),
                timestamp=now - timedelta(minutes=random.randint(2, 120)),
                description=f"{desc} — {v.plate_number}",
                status=random.choice([AlertStatus.ACTIVE, AlertStatus.ACTIVE, AlertStatus.ACKNOWLEDGED]),
            )
            db.add(alert)

        # ─── Geofences ───
        geofences = [
            Geofence(
                name="KMC总部", fence_type="circle",
                geometry=json.dumps({"lat": KARACHI_LAT, "lng": KARACHI_LNG, "radius": 3000}),
                created_by=1,
            ),
            Geofence(
                name="消防站 Alpha", fence_type="circle",
                geometry=json.dumps({"lat": KARACHI_LAT + 0.02, "lng": KARACHI_LNG + 0.03, "radius": 2000}),
                created_by=1,
            ),
        ]
        db.add_all(geofences)

        await db.commit()
        print(f"✅ Seeded: {len(users)} users, {len(VEHICLES)} vehicles, {len(alert_types)} alerts, {len(geofences)} geofences")
        print("   Login: admin / admin123")


if __name__ == "__main__":
    asyncio.run(seed())
