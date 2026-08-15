"""OBS-3 — testes da timeline administrativa read-only de payment_order.

Cobre a matriz completa exigida: autenticação/autorização, taxonomia V1
congelada (somente 4 eventos factuais), current_state de entitlement,
limitations, privacidade (nenhum dado sensível vaza), ordenação
determinística, e a garantia comportamental de que o caminho inteiro é
read-only (nenhuma escrita, nenhuma reconciliação, nenhuma concessão de
entitlement, nenhuma chamada ao Mercado Pago).

Segue o estilo de `test_admin_payments_route.py` e `test_payment_service.py`:
FakeRepository local, dependency_overrides no app FastAPI real, mocks de
httpx.AsyncClient para a checagem de admin, e "dublês explosivos" que falham
o teste caso qualquer método não-permitido seja chamado.
"""

import unittest
from unittest.mock import patch

import httpx
from fastapi import FastAPI, HTTPException

from app.routes.admin_payments import router as admin_payments_router
from app.schemas.auth import CurrentUser
from app.services.auth_service import get_current_user
from app.services.payment_service import get_payment_timeline

# ---------------------------------------------------------------------------
# Canaries sintéticas — nunca segredos reais, apenas valores usados para
# provar que determinados campos NUNCA aparecem serializados na resposta.
# ---------------------------------------------------------------------------
CANARY_EMAIL = "canary-email@example.test"
CANARY_CPF = "111.222.333-44"
CANARY_AUTHORIZATION = "Bearer canary-authorization-token"
CANARY_ACCESS_TOKEN = "canary-access-token-value"
CANARY_REFRESH_TOKEN = "canary-refresh-token-value"
CANARY_RAW_PAYLOAD = {"canary_raw_payload_marker": "should-never-serialize"}
CANARY_CARD_DATA = "4111-1111-1111-1111"
CANARY_PROVIDER_SECRET = "canary-provider-secret-value"


def override_current_user() -> CurrentUser:
    return CurrentUser(
        user_id="admin-1",
        email="admin@example.com",
        access_token="admin-token",
    )


async def fake_ensure_admin_ok(current_user: CurrentUser) -> None:
    return None


async def fake_ensure_admin_forbidden(current_user: CurrentUser) -> None:
    raise HTTPException(status_code=403, detail="Acesso administrativo necessário.")


class WriteAttemptedError(AssertionError):
    """Levantado sempre que um caminho de escrita/mutação/efeito colateral é
    tocado — prova, por execução, que a timeline é estritamente read-only."""


class ExplodingRepository:
    """Qualquer atributo acessado vira uma corrotina que falha o teste."""

    def __getattr__(self, name):
        async def _fail(*args, **kwargs):
            raise AssertionError(
                f"Repositório de pagamentos não deveria ser chamado (método: {name})"
            )

        return _fail


class TimelineFakeRepository:
    """Repositório de pagamentos em memória, restrito aos métodos read-only
    usados por `get_payment_timeline`. Qualquer método de escrita/mutação
    (create/update/patch/grant/reconcile) explode o teste ao ser chamado —
    prova comportamental do contrato read-only, não apenas inspeção estática.
    """

    def __init__(self) -> None:
        self.orders: dict[str, dict] = {}
        self.webhook_events: dict[str, list[dict]] = {}
        self.clientes: dict[str, dict] = {}
        self.calls: list[str] = []

    def add_order(self, order: dict) -> None:
        self.orders[order["id"]] = order

    def add_webhook_events(self, order_id: str, events: list[dict]) -> None:
        self.webhook_events[order_id] = events

    def add_cliente(self, cliente: dict) -> None:
        self.clientes[cliente["id"]] = cliente

    async def fetch_order_by_id(self, order_id: str):
        self.calls.append("fetch_order_by_id")
        return self.orders.get(order_id)

    async def list_webhook_events_for_order(self, payment_order_id: str):
        self.calls.append("list_webhook_events_for_order")
        return self.webhook_events.get(payment_order_id, [])

    async def fetch_cliente_by_id(self, cliente_id: str):
        self.calls.append("fetch_cliente_by_id")
        return self.clientes.get(cliente_id)

    # ---- Superfícies de escrita/mutação/efeito colateral: qualquer chamada
    # aqui prova que o caminho da timeline deixou de ser read-only. ----
    async def create_order(self, *args, **kwargs):
        raise WriteAttemptedError("create_order não deveria ser chamado pela timeline")

    async def update_order(self, *args, **kwargs):
        raise WriteAttemptedError("update_order não deveria ser chamado pela timeline")

    async def create_webhook_event(self, *args, **kwargs):
        raise WriteAttemptedError(
            "create_webhook_event não deveria ser chamado pela timeline"
        )

    async def update_webhook_event(self, *args, **kwargs):
        raise WriteAttemptedError(
            "update_webhook_event não deveria ser chamado pela timeline"
        )

    async def grant_entitlement(self, *args, **kwargs):
        raise WriteAttemptedError(
            "grant_entitlement não deveria ser chamado pela timeline"
        )

    async def create_admin_event(self, *args, **kwargs):
        raise WriteAttemptedError(
            "create_admin_event não deveria ser chamado pela timeline"
        )

    async def update_admin_event(self, *args, **kwargs):
        raise WriteAttemptedError(
            "update_admin_event não deveria ser chamado pela timeline"
        )


def base_order(**overrides) -> dict:
    order = {
        "id": "order-1",
        "cliente_id": "cliente-1",
        "user_id": "user-1",
        "email": CANARY_EMAIL,
        "product_code": "produto_1_completo",
        "grants_product": "produto_1_completo_liberado",
        "provider": "mercado_pago",
        "status": "created",
        "external_reference": "ori-ref-1",
        "provider_payment_id": None,
        "checkout_url": None,
        "amount_cents": 29900,
        "currency": "BRL",
        "created_at": "2026-08-01T10:00:00+00:00",
        "approved_at": None,
        # Campos sensíveis sintéticos anexados ao registro cru, para provar
        # que o schema explícito de saída NUNCA os repassa, mesmo que o
        # registro de origem (dict genérico do Supabase) os contenha.
        "cpf": CANARY_CPF,
        "card_data": CANARY_CARD_DATA,
        "authorization": CANARY_AUTHORIZATION,
        "access_token": CANARY_ACCESS_TOKEN,
        "refresh_token": CANARY_REFRESH_TOKEN,
        "provider_secret": CANARY_PROVIDER_SECRET,
        "raw_payload": CANARY_RAW_PAYLOAD,
    }
    order.update(overrides)
    return order


def base_cliente(**overrides) -> dict:
    cliente = {
        "id": "cliente-1",
        "user_id": "user-1",
        "email": CANARY_EMAIL,
        "produto_1_completo_liberado": False,
        "produto_2_liberado": False,
        "produto_3_liberado": False,
        "cpf": CANARY_CPF,
    }
    cliente.update(overrides)
    return cliente


def webhook_event(**overrides) -> dict:
    event = {
        "id": "webhook-1",
        "created_at": "2026-08-01T10:05:00+00:00",
        "processed_at": None,
        "payment_order_id": "order-1",
        # Nunca deveria ser exposto — nem sequer é retornado pela
        # implementação real de list_webhook_events_for_order (select
        # restrito), mas incluído aqui como canário caso o comportamento
        # mude no futuro.
        "payload_sanitized": CANARY_RAW_PAYLOAD,
        "provider_payment_id": "pay-123",
    }
    event.update(overrides)
    return event


class AdminPaymentTimelineRouteTest(unittest.IsolatedAsyncioTestCase):
    """Testes via HTTP real (rota FastAPI completa) — cobrem
    autenticação/autorização e a matriz funcional/privacidade fim a fim."""

    def setUp(self):
        self.app = FastAPI()
        self.app.include_router(admin_payments_router)
        self.transport = httpx.ASGITransport(app=self.app)

    async def get(self, order_id: str) -> httpx.Response:
        async with httpx.AsyncClient(
            transport=self.transport,
            base_url="http://testserver",
        ) as client:
            return await client.get(f"/api/admin/payments/{order_id}/timeline")

    # 1. sem autenticação -> 401
    async def test_unauthenticated_request_returns_401(self):
        response = await self.get("order-1")
        self.assertEqual(response.status_code, 401)

    # 2. autenticado não-admin -> 403, sem tocar no repositório
    #
    # Nota: diferente de `test_admin_payments_route.py` (que usa POST no
    # endpoint testado e GET apenas na checagem interna de admin_service, o
    # que permite mockar `httpx.AsyncClient.get` sem ambiguidade), esta rota
    # é ela própria um GET. Mockar `httpx.AsyncClient.get` no nível de
    # classe interceptaria também a própria requisição HTTP de teste feita
    # pelo `httpx.ASGITransport`. Por isso, aqui o `ensure_admin` é
    # substituído diretamente (equivalente comportamental: "usuária
    # autenticada, porém não-admin" -> 403), preservando a prova de que o
    # repositório não é tocado quando o gate de admin barra a requisição.
    async def test_authenticated_non_admin_returns_403(self):
        self.app.dependency_overrides[get_current_user] = override_current_user
        try:
            with patch(
                "app.services.payment_service.ensure_admin_default",
                fake_ensure_admin_forbidden,
            ), patch(
                "app.services.payment_service.get_payment_repository",
                return_value=ExplodingRepository(),
            ):
                response = await self.get("order-1")
        finally:
            self.app.dependency_overrides.clear()

        self.assertEqual(response.status_code, 403)

    def _authenticated_and_admin(self):
        """Context manager helper: injeta usuária autenticada + ensure_admin
        aprovador, sem nenhuma chamada de rede real."""
        self.app.dependency_overrides[get_current_user] = override_current_user
        return patch(
            "app.services.payment_service.ensure_admin_default",
            fake_ensure_admin_ok,
        )

    async def _call_with_repo(self, order_id: str, repo: TimelineFakeRepository):
        with self._authenticated_and_admin(), patch(
            "app.services.payment_service.get_payment_repository",
            return_value=repo,
        ):
            try:
                return await self.get(order_id)
            finally:
                self.app.dependency_overrides.clear()

    # 3. order inexistente -> 404
    async def test_unknown_order_returns_404(self):
        repo = TimelineFakeRepository()
        response = await self._call_with_repo("unknown-order", repo)
        self.assertEqual(response.status_code, 404)

    # 4. order criada apenas -> ORDER_CREATED
    async def test_order_created_only_emits_order_created(self):
        repo = TimelineFakeRepository()
        repo.add_order(base_order())
        repo.add_cliente(base_cliente())
        response = await self._call_with_repo("order-1", repo)

        self.assertEqual(response.status_code, 200)
        body = response.json()
        events = [item["event"] for item in body["timeline"]]
        self.assertIn("ORDER_CREATED", events)
        self.assertNotIn("PAYMENT_APPROVED", events)

    # 5. approved_at presente -> PAYMENT_APPROVED
    async def test_approved_at_present_emits_payment_approved(self):
        repo = TimelineFakeRepository()
        repo.add_order(
            base_order(status="approved", approved_at="2026-08-01T11:00:00+00:00")
        )
        repo.add_cliente(base_cliente())
        response = await self._call_with_repo("order-1", repo)

        body = response.json()
        events = [item["event"] for item in body["timeline"]]
        self.assertIn("PAYMENT_APPROVED", events)

    # 6. status approved sem approved_at -> NÃO inventar PAYMENT_APPROVED
    async def test_approved_status_without_approved_at_does_not_infer_event(self):
        repo = TimelineFakeRepository()
        repo.add_order(base_order(status="approved", approved_at=None))
        repo.add_cliente(base_cliente())
        response = await self._call_with_repo("order-1", repo)

        body = response.json()
        events = [item["event"] for item in body["timeline"]]
        self.assertNotIn("PAYMENT_APPROVED", events)
        # current_state ainda reflete o status persistido.
        self.assertEqual(body["current_state"]["payment_status"], "approved")

    # 7. webhook criado -> WEBHOOK_RECEIVED
    async def test_webhook_created_emits_webhook_received(self):
        repo = TimelineFakeRepository()
        repo.add_order(base_order())
        repo.add_cliente(base_cliente())
        repo.add_webhook_events("order-1", [webhook_event()])
        response = await self._call_with_repo("order-1", repo)

        body = response.json()
        events = [item["event"] for item in body["timeline"]]
        self.assertIn("WEBHOOK_RECEIVED", events)

    # 8. webhook com processed_at presente -> WEBHOOK_PROCESSED
    async def test_webhook_with_processed_at_emits_webhook_processed(self):
        repo = TimelineFakeRepository()
        repo.add_order(base_order())
        repo.add_cliente(base_cliente())
        repo.add_webhook_events(
            "order-1",
            [webhook_event(processed_at="2026-08-01T10:06:00+00:00")],
        )
        response = await self._call_with_repo("order-1", repo)

        body = response.json()
        events = [item["event"] for item in body["timeline"]]
        self.assertIn("WEBHOOK_PROCESSED", events)

    # 9. webhook sem processed_at -> NÃO inventar WEBHOOK_PROCESSED
    async def test_webhook_without_processed_at_does_not_infer_processed(self):
        repo = TimelineFakeRepository()
        repo.add_order(base_order())
        repo.add_cliente(base_cliente())
        repo.add_webhook_events("order-1", [webhook_event(processed_at=None)])
        response = await self._call_with_repo("order-1", repo)

        body = response.json()
        events = [item["event"] for item in body["timeline"]]
        self.assertIn("WEBHOOK_RECEIVED", events)
        self.assertNotIn("WEBHOOK_PROCESSED", events)

    # 10. múltiplos webhooks -> ordenação determinística
    async def test_multiple_webhook_events_deterministic_ordering(self):
        repo = TimelineFakeRepository()
        repo.add_order(
            base_order(status="approved", approved_at="2026-08-01T10:02:00+00:00")
        )
        repo.add_cliente(base_cliente(produto_1_completo_liberado=True))
        repo.add_webhook_events(
            "order-1",
            [
                webhook_event(
                    id="webhook-2",
                    created_at="2026-08-01T10:10:00+00:00",
                    processed_at="2026-08-01T10:11:00+00:00",
                ),
                webhook_event(
                    id="webhook-1",
                    created_at="2026-08-01T10:03:00+00:00",
                    processed_at="2026-08-01T10:04:00+00:00",
                ),
            ],
        )
        response_a = await self._call_with_repo("order-1", repo)

        # segunda chamada, mesma entrada -> mesma sequência.
        repo2 = TimelineFakeRepository()
        repo2.add_order(
            base_order(status="approved", approved_at="2026-08-01T10:02:00+00:00")
        )
        repo2.add_cliente(base_cliente(produto_1_completo_liberado=True))
        repo2.add_webhook_events(
            "order-1",
            [
                webhook_event(
                    id="webhook-2",
                    created_at="2026-08-01T10:10:00+00:00",
                    processed_at="2026-08-01T10:11:00+00:00",
                ),
                webhook_event(
                    id="webhook-1",
                    created_at="2026-08-01T10:03:00+00:00",
                    processed_at="2026-08-01T10:04:00+00:00",
                ),
            ],
        )
        response_b = await self._call_with_repo("order-1", repo2)

        body_a = response_a.json()
        body_b = response_b.json()

        sequence_a = [
            (item["event"], item["occurred_at"], item.get("webhook_event_id"))
            for item in body_a["timeline"]
        ]
        sequence_b = [
            (item["event"], item["occurred_at"], item.get("webhook_event_id"))
            for item in body_b["timeline"]
        ]
        self.assertEqual(sequence_a, sequence_b)

        occurred_ats = [item["occurred_at"] for item in body_a["timeline"]]
        self.assertEqual(occurred_ats, sorted(occurred_ats))

    # 11. current_state de entitlement exposto corretamente
    async def test_current_state_exposes_entitlement(self):
        repo = TimelineFakeRepository()
        repo.add_order(base_order())
        repo.add_cliente(base_cliente(produto_1_completo_liberado=True))
        response = await self._call_with_repo("order-1", repo)

        body = response.json()
        self.assertEqual(body["current_state"]["entitlement_granted"], True)
        self.assertEqual(body["current_state"]["payment_status"], "created")

    # 12. entitlement NÃO aparece como timeline event
    async def test_entitlement_never_appears_as_timeline_event(self):
        repo = TimelineFakeRepository()
        repo.add_order(base_order())
        repo.add_cliente(base_cliente(produto_1_completo_liberado=True))
        response = await self._call_with_repo("order-1", repo)

        body = response.json()
        raw_events = {item["event"] for item in body["timeline"]}
        forbidden = {
            "ENTITLEMENT_GRANTED_VIA_WEBHOOK",
            "ENTITLEMENT_GRANTED",
            "MANUAL_ENTITLEMENT_GRANTED",
        }
        self.assertTrue(raw_events.isdisjoint(forbidden))

    # 13. reconciliation NÃO aparece como timeline event
    async def test_reconciliation_never_appears_as_timeline_event(self):
        repo = TimelineFakeRepository()
        repo.add_order(base_order())
        repo.add_cliente(base_cliente())
        response = await self._call_with_repo("order-1", repo)

        body = response.json()
        raw_events = {item["event"] for item in body["timeline"]}
        forbidden = {
            "ADMIN_RECONCILIATION_RECORDED",
            "RECONCILIATION_ATTEMPTED",
            "RECONCILIATION_SUCCEEDED",
        }
        self.assertTrue(raw_events.isdisjoint(forbidden))

    # 14. limitations presentes e corretas
    async def test_limitations_present_and_correct(self):
        repo = TimelineFakeRepository()
        repo.add_order(base_order())
        repo.add_cliente(base_cliente())
        response = await self._call_with_repo("order-1", repo)

        body = response.json()
        self.assertEqual(
            set(body["limitations"]),
            {
                "entitlement_history_unavailable",
                "reconciliation_not_deterministically_linked_to_order",
            },
        )

    # 14b. product_code legado/desconhecido -> 200 (não 400), sem inferir
    # entitlement, com a limitation adicional sinalizando o mapping ausente.
    async def test_unknown_product_code_returns_200_with_limitation(self):
        repo = TimelineFakeRepository()
        repo.add_order(base_order(product_code="produto_legado_descontinuado"))
        repo.add_cliente(base_cliente())
        response = await self._call_with_repo("order-1", repo)

        self.assertEqual(response.status_code, 200)
        body = response.json()
        self.assertEqual(body["current_state"]["entitlement_granted"], False)
        self.assertIn(
            "entitlement_mapping_unknown_for_product_code",
            body["limitations"],
        )

    def _assert_no_canaries_in_response(self, response: httpx.Response) -> None:
        raw_text = response.text
        for canary in (
            CANARY_EMAIL,
            CANARY_CPF,
            CANARY_AUTHORIZATION,
            CANARY_ACCESS_TOKEN,
            CANARY_REFRESH_TOKEN,
            CANARY_CARD_DATA,
            CANARY_PROVIDER_SECRET,
            "canary_raw_payload_marker",
        ):
            self.assertNotIn(canary, raw_text)

    async def _privacy_response(self) -> httpx.Response:
        repo = TimelineFakeRepository()
        repo.add_order(
            base_order(
                status="approved",
                approved_at="2026-08-01T11:00:00+00:00",
                provider_payment_id="pay-123",
            )
        )
        repo.add_cliente(base_cliente(produto_1_completo_liberado=True))
        repo.add_webhook_events(
            "order-1",
            [webhook_event(processed_at="2026-08-01T11:01:00+00:00")],
        )
        return await self._call_with_repo("order-1", repo)

    # 15. email ausente do response
    async def test_email_absent_from_response(self):
        response = await self._privacy_response()
        self.assertEqual(response.status_code, 200)
        self._assert_no_canaries_in_response(response)
        self.assertNotIn("email", response.json())
        self.assertNotIn("email", response.json()["order"])

    # 16. CPF ausente
    async def test_cpf_absent_from_response(self):
        response = await self._privacy_response()
        self._assert_no_canaries_in_response(response)

    # 17. raw webhook payload ausente
    async def test_raw_webhook_payload_absent_from_response(self):
        response = await self._privacy_response()
        body = response.json()
        for item in body["timeline"]:
            self.assertNotIn("payload_sanitized", item)
            self.assertNotIn("payload", item)
            self.assertNotIn("metadata", item)
        self._assert_no_canaries_in_response(response)

    # 18. tokens/secrets ausentes
    async def test_tokens_and_secrets_absent_from_response(self):
        response = await self._privacy_response()
        self._assert_no_canaries_in_response(response)
        body = response.json()
        self.assertNotIn("access_token", body)
        self.assertNotIn("refresh_token", body)
        self.assertNotIn("authorization", body)
        self.assertNotIn("provider_secret", body)

    # 19. endpoint não chama Mercado Pago
    async def test_endpoint_does_not_call_mercado_pago(self):
        repo = TimelineFakeRepository()
        repo.add_order(base_order())
        repo.add_cliente(base_cliente())

        class ExplodingMercadoPago:
            def __getattr__(self, name):
                async def _fail(*args, **kwargs):
                    raise AssertionError(
                        f"Mercado Pago não deveria ser chamado (método: {name})"
                    )

                return _fail

        with self._authenticated_and_admin(), patch(
            "app.services.payment_service.get_payment_repository",
            return_value=repo,
        ), patch(
            "app.services.payment_service.get_mercado_pago_client",
            return_value=ExplodingMercadoPago(),
        ):
            try:
                response = await self.get("order-1")
            finally:
                self.app.dependency_overrides.clear()

        self.assertEqual(response.status_code, 200)

    # 20. endpoint não chama reconciliation / 21. não chama entitlement grant
    # / 22. nenhum write DB method chamado — provado pela própria
    # TimelineFakeRepository: qualquer chamada de escrita levanta
    # WriteAttemptedError, que faria estes testes (e todos os outros)
    # falharem caso o código de produção tentasse escrever.
    async def test_no_write_repository_method_is_called(self):
        repo = TimelineFakeRepository()
        repo.add_order(
            base_order(status="approved", approved_at="2026-08-01T11:00:00+00:00")
        )
        repo.add_cliente(base_cliente())
        repo.add_webhook_events(
            "order-1",
            [webhook_event(processed_at="2026-08-01T11:01:00+00:00")],
        )
        response = await self._call_with_repo("order-1", repo)

        self.assertEqual(response.status_code, 200)
        # Somente métodos de leitura foram chamados.
        self.assertTrue(set(repo.calls).issubset(
            {"fetch_order_by_id", "list_webhook_events_for_order", "fetch_cliente_by_id"}
        ))
        self.assertIn("fetch_order_by_id", repo.calls)

    # 23. known order sem webhook -> 200, não 500
    async def test_known_order_without_webhook_returns_200(self):
        repo = TimelineFakeRepository()
        repo.add_order(base_order())
        repo.add_cliente(base_cliente())
        response = await self._call_with_repo("order-1", repo)

        self.assertEqual(response.status_code, 200)
        body = response.json()
        events = [item["event"] for item in body["timeline"]]
        self.assertNotIn("WEBHOOK_RECEIVED", events)
        self.assertNotIn("WEBHOOK_PROCESSED", events)

    # 24. timeline possui somente taxonomy V1 permitida
    async def test_timeline_contains_only_v1_taxonomy(self):
        allowed = {
            "ORDER_CREATED",
            "PAYMENT_APPROVED",
            "WEBHOOK_RECEIVED",
            "WEBHOOK_PROCESSED",
        }
        repo = TimelineFakeRepository()
        repo.add_order(
            base_order(status="approved", approved_at="2026-08-01T11:00:00+00:00")
        )
        repo.add_cliente(base_cliente(produto_1_completo_liberado=True))
        repo.add_webhook_events(
            "order-1",
            [
                webhook_event(id="webhook-1"),
                webhook_event(
                    id="webhook-2", processed_at="2026-08-01T11:01:00+00:00"
                ),
            ],
        )
        response = await self._call_with_repo("order-1", repo)

        body = response.json()
        events = {item["event"] for item in body["timeline"]}
        self.assertTrue(events.issubset(allowed))
        self.assertTrue(len(body["timeline"]) > 0)


class AdminPaymentTimelineServiceUnitTest(unittest.IsolatedAsyncioTestCase):
    """Testes diretos da função de serviço `get_payment_timeline`, sem HTTP,
    para validar comportamento de ensure_admin injetável e histórico de
    entitlement ausente."""

    async def test_ensure_admin_forbidden_blocks_before_repository_access(self):
        repo = ExplodingRepository()
        current_user = CurrentUser(user_id="user-x", email="user@example.com")

        with self.assertRaises(HTTPException) as ctx:
            await get_payment_timeline(
                order_id="order-1",
                current_user=current_user,
                repository=repo,
                ensure_admin=fake_ensure_admin_forbidden,
            )

        self.assertEqual(ctx.exception.status_code, 403)

    # histórico de entitlement ausente: apenas current_state + limitation,
    # nunca um evento inventado.
    async def test_entitlement_history_unavailable_only_via_limitation(self):
        repo = TimelineFakeRepository()
        repo.add_order(base_order())
        repo.add_cliente(base_cliente(produto_1_completo_liberado=True))
        current_user = CurrentUser(user_id="admin-1", email="admin@example.com")

        result = await get_payment_timeline(
            order_id="order-1",
            current_user=current_user,
            repository=repo,
            ensure_admin=fake_ensure_admin_ok,
        )

        self.assertEqual(result.current_state.entitlement_granted, True)
        self.assertIn("entitlement_history_unavailable", result.limitations)
        for event in result.timeline:
            self.assertNotIn("ENTITLEMENT", event.event)

    async def test_unknown_order_raises_404_at_service_level(self):
        repo = TimelineFakeRepository()
        current_user = CurrentUser(user_id="admin-1", email="admin@example.com")

        with self.assertRaises(HTTPException) as ctx:
            await get_payment_timeline(
                order_id="missing-order",
                current_user=current_user,
                repository=repo,
                ensure_admin=fake_ensure_admin_ok,
            )

        self.assertEqual(ctx.exception.status_code, 404)


if __name__ == "__main__":
    unittest.main()
