"""
Logistics models — containers, routes, vehicles, deliveries.
"""

from sqlalchemy import Column, String, Integer, Float, ForeignKey
from sqlalchemy.dialects.postgresql import UUID

from app.core.database import Base
from app.models.base import pk_column, created_column, updated_column


class Container(Base):
    __tablename__ = "containers"

    id = pk_column()
    container_no = Column(String(40), unique=True, nullable=False, index=True)
    type = Column(String(40), nullable=False)
    status = Column(String(30), nullable=False, default="Available")  # Available|In Use|Maintenance
    location = Column(String(255), nullable=True)
    shipment_id = Column(UUID(as_uuid=True), ForeignKey("shipments.id"), nullable=True)
    capacity = Column(String(40), nullable=True)
    created_at = created_column()


class Route(Base):
    __tablename__ = "routes"

    id = pk_column()
    route_code = Column(String(40), unique=True, nullable=False, index=True)
    origin = Column(String(255), nullable=False)
    destination = Column(String(255), nullable=False)
    distance = Column(String(40), nullable=True)
    duration = Column(String(40), nullable=True)
    status = Column(String(30), nullable=False, default="Active")
    driver_id = Column(UUID(as_uuid=True), ForeignKey("profiles.id"), nullable=True)
    vehicle_id = Column(UUID(as_uuid=True), ForeignKey("vehicles.id"), nullable=True)
    shipment_id = Column(UUID(as_uuid=True), ForeignKey("shipments.id"), nullable=True)
    created_at = created_column()


class Vehicle(Base):
    __tablename__ = "vehicles"

    id = pk_column()
    vehicle_no = Column(String(40), unique=True, nullable=False, index=True)
    type = Column(String(40), nullable=False)
    status = Column(String(30), nullable=False, default="Available")
    driver_id = Column(UUID(as_uuid=True), ForeignKey("profiles.id"), nullable=True)
    location = Column(String(255), nullable=True)
    capacity = Column(String(40), nullable=True)
    shipment_id = Column(UUID(as_uuid=True), ForeignKey("shipments.id"), nullable=True)
    created_at = created_column()


class Delivery(Base):
    __tablename__ = "deliveries"

    id = pk_column()
    delivery_code = Column(String(40), unique=True, nullable=False, index=True)
    shipment_id = Column(UUID(as_uuid=True), ForeignKey("shipments.id"), nullable=True, index=True)
    driver_id = Column(UUID(as_uuid=True), ForeignKey("profiles.id"), nullable=True, index=True)
    route_id = Column(UUID(as_uuid=True), ForeignKey("routes.id"), nullable=True)
    vehicle_id = Column(UUID(as_uuid=True), ForeignKey("vehicles.id"), nullable=True)
    status = Column(String(30), nullable=False, default="Pending")  # Pending|Picked Up|In Transit|Delivered|Failed
    location = Column(String(255), nullable=True)
    progress = Column(Integer, default=0)
    eta = Column(String(60), nullable=True)
    lat = Column(Float, nullable=True)
    lng = Column(Float, nullable=True)
    proof_url = Column(String(1000), nullable=True)
    created_at = created_column()
    updated_at = updated_column()
