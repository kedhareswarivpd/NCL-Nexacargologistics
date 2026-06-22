"""
Drivers API — management of driver accounts (profiles with role='driver'),
their task list and availability. (The self-service driver app lives at /driver.)
"""

import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import require_roles
from app.models.profile import Profile, UserRole
from app.models.driver_task import DriverTask
from app.schemas.payloads import AvailabilityPatch, DriverCreate, DriverUpdate
from app.services import crud, supabase_admin
from app.utils.helpers import serialize

router = APIRouter(prefix="/drivers", tags=["drivers"])

# Logistics dispatchers (and admin) manage drivers.
manage_guard = require_roles(UserRole.LOGISTICS)


async def _get_driver(db: AsyncSession, driver_id: str) -> Profile:
    drv = await crud.get_item(db, Profile, driver_id)
    if not drv or drv.role != UserRole.DRIVER:
        raise HTTPException(status_code=404, detail="Driver not found")
    return drv


@router.get("")
async def list_drivers(
    status_filter: str | None = None,
    skip: int = 0,
    limit: int = 200,
    db: AsyncSession = Depends(get_db),
    _: Profile = Depends(manage_guard),
):
    query = select(Profile).where(Profile.role == UserRole.DRIVER)
    if status_filter:
        query = query.where(Profile.status == status_filter)
    query = query.order_by(Profile.created_at.desc()).offset(skip).limit(limit)
    result = await db.execute(query)
    return [serialize(d) for d in result.scalars().all()]


@router.post("", status_code=status.HTTP_201_CREATED)
async def create_driver(
    payload: DriverCreate,
    db: AsyncSession = Depends(get_db),
    _: Profile = Depends(manage_guard),
):
    email = payload.email.lower().strip()
    existing = await db.execute(select(Profile).where(Profile.email == email))
    if existing.scalar_one_or_none() is not None:
        raise HTTPException(status_code=409, detail="An account with this email already exists")
    try:
        auth_id = await supabase_admin.create_auth_user(
            email, payload.password, metadata={"name": payload.name, "role": UserRole.DRIVER}
        )
    except RuntimeError as exc:
        raise HTTPException(status_code=502, detail=str(exc))

    driver = Profile(
        id=uuid.UUID(auth_id) if auth_id else uuid.uuid4(),
        email=email,
        name=payload.name.strip(),
        role=UserRole.DRIVER,
        phone=payload.phone,
        branch_id=uuid.UUID(payload.branch_id) if payload.branch_id else None,
    )
    db.add(driver)
    await db.flush()
    await db.refresh(driver)
    return serialize(driver)


@router.get("/{driver_id}")
async def get_driver(
    driver_id: str,
    db: AsyncSession = Depends(get_db),
    _: Profile = Depends(manage_guard),
):
    return serialize(await _get_driver(db, driver_id))


@router.put("/{driver_id}")
@router.patch("/{driver_id}")
async def update_driver(
    driver_id: str,
    payload: DriverUpdate,
    db: AsyncSession = Depends(get_db),
    _: Profile = Depends(manage_guard),
):
    drv = await _get_driver(db, driver_id)
    data = payload.model_dump(exclude_unset=True)
    if data.get("branch_id"):
        data["branch_id"] = uuid.UUID(data["branch_id"])
    updated = await crud.update_item(db, drv, data)
    return serialize(updated)


@router.delete("/{driver_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_driver(
    driver_id: str,
    db: AsyncSession = Depends(get_db),
    _: Profile = Depends(require_roles(UserRole.ADMIN)),
):
    drv = await _get_driver(db, driver_id)
    await crud.delete_item(db, drv)
    return None


@router.get("/{driver_id}/tasks")
async def driver_tasks(
    driver_id: str,
    db: AsyncSession = Depends(get_db),
    _: Profile = Depends(manage_guard),
):
    await _get_driver(db, driver_id)
    result = await db.execute(
        select(DriverTask).where(DriverTask.driver_id == uuid.UUID(driver_id))
        .order_by(DriverTask.created_at.desc())
    )
    return [serialize(t) for t in result.scalars().all()]


@router.patch("/{driver_id}/availability")
async def set_availability(
    driver_id: str,
    payload: AvailabilityPatch,
    db: AsyncSession = Depends(get_db),
    _: Profile = Depends(manage_guard),
):
    drv = await _get_driver(db, driver_id)
    drv.status = payload.status
    await db.flush()
    await db.refresh(drv)
    return serialize(drv)
