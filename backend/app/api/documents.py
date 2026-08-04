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
from app.core.dependencies import assert_owner_or_staff
from app.middleware.auth import get_current_user
from app.models.profile import Profile, UserRole
from app.models.shipment import Document, Shipment
from app.schemas.payloads import DocumentCreate
from app.services import crud
from app.utils.helpers import serialize, serialize_all

router = APIRouter(prefix="/documents", tags=["documents"])


async def _assert_shipment_access(db: AsyncSession, shipment_id, user: Profile):
    if not shipment_id:
        return
    shipment = await crud.get_item(db, Shipment, shipment_id)
    if not shipment:
        raise HTTPException(status_code=404, detail="Shipment not found")
    assert_owner_or_staff(shipment, user)


@router.post("/upload", status_code=status.HTTP_201_CREATED)
async def upload_document(
    payload: DocumentCreate,
    db: AsyncSession = Depends(get_db),
    current_user: Profile = Depends(get_current_user),
):
    """Register an uploaded document (metadata + Storage URL)."""
    url = (payload.file_url or "").strip()
    if not (url.startswith("http://") or url.startswith("https://")):
        raise HTTPException(status_code=400, detail="Invalid file URL scheme. Must use http or https.")
    shipment_uuid = uuid.UUID(payload.shipment_id) if payload.shipment_id else None
    await _assert_shipment_access(db, shipment_uuid, current_user)
    doc = await crud.create_item(db, Document, {
        "shipment_id": shipment_uuid,
        "doc_type": payload.doc_type,
        "file_name": payload.file_name,
        "file_url": url,
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
    if current_user.role not in UserRole.STAFF:
        query = query.where(Document.uploaded_by == current_user.id)
    query = query.order_by(Document.created_at.desc()).offset(skip).limit(limit)
    result = await db.execute(query)
    return serialize_all(result.scalars().all())


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
    return serialize_all(result.scalars().all())


@router.get("/{document_id}")
async def get_document(
    document_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: Profile = Depends(get_current_user),
):
    doc = await crud.get_item(db, Document, document_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    assert_owner_or_staff(doc, current_user, owner_field="uploaded_by")
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
    assert_owner_or_staff(doc, current_user, owner_field="uploaded_by")
    await crud.delete_item(db, doc)
    return None
