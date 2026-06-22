"""Services package."""

from app.services.email_service import send_email
from app.services.notification_service import (
    create_notification,
    get_user_notifications,
    mark_notification_read,
    notify_shipment_update,
)

__all__ = [
    "send_email",
    "create_notification",
    "get_user_notifications",
    "mark_notification_read",
    "notify_shipment_update",
]
