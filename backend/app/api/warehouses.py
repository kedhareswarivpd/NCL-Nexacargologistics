"""
Warehouses API — standalone warehouse resource (/warehouses) with nested
inventory. Complements the operational warehouse dashboard at /warehouse.
"""

import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import get_warehouse_user
from app.middleware.auth import get_current_user
from app.models.profile import Profile
from app.models.warehouse import Warehouse, InventoryItem
from app.schemas.payloads import WarehouseCreate, WarehouseUpdate
from app.services import crud
from app.utils.helpers import serialize

router = APIRouter(prefix="/warehouses", tags=["warehouses"])


@router.get("")
async def list_warehouses(
    db: AsyncSession = Depends(get_db),
    _: Profile = Depends(get_current_user),
):
    return [serialize(w) for w in await crud.list_items(db, Warehouse, limit=500)]


@router.post("", status_code=status.HTTP_201_CREATED)
async def create_warehouse(
    payload: WarehouseCreate,
    db: AsyncSession = Depends(get_db),
    _: Profile = Depends(get_warehouse_user),
):
    data = payload.model_dump(exclude_unset=True)
    if data.get("manager_id"):
        data["manager_id"] = uuid.UUID(data["manager_id"])
    return serialize(await crud.create_item(db, Warehouse, data))


@router.get("/{warehouse_id}")
async def get_warehouse(
    warehouse_id: str,
    db: AsyncSession = Depends(get_db),
    _: Profile = Depends(get_current_user),
):
    wh = await crud.get_item(db, Warehouse, warehouse_id)
    if not wh:
        raise HTTPException(status_code=404, detail="Warehouse not found")
    return serialize(wh)


@router.put("/{warehouse_id}")
@router.patch("/{warehouse_id}")
async def update_warehouse(
    warehouse_id: str,
    payload: WarehouseUpdate,
    db: AsyncSession = Depends(get_db),
    _: Profile = Depends(get_warehouse_user),
):
    wh = await crud.get_item(db, Warehouse, warehouse_id)
    if not wh:
        raise HTTPException(status_code=404, detail="Warehouse not found")
    data = payload.model_dump(exclude_unset=True)
    if data.get("manager_id"):
        data["manager_id"] = uuid.UUID(data["manager_id"])
    return serialize(await crud.update_item(db, wh, data))


@router.delete("/{warehouse_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_warehouse(
    warehouse_id: str,
    db: AsyncSession = Depends(get_db),
    _: Profile = Depends(get_warehouse_user),
):
    wh = await crud.get_item(db, Warehouse, warehouse_id)
    if wh:
        await crud.delete_item(db, wh)
    return None


@router.get("/{warehouse_id}/inventory")
async def warehouse_inventory(
    warehouse_id: str,
    db: AsyncSession = Depends(get_db),
    _: Profile = Depends(get_current_user),
):
    result = await db.execute(
        select(InventoryItem).where(InventoryItem.warehouse_id == uuid.UUID(warehouse_id))
        .order_by(InventoryItem.created_at.desc())
    )
    return [serialize(i) for i in result.scalars().all()]
