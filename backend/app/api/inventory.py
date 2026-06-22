"""
Inventory API — standalone inventory resource (/inventory). Shares the
InventoryItem model with the warehouse dashboard.
"""

import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import get_warehouse_user
from app.middleware.auth import get_current_user
from app.models.profile import Profile
from app.models.warehouse import InventoryItem
from app.schemas.payloads import InventoryCreate, InventoryUpdate
from app.services import crud
from app.utils.helpers import serialize


def _stock_status(qty: int, reorder_at: int | None) -> str:
    if qty <= 0:
        return "Out"
    if reorder_at is not None and qty <= reorder_at:
        return "Low"
    return "OK"


router = APIRouter(prefix="/inventory", tags=["inventory"])


@router.get("")
async def list_inventory(
    warehouse_id: str | None = None,
    skip: int = 0,
    limit: int = 500,
    db: AsyncSession = Depends(get_db),
    _: Profile = Depends(get_current_user),
):
    query = select(InventoryItem)
    if warehouse_id:
        query = query.where(InventoryItem.warehouse_id == uuid.UUID(warehouse_id))
    query = query.order_by(InventoryItem.created_at.desc()).offset(skip).limit(limit)
    result = await db.execute(query)
    return [serialize(i) for i in result.scalars().all()]


@router.post("", status_code=status.HTTP_201_CREATED)
async def create_inventory(
    payload: InventoryCreate,
    db: AsyncSession = Depends(get_db),
    _: Profile = Depends(get_warehouse_user),
):
    data = payload.model_dump(exclude_unset=True)
    data["warehouse_id"] = uuid.UUID(data["warehouse_id"])
    if data.get("shipment_id"):
        data["shipment_id"] = uuid.UUID(data["shipment_id"])
    data["status"] = _stock_status(data.get("qty", 0), data.get("reorder_at"))
    return serialize(await crud.create_item(db, InventoryItem, data))


@router.get("/{item_id}")
async def get_inventory(
    item_id: str,
    db: AsyncSession = Depends(get_db),
    _: Profile = Depends(get_current_user),
):
    item = await crud.get_item(db, InventoryItem, item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Inventory item not found")
    return serialize(item)


@router.put("/{item_id}")
@router.patch("/{item_id}")
async def update_inventory(
    item_id: str,
    payload: InventoryUpdate,
    db: AsyncSession = Depends(get_db),
    _: Profile = Depends(get_warehouse_user),
):
    item = await crud.get_item(db, InventoryItem, item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Inventory item not found")
    data = payload.model_dump(exclude_unset=True)
    item = await crud.update_item(db, item, data)
    # Recompute the stock status if quantity/threshold changed.
    if "qty" in data or "reorder_at" in data:
        item.status = _stock_status(item.qty or 0, item.reorder_at)
        await db.flush()
    return serialize(item)


@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_inventory(
    item_id: str,
    db: AsyncSession = Depends(get_db),
    _: Profile = Depends(get_warehouse_user),
):
    item = await crud.get_item(db, InventoryItem, item_id)
    if item:
        await crud.delete_item(db, item)
    return None
