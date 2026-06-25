from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel, Field

from app.core.database import get_db
from app.core.dependencies import require_roles
from app.middleware.auth import get_current_user
from app.models.profile import Profile, UserRole
from app.models.review import Review
from app.services import crud
from app.utils.helpers import serialize

router = APIRouter(prefix="/reviews", tags=["reviews"])


class ReviewCreate(BaseModel):
    rating: int = Field(..., ge=1, le=5)
    title: str | None = None
    comment: str
    customer_role: str | None = None


@router.get("", summary="Public — list approved reviews")
async def list_reviews(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Review).where(Review.approved == True).order_by(Review.created_at.desc())
    )
    return [serialize(r) for r in result.scalars().all()]


@router.post("", status_code=status.HTTP_201_CREATED)
async def create_review(
    payload: ReviewCreate,
    db: AsyncSession = Depends(get_db),
    current_user: Profile = Depends(get_current_user),
):
    existing = await db.execute(select(Review).where(Review.customer_id == current_user.id))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="You have already submitted a review.")
    review = await crud.create_item(db, Review, {
        "customer_id": current_user.id,
        "customer_name": current_user.name,
        "customer_company": current_user.company,
        "customer_role": payload.customer_role or current_user.role,
        "rating": payload.rating,
        "title": payload.title,
        "comment": payload.comment,
        "approved": True,   # auto-approve; set False if you want admin moderation
    })
    return serialize(review)


@router.delete("/{review_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_review(
    review_id: str,
    db: AsyncSession = Depends(get_db),
    _: Profile = Depends(require_roles(UserRole.ADMIN)),
):
    review = await crud.get_item(db, Review, review_id)
    if review:
        await crud.delete_item(db, review)
