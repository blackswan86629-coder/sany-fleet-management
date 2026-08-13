"""Dashboard API routes — stats and aggregated data."""
from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.models import User, Vehicle, Alert, GpsTrack, DailyStats, VehicleStatus, AlertStatus
from app.schemas.schemas import DashboardStats, DailyStatsResponse

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/stats", response_model=DashboardStats)
async def get_dashboard_stats(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    today_start = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)

    total = (await db.execute(select(func.count(Vehicle.id)))).scalar()
    online = (await db.execute(
        select(func.count(Vehicle.id)).where(Vehicle.status != VehicleStatus.OFFLINE)
    )).scalar()
    moving = (await db.execute(
        select(func.count(Vehicle.id)).where(Vehicle.status == VehicleStatus.MOVING)
    )).scalar()
    idle = (await db.execute(
        select(func.count(Vehicle.id)).where(Vehicle.status == VehicleStatus.IDLE)
    )).scalar()
    offline = (await db.execute(
        select(func.count(Vehicle.id)).where(Vehicle.status == VehicleStatus.OFFLINE)
    )).scalar()

    alerts_today = (await db.execute(
        select(func.count(Alert.id)).where(Alert.created_at >= today_start)
    )).scalar()

    # Distance and fuel from daily_stats (if available)
    dist_result = await db.execute(
        select(func.sum(DailyStats.total_distance_km)).where(DailyStats.date >= today_start)
    )
    total_distance = dist_result.scalar() or 0

    fuel_result = await db.execute(
        select(func.sum(DailyStats.total_fuel_consumed)).where(DailyStats.date >= today_start)
    )
    total_fuel = fuel_result.scalar() or 0

    return DashboardStats(
        total_vehicles=total,
        online_vehicles=online,
        moving_vehicles=moving,
        idle_vehicles=idle,
        offline_vehicles=offline,
        alert_count_today=alerts_today,
        total_distance_today=round(total_distance, 1),
        total_fuel_today=round(total_fuel, 1),
    )


@router.get("/vehicle-stats")
async def get_vehicle_daily_stats(
    vehicle_id: int,
    days: int = Query(7, ge=1, le=90),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    since = datetime.now(timezone.utc) - timedelta(days=days)
    result = await db.execute(
        select(DailyStats)
        .where(DailyStats.vehicle_id == vehicle_id, DailyStats.date >= since)
        .order_by(DailyStats.date)
    )
    stats = result.scalars().all()
    return [DailyStatsResponse.model_validate(s) for s in stats]


@router.get("/alert-heatmap")
async def get_alert_heatmap(
    days: int = Query(7, ge=1, le=90),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get alert locations for heatmap visualization."""
    since = datetime.now(timezone.utc) - timedelta(days=days)
    result = await db.execute(
        select(Alert.latitude, Alert.longitude, Alert.alert_type, Alert.severity, Alert.timestamp)
        .where(Alert.created_at >= since, Alert.latitude.isnot(None))
        .order_by(Alert.created_at.desc())
        .limit(5000)
    )
    return [
        {"lat": r[0], "lng": r[1], "type": r[2], "severity": r[3], "time": r[4].isoformat()}
        for r in result.all()
    ]
