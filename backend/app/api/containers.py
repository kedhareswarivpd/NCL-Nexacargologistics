"""
Containers API — standalone container resource (/containers) with the
shipments carried by each container. Shares the Container model with the
logistics dashboard.
"""

import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import get_logistics_user
from app.middleware.auth import get_current_user
from app.models.profile import Profile
from app.models.logistics import Container
from app.models.shipment import Shipment
from app.schemas.payloads import ContainerCreate, ContainerUpdate
from app.services import crud
from app.utils.helpers import serialize

router = APIRouter(prefix="/containers", tags=["containers"])


@router.get("")
async def list_containers(
    status_filter: str | None = None,
    skip: int = 0,
    limit: int = 500,
    db: AsyncSession = Depends(get_db),
    _: Profile = Depends(get_current_user),
):
    query = select(Container)
    if status_filter:
        query = query.where(Container.status == status_filter)
    query = query.order_by(Container.created_at.desc()).offset(skip).limit(limit)
    result = await db.execute(query)
    return [serialize(c) for c in result.scalars().all()]


@router.post("", status_code=status.HTTP_201_CREATED)
async def create_container(
    payload: ContainerCreate,
    db: AsyncSession = Depends(get_db),
    _: Profile = Depends(get_logistics_user),
):
    data = payload.model_dump(exclude_unset=True)
    if data.get("shipment_id"):
        data["shipment_id"] = uuid.UUID(data["shipment_id"])
    return serialize(await crud.create_item(db, Container, data))


@router.get("/{container_id}")
async def get_container(
    container_id: str,
    db: AsyncSession = Depends(get_db),
    _: Profile = Depends(get_current_user),
):
    c = await crud.get_item(db, Container, container_id)
    if not c:
        raise HTTPException(status_code=404, detail="Container not found")
    return serialize(c)


@router.put("/{container_id}")
@router.patch("/{container_id}")
async def update_container(
    container_id: str,
    payload: ContainerUpdate,
    db: AsyncSession = Depends(get_db),
    _: Profile = Depends(get_logistics_user),
):
    c = await crud.get_item(db, Container, container_id)
    if not c:
        raise HTTPException(status_code=404, detail="Container not found")
    data = payload.model_dump(exclude_unset=True)
    if data.get("shipment_id"):
        data["shipment_id"] = uuid.UUID(data["shipment_id"])
    return serialize(await crud.update_item(db, c, data))


@router.delete("/{container_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_container(
    container_id: str,
    db: AsyncSession = Depends(get_db),
    _: Profile = Depends(get_logistics_user),
):
    c = await crud.get_item(db, Container, container_id)
    if c:
        await crud.delete_item(db, c)
    return None


@router.get("/{container_id}/shipments")
async def container_shipments(
    container_id: str,
    db: AsyncSession = Depends(get_db),
    _: Profile = Depends(get_current_user),
):
    """Shipments assigned to this container (Container.shipment_id link)."""
    result = await db.execute(
        select(Shipment).join(Container, Container.shipment_id == Shipment.id)
        .where(Container.id == uuid.UUID(container_id))
    )
    return [serialize(s) for s in result.scalars().all()]
