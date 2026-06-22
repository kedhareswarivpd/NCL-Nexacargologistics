"""
Notification & audit-log models.
"""

from sqlalchemy import Column, String, Boolean, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID

from app.core.database import Base
from app.models.base import pk_column, created_column


class Notification(Base):
    __tablename__ = "notifications"

    id = pk_column()
    user_id = Column(UUID(as_uuid=True), ForeignKey("profiles.id"), nullable=True, index=True)
    channel = Column(String(20), nullable=False, default="in_app")  # in_app|sms|email
    title = Column(String(255), nullable=True)
    message = Column(Text, nullable=False)
    type = Column(String(40), nullable=True)  # shipment|invoice|ticket|system
    related_id = Column(String(80), nullable=True)
    related_type = Column(String(40), nullable=True)
    read = Column(Boolean, default=False)
    status = Column(String(20), nullable=False, default="queued")  # queued|sent|failed|read
    sent_at = Column(String(40), nullable=True)
    created_at = created_column()


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = pk_column()
    actor_id = Column(UUID(as_uuid=True), nullable=True, index=True)
    actor_email = Column(String(255), nullable=True)
    action = Column(String(120), nullable=False)
    entity_type = Column(String(60), nullable=True)
    entity_id = Column(String(80), nullable=True)
    detail = Column(Text, nullable=True)
    created_at = created_column()
