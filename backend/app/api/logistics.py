"""
Logistics API — containers, routes, vehicles, deliveries (Logistics Dashboard).
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import require_roles
from app.middleware.auth import get_current_user
from app.models.profile import Profile, UserRole
from app.models.logistics import Container, Route, Vehicle, Delivery
from app.schemas.payloads import (
    ContainerCreate, ContainerUpdate,
    RouteCreate, RouteUpdate,
    VehicleCreate, VehicleUpdate,
    DeliveryCreate, DeliveryUpdate,
)
from app.services import crud
from app.utils.helpers import generate_ref, serialize

router = APIRouter(prefix="/logistics", tags=["logistics"])

logistics_guard = require_roles(UserRole.LOGISTICS)
_UUID_FIELDS = {"shipment_id", "driver_id", "vehicle_id", "route_id"}


def _coerce_uuids(data: dict) -> dict:
    import uuid
    for field in _UUID_FIELDS:
        if data.get(field):
            data[field] = uuid.UUID(data[field])
    return data


# ----------------------------- Containers -----------------------------
@router.get("/containers")
async def list_containers(db: AsyncSession = Depends(get_db), _: Profile = Depends(get_current_user)):
    return [serialize(c) for c in await crud.list_items(db, Container, limit=500)]


@router.post("/containers", status_code=status.HTTP_201_CREATED)
async def create_container(payload: ContainerCreate, db: AsyncSession = Depends(get_db), _: Profile = Depends(logistics_guard)):
    return serialize(await crud.create_item(db, Container, _coerce_uuids(payload.model_dump(exclude_unset=True))))


@router.patch("/containers/{item_id}")
@router.put("/containers/{item_id}")
async def update_container(item_id: str, payload: ContainerUpdate, db: AsyncSession = Depends(get_db), _: Profile = Depends(logistics_guard)):
    obj = await crud.get_item(db, Container, item_id)
    if not obj:
        raise HTTPException(status_code=404, detail="Container not found")
    return serialize(await crud.update_item(db, obj, _coerce_uuids(payload.model_dump(exclude_unset=True))))


@router.delete("/containers/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_container(item_id: str, db: AsyncSession = Depends(get_db), _: Profile = Depends(logistics_guard)):
    obj = await crud.get_item(db, Container, item_id)
    if obj:
        await crud.delete_item(db, obj)
    return None


# ----------------------------- Routes -----------------------------
@router.get("/routes")
async def list_routes(db: AsyncSession = Depends(get_db), _: Profile = Depends(get_current_user)):
    return [serialize(r) for r in await crud.list_items(db, Route, limit=500)]


@router.post("/routes", status_code=status.HTTP_201_CREATED)
async def create_route(payload: RouteCreate, db: AsyncSession = Depends(get_db), _: Profile = Depends(logistics_guard)):
    return serialize(await crud.create_item(db, Route, _coerce_uuids(payload.model_dump(exclude_unset=True))))


@router.patch("/routes/{item_id}")
@router.put("/routes/{item_id}")
async def update_route(item_id: str, payload: RouteUpdate, db: AsyncSession = Depends(get_db), _: Profile = Depends(logistics_guard)):
    obj = await crud.get_item(db, Route, item_id)
    if not obj:
        raise HTTPException(status_code=404, detail="Route not found")
    return serialize(await crud.update_item(db, obj, _coerce_uuids(payload.model_dump(exclude_unset=True))))


@router.delete("/routes/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_route(item_id: str, db: AsyncSession = Depends(get_db), _: Profile = Depends(logistics_guard)):
    obj = await crud.get_item(db, Route, item_id)
    if obj:
        await crud.delete_item(db, obj)
    return None


# ----------------------------- Vehicles -----------------------------
@router.get("/vehicles")
async def list_vehicles(db: AsyncSession = Depends(get_db), _: Profile = Depends(get_current_user)):
    return [serialize(v) for v in await crud.list_items(db, Vehicle, limit=500)]


@router.post("/vehicles", status_code=status.HTTP_201_CREATED)
async def create_vehicle(payload: VehicleCreate, db: AsyncSession = Depends(get_db), _: Profile = Depends(logistics_guard)):
    return serialize(await crud.create_item(db, Vehicle, _coerce_uuids(payload.model_dump(exclude_unset=True))))


@router.patch("/vehicles/{item_id}")
@router.put("/vehicles/{item_id}")
async def update_vehicle(item_id: str, payload: VehicleUpdate, db: AsyncSession = Depends(get_db), _: Profile = Depends(logistics_guard)):
    obj = await crud.get_item(db, Vehicle, item_id)
    if not obj:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    return serialize(await crud.update_item(db, obj, _coerce_uuids(payload.model_dump(exclude_unset=True))))


@router.delete("/vehicles/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_vehicle(item_id: str, db: AsyncSession = Depends(get_db), _: Profile = Depends(logistics_guard)):
    obj = await crud.get_item(db, Vehicle, item_id)
    if obj:
        await crud.delete_item(db, obj)
    return None


# ----------------------------- Deliveries -----------------------------
@router.get("/deliveries")
async def list_deliveries(db: AsyncSession = Depends(get_db), _: Profile = Depends(get_current_user)):
    return [serialize(d) for d in await crud.list_items(db, Delivery, limit=500)]


@router.post("/deliveries", status_code=status.HTTP_201_CREATED)
async def create_delivery(payload: DeliveryCreate, db: AsyncSession = Depends(get_db), _: Profile = Depends(logistics_guard)):
    data = _coerce_uuids(payload.model_dump(exclude_unset=True))
    data["delivery_code"] = generate_ref("DLV")
    return serialize(await crud.create_item(db, Delivery, data))


@router.patch("/deliveries/{item_id}")
@router.put("/deliveries/{item_id}")
async def update_delivery(item_id: str, payload: DeliveryUpdate, db: AsyncSession = Depends(get_db), _: Profile = Depends(require_roles(UserRole.LOGISTICS, UserRole.DRIVER))):
    obj = await crud.get_item(db, Delivery, item_id)
    if not obj:
        raise HTTPException(status_code=404, detail="Delivery not found")
    return serialize(await crud.update_item(db, obj, payload.model_dump(exclude_unset=True)))
