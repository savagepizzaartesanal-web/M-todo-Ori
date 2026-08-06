from fastapi import APIRouter, Request

from app.schemas.payments import MercadoPagoWebhookResponse
from app.services.payment_service import process_mercado_pago_webhook

router = APIRouter(prefix="/api/webhooks", tags=["webhooks"])


@router.get("/mercadopago")
async def verify_mercado_pago_webhook_url():
    return {"status": "ok"}


@router.post("/mercadopago", response_model=MercadoPagoWebhookResponse)
async def receive_mercado_pago_webhook(request: Request):
    payload = await request.json()
    result = await process_mercado_pago_webhook(
        headers={key.lower(): value for key, value in request.headers.items()},
        query_params=dict(request.query_params),
        payload=payload,
    )
    return MercadoPagoWebhookResponse(**result)
