"""
Support models — tickets & ticket messages.
"""

from sqlalchemy import Column, String, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID

from app.core.database import Base
from app.models.base import pk_column, created_column, updated_column


class SupportTicket(Base):
    __tablename__ = "support_tickets"

    id = pk_column()
    ticket_ref = Column(String(40), unique=True, nullable=False, index=True)
    customer_id = Column(UUID(as_uuid=True), ForeignKey("profiles.id"), nullable=True, index=True)
    subject = Column(String(255), nullable=False)
    category = Column(String(60), nullable=True)  # billing|tracking|customs|general
    priority = Column(String(20), nullable=False, default="medium")  # low|medium|high|urgent
    status = Column(String(20), nullable=False, default="open", index=True)  # open|in_progress|resolved|closed
    description = Column(Text, nullable=True)
    assigned_to = Column(UUID(as_uuid=True), ForeignKey("profiles.id"), nullable=True)
    created_at = created_column()
    updated_at = updated_column()


class TicketMessage(Base):
    __tablename__ = "ticket_messages"

    id = pk_column()
    ticket_id = Column(UUID(as_uuid=True), ForeignKey("support_tickets.id", ondelete="CASCADE"), nullable=False, index=True)
    sender_id = Column(UUID(as_uuid=True), ForeignKey("profiles.id"), nullable=True)
    body = Column(Text, nullable=False)
    created_at = created_column()
