"""
Finance models — invoices & payments.
"""

from sqlalchemy import Column, String, Float, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID

from app.core.database import Base
from app.models.base import pk_column, created_column, updated_column


class InvoiceStatus:
    PENDING = "Pending"
    PAID = "Paid"
    OVERDUE = "Overdue"
    CANCELLED = "Cancelled"


class Invoice(Base):
    __tablename__ = "invoices"

    id = pk_column()
    invoice_no = Column(String(40), unique=True, nullable=False, index=True)
    customer_id = Column(UUID(as_uuid=True), ForeignKey("profiles.id"), nullable=True, index=True)
    shipment_id = Column(UUID(as_uuid=True), ForeignKey("shipments.id"), nullable=True)
    amount = Column(Float, nullable=False, default=0)
    tax = Column(Float, nullable=False, default=0)
    total = Column(Float, nullable=False, default=0)
    currency = Column(String(10), nullable=False, default="USD")
    status = Column(String(20), nullable=False, default=InvoiceStatus.PENDING, index=True)
    issue_date = Column(String(40), nullable=True)
    due_date = Column(String(40), nullable=True)
    description = Column(Text, nullable=True)
    created_at = created_column()
    updated_at = updated_column()


class Payment(Base):
    __tablename__ = "payments"

    id = pk_column()
    payment_ref = Column(String(40), unique=True, nullable=False, index=True)
    invoice_id = Column(UUID(as_uuid=True), ForeignKey("invoices.id"), nullable=True, index=True)
    customer_id = Column(UUID(as_uuid=True), ForeignKey("profiles.id"), nullable=True)
    amount = Column(Float, nullable=False, default=0)
    currency = Column(String(10), nullable=False, default="USD")
    method = Column(String(40), nullable=True)  # card|bank_transfer|wallet
    status = Column(String(20), nullable=False, default="pending")  # pending|completed|failed|refunded
    paid_at = Column(String(40), nullable=True)
    created_at = created_column()
