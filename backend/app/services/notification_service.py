"""
Notification service — in-app notifications plus email/SMS dispatch stubs.

The advanced features (SMS + Email) from the SRS are modelled here as a single
notification queue; email/SMS providers are stubbed and logged.
"""

import uuid
from typing import Optional

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.models.notification import Notification
from app.services.email_service import send_email
from app.utils.helpers import now_iso


async def create_notification(
    db: AsyncSession,
    *,
    user_id: Optional[str],
    message: str,
    title: Optional[str] = None,
    channel: str = "in_app",
    type: Optional[str] = None,
    related_id: Optional[str] = None,
    related_type: Optional[str] = None,
    email_to: Optional[str] = None,
) -> Notification:
    notification = Notification(
        user_id=uuid.UUID(user_id) if user_id else None,
        channel=channel,
        title=title,
        message=message,
        type=type,
        related_id=related_id,
        related_type=related_type,
        status="sent" if channel == "in_app" else "queued",
    )
    db.add(notification)
    await db.flush()

    if channel == "email" and email_to:
        await send_email(email_to, title or "NexaCargo Notification", message)
        notification.status = "sent"
        notification.sent_at = now_iso()
    elif channel == "sms":
        # SMS provider stub — log only.
        notification.status = "sent"
        notification.sent_at = now_iso()

    await db.flush()
    await db.refresh(notification)
    return notification


async def get_user_notifications(db: AsyncSession, user_id: str, skip: int = 0, limit: int = 50) -> list[Notification]:
    result = await db.execute(
        select(Notification)
        .where(Notification.user_id == uuid.UUID(user_id))
        .order_by(Notification.created_at.desc())
        .offset(skip)
        .limit(limit)
    )
    return list(result.scalars().all())


async def mark_notification_read(db: AsyncSession, notification_id: str, user_id: str) -> Optional[Notification]:
    result = await db.execute(
        select(Notification).where(
            Notification.id == uuid.UUID(notification_id),
            Notification.user_id == uuid.UUID(user_id),
        )
    )
    notification = result.scalar_one_or_none()
    if not notification:
        return None
    notification.read = True
    await db.flush()
    await db.refresh(notification)
    return notification


async def notify_shipment_update(
    db: AsyncSession,
    *,
    customer_id: Optional[str],
    tracking_id: str,
    status: str,
    email_to: Optional[str] = None,
) -> None:
    """Fan out shipment status updates (in-app + optional email)."""
    title = f"Shipment {tracking_id}: {status}"
    message = f"Your shipment {tracking_id} status is now \"{status}\"."
    await create_notification(
        db,
        user_id=customer_id,
        title=title,
        message=message,
        type="shipment",
        related_id=tracking_id,
        related_type="shipment",
    )
    if email_to:
        await create_notification(
            db,
            user_id=customer_id,
            title=title,
            message=message,
            channel="email",
            type="shipment",
            related_id=tracking_id,
            related_type="shipment",
            email_to=email_to,
        )
