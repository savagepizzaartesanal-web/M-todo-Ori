import os
import logging
from typing import Any

import httpx
from fastapi import HTTPException, status

CLIENTES_TABLE = "clientes"
PAYMENT_PRODUCTS_TABLE = "payment_products"
PAYMENT_ORDERS_TABLE = "payment_orders"
PAYMENT_WEBHOOK_EVENTS_TABLE = "payment_webhook_events"
ADMIN_EVENTS_TABLE = "admin_cliente_eventos"

logger = logging.getLogger(__name__)


def get_supabase_url() -> str:
    supabase_url = os.getenv("SUPABASE_URL")
    if not supabase_url:
        try:
            raise RuntimeError("Supabase admin URL is not configured")
        except RuntimeError:
            logger.exception("Payment Supabase admin URL configuration is missing.")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Pagamentos indisponíveis no momento.",
        )
    return supabase_url.rstrip("/")


def get_supabase_secret_key() -> str:
    secret_key = os.getenv("SUPABASE_SECRET_KEY")
    if not secret_key:
        try:
            raise RuntimeError("Supabase admin secret is not configured")
        except RuntimeError:
            logger.exception(
                "Payment Supabase admin secret configuration is missing."
            )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Pagamentos indisponíveis no momento.",
        )
    return secret_key


def get_supabase_admin_headers(*, prefer: str | None = None) -> dict[str, str]:
    secret_key = get_supabase_secret_key()
    headers = {
        "apikey": secret_key,
        "Authorization": f"Bearer {secret_key}",
        "Content-Type": "application/json",
    }
    if prefer:
        headers["Prefer"] = prefer
    return headers


class SupabaseAdminRepository:
    def __init__(self) -> None:
        self.supabase_url = get_supabase_url()

    async def _request(
        self,
        method: str,
        table: str,
        *,
        params: dict[str, str] | None = None,
        json: Any = None,
        prefer: str | None = None,
        timeout: int = 10,
    ) -> httpx.Response:
        async with httpx.AsyncClient(timeout=timeout) as client:
            return await client.request(
                method,
                f"{self.supabase_url}/rest/v1/{table}",
                params=params,
                json=json,
                headers=get_supabase_admin_headers(prefer=prefer),
            )

    async def fetch_current_cliente(self, *, user_id: str, email: str | None) -> dict | None:
        select = (
            "id,user_id,email,resultado,status_jornada,produto_1_liberado,"
            "produto_1_completo_liberado,produto_2_liberado,produto_3_liberado"
        )
        response = await self._request(
            "GET",
            CLIENTES_TABLE,
            params={"select": select, "user_id": f"eq.{user_id}", "limit": "1"},
        )

        if response.status_code >= 400:
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail="Não foi possível carregar a cliente.",
            )

        rows = response.json()
        if rows or not email:
            return rows[0] if rows else None

        response = await self._request(
            "GET",
            CLIENTES_TABLE,
            params={"select": select, "email": f"eq.{email}", "limit": "1"},
        )

        if response.status_code >= 400:
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail="Não foi possível carregar a cliente.",
            )

        rows = response.json()
        return rows[0] if rows else None

    async def fetch_cliente_by_id(self, cliente_id: str) -> dict | None:
        response = await self._request(
            "GET",
            CLIENTES_TABLE,
            params={
                "select": (
                    "id,user_id,email,resultado,status_jornada,"
                    "produto_1_completo_liberado,produto_2_liberado,produto_3_liberado"
                ),
                "id": f"eq.{cliente_id}",
                "limit": "1",
            },
        )
        if response.status_code >= 400:
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail="Não foi possível carregar a cliente.",
            )
        rows = response.json()
        return rows[0] if rows else None

    async def fetch_product(self, product_code: str) -> dict | None:
        response = await self._request(
            "GET",
            PAYMENT_PRODUCTS_TABLE,
            params={
                "select": "product_code,name,grants_product,provider,active,amount_cents,currency",
                "product_code": f"eq.{product_code}",
                "limit": "1",
            },
        )
        if response.status_code >= 400:
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail="Não foi possível carregar o produto.",
            )
        rows = response.json()
        return rows[0] if rows else None

    async def list_payment_products(self) -> list[dict]:
        response = await self._request(
            "GET",
            PAYMENT_PRODUCTS_TABLE,
            params={
                "select": "product_code,name,grants_product,active,amount_cents,currency",
                "order": "product_code.asc",
            },
        )
        if response.status_code >= 400:
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail="Não foi possível carregar o catálogo de pagamentos.",
            )
        return response.json()

    async def fetch_approved_order(self, *, cliente_id: str, product_code: str) -> dict | None:
        response = await self._request(
            "GET",
            PAYMENT_ORDERS_TABLE,
            params={
                "select": "*",
                "cliente_id": f"eq.{cliente_id}",
                "product_code": f"eq.{product_code}",
                "status": "eq.approved",
                "limit": "1",
            },
        )
        if response.status_code >= 400:
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail="Não foi possível consultar pedidos.",
            )
        rows = response.json()
        return rows[0] if rows else None

    async def fetch_open_order(self, *, cliente_id: str, product_code: str) -> dict | None:
        response = await self._request(
            "GET",
            PAYMENT_ORDERS_TABLE,
            params={
                "select": "*",
                "cliente_id": f"eq.{cliente_id}",
                "product_code": f"eq.{product_code}",
                "status": "in.(created,pending)",
                "checkout_url": "not.is.null",
                "order": "created_at.desc",
                "limit": "1",
            },
        )
        if response.status_code >= 400:
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail="Não foi possível consultar pedidos.",
            )
        rows = response.json()
        return rows[0] if rows else None

    async def create_order(self, payload: dict) -> dict:
        response = await self._request(
            "POST",
            PAYMENT_ORDERS_TABLE,
            json=payload,
            prefer="return=representation",
        )
        if response.status_code >= 400:
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail="Não foi possível criar o pedido.",
            )
        rows = response.json()
        if not rows:
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail="Pedido não confirmado.",
            )
        return rows[0]

    async def update_order(self, order_id: str, payload: dict) -> dict:
        response = await self._request(
            "PATCH",
            PAYMENT_ORDERS_TABLE,
            params={"id": f"eq.{order_id}"},
            json=payload,
            prefer="return=representation",
        )
        if response.status_code >= 400:
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail="Não foi possível atualizar o pedido.",
            )
        rows = response.json()
        return rows[0] if rows else {}

    async def fetch_order_by_id(self, order_id: str) -> dict | None:
        response = await self._request(
            "GET",
            PAYMENT_ORDERS_TABLE,
            params={"select": "*", "id": f"eq.{order_id}", "limit": "1"},
        )
        if response.status_code >= 400:
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail="Não foi possível consultar o pedido.",
            )
        rows = response.json()
        return rows[0] if rows else None

    async def fetch_order_by_external_reference(
        self, external_reference: str
    ) -> dict | None:
        response = await self._request(
            "GET",
            PAYMENT_ORDERS_TABLE,
            params={
                "select": "*",
                "external_reference": f"eq.{external_reference}",
                "limit": "1",
            },
        )
        if response.status_code >= 400:
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail="Não foi possível consultar o pedido.",
            )
        rows = response.json()
        return rows[0] if rows else None

    async def list_orders_for_user(self, user_id: str, *, limit: int = 20) -> list[dict]:
        response = await self._request(
            "GET",
            PAYMENT_ORDERS_TABLE,
            params={
                "select": "*",
                "user_id": f"eq.{user_id}",
                "order": "created_at.desc",
                "limit": str(limit),
            },
        )
        if response.status_code >= 400:
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail="Não foi possível listar pedidos.",
            )
        return response.json()

    async def fetch_webhook_event(
        self, *, provider: str, provider_event_id: str
    ) -> dict | None:
        response = await self._request(
            "GET",
            PAYMENT_WEBHOOK_EVENTS_TABLE,
            params={
                "select": "*",
                "provider": f"eq.{provider}",
                "provider_event_id": f"eq.{provider_event_id}",
                "limit": "1",
            },
        )
        if response.status_code >= 400:
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail="Não foi possível consultar evento de pagamento.",
            )
        rows = response.json()
        return rows[0] if rows else None

    async def create_webhook_event(self, payload: dict) -> dict:
        response = await self._request(
            "POST",
            PAYMENT_WEBHOOK_EVENTS_TABLE,
            json=payload,
            prefer="return=representation",
        )
        if response.status_code == 409:
            existing = await self.fetch_webhook_event(
                provider=payload["provider"],
                provider_event_id=payload["provider_event_id"],
            )
            return existing or {}
        if response.status_code >= 400:
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail="Não foi possível registrar evento de pagamento.",
            )
        rows = response.json()
        return rows[0] if rows else {}

    async def update_webhook_event(self, event_id: str, payload: dict) -> dict:
        response = await self._request(
            "PATCH",
            PAYMENT_WEBHOOK_EVENTS_TABLE,
            params={"id": f"eq.{event_id}"},
            json=payload,
            prefer="return=representation",
        )
        if response.status_code >= 400:
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail="Não foi possível atualizar evento de pagamento.",
            )
        rows = response.json()
        return rows[0] if rows else {}

    async def grant_entitlement(self, *, cliente_id: str, entitlement_key: str) -> dict:
        response = await self._request(
            "PATCH",
            CLIENTES_TABLE,
            params={"id": f"eq.{cliente_id}"},
            json={entitlement_key: True},
            prefer="return=representation",
        )
        if response.status_code >= 400:
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail="Não foi possível liberar o acesso.",
            )
        rows = response.json()
        return rows[0] if rows else {}

    async def list_webhook_events_for_order(self, payment_order_id: str) -> list[dict]:
        """OBS-3 — leitura estritamente read-only (GET) dos eventos de
        webhook ligados a uma payment_order, para a timeline administrativa.
        Seleção restrita a colunas mínimas: nunca traz payload_sanitized nem
        qualquer outro campo sensível/arbitrário."""
        response = await self._request(
            "GET",
            PAYMENT_WEBHOOK_EVENTS_TABLE,
            params={
                "select": "id,created_at,processed_at,payment_order_id",
                "payment_order_id": f"eq.{payment_order_id}",
                "order": "created_at.asc",
            },
        )
        if response.status_code >= 400:
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail="Não foi possível consultar eventos de pagamento.",
            )
        return response.json()

    async def create_admin_event(self, payload: dict) -> dict:
        response = await self._request(
            "POST",
            ADMIN_EVENTS_TABLE,
            json=payload,
            prefer="return=representation",
        )
        if response.status_code >= 400:
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail="Não foi possível registrar o histórico administrativo.",
            )
        rows = response.json()
        return rows[0] if rows else {}

    async def update_admin_event(self, event_id: str, payload: dict) -> dict:
        response = await self._request(
            "PATCH",
            ADMIN_EVENTS_TABLE,
            params={"id": f"eq.{event_id}"},
            json=payload,
            prefer="return=representation",
        )
        if response.status_code >= 400:
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail="Não foi possível atualizar o histórico administrativo.",
            )
        rows = response.json()
        return rows[0] if rows else {}
