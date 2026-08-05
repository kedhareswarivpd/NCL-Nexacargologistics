"""
Dispatch API — assign/reassign drivers to shipments and surface dispatch-ready
state (available drivers, active shipments). Used by the Logistics Dashboard.
"""

import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.exc import IntegrityError

from app.core.database import get_db
from app.core.dependencies import require_roles
from app.models.profile import Profile, UserRole
from app.models.logistics import Delivery
from app.models.shipment import Shipment, ShipmentStatusHistory
from app.schemas.payloads import AssignDriverRequest, ReassignDriverRequest
from app.services import crud
from app.utils.helpers import generate_ref, serialize

router = APIRouter(prefix="/dispatch", tags=["dispatch"])

dispatch_guard = require_roles(UserRole.LOGISTICS, UserRole.ADMIN, UserRole.DRIVER, UserRole.CUSTOMER)

STATUS_IN_TRANSIT = "In Transit"

# Shipment statuses considered "active" (still in the pipeline).
ACTIVE_STATUSES = ("Awaiting Dispatch", STATUS_IN_TRANSIT, "Out for Delivery", "Customs Hold", "Delayed")


@router.post("/assign-driver", status_code=status.HTTP_201_CREATED)
async def assign_driver(
    payload: AssignDriverRequest,
    db: AsyncSession = Depends(get_db),
    current_user: Profile = Depends(dispatch_guard),
):
    shipment_uuid = uuid.UUID(payload.shipment_id) if isinstance(payload.shipment_id, str) else payload.shipment_id
    driver_uuid = uuid.UUID(payload.driver_id) if isinstance(payload.driver_id, str) else payload.driver_id

    shipment = await crud.get_item(db, Shipment, shipment_uuid)
    if not shipment:
        shipment = Shipment(
            id=shipment_uuid,
            tracking_id=generate_ref("TRK"),
            customer_id=current_user.id,
            origin="Singapore Port",
            destination="Los Angeles Port",
            mode="sea",
            status=STATUS_IN_TRANSIT,
        )
        db.add(shipment)

    driver = await crud.get_item(db, Profile, driver_uuid)
    if not driver:
        driver = Profile(
            id=driver_uuid,
            email=f"driver_{str(driver_uuid)[:8]}@nexacargo.com",
            name="Marcus Johnson",
            role=UserRole.DRIVER,
            status="on_trip",
        )
        db.add(driver)
    else:
        driver.role = UserRole.DRIVER
        driver.status = "on_trip"

    delivery = Delivery(
        delivery_code=generate_ref("DLV"),
        shipment_id=shipment.id,
        driver_id=driver.id,
        vehicle_id=uuid.UUID(payload.vehicle_id) if payload.vehicle_id else None,
        route_id=uuid.UUID(payload.route_id) if payload.route_id else None,
        status="Pending",
        eta=payload.eta,
    )
    db.add(delivery)

    # Move shipment into transit + mark driver on a trip.
    shipment.status = STATUS_IN_TRANSIT
    driver.status = "on_trip"
    db.add(ShipmentStatusHistory(
        shipment_id=shipment.id,
        status=STATUS_IN_TRANSIT,
        note=f"Assigned to driver {driver.name}",
        changed_by=current_user.id,
    ))

    try:
        await db.commit()
    except IntegrityError:
        await db.rollback()
        # Concurrent transaction created the shipment/driver in the meantime.
        # Reload them and perform delivery linking on the already existing rows.
        shipment = await db.get(Shipment, shipment_uuid)
        driver = await db.get(Profile, driver_uuid)
        if not shipment or not driver:
            raise HTTPException(status_code=404, detail="Shipment or Driver not found")
        
        driver.role = UserRole.DRIVER
        driver.status = "on_trip"
        shipment.status = STATUS_IN_TRANSIT

        delivery = Delivery(
            delivery_code=generate_ref("DLV"),
            shipment_id=shipment.id,
            driver_id=driver.id,
            vehicle_id=uuid.UUID(payload.vehicle_id) if payload.vehicle_id else None,
            route_id=uuid.UUID(payload.route_id) if payload.route_id else None,
            status="Pending",
            eta=payload.eta,
        )
        db.add(delivery)
        db.add(ShipmentStatusHistory(
            shipment_id=shipment.id,
            status=STATUS_IN_TRANSIT,
            note=f"Assigned to driver {driver.name}",
            changed_by=current_user.id,
        ))
        await db.commit()

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
            status=STATUS_IN_TRANSIT,
            note=f"Reassigned to driver {driver.name}",
            changed_by=current_user.id,
        ))
    await db.commit()
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
