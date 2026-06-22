"""
Driver App API — assigned deliveries, status updates, proof-of-delivery upload.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import get_driver_user
from app.models.profile import Profile
from app.models.logistics import Delivery
from app.models.shipment import Shipment, ShipmentStatusHistory
from app.schemas.payloads import DeliveryUpdate
from app.services import crud
from app.utils.helpers import serialize, now_iso

router = APIRouter(prefix="/driver", tags=["driver"])


@router.get("/deliveries")
async def my_deliveries(
    db: AsyncSession = Depends(get_db),
    current_user: Profile = Depends(get_driver_user),
):
    result = await db.execute(
        select(Delivery).where(Delivery.driver_id == current_user.id).order_by(Delivery.created_at.desc())
    )
    return [serialize(d) for d in result.scalars().all()]


@router.patch("/deliveries/{delivery_id}")
async def update_my_delivery(
    delivery_id: str,
    payload: DeliveryUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: Profile = Depends(get_driver_user),
):
    delivery = await crud.get_item(db, Delivery, delivery_id)
    if not delivery or delivery.driver_id != current_user.id:
        raise HTTPException(status_code=404, detail="Delivery not found")
    data = payload.model_dump(exclude_unset=True)
    updated = await crud.update_item(db, delivery, data)

    # Mirror delivery status onto the shipment + record history.
    if data.get("status") and delivery.shipment_id:
        shipment = await crud.get_item(db, Shipment, delivery.shipment_id)
        if shipment:
            mapped = {
                "Picked Up": "In Transit",
                "In Transit": "In Transit",
                "Delivered": "Delivered",
                "Failed": "Delayed",
            }.get(data["status"], shipment.status)
            shipment.status = mapped
            db.add(ShipmentStatusHistory(
                shipment_id=shipment.id,
                status=mapped,
                note=f"Driver update: {data['status']}",
                location=data.get("location"),
                lat=data.get("lat"),
                lng=data.get("lng"),
                changed_by=current_user.id,
            ))
            await db.flush()
    return serialize(updated)


@router.post("/deliveries/{delivery_id}/proof")
async def upload_proof(
    delivery_id: str,
    proof_url: str,
    db: AsyncSession = Depends(get_db),
    current_user: Profile = Depends(get_driver_user),
):
    delivery = await crud.get_item(db, Delivery, delivery_id)
    if not delivery or delivery.driver_id != current_user.id:
        raise HTTPException(status_code=404, detail="Delivery not found")
    delivery.proof_url = proof_url
    delivery.status = "Delivered"
    delivery.progress = 100
    await db.flush()
    if delivery.shipment_id:
        shipment = await crud.get_item(db, Shipment, delivery.shipment_id)
        if shipment:
            shipment.status = "Delivered"
            db.add(ShipmentStatusHistory(
                shipment_id=shipment.id,
                status="Delivered",
                note="Proof of delivery uploaded",
                changed_by=current_user.id,
            ))
            await db.flush()
    return serialize(delivery)


@router.get("/profile")
async def driver_profile(current_user: Profile = Depends(get_driver_user)):
    data = serialize(current_user)
    data["last_seen"] = now_iso()
    return data
