"""
Finance API — invoices, payments, revenue & outstanding reports (Finance Dashboard).
Customers can view/pay their own invoices; finance staff manage everything.
"""

import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import get_finance_user
from app.middleware.auth import get_current_user
from app.models.profile import Profile, UserRole
from app.models.finance import Invoice, Payment, InvoiceStatus
from app.models.expense import Expense
from app.schemas.payloads import ExpenseCreate, InvoiceCreate, InvoiceUpdate, PaymentCreate
from app.services import crud
from app.utils.helpers import generate_ref, serialize, now_iso

router = APIRouter(prefix="/finance", tags=["finance"])


def _is_finance(role: str) -> bool:
    return role in (UserRole.ADMIN, UserRole.FINANCE)


# ----------------------------- Invoices -----------------------------
@router.get("/invoices")
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


@router.get("/invoices/{invoice_id}")
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


@router.post("/invoices", status_code=status.HTTP_201_CREATED)
async def create_invoice(
    payload: InvoiceCreate,
    db: AsyncSession = Depends(get_db),
    _: Profile = Depends(get_finance_user),
):
    data = payload.model_dump(exclude_unset=True)
    for f in ("customer_id", "shipment_id"):
        if data.get(f):
            data[f] = uuid.UUID(data[f])
    data["invoice_no"] = generate_ref("INV")
    data["total"] = (data.get("amount") or 0) + (data.get("tax") or 0)
    data["issue_date"] = now_iso()
    return serialize(await crud.create_item(db, Invoice, data))


@router.patch("/invoices/{invoice_id}")
@router.put("/invoices/{invoice_id}")
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


# ----------------------------- Payments -----------------------------
@router.get("/payments")
async def list_payments(
    db: AsyncSession = Depends(get_db),
    current_user: Profile = Depends(get_current_user),
):
    query = select(Payment)
    if not _is_finance(current_user.role):
        query = query.where(Payment.customer_id == current_user.id)
    query = query.order_by(Payment.created_at.desc())
    result = await db.execute(query)
    return [serialize(p) for p in result.scalars().all()]


@router.post("/payments", status_code=status.HTTP_201_CREATED)
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
    # Mark invoice paid (simple full-payment model).
    invoice.status = InvoiceStatus.PAID
    await db.flush()
    return serialize(payment)


# ----------------------------- Reports -----------------------------
@router.get("/revenue")
async def revenue(db: AsyncSession = Depends(get_db), _: Profile = Depends(get_finance_user)):
    paid = await db.execute(
        select(func.coalesce(func.sum(Invoice.total), 0)).where(Invoice.status == InvoiceStatus.PAID)
    )
    outstanding = await db.execute(
        select(func.coalesce(func.sum(Invoice.total), 0)).where(Invoice.status != InvoiceStatus.PAID)
    )
    return {
        "total_revenue": float(paid.scalar() or 0),
        "outstanding": float(outstanding.scalar() or 0),
        "paid_invoices": await crud.count(db, Invoice, {"status": InvoiceStatus.PAID}),
        "pending_invoices": await crud.count(db, Invoice, {"status": InvoiceStatus.PENDING}),
        "overdue_invoices": await crud.count(db, Invoice, {"status": InvoiceStatus.OVERDUE}),
    }


@router.get("/outstanding")
async def outstanding_invoices(db: AsyncSession = Depends(get_db), _: Profile = Depends(get_finance_user)):
    result = await db.execute(
        select(Invoice).where(Invoice.status != InvoiceStatus.PAID).order_by(Invoice.created_at.desc())
    )
    return [serialize(i) for i in result.scalars().all()]


# ----------------------------- Expenses -----------------------------
@router.get("/expenses")
async def list_expenses(
    skip: int = 0,
    limit: int = 200,
    db: AsyncSession = Depends(get_db),
    _: Profile = Depends(get_finance_user),
):
    return [serialize(e) for e in await crud.list_items(db, Expense, skip=skip, limit=limit)]


@router.post("/expenses", status_code=status.HTTP_201_CREATED)
async def create_expense(
    payload: ExpenseCreate,
    db: AsyncSession = Depends(get_db),
    _: Profile = Depends(get_finance_user),
):
    data = payload.model_dump(exclude_unset=True)
    if data.get("branch_id"):
        data["branch_id"] = uuid.UUID(data["branch_id"])
    return serialize(await crud.create_item(db, Expense, data))


# ----------------------------- Profit / loss & periodic reports -----------------------------
async def _sum(db: AsyncSession, column, *where) -> float:
    q = select(func.coalesce(func.sum(column), 0))
    for clause in where:
        q = q.where(clause)
    result = await db.execute(q)
    return float(result.scalar() or 0)


@router.get("/profit-loss")
async def profit_loss(db: AsyncSession = Depends(get_db), _: Profile = Depends(get_finance_user)):
    revenue_total = await _sum(db, Invoice.total, Invoice.status == InvoiceStatus.PAID)
    expense_total = await _sum(db, Expense.amount)
    return {
        "revenue": revenue_total,
        "expenses": expense_total,
        "profit": round(revenue_total - expense_total, 2),
        "margin_pct": round((revenue_total - expense_total) / revenue_total * 100, 2) if revenue_total else 0.0,
    }


async def _periodic_report(db: AsyncSession, unit: str) -> list[dict]:
    """Revenue + expenses grouped by month or year (using created_at)."""
    rev_rows = (await db.execute(
        select(
            func.date_trunc(unit, Invoice.created_at).label("period"),
            func.coalesce(func.sum(Invoice.total), 0),
        )
        .where(Invoice.status == InvoiceStatus.PAID)
        .group_by("period").order_by("period")
    )).all()
    exp_rows = (await db.execute(
        select(
            func.date_trunc(unit, Expense.created_at).label("period"),
            func.coalesce(func.sum(Expense.amount), 0),
        ).group_by("period").order_by("period")
    )).all()

    buckets: dict[str, dict] = {}
    for period, total in rev_rows:
        key = period.isoformat() if period else "unknown"
        buckets.setdefault(key, {"period": key, "revenue": 0.0, "expenses": 0.0})
        buckets[key]["revenue"] = float(total or 0)
    for period, total in exp_rows:
        key = period.isoformat() if period else "unknown"
        buckets.setdefault(key, {"period": key, "revenue": 0.0, "expenses": 0.0})
        buckets[key]["expenses"] = float(total or 0)
    rows = sorted(buckets.values(), key=lambda r: r["period"])
    for r in rows:
        r["profit"] = round(r["revenue"] - r["expenses"], 2)
    return rows


@router.get("/monthly-report")
async def monthly_report(db: AsyncSession = Depends(get_db), _: Profile = Depends(get_finance_user)):
    return {"unit": "month", "rows": await _periodic_report(db, "month")}


@router.get("/yearly-report")
async def yearly_report(db: AsyncSession = Depends(get_db), _: Profile = Depends(get_finance_user)):
    return {"unit": "year", "rows": await _periodic_report(db, "year")}
