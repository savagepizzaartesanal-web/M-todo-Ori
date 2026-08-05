import hashlib
import hmac
import os
from decimal import Decimal, InvalidOperation
from typing import Any
from urllib.parse import urlparse

import httpx
from fastapi import HTTPException, status

MERCADO_PAGO_API_URL = "https://api.mercadopago.com"


def get_mercado_pago_access_token() -> str:
    token = os.getenv("MERCADO_PAGO_ACCESS_TOKEN")
    if not token:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Pagamentos indisponíveis no momento.",
        )
    return token


def get_mercado_pago_webhook_secret() -> str:
    secret = os.getenv("MERCADO_PAGO_WEBHOOK_SECRET")
    if not secret:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Webhook de pagamentos não configurado.",
        )
    return secret


def get_payment_urls() -> dict[str, str]:
    base_url = os.getenv("PUBLIC_API_BASE_URL", "").rstrip("/")
    success_url = os.getenv("PAYMENT_SUCCESS_URL")
    pending_url = os.getenv("PAYMENT_PENDING_URL")
    failure_url = os.getenv("PAYMENT_FAILURE_URL")

    if not base_url or not success_url or not pending_url or not failure_url:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Checkout indisponível no momento.",
        )

    urls = [base_url, success_url, pending_url, failure_url]
    for url in urls:
        parsed = urlparse(url)
        if parsed.scheme != "https" or parsed.hostname in {"localhost", "127.0.0.1"}:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="URLs de pagamento inválidas para checkout real.",
            )

    return {
        "notification_url": f"{base_url}/api/webhooks/mercadopago",
        "success": success_url,
        "pending": pending_url,
        "failure": failure_url,
    }


def cents_to_decimal(amount_cents: int) -> float:
    return float(Decimal(amount_cents) / Decimal(100))


def decimal_amount_to_cents(value: Any) -> int | None:
    try:
        return int((Decimal(str(value)) * Decimal(100)).quantize(Decimal("1")))
    except (InvalidOperation, TypeError, ValueError):
        return None


def parse_x_signature(x_signature: str) -> dict[str, str]:
    parts: dict[str, str] = {}
    for item in x_signature.split(","):
        key, _, value = item.strip().partition("=")
        if key and value:
            parts[key] = value
    return parts


def validate_mercado_pago_signature(
    *,
    x_signature: str | None,
    x_request_id: str | None,
    data_id: str | None,
    secret: str | None = None,
) -> bool:
    if not x_signature or not x_request_id or not data_id:
        return False

    signature_parts = parse_x_signature(x_signature)
    timestamp = signature_parts.get("ts")
    expected_hash = signature_parts.get("v1")

    if not timestamp or not expected_hash:
        return False

    manifest = f"id:{data_id};request-id:{x_request_id};ts:{timestamp};"
    calculated_hash = hmac.new(
        (secret or get_mercado_pago_webhook_secret()).encode(),
        msg=manifest.encode(),
        digestmod=hashlib.sha256,
    ).hexdigest()

    return hmac.compare_digest(calculated_hash, expected_hash)


class MercadoPagoClient:
    def __init__(self, *, access_token: str | None = None) -> None:
        self.access_token = access_token

    def get_headers(self) -> dict[str, str]:
        return {
            "Authorization": f"Bearer {self.access_token or get_mercado_pago_access_token()}",
            "Content-Type": "application/json",
        }

    async def create_preference(
        self,
        *,
        order: dict,
        product: dict,
    ) -> dict:
        payload = build_preference_payload(order=order, product=product)

        async with httpx.AsyncClient(timeout=12) as client:
            response = await client.post(
                f"{MERCADO_PAGO_API_URL}/checkout/preferences",
                json=payload,
                headers=self.get_headers(),
            )

        if response.status_code >= 400:
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail="Não foi possível criar o checkout agora.",
            )

        return response.json()

    async def get_payment(self, payment_id: str) -> dict:
        async with httpx.AsyncClient(timeout=10) as client:
            response = await client.get(
                f"{MERCADO_PAGO_API_URL}/v1/payments/{payment_id}",
                headers=self.get_headers(),
            )

        if response.status_code >= 400:
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail="Não foi possível confirmar o pagamento agora.",
            )

        return response.json()


def build_preference_payload(*, order: dict, product: dict) -> dict:
    urls = get_payment_urls()
    order_id = order["id"]
    back_urls = {
        key: f"{url}?order_id={order_id}"
        for key, url in (
            ("success", urls["success"]),
            ("pending", urls["pending"]),
            ("failure", urls["failure"]),
        )
    }
    payload = {
        "items": [
            {
                "id": product["product_code"],
                "title": product["name"],
                "quantity": 1,
                "unit_price": cents_to_decimal(product["amount_cents"]),
                "currency_id": product["currency"],
            }
        ],
        "external_reference": order["external_reference"],
        "notification_url": urls["notification_url"],
        "back_urls": back_urls,
        "auto_return": "approved",
        "payment_methods": {
            "excluded_payment_types": [
                {"id": "ticket"},
            ],
        },
        "metadata": {
            "order_id": order_id,
            "product_code": product["product_code"],
        },
    }
    return payload
