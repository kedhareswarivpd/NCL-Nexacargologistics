"""
Driver Tasks API — the task board (/tasks). Logistics/admin create & assign;
drivers see and progress their own tasks.
"""

import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import require_roles
from app.middleware.auth import get_current_user
from app.models.profile import Profile, UserRole
from app.models.driver_task import DriverTask
from app.schemas.payloads import TaskCreate, TaskStatusPatch, TaskUpdate
from app.services import crud
from app.utils.helpers import serialize

router = APIRouter(prefix="/tasks", tags=["tasks"])

manage_guard = require_roles(UserRole.LOGISTICS)


@router.get("")
async def list_tasks(
    status_filter: str | None = None,
    driver_id: str | None = None,
    skip: int = 0,
    limit: int = 200,
    db: AsyncSession = Depends(get_db),
    current_user: Profile = Depends(get_current_user),
):
    query = select(DriverTask)
    # Drivers only ever see their own tasks.
    if current_user.role == UserRole.DRIVER:
        query = query.where(DriverTask.driver_id == current_user.id)
    elif driver_id:
        query = query.where(DriverTask.driver_id == uuid.UUID(driver_id))
    if status_filter:
        query = query.where(DriverTask.status == status_filter)
    query = query.order_by(DriverTask.created_at.desc()).offset(skip).limit(limit)
    result = await db.execute(query)
    return [serialize(t) for t in result.scalars().all()]


@router.post("", status_code=status.HTTP_201_CREATED)
async def create_task(
    payload: TaskCreate,
    db: AsyncSession = Depends(get_db),
    _: Profile = Depends(manage_guard),
):
    data = payload.model_dump(exclude_unset=True)
    for f in ("driver_id", "shipment_id"):
        if data.get(f):
            data[f] = uuid.UUID(data[f])
    return serialize(await crud.create_item(db, DriverTask, data))


@router.get("/{task_id}")
async def get_task(
    task_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: Profile = Depends(get_current_user),
):
    task = await crud.get_item(db, DriverTask, task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    if current_user.role == UserRole.DRIVER and task.driver_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not allowed")
    return serialize(task)


@router.put("/{task_id}")
@router.patch("/{task_id}")
async def update_task(
    task_id: str,
    payload: TaskUpdate,
    db: AsyncSession = Depends(get_db),
    _: Profile = Depends(manage_guard),
):
    task = await crud.get_item(db, DriverTask, task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    data = payload.model_dump(exclude_unset=True)
    if data.get("driver_id"):
        data["driver_id"] = uuid.UUID(data["driver_id"])
    return serialize(await crud.update_item(db, task, data))


@router.patch("/{task_id}/status")
async def set_task_status(
    task_id: str,
    payload: TaskStatusPatch,
    db: AsyncSession = Depends(get_db),
    current_user: Profile = Depends(get_current_user),
):
    """Progress a task. Drivers may update only their own; staff may update any."""
    task = await crud.get_item(db, DriverTask, task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    is_staff = current_user.role in (UserRole.ADMIN, UserRole.LOGISTICS)
    if not is_staff and task.driver_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not allowed")
    task.status = payload.status
    await db.flush()
    await db.refresh(task)
    return serialize(task)


@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_task(
    task_id: str,
    db: AsyncSession = Depends(get_db),
    _: Profile = Depends(manage_guard),
):
    task = await crud.get_item(db, DriverTask, task_id)
    if task:
        await crud.delete_item(db, task)
    return None
