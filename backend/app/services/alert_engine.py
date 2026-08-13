"""Alert rule engine — checks CAN data against configured thresholds."""
from datetime import datetime, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.models import Alert, AlertSeverity
from app.schemas.schemas import CanReport


# Default thresholds (will be configurable via settings API)
THRESHOLDS = {
    "speed_warn": 80,       # km/h
    "speed_critical": 120,  # km/h
    "low_fuel": 15,         # %
    "coolant_overheat": 105, # °C
    "low_voltage": 11.5,    # V
    "idle_timeout_min": 20, # minutes (handled externally)
}


async def check_alerts(db: AsyncSession, device_id: int, vehicle_id: int, report: CanReport):
    """Check CAN report data against alert rules and create alerts if triggered."""
    now = datetime.now(timezone.utc)
    alerts = []

    # Speed alerts
    if report.vehicle_speed and report.vehicle_speed > THRESHOLDS["speed_critical"]:
        alerts.append(Alert(
            device_id=device_id, vehicle_id=vehicle_id,
            alert_type="speed", severity=AlertSeverity.HIGH,
            timestamp=now, value=report.vehicle_speed,
            threshold=THRESHOLDS["speed_critical"],
            description=f"超速 {report.vehicle_speed:.0f}km/h，阈值 {THRESHOLDS['speed_critical']}km/h",
        ))
    elif report.vehicle_speed and report.vehicle_speed > THRESHOLDS["speed_warn"]:
        alerts.append(Alert(
            device_id=device_id, vehicle_id=vehicle_id,
            alert_type="speed", severity=AlertSeverity.MEDIUM,
            timestamp=now, value=report.vehicle_speed,
            threshold=THRESHOLDS["speed_warn"],
            description=f"超速 {report.vehicle_speed:.0f}km/h，阈值 {THRESHOLDS['speed_warn']}km/h",
        ))

    # Low fuel
    if report.fuel_level is not None and report.fuel_level < THRESHOLDS["low_fuel"]:
        alerts.append(Alert(
            device_id=device_id, vehicle_id=vehicle_id,
            alert_type="low_fuel", severity=AlertSeverity.MEDIUM,
            timestamp=now, value=report.fuel_level,
            threshold=THRESHOLDS["low_fuel"],
            description=f"油量 {report.fuel_level:.0f}%，低于阈值 {THRESHOLDS['low_fuel']}%",
        ))

    # Coolant overheat
    if report.coolant_temp and report.coolant_temp > THRESHOLDS["coolant_overheat"]:
        alerts.append(Alert(
            device_id=device_id, vehicle_id=vehicle_id,
            alert_type="overheat", severity=AlertSeverity.HIGH,
            timestamp=now, value=report.coolant_temp,
            threshold=THRESHOLDS["coolant_overheat"],
            description=f"冷却液温度 {report.coolant_temp:.0f}°C，超过阈值 {THRESHOLDS['coolant_overheat']}°C",
        ))

    # Low battery voltage
    if report.battery_voltage and report.battery_voltage < THRESHOLDS["low_voltage"]:
        alerts.append(Alert(
            device_id=device_id, vehicle_id=vehicle_id,
            alert_type="low_voltage", severity=AlertSeverity.MEDIUM,
            timestamp=now, value=report.battery_voltage,
            threshold=THRESHOLDS["low_voltage"],
            description=f"电池电压 {report.battery_voltage:.1f}V，低于阈值 {THRESHOLDS['low_voltage']}V",
        ))

    # DTC alerts
    if report.dtc_codes and len(report.dtc_codes) > 0:
        alerts.append(Alert(
            device_id=device_id, vehicle_id=vehicle_id,
            alert_type="dtc", severity=AlertSeverity.MEDIUM,
            timestamp=now,
            description=f"DTC故障码: {', '.join(report.dtc_codes)}",
        ))

    # PTO state change
    if report.pto_state is not None:
        alerts.append(Alert(
            device_id=device_id, vehicle_id=vehicle_id,
            alert_type="pto", severity=AlertSeverity.INFO,
            timestamp=now,
            description=f"消防泵{'启动' if report.pto_state else '停止'}",
        ))

    for alert in alerts:
        db.add(alert)
