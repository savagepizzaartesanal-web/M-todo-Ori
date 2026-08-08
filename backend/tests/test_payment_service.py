import hashlib
import hmac
import os
import unittest
from unittest.mock import patch

import httpx
from fastapi import FastAPI, HTTPException

from app.routes.webhooks import router as webhooks_router
from app.schemas.auth import CurrentUser
from app.services.auth_service import get_current_user
from app.services.mercado_pago_service import (
    MercadoPagoClient,
    build_preference_payload,
    validate_mercado_pago_signature,
)
from app.services.payment_service import (
    create_checkout,
    get_payment_catalog,
    get_payment_status,
    map_mercado_pago_status,
    process_mercado_pago_webhook,
    reconcile_payment_by_admin,
)
from app.schemas.payments import PaymentReconcileRequest


SECRET = "webhook-secret"
ALL_CHECKOUT_PRODUCTS = "produto_1_completo,produto_2,produto_3"


class MercadoPagoWebhookRouteTest(unittest.IsolatedAsyncioTestCase):
    def setUp(self):
        app = FastAPI()
        app.include_router(webhooks_router)
        self.transport = httpx.ASGITransport(app=app)

    async def test_webhook_get_health_returns_ok_without_secrets(self):
        async with httpx.AsyncClient(
            transport=self.transport,
            base_url="http://testserver",
        ) as client:
            response = await client.get("/api/webhooks/mercadopago")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), {"status": "ok"})

        body = response.text.lower()
        self.assertNotIn("secret", body)
        self.assertNotIn("token", body)
        self.assertNotIn("signature", body)
        self.assertNotIn("mercado_pago", body)
        self.assertNotIn("supabase", body)

    async def test_webhook_post_still_requires_signature(self):
        with patch.dict(
            os.environ,
            {
                "MERCADO_PAGO_WEBHOOK_SECRET": SECRET,
                "SUPABASE_URL": "https://supabase.example.test",
                "SUPABASE_SECRET_KEY": "test-service-role-key",
            },
        ):
            async with httpx.AsyncClient(
                transport=self.transport,
                base_url="http://testserver",
            ) as client:
                response = await client.post("/api/webhooks/mercadopago", json={})

        self.assertEqual(response.status_code, 401)


def signed_headers(data_id: str, request_id: str = "req-1") -> dict[str, str]:
    timestamp = "1704908010"
    manifest = f"id:{data_id};request-id:{request_id};ts:{timestamp};"
    signature = hmac.new(
        SECRET.encode(),
        msg=manifest.encode(),
        digestmod=hashlib.sha256,
    ).hexdigest()
    return {
        "x-signature": f"ts={timestamp},v1={signature}",
        "x-request-id": request_id,
    }


class FakeMercadoPago:
    def __init__(self, *, payment: dict | None = None, not_found: bool = False) -> None:
        self.payment = payment or {}
        self.preferences = []
        self.not_found = not_found

    async def create_preference(self, *, order: dict, product: dict) -> dict:
        self.preferences.append({"order": order, "product": product})
        return {
            "id": "pref-1",
            "init_point": "https://checkout.mercadopago.com/pref-1",
        }

    async def get_payment(self, payment_id: str) -> dict:
        return {**self.payment, "id": self.payment.get("id", payment_id)}

    async def get_payment_for_reconciliation(self, payment_id: str) -> dict:
        if self.not_found:
            raise HTTPException(
                status_code=404,
                detail="Pagamento não encontrado no Mercado Pago.",
            )
        return await self.get_payment(payment_id)


class FailingMercadoPago:
    async def get_payment(self, payment_id: str) -> dict:
        raise HTTPException(status_code=502, detail="provider unavailable")

    async def get_payment_for_reconciliation(self, payment_id: str) -> dict:
        raise HTTPException(status_code=502, detail="provider unavailable")


class NonCallingMercadoPago:
    def __init__(self) -> None:
        self.called = False

    async def get_payment(self, payment_id: str) -> dict:
        self.called = True
        raise AssertionError("Payment provider should not be called")

    async def get_payment_for_reconciliation(self, payment_id: str) -> dict:
        self.called = True
        raise AssertionError("Payment provider should not be called")


class FakeRepository:
    def __init__(self) -> None:
        self.clientes = {
            "cliente-1": {
                "id": "cliente-1",
                "user_id": "user-1",
                "email": "cliente@example.com",
                "resultado": "Selvagem Intuitiva",
                "status_jornada": "Código das Deusas concluído",
                "produto_1_completo_liberado": False,
                "produto_2_liberado": False,
                "produto_3_liberado": False,
            },
            "cliente-2": {
                "id": "cliente-2",
                "user_id": "user-2",
                "email": "outra@example.com",
                "resultado": "Musa Enigmática",
                "status_jornada": "Código das Deusas concluído",
                "produto_1_completo_liberado": False,
                "produto_2_liberado": False,
                "produto_3_liberado": False,
            },
        }
        self.products = {
            "produto_1_completo": {
                "product_code": "produto_1_completo",
                "name": "Codigo das Deusas - leitura completa",
                "grants_product": "produto_1_completo_liberado",
                "active": True,
                "amount_cents": 9900,
                "currency": "BRL",
            },
            "produto_2": {
                "product_code": "produto_2",
                "name": "Dossie ORI",
                "grants_product": "produto_2_liberado",
                "active": True,
                "amount_cents": 19900,
                "currency": "BRL",
            },
            "produto_3": {
                "product_code": "produto_3",
                "name": "Codigo Final",
                "grants_product": "produto_3_liberado",
                "active": True,
                "amount_cents": 29900,
                "currency": "BRL",
            },
        }
        self.orders = {}
        self.webhook_events = {}
        self.admin_events = []
        self.next_order_id = 1
        self.next_event_id = 1
        self.next_admin_event_id = 1
        self.fail_create_admin_event = False
        self.fail_update_order = False
        self.fail_update_admin_event = False
        self.fail_grant_entitlement = False

    async def fetch_current_cliente(self, *, user_id: str, email: str | None):
        for cliente in self.clientes.values():
            if cliente["user_id"] == user_id or cliente["email"] == email:
                return cliente
        return None

    async def fetch_cliente_by_id(self, cliente_id: str):
        return self.clientes.get(cliente_id)

    async def fetch_product(self, product_code: str):
        return self.products.get(product_code)

    async def list_payment_products(self):
        return list(self.products.values())

    async def fetch_approved_order(self, *, cliente_id: str, product_code: str):
        for order in self.orders.values():
            if (
                order["cliente_id"] == cliente_id
                and order["product_code"] == product_code
                and order["status"] == "approved"
            ):
                return order
        return None

    async def fetch_open_order(self, *, cliente_id: str, product_code: str):
        for order in self.orders.values():
            if (
                order["cliente_id"] == cliente_id
                and order["product_code"] == product_code
                and order["status"] in {"created", "pending"}
                and order.get("checkout_url")
            ):
                return order
        return None

    async def create_order(self, payload: dict):
        order = {
            **payload,
            "id": f"order-{self.next_order_id}",
            "created_at": "2026-08-05T12:00:00+00:00",
            "approved_at": None,
        }
        self.next_order_id += 1
        self.orders[order["id"]] = order
        return order

    async def update_order(self, order_id: str, payload: dict):
        if self.fail_update_order:
            raise HTTPException(status_code=502, detail="update_order failed")
        self.orders[order_id].update(payload)
        return self.orders[order_id]

    async def fetch_order_by_id(self, order_id: str):
        return self.orders.get(order_id)

    async def fetch_order_by_external_reference(self, external_reference: str):
        for order in self.orders.values():
            if order["external_reference"] == external_reference:
                return order
        return None

    async def list_orders_for_user(self, user_id: str, *, limit: int = 20):
        return [order for order in self.orders.values() if order["user_id"] == user_id][
            :limit
        ]

    async def fetch_webhook_event(self, *, provider: str, provider_event_id: str):
        return self.webhook_events.get((provider, provider_event_id))

    async def create_webhook_event(self, payload: dict):
        key = (payload["provider"], payload["provider_event_id"])
        if key in self.webhook_events:
            return self.webhook_events[key]
        event = {**payload, "id": f"event-{self.next_event_id}", "processed": False}
        self.next_event_id += 1
        self.webhook_events[key] = event
        return event

    async def update_webhook_event(self, event_id: str, payload: dict):
        for event in self.webhook_events.values():
            if event["id"] == event_id:
                event.update(payload)
                return event
        return {}

    async def grant_entitlement(self, *, cliente_id: str, entitlement_key: str):
        if self.fail_grant_entitlement:
            raise HTTPException(status_code=502, detail="grant_entitlement failed")
        self.clientes[cliente_id][entitlement_key] = True
        return self.clientes[cliente_id]

    async def create_admin_event(self, payload: dict):
        if self.fail_create_admin_event:
            raise HTTPException(status_code=502, detail="create_admin_event failed")
        event = {**payload, "id": f"admin-event-{self.next_admin_event_id}"}
        self.next_admin_event_id += 1
        self.admin_events.append(event)
        return event

    async def update_admin_event(self, event_id: str, payload: dict):
        if self.fail_update_admin_event:
            raise HTTPException(status_code=502, detail="update_admin_event failed")
        for event in self.admin_events:
            if event["id"] == event_id:
                event.update(payload)
                return event
        return {}


class PaymentRouteTest(unittest.TestCase):
    def test_checkout_requires_authentication(self):
        with self.assertRaises(HTTPException) as error:
            import asyncio

            asyncio.run(get_current_user(credentials=None))

        self.assertEqual(error.exception.status_code, 401)


class MercadoPagoSignatureTest(unittest.TestCase):
    def test_signature_valid(self):
        headers = signed_headers("pay-1")

        self.assertTrue(
            validate_mercado_pago_signature(
                x_signature=headers["x-signature"],
                x_request_id=headers["x-request-id"],
                data_id="pay-1",
                secret=SECRET,
            )
        )

    def test_signature_invalid(self):
        headers = signed_headers("pay-1")

        self.assertFalse(
            validate_mercado_pago_signature(
                x_signature=headers["x-signature"],
                x_request_id=headers["x-request-id"],
                data_id="pay-2",
                secret=SECRET,
            )
        )

    def test_signature_rejects_missing_x_signature(self):
        self.assertFalse(
            validate_mercado_pago_signature(
                x_signature=None,
                x_request_id="req-1",
                data_id="pay-1",
                secret=SECRET,
            )
        )

    def test_signature_rejects_missing_x_request_id(self):
        headers = signed_headers("pay-1")

        self.assertFalse(
            validate_mercado_pago_signature(
                x_signature=headers["x-signature"],
                x_request_id=None,
                data_id="pay-1",
                secret=SECRET,
            )
        )

    def test_signature_rejects_missing_data_id(self):
        headers = signed_headers("pay-1")

        self.assertFalse(
            validate_mercado_pago_signature(
                x_signature=headers["x-signature"],
                x_request_id=headers["x-request-id"],
                data_id=None,
                secret=SECRET,
            )
        )

    def test_signature_rejects_missing_ts(self):
        self.assertFalse(
            validate_mercado_pago_signature(
                x_signature="v1=abc",
                x_request_id="req-1",
                data_id="pay-1",
                secret=SECRET,
            )
        )

    def test_signature_rejects_missing_v1(self):
        self.assertFalse(
            validate_mercado_pago_signature(
                x_signature="ts=1704908010",
                x_request_id="req-1",
                data_id="pay-1",
                secret=SECRET,
            )
        )

    def test_signature_accepts_different_component_order(self):
        headers = signed_headers("pay-1")
        timestamp, signature = headers["x-signature"].split(",")

        self.assertTrue(
            validate_mercado_pago_signature(
                x_signature=f"{signature},{timestamp}",
                x_request_id=headers["x-request-id"],
                data_id="pay-1",
                secret=SECRET,
            )
        )

    def test_signature_accepts_additional_components(self):
        headers = signed_headers("pay-1")

        self.assertTrue(
            validate_mercado_pago_signature(
                x_signature=f"foo=bar,{headers['x-signature']}",
                x_request_id=headers["x-request-id"],
                data_id="pay-1",
                secret=SECRET,
            )
        )

    def test_signature_rejects_malformed_header(self):
        self.assertFalse(
            validate_mercado_pago_signature(
                x_signature="malformed",
                x_request_id="req-1",
                data_id="pay-1",
                secret=SECRET,
            )
        )


class MercadoPagoPreferenceTest(unittest.TestCase):
    def test_preference_excludes_ticket_without_excluding_pix_or_card(self):
        with patch.dict(
            "os.environ",
            {
                "PUBLIC_API_BASE_URL": "https://api.example.com",
                "PAYMENT_SUCCESS_URL": "https://app.example.com/sucesso",
                "PAYMENT_PENDING_URL": "https://app.example.com/pendente",
                "PAYMENT_FAILURE_URL": "https://app.example.com/falha",
            },
        ):
            payload = build_preference_payload(
                order={
                    "id": "order-1",
                    "external_reference": "ref-1",
                },
                product={
                    "product_code": "produto_1_completo",
                    "name": "Codigo das Deusas - leitura completa",
                    "amount_cents": 9900,
                    "currency": "BRL",
                },
            )

        self.assertEqual(payload["items"][0]["id"], "produto_1_completo")
        self.assertEqual(payload["items"][0]["quantity"], 1)
        self.assertEqual(payload["items"][0]["currency_id"], "BRL")
        self.assertEqual(payload["external_reference"], "ref-1")
        self.assertEqual(
            payload["notification_url"],
            "https://api.example.com/api/webhooks/mercadopago",
        )
        self.assertEqual(payload["auto_return"], "approved")
        excluded_types = payload["payment_methods"]["excluded_payment_types"]
        self.assertEqual(excluded_types, [{"id": "ticket"}])
        self.assertNotIn({"id": "pix"}, excluded_types)
        self.assertNotIn({"id": "credit_card"}, excluded_types)

    def test_preference_rejects_localhost_urls_for_real_checkout(self):
        with patch.dict(
            "os.environ",
            {
                "PUBLIC_API_BASE_URL": "http://localhost:8000",
                "PAYMENT_SUCCESS_URL": "https://app.example.com/sucesso",
                "PAYMENT_PENDING_URL": "https://app.example.com/pendente",
                "PAYMENT_FAILURE_URL": "https://app.example.com/falha",
            },
        ):
            with self.assertRaises(HTTPException) as error:
                build_preference_payload(
                    order={"id": "order-1", "external_reference": "ref-1"},
                    product={
                        "product_code": "produto_1_completo",
                        "name": "Codigo das Deusas - leitura completa",
                        "amount_cents": 9900,
                        "currency": "BRL",
                    },
                )

        self.assertEqual(error.exception.status_code, 500)


class MercadoPagoStatusMappingTest(unittest.TestCase):
    def test_known_statuses_map_to_internal_statuses(self):
        self.assertEqual(map_mercado_pago_status("approved"), "approved")
        self.assertEqual(map_mercado_pago_status("pending"), "pending")
        self.assertEqual(map_mercado_pago_status("in_process"), "pending")
        self.assertEqual(map_mercado_pago_status("authorized"), "pending")
        self.assertEqual(map_mercado_pago_status("rejected"), "rejected")
        self.assertEqual(map_mercado_pago_status("cancelled"), "cancelled")
        self.assertEqual(map_mercado_pago_status("refunded"), "refunded")
        self.assertEqual(map_mercado_pago_status("charged_back"), "refunded")
        self.assertEqual(map_mercado_pago_status("unexpected"), "error")


class PaymentServiceTest(unittest.IsolatedAsyncioTestCase):
    def setUp(self):
        self.repo = FakeRepository()
        self.user = CurrentUser(
            user_id="user-1",
            email="cliente@example.com",
            access_token="token",
        )

    async def test_checkout_rejects_unknown_product(self):
        with self.assertRaises(HTTPException) as error:
            await create_checkout(
                payload_product_code="inexistente",
                current_user=self.user,
                repository=self.repo,
                mercado_pago=FakeMercadoPago(),
            )

        self.assertEqual(error.exception.status_code, 404)

    async def test_checkout_rejects_inactive_product(self):
        self.repo.products["produto_1_completo"]["active"] = False

        with self.assertRaises(HTTPException) as error:
            await create_checkout(
                payload_product_code="produto_1_completo",
                current_user=self.user,
                repository=self.repo,
                mercado_pago=FakeMercadoPago(),
            )

        self.assertEqual(error.exception.status_code, 409)

    async def test_checkout_rejects_product_without_price(self):
        self.repo.products["produto_1_completo"]["amount_cents"] = None

        with self.assertRaises(HTTPException) as error:
            await create_checkout(
                payload_product_code="produto_1_completo",
                current_user=self.user,
                repository=self.repo,
                mercado_pago=FakeMercadoPago(),
            )

        self.assertEqual(error.exception.status_code, 409)

    async def test_checkout_rejects_invalid_currency(self):
        self.repo.products["produto_1_completo"]["currency"] = "USD"

        with self.assertRaises(HTTPException) as error:
            await create_checkout(
                payload_product_code="produto_1_completo",
                current_user=self.user,
                repository=self.repo,
                mercado_pago=FakeMercadoPago(),
            )

        self.assertEqual(error.exception.status_code, 409)

    async def test_catalog_does_not_return_grants_product_or_secrets(self):
        catalog = await get_payment_catalog(
            current_user=self.user,
            repository=self.repo,
        )
        serialized = catalog.model_dump()

        self.assertNotIn("grants_product", str(serialized))
        self.assertNotIn("secret", str(serialized).lower())
        self.assertNotIn("token", str(serialized).lower())

    async def test_catalog_returns_inactive_product_as_inactive(self):
        self.repo.products["produto_1_completo"]["active"] = False

        catalog = await get_payment_catalog(
            current_user=self.user,
            repository=self.repo,
        )
        product = catalog.products[0]

        self.assertEqual(product.product_code, "produto_1_completo")
        self.assertFalse(product.active)
        self.assertTrue(product.eligible)

    async def test_catalog_returns_product_without_price_as_inactive(self):
        self.repo.products["produto_1_completo"]["amount_cents"] = None

        catalog = await get_payment_catalog(
            current_user=self.user,
            repository=self.repo,
        )
        product = catalog.products[0]

        self.assertFalse(product.active)
        self.assertIsNone(product.amount_cents)
        self.assertTrue(product.eligible)

    async def test_catalog_returns_already_unlocked(self):
        self.repo.clientes["cliente-1"]["produto_1_completo_liberado"] = True

        catalog = await get_payment_catalog(
            current_user=self.user,
            repository=self.repo,
        )
        product = catalog.products[0]

        self.assertTrue(product.already_unlocked)
        self.assertFalse(product.eligible)
        self.assertEqual(product.blocking_reason, "already_unlocked")

    async def test_catalog_product1_requires_result_for_eligibility(self):
        self.repo.clientes["cliente-1"]["resultado"] = None

        catalog = await get_payment_catalog(
            current_user=self.user,
            repository=self.repo,
        )
        product = catalog.products[0]

        self.assertFalse(product.eligible)
        self.assertEqual(product.blocking_reason, "produto_1_result_required")

    async def test_catalog_product1_with_result_is_eligible(self):
        catalog = await get_payment_catalog(
            current_user=self.user,
            repository=self.repo,
        )
        product = catalog.products[0]

        self.assertTrue(product.eligible)
        self.assertFalse(product.already_unlocked)
        self.assertIsNone(product.blocking_reason)

    async def test_catalog_disables_product2_and_product3_checkout_by_default(self):
        catalog = await get_payment_catalog(
            current_user=self.user,
            repository=self.repo,
        )
        products = {product.product_code: product for product in catalog.products}

        self.assertTrue(products["produto_1_completo"].active)
        self.assertFalse(products["produto_2"].active)
        self.assertFalse(products["produto_2"].eligible)
        self.assertEqual(products["produto_2"].blocking_reason, "checkout_not_enabled")
        self.assertFalse(products["produto_3"].active)
        self.assertFalse(products["produto_3"].eligible)
        self.assertEqual(products["produto_3"].blocking_reason, "checkout_not_enabled")

    async def test_checkout_rejects_already_granted_product_without_charge(self):
        self.repo.clientes["cliente-1"]["produto_1_completo_liberado"] = True
        mercado_pago = FakeMercadoPago()

        response = await create_checkout(
            payload_product_code="produto_1_completo",
            current_user=self.user,
            repository=self.repo,
            mercado_pago=mercado_pago,
        )

        self.assertEqual(response.status, "already_granted")
        self.assertIsNone(response.checkout_url)
        self.assertEqual(mercado_pago.preferences, [])

    async def test_product1_complete_allows_result_without_full_completion(self):
        self.repo.clientes["cliente-1"]["status_jornada"] = "Código das Deusas em andamento"

        response = await create_checkout(
            payload_product_code="produto_1_completo",
            current_user=self.user,
            repository=self.repo,
            mercado_pago=FakeMercadoPago(),
        )

        self.assertEqual(response.status, "pending")

    async def test_product1_complete_rejects_cliente_without_result(self):
        self.repo.clientes["cliente-1"]["resultado"] = None

        with self.assertRaises(HTTPException) as error:
            await create_checkout(
                payload_product_code="produto_1_completo",
                current_user=self.user,
                repository=self.repo,
                mercado_pago=FakeMercadoPago(),
            )

        self.assertEqual(error.exception.status_code, 409)

    async def test_product2_checkout_is_disabled_by_default_for_rc1(self):
        with self.assertRaises(HTTPException) as error:
            await create_checkout(
                payload_product_code="produto_2",
                current_user=self.user,
                repository=self.repo,
                mercado_pago=FakeMercadoPago(),
            )

        self.assertEqual(error.exception.status_code, 409)
        self.assertEqual(error.exception.detail, "Produto em preparação para checkout.")

    async def test_product2_requires_product1_completion_when_checkout_enabled(self):
        self.repo.clientes["cliente-1"]["status_jornada"] = "Código das Deusas em andamento"

        with patch.dict(
            os.environ,
            {"PAYMENT_CHECKOUT_PRODUCT_CODES": ALL_CHECKOUT_PRODUCTS},
        ):
            with self.assertRaises(HTTPException) as error:
                await create_checkout(
                    payload_product_code="produto_2",
                    current_user=self.user,
                    repository=self.repo,
                    mercado_pago=FakeMercadoPago(),
                )

        self.assertEqual(error.exception.status_code, 409)

    async def test_product3_requires_product2_publication_when_checkout_enabled(self):
        with patch.dict(
            os.environ,
            {"PAYMENT_CHECKOUT_PRODUCT_CODES": ALL_CHECKOUT_PRODUCTS},
        ):
            with self.assertRaises(HTTPException) as error:
                await create_checkout(
                    payload_product_code="produto_3",
                    current_user=self.user,
                    repository=self.repo,
                    mercado_pago=FakeMercadoPago(),
                )

        self.assertEqual(error.exception.status_code, 409)

    async def test_checkout_creates_order_and_preference(self):
        mercado_pago = FakeMercadoPago()

        response = await create_checkout(
            payload_product_code="produto_1_completo",
            current_user=self.user,
            repository=self.repo,
            mercado_pago=mercado_pago,
        )

        self.assertEqual(response.order_id, "order-1")
        self.assertEqual(response.status, "pending")
        self.assertEqual(response.checkout_url, "https://checkout.mercadopago.com/pref-1")
        self.assertEqual(len(mercado_pago.preferences), 1)

    async def test_status_belongs_to_current_user(self):
        await self.repo.create_order(
            {
                "cliente_id": "cliente-1",
                "user_id": "user-1",
                "email": "cliente@example.com",
                "product_code": "produto_1_completo",
                "grants_product": "produto_1_completo_liberado",
                "provider": "mercado_pago",
                "status": "pending",
                "external_reference": "ref-1",
                "amount_cents": 9900,
                "currency": "BRL",
            }
        )

        response = await get_payment_status(
            order_id="order-1",
            current_user=self.user,
            repository=self.repo,
        )

        self.assertEqual(response.order_id, "order-1")
        self.assertFalse(response.entitlement_granted)

    async def test_status_rejects_other_user_order(self):
        await self.repo.create_order(
            {
                "cliente_id": "cliente-2",
                "user_id": "user-2",
                "email": "outra@example.com",
                "product_code": "produto_1_completo",
                "grants_product": "produto_1_completo_liberado",
                "provider": "mercado_pago",
                "status": "pending",
                "external_reference": "ref-1",
                "amount_cents": 9900,
                "currency": "BRL",
            }
        )

        with self.assertRaises(HTTPException) as error:
            await get_payment_status(
                order_id="order-1",
                current_user=self.user,
                repository=self.repo,
            )

        self.assertEqual(error.exception.status_code, 403)

    async def create_pending_order(self, product_code: str = "produto_1_completo"):
        product = self.repo.products[product_code]
        return await self.repo.create_order(
            {
                "cliente_id": "cliente-1",
                "user_id": "user-1",
                "email": "cliente@example.com",
                "product_code": product_code,
                "grants_product": product["grants_product"],
                "provider": "mercado_pago",
                "status": "pending",
                "external_reference": f"ref-{product_code}",
                "amount_cents": product["amount_cents"],
                "currency": product["currency"],
            }
        )

    async def process_payment_webhook(self, order: dict, payment: dict, request_id: str = "req-1"):
        payment_id = str(payment.get("id", "pay-1"))
        with patch.dict("os.environ", {"MERCADO_PAGO_WEBHOOK_SECRET": SECRET}):
            return await process_mercado_pago_webhook(
                headers=signed_headers(payment_id, request_id=request_id),
                query_params={"data.id": payment_id},
                payload={
                    "id": f"event-{request_id}",
                    "type": "payment",
                    "action": "payment.updated",
                    "data": {"id": payment_id},
                },
                repository=self.repo,
                mercado_pago=FakeMercadoPago(payment=payment),
            )

    async def test_webhook_rejects_invalid_signature(self):
        with patch.dict("os.environ", {"MERCADO_PAGO_WEBHOOK_SECRET": SECRET}):
            with self.assertRaises(HTTPException) as error:
                await process_mercado_pago_webhook(
                    headers={"x-signature": "ts=1,v1=bad", "x-request-id": "req-1"},
                    query_params={"data.id": "pay-1"},
                    payload={"id": "event-1", "data": {"id": "pay-1"}},
                    repository=self.repo,
                    mercado_pago=FakeMercadoPago(),
                )

        self.assertEqual(error.exception.status_code, 401)
        self.assertEqual(self.repo.webhook_events, {})

    async def test_webhook_rejects_missing_query_data_id_without_body_fallback(self):
        headers = signed_headers("pay-1")

        with patch.dict("os.environ", {"MERCADO_PAGO_WEBHOOK_SECRET": SECRET}):
            with self.assertRaises(HTTPException) as error:
                await process_mercado_pago_webhook(
                    headers=headers,
                    query_params={},
                    payload={"id": "event-1", "type": "payment", "data": {"id": "pay-1"}},
                    repository=self.repo,
                    mercado_pago=FakeMercadoPago(),
                )

        self.assertEqual(error.exception.status_code, 401)
        self.assertEqual(self.repo.webhook_events, {})

    async def test_webhook_ignores_non_payment_event_without_provider_call(self):
        mercado_pago = NonCallingMercadoPago()

        with patch.dict("os.environ", {"MERCADO_PAGO_WEBHOOK_SECRET": SECRET}):
            result = await process_mercado_pago_webhook(
                headers=signed_headers("merchant-1"),
                query_params={"data.id": "merchant-1"},
                payload={
                    "id": "event-merchant",
                    "type": "merchant_order",
                    "action": "merchant_order.updated",
                    "data": {"id": "merchant-1"},
                },
                repository=self.repo,
                mercado_pago=mercado_pago,
            )

        self.assertEqual(result["status"], "ignored")
        self.assertFalse(mercado_pago.called)
        event = self.repo.webhook_events[("mercado_pago", "event-merchant")]
        self.assertTrue(event["processed"])

    async def test_webhook_records_pending_payment(self):
        order = await self.create_pending_order()

        result = await self.process_payment_webhook(
            order,
            {
                "id": "pay-1",
                "external_reference": order["external_reference"],
                "transaction_amount": 99,
                "currency_id": "BRL",
                "status": "pending",
            },
        )

        self.assertEqual(result["status"], "processed")
        self.assertEqual(self.repo.orders["order-1"]["status"], "pending")
        self.assertFalse(self.repo.clientes["cliente-1"]["produto_1_completo_liberado"])

    async def test_webhook_approved_payment_grants_entitlement(self):
        order = await self.create_pending_order()

        await self.process_payment_webhook(
            order,
            {
                "id": "pay-1",
                "external_reference": order["external_reference"],
                "transaction_amount": 99,
                "currency_id": "BRL",
                "status": "approved",
            },
        )

        self.assertEqual(self.repo.orders["order-1"]["status"], "approved")
        self.assertTrue(self.repo.clientes["cliente-1"]["produto_1_completo_liberado"])
        self.assertEqual(len(self.repo.admin_events), 1)

    async def test_webhook_rejects_amount_mismatch(self):
        order = await self.create_pending_order()

        with self.assertRaises(HTTPException) as error:
            await self.process_payment_webhook(
                order,
                {
                    "id": "pay-1",
                    "external_reference": order["external_reference"],
                    "transaction_amount": 100,
                    "currency_id": "BRL",
                    "status": "approved",
                },
            )

        self.assertEqual(error.exception.status_code, 409)
        self.assertFalse(self.repo.clientes["cliente-1"]["produto_1_completo_liberado"])

    async def test_webhook_accepts_exact_amount(self):
        order = await self.create_pending_order()

        await self.process_payment_webhook(
            order,
            {
                "id": "pay-1",
                "external_reference": order["external_reference"],
                "transaction_amount": "99.00",
                "currency_id": "BRL",
                "status": "approved",
            },
        )

        self.assertEqual(self.repo.orders["order-1"]["status"], "approved")

    async def test_webhook_rejects_one_cent_amount_difference(self):
        order = await self.create_pending_order()

        with self.assertRaises(HTTPException) as error:
            await self.process_payment_webhook(
                order,
                {
                    "id": "pay-1",
                    "external_reference": order["external_reference"],
                    "transaction_amount": "99.01",
                    "currency_id": "BRL",
                    "status": "approved",
                },
            )

        self.assertEqual(error.exception.status_code, 409)

    async def test_webhook_rejects_currency_mismatch(self):
        order = await self.create_pending_order()

        with self.assertRaises(HTTPException) as error:
            await self.process_payment_webhook(
                order,
                {
                    "id": "pay-1",
                    "external_reference": order["external_reference"],
                    "transaction_amount": 99,
                    "currency_id": "USD",
                    "status": "approved",
                },
            )

        self.assertEqual(error.exception.status_code, 409)

    async def test_webhook_rejects_external_reference_mismatch(self):
        order = await self.create_pending_order()

        with self.assertRaises(HTTPException) as error:
            await self.process_payment_webhook(
                order,
                {
                    "id": "pay-1",
                    "external_reference": "other-ref",
                    "transaction_amount": 99,
                    "currency_id": "BRL",
                    "status": "approved",
                },
            )

        self.assertEqual(error.exception.status_code, 404)

    async def test_webhook_rejects_payment_id_mismatch(self):
        order = await self.create_pending_order()
        self.repo.orders[order["id"]]["provider_payment_id"] = "pay-original"

        with self.assertRaises(HTTPException) as error:
            await self.process_payment_webhook(
                order,
                {
                    "id": "pay-other",
                    "external_reference": order["external_reference"],
                    "transaction_amount": 99,
                    "currency_id": "BRL",
                    "status": "approved",
                },
            )

        self.assertEqual(error.exception.status_code, 409)

    async def test_webhook_rejects_metadata_order_mismatch(self):
        order = await self.create_pending_order()

        with self.assertRaises(HTTPException) as error:
            await self.process_payment_webhook(
                order,
                {
                    "id": "pay-1",
                    "external_reference": order["external_reference"],
                    "transaction_amount": 99,
                    "currency_id": "BRL",
                    "status": "approved",
                    "metadata": {
                        "order_id": "other-order",
                        "product_code": order["product_code"],
                    },
                },
            )

        self.assertEqual(error.exception.status_code, 409)

    async def test_webhook_rejects_metadata_product_mismatch(self):
        order = await self.create_pending_order()

        with self.assertRaises(HTTPException) as error:
            await self.process_payment_webhook(
                order,
                {
                    "id": "pay-1",
                    "external_reference": order["external_reference"],
                    "transaction_amount": 99,
                    "currency_id": "BRL",
                    "status": "approved",
                    "metadata": {
                        "order_id": order["id"],
                        "product_code": "produto_2",
                    },
                },
            )

        self.assertEqual(error.exception.status_code, 409)

    async def test_webhook_repeated_event_is_idempotent(self):
        order = await self.create_pending_order()
        payment = {
            "id": "pay-1",
            "external_reference": order["external_reference"],
            "transaction_amount": 99,
            "currency_id": "BRL",
            "status": "approved",
        }

        await self.process_payment_webhook(order, payment)
        result = await self.process_payment_webhook(order, payment)

        self.assertEqual(result["status"], "duplicate")
        self.assertEqual(len(self.repo.admin_events), 1)

    async def test_webhook_provider_unavailable_keeps_event_retryable(self):
        order = await self.create_pending_order()
        payment_id = "pay-1"

        with patch.dict("os.environ", {"MERCADO_PAGO_WEBHOOK_SECRET": SECRET}):
            with self.assertRaises(HTTPException) as error:
                await process_mercado_pago_webhook(
                    headers=signed_headers(payment_id),
                    query_params={"data.id": payment_id},
                    payload={
                        "id": "event-retry",
                        "type": "payment",
                        "data": {"id": payment_id},
                    },
                    repository=self.repo,
                    mercado_pago=FailingMercadoPago(),
                )

        self.assertEqual(error.exception.status_code, 502)
        event = self.repo.webhook_events[("mercado_pago", "event-retry")]
        self.assertFalse(event["processed"])
        self.assertIsNone(event["processed_at"])
        self.assertEqual(self.repo.orders[order["id"]]["status"], "pending")

    async def test_webhook_retry_after_temporary_failure_processes_same_event_once(self):
        order = await self.create_pending_order()
        payment_id = "pay-1"
        payload = {
            "id": "event-retry",
            "type": "payment",
            "data": {"id": payment_id},
        }

        with patch.dict("os.environ", {"MERCADO_PAGO_WEBHOOK_SECRET": SECRET}):
            with self.assertRaises(HTTPException):
                await process_mercado_pago_webhook(
                    headers=signed_headers(payment_id),
                    query_params={"data.id": payment_id},
                    payload=payload,
                    repository=self.repo,
                    mercado_pago=FailingMercadoPago(),
                )

            result = await process_mercado_pago_webhook(
                headers=signed_headers(payment_id),
                query_params={"data.id": payment_id},
                payload=payload,
                repository=self.repo,
                mercado_pago=FakeMercadoPago(
                    payment={
                        "id": payment_id,
                        "external_reference": order["external_reference"],
                        "transaction_amount": 99,
                        "currency_id": "BRL",
                        "status": "approved",
                    }
                ),
            )

        self.assertEqual(result["status"], "processed")
        self.assertTrue(self.repo.clientes["cliente-1"]["produto_1_completo_liberado"])
        self.assertEqual(len(self.repo.admin_events), 1)

    async def test_approved_order_does_not_downgrade_to_pending(self):
        order = await self.create_pending_order()
        await self.process_payment_webhook(
            order,
            {
                "id": "pay-1",
                "external_reference": order["external_reference"],
                "transaction_amount": 99,
                "currency_id": "BRL",
                "status": "approved",
            },
            request_id="req-approved",
        )
        await self.process_payment_webhook(
            self.repo.orders["order-1"],
            {
                "id": "pay-1",
                "external_reference": order["external_reference"],
                "transaction_amount": 99,
                "currency_id": "BRL",
                "status": "pending",
            },
            request_id="req-pending",
        )

        self.assertEqual(self.repo.orders["order-1"]["status"], "approved")

    async def test_approved_payment_with_existing_entitlement_does_not_duplicate_event(self):
        order = await self.create_pending_order()
        self.repo.clientes["cliente-1"]["produto_1_completo_liberado"] = True

        await self.process_payment_webhook(
            order,
            {
                "id": "pay-1",
                "external_reference": order["external_reference"],
                "transaction_amount": 99,
                "currency_id": "BRL",
                "status": "approved",
            },
        )

        self.assertEqual(len(self.repo.admin_events), 0)

    async def test_product1_complete_grants_correct_flag(self):
        order = await self.create_pending_order("produto_1_completo")
        await self.process_payment_webhook(
            order,
            {
                "id": "pay-1",
                "external_reference": order["external_reference"],
                "transaction_amount": 99,
                "currency_id": "BRL",
                "status": "approved",
            },
        )

        self.assertTrue(self.repo.clientes["cliente-1"]["produto_1_completo_liberado"])
        self.assertFalse(self.repo.clientes["cliente-1"]["produto_2_liberado"])

    async def test_product2_grants_correct_flag(self):
        order = await self.create_pending_order("produto_2")
        with patch.dict(
            os.environ,
            {"PAYMENT_CHECKOUT_PRODUCT_CODES": ALL_CHECKOUT_PRODUCTS},
        ):
            await self.process_payment_webhook(
                order,
                {
                    "id": "pay-1",
                    "external_reference": order["external_reference"],
                    "transaction_amount": 199,
                    "currency_id": "BRL",
                    "status": "approved",
                },
            )

        self.assertTrue(self.repo.clientes["cliente-1"]["produto_2_liberado"])
        self.assertFalse(self.repo.clientes["cliente-1"]["produto_3_liberado"])

    async def test_product3_grants_correct_flag(self):
        self.repo.clientes["cliente-1"]["status_jornada"] = "Dossiê ORI publicado"
        order = await self.create_pending_order("produto_3")
        with patch.dict(
            os.environ,
            {"PAYMENT_CHECKOUT_PRODUCT_CODES": ALL_CHECKOUT_PRODUCTS},
        ):
            await self.process_payment_webhook(
                order,
                {
                    "id": "pay-1",
                    "external_reference": order["external_reference"],
                    "transaction_amount": 299,
                    "currency_id": "BRL",
                    "status": "approved",
                },
            )

        self.assertTrue(self.repo.clientes["cliente-1"]["produto_3_liberado"])

    async def test_responses_do_not_expose_secrets(self):
        mercado_pago = FakeMercadoPago()

        response = await create_checkout(
            payload_product_code="produto_1_completo",
            current_user=self.user,
            repository=self.repo,
            mercado_pago=mercado_pago,
        )
        serialized = response.model_dump()

        self.assertEqual(set(serialized), {"order_id", "status", "checkout_url"})
        self.assertNotIn("token", str(serialized).lower())
        self.assertNotIn("secret", str(serialized).lower())


class PaymentReconcileSchemaTest(unittest.TestCase):
    def test_schema_rejects_extra_fields(self):
        from pydantic import ValidationError

        with self.assertRaises(ValidationError):
            PaymentReconcileRequest(payment_id="pay-1", user_id="user-1")

    def test_schema_rejects_empty_payment_id(self):
        from pydantic import ValidationError

        with self.assertRaises(ValidationError):
            PaymentReconcileRequest(payment_id="")


async def fake_ensure_admin(current_user: CurrentUser) -> None:
    return None


async def fake_ensure_admin_forbidden(current_user: CurrentUser) -> None:
    raise HTTPException(
        status_code=403,
        detail="Acesso administrativo necessário.",
    )


class ReconcilePaymentServiceTest(unittest.IsolatedAsyncioTestCase):
    def setUp(self):
        self.repo = FakeRepository()
        self.admin_user = CurrentUser(
            user_id="admin-1",
            email="admin@example.com",
            access_token="admin-token",
        )

    async def create_order_for_reconcile(self, **overrides):
        product_code = overrides.get("product_code", "produto_1_completo")
        product = self.repo.products[product_code]
        payload = {
            "cliente_id": "cliente-1",
            "user_id": "user-1",
            "email": "cliente@example.com",
            "product_code": product_code,
            "grants_product": product["grants_product"],
            "provider": "mercado_pago",
            "status": "pending",
            "external_reference": "ref-reconcile-1",
            "amount_cents": product["amount_cents"],
            "currency": product["currency"],
        }
        payload.update(overrides)
        return await self.repo.create_order(payload)

    async def reconcile(self, *, payment_id="pay-1", mercado_pago=None, ensure_admin=None):
        return await reconcile_payment_by_admin(
            payment_id=payment_id,
            current_user=self.admin_user,
            repository=self.repo,
            mercado_pago=mercado_pago or FakeMercadoPago(),
            ensure_admin=ensure_admin or fake_ensure_admin,
        )

    # 1. valid approved + entitlement false -> reconciled
    async def test_reconcile_approved_without_entitlement_grants_and_reconciles(self):
        order = await self.create_order_for_reconcile()
        payment = {
            "id": "pay-1",
            "external_reference": order["external_reference"],
            "transaction_amount": 99,
            "currency_id": "BRL",
            "status": "approved",
        }

        response = await self.reconcile(mercado_pago=FakeMercadoPago(payment=payment))

        self.assertEqual(response.result, "reconciled")
        self.assertIsNone(response.reason)
        self.assertTrue(self.repo.clientes["cliente-1"]["produto_1_completo_liberado"])
        self.assertEqual(self.repo.orders[order["id"]]["status"], "approved")
        self.assertEqual(len(self.repo.admin_events), 1)
        self.assertEqual(self.repo.admin_events[0]["details"]["result"], "reconciled")
        self.assertEqual(self.repo.admin_events[0]["admin_user_id"], "admin-1")

    # 2. approved + entitlement true + order stale -> order reparada, already_entitled, sem grant
    async def test_reconcile_already_entitled_repairs_stale_order(self):
        order = await self.create_order_for_reconcile(status="pending")
        self.repo.clientes["cliente-1"]["produto_1_completo_liberado"] = True
        payment = {
            "id": "pay-1",
            "external_reference": order["external_reference"],
            "transaction_amount": 99,
            "currency_id": "BRL",
            "status": "approved",
        }

        response = await self.reconcile(mercado_pago=FakeMercadoPago(payment=payment))

        self.assertEqual(response.result, "already_entitled")
        self.assertEqual(self.repo.orders[order["id"]]["status"], "approved")
        self.assertEqual(self.repo.admin_events[0]["details"]["result"], "already_entitled")

    # 3. retry após falha entre update_order e entitlement -> converge
    async def test_reconcile_retry_converges_when_order_approved_but_entitlement_missing(self):
        order = await self.create_order_for_reconcile(
            status="approved",
            approved_at="2026-08-07T00:00:00+00:00",
        )
        payment = {
            "id": "pay-1",
            "external_reference": order["external_reference"],
            "transaction_amount": 99,
            "currency_id": "BRL",
            "status": "approved",
        }

        response = await self.reconcile(mercado_pago=FakeMercadoPago(payment=payment))

        self.assertEqual(response.result, "reconciled")
        self.assertTrue(self.repo.clientes["cliente-1"]["produto_1_completo_liberado"])

    # 4. payment_not_found
    async def test_reconcile_payment_not_found(self):
        response = await self.reconcile(mercado_pago=FakeMercadoPago(not_found=True))

        self.assertEqual(response.result, "rejected")
        self.assertEqual(response.reason, "payment_not_found")
        events = list(self.repo.webhook_events.values())
        self.assertEqual(len(events), 1)
        self.assertEqual(events[0]["provider"], "internal_reconciliation")
        self.assertEqual(
            events[0]["event_type"], "payment_entitlement_reconciliation_attempt"
        )

    # 5. provider timeout/5xx -> NÃO vira payment_not_found -> erro técnico/502 -> nenhuma mutação
    async def test_reconcile_provider_technical_error_is_not_payment_not_found(self):
        order = await self.create_order_for_reconcile()

        with self.assertRaises(HTTPException) as error:
            await self.reconcile(mercado_pago=FailingMercadoPago())

        self.assertEqual(error.exception.status_code, 502)
        events = list(self.repo.webhook_events.values())
        self.assertEqual(len(events), 1)
        self.assertEqual(events[0]["payload_sanitized"]["result"], "technical_error")
        self.assertEqual(events[0]["payload_sanitized"]["reason"], "provider_unavailable")
        self.assertEqual(self.repo.orders[order["id"]]["status"], "pending")
        self.assertFalse(self.repo.clientes["cliente-1"]["produto_1_completo_liberado"])

    # 6. payment_not_approved
    async def test_reconcile_rejects_payment_not_approved(self):
        order = await self.create_order_for_reconcile()
        payment = {
            "id": "pay-1",
            "external_reference": order["external_reference"],
            "transaction_amount": 99,
            "currency_id": "BRL",
            "status": "pending",
        }

        response = await self.reconcile(mercado_pago=FakeMercadoPago(payment=payment))

        self.assertEqual(response.result, "rejected")
        self.assertEqual(response.reason, "payment_not_approved")
        self.assertFalse(self.repo.clientes["cliente-1"]["produto_1_completo_liberado"])

    # 7. amount_mismatch
    async def test_reconcile_rejects_amount_mismatch(self):
        order = await self.create_order_for_reconcile()
        payment = {
            "id": "pay-1",
            "external_reference": order["external_reference"],
            "transaction_amount": 999,
            "currency_id": "BRL",
            "status": "approved",
        }

        response = await self.reconcile(mercado_pago=FakeMercadoPago(payment=payment))

        self.assertEqual(response.result, "rejected")
        self.assertEqual(response.reason, "amount_mismatch")
        self.assertFalse(self.repo.clientes["cliente-1"]["produto_1_completo_liberado"])

    # 8. currency_mismatch
    async def test_reconcile_rejects_currency_mismatch(self):
        order = await self.create_order_for_reconcile()
        payment = {
            "id": "pay-1",
            "external_reference": order["external_reference"],
            "transaction_amount": 99,
            "currency_id": "USD",
            "status": "approved",
        }

        response = await self.reconcile(mercado_pago=FakeMercadoPago(payment=payment))

        self.assertEqual(response.result, "rejected")
        self.assertEqual(response.reason, "currency_mismatch")

    # 9. product_mismatch
    async def test_reconcile_rejects_product_mismatch(self):
        order = await self.create_order_for_reconcile()
        payment = {
            "id": "pay-1",
            "external_reference": order["external_reference"],
            "transaction_amount": 99,
            "currency_id": "BRL",
            "status": "approved",
            "metadata": {"order_id": order["id"], "product_code": "produto_2"},
        }

        response = await self.reconcile(mercado_pago=FakeMercadoPago(payment=payment))

        self.assertEqual(response.result, "rejected")
        self.assertEqual(response.reason, "product_mismatch")

    # 10. collector_mismatch
    async def test_reconcile_rejects_collector_mismatch(self):
        order = await self.create_order_for_reconcile()
        self.repo.products["produto_1_completo"]["collector_id"] = "collector-expected"
        payment = {
            "id": "pay-1",
            "external_reference": order["external_reference"],
            "transaction_amount": 99,
            "currency_id": "BRL",
            "status": "approved",
            "collector_id": "collector-other",
        }

        response = await self.reconcile(mercado_pago=FakeMercadoPago(payment=payment))

        self.assertEqual(response.result, "rejected")
        self.assertEqual(response.reason, "collector_mismatch")

    # 11. external_reference_mismatch (via provider_payment_id já vinculado a outro pagamento)
    async def test_reconcile_rejects_external_reference_mismatch(self):
        order = await self.create_order_for_reconcile()
        self.repo.orders[order["id"]]["provider_payment_id"] = "pay-original"
        payment = {
            "id": "pay-other",
            "external_reference": order["external_reference"],
            "transaction_amount": 99,
            "currency_id": "BRL",
            "status": "approved",
        }

        response = await self.reconcile(mercado_pago=FakeMercadoPago(payment=payment))

        self.assertEqual(response.result, "rejected")
        self.assertEqual(response.reason, "external_reference_mismatch")

    # 12. product_not_supported (fora do escopo mínimo: só produto_1_completo)
    async def test_reconcile_rejects_product_not_supported(self):
        order = await self.create_order_for_reconcile(
            product_code="produto_2",
            external_reference="ref-p2",
        )
        payment = {
            "id": "pay-1",
            "external_reference": order["external_reference"],
            "transaction_amount": 199,
            "currency_id": "BRL",
            "status": "approved",
        }

        response = await self.reconcile(mercado_pago=FakeMercadoPago(payment=payment))

        self.assertEqual(response.result, "rejected")
        self.assertEqual(response.reason, "product_not_supported")
        self.assertFalse(self.repo.clientes["cliente-1"]["produto_2_liberado"])

    # 13. external_reference ausente
    async def test_reconcile_rejects_missing_external_reference(self):
        payment = {
            "id": "pay-1",
            "transaction_amount": 99,
            "currency_id": "BRL",
            "status": "approved",
        }

        response = await self.reconcile(mercado_pago=FakeMercadoPago(payment=payment))

        self.assertEqual(response.result, "rejected")
        self.assertEqual(response.reason, "external_reference_missing")

    # 14. external_reference vazio
    async def test_reconcile_rejects_empty_external_reference(self):
        payment = {
            "id": "pay-1",
            "external_reference": "",
            "transaction_amount": 99,
            "currency_id": "BRL",
            "status": "approved",
        }

        response = await self.reconcile(mercado_pago=FakeMercadoPago(payment=payment))

        self.assertEqual(response.result, "rejected")
        self.assertEqual(response.reason, "external_reference_missing")

    # 15. external_reference presente mas sem order -> inconsistency_requires_manual_review
    async def test_reconcile_reports_manual_review_when_order_not_found(self):
        payment = {
            "id": "pay-1",
            "external_reference": "ref-inexistente",
            "transaction_amount": 99,
            "currency_id": "BRL",
            "status": "approved",
        }

        response = await self.reconcile(mercado_pago=FakeMercadoPago(payment=payment))

        self.assertEqual(response.result, "inconsistency_requires_manual_review")
        self.assertEqual(response.reason, "order_not_found")

    # 16. external_reference em formato incomum -> não causa 500
    async def test_reconcile_unusual_external_reference_format_does_not_500(self):
        payment = {
            "id": "pay-1",
            "external_reference": "!!!weird///format???",
            "transaction_amount": 99,
            "currency_id": "BRL",
            "status": "approved",
        }

        response = await self.reconcile(mercado_pago=FakeMercadoPago(payment=payment))

        self.assertEqual(response.result, "inconsistency_requires_manual_review")
        self.assertEqual(response.reason, "order_not_found")

    # 17. tentativa sem order grava discriminador correto, sem PII/valor
    async def test_reconcile_without_order_audits_with_discriminator_and_no_pii(self):
        payment = {
            "id": "pay-1",
            "external_reference": "ref-inexistente",
            "transaction_amount": 99,
            "currency_id": "BRL",
            "status": "approved",
        }

        await self.reconcile(mercado_pago=FakeMercadoPago(payment=payment))

        events = list(self.repo.webhook_events.values())
        self.assertEqual(len(events), 1)
        event = events[0]
        self.assertEqual(event["provider"], "internal_reconciliation")
        self.assertEqual(
            event["event_type"], "payment_entitlement_reconciliation_attempt"
        )
        self.assertEqual(event["payload_sanitized"]["admin_user_id"], "admin-1")
        self.assertEqual(event["payload_sanitized"]["payment_id"], "pay-1")
        self.assertEqual(
            event["payload_sanitized"]["result"], "inconsistency_requires_manual_review"
        )
        self.assertEqual(event["payload_sanitized"]["reason"], "order_not_found")
        serialized = str(event["payload_sanitized"]).lower()
        self.assertNotIn("email", serialized)
        self.assertNotIn("cliente@example.com", serialized)
        self.assertNotIn("transaction_amount", serialized)

    # 18. falha na criação da auditoria inicial -> nenhuma mutação
    async def test_reconcile_aborts_when_initial_audit_fails(self):
        order = await self.create_order_for_reconcile()
        self.repo.fail_create_admin_event = True
        payment = {
            "id": "pay-1",
            "external_reference": order["external_reference"],
            "transaction_amount": 99,
            "currency_id": "BRL",
            "status": "approved",
        }

        with self.assertRaises(HTTPException):
            await self.reconcile(mercado_pago=FakeMercadoPago(payment=payment))

        self.assertEqual(self.repo.orders[order["id"]]["status"], "pending")
        self.assertFalse(self.repo.clientes["cliente-1"]["produto_1_completo_liberado"])

    # 19. falha em update_order -> nenhum grant
    async def test_reconcile_no_grant_when_update_order_fails(self):
        order = await self.create_order_for_reconcile()
        self.repo.fail_update_order = True
        payment = {
            "id": "pay-1",
            "external_reference": order["external_reference"],
            "transaction_amount": 99,
            "currency_id": "BRL",
            "status": "approved",
        }

        with self.assertRaises(HTTPException):
            await self.reconcile(mercado_pago=FakeMercadoPago(payment=payment))

        self.assertFalse(self.repo.clientes["cliente-1"]["produto_1_completo_liberado"])
        self.assertEqual(len(self.repo.admin_events), 1)

    # 20. auditoria final falha depois do grant -> entitlement não é revertido
    async def test_reconcile_keeps_entitlement_when_final_audit_update_fails(self):
        order = await self.create_order_for_reconcile()
        self.repo.fail_update_admin_event = True
        payment = {
            "id": "pay-1",
            "external_reference": order["external_reference"],
            "transaction_amount": 99,
            "currency_id": "BRL",
            "status": "approved",
        }

        response = await self.reconcile(mercado_pago=FakeMercadoPago(payment=payment))

        self.assertEqual(response.result, "reconciled")
        self.assertTrue(self.repo.clientes["cliente-1"]["produto_1_completo_liberado"])

    # 21. repetição após reconciled -> already_entitled, order sincronizada
    async def test_reconcile_repeat_after_reconciled_returns_already_entitled(self):
        order = await self.create_order_for_reconcile()
        payment = {
            "id": "pay-1",
            "external_reference": order["external_reference"],
            "transaction_amount": 99,
            "currency_id": "BRL",
            "status": "approved",
        }

        first = await self.reconcile(mercado_pago=FakeMercadoPago(payment=payment))
        second = await self.reconcile(mercado_pago=FakeMercadoPago(payment=payment))

        self.assertEqual(first.result, "reconciled")
        self.assertEqual(second.result, "already_entitled")
        self.assertEqual(self.repo.orders[order["id"]]["status"], "approved")

    # 22. duas chamadas concorrentes -> efeito de negócio único/idempotente
    async def test_reconcile_concurrent_calls_stay_business_safe(self):
        import asyncio

        order = await self.create_order_for_reconcile()
        payment = {
            "id": "pay-1",
            "external_reference": order["external_reference"],
            "transaction_amount": 99,
            "currency_id": "BRL",
            "status": "approved",
        }

        results = await asyncio.gather(
            self.reconcile(mercado_pago=FakeMercadoPago(payment=payment)),
            self.reconcile(mercado_pago=FakeMercadoPago(payment=payment)),
        )

        self.assertTrue(self.repo.clientes["cliente-1"]["produto_1_completo_liberado"])
        results_set = {response.result for response in results}
        self.assertTrue(results_set.issubset({"reconciled", "already_entitled"}))
        self.assertGreaterEqual(len(self.repo.admin_events), 1)

    # 24. usuário autenticado não-admin -> 403, nenhuma operação de pagamento
    async def test_reconcile_rejects_non_admin_without_touching_payment(self):
        await self.create_order_for_reconcile()
        mercado_pago = NonCallingMercadoPago()

        with self.assertRaises(HTTPException) as error:
            await self.reconcile(
                mercado_pago=mercado_pago,
                ensure_admin=fake_ensure_admin_forbidden,
            )

        self.assertEqual(error.exception.status_code, 403)
        self.assertFalse(mercado_pago.called)

    # Correção B1.3-1: order_status_before preservado + order_status_after
    # correto na auditoria final (pending -> approved).
    async def test_reconcile_final_audit_preserves_before_and_after_status(self):
        order = await self.create_order_for_reconcile(status="pending")
        payment = {
            "id": "pay-1",
            "external_reference": order["external_reference"],
            "transaction_amount": 99,
            "currency_id": "BRL",
            "status": "approved",
        }

        response = await self.reconcile(mercado_pago=FakeMercadoPago(payment=payment))

        self.assertEqual(response.result, "reconciled")
        final_details = self.repo.admin_events[0]["details"]
        self.assertEqual(final_details["order_status_before"], "pending")
        self.assertEqual(final_details["order_status_after"], "approved")

    # Correção B1.3-2: falha em grant_entitlement é auditada como erro
    # técnico, propagada (não vira 200), e retry posterior converge.
    async def test_reconcile_audits_and_propagates_grant_entitlement_failure(self):
        order = await self.create_order_for_reconcile(status="pending")
        self.repo.fail_grant_entitlement = True
        payment = {
            "id": "pay-1",
            "external_reference": order["external_reference"],
            "transaction_amount": 99,
            "currency_id": "BRL",
            "status": "approved",
        }

        with self.assertRaises(HTTPException) as error:
            await self.reconcile(mercado_pago=FakeMercadoPago(payment=payment))

        self.assertEqual(error.exception.status_code, 502)
        # order já sincronizada, apesar do grant ter falhado
        self.assertEqual(self.repo.orders[order["id"]]["status"], "approved")
        # entitlement continua false
        self.assertFalse(self.repo.clientes["cliente-1"]["produto_1_completo_liberado"])
        # auditoria final registra o erro técnico específico
        final_details = self.repo.admin_events[0]["details"]
        self.assertEqual(final_details["result"], "technical_error")
        self.assertEqual(final_details["reason"], "entitlement_grant_failed")
        self.assertEqual(final_details["order_status_before"], "pending")
        self.assertEqual(final_details["order_status_after"], "approved")

        # retry posterior (sem a falha simulada) converge normalmente
        self.repo.fail_grant_entitlement = False
        retry_response = await self.reconcile(mercado_pago=FakeMercadoPago(payment=payment))

        self.assertEqual(retry_response.result, "reconciled")
        self.assertTrue(self.repo.clientes["cliente-1"]["produto_1_completo_liberado"])


class FakeHttpResponse:
    """Simula uma resposta httpx (status_code + json()) sem nenhuma rede
    real — usada para testar get_payment_for_reconciliation mockando só o
    transporte HTTP."""

    def __init__(self, status_code: int, payload: dict) -> None:
        self.status_code = status_code
        self._payload = payload

    def json(self) -> dict:
        return self._payload


class MercadoPagoGetPaymentForReconciliationTest(unittest.IsolatedAsyncioTestCase):
    """Testes diretos e unitários do método real
    MercadoPagoClient.get_payment_for_reconciliation, mockando somente o
    transporte HTTP (httpx.AsyncClient.get) — nunca chama o Mercado Pago
    real."""

    def setUp(self):
        self.client = MercadoPagoClient(access_token="test-token")

    async def test_returns_json_on_success(self):
        async def fake_get(self, url, headers=None, **kwargs):
            return FakeHttpResponse(200, {"id": "pay-1", "status": "approved"})

        with patch.object(httpx.AsyncClient, "get", fake_get):
            payment = await self.client.get_payment_for_reconciliation("pay-1")

        self.assertEqual(payment, {"id": "pay-1", "status": "approved"})

    async def test_raises_404_when_payment_not_found(self):
        async def fake_get(self, url, headers=None, **kwargs):
            return FakeHttpResponse(404, {"error": "not_found"})

        with patch.object(httpx.AsyncClient, "get", fake_get):
            with self.assertRaises(HTTPException) as error:
                await self.client.get_payment_for_reconciliation("pay-inexistente")

        self.assertEqual(error.exception.status_code, 404)

    async def test_server_error_becomes_502_not_404(self):
        async def fake_get(self, url, headers=None, **kwargs):
            return FakeHttpResponse(500, {"error": "internal"})

        with patch.object(httpx.AsyncClient, "get", fake_get):
            with self.assertRaises(HTTPException) as error:
                await self.client.get_payment_for_reconciliation("pay-1")

        self.assertEqual(error.exception.status_code, 502)

    async def test_network_error_becomes_502_not_404(self):
        async def fake_get(self, url, headers=None, **kwargs):
            raise httpx.ConnectTimeout("timeout simulado")

        with patch.object(httpx.AsyncClient, "get", fake_get):
            with self.assertRaises(HTTPException) as error:
                await self.client.get_payment_for_reconciliation("pay-1")

        self.assertEqual(error.exception.status_code, 502)


if __name__ == "__main__":
    unittest.main()
