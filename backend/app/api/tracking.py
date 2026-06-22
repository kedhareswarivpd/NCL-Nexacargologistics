"""
Tracking API — public shipment tracking plus authenticated live-location feeds.

- GET /tracking/{tracking_id}                    public lookup by tracking number (legacy)
- GET /tracking/shipment/{tracking_number}       public lookup by tracking number
- GET /tracking/shipment/{shipment_id}/location  current position (auth)
- GET /tracking/shipment/{shipment_id}/history   status timeline (auth)
- POST /tracking/location-update                 ingest a GPS/location ping (ops)
- WS  /tracking/live/{shipment_id}               stream live position snapshots
"""

import asyncio
import uuid

from fastapi import APIRouter, Depends, HTTPException, WebSocket, WebSocketDisconnect
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db, async_session_factory
from app.core.dependencies import require_roles
from app.core.security import verify_access_token, TokenError
from app.middleware.auth import get_current_user
from app.models.profile import Profile, UserRole
from app.models.shipment import Shipment, ShipmentStatusHistory
from app.schemas.payloads import LocationUpdate
from app.services import crud
from app.utils.helpers import serialize

router = APIRouter(prefix="/tracking", tags=["tracking"])

ops_guard = require_roles(UserRole.LOGISTICS, UserRole.WAREHOUSE, UserRole.CUSTOMS, UserRole.DRIVER)


def _public_view(shipment: Shipment, events) -> dict:
    data = serialize(shipment)
    for hidden in ("customer_email", "customer_phone", "customer_id"):
        data.pop(hidden, None)
    return {"shipment": data, "events": [serialize(e) for e in events]}


async def _by_tracking(db: AsyncSession, tracking_id: str) -> Shipment:
    result = await db.execute(select(Shipment).where(Shipment.tracking_id == tracking_id))
    shipment = result.scalar_one_or_none()
    if not shipment:
        raise HTTPException(status_code=404, detail="Tracking id not found")
    return shipment


async def _events(db: AsyncSession, shipment_id) -> list:
    rows = await db.execute(
        select(ShipmentStatusHistory)
        .where(ShipmentStatusHistory.shipment_id == shipment_id)
        .order_by(ShipmentStatusHistory.changed_at.desc())
    )
    return list(rows.scalars().all())


@router.get("/shipment/{tracking_number}")
async def track_by_number(tracking_number: str, db: AsyncSession = Depends(get_db)):
    """Public lookup by human-facing tracking number."""
    shipment = await _by_tracking(db, tracking_number)
    return _public_view(shipment, await _events(db, shipment.id))


@router.get("/shipment/{shipment_id}/location")
async def shipment_location(
    shipment_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: Profile = Depends(get_current_user),
):
    shipment = await crud.get_item(db, Shipment, shipment_id)
    if not shipment:
        raise HTTPException(status_code=404, detail="Shipment not found")
    if current_user.role not in UserRole.STAFF and shipment.customer_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not allowed")
    return {
        "tracking_id": shipment.tracking_id,
        "status": shipment.status,
        "lat": shipment.lat,
        "lng": shipment.lng,
        "eta": shipment.eta,
    }


@router.get("/shipment/{shipment_id}/history")
async def shipment_location_history(
    shipment_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: Profile = Depends(get_current_user),
):
    shipment = await crud.get_item(db, Shipment, shipment_id)
    if not shipment:
        raise HTTPException(status_code=404, detail="Shipment not found")
    if current_user.role not in UserRole.STAFF and shipment.customer_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not allowed")
    return [serialize(e) for e in await _events(db, shipment.id)]


@router.post("/location-update")
async def location_update(
    payload: LocationUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: Profile = Depends(ops_guard),
):
    """Ingest a location ping (and optional status) from a driver/device."""
    shipment = await crud.get_item(db, Shipment, payload.shipment_id)
    if not shipment:
        raise HTTPException(status_code=404, detail="Shipment not found")
    shipment.lat = payload.lat
    shipment.lng = payload.lng
    if payload.status:
        shipment.status = payload.status
    db.add(ShipmentStatusHistory(
        shipment_id=shipment.id,
        status=payload.status or shipment.status,
        note=payload.note or "Location update",
        location=payload.location,
        lat=payload.lat,
        lng=payload.lng,
        changed_by=current_user.id,
    ))
    await db.flush()
    await db.refresh(shipment)
    return {"tracking_id": shipment.tracking_id, "lat": shipment.lat, "lng": shipment.lng, "status": shipment.status}


@router.get("/{tracking_id}")
async def track(tracking_id: str, db: AsyncSession = Depends(get_db)):
    """Legacy public lookup by tracking number."""
    shipment = await _by_tracking(db, tracking_id)
    return _public_view(shipment, await _events(db, shipment.id))


@router.websocket("/live/{shipment_id}")
async def live_tracking(websocket: WebSocket, shipment_id: str):
    """Stream periodic position snapshots. Auth via ?token=<access_token>."""
    await websocket.accept()
    token = websocket.query_params.get("token")
    if not token:
        await websocket.send_json({"error": "Missing token"})
        await websocket.close(code=1008)
        return
    try:
        await verify_access_token(token)
    except TokenError:
        await websocket.send_json({"error": "Invalid token"})
        await websocket.close(code=1008)
        return

    try:
        sid = uuid.UUID(shipment_id)
    except ValueError:
        await websocket.send_json({"error": "Invalid shipment id"})
        await websocket.close(code=1008)
        return

    try:
        while True:
            async with async_session_factory() as db:
                shipment = await db.get(Shipment, sid)
            if shipment is None:
                await websocket.send_json({"error": "Shipment not found"})
                break
            await websocket.send_json({
                "tracking_id": shipment.tracking_id,
                "status": shipment.status,
                "lat": shipment.lat,
                "lng": shipment.lng,
                "eta": shipment.eta,
            })
            await asyncio.sleep(5)
    except WebSocketDisconnect:
        return
