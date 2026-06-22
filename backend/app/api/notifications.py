"""
Notifications API — in-app notifications for the current user (+ admin broadcast).
"""

import asyncio
import uuid

from fastapi import APIRouter, Depends, HTTPException, WebSocket, WebSocketDisconnect, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db, async_session_factory
from app.core.dependencies import get_admin_user
from app.core.security import verify_access_token, TokenError
from app.middleware.auth import get_current_user
from app.models.profile import Profile
from app.models.notification import Notification
from app.schemas.payloads import NotificationCreate
from app.services import crud
from app.services.notification_service import (
    create_notification,
    get_user_notifications,
    mark_notification_read,
)
from app.utils.helpers import serialize

router = APIRouter(prefix="/notifications", tags=["notifications"])


@router.get("")
async def my_notifications(
    skip: int = 0,
    limit: int = 50,
    db: AsyncSession = Depends(get_db),
    current_user: Profile = Depends(get_current_user),
):
    items = await get_user_notifications(db, str(current_user.id), skip, limit)
    return [serialize(n) for n in items]


@router.post("/{notification_id}/read")
@router.patch("/{notification_id}/read")
async def read_notification(
    notification_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: Profile = Depends(get_current_user),
):
    n = await mark_notification_read(db, notification_id, str(current_user.id))
    if not n:
        raise HTTPException(status_code=404, detail="Notification not found")
    return serialize(n)


@router.post("", status_code=status.HTTP_201_CREATED)
async def send_notification(
    payload: NotificationCreate,
    db: AsyncSession = Depends(get_db),
    _: Profile = Depends(get_admin_user),
):
    n = await create_notification(
        db,
        user_id=payload.user_id,
        message=payload.message,
        title=payload.title,
        channel=payload.channel,
        type=payload.type,
        related_id=payload.related_id,
        related_type=payload.related_type,
    )
    return serialize(n)


async def _owned_notification(db: AsyncSession, notification_id: str, user_id) -> Notification:
    result = await db.execute(
        select(Notification).where(
            Notification.id == uuid.UUID(notification_id),
            Notification.user_id == user_id,
        )
    )
    n = result.scalar_one_or_none()
    if not n:
        raise HTTPException(status_code=404, detail="Notification not found")
    return n


@router.get("/{notification_id}")
async def get_notification(
    notification_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: Profile = Depends(get_current_user),
):
    return serialize(await _owned_notification(db, notification_id, current_user.id))


@router.delete("/{notification_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_notification(
    notification_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: Profile = Depends(get_current_user),
):
    n = await _owned_notification(db, notification_id, current_user.id)
    await crud.delete_item(db, n)
    return None


@router.websocket("/ws")
async def notifications_ws(websocket: WebSocket):
    """Stream the user's unread-notification count. Auth via ?token=<access_token>."""
    await websocket.accept()
    token = websocket.query_params.get("token")
    try:
        claims = await verify_access_token(token) if token else None
    except TokenError:
        claims = None
    if not claims or not claims.get("id"):
        await websocket.send_json({"error": "Invalid token"})
        await websocket.close(code=1008)
        return

    user_id = uuid.UUID(claims["id"])
    try:
        while True:
            async with async_session_factory() as db:
                rows = await db.execute(
                    select(Notification).where(
                        Notification.user_id == user_id,
                        Notification.read.is_(False),
                    ).order_by(Notification.created_at.desc()).limit(20)
                )
                items = list(rows.scalars().all())
            await websocket.send_json({
                "unread": len(items),
                "latest": [serialize(n) for n in items],
            })
            await asyncio.sleep(10)
    except WebSocketDisconnect:
        return
