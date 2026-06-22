"""
Quotes API — customers request freight quotes; staff price and update them.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.middleware.auth import get_current_user
from app.models.profile import Profile, UserRole
from app.models.shipment import Quote, Shipment, ShipmentStatusHistory
from app.models.finance import Invoice, InvoiceStatus
from datetime import datetime, timedelta, timezone
from app.schemas.payloads import QuoteCalculate, QuoteCreate, QuoteUpdate
from app.services import crud
from app.utils.helpers import generate_ref, serialize, generate_tracking_id

router = APIRouter(prefix="/quotes", tags=["quotes"])

# Per-mode base rate (USD) + per-kg and per-cbm components — a simple, transparent
# pricing engine. Staff can still override the amount via PATCH.
_MODE_RATES = {
    "air":  {"base": 120.0, "per_kg": 2.50, "per_cbm": 90.0},
    "sea":  {"base": 80.0,  "per_kg": 0.40, "per_cbm": 35.0},
    "road": {"base": 60.0,  "per_kg": 0.80, "per_cbm": 50.0},
}


def estimate_price(mode: str, weight: float | None, volume: float | None, cargo_type: str | None = None) -> float:
    rate = _MODE_RATES.get((mode or "sea").lower(), _MODE_RATES["sea"])
    price = rate["base"] + (weight or 0) * rate["per_kg"] + (volume or 0) * rate["per_cbm"]
    # Surcharge for special cargo.
    if cargo_type and cargo_type.lower() in ("hazardous", "perishable", "fragile"):
        price *= 1.20
    return round(price, 2)


@router.get("")
async def list_quotes(
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db),
    current_user: Profile = Depends(get_current_user),
):
    query = select(Quote)
    if current_user.role == UserRole.CUSTOMER:
        query = query.where(Quote.customer_id == current_user.id)
    query = query.order_by(Quote.created_at.desc()).offset(skip).limit(limit)
    result = await db.execute(query)
    return [serialize(q) for q in result.scalars().all()]


@router.post("/calculate")
async def calculate_quote(
    payload: QuoteCalculate,
    current_user: Profile = Depends(get_current_user),
):
    """Stateless price estimate — does not persist a quote."""
    price = estimate_price(payload.mode, payload.weight, payload.volume, payload.cargo_type)
    return {
        "origin": payload.origin,
        "destination": payload.destination,
        "mode": payload.mode,
        "weight": payload.weight,
        "volume": payload.volume,
        "currency": "USD",
        "amount": price,
        "breakdown": _MODE_RATES.get((payload.mode or "sea").lower(), _MODE_RATES["sea"]),
    }


async def _create_quote(payload: QuoteCreate, db: AsyncSession, current_user: Profile) -> dict:
    data = payload.model_dump()
    data["quote_ref"] = generate_ref("QT")
    data["customer_id"] = current_user.id
    data.setdefault("contact_name", current_user.name)
    data.setdefault("contact_email", current_user.email)
    # Auto-price the request so the customer sees an immediate estimate.
    data["amount"] = estimate_price(data.get("mode"), data.get("weight"), data.get("volume"), data.get("cargo_type"))
    data["status"] = "quoted"
    quote = await crud.create_item(db, Quote, data)

    # Automatically create a shipment record linked to this quote so it displays in the logistics dashboard
    shipment_data = {
        "tracking_id": generate_tracking_id(),
        "customer_id": current_user.id,
        "quote_id": quote.id,
        "origin": quote.origin,
        "destination": quote.destination,
        "mode": quote.mode,
        "cargo_type": quote.cargo_type,
        "weight": f"{quote.weight} kg" if quote.weight is not None else None,
        "volume": f"{quote.volume} m³" if quote.volume is not None else None,
        "status": "Awaiting Dispatch",
        "customer_name": quote.contact_name or current_user.name,
        "customer_email": quote.contact_email or current_user.email,
        "customer_phone": quote.contact_phone or current_user.phone,
    }
    shipment = await crud.create_item(db, Shipment, shipment_data)

    # Seed status history
    db.add(ShipmentStatusHistory(
        shipment_id=shipment.id,
        status=shipment.status,
        note=f"Shipment auto-created from Quote Request {quote.quote_ref}",
        changed_by=current_user.id,
    ))
    
    # Automatically create a pending invoice linked to this shipment
    issue_dt = datetime.now(timezone.utc)
    due_dt = issue_dt + timedelta(days=14)
    invoice_data = {
        "invoice_no": generate_ref("INV"),
        "customer_id": current_user.id,
        "shipment_id": shipment.id,
        "amount": quote.amount,
        "tax": 0.0,
        "total": quote.amount,
        "currency": "USD",
        "status": InvoiceStatus.PENDING,
        "issue_date": issue_dt.isoformat(),
        "due_date": due_dt.isoformat(),
        "description": f"Freight services for shipment {shipment.tracking_id} ({quote.origin} to {quote.destination})",
    }
    await crud.create_item(db, Invoice, invoice_data)
    
    await db.flush()

    return serialize(quote)


@router.post("", status_code=status.HTTP_201_CREATED)
async def create_quote(
    payload: QuoteCreate,
    db: AsyncSession = Depends(get_db),
    current_user: Profile = Depends(get_current_user),
):
    return await _create_quote(payload, db, current_user)


@router.post("/request", status_code=status.HTTP_201_CREATED)
async def request_quote(
    payload: QuoteCreate,
    db: AsyncSession = Depends(get_db),
    current_user: Profile = Depends(get_current_user),
):
    """Alias of POST / — customer-facing 'request a freight quote' action."""
    return await _create_quote(payload, db, current_user)


@router.get("/{quote_id}")
async def get_quote(
    quote_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: Profile = Depends(get_current_user),
):
    quote = await crud.get_item(db, Quote, quote_id)
    if not quote:
        raise HTTPException(status_code=404, detail="Quote not found")
    if current_user.role == UserRole.CUSTOMER and quote.customer_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not allowed")
    return serialize(quote)


@router.patch("/{quote_id}")
@router.put("/{quote_id}")
async def update_quote(
    quote_id: str,
    payload: QuoteUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: Profile = Depends(get_current_user),
):
    quote = await crud.get_item(db, Quote, quote_id)
    if not quote:
        raise HTTPException(status_code=404, detail="Quote not found")
    data = payload.model_dump(exclude_unset=True)
    # Customers may only accept/reject their own quote; staff may price it.
    if current_user.role == UserRole.CUSTOMER:
        if quote.customer_id != current_user.id:
            raise HTTPException(status_code=403, detail="Not allowed")
        allowed = {"status"}
        if not set(data).issubset(allowed) or data.get("status") not in {"accepted", "rejected"}:
            raise HTTPException(status_code=403, detail="Customers may only accept or reject a quote")
    elif current_user.role not in (UserRole.ADMIN, UserRole.LOGISTICS, UserRole.FINANCE, UserRole.SUPPORT):
        raise HTTPException(status_code=403, detail="Not allowed")
    updated = await crud.update_item(db, quote, data)
    return serialize(updated)


@router.post("/{quote_id}/approve")
async def approve_quote(
    quote_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: Profile = Depends(get_current_user),
):
    """Accept a quote. Customers accept their own; staff may accept on their behalf."""
    quote = await crud.get_item(db, Quote, quote_id)
    if not quote:
        raise HTTPException(status_code=404, detail="Quote not found")
    if current_user.role == UserRole.CUSTOMER and quote.customer_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not allowed")
    quote.status = "accepted"
    await db.flush()
    await db.refresh(quote)
    return serialize(quote)


@router.post("/{quote_id}/reject")
async def reject_quote(
    quote_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: Profile = Depends(get_current_user),
):
    quote = await crud.get_item(db, Quote, quote_id)
    if not quote:
        raise HTTPException(status_code=404, detail="Quote not found")
    if current_user.role == UserRole.CUSTOMER and quote.customer_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not allowed")
    quote.status = "rejected"
    await db.flush()
    await db.refresh(quote)
    return serialize(quote)


@router.delete("/{quote_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_quote(
    quote_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: Profile = Depends(get_current_user),
):
    quote = await crud.get_item(db, Quote, quote_id)
    if not quote:
        return None
    # Customers may delete their own draft/quoted requests; staff may delete any.
    if current_user.role == UserRole.CUSTOMER and quote.customer_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not allowed")
    await crud.delete_item(db, quote)
    return None
