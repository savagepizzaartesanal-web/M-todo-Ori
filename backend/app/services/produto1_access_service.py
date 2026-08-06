from copy import deepcopy
from typing import Any

PRODUTO1_ACCESS_MODE = "freemium"
PRODUTO1_UNLOCK_PRODUCT_CODE = "produto_1_completo"
PRODUTO1_FULL_ENTITLEMENT_KEY = "produto_1_completo_liberado"
PRODUTO1_FIRST_PAYWALL_LAYER_ID = "vidaReal"

PRODUTO1_FREE_LAYER_IDS = ("reconhecimento", "essencia", "dinamica")
PRODUTO1_PREMIUM_LAYER_IDS = (
    "vidaReal",
    "percebida",
    "sombra",
    "padraoRelacional",
    "caminho",
    "essenciaImagem",
    "paleta",
    "modelagem",
    "tecidos",
    "beleza",
    "presenca",
    "evitar",
    "formula",
    "leituraFinal",
    "proximoPasso",
)

PRODUTO1_ACCESS_BLOCKS = (
    {
        "id": "base",
        "title": "Bloco 01 — Base da leitura",
        "layers": (
            ("reconhecimento", "01", "Reconhecimento", False),
            ("essencia", "02", "Base interna", False),
            ("dinamica", "03", "Dinâmica psíquica", False),
            ("vidaReal", "04", "Vida real", True),
            ("percebida", "05", "Percepção", True),
        ),
    },
    {
        "id": "sombra_vinculos",
        "title": "Bloco 02 — Sombra e Vínculos",
        "layers": (
            ("sombra", "06", "Sombra", True),
            ("padraoRelacional", "07", "Padrão relacional", True),
            ("caminho", "08", "Caminho de individuação", True),
        ),
    },
    {
        "id": "imagem_pratica",
        "title": "Bloco 03 — Imagem na prática",
        "layers": (
            ("essenciaImagem", "09", "Essência de imagem", True),
            ("paleta", "10", "Paleta simbólica", True),
            ("modelagem", "11", "Modelagem", True),
            ("tecidos", "12", "Tecidos", True),
            ("beleza", "13", "Beleza", True),
            ("presenca", "14", "Presença", True),
        ),
    },
    {
        "id": "sintese_final",
        "title": "Bloco 04 — Síntese Final",
        "layers": (
            ("evitar", "15", "O que quebra seu arquétipo", True),
            ("formula", "16", "Fórmula", True),
            ("leituraFinal", "17", "Leitura final", True),
            ("proximoPasso", "18", "Próximo passo", True),
        ),
    },
)


def has_produto1_full_access(cliente: dict | None) -> bool:
    return bool((cliente or {}).get(PRODUTO1_FULL_ENTITLEMENT_KEY))


def filter_produto1_camadas_for_access(
    camadas: dict[str, str],
    *,
    full_access: bool,
) -> dict[str, str]:
    if full_access:
        return deepcopy(camadas)

    return {
        key: value
        for key, value in camadas.items()
        if key in PRODUTO1_FREE_LAYER_IDS
    }


def filter_produto1_report_for_access(
    report: dict[str, Any] | None,
    *,
    full_access: bool,
) -> dict[str, Any] | None:
    if report is None:
        return None

    if full_access:
        return deepcopy(report)

    return {
        key: deepcopy(value)
        for key, value in report.items()
        if key in PRODUTO1_FREE_LAYER_IDS
    }


def build_produto1_access_blocks(*, full_access: bool) -> list[dict]:
    blocks = []

    for block in PRODUTO1_ACCESS_BLOCKS:
        layers = []

        for layer_id, label, title, premium in block["layers"]:
            locked = bool(premium and not full_access)
            layers.append(
                {
                    "id": layer_id,
                    "label": label,
                    "title": title,
                    "free": not premium,
                    "locked": locked,
                }
            )

        blocks.append(
            {
                "id": block["id"],
                "title": block["title"],
                "locked": any(layer["locked"] for layer in layers),
                "layers": layers,
            }
        )

    return blocks


def build_produto1_access_payload(*, full_access: bool) -> dict:
    locked_layer_ids = [] if full_access else list(PRODUTO1_PREMIUM_LAYER_IDS)

    return {
        "access_mode": PRODUTO1_ACCESS_MODE,
        "produto_1_completo_liberado": full_access,
        "unlock_product_code": PRODUTO1_UNLOCK_PRODUCT_CODE,
        "first_paywall_layer_id": None
        if full_access
        else PRODUTO1_FIRST_PAYWALL_LAYER_ID,
        "free_layer_ids": list(PRODUTO1_FREE_LAYER_IDS),
        "locked_layer_ids": locked_layer_ids,
        "blocks": build_produto1_access_blocks(full_access=full_access),
    }
