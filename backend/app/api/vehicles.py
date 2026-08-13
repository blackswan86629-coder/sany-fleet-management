"""Vehicle API routes."""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from datetime import datetime, timezone
from app.core.database import get_db
from app.core.deps import get_current_user, require_role
from app.models.models import User, Vehicle, VehicleStatus
from app.schemas.schemas import (
    VehicleCreate, VehicleUpdate, VehicleResponse, VehicleListResponse
)

router = APIRouter(prefix="/vehicles", tags=["Vehicles"])


@router.get("", response_model=VehicleListResponse)
async def list_vehicles(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    status: str | None = None,
    vehicle_type: str | None = None,
    fleet_id: str | None = None,
    keyword: str | None = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = select(Vehicle)
    count_query = select(func.count(Vehicle.id))

    if status:
        query = query.where(Vehicle.status == status)
        count_query = count_query.where(Vehicle.status == status)
    if vehicle_type:
        query = query.where(Vehicle.vehicle_type == vehicle_type)
        count_query = count_query.where(Vehicle.vehicle_type == vehicle_type)
    if fleet_id:
        query = query.where(Vehicle.fleet_id == fleet_id)
        count_query = count_query.where(Vehicle.fleet_id == fleet_id)
    if keyword:
        like = f"%{keyword}%"
        query = query.where(Vehicle.plate_number.like(like) | Vehicle.name.like(like))
        count_query = count_query.where(Vehicle.plate_number.like(like) | Vehicle.name.like(like))

    total = (await db.execute(count_query)).scalar()
    query = query.order_by(Vehicle.id).offset((page - 1) * page_size).limit(page_size)
    result = await db.execute(query)
    vehicles = result.scalars().all()

    return VehicleListResponse(total=total, items=[VehicleResponse.model_validate(v) for v in vehicles])


@router.get("/realtime")
async def get_realtime_vehicles(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get all vehicles with current real-time state for the map."""
    result = await db.execute(select(Vehicle))
    vehicles = result.scalars().all()
    return [
        {
            "vehicle_id": v.id,
            "plate_number": v.plate_number,
            "name": v.name,
            "vehicle_type": v.vehicle_type,
            "status": v.status,
            "latitude": v.current_lat,
            "longitude": v.current_lng,
            "speed": v.current_speed or 0,
            "fleet_id": v.fleet_id,
            "last_report": v.last_report_time.isoformat() if v.last_report_time else None,
        }
        for v in vehicles
    ]


@router.get("/{vehicle_id}", response_model=VehicleResponse)
async def get_vehicle(
    vehicle_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(select(Vehicle).where(Vehicle.id == vehicle_id))
    vehicle = result.scalar_one_or_none()
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    return VehicleResponse.model_validate(vehicle)


@router.post("", response_model=VehicleResponse, status_code=201)
async def create_vehicle(
    req: VehicleCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("super_admin", "admin")),
):
    # Check duplicate plate
    existing = await db.execute(select(Vehicle).where(Vehicle.plate_number == req.plate_number))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Plate number already exists")

    vehicle = Vehicle(**req.model_dump())
    db.add(vehicle)
    await db.commit()
    await db.refresh(vehicle)
    return VehicleResponse.model_validate(vehicle)


@router.put("/{vehicle_id}", response_model=VehicleResponse)
async def update_vehicle(
    vehicle_id: int,
    req: VehicleUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("super_admin", "admin")),
):
    result = await db.execute(select(Vehicle).where(Vehicle.id == vehicle_id))
    vehicle = result.scalar_one_or_none()
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")

    for field, value in req.model_dump(exclude_unset=True).items():
        setattr(vehicle, field, value)

    await db.commit()
    await db.refresh(vehicle)
    return VehicleResponse.model_validate(vehicle)


@router.delete("/{vehicle_id}")
async def delete_vehicle(
    vehicle_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("super_admin")),
):
    result = await db.execute(select(Vehicle).where(Vehicle.id == vehicle_id))
    vehicle = result.scalar_one_or_none()
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")

    await db.delete(vehicle)
    await db.commit()
    return {"message": "Vehicle deleted"}
