"""
Documents API — standalone document registry (/documents).

Files themselves are uploaded to Supabase Storage on the frontend; this stores
the metadata + URL. POST /upload accepts either multipart file metadata or a
JSON body carrying an already-uploaded file URL.
"""

import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.middleware.auth import get_current_user
from app.models.profile import Profile, UserRole
from app.models.shipment import Document, Shipment
from app.schemas.payloads import DocumentCreate
from app.services import crud
from app.utils.helpers import serialize

router = APIRouter(prefix="/documents", tags=["documents"])


def _can_view_all(role: str) -> bool:
    return role in UserRole.STAFF


async def _assert_shipment_access(db: AsyncSession, shipment_id, user: Profile):
    if not shipment_id:
        return
    shipment = await crud.get_item(db, Shipment, shipment_id)
    if not shipment:
        raise HTTPException(status_code=404, detail="Shipment not found")
    if not _can_view_all(user.role) and shipment.customer_id != user.id:
        raise HTTPException(status_code=403, detail="Not allowed")


@router.post("/upload", status_code=status.HTTP_201_CREATED)
async def upload_document(
    payload: DocumentCreate,
    db: AsyncSession = Depends(get_db),
    current_user: Profile = Depends(get_current_user),
):
    """Register an uploaded document (metadata + Storage URL)."""
    shipment_uuid = uuid.UUID(payload.shipment_id) if payload.shipment_id else None
    await _assert_shipment_access(db, shipment_uuid, current_user)
    doc = await crud.create_item(db, Document, {
        "shipment_id": shipment_uuid,
        "doc_type": payload.doc_type,
        "file_name": payload.file_name,
        "file_url": payload.file_url,
        "uploaded_by": current_user.id,
    })
    return serialize(doc)


@router.get("")
async def list_documents(
    skip: int = 0,
    limit: int = 200,
    db: AsyncSession = Depends(get_db),
    current_user: Profile = Depends(get_current_user),
):
    query = select(Document)
    if not _can_view_all(current_user.role):
        # Customers see only documents they uploaded.
        query = query.where(Document.uploaded_by == current_user.id)
    query = query.order_by(Document.created_at.desc()).offset(skip).limit(limit)
    result = await db.execute(query)
    return [serialize(d) for d in result.scalars().all()]


@router.get("/shipment/{shipment_id}")
async def documents_for_shipment(
    shipment_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: Profile = Depends(get_current_user),
):
    await _assert_shipment_access(db, uuid.UUID(shipment_id), current_user)
    result = await db.execute(
        select(Document).where(Document.shipment_id == uuid.UUID(shipment_id))
        .order_by(Document.created_at.desc())
    )
    return [serialize(d) for d in result.scalars().all()]


@router.get("/{document_id}")
async def get_document(
    document_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: Profile = Depends(get_current_user),
):
    doc = await crud.get_item(db, Document, document_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    if not _can_view_all(current_user.role) and doc.uploaded_by != current_user.id:
        raise HTTPException(status_code=403, detail="Not allowed")
    return serialize(doc)


@router.delete("/{document_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_document(
    document_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: Profile = Depends(get_current_user),
):
    doc = await crud.get_item(db, Document, document_id)
    if not doc:
        return None
    if not _can_view_all(current_user.role) and doc.uploaded_by != current_user.id:
        raise HTTPException(status_code=403, detail="Not allowed")
    await crud.delete_item(db, doc)
    return None
