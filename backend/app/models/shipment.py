"""
Quote, Shipment, status history & document models (customer + logistics core).
"""

from sqlalchemy import Column, String, Float, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID

from app.core.database import Base
from app.models.base import pk_column, created_column, updated_column


class ShipmentStatus:
    AWAITING_DISPATCH = "Awaiting Dispatch"
    IN_TRANSIT = "In Transit"
    CUSTOMS_HOLD = "Customs Hold"
    OUT_FOR_DELIVERY = "Out for Delivery"
    DELIVERED = "Delivered"
    DELAYED = "Delayed"
    CANCELLED = "Cancelled"


class TransportMode:
    AIR = "air"
    SEA = "sea"
    ROAD = "road"


class Quote(Base):
    __tablename__ = "quotes"

    id = pk_column()
    quote_ref = Column(String(40), unique=True, nullable=False, index=True)
    customer_id = Column(UUID(as_uuid=True), ForeignKey("profiles.id"), nullable=True)
    origin = Column(String(255), nullable=False)
    destination = Column(String(255), nullable=False)
    mode = Column(String(20), nullable=False, default=TransportMode.SEA)
    cargo_type = Column(String(120), nullable=True)
    weight = Column(Float, nullable=True)
    volume = Column(Float, nullable=True)
    incoterm = Column(String(20), nullable=True)
    amount = Column(Float, nullable=True)
    currency = Column(String(10), nullable=False, default="USD")
    status = Column(String(30), nullable=False, default="pending")  # pending|quoted|accepted|rejected|expired
    valid_until = Column(String(40), nullable=True)
    contact_name = Column(String(255), nullable=True)
    contact_email = Column(String(255), nullable=True)
    contact_phone = Column(String(50), nullable=True)
    notes = Column(Text, nullable=True)
    created_at = created_column()
    updated_at = updated_column()


class Shipment(Base):
    __tablename__ = "shipments"

    id = pk_column()
    tracking_id = Column(String(40), unique=True, nullable=False, index=True)
    customer_id = Column(UUID(as_uuid=True), ForeignKey("profiles.id"), nullable=True, index=True)
    quote_id = Column(UUID(as_uuid=True), ForeignKey("quotes.id"), nullable=True)
    origin = Column(String(255), nullable=False)
    destination = Column(String(255), nullable=False)
    mode = Column(String(20), nullable=False, default=TransportMode.SEA)
    cargo_type = Column(String(120), nullable=True)
    weight = Column(String(60), nullable=True)
    volume = Column(String(60), nullable=True)
    incoterm = Column(String(20), nullable=True)
    status = Column(String(40), nullable=False, default=ShipmentStatus.AWAITING_DISPATCH, index=True)
    eta = Column(String(60), nullable=True)
    customer_name = Column(String(255), nullable=True)
    customer_email = Column(String(255), nullable=True)
    customer_phone = Column(String(50), nullable=True)
    value_amount = Column(Float, nullable=True)
    currency = Column(String(10), nullable=False, default="USD")
    lat = Column(Float, nullable=True)
    lng = Column(Float, nullable=True)
    description = Column(Text, nullable=True)
    created_at = created_column()
    updated_at = updated_column()


class ShipmentStatusHistory(Base):
    __tablename__ = "shipment_status_history"

    id = pk_column()
    shipment_id = Column(UUID(as_uuid=True), ForeignKey("shipments.id", ondelete="CASCADE"), nullable=False, index=True)
    status = Column(String(40), nullable=False)
    note = Column(String(500), nullable=True)
    location = Column(String(255), nullable=True)
    lat = Column(Float, nullable=True)
    lng = Column(Float, nullable=True)
    changed_by = Column(UUID(as_uuid=True), nullable=True)
    changed_at = created_column()


class Document(Base):
    __tablename__ = "documents"

    id = pk_column()
    shipment_id = Column(UUID(as_uuid=True), ForeignKey("shipments.id", ondelete="CASCADE"), nullable=True, index=True)
    doc_type = Column(String(60), nullable=False, default="other")  # invoice|bol|packing_list|customs|proof|other
    file_name = Column(String(255), nullable=False)
    file_url = Column(String(1000), nullable=True)
    uploaded_by = Column(UUID(as_uuid=True), nullable=True)
    created_at = created_column()
