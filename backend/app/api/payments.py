"""
Payments API — standalone payment resource (/payments). Shares the Payment
model with the Finance dashboard; adds POST /verify and GET /customer/{id}.
"""

import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import get_finance_user
from app.middleware.auth import get_current_user
from app.models.profile import Profile, UserRole
from app.models.finance import Invoice, Payment, InvoiceStatus
from app.schemas.payloads import PaymentCreate, PaymentVerify
from app.services import crud
from app.utils.helpers import generate_ref, serialize, now_iso

router = APIRouter(prefix="/payments", tags=["payments"])


def _is_finance(role: str) -> bool:
    return role in (UserRole.ADMIN, UserRole.FINANCE)


@router.get("")
async def list_payments(
    skip: int = 0,
    limit: int = 200,
    db: AsyncSession = Depends(get_db),
    current_user: Profile = Depends(get_current_user),
):
    query = select(Payment)
    if not _is_finance(current_user.role):
        query = query.where(Payment.customer_id == current_user.id)
    query = query.order_by(Payment.created_at.desc()).offset(skip).limit(limit)
    result = await db.execute(query)
    return [serialize(p) for p in result.scalars().all()]


@router.post("", status_code=status.HTTP_201_CREATED)
async def create_payment(
    payload: PaymentCreate,
    db: AsyncSession = Depends(get_db),
    current_user: Profile = Depends(get_current_user),
):
    invoice = await crud.get_item(db, Invoice, payload.invoice_id)
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    if not _is_finance(current_user.role) and invoice.customer_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not allowed")
    payment = await crud.create_item(db, Payment, {
        "payment_ref": generate_ref("PAY"),
        "invoice_id": invoice.id,
        "customer_id": invoice.customer_id,
        "amount": payload.amount,
        "currency": payload.currency,
        "method": payload.method,
        "status": "completed",
        "paid_at": now_iso(),
    })
    invoice.status = InvoiceStatus.PAID
    await db.flush()
    return serialize(payment)


@router.post("/verify")
async def verify_payment(
    payload: PaymentVerify,
    db: AsyncSession = Depends(get_db),
    _: Profile = Depends(get_finance_user),
):
    """Verify/confirm a payment (e.g. after a gateway webhook) and mark its
    invoice paid. Idempotent on already-completed payments."""
    payment = None
    if payload.payment_id:
        payment = await crud.get_item(db, Payment, payload.payment_id)
    elif payload.payment_ref:
        payment = await crud.get_by(db, Payment, payment_ref=payload.payment_ref)
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")

    payment.status = "completed"
    if not payment.paid_at:
        payment.paid_at = now_iso()
    if payment.invoice_id:
        invoice = await crud.get_item(db, Invoice, payment.invoice_id)
        if invoice:
            invoice.status = InvoiceStatus.PAID
    await db.flush()
    await db.refresh(payment)
    return {"verified": True, "payment": serialize(payment)}


@router.get("/customer/{customer_id}")
async def payments_for_customer(
    customer_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: Profile = Depends(get_current_user),
):
    if not _is_finance(current_user.role) and str(current_user.id) != customer_id:
        raise HTTPException(status_code=403, detail="Not allowed")
    result = await db.execute(
        select(Payment).where(Payment.customer_id == uuid.UUID(customer_id))
        .order_by(Payment.created_at.desc())
    )
    return [serialize(p) for p in result.scalars().all()]


@router.get("/{payment_id}")
async def get_payment(
    payment_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: Profile = Depends(get_current_user),
):
    payment = await crud.get_item(db, Payment, payment_id)
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")
    if not _is_finance(current_user.role) and payment.customer_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not allowed")
    return serialize(payment)
