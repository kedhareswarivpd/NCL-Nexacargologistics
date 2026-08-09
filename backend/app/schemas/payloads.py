"""
Request payload schemas (Pydantic). Responses are returned as serialized dicts
via app.utils.helpers.serialize, so only inputs need explicit models.
"""

from typing import Optional
from pydantic import BaseModel, EmailStr, Field, field_validator, model_validator


# ----------------------------- Auth -----------------------------
class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1, description="Password is required")

    @field_validator("email")
    @classmethod
    def normalize_email(cls, v: str) -> str:
        return v.lower().strip()


class RegisterRequest(BaseModel):
    name: str = Field(min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    phone: Optional[str] = None
    company: Optional[str] = Field(default=None, max_length=255)

    @field_validator("name")
    @classmethod
    def validate_name(cls, v: str) -> str:
        v = v.strip()
        if not v.replace(" ", "").replace("-", "").replace("'", "").isalpha():
            raise ValueError("Name must contain only letters, spaces, hyphens, or apostrophes")
        return v

    @field_validator("email")
    @classmethod
    def normalize_email(cls, v: str) -> str:
        return v.lower().strip()


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
    name: str = Field(min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    role: str = Field(default="logistics")
    department: Optional[str] = Field(default=None, max_length=100)
    phone: Optional[str] = Field(default=None, max_length=50)
    branch_id: Optional[str] = None

    @field_validator("role")
    @classmethod
    def validate_role(cls, v: str) -> str:
        valid_roles = {"admin", "customer", "finance", "logistics", "warehouse", "driver", "support", "customs"}
        if v.lower() not in valid_roles:
            raise ValueError(f"Invalid role. Must be one of: {', '.join(sorted(valid_roles))}")
        return v.lower()

    @field_validator("name")
    @classmethod
    def validate_name(cls, v: str) -> str:
        v = v.strip()
        if not v.replace(" ", "").replace("-", "").replace("'", "").isalpha():
            raise ValueError("Name must contain only letters, spaces, hyphens, or apostrophes")
        return v

    @field_validator("email")
    @classmethod
    def normalize_email(cls, v: str) -> str:
        return v.lower().strip()


class RoleCreate(BaseModel):
    key: str = Field(min_length=2, max_length=50)
    label: str = Field(min_length=2, max_length=100)
    description: Optional[str] = None


class RoleUpdate(BaseModel):
    label: Optional[str] = None
    description: Optional[str] = None


# ----------------------------- Quotes -----------------------------
class QuoteCreate(BaseModel):
    origin: str = Field(min_length=2, max_length=255)
    destination: str = Field(min_length=2, max_length=255)
    mode: str = Field(default="sea", pattern="^(air|sea|road)$")
    cargo_type: Optional[str] = Field(default=None, max_length=120)
    weight: Optional[float] = Field(default=None, gt=0, le=100000)
    volume: Optional[float] = Field(default=None, gt=0, le=10000)
    incoterm: Optional[str] = Field(default=None, max_length=20, pattern="^(EXW|FOB|CIF|DDP|FCA|CPT|CIP|DAT|DAP|FAS|CFR)$")
    contact_name: Optional[str] = Field(default=None, max_length=100)
    contact_email: Optional[EmailStr] = None
    contact_phone: Optional[str] = Field(default=None, max_length=50)
    notes: Optional[str] = Field(default=None, max_length=2000)

    @model_validator(mode="after")
    def check_origin_destination(self):
        if self.origin.strip().lower() == self.destination.strip().lower():
            raise ValueError("Origin and destination must be different")
        return self


class QuoteUpdate(BaseModel):
    amount: Optional[float] = None
    currency: Optional[str] = None
    status: Optional[str] = Field(default=None, pattern="^(requested|quoted|accepted|rejected|expired)$")
    valid_until: Optional[str] = None
    notes: Optional[str] = None


# ----------------------------- Shipments -----------------------------
class ShipmentCreate(BaseModel):
    origin: str = Field(min_length=2, max_length=255)
    destination: str = Field(min_length=2, max_length=255)
    mode: str = Field(default="sea", pattern="^(air|sea|road)$")
    cargo_type: Optional[str] = Field(default=None, max_length=120)
    weight: Optional[float] = Field(default=None, ge=0, description="Weight in kg")
    volume: Optional[float] = Field(default=None, ge=0, description="Volume in m³")
    incoterm: Optional[str] = Field(default=None, max_length=20)
    eta: Optional[str] = Field(default=None, max_length=60)
    value_amount: Optional[float] = Field(default=None, ge=0)
    currency: Optional[str] = Field(default="USD", max_length=3, pattern="^[A-Z]{3}$")
    customer_id: Optional[str] = None
    customer_name: Optional[str] = Field(default=None, max_length=100)
    customer_email: Optional[EmailStr] = None
    customer_phone: Optional[str] = Field(default=None, max_length=50)
    quote_id: Optional[str] = None
    description: Optional[str] = Field(default=None, max_length=2000)

    @model_validator(mode="after")
    def check_origin_destination(self):
        if self.origin.strip().lower() == self.destination.strip().lower():
            raise ValueError("Origin and destination must be different")
        return self


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
    container_no: str = Field(min_length=5, max_length=40, description="ISO 6346 container number")
    type: str = Field(pattern="^(dry|reefer|open_top|flat_rack|tank)$")
    status: str = Field(default="Available", pattern="^(Available|In Use|Maintenance)$")
    location: Optional[str] = Field(default=None, max_length=255)
    capacity: Optional[str] = Field(default=None, max_length=40)
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
    vehicle_no: str = Field(min_length=3, max_length=40)
    type: str = Field(pattern="^(truck|van|trailer|container_truck)$")
    status: str = Field(default="Available", pattern="^(Available|In Use|Maintenance)$")
    driver_id: Optional[str] = None
    location: Optional[str] = Field(default=None, max_length=255)
    capacity: Optional[str] = Field(default=None, max_length=40)
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
    name: str = Field(min_length=2, max_length=255)
    code: Optional[str] = Field(default=None, max_length=40)
    location: Optional[str] = Field(default=None, max_length=500)
    manager_id: Optional[str] = None
    capacity: Optional[int] = Field(default=None, gt=0)


class WarehouseUpdate(BaseModel):
    name: Optional[str] = None
    code: Optional[str] = None
    location: Optional[str] = None
    manager_id: Optional[str] = None
    capacity: Optional[int] = None
    used_capacity: Optional[int] = None


class InventoryCreate(BaseModel):
    warehouse_id: str
    sku: str = Field(min_length=1, max_length=100)
    name: str = Field(min_length=1, max_length=255)
    category: Optional[str] = Field(default=None, max_length=100)
    zone: Optional[str] = Field(default=None, max_length=50)
    qty: int = Field(default=0, ge=0)
    reorder_at: Optional[int] = Field(default=None, ge=0)
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
    customer_id: str = Field(..., description="Customer ID is required")
    shipment_id: Optional[str] = None
    amount: float = Field(ge=0, description="Amount must be non-negative")
    tax: float = Field(default=0, ge=0, description="Tax must be non-negative")
    currency: str = Field(default="USD", max_length=3, pattern="^[A-Z]{3}$")
    due_date: Optional[str] = None
    description: Optional[str] = Field(default=None, max_length=1000)


class InvoiceUpdate(BaseModel):
    status: Optional[str] = None
    amount: Optional[float] = None
    tax: Optional[float] = None
    due_date: Optional[str] = None
    description: Optional[str] = None


class PaymentCreate(BaseModel):
    invoice_id: str
    amount: float = Field(gt=0, description="Payment amount must be positive")
    currency: str = Field(default="USD", max_length=3, pattern="^[A-Z]{3}$")
    method: Optional[str] = Field(default=None, pattern="^(card|bank_transfer|wallet|cash)$")


class ExpenseCreate(BaseModel):
    category: str = Field(default="Operational", max_length=50)
    amount: float = Field(gt=0)
    currency: str = Field(default="USD", max_length=10)
    description: Optional[str] = None
    branch_id: Optional[str] = None


# ----------------------------- Customs -----------------------------
class CustomsCreate(BaseModel):
    shipment_id: Optional[str] = None
    direction: str = Field(default="import", pattern="^(import|export)$")
    hs_code: Optional[str] = Field(default=None, max_length=20)
    declared_value: Optional[float] = Field(default=None, ge=0)
    duty_amount: Optional[float] = Field(default=None, ge=0)
    currency: str = Field(default="USD", max_length=3, pattern="^[A-Z]{3}$")
    notes: Optional[str] = Field(default=None, max_length=2000)


class CustomsUpdate(BaseModel):
    status: Optional[str] = None
    hs_code: Optional[str] = None
    declared_value: Optional[float] = None
    duty_amount: Optional[float] = None
    notes: Optional[str] = None


# ----------------------------- Insurance -----------------------------
class InsuranceCreate(BaseModel):
    shipment_id: Optional[str] = None
    coverage_amount: Optional[float] = Field(default=None, gt=0)
    currency: str = Field(default="USD", max_length=3, pattern="^[A-Z]{3}$")
    notes: Optional[str] = Field(default=None, max_length=2000)


class InsuranceUpdate(BaseModel):
    status: Optional[str] = None
    coverage_amount: Optional[float] = None
    premium: Optional[float] = None
    valid_from: Optional[str] = None
    valid_until: Optional[str] = None
    notes: Optional[str] = None


# ----------------------------- Support -----------------------------
class TicketCreate(BaseModel):
    subject: str = Field(min_length=3, max_length=255)
    category: Optional[str] = Field(default=None, pattern="^(delivery|billing|damage|documentation|general)$")
    priority: str = Field(default="medium", pattern="^(low|medium|high|urgent)$")
    description: Optional[str] = Field(default=None, max_length=5000)


class TicketUpdate(BaseModel):
    status: Optional[str] = None
    priority: Optional[str] = None
    assigned_to: Optional[str] = None


class TicketMessageCreate(BaseModel):
    body: str


# ----------------------------- Admin -----------------------------
class BranchCreate(BaseModel):
    name: str = Field(min_length=2, max_length=255)
    code: str = Field(min_length=2, max_length=50)
    city: Optional[str] = Field(default=None, max_length=120)
    country: Optional[str] = Field(default=None, max_length=120)
    address: Optional[str] = Field(default=None, max_length=500)
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
    channel: str = Field(default="in_app", pattern="^(in_app|email|sms)$")
    title: Optional[str] = Field(default=None, max_length=255)
    message: str = Field(min_length=1, max_length=5000)
    type: Optional[str] = Field(default=None, max_length=50)
    related_id: Optional[str] = None
    related_type: Optional[str] = None
    email_to: Optional[str] = None  # Override email recipient (optional)


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
    status: str = Field(pattern="^(active|suspended|invited)$")


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
    name: str = Field(min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    phone: Optional[str] = Field(default=None, max_length=50)
    branch_id: Optional[str] = None

    @field_validator("name")
    @classmethod
    def validate_name(cls, v: str) -> str:
        v = v.strip()
        if not v.replace(" ", "").replace("-", "").replace("'", "").isalpha():
            raise ValueError("Name must contain only letters, spaces, hyphens, or apostrophes")
        return v

    @field_validator("email")
    @classmethod
    def normalize_email(cls, v: str) -> str:
        return v.lower().strip()


class DriverUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    status: Optional[str] = None
    branch_id: Optional[str] = None


class AvailabilityPatch(BaseModel):
    status: str = Field(pattern="^(on_duty|off_duty|on_trip|active|suspended)$")


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
    lat: float = Field(ge=-90, le=90, description="Latitude must be between -90 and 90")
    lng: float = Field(ge=-180, le=180, description="Longitude must be between -180 and 180")
    status: Optional[str] = Field(default=None, max_length=50)
    note: Optional[str] = Field(default=None, max_length=500)
    location: Optional[str] = Field(default=None, max_length=255)


# ----------------------------- Payments (extended) -----------------------------
class PaymentVerify(BaseModel):
    payment_ref: Optional[str] = None
    payment_id: Optional[str] = None
    gateway_txn_id: Optional[str] = None
