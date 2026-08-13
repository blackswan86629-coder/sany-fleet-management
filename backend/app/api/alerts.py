"""Alert API routes."""
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.core.database import get_db
from app.core.deps import get_current_user, require_role
from app.models.models import User, Alert, AlertStatus
from app.schemas.schemas import AlertResponse, AlertListResponse, AlertAcknowledge

router = APIRouter(prefix="/alerts", tags=["Alerts"])


@router.get("", response_model=AlertListResponse)
async def list_alerts(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    status: str | None = None,
    alert_type: str | None = None,
    severity: str | None = None,
    vehicle_id: int | None = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = select(Alert)
    count_query = select(func.count(Alert.id))

    filters = []
    if status:
        filters.append(Alert.status == status)
    if alert_type:
        filters.append(Alert.alert_type == alert_type)
    if severity:
        filters.append(Alert.severity == severity)
    if vehicle_id:
        filters.append(Alert.vehicle_id == vehicle_id)

    for f in filters:
        query = query.where(f)
        count_query = count_query.where(f)

    total = (await db.execute(count_query)).scalar()
    query = query.order_by(Alert.created_at.desc()).offset((page - 1) * page_size).limit(page_size)
    result = await db.execute(query)
    alerts = result.scalars().all()

    return AlertListResponse(total=total, items=[AlertResponse.model_validate(a) for a in alerts])


@router.get("/active", response_model=AlertListResponse)
async def list_active_alerts(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Alert).where(Alert.status == AlertStatus.ACTIVE).order_by(Alert.created_at.desc()).limit(50)
    )
    alerts = result.scalars().all()
    return AlertListResponse(total=len(alerts), items=[AlertResponse.model_validate(a) for a in alerts])


@router.put("/{alert_id}/acknowledge")
async def acknowledge_alert(
    alert_id: int,
    req: AlertAcknowledge,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(select(Alert).where(Alert.id == alert_id))
    alert = result.scalar_one_or_none()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")

    alert.status = req.status
    if req.status == "acknowledged":
        alert.acknowledged_by = current_user.id
        alert.acknowledged_at = datetime.now(timezone.utc)
    elif req.status == "resolved":
        alert.resolved_at = datetime.now(timezone.utc)

    await db.commit()
    return {"message": "Alert updated", "status": alert.status}
