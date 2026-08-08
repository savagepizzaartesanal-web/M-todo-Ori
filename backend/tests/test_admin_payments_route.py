import unittest
from unittest.mock import patch

import httpx
from fastapi import FastAPI

from app.routes.admin_payments import router as admin_payments_router
from app.schemas.auth import CurrentUser
from app.schemas.payments import PaymentReconcileResponse
from app.services.auth_service import get_current_user


def override_current_user() -> CurrentUser:
    return CurrentUser(
        user_id="admin-1",
        email="admin@example.com",
        access_token="admin-token",
    )


class FakeAdminCheckResponse:
    """Simula a resposta do REST do Supabase consultada por
    admin_service.ensure_admin, sem nenhum acesso de rede real."""

    def __init__(self, status_code: int, payload):
        self.status_code = status_code
        self._payload = payload

    def json(self):
        return self._payload


async def fake_non_admin_get(self, url, params=None, headers=None, **kwargs):
    """Substitui httpx.AsyncClient.get — usado apenas pela checagem interna
    de admin_service.ensure_admin neste teste (o cliente ASGI de teste só
    usa .post, nunca .get) — para simular, sem qualquer rede real, um
    usuário autenticado porém com `admin=False` na tabela clientes."""
    return FakeAdminCheckResponse(200, [{"id": "cliente-x", "admin": False}])


class ExplodingRepository:
    """Qualquer atributo acessado vira uma corrotina que falha o teste — usada
    para provar que nenhuma operação de payment_orders/clientes/auditoria foi
    chamada quando ensure_admin já deveria ter barrado a requisição."""

    def __getattr__(self, name):
        async def _fail(*args, **kwargs):
            raise AssertionError(
                f"Repositório de pagamentos não deveria ser chamado (método: {name})"
            )

        return _fail


class ExplodingMercadoPago:
    """Idem, para qualquer chamada ao cliente do Mercado Pago."""

    def __getattr__(self, name):
        async def _fail(*args, **kwargs):
            raise AssertionError(
                f"Mercado Pago não deveria ser chamado (método: {name})"
            )

        return _fail


class AdminPaymentsRouteTest(unittest.IsolatedAsyncioTestCase):
    def setUp(self):
        self.app = FastAPI()
        self.app.include_router(admin_payments_router)
        self.transport = httpx.ASGITransport(app=self.app)

    async def post(self, payload: dict) -> httpx.Response:
        async with httpx.AsyncClient(
            transport=self.transport,
            base_url="http://testserver",
        ) as client:
            return await client.post("/api/admin/payments/reconcile", json=payload)

    # 23. usuário não autenticado
    async def test_reconcile_route_requires_authentication(self):
        response = await self.post({"payment_id": "pay-1"})

        self.assertEqual(response.status_code, 401)

    # 24. usuário autenticado, mas não-admin -> 403 via rota HTTP real,
    # sem mockar reconcile_payment_by_admin nem ensure_admin — só a chamada
    # de rede que ensure_admin faz ao Supabase é interceptada, e as fábricas
    # de repository/mercado_pago são substituídas por dublês que explodem se
    # forem chamadas, provando que nenhuma operação de pagamento ocorreu.
    async def test_reconcile_route_rejects_authenticated_non_admin_over_http(self):
        self.app.dependency_overrides[get_current_user] = override_current_user
        try:
            with patch.dict(
                "os.environ",
                {
                    "SUPABASE_URL": "https://supabase.example.test",
                    "SUPABASE_PUBLISHABLE_KEY": "test-publishable-key",
                },
            ), patch.object(
                httpx.AsyncClient,
                "get",
                fake_non_admin_get,
            ), patch(
                "app.services.payment_service.get_payment_repository",
                return_value=ExplodingRepository(),
            ), patch(
                "app.services.payment_service.get_mercado_pago_client",
                return_value=ExplodingMercadoPago(),
            ):
                response = await self.post({"payment_id": "pay-1"})
        finally:
            self.app.dependency_overrides.clear()

        self.assertEqual(response.status_code, 403)

    # 25. payload com campo extra não permitido -> 422
    async def test_reconcile_route_rejects_extra_fields(self):
        self.app.dependency_overrides[get_current_user] = override_current_user
        try:
            with patch("app.routes.admin_payments.reconcile_payment_by_admin") as mocked:
                async def fail_if_called(**kwargs):
                    raise AssertionError(
                        "Serviço não deveria ser chamado com payload inválido"
                    )

                mocked.side_effect = fail_if_called
                response = await self.post(
                    {"payment_id": "pay-1", "user_id": "someone"}
                )
        finally:
            self.app.dependency_overrides.clear()

        self.assertEqual(response.status_code, 422)

    # 26. payment_id vazio -> rejeição de validação, sem chamar o serviço
    async def test_reconcile_route_rejects_empty_payment_id(self):
        self.app.dependency_overrides[get_current_user] = override_current_user
        try:
            with patch("app.routes.admin_payments.reconcile_payment_by_admin") as mocked:
                async def fail_if_called(**kwargs):
                    raise AssertionError(
                        "Serviço não deveria ser chamado com payment_id vazio"
                    )

                mocked.side_effect = fail_if_called
                response = await self.post({"payment_id": ""})
        finally:
            self.app.dependency_overrides.clear()

        self.assertEqual(response.status_code, 422)

    async def test_reconcile_route_wires_service_response(self):
        self.app.dependency_overrides[get_current_user] = override_current_user
        try:
            with patch("app.routes.admin_payments.reconcile_payment_by_admin") as mocked:
                async def fake(**kwargs):
                    return PaymentReconcileResponse(result="reconciled")

                mocked.side_effect = fake
                response = await self.post({"payment_id": "pay-1"})
        finally:
            self.app.dependency_overrides.clear()

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["result"], "reconciled")


if __name__ == "__main__":
    unittest.main()
