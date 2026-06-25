import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import require_roles
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
from app.services.notification_service import notify_shipment_update, notify_shipment_created
from app.utils.helpers import generate_tracking_id, serialize

router = APIRouter(prefix="/shipments", tags=["shipments"])

ops_guard = require_roles(UserRole.LOGISTICS, UserRole.WAREHOUSE, UserRole.CUSTOMS, UserRole.DRIVER)


def _can_view_all(role: str) -> bool:
    return role in UserRole.STAFF


@router.get("")
async def list_shipments(
    status_filter: str | None = None,
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db),
    current_user: Profile = Depends(get_current_user),
):
    query = select(Shipment)
    if not _can_view_all(current_user.role):
        query = query.where(Shipment.customer_id == current_user.id)
    if status_filter:
        query = query.where(Shipment.status == status_filter)
    query = query.order_by(Shipment.created_at.desc()).offset(skip).limit(limit)
    result = await db.execute(query)
    return [serialize(s) for s in result.scalars().all()]


@router.post("", status_code=status.HTTP_201_CREATED)
async def create_shipment(
    payload: ShipmentCreate,
    db: AsyncSession = Depends(get_db),
    current_user: Profile = Depends(get_current_user),
):
    data = payload.model_dump(exclude_unset=True)
    data["tracking_id"] = generate_tracking_id()

    if current_user.role == UserRole.CUSTOMER:
        data["customer_id"] = current_user.id
        data.setdefault("customer_name", current_user.name)
        data.setdefault("customer_email", current_user.email)
    elif data.get("customer_id"):
        data["customer_id"] = uuid.UUID(data["customer_id"])

    if data.get("quote_id"):
        data["quote_id"] = uuid.UUID(data["quote_id"])

    shipment = await crud.create_item(db, Shipment, data)
    db.add(ShipmentStatusHistory(
        shipment_id=shipment.id,
        status=shipment.status,
        note="Shipment created",
        changed_by=current_user.id,
    ))
    await db.flush()
    await notify_shipment_created(
        db,
        customer_id=str(shipment.customer_id) if shipment.customer_id else None,
        tracking_id=shipment.tracking_id,
        email_to=shipment.customer_email,
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
        raise HTTPException(status_code=404, detail="Shipment not found")
    if not _can_view_all(current_user.role) and shipment.customer_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not allowed")
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
        raise HTTPException(status_code=404, detail="Shipment not found")
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
    db: AsyncSession = Depends(get_db),
    current_user: Profile = Depends(ops_guard),
):
    shipment = await crud.get_item(db, Shipment, shipment_id)
    if not shipment:
        raise HTTPException(status_code=404, detail="Shipment not found")
    shipment.status = payload.status
    if payload.lat is not None:
        shipment.lat = payload.lat
    if payload.lng is not None:
        shipment.lng = payload.lng
    db.add(ShipmentStatusHistory(
        shipment_id=shipment.id,
        status=payload.status,
        note=payload.note,
        location=payload.location,
        lat=payload.lat,
        lng=payload.lng,
        changed_by=current_user.id,
    ))
    await db.flush()
    await notify_shipment_update(
        db,
        customer_id=str(shipment.customer_id) if shipment.customer_id else None,
        tracking_id=shipment.tracking_id,
        status=payload.status,
        email_to=shipment.customer_email,
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
        raise HTTPException(status_code=404, detail="Shipment not found")
    if not _can_view_all(current_user.role) and shipment.customer_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not allowed")
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
        "events": [serialize(e) for e in events.scalars().all()],
    }


@router.post("/{shipment_id}/cancel")
async def cancel_shipment(
    shipment_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: Profile = Depends(get_current_user),
):
    shipment = await crud.get_item(db, Shipment, shipment_id)
    if not shipment:
        raise HTTPException(status_code=404, detail="Shipment not found")
    is_owner = shipment.customer_id == current_user.id
    if not (_can_view_all(current_user.role) or is_owner):
        raise HTTPException(status_code=403, detail="Not allowed")
    if shipment.status in ("Delivered", "Cancelled"):
        raise HTTPException(status_code=400, detail=f"Cannot cancel a {shipment.status} shipment")
    if current_user.role == UserRole.CUSTOMER and shipment.status not in ("Awaiting Dispatch",):
        raise HTTPException(status_code=400, detail="Shipment already in transit; contact support to cancel")
    shipment.status = "Cancelled"
    db.add(ShipmentStatusHistory(
        shipment_id=shipment.id,
        status="Cancelled",
        note="Shipment cancelled",
        changed_by=current_user.id,
    ))
    await db.flush()
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
        raise HTTPException(status_code=404, detail="Shipment not found")
    if not _can_view_all(current_user.role) and shipment.customer_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not allowed")
    result = await db.execute(
        select(ShipmentStatusHistory)
        .where(ShipmentStatusHistory.shipment_id == shipment.id)
        .order_by(ShipmentStatusHistory.changed_at.desc())
    )
    return [serialize(h) for h in result.scalars().all()]


@router.get("/{shipment_id}/documents")
async def list_documents(
    shipment_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: Profile = Depends(get_current_user),
):
    shipment = await crud.get_item(db, Shipment, shipment_id)
    if not shipment:
        raise HTTPException(status_code=404, detail="Shipment not found")
    if not _can_view_all(current_user.role) and shipment.customer_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not allowed")
    result = await db.execute(
        select(Document).where(Document.shipment_id == shipment.id).order_by(Document.created_at.desc())
    )
    return [serialize(d) for d in result.scalars().all()]


@router.post("/{shipment_id}/documents", status_code=status.HTTP_201_CREATED)
async def add_document(
    shipment_id: str,
    payload: DocumentCreate,
    db: AsyncSession = Depends(get_db),
    current_user: Profile = Depends(get_current_user),
):
    shipment = await crud.get_item(db, Shipment, shipment_id)
    if not shipment:
        raise HTTPException(status_code=404, detail="Shipment not found")
    if not _can_view_all(current_user.role) and shipment.customer_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not allowed")
    doc = await crud.create_item(db, Document, {
        "shipment_id": shipment.id,
        "doc_type": payload.doc_type,
        "file_name": payload.file_name,
        "file_url": payload.file_url,
        "uploaded_by": current_user.id,
    })
    return serialize(doc)
