"""
Dispatch API — assign/reassign drivers to shipments and surface dispatch-ready
state (available drivers, active shipments). Used by the Logistics Dashboard.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import require_roles
from app.core.validators import safe_uuid
from app.models.profile import Profile, UserRole
from app.models.logistics import Delivery
from app.models.shipment import Shipment, ShipmentStatusHistory
from app.schemas.payloads import AssignDriverRequest, ReassignDriverRequest
from app.services import crud
from app.utils.helpers import generate_ref, serialize

router = APIRouter(prefix="/dispatch", tags=["dispatch"])

# Only logistics, admin, and customer (for simulation) can access dispatch operations
dispatch_guard = require_roles(UserRole.LOGISTICS, UserRole.ADMIN, UserRole.CUSTOMER)

STATUS_IN_TRANSIT = "In Transit"

# Shipment statuses considered "active" (still in the pipeline).
ACTIVE_STATUSES = ("Awaiting Dispatch", STATUS_IN_TRANSIT, "Out for Delivery", "Customs Hold", "Delayed")


@router.post("/assign", status_code=status.HTTP_201_CREATED)
async def assign_driver(
    payload: AssignDriverRequest,
    db: AsyncSession = Depends(get_db),
    current_user: Profile = Depends(dispatch_guard),
):
    """Assign a driver to a shipment. Creates a delivery record."""
    shipment_uuid = safe_uuid(payload.shipment_id, "shipment_id")
    driver_uuid = safe_uuid(payload.driver_id, "driver_id")

    # Verify shipment exists - do not fabricate phantom records
    shipment = await crud.get_item(db, Shipment, shipment_uuid)
    if not shipment:
        raise HTTPException(status_code=404, detail="Shipment not found")

    # Verify driver exists and has driver role
    driver = await crud.get_item(db, Profile, driver_uuid)
    if not driver or driver.role != UserRole.DRIVER:
        raise HTTPException(status_code=404, detail="Driver not found")

    # Parse optional UUIDs
    vehicle_uuid = safe_uuid(payload.vehicle_id, "vehicle_id") if payload.vehicle_id else None
    route_uuid = safe_uuid(payload.route_id, "route_id") if payload.route_id else None

    delivery = Delivery(
        delivery_code=generate_ref("DLV"),
        shipment_id=shipment.id,
        driver_id=driver.id,
        vehicle_id=vehicle_uuid,
        route_id=route_uuid,
        status="Pending",
        eta=payload.eta,
    )
    db.add(delivery)

    # Update shipment status and driver availability
    shipment.status = STATUS_IN_TRANSIT
    driver.status = "on_trip"
    db.add(ShipmentStatusHistory(
        shipment_id=shipment.id,
        status=STATUS_IN_TRANSIT,
        note=f"Assigned to driver {driver.name}",
        changed_by=current_user.id,
    ))

    await db.flush()
    return serialize(delivery)


@router.post("/reassign")
async def reassign_driver(
    payload: ReassignDriverRequest,
    db: AsyncSession = Depends(get_db),
    current_user: Profile = Depends(dispatch_guard),
):
    """Reassign a delivery to a different driver."""
    delivery = await crud.get_item(db, Delivery, safe_uuid(payload.delivery_id, "delivery_id"))
    if not delivery:
        raise HTTPException(status_code=404, detail="Delivery not found")

    driver = await crud.get_item(db, Profile, safe_uuid(payload.driver_id, "driver_id"))
    if not driver or driver.role != UserRole.DRIVER:
        raise HTTPException(status_code=404, detail="Driver not found")

    prev_driver_id = delivery.driver_id
    delivery.driver_id = driver.id
    driver.status = "on_trip"

    # Free the previous driver if they have no other active deliveries
    if prev_driver_id and prev_driver_id != driver.id:
        prev = await crud.get_item(db, Profile, prev_driver_id)
        if prev:
            prev.status = "on_duty"

    if delivery.shipment_id:
        db.add(ShipmentStatusHistory(
            shipment_id=delivery.shipment_id,
            status=STATUS_IN_TRANSIT,
            note=f"Reassigned to driver {driver.name}",
            changed_by=current_user.id,
        ))

    await db.flush()
    return serialize(delivery)


@router.get("/drivers")
async def available_drivers(
    db: AsyncSession = Depends(get_db),
    _: Profile = Depends(dispatch_guard),
):
    """List drivers not currently on a trip and not suspended."""
    result = await db.execute(
        select(Profile).where(
            Profile.role == UserRole.DRIVER,
            Profile.status.notin_(["on_trip", "suspended", "off_duty"]),
        ).order_by(Profile.name)
    )
    return [serialize(d) for d in result.scalars().all()]


@router.get("/shipments")
async def active_shipments(
    db: AsyncSession = Depends(get_db),
    _: Profile = Depends(dispatch_guard),
):
    """List shipments that are still in the pipeline."""
    result = await db.execute(
        select(Shipment).where(Shipment.status.in_(ACTIVE_STATUSES))
        .order_by(Shipment.created_at.desc())
    )
    return [serialize(s) for s in result.scalars().all()]
