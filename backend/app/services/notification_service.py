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
from app.models.profile import Profile, UserRole
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
        notification.status = "sent"
        notification.sent_at = now_iso()

    await db.flush()
    await db.refresh(notification)
    return notification


async def _notify_user(db: AsyncSession, user_id: str, email: str, title: str, message: str) -> None:
    """Send both in-app and email notification to a single user."""
    await create_notification(db, user_id=user_id, title=title, message=message, type="shipment")
    await create_notification(db, user_id=user_id, title=title, message=message, channel="email", type="shipment", email_to=email)


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


async def notify_shipment_created(
    db: AsyncSession,
    *,
    customer_id: str | None,
    tracking_id: str,
    email_to: str | None = None,
) -> None:
    """Notify customer + all logistics + admins when a new shipment is created."""
    title = f"New Shipment Created: {tracking_id}"
    customer_msg = f"Your shipment has been created. Your tracking ID is {tracking_id}. You can use this to track your shipment."
    staff_msg = f"A new shipment {tracking_id} has been created and is awaiting dispatch."

    # Notify customer (in-app + email)
    if customer_id:
        await create_notification(db, user_id=customer_id, title=title, message=customer_msg, type="shipment", related_id=tracking_id, related_type="shipment")
        if email_to:
            await create_notification(db, user_id=customer_id, title=title, message=customer_msg, channel="email", type="shipment", related_id=tracking_id, related_type="shipment", email_to=email_to)

    # Notify all logistics + admin users (in-app + email)
    result = await db.execute(
        select(Profile).where(Profile.role.in_([UserRole.LOGISTICS, UserRole.ADMIN])).where(Profile.status == "active")
    )
    for user in result.scalars().all():
        await create_notification(db, user_id=str(user.id), title=title, message=staff_msg, type="shipment", related_id=tracking_id, related_type="shipment")
        if user.email:
            await create_notification(db, user_id=str(user.id), title=title, message=staff_msg, channel="email", type="shipment", related_id=tracking_id, related_type="shipment", email_to=user.email)


async def notify_shipment_update(
    db: AsyncSession,
    *,
    customer_id: Optional[str],
    tracking_id: str,
    status: str,
    email_to: Optional[str] = None,
) -> None:
    """Fan out shipment status updates. On Delivered, notify customer + logistics + admins."""
    title = f"Shipment {tracking_id}: {status}"

    # Always notify the customer (in-app + email)
    if customer_id:
        customer_msg = f"Your shipment {tracking_id} has been delivered successfully."
        await create_notification(db, user_id=customer_id, title=title, message=customer_msg, type="shipment", related_id=tracking_id, related_type="shipment")
        if email_to:
            await create_notification(db, user_id=customer_id, title=title, message=customer_msg, channel="email", type="shipment", related_id=tracking_id, related_type="shipment", email_to=email_to)

    # On Delivered — also notify all logistics users and admins
    if status == "Delivered":
        staff_msg = f"Shipment {tracking_id} has been marked as Delivered."
        result = await db.execute(
            select(Profile).where(Profile.role.in_([UserRole.LOGISTICS, UserRole.ADMIN])).where(Profile.status == "active")
        )
        staff_users = result.scalars().all()
        for user in staff_users:
            await create_notification(db, user_id=str(user.id), title=title, message=staff_msg, type="shipment", related_id=tracking_id, related_type="shipment")
            if user.email:
                await create_notification(db, user_id=str(user.id), title=title, message=staff_msg, channel="email", type="shipment", related_id=tracking_id, related_type="shipment", email_to=user.email)
