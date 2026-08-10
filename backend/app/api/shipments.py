import uuid

from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import require_roles, assert_owner_or_staff
from app.core.validators import validate_pagination
from app.middleware.auth import get_current_user
from app.models.profile import Profile, UserRole
from app.models.shipment import Shipment, ShipmentStatusHistory, Document
from app.schemas.payloads import (
    ShipmentCreate,
    ShipmentUpdate,
    StatusUpdate,
    DocumentCreate,
)
from app.services import crud
from app.services.notification_service import run_notify_shipment_update, run_notify_shipment_created
from app.utils.helpers import generate_tracking_id, serialize, serialize_all, is_safe_file_url

router = APIRouter(prefix="/shipments", tags=["shipments"])

SHIPMENT_NOT_FOUND = "Shipment not found"

ops_guard = require_roles(UserRole.LOGISTICS, UserRole.WAREHOUSE, UserRole.CUSTOMS, UserRole.DRIVER)


@router.get("")
async def list_shipments(
    status_filter: str | None = None,
    pagination: tuple[int, int] = Depends(validate_pagination),
    db: AsyncSession = Depends(get_db),
    current_user: Profile = Depends(get_current_user),
):
    skip, limit = pagination
    query = select(Shipment)
    if current_user.role not in UserRole.STAFF:
        query = query.where(Shipment.customer_id == current_user.id)
    if status_filter:
        query = query.where(Shipment.status == status_filter)
    query = query.order_by(Shipment.created_at.desc()).offset(skip).limit(limit)
    result = await db.execute(query)
    return serialize_all(result.scalars().all())


@router.post("", status_code=status.HTTP_201_CREATED)
async def create_shipment(
    payload: ShipmentCreate,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
    current_user: Profile = Depends(get_current_user),
):
    data = payload.model_dump(exclude_unset=True)
    data["tracking_id"] = generate_tracking_id()

    if data.get("weight") is not None:
        data["weight"] = str(data["weight"])
    if data.get("volume") is not None:
        data["volume"] = str(data["volume"])

    if current_user.role == UserRole.CUSTOMER:
        data["customer_id"] = current_user.id
        data.setdefault("customer_name", current_user.name)
        data.setdefault("customer_email", current_user.email)
    elif data.get("customer_id"):
        data["customer_id"] = uuid.UUID(data["customer_id"])

    if data.get("quote_id"):
        data["quote_id"] = uuid.UUID(data["quote_id"])

    shipment = await crud.create_item(db, Shipment, data)
    await crud.record_status_history(
        db,
        shipment_id=shipment.id,
        status=shipment.status,
        note="Shipment created",
        changed_by=current_user.id,
    )
    background_tasks.add_task(
        run_notify_shipment_created,
        str(shipment.customer_id) if shipment.customer_id else None,
        shipment.tracking_id,
        shipment.customer_email,
    )
    return serialize(shipment)


@router.get("/{shipment_id}")
async def get_shipment(
    shipment_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: Profile = Depends(get_current_user),
):
    shipment = await crud.get_item(db, Shipment, shipment_id)
    if not shipment:
        raise HTTPException(status_code=404, detail=SHIPMENT_NOT_FOUND)  # NOSONAR
    assert_owner_or_staff(shipment, current_user)
    return serialize(shipment)


@router.patch("/{shipment_id}")
@router.put("/{shipment_id}")
async def update_shipment(
    shipment_id: str,
    payload: ShipmentUpdate,
    db: AsyncSession = Depends(get_db),
    _: Profile = Depends(ops_guard),
):
    shipment = await crud.get_item(db, Shipment, shipment_id)
    if not shipment:
        raise HTTPException(status_code=404, detail=SHIPMENT_NOT_FOUND)  # NOSONAR
    updated = await crud.update_item(db, shipment, payload.model_dump(exclude_unset=True))
    return serialize(updated)


@router.delete("/{shipment_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_shipment(
    shipment_id: str,
    db: AsyncSession = Depends(get_db),
    _: Profile = Depends(require_roles(UserRole.LOGISTICS)),
):
    shipment = await crud.get_item(db, Shipment, shipment_id)
    if shipment:
        await crud.delete_item(db, shipment)
    return None


@router.post("/{shipment_id}/status")
@router.patch("/{shipment_id}/status")
async def update_status(
    shipment_id: str,
    payload: StatusUpdate,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
    current_user: Profile = Depends(ops_guard),
):
    shipment = await crud.get_item(db, Shipment, shipment_id)
    if not shipment:
        raise HTTPException(status_code=404, detail=SHIPMENT_NOT_FOUND)  # NOSONAR
    shipment.status = payload.status
    if payload.lat is not None:
        shipment.lat = payload.lat
    if payload.lng is not None:
        shipment.lng = payload.lng

    await crud.record_status_history(
        db,
        shipment_id=shipment.id,
        status=payload.status,
        note=payload.note,
        location=payload.location,
        lat=payload.lat,
        lng=payload.lng,
        changed_by=current_user.id,
    )
    background_tasks.add_task(
        run_notify_shipment_update,
        str(shipment.customer_id) if shipment.customer_id else None,
        shipment.tracking_id,
        payload.status,
        shipment.customer_email,
    )
    return serialize(shipment)


@router.get("/{shipment_id}/tracking")
async def shipment_tracking(
    shipment_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: Profile = Depends(get_current_user),
):
    shipment = await crud.get_item(db, Shipment, shipment_id)
    if not shipment:
        raise HTTPException(status_code=404, detail=SHIPMENT_NOT_FOUND)  # NOSONAR
    assert_owner_or_staff(shipment, current_user)
    events = await db.execute(
        select(ShipmentStatusHistory)
        .where(ShipmentStatusHistory.shipment_id == shipment.id)
        .order_by(ShipmentStatusHistory.changed_at.desc())
    )
    return {
        "tracking_id": shipment.tracking_id,
        "status": shipment.status,
        "location": {"lat": shipment.lat, "lng": shipment.lng},
        "eta": shipment.eta,
        "events": serialize_all(events.scalars().all()),
    }


@router.post("/{shipment_id}/cancel")
async def cancel_shipment(
    shipment_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: Profile = Depends(get_current_user),
):
    shipment = await crud.get_item(db, Shipment, shipment_id)
    if not shipment:
        raise HTTPException(status_code=404, detail=SHIPMENT_NOT_FOUND)  # NOSONAR
    assert_owner_or_staff(shipment, current_user)

    if shipment.status in ("Delivered", "Cancelled"):
        raise HTTPException(status_code=400, detail=f"Cannot cancel a {shipment.status} shipment")  # NOSONAR
    if current_user.role == UserRole.CUSTOMER and shipment.status not in ("Awaiting Dispatch",):
        raise HTTPException(status_code=400, detail="Shipment already in transit; contact support to cancel")  # NOSONAR

    shipment.status = "Cancelled"
    await crud.record_status_history(
        db,
        shipment_id=shipment.id,
        status="Cancelled",
        note="Shipment cancelled",
        changed_by=current_user.id,
    )
    await db.refresh(shipment)
    return serialize(shipment)


@router.get("/{shipment_id}/history")
async def shipment_history(
    shipment_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: Profile = Depends(get_current_user),
):
    shipment = await crud.get_item(db, Shipment, shipment_id)
    if not shipment:
        raise HTTPException(status_code=404, detail=SHIPMENT_NOT_FOUND)  # NOSONAR
    assert_owner_or_staff(shipment, current_user)
    result = await db.execute(
        select(ShipmentStatusHistory)
        .where(ShipmentStatusHistory.shipment_id == shipment.id)
        .order_by(ShipmentStatusHistory.changed_at.desc())
    )
    return serialize_all(result.scalars().all())


@router.get("/{shipment_id}/documents")
async def list_documents(
    shipment_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: Profile = Depends(get_current_user),
):
    shipment = await crud.get_item(db, Shipment, shipment_id)
    if not shipment:
        raise HTTPException(status_code=404, detail=SHIPMENT_NOT_FOUND)  # NOSONAR
    assert_owner_or_staff(shipment, current_user)
    result = await db.execute(
        select(Document).where(Document.shipment_id == shipment.id).order_by(Document.created_at.desc())
    )
    return serialize_all(result.scalars().all())


@router.post("/{shipment_id}/documents", status_code=status.HTTP_201_CREATED)
async def add_document(
    shipment_id: str,
    payload: DocumentCreate,
    db: AsyncSession = Depends(get_db),
    current_user: Profile = Depends(get_current_user),
):
    url = (payload.file_url or "").strip()
    if not is_safe_file_url(url):
        raise HTTPException(status_code=400, detail="Invalid file URL. Must be a safe host (e.g. Supabase).")  # NOSONAR
        
    shipment = await crud.get_item(db, Shipment, shipment_id)
    if not shipment:
        raise HTTPException(status_code=404, detail=SHIPMENT_NOT_FOUND)  # NOSONAR
    assert_owner_or_staff(shipment, current_user)
    doc = await crud.create_item(db, Document, {
        "shipment_id": shipment.id,
        "doc_type": payload.doc_type,
        "file_name": payload.file_name,
        "file_url": url,
        "uploaded_by": current_user.id,
    })
    return serialize(doc)
