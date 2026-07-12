import unittest
import json
from pathlib import Path

from app.services.produto2_calculo_service import (
    apply_ancestry_modulation_to_kibbe,
    build_produto2_analise_preliminar,
    calculate_kibbe,
    calculate_patton,
)

FIXTURE_PATH = Path(__file__).parent / "fixtures" / "produto2_planilha_fixture.json"


def build_kibbe_insumos(letter: str, ancestry: str) -> dict:
    fields = [
        "linha_vertical",
        "ombros",
        "bracos_pernas",
        "maos_pes",
        "forma_geral",
        "busto_tronco",
        "cintura",
        "quadris",
        "ganho_peso",
        "mandibula",
        "nariz",
        "macas_rosto",
        "olhos",
        "labios",
    ]
    return {
        "estrutura_corporal": {
            **{field: f"{letter}. Resposta" for field in fields},
            "ancestralidade_fisica": ancestry,
        }
    }


class Produto2CalculoServiceTest(unittest.TestCase):
    def test_kibbe_keeps_structural_scores_and_applies_african_modulation(self):
        result = calculate_kibbe(
            build_kibbe_insumos(
                "C",
                "Predominantemente africana (ossos fortes, volume natural)",
            )
        )

        self.assertEqual(
            result["pontuacoes_estruturais"],
            {
                "dramatic": 0,
                "natural": 0,
                "classic": 14,
                "gamine": 0,
                "romantic": 0,
            },
        )
        self.assertEqual(
            result["pontuacoes_moduladas"],
            {
                "dramatic": 0,
                "natural": 2,
                "classic": 14,
                "gamine": 0,
                "romantic": 2,
            },
        )
        self.assertEqual(result["pontuacoes"], result["pontuacoes_moduladas"])

    def test_kibbe_applies_indigenous_modulation(self):
        result = calculate_kibbe(
            build_kibbe_insumos(
                "C",
                "Predominantemente indígena (estrutura mais compacta)",
            )
        )

        self.assertEqual(result["pontuacoes_estruturais"]["classic"], 14)
        self.assertEqual(result["pontuacoes_moduladas"]["natural"], 2)
        self.assertEqual(result["pontuacoes_moduladas"]["gamine"], 1)

    def test_kibbe_applies_european_and_mixed_modulation(self):
        european = calculate_kibbe(build_kibbe_insumos("C", "Predominantemente europeia"))
        mixed = calculate_kibbe(build_kibbe_insumos("C", "Mista"))

        self.assertEqual(european["pontuacoes_moduladas"]["dramatic"], 1)
        self.assertEqual(mixed["pontuacoes_moduladas"]["dramatic"], 1)

    def test_kibbe_ancestry_modulation_rules_can_accumulate(self):
        result = apply_ancestry_modulation_to_kibbe(
            {
                "dramatic": 0,
                "natural": 0,
                "classic": 0,
                "gamine": 0,
                "romantic": 0,
            },
            "Mista, predominantemente africana e predominantemente indígena",
        )

        self.assertEqual(
            result,
            {
                "dramatic": 1,
                "natural": 2,
                "classic": 0,
                "gamine": 1,
                "romantic": 2,
            },
        )

    def test_kibbe_does_not_modulate_unknown_ancestry(self):
        result = calculate_kibbe(build_kibbe_insumos("C", "Não sei identificar"))

        self.assertEqual(result["pontuacoes_estruturais"], result["pontuacoes_moduladas"])

    def test_patton_is_applicable_only_for_supported_racial_identity_markers(self):
        applicable_values = [
            "Negra (preta ou parda)",
            "preta",
            "parda",
            "miscigenada",
        ]

        for value in applicable_values:
            with self.subTest(value=value):
                self.assertTrue(
                    calculate_patton({"dados_base": {"autoidentificacao_racial": value}})[
                        "aplicavel"
                    ]
                )

        self.assertFalse(
            calculate_patton(
                {
                    "dados_base": {"autoidentificacao_racial": "Branca"},
                    "patton": {"tom_fundo": "", "reflexo_sol": ""},
                }
            )["aplicavel"]
        )

    def test_real_spreadsheet_clients_match_validated_results(self):
        fixtures = json.loads(FIXTURE_PATH.read_text(encoding="utf-8"))

        self.assertEqual(len(fixtures), 11)

        for fixture in fixtures:
            with self.subTest(cliente=fixture["nome"]):
                analysis = build_produto2_analise_preliminar(insumos=fixture["insumos"])
                expected = fixture["expected"]

                self.assertEqual(analysis["kibbe"]["pontuacoes"], expected["kibbe_scores"])
                self.assertEqual(
                    analysis["kibbe"]["pontuacoes_moduladas"],
                    expected["kibbe_scores"],
                )
                self.assertEqual(
                    analysis["kibbe"]["pontuacoes_estruturais"],
                    expected["kibbe_structural_scores"],
                )
                self.assertEqual(analysis["kibbe"]["sugestao"], expected["kibbe"])
                self.assertEqual(
                    analysis["coloracao"]["sugestao_cartela_sazonal"],
                    expected["cartela_sazonal"],
                )
                self.assertEqual(analysis["patton"]["sugestao"], expected["cartela_patton"])
                self.assertEqual(
                    analysis["cabelo"]["perfil_curvatura_densidade"],
                    expected["perfil_curvatura_densidade"],
                )
                self.assertEqual(
                    analysis["cabelo"]["necessidade_tratamento"],
                    expected["necessidade_tratamento"],
                )
                self.assertEqual(
                    analysis["cabelo"]["indice_conexao_moldura"],
                    expected["indice_conexao_moldura"],
                )
                self.assertEqual(
                    analysis["cabelo"]["perfil_rotina"],
                    expected["perfil_rotina"],
                )


if __name__ == "__main__":
    unittest.main()
