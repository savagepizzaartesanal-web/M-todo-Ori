"""Tests for OBS-4 — Mercado Pago reachability probe in
/health/dependencies.

Covers: /health regression, MP payload semantics (healthy, missing token,
timeout, network error, non-2xx variants, 2xx-not-200 variants), the frozen
external contract (GET /v1/payment_methods, explicit 2.0s timeout, no
business entity id, no mutation), the process-local 30s TTL cache, privacy
of the public payload (no token/Authorization/raw provider body/PII), and
that existing Supabase/AI dependency data stays present even when Mercado
Pago is degraded.

A synthetic, clearly-fake canary token/secrets are used throughout instead
of any real credential, and no real network call to Mercado Pago is ever
made (all httpx.AsyncClient.get calls are patched).
"""

from __future__ import annotations

import unittest
from unittest.mock import patch

import httpx
from fastapi import FastAPI

import app.services.mercado_pago_service as mp_service
from app.routes.health import router as health_router
from app.services.mercado_pago_service import check_mercado_pago_health

FAKE_TOKEN = "FAKE_TEST_ACCESS_TOKEN_NOT_REAL_1234567890"
FAKE_AUTH_HEADER_VALUE = f"Bearer {FAKE_TOKEN}"

# Captured before any test patches httpx.AsyncClient.get, so integration
# tests can still route real ASGI-transport calls (hitting our own FastAPI
# app under test) through the genuine implementation, while only the
# outbound call to the Mercado Pago provider URL is faked.
_ORIGINAL_ASYNC_CLIENT_GET = httpx.AsyncClient.get


def _reset_health_cache() -> None:
    mp_service._health_cache = None


def _build_app() -> FastAPI:
    app = FastAPI()
    app.include_router(health_router)
    return app


def _env_with_token(extra: dict | None = None) -> dict:
    env = {"MERCADO_PAGO_ACCESS_TOKEN": FAKE_TOKEN}
    if extra:
        env.update(extra)
    return env


def _env_without_token() -> dict:
    # Explicitly empty string clears any inherited value under patch.dict.
    return {"MERCADO_PAGO_ACCESS_TOKEN": ""}


class FakeResponse:
    def __init__(self, status_code: int, json_body: dict | None = None, text: str = ""):
        self.status_code = status_code
        self._json_body = json_body if json_body is not None else {}
        self.text = text or str(json_body or "")

    def json(self):
        return self._json_body


class RecordingGet:
    """Records call args/kwargs and returns a canned response or raises.

    Exposes a plain async function via ``as_patch_target`` (not a callable
    class instance) so it binds correctly as an ``AsyncClient.get`` method
    replacement, matching the pattern already used in
    tests/test_payment_service.py.
    """

    def __init__(self, response: FakeResponse | None = None, exc: Exception | None = None):
        self.response = response
        self.exc = exc
        self.calls: list[dict] = []

    def as_patch_target(self):
        async def fake_get(client_self, url, *, headers=None, **kwargs):
            # Only intercept calls aimed at the (fake) Mercado Pago provider
            # URL. Anything else (e.g. the test's own ASGI-transport call
            # into our FastAPI app under test) goes through the real
            # implementation, so both layers can coexist safely.
            if not str(url).startswith(mp_service.MERCADO_PAGO_API_URL):
                return await _ORIGINAL_ASYNC_CLIENT_GET(
                    client_self, url, headers=headers, **kwargs
                )

            self.calls.append(
                {"url": url, "headers": headers, "timeout": client_self.timeout}
            )
            if self.exc is not None:
                raise self.exc
            return self.response

        return fake_get


class HealthEndpointRegressionTest(unittest.IsolatedAsyncioTestCase):
    """Item 1: /health simple endpoint must remain unaffected by OBS-4."""

    async def test_health_endpoint_unchanged(self):
        app = _build_app()
        transport = httpx.ASGITransport(app=app)
        async with httpx.AsyncClient(transport=transport, base_url="http://testserver") as client:
            response = await client.get("/health")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), {"ok": True})
        body = response.text.lower()
        self.assertNotIn("mercado_pago", body)
        self.assertNotIn("supabase", body)


class MercadoPagoHealthProbeTest(unittest.IsolatedAsyncioTestCase):
    def setUp(self):
        _reset_health_cache()

    def tearDown(self):
        _reset_health_cache()

    # Item 3, 6: token missing -> configured=false, reachable=false, no 500.
    async def test_missing_token_reports_not_configured_not_reachable(self):
        with patch.dict("os.environ", _env_without_token()):
            result = await check_mercado_pago_health()

        self.assertEqual(result, {"configured": False, "reachable": False})

    # Item 2: healthy MP.
    async def test_provider_2xx_ok_reports_configured_and_reachable(self):
        fake_get = RecordingGet(response=FakeResponse(200))
        with patch.dict("os.environ", _env_with_token()):
            with patch.object(httpx.AsyncClient, "get", fake_get.as_patch_target()):
                result = await check_mercado_pago_health()

        self.assertEqual(result, {"configured": True, "reachable": True})

    # Item 11: 2xx different from 200 (e.g. 201, 204) still reachable=true.
    async def test_provider_201_is_reachable(self):
        fake_get = RecordingGet(response=FakeResponse(201))
        with patch.dict("os.environ", _env_with_token()):
            with patch.object(httpx.AsyncClient, "get", fake_get.as_patch_target()):
                result = await check_mercado_pago_health()
        self.assertEqual(result, {"configured": True, "reachable": True})

    async def test_provider_204_is_reachable(self):
        fake_get = RecordingGet(response=FakeResponse(204))
        with patch.dict("os.environ", _env_with_token()):
            with patch.object(httpx.AsyncClient, "get", fake_get.as_patch_target()):
                result = await check_mercado_pago_health()
        self.assertEqual(result, {"configured": True, "reachable": True})

    # Item 4: timeout.
    async def test_provider_timeout_reports_unreachable(self):
        fake_get = RecordingGet(exc=httpx.TimeoutException("timed out"))
        with patch.dict("os.environ", _env_with_token()):
            with patch.object(httpx.AsyncClient, "get", fake_get.as_patch_target()):
                result = await check_mercado_pago_health()
        self.assertEqual(result, {"configured": True, "reachable": False})

    # Item 5: network error.
    async def test_provider_network_error_reports_unreachable(self):
        fake_get = RecordingGet(exc=httpx.ConnectError("connection refused"))
        with patch.dict("os.environ", _env_with_token()):
            with patch.object(httpx.AsyncClient, "get", fake_get.as_patch_target()):
                result = await check_mercado_pago_health()
        self.assertEqual(result, {"configured": True, "reachable": False})

    # Items 6-10: non-2xx provider statuses.
    async def test_provider_non_2xx_statuses_report_unreachable(self):
        for status_code in (401, 403, 429, 500, 502, 503, 418):
            with self.subTest(status_code=status_code):
                _reset_health_cache()
                fake_get = RecordingGet(response=FakeResponse(status_code))
                with patch.dict("os.environ", _env_with_token()):
                    with patch.object(httpx.AsyncClient, "get", fake_get.as_patch_target()):
                        result = await check_mercado_pago_health()
                self.assertEqual(result, {"configured": True, "reachable": False})

    # Items 12, 13, 14: frozen external contract.
    async def test_probe_uses_expected_method_path_timeout(self):
        fake_get = RecordingGet(response=FakeResponse(200))
        with patch.dict("os.environ", _env_with_token()):
            with patch.object(httpx.AsyncClient, "get", fake_get.as_patch_target()):
                await check_mercado_pago_health()

        self.assertEqual(len(fake_get.calls), 1)
        call = fake_get.calls[0]
        self.assertEqual(call["url"], f"{mp_service.MERCADO_PAGO_API_URL}/v1/payment_methods")
        self.assertEqual(call["timeout"], httpx.Timeout(2.0))
        # method is implied by using .get() (GET), no business id in the URL.
        self.assertNotIn("payment_id", call["url"])
        self.assertNotIn("customer", call["url"])

    async def test_probe_sends_bearer_authorization_header(self):
        fake_get = RecordingGet(response=FakeResponse(200))
        with patch.dict("os.environ", _env_with_token()):
            with patch.object(httpx.AsyncClient, "get", fake_get.as_patch_target()):
                await check_mercado_pago_health()

        headers = fake_get.calls[0]["headers"]
        self.assertEqual(headers["Authorization"], FAKE_AUTH_HEADER_VALUE)

    # Item 18: probe never calls mutating / business functions.
    async def test_probe_only_calls_get_never_mutating_methods(self):
        with patch.object(mp_service.MercadoPagoClient, "create_preference") as create_pref:
            with patch.object(mp_service.MercadoPagoClient, "get_payment") as get_payment:
                fake_get = RecordingGet(response=FakeResponse(200))
                with patch.dict("os.environ", _env_with_token()):
                    with patch.object(httpx.AsyncClient, "get", fake_get.as_patch_target()):
                        await check_mercado_pago_health()

        create_pref.assert_not_called()
        get_payment.assert_not_called()

    # Items 19, 20: cache hit within TTL, then expiry allows a new probe.
    async def test_cache_hit_within_ttl_avoids_second_probe(self):
        fake_get = RecordingGet(response=FakeResponse(200))
        with patch.dict("os.environ", _env_with_token()):
            with patch.object(httpx.AsyncClient, "get", fake_get.as_patch_target()):
                first = await check_mercado_pago_health()
                second = await check_mercado_pago_health()

        self.assertEqual(first, second)
        self.assertEqual(len(fake_get.calls), 1)

    async def test_cache_expiry_allows_new_probe(self):
        fake_get = RecordingGet(response=FakeResponse(200))
        fake_clock = {"t": 1000.0}

        def fake_monotonic():
            return fake_clock["t"]

        with patch.object(mp_service.time, "monotonic", fake_monotonic):
            with patch.dict("os.environ", _env_with_token()):
                with patch.object(httpx.AsyncClient, "get", fake_get.as_patch_target()):
                    await check_mercado_pago_health()
                    fake_clock["t"] += 31.0
                    await check_mercado_pago_health()

        self.assertEqual(len(fake_get.calls), 2)

    async def test_cache_does_not_store_token_or_secret_fields(self):
        fake_get = RecordingGet(response=FakeResponse(200))
        with patch.dict("os.environ", _env_with_token()):
            with patch.object(httpx.AsyncClient, "get", fake_get.as_patch_target()):
                await check_mercado_pago_health()

        cached = mp_service._health_cache
        self.assertIsNotNone(cached)
        self.assertEqual(set(cached), {"configured", "reachable", "checked_at"})
        serialized = str(cached)
        self.assertNotIn(FAKE_TOKEN, serialized)
        self.assertNotIn("Authorization", serialized)

    # Item 22, 23: no real network call, no real access token — proven by
    # every test above patching httpx.AsyncClient.get and using a fake token.


class MercadoPagoHealthEndpointIntegrationTest(unittest.IsolatedAsyncioTestCase):
    """/health/dependencies aggregation: public payload, HTTP 200 always,
    coexistence with Supabase/AI, and adversarial privacy checks."""

    def setUp(self):
        _reset_health_cache()

    def tearDown(self):
        _reset_health_cache()

    async def _get_dependencies(self, env: dict) -> httpx.Response:
        app = _build_app()
        transport = httpx.ASGITransport(app=app)
        with patch.dict("os.environ", env, clear=False):
            async with httpx.AsyncClient(
                transport=transport, base_url="http://testserver"
            ) as client:
                return await client.get("/health/dependencies")

    async def test_dependencies_endpoint_always_returns_http_200_when_mp_healthy(self):
        fake_get = RecordingGet(response=FakeResponse(200))
        with patch.object(httpx.AsyncClient, "get", fake_get.as_patch_target()):
            response = await self._get_dependencies(_env_with_token())

        self.assertEqual(response.status_code, 200)
        body = response.json()
        self.assertEqual(body["mercado_pago"], {"configured": True, "reachable": True})

    async def test_dependencies_endpoint_returns_http_200_when_mp_token_missing(self):
        response = await self._get_dependencies(_env_without_token())

        self.assertEqual(response.status_code, 200)
        body = response.json()
        self.assertEqual(body["mercado_pago"], {"configured": False, "reachable": False})

    async def test_dependencies_endpoint_returns_http_200_when_mp_degraded(self):
        fake_get = RecordingGet(exc=httpx.TimeoutException("timed out"))
        with patch.object(httpx.AsyncClient, "get", fake_get.as_patch_target()):
            response = await self._get_dependencies(_env_with_token())

        self.assertEqual(response.status_code, 200)
        body = response.json()
        self.assertEqual(body["mercado_pago"], {"configured": True, "reachable": False})

    # Item 21: Supabase/AI data remains present when MP is degraded.
    async def test_degraded_mp_keeps_supabase_and_ai_keys_present(self):
        fake_get = RecordingGet(exc=httpx.ConnectError("boom"))
        with patch.object(httpx.AsyncClient, "get", fake_get.as_patch_target()):
            response = await self._get_dependencies(_env_with_token())

        body = response.json()
        self.assertIn("supabase", body)
        self.assertIn("configured", body["supabase"])
        self.assertIn("reachable", body["supabase"])
        self.assertIn("ai", body)
        self.assertIn("configured", body["ai"])
        self.assertIn("provider", body["ai"])

    # Items 15, 16, 17: no extra unsafe fields in the public MP block.
    async def test_public_mp_payload_only_has_configured_and_reachable_keys(self):
        fake_get = RecordingGet(response=FakeResponse(200))
        with patch.object(httpx.AsyncClient, "get", fake_get.as_patch_target()):
            response = await self._get_dependencies(_env_with_token())

        body = response.json()
        self.assertEqual(set(body["mercado_pago"]), {"configured", "reachable"})

    # Adversarial: synthetic sensitive strings must never leak to the
    # public payload, even when a provider error/body/traceback-like
    # string is present internally.
    async def test_adversarial_sensitive_strings_never_leak_to_public_payload(self):
        fake_auth_leak = "Bearer FAKE_LEAKED_TOKEN_SHOULD_NOT_APPEAR_9999"
        fake_email = "fake.customer.should.not.appear@example.test"
        fake_provider_body = {
            "error": "invalid_token",
            "message": "FAKE_PROVIDER_ERROR_BODY_SHOULD_NOT_APPEAR",
            "authorization": fake_auth_leak,
            "customer_email": fake_email,
        }
        fake_traceback_like = (
            'Traceback (most recent call last):\n  File "fake.py", line 1, '
            "in <module>\nRuntimeError: FAKE_TRACEBACK_SHOULD_NOT_APPEAR"
        )
        fake_get = RecordingGet(
            response=FakeResponse(
                401,
                json_body=fake_provider_body,
                text=fake_traceback_like,
            )
        )
        with patch.object(httpx.AsyncClient, "get", fake_get.as_patch_target()):
            response = await self._get_dependencies(
                _env_with_token({"MERCADO_PAGO_WEBHOOK_SECRET": "FAKE_WEBHOOK_SECRET_9999"})
            )

        self.assertEqual(response.status_code, 200)
        raw_body_text = response.text

        self.assertNotIn(FAKE_TOKEN, raw_body_text)
        self.assertNotIn(fake_auth_leak, raw_body_text)
        self.assertNotIn("Authorization", raw_body_text)
        self.assertNotIn(fake_email, raw_body_text)
        self.assertNotIn("FAKE_PROVIDER_ERROR_BODY_SHOULD_NOT_APPEAR", raw_body_text)
        self.assertNotIn("FAKE_TRACEBACK_SHOULD_NOT_APPEAR", raw_body_text)
        self.assertNotIn("Traceback", raw_body_text)
        self.assertNotIn("FAKE_WEBHOOK_SECRET_9999", raw_body_text)

        body = response.json()
        self.assertEqual(body["mercado_pago"], {"configured": True, "reachable": False})

    # No-write proof at the integration level too.
    async def test_dependencies_endpoint_never_calls_mutating_mp_functions(self):
        with patch.object(mp_service.MercadoPagoClient, "create_preference") as create_pref:
            with patch.object(mp_service.MercadoPagoClient, "get_payment") as get_payment:
                with patch.object(
                    mp_service.MercadoPagoClient, "get_payment_for_reconciliation"
                ) as get_payment_reconcile:
                    fake_get = RecordingGet(response=FakeResponse(200))
                    with patch.object(httpx.AsyncClient, "get", fake_get.as_patch_target()):
                        response = await self._get_dependencies(_env_with_token())

        self.assertEqual(response.status_code, 200)
        create_pref.assert_not_called()
        get_payment.assert_not_called()
        get_payment_reconcile.assert_not_called()


if __name__ == "__main__":
    unittest.main()
