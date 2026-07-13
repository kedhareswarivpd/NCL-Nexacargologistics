"""
Request payload schemas (Pydantic). Responses are returned as serialized dicts
via app.utils.helpers.serialize, so only inputs need explicit models.
"""

from typing import Optional
from pydantic import BaseModel, EmailStr, Field


# ----------------------------- Auth -----------------------------
class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class RegisterRequest(BaseModel):
    name: str = Field(min_length=1)
    email: EmailStr
    password: str = Field(min_length=6)
    phone: Optional[str] = None
    company: Optional[str] = None


# ----------------------------- Profile / users -----------------------------
class ProfileUpdate(BaseModel):
    name: Optional[str] = None
    company: Optional[str] = None
    phone: Optional[str] = None
    department: Optional[str] = None


class AdminProfileUpdate(ProfileUpdate):
    role: Optional[str] = None
    status: Optional[str] = None
    branch_id: Optional[str] = None


class StaffCreate(BaseModel):
    """Admin creates a staff member (also provisions a Supabase auth user)."""
    name: str
    email: EmailStr
    password: str = Field(min_length=6)
    role: str = "logistics"
    department: Optional[str] = None
    phone: Optional[str] = None
    branch_id: Optional[str] = None


# ----------------------------- Quotes -----------------------------
class QuoteCreate(BaseModel):
    origin: str = Field(min_length=2, max_length=255)
    destination: str = Field(min_length=2, max_length=255)
    mode: str = Field(default="sea", pattern="^(air|sea|road)$")
    cargo_type: Optional[str] = None
    weight: Optional[float] = Field(default=None, gt=0, le=10000)
    volume: Optional[float] = Field(default=None, gt=0)
    incoterm: Optional[str] = None
    contact_name: Optional[str] = None
    contact_email: Optional[str] = None
    contact_phone: Optional[str] = None
    notes: Optional[str] = None


class QuoteUpdate(BaseModel):
    amount: Optional[float] = None
    currency: Optional[str] = None
    status: Optional[str] = None
    valid_until: Optional[str] = None
    notes: Optional[str] = None


# ----------------------------- Shipments -----------------------------
class ShipmentCreate(BaseModel):
    origin: str
    destination: str
    mode: str = "sea"
    cargo_type: Optional[str] = None
    weight: Optional[str] = None
    volume: Optional[str] = None
    incoterm: Optional[str] = None
    eta: Optional[str] = None
    value_amount: Optional[float] = None
    currency: Optional[str] = "USD"
    customer_id: Optional[str] = None
    customer_name: Optional[str] = None
    customer_email: Optional[str] = None
    customer_phone: Optional[str] = None
    quote_id: Optional[str] = None
    description: Optional[str] = None


class ShipmentUpdate(BaseModel):
    origin: Optional[str] = None
    destination: Optional[str] = None
    mode: Optional[str] = None
    cargo_type: Optional[str] = None
    weight: Optional[str] = None
    status: Optional[str] = None
    eta: Optional[str] = None
    lat: Optional[float] = None
    lng: Optional[float] = None
    description: Optional[str] = None


class StatusUpdate(BaseModel):
    status: str
    note: Optional[str] = None
    location: Optional[str] = None
    lat: Optional[float] = None
    lng: Optional[float] = None


class DocumentCreate(BaseModel):
    shipment_id: Optional[str] = None
    doc_type: str = "other"
    file_name: str
    file_url: Optional[str] = None


# ----------------------------- Logistics -----------------------------
class ContainerCreate(BaseModel):
    container_no: str
    type: str
    status: str = "Available"
    location: Optional[str] = None
    capacity: Optional[str] = None
    shipment_id: Optional[str] = None


class ContainerUpdate(BaseModel):
    type: Optional[str] = None
    status: Optional[str] = None
    location: Optional[str] = None
    capacity: Optional[str] = None
    shipment_id: Optional[str] = None


class RouteCreate(BaseModel):
    route_code: str
    origin: str
    destination: str
    distance: Optional[str] = None
    duration: Optional[str] = None
    status: str = "Active"
    driver_id: Optional[str] = None
    vehicle_id: Optional[str] = None
    shipment_id: Optional[str] = None


class RouteUpdate(BaseModel):
    origin: Optional[str] = None
    destination: Optional[str] = None
    distance: Optional[str] = None
    duration: Optional[str] = None
    status: Optional[str] = None
    driver_id: Optional[str] = None
    vehicle_id: Optional[str] = None
    shipment_id: Optional[str] = None


class VehicleCreate(BaseModel):
    vehicle_no: str
    type: str
    status: str = "Available"
    driver_id: Optional[str] = None
    location: Optional[str] = None
    capacity: Optional[str] = None
    shipment_id: Optional[str] = None


class VehicleUpdate(BaseModel):
    type: Optional[str] = None
    status: Optional[str] = None
    driver_id: Optional[str] = None
    location: Optional[str] = None
    capacity: Optional[str] = None
    shipment_id: Optional[str] = None


class DeliveryCreate(BaseModel):
    shipment_id: Optional[str] = None
    driver_id: Optional[str] = None
    route_id: Optional[str] = None
    vehicle_id: Optional[str] = None
    status: str = "Pending"
    location: Optional[str] = None
    eta: Optional[str] = None


class DeliveryUpdate(BaseModel):
    status: Optional[str] = None
    location: Optional[str] = None
    progress: Optional[int] = None
    eta: Optional[str] = None
    lat: Optional[float] = None
    lng: Optional[float] = None
    proof_url: Optional[str] = None


# ----------------------------- Warehouse -----------------------------
class WarehouseCreate(BaseModel):
    name: str
    code: Optional[str] = None
    location: Optional[str] = None
    manager_id: Optional[str] = None
    capacity: Optional[int] = None


class WarehouseUpdate(BaseModel):
    name: Optional[str] = None
    code: Optional[str] = None
    location: Optional[str] = None
    manager_id: Optional[str] = None
    capacity: Optional[int] = None
    used_capacity: Optional[int] = None


class InventoryCreate(BaseModel):
    warehouse_id: str
    sku: str
    name: str
    category: Optional[str] = None
    zone: Optional[str] = None
    qty: int = 0
    reorder_at: Optional[int] = None
    shipment_id: Optional[str] = None


class InventoryUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    zone: Optional[str] = None
    qty: Optional[int] = None
    reorder_at: Optional[int] = None
    status: Optional[str] = None


class WarehouseTaskCreate(BaseModel):
    warehouse_id: Optional[str] = None
    task_type: str = "inbound"
    shipment_id: Optional[str] = None
    reference: Optional[str] = None
    description: Optional[str] = None
    assigned_to: Optional[str] = None


class WarehouseTaskUpdate(BaseModel):
    status: Optional[str] = None
    assigned_to: Optional[str] = None
    description: Optional[str] = None


# ----------------------------- Finance -----------------------------
class InvoiceCreate(BaseModel):
    customer_id: Optional[str] = None
    shipment_id: Optional[str] = None
    amount: float
    tax: float = 0
    currency: str = "USD"
    due_date: Optional[str] = None
    description: Optional[str] = None


class InvoiceUpdate(BaseModel):
    status: Optional[str] = None
    amount: Optional[float] = None
    tax: Optional[float] = None
    due_date: Optional[str] = None
    description: Optional[str] = None


class PaymentCreate(BaseModel):
    invoice_id: str
    amount: float
    currency: str = "USD"
    method: Optional[str] = None


# ----------------------------- Customs -----------------------------
class CustomsCreate(BaseModel):
    shipment_id: Optional[str] = None
    direction: str = "import"
    hs_code: Optional[str] = None
    declared_value: Optional[float] = None
    duty_amount: Optional[float] = None
    currency: str = "USD"
    notes: Optional[str] = None


class CustomsUpdate(BaseModel):
    status: Optional[str] = None
    hs_code: Optional[str] = None
    declared_value: Optional[float] = None
    duty_amount: Optional[float] = None
    notes: Optional[str] = None


# ----------------------------- Insurance -----------------------------
class InsuranceCreate(BaseModel):
    shipment_id: Optional[str] = None
    coverage_amount: Optional[float] = None
    currency: str = "USD"
    notes: Optional[str] = None


class InsuranceUpdate(BaseModel):
    status: Optional[str] = None
    coverage_amount: Optional[float] = None
    premium: Optional[float] = None
    valid_from: Optional[str] = None
    valid_until: Optional[str] = None
    notes: Optional[str] = None


# ----------------------------- Support -----------------------------
class TicketCreate(BaseModel):
    subject: str
    category: Optional[str] = None
    priority: str = "medium"
    description: Optional[str] = None


class TicketUpdate(BaseModel):
    status: Optional[str] = None
    priority: Optional[str] = None
    assigned_to: Optional[str] = None


class TicketMessageCreate(BaseModel):
    body: str


# ----------------------------- Admin -----------------------------
class BranchCreate(BaseModel):
    name: str
    code: str
    city: Optional[str] = None
    country: Optional[str] = None
    address: Optional[str] = None
    manager_id: Optional[str] = None


class BranchUpdate(BaseModel):
    name: Optional[str] = None
    city: Optional[str] = None
    country: Optional[str] = None
    address: Optional[str] = None
    manager_id: Optional[str] = None
    status: Optional[str] = None


class NotificationCreate(BaseModel):
    user_id: Optional[str] = None
    channel: str = "in_app"
    title: Optional[str] = None
    message: str
    type: Optional[str] = None
    related_id: Optional[str] = None
    related_type: Optional[str] = None


# ----------------------------- Auth (extended) -----------------------------
class RefreshRequest(BaseModel):
    refresh_token: Optional[str] = None


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str = Field(min_length=6)


class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str = Field(min_length=6)


# ----------------------------- Users (extended) -----------------------------
class StatusPatch(BaseModel):
    status: str  # active|suspended|invited


# ----------------------------- Customers -----------------------------
class CustomerCreate(BaseModel):
    name: str = Field(min_length=1)
    email: EmailStr
    password: str = Field(min_length=6)
    company: Optional[str] = None
    phone: Optional[str] = None


class CustomerUpdate(BaseModel):
    name: Optional[str] = None
    company: Optional[str] = None
    phone: Optional[str] = None
    status: Optional[str] = None


# ----------------------------- Quotes (extended) -----------------------------
class QuoteCalculate(BaseModel):
    origin: str
    destination: str
    mode: str = "sea"
    weight: Optional[float] = None
    volume: Optional[float] = None
    cargo_type: Optional[str] = None


# ----------------------------- Drivers -----------------------------
class DriverCreate(BaseModel):
    name: str = Field(min_length=1)
    email: EmailStr
    password: str = Field(min_length=6)
    phone: Optional[str] = None
    branch_id: Optional[str] = None


class DriverUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    status: Optional[str] = None
    branch_id: Optional[str] = None


class AvailabilityPatch(BaseModel):
    status: str  # on_duty|off_duty|on_trip|active|suspended


# ----------------------------- Driver tasks -----------------------------
class TaskCreate(BaseModel):
    driver_id: Optional[str] = None
    shipment_id: Optional[str] = None
    description: str
    priority: str = "Medium"
    due: Optional[str] = None


class TaskUpdate(BaseModel):
    driver_id: Optional[str] = None
    description: Optional[str] = None
    priority: Optional[str] = None
    status: Optional[str] = None
    due: Optional[str] = None


class TaskStatusPatch(BaseModel):
    status: str  # Pending|In Progress|Completed


# ----------------------------- Dispatch -----------------------------
class AssignDriverRequest(BaseModel):
    shipment_id: str
    driver_id: str
    vehicle_id: Optional[str] = None
    route_id: Optional[str] = None
    eta: Optional[str] = None


class ReassignDriverRequest(BaseModel):
    delivery_id: str
    driver_id: str


# ----------------------------- Tracking (extended) -----------------------------
class LocationUpdate(BaseModel):
    shipment_id: str
    lat: float
    lng: float
    status: Optional[str] = None
    note: Optional[str] = None
    location: Optional[str] = None


# ----------------------------- Payments (extended) -----------------------------
class PaymentVerify(BaseModel):
    payment_ref: Optional[str] = None
    payment_id: Optional[str] = None
    gateway_txn_id: Optional[str] = None


# ----------------------------- Expenses / Finance -----------------------------
class ExpenseCreate(BaseModel):
    category: str
    amount: float
    currency: str = "USD"
    branch_id: Optional[str] = None
    note: Optional[str] = None
    incurred_at: Optional[str] = None


# ----------------------------- Admin roles -----------------------------
class RoleCreate(BaseModel):
    key: str = Field(min_length=2)
    label: str
    description: Optional[str] = None


class RoleUpdate(BaseModel):
    label: Optional[str] = None
    description: Optional[str] = None
