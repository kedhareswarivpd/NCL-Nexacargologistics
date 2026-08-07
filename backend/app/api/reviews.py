"""
Reviews API — public listing of customer testimonials.
"""

from fastapi import APIRouter

router = APIRouter(prefix="/reviews", tags=["reviews"])

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
