"""
Generic async CRUD helpers used by the domain routers.

Keeps routers thin and consistent. All functions operate on SQLAlchemy model
classes and return model instances (serialize at the edge with utils.serialize).
"""

import uuid
from typing import Optional, Type, Any

from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession


def _coerce_id(value: Any):
    if isinstance(value, uuid.UUID):
        return value
    try:
        return uuid.UUID(str(value))
    except (ValueError, AttributeError, TypeError):
        return value


async def list_items(
    db: AsyncSession,
    model: Type,
    *,
    filters: Optional[dict] = None,
    skip: int = 0,
    limit: int = 100,
    order_desc: bool = True,
) -> list:
    query = select(model)
    if filters:
        for field, value in filters.items():
            if value is None:
                continue
            col = getattr(model, field)
            if field.endswith("_id") or field == "id":
                value = _coerce_id(value)
            query = query.where(col == value)
    if hasattr(model, "created_at"):
        order_col = model.created_at
        query = query.order_by(order_col.desc() if order_desc else order_col.asc())
    query = query.offset(skip).limit(limit)
    result = await db.execute(query)
    return list(result.scalars().all())


async def get_item(db: AsyncSession, model: Type, item_id: Any):
    result = await db.execute(select(model).where(model.id == _coerce_id(item_id)))
    return result.scalar_one_or_none()


async def get_by(db: AsyncSession, model: Type, **kwargs):
    query = select(model)
    for field, value in kwargs.items():
        if field.endswith("_id") or field == "id":
            value = _coerce_id(value)
        query = query.where(getattr(model, field) == value)
    result = await db.execute(query)
    return result.scalar_one_or_none()


async def create_item(db: AsyncSession, model: Type, data: dict):
    obj = model(**data)
    db.add(obj)
    await db.flush()
    await db.refresh(obj)
    return obj


async def update_item(db: AsyncSession, obj, data: dict):
    for field, value in data.items():
        if value is not None and hasattr(obj, field):
            setattr(obj, field, value)
    await db.flush()
    await db.refresh(obj)
    return obj


async def delete_item(db: AsyncSession, obj) -> None:
    await db.delete(obj)
    await db.flush()


async def count(db: AsyncSession, model: Type, filters: Optional[dict] = None) -> int:
    query = select(func.count()).select_from(model)
    if filters:
        for field, value in filters.items():
            if value is None:
                continue
            col = getattr(model, field)
            if field.endswith("_id") or field == "id":
                value = _coerce_id(value)
            query = query.where(col == value)
    result = await db.execute(query)
    return int(result.scalar() or 0)
