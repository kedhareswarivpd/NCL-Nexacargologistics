"""
Warehouse API — warehouses, inventory, inbound/outbound tasks (Warehouse Dashboard).
"""

import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import require_roles
from app.middleware.auth import get_current_user
from app.models.profile import Profile, UserRole
from app.models.warehouse import Warehouse, InventoryItem, WarehouseTask
from app.schemas.payloads import (
    WarehouseCreate, InventoryCreate, InventoryUpdate,
    WarehouseTaskCreate, WarehouseTaskUpdate,
)
from app.services import crud
from app.utils.helpers import serialize

router = APIRouter(prefix="/warehouse", tags=["warehouse"])

wh_guard = require_roles(UserRole.WAREHOUSE)


def _inventory_status(qty: int, reorder_at: int | None) -> str:
    if qty <= 0:
        return "Out"
    if reorder_at is not None and qty <= reorder_at:
        return "Low"
    return "OK"


# ----------------------------- Warehouses -----------------------------
@router.get("/warehouses")
async def list_warehouses(db: AsyncSession = Depends(get_db), _: Profile = Depends(get_current_user)):
    return [serialize(w) for w in await crud.list_items(db, Warehouse, limit=200)]


@router.post("/warehouses", status_code=status.HTTP_201_CREATED)
async def create_warehouse(payload: WarehouseCreate, db: AsyncSession = Depends(get_db), _: Profile = Depends(wh_guard)):
    data = payload.model_dump(exclude_unset=True)
    if data.get("manager_id"):
        data["manager_id"] = uuid.UUID(data["manager_id"])
    return serialize(await crud.create_item(db, Warehouse, data))


# ----------------------------- Inventory -----------------------------
@router.get("/inventory")
async def list_inventory(
    warehouse_id: str | None = None,
    db: AsyncSession = Depends(get_db),
    _: Profile = Depends(get_current_user),
):
    query = select(InventoryItem)
    if warehouse_id:
        query = query.where(InventoryItem.warehouse_id == uuid.UUID(warehouse_id))
    query = query.order_by(InventoryItem.created_at.desc())
    result = await db.execute(query)
    return [serialize(i) for i in result.scalars().all()]


@router.post("/inventory", status_code=status.HTTP_201_CREATED)
async def create_inventory(payload: InventoryCreate, db: AsyncSession = Depends(get_db), _: Profile = Depends(wh_guard)):
    data = payload.model_dump(exclude_unset=True)
    data["warehouse_id"] = uuid.UUID(data["warehouse_id"])
    if data.get("shipment_id"):
        data["shipment_id"] = uuid.UUID(data["shipment_id"])
    data["status"] = _inventory_status(data.get("qty", 0), data.get("reorder_at"))
    return serialize(await crud.create_item(db, InventoryItem, data))


@router.patch("/inventory/{item_id}")
@router.put("/inventory/{item_id}")
async def update_inventory(item_id: str, payload: InventoryUpdate, db: AsyncSession = Depends(get_db), _: Profile = Depends(wh_guard)):
    obj = await crud.get_item(db, InventoryItem, item_id)
    if not obj:
        raise HTTPException(status_code=404, detail="Inventory item not found")
    data = payload.model_dump(exclude_unset=True)
    obj = await crud.update_item(db, obj, data)
    # Recompute derived status.
    obj.status = _inventory_status(obj.qty or 0, obj.reorder_at)
    await db.flush()
    return serialize(obj)


@router.delete("/inventory/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_inventory(item_id: str, db: AsyncSession = Depends(get_db), _: Profile = Depends(wh_guard)):
    obj = await crud.get_item(db, InventoryItem, item_id)
    if obj:
        await crud.delete_item(db, obj)
    return None


# ----------------------------- Tasks (inbound/outbound) -----------------------------
@router.get("/tasks")
async def list_tasks(
    task_type: str | None = None,
    db: AsyncSession = Depends(get_db),
    _: Profile = Depends(get_current_user),
):
    query = select(WarehouseTask)
    if task_type:
        query = query.where(WarehouseTask.task_type == task_type)
    query = query.order_by(WarehouseTask.created_at.desc())
    result = await db.execute(query)
    return [serialize(t) for t in result.scalars().all()]


@router.post("/tasks", status_code=status.HTTP_201_CREATED)
async def create_task(payload: WarehouseTaskCreate, db: AsyncSession = Depends(get_db), _: Profile = Depends(wh_guard)):
    data = payload.model_dump(exclude_unset=True)
    for f in ("warehouse_id", "shipment_id", "assigned_to"):
        if data.get(f):
            data[f] = uuid.UUID(data[f])
    return serialize(await crud.create_item(db, WarehouseTask, data))


@router.patch("/tasks/{task_id}")
@router.put("/tasks/{task_id}")
async def update_task(task_id: str, payload: WarehouseTaskUpdate, db: AsyncSession = Depends(get_db), _: Profile = Depends(wh_guard)):
    obj = await crud.get_item(db, WarehouseTask, task_id)
    if not obj:
        raise HTTPException(status_code=404, detail="Task not found")
    data = payload.model_dump(exclude_unset=True)
    if data.get("assigned_to"):
        data["assigned_to"] = uuid.UUID(data["assigned_to"])
    return serialize(await crud.update_item(db, obj, data))


@router.get("/analytics")
async def warehouse_analytics(db: AsyncSession = Depends(get_db), _: Profile = Depends(get_current_user)):
    items = await crud.list_items(db, InventoryItem, limit=5000)
    total_qty = sum((i.qty or 0) for i in items)
    low = sum(1 for i in items if i.status == "Low")
    out = sum(1 for i in items if i.status == "Out")
    return {
        "total_items": len(items),
        "total_quantity": total_qty,
        "low_stock": low,
        "out_of_stock": out,
        "warehouses": await crud.count(db, Warehouse),
        "open_tasks": await crud.count(db, WarehouseTask, {"status": "Pending"}),
    }
