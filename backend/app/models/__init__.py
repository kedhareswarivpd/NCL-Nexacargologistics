"""
Models package — import all models so SQLAlchemy metadata is fully populated.
"""

from app.models.profile import Profile, UserRole
from app.models.branch import Branch
from app.models.shipment import (
    Quote,
    Shipment,
    ShipmentStatus,
    ShipmentStatusHistory,
    Document,
    TransportMode,
)
from app.models.logistics import Container, Route, Vehicle, Delivery
from app.models.warehouse import Warehouse, InventoryItem, WarehouseTask
from app.models.finance import Invoice, InvoiceStatus, Payment
from app.models.customs import CustomsEntry
from app.models.insurance import InsurancePolicy
from app.models.support import SupportTicket, TicketMessage
from app.models.notification import Notification, AuditLog
from app.models.access import Role
from app.models.expense import Expense
from app.models.driver_task import DriverTask
from app.models.review import Review

__all__ = [
    "Profile",
    "UserRole",
    "Branch",
    "Quote",
    "Shipment",
    "ShipmentStatus",
    "ShipmentStatusHistory",
    "Document",
    "TransportMode",
    "Container",
    "Route",
    "Vehicle",
    "Delivery",
    "Warehouse",
    "InventoryItem",
    "WarehouseTask",
    "Invoice",
    "InvoiceStatus",
    "Payment",
    "CustomsEntry",
    "InsurancePolicy",
    "SupportTicket",
    "TicketMessage",
    "Notification",
    "AuditLog",
    "Role",
    "Expense",
    "DriverTask",
    "Review",
]
