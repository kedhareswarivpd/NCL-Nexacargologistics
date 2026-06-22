"""
Insurance model — cargo insurance policies / requests.
"""

from sqlalchemy import Column, String, Float, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID

from app.core.database import Base
from app.models.base import pk_column, created_column, updated_column


class InsurancePolicy(Base):
    __tablename__ = "insurance_policies"

    id = pk_column()
    policy_ref = Column(String(40), unique=True, nullable=False, index=True)
    shipment_id = Column(UUID(as_uuid=True), ForeignKey("shipments.id"), nullable=True)
    customer_id = Column(UUID(as_uuid=True), ForeignKey("profiles.id"), nullable=True, index=True)
    coverage_amount = Column(Float, nullable=True)
    premium = Column(Float, nullable=True)
    currency = Column(String(10), nullable=False, default="USD")
    status = Column(String(30), nullable=False, default="requested")  # requested|approved|active|rejected|expired
    valid_from = Column(String(40), nullable=True)
    valid_until = Column(String(40), nullable=True)
    notes = Column(Text, nullable=True)
    created_at = created_column()
    updated_at = updated_column()
