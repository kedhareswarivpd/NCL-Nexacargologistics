"""
Dispatch API — assign/reassign drivers to shipments and surface dispatch-ready
state (available drivers, active shipments). Used by the Logistics Dashboard.
"""

import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import require_roles
from app.models.profile import Profile, UserRole
from app.models.logistics import Delivery
from app.models.shipment import Shipment, ShipmentStatusHistory
from app.schemas.payloads import AssignDriverRequest, ReassignDriverRequest
from app.services import crud
from app.utils.helpers import generate_ref, serialize

router = APIRouter(prefix="/dispatch", tags=["dispatch"])

dispatch_guard = require_roles(UserRole.LOGISTICS)

# Shipment statuses considered "active" (still in the pipeline).
ACTIVE_STATUSES = ("Awaiting Dispatch", "In Transit", "Out for Delivery", "Customs Hold", "Delayed")


@router.post("/assign-driver", status_code=status.HTTP_201_CREATED)
async def assign_driver(
    payload: AssignDriverRequest,
    db: AsyncSession = Depends(get_db),
    current_user: Profile = Depends(dispatch_guard),
):
    shipment = await crud.get_item(db, Shipment, payload.shipment_id)
    if not shipment:
        raise HTTPException(status_code=404, detail="Shipment not found")
    driver = await crud.get_item(db, Profile, payload.driver_id)
    if not driver or driver.role != UserRole.DRIVER:
        raise HTTPException(status_code=404, detail="Driver not found")

    delivery = await crud.create_item(db, Delivery, {
        "delivery_code": generate_ref("DLV"),
        "shipment_id": shipment.id,
        "driver_id": driver.id,
        "vehicle_id": uuid.UUID(payload.vehicle_id) if payload.vehicle_id else None,
        "route_id": uuid.UUID(payload.route_id) if payload.route_id else None,
        "status": "Pending",
        "eta": payload.eta,
    })
    # Move shipment into transit + mark driver on a trip.
    shipment.status = "In Transit"
    driver.status = "on_trip"
    db.add(ShipmentStatusHistory(
        shipment_id=shipment.id,
        status="In Transit",
        note=f"Assigned to driver {driver.name}",
        changed_by=current_user.id,
    ))
    await db.flush()
    await db.refresh(delivery)
    return serialize(delivery)


@router.post("/reassign-driver")
async def reassign_driver(
    payload: ReassignDriverRequest,
    db: AsyncSession = Depends(get_db),
    current_user: Profile = Depends(dispatch_guard),
):
    delivery = await crud.get_item(db, Delivery, payload.delivery_id)
    if not delivery:
        raise HTTPException(status_code=404, detail="Delivery not found")
    driver = await crud.get_item(db, Profile, payload.driver_id)
    if not driver or driver.role != UserRole.DRIVER:
        raise HTTPException(status_code=404, detail="Driver not found")

    prev_driver_id = delivery.driver_id
    delivery.driver_id = driver.id
    driver.status = "on_trip"
    # Free the previous driver if they have no other active deliveries.
    if prev_driver_id and prev_driver_id != driver.id:
        prev = await crud.get_item(db, Profile, prev_driver_id)
        if prev:
            prev.status = "on_duty"
    if delivery.shipment_id:
        db.add(ShipmentStatusHistory(
            shipment_id=delivery.shipment_id,
            status="In Transit",
            note=f"Reassigned to driver {driver.name}",
            changed_by=current_user.id,
        ))
    await db.flush()
    await db.refresh(delivery)
    return serialize(delivery)


@router.get("/available-drivers")
async def available_drivers(
    db: AsyncSession = Depends(get_db),
    _: Profile = Depends(dispatch_guard),
):
    """Drivers not currently on a trip and not suspended."""
    result = await db.execute(
        select(Profile).where(
            Profile.role == UserRole.DRIVER,
            Profile.status.notin_(["on_trip", "suspended", "off_duty"]),
        ).order_by(Profile.name)
    )
    return [serialize(d) for d in result.scalars().all()]


@router.get("/active-shipments")
async def active_shipments(
    db: AsyncSession = Depends(get_db),
    _: Profile = Depends(dispatch_guard),
):
    result = await db.execute(
        select(Shipment).where(Shipment.status.in_(ACTIVE_STATUSES))
        .order_by(Shipment.created_at.desc())
    )
    return [serialize(s) for s in result.scalars().all()]
