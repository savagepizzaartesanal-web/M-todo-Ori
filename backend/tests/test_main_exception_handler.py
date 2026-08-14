"""Tests for the OBS-2 global safe exception handling middleware.

Covers both a set of isolated "lab" ASGI apps that reproduce the exact
architecture validated in OBS-2.2D (CORS -> SafeExceptionMiddleware ->
[outer middleware] -> ExceptionMiddleware -> routes) and the real
``app.main.app`` instance, to make sure the production wiring matches the
validated architecture and that pre-existing behavior (rate limiting, CORS
configuration, route-level errors) is preserved.

A synthetic, clearly-fake canary string is used throughout instead of any
real secret, so tests can assert it never leaks to clients or logs.
"""

from __future__ import annotations

import logging
import os
import unittest
from typing import Any

import httpx
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from starlette.types import Message, Receive, Scope, Send

from app.error_handling import SafeExceptionMiddleware
import app.main as main_module

CANARY = "SECRET_OBS2_CANARY_NOT_REAL_1234"
ALLOWED_ORIGIN = "http://localhost:5173"


class _CapturingLogHandler(logging.Handler):
    def __init__(self) -> None:
        super().__init__()
        self.records: list[logging.LogRecord] = []

    def emit(self, record: logging.LogRecord) -> None:
        self.records.append(record)


class _OuterProbeMiddleware:
    """Stand-in for the outermost layer (equivalent to Starlette's
    ``ServerErrorMiddleware``) used to objectively detect whether a raw
    exception escapes past ``SafeExceptionMiddleware``.
    """

    def __init__(self, app: Any) -> None:
        self.app = app
        self.caught: list[dict[str, str]] = []

    async def __call__(self, scope: Scope, receive: Receive, send: Send) -> None:
        try:
            await self.app(scope, receive, send)
        except Exception as exc:  # noqa: BLE001
            self.caught.append({"class": exc.__class__.__name__, "str": str(exc)})
            raise


class _ValidatedBody(BaseModel):
    value: int


def _build_lab_app() -> FastAPI:
    """CORS -> SafeExceptionMiddleware -> ExceptionMiddleware -> routes."""

    lab_app = FastAPI()

    @lab_app.get("/unexpected-error")
    async def unexpected_error() -> dict:
        raise RuntimeError(f"internal failure detail {CANARY}")

    @lab_app.get("/http-error")
    async def http_error() -> dict:
        raise HTTPException(
            status_code=418,
            detail="teapot from route",
            headers={"X-Route-Header": "route-value"},
        )

    @lab_app.post("/validate")
    async def validate(body: _ValidatedBody) -> dict:
        return {"value": body.value}

    lab_app.add_middleware(SafeExceptionMiddleware)
    lab_app.add_middleware(
        CORSMiddleware,
        allow_origins=[ALLOWED_ORIGIN],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    return lab_app


def _build_outer_http_exception_app() -> FastAPI:
    """CORS -> SafeExceptionMiddleware -> outer HTTPException raiser ->
    ExceptionMiddleware -> routes.

    Mirrors the real architecture where ``rate_limit_requests`` sits
    outside ``ExceptionMiddleware``; here the outer middleware raises an
    ``HTTPException`` directly (instead of returning a JSONResponse) to
    exercise the OBS-2.2D-validated preservation path.
    """

    outer_app = FastAPI()

    @outer_app.get("/normal")
    async def normal() -> dict:
        return {"ok": True}

    @outer_app.middleware("http")
    async def outer_rate_limit_like(request, call_next):
        if request.url.path == "/blocked":
            raise HTTPException(
                status_code=429,
                detail="outer limit reached",
                headers={"Retry-After": "1"},
            )
        return await call_next(request)

    outer_app.add_middleware(SafeExceptionMiddleware)
    outer_app.add_middleware(
        CORSMiddleware,
        allow_origins=[ALLOWED_ORIGIN],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    return outer_app


def _build_outer_probe_app() -> tuple[FastAPI, _OuterProbeMiddleware]:
    lab_app = _build_lab_app()
    probe = _OuterProbeMiddleware(lab_app)
    return lab_app, probe


def _build_late_error_app() -> tuple[FastAPI, _OuterProbeMiddleware]:
    late_app = FastAPI()

    @late_app.get("/late-error")
    async def late_error() -> StreamingResponse:
        async def body():
            yield b"partial-chunk"
            raise RuntimeError(f"late failure {CANARY}")

        return StreamingResponse(body(), media_type="text/plain")

    late_app.add_middleware(SafeExceptionMiddleware)
    probe = _OuterProbeMiddleware(late_app)
    return late_app, probe


class SafeExceptionMiddlewareTest(unittest.IsolatedAsyncioTestCase):
    async def _client(self, asgi_app) -> httpx.AsyncClient:
        transport = httpx.ASGITransport(app=asgi_app)
        return httpx.AsyncClient(transport=transport, base_url="http://testserver")

    # TEST A ---------------------------------------------------------
    async def test_a_unexpected_exception_returns_safe_500(self):
        lab_app = _build_lab_app()
        async with await self._client(lab_app) as client:
            response = await client.get("/unexpected-error")

        self.assertEqual(response.status_code, 500)
        self.assertEqual(response.json(), {"detail": "Internal server error"})
        body_text = response.text
        self.assertNotIn(CANARY, body_text)
        self.assertNotIn("RuntimeError", body_text)
        self.assertNotIn("Traceback", body_text)

    # TEST B ---------------------------------------------------------
    async def test_b_safe_own_logging_has_no_sensitive_data(self):
        handler = _CapturingLogHandler()
        target_logger = logging.getLogger("app.error_handling")
        target_logger.addHandler(handler)
        target_logger.setLevel(logging.ERROR)
        try:
            lab_app = _build_lab_app()
            async with await self._client(lab_app) as client:
                response = await client.get(
                    "/unexpected-error?token=should-not-appear",
                    headers={"Authorization": "Bearer should-not-appear"},
                )
            self.assertEqual(response.status_code, 500)
        finally:
            target_logger.removeHandler(handler)

        self.assertTrue(handler.records, "expected at least one log record")
        record = handler.records[0]

        allowed_keys = {
            "event",
            "exception_class",
            "method",
            "path",
            "src_filename",
            "src_function",
            "src_lineno",
        }
        record_dict = vars(record)
        for key in allowed_keys:
            self.assertIn(key, record_dict)

        self.assertEqual(record_dict["event"], "unhandled_exception")
        self.assertEqual(record_dict["exception_class"], "RuntimeError")
        self.assertEqual(record_dict["path"], "/unexpected-error")

        serialized = " ".join(
            str(value) for value in record_dict.values() if value is not None
        )
        formatted_message = record.getMessage()
        combined = f"{serialized} {formatted_message}"

        self.assertNotIn(CANARY, combined)
        self.assertNotIn("token=should-not-appear", combined)
        self.assertNotIn("Bearer should-not-appear", combined)
        self.assertNotIn("Authorization", combined)
        self.assertNotIn("internal failure detail", combined)
        self.assertNotIn("Traceback", combined)
        # query string must not leak via path
        self.assertNotIn("?", record_dict["path"])

    # TEST C ---------------------------------------------------------
    async def test_c_raw_exception_does_not_escape_safe_middleware(self):
        lab_app, probe = _build_outer_probe_app()
        async with await self._client(probe) as client:
            response = await client.get("/unexpected-error")

        self.assertEqual(response.status_code, 500)
        raw_exception_escapes_safe_middleware = "YES" if probe.caught else "NO"
        self.assertEqual(raw_exception_escapes_safe_middleware, "NO")
        self.assertEqual(probe.caught, [])
        for entry in probe.caught:
            self.assertNotIn(CANARY, entry["str"])

    # TEST D ---------------------------------------------------------
    async def test_d_cors_headers_present_on_safe_500(self):
        lab_app = _build_lab_app()
        async with await self._client(lab_app) as client:
            response = await client.get(
                "/unexpected-error", headers={"Origin": ALLOWED_ORIGIN}
            )

        self.assertEqual(response.status_code, 500)
        self.assertEqual(
            response.headers.get("access-control-allow-origin"), ALLOWED_ORIGIN
        )

    # TEST E ---------------------------------------------------------
    async def test_e_route_http_exception_preserved(self):
        lab_app = _build_lab_app()
        async with await self._client(lab_app) as client:
            response = await client.get("/http-error")

        self.assertEqual(response.status_code, 418)
        self.assertEqual(response.json(), {"detail": "teapot from route"})
        self.assertEqual(response.headers.get("x-route-header"), "route-value")

    # TEST F ---------------------------------------------------------
    async def test_f_outer_middleware_http_exception_preserved(self):
        outer_app = _build_outer_http_exception_app()
        async with await self._client(outer_app) as client:
            response = await client.get("/blocked")

        self.assertEqual(response.status_code, 429)
        self.assertEqual(response.json(), {"detail": "outer limit reached"})
        self.assertEqual(response.headers.get("retry-after"), "1")

        async with await self._client(outer_app) as client:
            normal_response = await client.get("/normal")
        self.assertEqual(normal_response.status_code, 200)
        self.assertEqual(normal_response.json(), {"ok": True})

    # TEST G ---------------------------------------------------------
    async def test_g_request_validation_error_preserved(self):
        lab_app = _build_lab_app()
        async with await self._client(lab_app) as client:
            response = await client.post("/validate", json={"value": "not-an-int"})

        self.assertEqual(response.status_code, 422)
        body = response.json()
        self.assertIn("detail", body)
        self.assertIsInstance(body["detail"], list)

    # TEST H ---------------------------------------------------------
    async def test_h_real_rate_limit_normal_path_unaffected(self):
        main_module.RATE_LIMIT_STATE.clear()
        original_limit = os.environ.get("RATE_LIMIT_REQUESTS")
        os.environ["RATE_LIMIT_REQUESTS"] = "3"
        try:
            async with await self._client(main_module.app) as client:
                statuses = []
                for _ in range(5):
                    response = await client.get("/")
                    statuses.append(response.status_code)
        finally:
            if original_limit is None:
                os.environ.pop("RATE_LIMIT_REQUESTS", None)
            else:
                os.environ["RATE_LIMIT_REQUESTS"] = original_limit
            main_module.RATE_LIMIT_STATE.clear()

        self.assertEqual(statuses[:3], [200, 200, 200])
        self.assertIn(429, statuses[3:])

    # TEST I ---------------------------------------------------------
    async def test_i_late_error_after_response_started_is_reraised_not_double_sent(
        self,
    ):
        late_app, probe = _build_late_error_app()
        handler = _CapturingLogHandler()
        target_logger = logging.getLogger("app.error_handling")
        target_logger.addHandler(handler)
        target_logger.setLevel(logging.ERROR)

        raised: list[BaseException] = []
        try:
            transport = httpx.ASGITransport(app=probe)
            async with httpx.AsyncClient(
                transport=transport, base_url="http://testserver"
            ) as client:
                try:
                    await client.get("/late-error")
                except Exception as exc:  # noqa: BLE001
                    raised.append(exc)
        finally:
            target_logger.removeHandler(handler)

        # The exception must have propagated to the outer probe (re-raised),
        # not been swallowed into a second HTTP response.
        self.assertTrue(probe.caught, "expected the late exception to propagate")
        self.assertEqual(probe.caught[0]["class"], "RuntimeError")

        self.assertTrue(handler.records, "expected a safe late-error log record")
        record_dict = vars(handler.records[0])
        self.assertEqual(
            record_dict["event"], "late_unhandled_exception_after_response_started"
        )
        serialized = " ".join(
            str(value) for value in record_dict.values() if value is not None
        )
        self.assertNotIn(CANARY, serialized)
        # KNOWN_LIMITATION_NOT_BLOCKING_CURRENT_OBS2: once a response has
        # started we cannot send a second HTTP response, so the middleware
        # re-raises the original exception object as-is (its own message
        # may still carry internal detail) so an outer layer (e.g. the
        # real ServerErrorMiddleware/ASGI server) is aware of the failure.
        # Only *our own* safe log output (asserted above) is required to
        # be canary-free.


class MainAppMiddlewareStackTest(unittest.TestCase):
    def test_main_app_registers_safe_exception_middleware_in_expected_order(self):
        classes = [m.cls.__name__ for m in main_module.app.user_middleware]
        self.assertEqual(
            classes,
            ["CORSMiddleware", "SafeExceptionMiddleware", "BaseHTTPMiddleware"],
        )

    def test_main_app_effective_stack_order_matches_validated_architecture(self):
        stack = main_module.app.build_middleware_stack()
        chain: list[str] = []
        node: Any = stack
        for _ in range(10):
            if node is None:
                break
            chain.append(type(node).__name__)
            node = getattr(node, "app", None)

        expected_prefix = [
            "ServerErrorMiddleware",
            "CORSMiddleware",
            "SafeExceptionMiddleware",
            "BaseHTTPMiddleware",
            "ExceptionMiddleware",
        ]
        self.assertEqual(chain[: len(expected_prefix)], expected_prefix)

    def test_main_app_root_route_smoke(self):
        main_module.RATE_LIMIT_STATE.clear()
        transport = httpx.ASGITransport(app=main_module.app)

        async def _call():
            async with httpx.AsyncClient(
                transport=transport, base_url="http://testserver"
            ) as client:
                return await client.get("/")

        import asyncio

        response = asyncio.run(_call())
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["status"], "online")


if __name__ == "__main__":
    unittest.main()
