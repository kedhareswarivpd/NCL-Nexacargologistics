"""
Reviews API — public listing of customer testimonials.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.middleware.auth import get_current_user_optional
from app.models.profile import Profile
from app.models.notification import Notification
from app.utils.helpers import serialize

router = APIRouter(prefix="/reviews", tags=["reviews"])


class ReviewCreate(BaseModel):
    rating: int = Field(ge=1, le=5, description="Rating from 1 to 5")
    title: str = Field(min_length=3, max_length=255)
    comment: str = Field(min_length=10, max_length=2000)
    customer_role: str | None = Field(default=None, max_length=100)


@router.get("", summary="Public — list approved reviews")
async def list_reviews(db: AsyncSession = Depends(get_db)):
    from app.models.reviews import Review
    result = await db.execute(select(Review).where(Review.approved.is_(True)).order_by(Review.created_at.desc()))
    return [serialize(r) for r in result.scalars().all()]


@router.post("", status_code=status.HTTP_201_CREATED, summary="Submit a new review")
async def create_review(
    payload: ReviewCreate,
    db: AsyncSession = Depends(get_db),
    current_user: Profile | None = Depends(get_current_user_optional),
):
    """Submit a new customer review. Requires authentication."""
    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required to submit a review",
        )

    from app.models.reviews import Review
    review = Review(
        customer_id=current_user.id,
        customer_name=current_user.name,
        customer_company=current_user.company,
        customer_role=payload.customer_role or current_user.role,
        rating=payload.rating,
        title=payload.title,
        comment=payload.comment,
        approved=False,
    )
    db.add(review)
    await db.flush()
    await db.refresh(review)

    return {"message": "Review submitted successfully", "review": serialize(review)}
