"""
Invoices API — standalone invoice resource (/invoices).

Shares the Invoice model with the Finance dashboard (/finance/invoices); this
group exposes the conventional REST surface incl. POST /generate and
GET /customer/{customer_id}.
"""

import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import get_finance_user
from app.middleware.auth import get_current_user
from app.models.profile import Profile, UserRole
from app.models.finance import Invoice
from app.models.shipment import Shipment
from app.schemas.payloads import InvoiceCreate, InvoiceUpdate
from app.services import crud
from app.utils.helpers import generate_ref, serialize, now_iso

router = APIRouter(prefix="/invoices", tags=["invoices"])


def _is_finance(role: str) -> bool:
    return role in (UserRole.ADMIN, UserRole.FINANCE)


@router.get("")
async def list_invoices(
    skip: int = 0,
    limit: int = 200,
    db: AsyncSession = Depends(get_db),
    current_user: Profile = Depends(get_current_user),
):
    query = select(Invoice)
    if not _is_finance(current_user.role):
        query = query.where(Invoice.customer_id == current_user.id)
    query = query.order_by(Invoice.created_at.desc()).offset(skip).limit(limit)
    result = await db.execute(query)
    return [serialize(i) for i in result.scalars().all()]


@router.post("/generate", status_code=status.HTTP_201_CREATED)
async def generate_invoice(
    payload: InvoiceCreate,
    db: AsyncSession = Depends(get_db),
    _: Profile = Depends(get_finance_user),
):
    """Generate an invoice. If only a shipment is supplied, derive the customer
    and (when present) the shipment's declared value."""
    data = payload.model_dump(exclude_unset=True)
    for f in ("customer_id", "shipment_id"):
        if data.get(f):
            data[f] = uuid.UUID(data[f])
    if data.get("shipment_id") and not data.get("customer_id"):
        shipment = await crud.get_item(db, Shipment, data["shipment_id"])
        if shipment:
            data["customer_id"] = shipment.customer_id
            data.setdefault("amount", shipment.value_amount or 0)
    data["invoice_no"] = generate_ref("INV")
    data["total"] = (data.get("amount") or 0) + (data.get("tax") or 0)
    data["issue_date"] = now_iso()
    return serialize(await crud.create_item(db, Invoice, data))


@router.get("/customer/{customer_id}")
async def invoices_for_customer(
    customer_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: Profile = Depends(get_current_user),
):
    if not _is_finance(current_user.role) and str(current_user.id) != customer_id:
        raise HTTPException(status_code=403, detail="Not allowed")
    result = await db.execute(
        select(Invoice).where(Invoice.customer_id == uuid.UUID(customer_id))
        .order_by(Invoice.created_at.desc())
    )
    return [serialize(i) for i in result.scalars().all()]


@router.get("/{invoice_id}")
async def get_invoice(
    invoice_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: Profile = Depends(get_current_user),
):
    invoice = await crud.get_item(db, Invoice, invoice_id)
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    if not _is_finance(current_user.role) and invoice.customer_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not allowed")
    return serialize(invoice)


@router.put("/{invoice_id}")
@router.patch("/{invoice_id}")
async def update_invoice(
    invoice_id: str,
    payload: InvoiceUpdate,
    db: AsyncSession = Depends(get_db),
    _: Profile = Depends(get_finance_user),
):
    invoice = await crud.get_item(db, Invoice, invoice_id)
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    data = payload.model_dump(exclude_unset=True)
    invoice = await crud.update_item(db, invoice, data)
    if "amount" in data or "tax" in data:
        invoice.total = (invoice.amount or 0) + (invoice.tax or 0)
        await db.flush()
    return serialize(invoice)


@router.delete("/{invoice_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_invoice(
    invoice_id: str,
    db: AsyncSession = Depends(get_db),
    _: Profile = Depends(get_finance_user),
):
    invoice = await crud.get_item(db, Invoice, invoice_id)
    if invoice:
        await crud.delete_item(db, invoice)
    return None
