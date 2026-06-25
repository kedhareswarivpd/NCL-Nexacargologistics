from fastapi import APIRouter

from app.core.config import settings
from app.api import (
    auth,
    users,
    customers,
    quotes,
    shipments,
    tracking,
    logistics,
    driver,
    drivers,
    tasks,
    dispatch,
    warehouse,
    warehouses,
    inventory,
    containers,
    documents,
    finance,
    invoices,
    payments,
    customs,
    insurance,
    support,
    notifications,
    analytics,
    reports,
    admin,
)

api_router = APIRouter(prefix=settings.API_PREFIX)

for module in (
    auth,
    users,
    customers,
    quotes,
    shipments,
    tracking,
    logistics,
    driver,
    drivers,
    tasks,
    dispatch,
    warehouse,
    warehouses,
    inventory,
    containers,
    documents,
    finance,
    invoices,
    payments,
    customs,
    insurance,
    support,
    notifications,
    analytics,
    reports,
    admin,
):
    api_router.include_router(module.router)

__all__ = ["api_router"]
