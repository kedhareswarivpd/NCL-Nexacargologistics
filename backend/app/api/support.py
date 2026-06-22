"""
Support API — support tickets & messages (Support Ticket Workflow).
"""

import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import get_support_user
from app.middleware.auth import get_current_user
from app.models.profile import Profile, UserRole
from app.models.support import SupportTicket, TicketMessage
from app.schemas.payloads import TicketCreate, TicketUpdate, TicketMessageCreate
from app.services import crud
from app.utils.helpers import generate_ref, serialize

router = APIRouter(prefix="/support", tags=["support"])


def _is_agent(role: str) -> bool:
    return role in (UserRole.ADMIN, UserRole.SUPPORT)


@router.get("/tickets")
async def list_tickets(
    status_filter: str | None = None,
    db: AsyncSession = Depends(get_db),
    current_user: Profile = Depends(get_current_user),
):
    query = select(SupportTicket)
    if not _is_agent(current_user.role):
        query = query.where(SupportTicket.customer_id == current_user.id)
    if status_filter:
        query = query.where(SupportTicket.status == status_filter)
    query = query.order_by(SupportTicket.created_at.desc())
    result = await db.execute(query)
    return [serialize(t) for t in result.scalars().all()]


@router.post("/tickets", status_code=status.HTTP_201_CREATED)
async def create_ticket(
    payload: TicketCreate,
    db: AsyncSession = Depends(get_db),
    current_user: Profile = Depends(get_current_user),
):
    data = payload.model_dump(exclude_unset=True)
    data["ticket_ref"] = generate_ref("TKT")
    data["customer_id"] = current_user.id
    return serialize(await crud.create_item(db, SupportTicket, data))


@router.get("/tickets/{ticket_id}")
async def get_ticket(
    ticket_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: Profile = Depends(get_current_user),
):
    ticket = await crud.get_item(db, SupportTicket, ticket_id)
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    if not _is_agent(current_user.role) and ticket.customer_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not allowed")
    msgs = await db.execute(
        select(TicketMessage).where(TicketMessage.ticket_id == ticket.id).order_by(TicketMessage.created_at.asc())
    )
    data = serialize(ticket)
    data["messages"] = [serialize(m) for m in msgs.scalars().all()]
    return data


@router.post("/tickets/{ticket_id}/messages", status_code=status.HTTP_201_CREATED)
async def add_message(
    ticket_id: str,
    payload: TicketMessageCreate,
    db: AsyncSession = Depends(get_db),
    current_user: Profile = Depends(get_current_user),
):
    ticket = await crud.get_item(db, SupportTicket, ticket_id)
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    if not _is_agent(current_user.role) and ticket.customer_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not allowed")
    msg = await crud.create_item(db, TicketMessage, {
        "ticket_id": ticket.id,
        "sender_id": current_user.id,
        "body": payload.body,
    })
    return serialize(msg)


@router.patch("/tickets/{ticket_id}")
@router.put("/tickets/{ticket_id}")
async def update_ticket(
    ticket_id: str,
    payload: TicketUpdate,
    db: AsyncSession = Depends(get_db),
    _: Profile = Depends(get_support_user),
):
    ticket = await crud.get_item(db, SupportTicket, ticket_id)
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    data = payload.model_dump(exclude_unset=True)
    if data.get("assigned_to"):
        data["assigned_to"] = uuid.UUID(data["assigned_to"])
    return serialize(await crud.update_item(db, ticket, data))
