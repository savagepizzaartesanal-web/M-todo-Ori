from __future__ import annotations

import os
import unittest
from datetime import UTC, datetime
from unittest.mock import patch

import httpx
from fastapi import FastAPI

from app.routes import feedback as feedback_route
from app.schemas.auth import CurrentUser

ORIGINAL_ASYNC_CLIENT_POST = httpx.AsyncClient.post


VALID_SURVEY = {
    "recognition": "muito",
    "clarity_loss_location": "transicao_dossie_ori",
    "needed_help": "outro",
    "expectation_fit": "em_parte",
}


class FakeSupabaseResponse:
    def __init__(self, status_code: int, payload):
        self.status_code = status_code
        self._payload = payload
        self.text = ""

    def json(self):
        return self._payload


def build_app() -> FastAPI:
    app = FastAPI()
    app.include_router(feedback_route.router)
    return app


class Produto1MicroSurveyTest(unittest.IsolatedAsyncioTestCase):
    async def asyncSetUp(self):
        self.app = build_app()
        self.transport = httpx.ASGITransport(app=self.app)
        self.env_patch = patch.dict(
            os.environ,
            {
                "SUPABASE_URL": "https://supabase.example.test",
                "SUPABASE_PUBLISHABLE_KEY": "publishable-test-key",
                "SUPABASE_SECRET_KEY": "secret-test-key",
            },
        )
        self.env_patch.start()

    async def asyncTearDown(self):
        self.app.dependency_overrides.clear()
        self.env_patch.stop()

    async def post_json(self, path: str, payload: dict, headers: dict | None = None):
        async with httpx.AsyncClient(
            transport=self.transport,
            base_url="http://testserver",
        ) as client:
            return await client.post(path, json=payload, headers=headers)

    async def test_valid_anonymous_structured_submission(self):
        calls = []

        async def fake_post(self, url, **kwargs):
            if str(url).startswith("/"):
                return await ORIGINAL_ASYNC_CLIENT_POST(self, url, **kwargs)

            calls.append({"url": url, **kwargs})
            return FakeSupabaseResponse(
                201,
                [
                    {
                        "id": "survey-1",
                        **kwargs["json"],
                        "created_at": datetime.now(UTC).isoformat(),
                    },
                ],
            )

        with patch.object(httpx.AsyncClient, "post", fake_post):
            response = await self.post_json(
                "/api/feedback/produto-1/micro-survey",
                VALID_SURVEY,
            )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["recognition"], "muito")
        self.assertEqual(len(calls), 1)
        self.assertEqual(
            calls[0]["url"],
            "https://supabase.example.test/rest/v1/produto_1_micro_surveys",
        )
        self.assertEqual(calls[0]["json"], VALID_SURVEY)

    async def test_invalid_recognition_is_rejected(self):
        response = await self.post_json(
            "/api/feedback/produto-1/micro-survey",
            {**VALID_SURVEY, "recognition": "totalmente"},
        )

        self.assertEqual(response.status_code, 422)

    async def test_invalid_clarity_loss_location_is_rejected(self):
        response = await self.post_json(
            "/api/feedback/produto-1/micro-survey",
            {**VALID_SURVEY, "clarity_loss_location": "p2"},
        )

        self.assertEqual(response.status_code, 422)

    async def test_invalid_needed_help_is_rejected(self):
        response = await self.post_json(
            "/api/feedback/produto-1/micro-survey",
            {**VALID_SURVEY, "needed_help": "texto_livre"},
        )

        self.assertEqual(response.status_code, 422)

    async def test_invalid_expectation_fit_is_rejected(self):
        response = await self.post_json(
            "/api/feedback/produto-1/micro-survey",
            {**VALID_SURVEY, "expectation_fit": "talvez"},
        )

        self.assertEqual(response.status_code, 422)

    async def test_extra_field_is_rejected(self):
        response = await self.post_json(
            "/api/feedback/produto-1/micro-survey",
            {**VALID_SURVEY, "session_id": "session-1"},
        )

        self.assertEqual(response.status_code, 422)

    async def test_comment_style_field_is_rejected(self):
        response = await self.post_json(
            "/api/feedback/produto-1/micro-survey",
            {**VALID_SURVEY, "comment": "queria explicar com texto"},
        )

        self.assertEqual(response.status_code, 422)

    async def test_auth_is_not_required_for_micro_survey(self):
        async def fake_post(self, url, **kwargs):
            if str(url).startswith("/"):
                return await ORIGINAL_ASYNC_CLIENT_POST(self, url, **kwargs)

            return FakeSupabaseResponse(
                201,
                [
                    {
                        "id": "survey-2",
                        **kwargs["json"],
                        "created_at": datetime.now(UTC).isoformat(),
                    },
                ],
            )

        with patch.object(httpx.AsyncClient, "post", fake_post):
            response = await self.post_json(
                "/api/feedback/produto-1/micro-survey",
                VALID_SURVEY,
            )

        self.assertEqual(response.status_code, 200)

    async def test_persisted_data_contains_no_application_identity_or_result_fields(self):
        calls = []

        async def fake_post(self, url, **kwargs):
            if str(url).startswith("/"):
                return await ORIGINAL_ASYNC_CLIENT_POST(self, url, **kwargs)

            calls.append(kwargs["json"])
            return FakeSupabaseResponse(
                201,
                [
                    {
                        "id": "survey-3",
                        **kwargs["json"],
                        "created_at": datetime.now(UTC).isoformat(),
                    },
                ],
            )

        with patch.object(httpx.AsyncClient, "post", fake_post):
            response = await self.post_json(
                "/api/feedback/produto-1/micro-survey",
                VALID_SURVEY,
            )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(set(calls[0].keys()), set(VALID_SURVEY.keys()))
        forbidden = {
            "email",
            "user_id",
            "order_id",
            "session_id",
            "resultado",
            "result",
            "payload",
            "ai_report",
            "gemini_model",
            "model",
        }
        self.assertTrue(forbidden.isdisjoint(calls[0].keys()))

    async def test_result_payload_and_scoring_fields_are_rejected(self):
        for field in ("resultado", "payload", "score", "answers"):
            response = await self.post_json(
                "/api/feedback/produto-1/micro-survey",
                {**VALID_SURVEY, field: "blocked"},
            )
            self.assertEqual(response.status_code, 422)

    async def test_existing_product_1_feedback_route_still_requires_auth(self):
        response = await self.post_json(
            "/api/feedback/produto-1",
            {
                "context": "produto-1-leitura",
                "response": "me_senti_vista",
                "comment": "comentario antigo permitido",
            },
        )

        self.assertEqual(response.status_code, 401)

    async def test_existing_product_1_feedback_route_behavior_is_preserved(self):
        calls = []

        async def fake_current_user():
            return CurrentUser(
                user_id="user-1",
                email="cliente@example.test",
                access_token="token-test",
        )

        async def fake_post(self, url, **kwargs):
            if str(url).startswith("/"):
                return await ORIGINAL_ASYNC_CLIENT_POST(self, url, **kwargs)

            calls.append({"url": url, **kwargs})
            return FakeSupabaseResponse(
                201,
                [
                    {
                        **kwargs["json"],
                        "created_at": datetime.now(UTC).isoformat(),
                        "updated_at": datetime.now(UTC).isoformat(),
                    },
                ],
            )

        self.app.dependency_overrides[feedback_route.get_current_user] = (
            fake_current_user
        )

        old_payload = {
            "context": "produto-1-leitura",
            "response": "me_senti_vista",
            "comment": "comentario antigo permitido",
            "resultado": "Selvagem Intuitiva",
            "payload": {
                "page": "produto-1-leitura",
                "completedAt": datetime.now(UTC).isoformat(),
            },
        }

        with patch.object(httpx.AsyncClient, "post", fake_post):
            response = await self.post_json(
                "/api/feedback/produto-1",
                old_payload,
                headers={"Authorization": "Bearer token-test"},
            )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            calls[0]["url"],
            "https://supabase.example.test/rest/v1/produto_1_feedbacks",
        )
        self.assertEqual(calls[0]["json"]["user_id"], "user-1")
        self.assertEqual(calls[0]["json"]["email"], "cliente@example.test")
        self.assertEqual(calls[0]["json"]["comment"], old_payload["comment"])
        self.assertEqual(calls[0]["json"]["resultado"], old_payload["resultado"])


if __name__ == "__main__":
    unittest.main()
