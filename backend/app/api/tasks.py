"""
Warehouse Tasks API — task board (/tasks). Logistics/admin create & assign;
warehouse staff see and progress assigned tasks.
"""

import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import require_roles
from app.middleware.auth import get_current_user
from app.models.profile import Profile, UserRole
from app.models.warehouse import WarehouseTask
from app.schemas.payloads import TaskCreate, TaskStatusPatch, TaskUpdate
from app.services import crud
from app.utils.helpers import serialize, serialize_all

router = APIRouter(prefix="/tasks", tags=["tasks"])

manage_guard = require_roles(UserRole.LOGISTICS, UserRole.WAREHOUSE)


@router.get("")
async def list_tasks(
    status_filter: str | None = None,
    assigned_to: str | None = None,
    skip: int = 0,
    limit: int = 200,
    db: AsyncSession = Depends(get_db),
    current_user: Profile = Depends(get_current_user),
):
    query = select(WarehouseTask)
    if current_user.role == UserRole.WAREHOUSE:
        query = query.where(WarehouseTask.assigned_to == current_user.id)
    elif assigned_to:
        query = query.where(WarehouseTask.assigned_to == uuid.UUID(assigned_to))
    if status_filter:
        query = query.where(WarehouseTask.status == status_filter)
    query = query.order_by(WarehouseTask.created_at.desc()).offset(skip).limit(limit)
    result = await db.execute(query)
    return serialize_all(result.scalars().all())


@router.post("", status_code=status.HTTP_201_CREATED)
async def create_task(
    payload: TaskCreate,
    db: AsyncSession = Depends(get_db),
    _: Profile = Depends(manage_guard),
):
    data = payload.model_dump(exclude_unset=True)
    for f in ("assigned_to", "shipment_id", "warehouse_id"):
        if data.get(f):
            data[f] = uuid.UUID(data[f])
    return serialize(await crud.create_item(db, WarehouseTask, data))


@router.get("/{task_id}")
async def get_task(
    task_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: Profile = Depends(get_current_user),
):
    task = await crud.get_item(db, WarehouseTask, task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")  # NOSONAR
    if current_user.role == UserRole.WAREHOUSE and task.assigned_to != current_user.id:
        raise HTTPException(status_code=403, detail="Not allowed")  # NOSONAR
    return serialize(task)


@router.put("/{task_id}")
@router.patch("/{task_id}")
async def update_task(
    task_id: str,
    payload: TaskUpdate,
    db: AsyncSession = Depends(get_db),
    _: Profile = Depends(manage_guard),
):
    task = await crud.get_item(db, WarehouseTask, task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")  # NOSONAR
    data = payload.model_dump(exclude_unset=True)
    if data.get("assigned_to"):
        data["assigned_to"] = uuid.UUID(data["assigned_to"])
    return serialize(await crud.update_item(db, task, data))


@router.patch("/{task_id}/status")
async def set_task_status(
    task_id: str,
    payload: TaskStatusPatch,
    db: AsyncSession = Depends(get_db),
    current_user: Profile = Depends(get_current_user),
):
    """Progress a task. Warehouse staff may update assigned tasks; managers update any."""
    task = await crud.get_item(db, WarehouseTask, task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")  # NOSONAR
    is_staff = current_user.role in (UserRole.ADMIN, UserRole.LOGISTICS, UserRole.WAREHOUSE)
    if not is_staff and task.assigned_to != current_user.id:
        raise HTTPException(status_code=403, detail="Not allowed")  # NOSONAR
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
    task = await crud.get_item(db, WarehouseTask, task_id)
    if task:
        await crud.delete_item(db, task)
    return None
