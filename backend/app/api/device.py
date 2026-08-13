"""Device data ingestion API (GPS, CAN, alerts from TBOX)."""
import json
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.models.models import Device, Vehicle, GpsTrack, CanData, Alert, VehicleStatus, AlertSeverity
from app.schemas.schemas import GpsReport, CanReport
from app.services.alert_engine import check_alerts

router = APIRouter(prefix="/device", tags=["Device Data"])


async def _get_device(imei: str, db: AsyncSession) -> Device:
    result = await db.execute(select(Device).where(Device.imei == imei))
    device = result.scalar_one_or_none()
    if not device:
        raise HTTPException(status_code=404, detail=f"Device {imei} not registered")
    return device


@router.post("/gps")
async def report_gps(report: GpsReport, db: AsyncSession = Depends(get_db)):
    """TBOX reports GPS position data."""
    device = await _get_device(report.device_imei, db)

    # Update device heartbeat
    device.last_heartbeat = datetime.now(timezone.utc)
    device.status = "online"

    # Save GPS track
    track = GpsTrack(
        device_id=device.id,
        timestamp=report.timestamp,
        latitude=report.latitude,
        longitude=report.longitude,
        speed=report.speed,
        heading=report.heading,
        altitude=report.altitude,
        satellites=report.satellites,
        hdop=report.hdop,
    )
    db.add(track)

    # Update vehicle current state
    if device.vehicle_id:
        result = await db.execute(select(Vehicle).where(Vehicle.id == device.vehicle_id))
        vehicle = result.scalar_one_or_none()
        if vehicle:
            vehicle.current_lat = report.latitude
            vehicle.current_lng = report.longitude
            vehicle.current_speed = report.speed
            vehicle.last_report_time = report.timestamp
            if report.speed > 5:
                vehicle.status = VehicleStatus.MOVING
            elif report.speed <= 1:
                vehicle.status = VehicleStatus.IDLE
            else:
                vehicle.status = VehicleStatus.MOVING

    await db.commit()
    return {"status": "ok"}


@router.post("/can")
async def report_can(report: CanReport, db: AsyncSession = Depends(get_db)):
    """TBOX reports CAN/OBD data."""
    device = await _get_device(report.device_imei, db)

    device.last_heartbeat = datetime.now(timezone.utc)

    can = CanData(
        device_id=device.id,
        timestamp=report.timestamp,
        rpm=report.rpm,
        vehicle_speed=report.vehicle_speed,
        fuel_level=report.fuel_level,
        coolant_temp=report.coolant_temp,
        engine_load=report.engine_load,
        odometer=report.odometer,
        battery_voltage=report.battery_voltage,
        dtc_codes=json.dumps(report.dtc_codes) if report.dtc_codes else None,
        ignition_state=report.ignition_state,
        pto_state=report.pto_state,
    )
    db.add(can)

    # Trigger alert checks
    if device.vehicle_id:
        await check_alerts(db, device.id, device.vehicle_id, report)

    await db.commit()
    return {"status": "ok"}


@router.post("/emergency")
async def report_emergency(
    device_imei: str,
    latitude: float,
    longitude: float,
    db: AsyncSession = Depends(get_db),
):
    """Emergency button pressed."""
    device = await _get_device(device_imei, db)

    alert = Alert(
        device_id=device.id,
        vehicle_id=device.vehicle_id,
        alert_type="emergency",
        severity=AlertSeverity.CRITICAL,
        latitude=latitude,
        longitude=longitude,
        timestamp=datetime.now(timezone.utc),
        description="车内紧急按钮触发",
    )
    db.add(alert)
    await db.commit()
    return {"status": "ok", "alert_id": alert.id}
