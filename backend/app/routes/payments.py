from fastapi import APIRouter, Depends

from app.schemas.auth import CurrentUser
from app.schemas.payments import (
    PaymentCheckoutRequest,
    PaymentCheckoutResponse,
    PaymentListResponse,
    PaymentStatusResponse,
)
from app.services.auth_service import get_current_user
from app.services.payment_service import (
    create_checkout,
    get_payment_status,
    list_my_payments,
)

router = APIRouter(prefix="/api/payments", tags=["payments"])


@router.post("/checkout", response_model=PaymentCheckoutResponse)
async def create_payment_checkout(
    payload: PaymentCheckoutRequest,
    current_user: CurrentUser = Depends(get_current_user),
):
    return await create_checkout(
        payload_product_code=payload.product_code,
        current_user=current_user,
    )


@router.get("/me", response_model=PaymentListResponse)
async def read_my_payments(current_user: CurrentUser = Depends(get_current_user)):
    return await list_my_payments(current_user=current_user)


@router.get("/{order_id}/status", response_model=PaymentStatusResponse)
async def read_payment_status(
    order_id: str,
    current_user: CurrentUser = Depends(get_current_user),
):
    return await get_payment_status(
        order_id=order_id,
        current_user=current_user,
    )
