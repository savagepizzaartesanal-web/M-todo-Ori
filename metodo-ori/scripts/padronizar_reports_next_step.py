from __future__ import annotations

import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
REPORTS_PATH = ROOT / "backend" / "app" / "data" / "reports.json"

MARKER = "Seu Código das Deusas revelou a força que organiza sua imagem por dentro."
CANONICAL_NEXT_STEP = (
    "Seu Código das Deusas revelou a força que organiza sua imagem por dentro. "
    "Para preparar o Dossiê ORI, envie fotos com boa luz, rosto limpo, sem maquiagem, "
    "e uma roupa neutra mais ajustada ao corpo. Essas imagens ajudam a próxima leitura "
    "a observar sua presença real sem interferências: corpo, coloração, cabelo, textura, "
    "proporção, contraste e direção estética aplicada. O Dossiê ORI mostra como essa "
    "força aparece na prática: corpo, rosto, cores, cabelo, beleza e presença. "
    "É a próxima etapa para transformar leitura em imagem real."
)


def normalize_value(value):
    if isinstance(value, dict):
        return {key: normalize_value(item) for key, item in value.items()}

    if isinstance(value, list):
        return [normalize_value(item) for item in value]

    if isinstance(value, str) and MARKER in value and "Dossiê ORI" in value:
        before = value.split(MARKER, 1)[0].rstrip()
        return f"{before} {CANONICAL_NEXT_STEP}".strip()

    return value


def main() -> None:
    data = json.loads(REPORTS_PATH.read_text(encoding="utf-8"))
    normalized = normalize_value(data)
    REPORTS_PATH.write_text(
        json.dumps(normalized, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )


if __name__ == "__main__":
    main()
