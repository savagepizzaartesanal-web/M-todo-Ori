import unittest

from app.services.produto2_service import merge_produto2_insumos_with_context


class Produto2ServiceTest(unittest.TestCase):
    def test_merge_reimposes_racial_identity_from_onboarding_context(self):
        cliente = {
            "email": "cliente@example.com",
            "perfil_onboarding": {
                "preferredName": "Cliente",
                "racialIdentity": "preta",
            },
        }
        stored_insumos = {
            "dados_base": {
                "nome": "Editado",
                "autoidentificacao_racial": "Branca",
            }
        }

        result = merge_produto2_insumos_with_context(
            stored_insumos=stored_insumos,
            cliente=cliente,
        )

        self.assertEqual(result["dados_base"]["nome"], "Cliente")
        self.assertEqual(
            result["dados_base"]["autoidentificacao_racial"],
            "Negra (preta ou parda)",
        )


if __name__ == "__main__":
    unittest.main()
