import json
from copy import deepcopy
from pathlib import Path

from app.data.quiz import ARCHETYPES, COMBINATIONS, QUESTIONS

CATALOG_VERSION = "2026-07-09"
REPORTS_PATH = Path(__file__).resolve().parents[1] / "data" / "reports.json"
ARCHETYPE_TITLES = {
    "afrodite": "A Magnética",
    "persefone": "A Sensível",
    "hera": "A Soberana",
    "demeter": "A Nutridora",
    "athena": "A Estrategista",
    "artemis": "A Livre",
}


def load_reports() -> dict:
    with REPORTS_PATH.open(encoding="utf-8") as file:
        return json.load(file)


def get_archetypes_catalog() -> dict:
    archetypes = deepcopy(ARCHETYPES)
    for archetype_id, title in ARCHETYPE_TITLES.items():
        if archetype_id in archetypes:
            archetypes[archetype_id]["titulo"] = title
    return archetypes


def get_produto1_catalogo() -> dict:
    reports = load_reports()

    return {
        "version": CATALOG_VERSION,
        "questions": deepcopy(QUESTIONS),
        "total_questions": len(QUESTIONS),
        "archetypes": get_archetypes_catalog(),
        "combinations": deepcopy(COMBINATIONS),
        "reports": reports,
    }


def get_quiz_perguntas() -> dict:
    return {
        "version": CATALOG_VERSION,
        "total": len(QUESTIONS),
        "questions": deepcopy(QUESTIONS),
    }


def get_arquetipos() -> dict:
    return {
        "version": CATALOG_VERSION,
        "archetypes": get_archetypes_catalog(),
    }


def get_combinacoes() -> dict:
    return {
        "version": CATALOG_VERSION,
        "combinations": deepcopy(COMBINATIONS),
    }
