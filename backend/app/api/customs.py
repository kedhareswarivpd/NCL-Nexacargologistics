"""
Customs API — clearance entries (Customs Dashboard / clearance workflow).
"""

import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import get_customs_user
from app.models.profile import Profile
from app.models.customs import CustomsEntry
from app.models.shipment import Shipment, ShipmentStatusHistory
from app.schemas.payloads import CustomsCreate, CustomsUpdate
from app.services import crud
from app.utils.helpers import generate_ref, serialize

router = APIRouter(prefix="/customs", tags=["customs"])


@router.get("/entries")
async def list_entries(
    status_filter: str | None = None,
    db: AsyncSession = Depends(get_db),
    _: Profile = Depends(get_customs_user),
):
    query = select(CustomsEntry)
    if status_filter:
        query = query.where(CustomsEntry.status == status_filter)
    query = query.order_by(CustomsEntry.created_at.desc())
    result = await db.execute(query)
    return [serialize(e) for e in result.scalars().all()]


@router.post("/entries", status_code=status.HTTP_201_CREATED)
async def create_entry(
    payload: CustomsCreate,
    db: AsyncSession = Depends(get_db),
    _: Profile = Depends(get_customs_user),
):
    data = payload.model_dump(exclude_unset=True)
    if data.get("shipment_id"):
        data["shipment_id"] = uuid.UUID(data["shipment_id"])
    data["entry_ref"] = generate_ref("CUS")
    return serialize(await crud.create_item(db, CustomsEntry, data))


@router.patch("/entries/{entry_id}")
@router.put("/entries/{entry_id}")
async def update_entry(
    entry_id: str,
    payload: CustomsUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: Profile = Depends(get_customs_user),
):
    entry = await crud.get_item(db, CustomsEntry, entry_id)
    if not entry:
        raise HTTPException(status_code=404, detail="Customs entry not found")
    data = payload.model_dump(exclude_unset=True)
    if data.get("status"):
        entry.reviewed_by = current_user.id
    entry = await crud.update_item(db, entry, data)

    # When cleared/held, reflect on the linked shipment.
    if data.get("status") in ("cleared", "held") and entry.shipment_id:
        shipment = await crud.get_item(db, Shipment, entry.shipment_id)
        if shipment:
            shipment.status = "In Transit" if data["status"] == "cleared" else "Customs Hold"
            db.add(ShipmentStatusHistory(
                shipment_id=shipment.id,
                status=shipment.status,
                note=f"Customs {data['status']}",
                changed_by=current_user.id,
            ))
            await db.flush()
    return serialize(entry)
