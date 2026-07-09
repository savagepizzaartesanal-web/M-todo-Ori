from __future__ import annotations

import json
import re
from collections import Counter, defaultdict
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
FRONTEND = ROOT / "metodo-ori"
JSON_PATH = FRONTEND / "revisao" / "revisao-comunicacao-textos-sistema.json"
OUT_PATH = FRONTEND / "revisao" / "inventario-textos-estaticos-atualizado.md"

TECH_TERMS = {
    "sistema": re.compile(r"\bsistema\b", re.I),
    "cálculo/calculado": re.compile(r"\bc[aá]lcul[oa]|\bcalculad[oa]s?\b", re.I),
    "erro ao": re.compile(r"\berro ao\b", re.I),
    "sincronização/sincronizar": re.compile(r"\bsincroniza(?:ção|r|ndo|do|da)?\b", re.I),
    "API": re.compile(r"\bAPI\b"),
    "Supabase": re.compile(r"\bSupabase\b"),
    "Google": re.compile(r"\bGoogle\b"),
    "backend": re.compile(r"\bbackend\b", re.I),
    "Storage/bucket": re.compile(r"\b(?:storage|bucket)\b", re.I),
    "IA/inteligência artificial": re.compile(r"\bIA\b|intelig[eê]ncia artificial", re.I),
    "admin": re.compile(r"\badmin(?:istrativo|istração)?\b", re.I),
}

CONCEPT_GROUPS = {
    "Produto 1 / Código das Deusas / primeira leitura / leitura arquetípica": [
        "Produto 1",
        "Código das Deusas",
        "primeira leitura",
        "Leitura arquetípica",
        "leitura arquetípica",
    ],
    "Produto 2 / Dossiê ORI / leitura visual / próxima leitura": [
        "Produto 2",
        "Dossiê ORI",
        "leitura visual",
        "próxima leitura",
    ],
    "Produto 3 / Código Final / Cápsula / aplicação final": [
        "Produto 3",
        "Código Final",
        "Cápsula",
        "cápsula",
        "aplicação final",
    ],
    "Portal / Átrio ORI / jornada": ["Portal", "Átrio ORI", "jornada"],
    "Onboarding / Entrada ORI / perfil": ["Onboarding", "Entrada ORI", "perfil"],
    "Relatório / leitura / resultado": ["Relatório", "relatório", "leitura", "resultado"],
    "Oráculo / carta diária / leitura salva": ["Oráculo", "carta diária", "leitura salva"],
    "Status de entrega": ["liberado", "em análise", "publicado", "selado", "disponível"],
}

CONSOLE_OR_INTERNAL = (
    "API ",
    "Erro ao ",
    "Erro no ",
    "Histórico administrativo indisponível:",
    "Não foi possível sincronizar leitura local:",
    "Retorno upsert",
    "Leitura personalizada do backend",
    "Feedback salvo indisponível",
    "Mapa Vivo indisponível",
    "Carta diária mantida localmente",
    "Nenhum usuário logado",
)

INTERNAL_PROMPT_MARKERS = (
    "assistente editorial interna",
    "Responda apenas JSON",
    "Não mencione nomes internos",
    "não resuma todo o relatório",
    "diretrizes editoriais recebidas",
    "resultado arquetípico já calculada",
)

STOPWORDS = {
    "a",
    "as",
    "ao",
    "aos",
    "da",
    "das",
    "de",
    "do",
    "dos",
    "e",
    "em",
    "na",
    "nas",
    "no",
    "nos",
    "o",
    "os",
    "para",
    "por",
    "que",
    "sua",
    "seu",
    "suas",
    "seus",
    "uma",
    "um",
}


def load_items() -> list[dict]:
    return json.loads(JSON_PATH.read_text(encoding="utf-8"))


def is_visible_or_revisable(item: dict) -> bool:
    text = item["text"].strip()
    source = item["source"]
    if not text:
        return False
    if "admin_ai_service.py" in source or "method_ori_product" in source:
        return False
    if "backend/app/services/leitura_service.py" in source and any(
        marker in text for marker in INTERNAL_PROMPT_MARKERS
    ):
        return False
    if text == "id,admin":
        return False
    if item["kind"] == "string" and text.startswith(CONSOLE_OR_INTERNAL):
        return False
    if any(marker in text for marker in ("className=", "</", "=>", "const ", "return ")):
        return False
    return True


def examples(items: list[dict], pattern: re.Pattern, limit: int = 6) -> list[str]:
    found = []
    for item in items:
        if pattern.search(item["text"]):
            found.append(
                f"`{item['source']}:{item['line']}` “{item['text']}”"
            )
        if len(found) >= limit:
            break
    return found


def concept_examples(items: list[dict], term: str, limit: int = 4) -> list[str]:
    pattern = re.compile(re.escape(term), re.I)
    return examples(items, pattern, limit)


def exact_repetitions(items: list[dict]) -> list[str]:
    by_text = defaultdict(list)
    for item in items:
        text = item["text"].strip()
        if len(text) < 4:
            continue
        by_text[text].append(item)

    rows = []
    for text, occurrences in sorted(
        by_text.items(), key=lambda pair: (-len(pair[1]), pair[0].lower())
    ):
        if len(occurrences) < 3:
            continue
        refs = "; ".join(
            f"`{item['source']}:{item['line']}`" for item in occurrences[:8]
        )
        rows.append(f"- “{text}” — {len(occurrences)} ocorrência(s): {refs}")
        if len(rows) >= 35:
            break
    return rows


def similar_families(items: list[dict]) -> list[str]:
    families = defaultdict(list)
    for item in items:
        words = re.findall(r"[A-Za-zÀ-ÿ0-9]+", item["text"].lower())
        key_words = [word for word in words if word not in STOPWORDS and len(word) > 2]
        if len(key_words) < 7:
            continue
        key = " ".join(key_words[:7])
        families[key].append(item)

    rows = []
    for key, occurrences in sorted(
        families.items(), key=lambda pair: (-len(pair[1]), pair[0])
    ):
        if len(occurrences) < 2:
            continue
        snippets = "; ".join(
            f"`{item['source']}:{item['line']}` “{item['text']}”"
            for item in occurrences[:3]
        )
        rows.append(f"- Família `{key}` — {len(occurrences)} ocorrência(s): {snippets}")
        if len(rows) >= 35:
            break
    return rows


def error_message_rows() -> list[str]:
    rows = []
    for path in [ROOT / "metodo-ori" / "src", ROOT / "backend" / "app"]:
        for file_path in path.rglob("*"):
            if file_path.suffix not in {".js", ".jsx", ".py"}:
                continue
            try:
                lines = file_path.read_text(encoding="utf-8").splitlines()
            except UnicodeDecodeError:
                continue
            for number, line in enumerate(lines, start=1):
                if "error.message" in line or "str(exc)" in line:
                    rel = file_path.relative_to(ROOT).as_posix()
                    excerpt = line.strip().replace("|", "\\|")
                    observation = (
                        "Usado para mapear erro externo; revisar fallback."
                        if "error.message" in line
                        else "Backend retorna detalhe de exceção bruto."
                    )
                    rows.append(f"| `{rel}` | {number} | `{excerpt}` | {observation} |")
    return rows


def build_markdown() -> str:
    raw_items = load_items()
    items = [item for item in raw_items if is_visible_or_revisable(item)]
    lines = [
        "# Inventário completo atualizado de textos estáticos visíveis - Método ORI",
        "",
        "Gerado a partir do estado atual do repositório. A base bruta foi atualizada em `metodo-ori/revisao/revisao-comunicacao-textos-sistema.json`; este Markdown filtra trechos internos óbvios de console, JSX capturado por engano e prompts internos que não são interface.",
        "",
        f"- Trechos únicos da extração bruta: `{len(raw_items)}`",
        f"- Trechos mantidos neste inventário visível/revisável: `{len(items)}`",
        "- Escopo: login/cadastro, onboarding, Portal/Átrio ORI, Produto 1 completo, Relatório/PDF, Espelho ORI, Oráculo, Produto 2, Produto 3, página do método, componentes compartilhados, dados editoriais e telas de admin.",
        "- Observação: textos dinâmicos vindos do banco, nomes de clientes, valores digitados e conteúdos publicados manualmente pelo admin aparecem como variáveis ou fontes de conteúdo, não como texto estático fixo.",
        "",
        "## Sinalizações",
        "",
        "### Palavras técnicas/de sistema visíveis ou revisáveis",
        "",
        "| Termo | Ocorrências | Exemplos |",
        "| --- | ---: | --- |",
    ]

    for label, pattern in TECH_TERMS.items():
        matches = [item for item in items if pattern.search(item["text"])]
        sample = "<br>".join(examples(items, pattern)) if matches else ""
        lines.append(f"| {label} | {len(matches)} | {sample} |")

    lines.extend(["", "### Mesmo conceito nomeado de formas diferentes", ""])
    for title, terms in CONCEPT_GROUPS.items():
        lines.extend([f"#### {title}"])
        for term in terms:
            pattern = re.compile(re.escape(term), re.I)
            matches = [item for item in items if pattern.search(item["text"])]
            if not matches:
                continue
            sample = "; ".join(concept_examples(items, term))
            lines.append(f"- `{term}`: {len(matches)} ocorrência(s). {sample}")
        lines.append("")

    lines.extend(["### Textos muito parecidos que poderiam ser unificados", ""])
    lines.extend(["#### Repetições exatas entre arquivos"])
    lines.extend(exact_repetitions(items) or ["- Nenhuma repetição exata relevante encontrada."])
    lines.extend(["", "#### Famílias de textos parecidos"])
    lines.extend(similar_families(items) or ["- Nenhuma família relevante encontrada."])

    lines.extend(
        [
            "",
            "### Possível exposição de `error.message` bruto ou detalhe técnico",
            "",
            "| Arquivo | Linha | Trecho | Observação |",
            "| --- | ---: | --- | --- |",
        ]
    )
    rows = error_message_rows()
    lines.extend(rows or ["| - | - | - | Nenhuma ocorrência encontrada. |"])

    lines.extend(["", "## Inventário por página/arquivo", ""])
    pages = defaultdict(lambda: defaultdict(list))
    for item in items:
        pages[item["page"]][item["source"]].append(item)

    for page in sorted(pages):
        lines.extend([f"## {page}", ""])
        for source in sorted(pages[page]):
            lines.extend([f"### `{source}`", ""])
            for item in sorted(pages[page][source], key=lambda entry: entry["line"]):
                escaped = item["text"].replace("`", "\\`")
                lines.append(f"- Linha {item['line']} [{item['kind']}]: `{escaped}`")
            lines.append("")

    return "\n".join(lines).rstrip() + "\n"


def main() -> None:
    markdown = build_markdown()
    OUT_PATH.write_text(markdown, encoding="utf-8")
    print(OUT_PATH)
    print(markdown.count("\n") + 1)


if __name__ == "__main__":
    main()
