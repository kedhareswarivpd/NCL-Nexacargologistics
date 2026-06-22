"""
Customs model — clearance entries.
"""

from sqlalchemy import Column, String, Float, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID

from app.core.database import Base
from app.models.base import pk_column, created_column, updated_column


class CustomsEntry(Base):
    __tablename__ = "customs_entries"

    id = pk_column()
    entry_ref = Column(String(40), unique=True, nullable=False, index=True)
    shipment_id = Column(UUID(as_uuid=True), ForeignKey("shipments.id"), nullable=True, index=True)
    direction = Column(String(10), nullable=False, default="import")  # import|export
    status = Column(String(30), nullable=False, default="pending", index=True)  # pending|under_review|cleared|held|rejected
    hs_code = Column(String(40), nullable=True)
    declared_value = Column(Float, nullable=True)
    duty_amount = Column(Float, nullable=True)
    currency = Column(String(10), nullable=False, default="USD")
    reviewed_by = Column(UUID(as_uuid=True), ForeignKey("profiles.id"), nullable=True)
    notes = Column(Text, nullable=True)
    created_at = created_column()
    updated_at = updated_column()
