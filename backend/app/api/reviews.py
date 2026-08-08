"""
Reviews API — public listing of customer testimonials.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field

from app.middleware.auth import get_current_user_optional
from app.models.profile import Profile

router = APIRouter(prefix="/reviews", tags=["reviews"])


class ReviewCreate(BaseModel):
    rating: int = Field(ge=1, le=5, description="Rating from 1 to 5")
    title: str = Field(min_length=3, max_length=255)
    comment: str = Field(min_length=10, max_length=2000)
    customer_role: str | None = Field(default=None, max_length=100)


TESTIMONIALS = [
    {
        "id": "1",
        "customer_name": "Sarah Jenkins",
        "customer_company": "Global Logistics Corp",
        "customer_role": "Supply Chain Director",
        "rating": 5,
        "title": "Outstanding Tracking & Speed",
        "comment": "NexaCargo has transformed our regional freight operations. Live tracking accuracy is unmatched.",
        "approved": True,
    },
    {
        "id": "2",
        "customer_name": "Marcus Vance",
        "customer_company": "Vance Electronics",
        "customer_role": "Operations Manager",
        "rating": 5,
        "title": "Reliable Freight & Customs",
        "comment": "Customs clearance processed within hours. Highly recommended for international shipments.",
        "approved": True,
    },
]


@router.get("", summary="Public — list approved reviews")
async def list_reviews():
    return TESTIMONIALS


@router.post("", status_code=status.HTTP_201_CREATED, summary="Submit a new review")
async def create_review(
    payload: ReviewCreate,
    current_user: Profile | None = Depends(get_current_user_optional),
):
    """Submit a new customer review. Requires authentication."""
    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required to submit a review",
        )

    review = {
        "id": str(len(TESTIMONIALS) + 1),
        "customer_name": current_user.name,
        "customer_company": current_user.company,
        "customer_role": payload.customer_role or current_user.role,
        "rating": payload.rating,
        "title": payload.title,
        "comment": payload.comment,
        "approved": False,  # Reviews require admin approval
    }
    TESTIMONIALS.append(review)

    return {"message": "Review submitted successfully", "review": review}
