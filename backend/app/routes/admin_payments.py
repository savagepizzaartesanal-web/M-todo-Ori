from fastapi import APIRouter, Depends

from app.schemas.auth import CurrentUser
from app.schemas.payments import (
    PaymentReconcileRequest,
    PaymentReconcileResponse,
    PaymentTimelineResponse,
)
from app.services.auth_service import get_current_user
from app.services.payment_service import get_payment_timeline, reconcile_payment_by_admin

router = APIRouter(prefix="/api/admin/payments", tags=["admin"])


@router.post("/reconcile", response_model=PaymentReconcileResponse)
async def reconcile_payment(
    payload: PaymentReconcileRequest,
    current_user: CurrentUser = Depends(get_current_user),
):
    return await reconcile_payment_by_admin(
        payment_id=payload.payment_id,
        current_user=current_user,
    )


@router.get("/{order_id}/timeline", response_model=PaymentTimelineResponse)
async def get_payment_order_timeline(
    order_id: str,
    current_user: CurrentUser = Depends(get_current_user),
):
    return await get_payment_timeline(
        order_id=order_id,
        current_user=current_user,
    )
