import hashlib
import hmac
import unittest
from unittest.mock import patch

from fastapi import HTTPException

from app.schemas.auth import CurrentUser
from app.services.auth_service import get_current_user
from app.services.mercado_pago_service import (
    build_preference_payload,
    validate_mercado_pago_signature,
)
from app.services.payment_service import (
    create_checkout,
    get_payment_catalog,
    get_payment_status,
    map_mercado_pago_status,
    process_mercado_pago_webhook,
)


SECRET = "webhook-secret"


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
    def __init__(self, *, payment: dict | None = None) -> None:
        self.payment = payment or {}
        self.preferences = []

    async def create_preference(self, *, order: dict, product: dict) -> dict:
        self.preferences.append({"order": order, "product": product})
        return {
            "id": "pref-1",
            "init_point": "https://checkout.mercadopago.com/pref-1",
        }

    async def get_payment(self, payment_id: str) -> dict:
        return {**self.payment, "id": self.payment.get("id", payment_id)}


class FailingMercadoPago:
    async def get_payment(self, payment_id: str) -> dict:
        raise HTTPException(status_code=502, detail="provider unavailable")


class NonCallingMercadoPago:
    def __init__(self) -> None:
        self.called = False

    async def get_payment(self, payment_id: str) -> dict:
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
        self.clientes[cliente_id][entitlement_key] = True
        return self.clientes[cliente_id]

    async def create_admin_event(self, payload: dict):
        self.admin_events.append(payload)
        return payload


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

    async def test_product2_requires_product1_completion(self):
        self.repo.clientes["cliente-1"]["status_jornada"] = "Código das Deusas em andamento"

        with self.assertRaises(HTTPException) as error:
            await create_checkout(
                payload_product_code="produto_2",
                current_user=self.user,
                repository=self.repo,
                mercado_pago=FakeMercadoPago(),
            )

        self.assertEqual(error.exception.status_code, 409)

    async def test_product3_requires_product2_publication(self):
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


if __name__ == "__main__":
    unittest.main()
