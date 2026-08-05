import unittest
from types import SimpleNamespace
from unittest.mock import patch

from fastapi import HTTPException

from app.schemas.auth import CurrentUser
from app.services.leitura_service import get_produto1_relatorio
from app.services.produto1_access_service import (
    build_produto1_access_blocks,
    filter_produto1_camadas_for_access,
    filter_produto1_report_for_access,
)
from app.services.produto1_catalogo_service import get_produto1_catalogo


FREE_FRAGMENT = "texto gratuito sintetico"
PREMIUM_FRAGMENTS = {
    "vidaReal": "fragmento premium vida real",
    "sombra": "fragmento premium bloco 02",
    "essenciaImagem": "fragmento premium bloco 03",
    "leituraFinal": "fragmento premium bloco 04",
}


def build_report() -> dict:
    return {
        "reconhecimento": FREE_FRAGMENT,
        "essencia": "base interna gratuita",
        "dinamica": "dinamica psiquica gratuita",
        "vidaReal": PREMIUM_FRAGMENTS["vidaReal"],
        "percebida": "percepcao premium",
        "sombra": PREMIUM_FRAGMENTS["sombra"],
        "padraoRelacional": "padrao premium",
        "caminho": "caminho premium",
        "essenciaImagem": PREMIUM_FRAGMENTS["essenciaImagem"],
        "paleta": "paleta premium",
        "modelagem": "modelagem premium",
        "tecidos": "tecidos premium",
        "beleza": "beleza premium",
        "presenca": "presenca premium",
        "evitar": "evitar premium",
        "formula": "formula premium",
        "leituraFinal": PREMIUM_FRAGMENTS["leituraFinal"],
        "proximoPasso": "proximo passo premium",
    }


class Produto1FreemiumAccessTest(unittest.TestCase):
    def test_entitlement_false_recebe_camadas_gratuitas(self):
        camadas = build_report()

        result = filter_produto1_camadas_for_access(camadas, full_access=False)

        self.assertEqual(
            set(result),
            {"reconhecimento", "essencia", "dinamica"},
        )
        self.assertEqual(result["reconhecimento"], FREE_FRAGMENT)

    def test_entitlement_false_nao_recebe_vida_real(self):
        result = filter_produto1_report_for_access(build_report(), full_access=False)

        self.assertNotIn("vidaReal", result)
        self.assertNotIn(PREMIUM_FRAGMENTS["vidaReal"], str(result))

    def test_entitlement_false_nao_recebe_bloco_02(self):
        result = filter_produto1_report_for_access(build_report(), full_access=False)

        for key in ("sombra", "padraoRelacional", "caminho"):
            self.assertNotIn(key, result)
        self.assertNotIn(PREMIUM_FRAGMENTS["sombra"], str(result))

    def test_entitlement_false_nao_recebe_bloco_03(self):
        result = filter_produto1_report_for_access(build_report(), full_access=False)

        for key in (
            "essenciaImagem",
            "paleta",
            "modelagem",
            "tecidos",
            "beleza",
            "presenca",
        ):
            self.assertNotIn(key, result)
        self.assertNotIn(PREMIUM_FRAGMENTS["essenciaImagem"], str(result))

    def test_entitlement_false_nao_recebe_bloco_04(self):
        result = filter_produto1_report_for_access(build_report(), full_access=False)

        for key in ("evitar", "formula", "leituraFinal", "proximoPasso"):
            self.assertNotIn(key, result)
        self.assertNotIn(PREMIUM_FRAGMENTS["leituraFinal"], str(result))

    def test_areas_bloqueadas_retorna_nomes_sem_texto_premium(self):
        blocks = build_produto1_access_blocks(full_access=False)

        self.assertTrue(any(block["locked"] for block in blocks))
        self.assertIn("Vida real", str(blocks))
        for fragment in PREMIUM_FRAGMENTS.values():
            self.assertNotIn(fragment, str(blocks))

    def test_entitlement_true_recebe_relatorio_completo(self):
        report = build_report()

        result = filter_produto1_report_for_access(report, full_access=True)

        self.assertEqual(result, report)
        self.assertIn("vidaReal", result)
        self.assertIn("leituraFinal", result)

    def test_admin_ou_piloto_com_entitlement_true_recebe_completo(self):
        report = build_report()

        result = filter_produto1_report_for_access(report, full_access=True)

        self.assertEqual(result["sombra"], PREMIUM_FRAGMENTS["sombra"])

    def test_query_parameter_nao_desbloqueia_conteudo(self):
        result = filter_produto1_report_for_access(build_report(), full_access=False)

        self.assertNotIn("vidaReal", result)

    def test_payload_frontend_nao_desbloqueia_conteudo(self):
        frontend_payload = {"produto_1_completo_liberado": True}

        result = filter_produto1_report_for_access(
            {**build_report(), **frontend_payload},
            full_access=False,
        )

        self.assertNotIn("vidaReal", result)
        self.assertNotIn("produto_1_completo_liberado", result)

    def test_resposta_gratuita_nao_contem_fragmentos_premium(self):
        result = filter_produto1_report_for_access(build_report(), full_access=False)

        for fragment in PREMIUM_FRAGMENTS.values():
            self.assertNotIn(fragment, str(result))

    def test_catalogo_publico_nao_entrega_camadas_premium(self):
        catalog = get_produto1_catalogo()

        self.assertTrue(catalog["reports"])
        for report in catalog["reports"].values():
            self.assertEqual(
                set(report),
                {"reconhecimento", "essencia", "dinamica"},
            )


class Produto1FreemiumServiceTest(unittest.IsolatedAsyncioTestCase):
    async def test_cliente_sem_resultado_nao_recebe_relatorio(self):
        current_user = CurrentUser(
            user_id="user-1",
            email="cliente@example.com",
            access_token="token",
        )
        respostas = SimpleNamespace(
            result=None,
            answers={},
            ai_report=None,
            ai_report_key=None,
        )

        with (
            patch("app.services.leitura_service.fetch_current_cliente", return_value={}),
            patch(
                "app.services.leitura_service.get_produto1_respostas",
                return_value=respostas,
            ),
        ):
            with self.assertRaises(HTTPException) as error:
                await get_produto1_relatorio(current_user=current_user)

        self.assertEqual(error.exception.status_code, 409)


if __name__ == "__main__":
    unittest.main()
