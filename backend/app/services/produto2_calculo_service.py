from typing import Any

KIBBE_FIELDS = [
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

KIBBE_KEYS = {
    "A": "dramatic",
    "B": "natural",
    "C": "classic",
    "D": "gamine",
    "E": "romantic",
}

ARCHETYPE_COMBINATIONS = {
    ("afrodite", "hera"): "Rainha Magnética",
    ("afrodite", "demeter"): "Amante Nutridora",
    ("afrodite", "athena"): "Sedutora Estratégica",
    ("afrodite", "artemis"): "Selvagem Magnética",
    ("afrodite", "persefone"): "Musa Enigmática",
    ("persefone", "hera"): "Rainha Oculta",
    ("persefone", "demeter"): "Guardiã Sensível",
    ("persefone", "athena"): "Visionária Sutil",
    ("persefone", "artemis"): "Selvagem Intuitiva",
    ("hera", "demeter"): "Matriarca Soberana",
    ("hera", "athena"): "Soberana Estratégica",
    ("hera", "artemis"): "Soberana Indomável",
    ("demeter", "athena"): "Cuidadora Estratégica",
    ("demeter", "artemis"): "Protetora Selvagem",
    ("athena", "artemis"): "Autônoma Absoluta",
}


def _clean(value: Any) -> str:
    return str(value or "").strip()


def _lower(value: Any) -> str:
    return _clean(value).lower()


def _get(data: dict[str, Any], path: str, fallback: Any = "") -> Any:
    current: Any = data
    for part in path.split("."):
        if not isinstance(current, dict):
            return fallback
        current = current.get(part)
    return fallback if current is None else current


def _choice_letter(value: Any) -> str | None:
    text = _clean(value)
    if not text:
        return None

    first = text[0].upper()
    if first in KIBBE_KEYS and (len(text) == 1 or text[1] in {".", ")", "-", " "}):
        return first

    return None


def _contains(value: Any, *needles: str) -> bool:
    text = _lower(value)
    return any(needle.lower() in text for needle in needles)


def _score_choice(value: Any, negative: str = "A", positive: str = "C") -> int:
    letter = _choice_letter(value)
    if letter == negative:
        return -1
    if letter == positive:
        return 1
    return 0


def calculate_kibbe(insumos: dict[str, Any]) -> dict[str, Any]:
    estrutura = insumos.get("estrutura_corporal") or {}
    scores = {key: 0 for key in KIBBE_KEYS.values()}

    for field in KIBBE_FIELDS:
        letter = _choice_letter(estrutura.get(field))
        if letter:
            scores[KIBBE_KEYS[letter]] += 1

    ancestralidade = _lower(
        estrutura.get("ancestralidade_fisica")
        or _get(insumos, "dados_base.autoidentificacao_racial")
    )

    if "africana" in ancestralidade or "negra" in ancestralidade or "parda" in ancestralidade:
        scores["natural"] += 2
        scores["romantic"] += 2
    if "indigena" in ancestralidade or "indígena" in ancestralidade:
        scores["natural"] += 2
        scores["gamine"] += 1
    if "europeia" in ancestralidade or "branca" in ancestralidade or "mista" in ancestralidade:
        scores["dramatic"] += 1

    max_score = max(scores.values()) if scores else 0
    leaders = [key for key, value in scores.items() if value == max_score and value > 0]

    suggestion = "Inconclusivo"
    if leaders:
        leader = leaders[0]
        if leader == "dramatic":
            suggestion = "Soft Dramatic" if scores["romantic"] >= 3 else "Dramatic"
        elif leader == "natural":
            if scores["dramatic"] > scores["romantic"]:
                suggestion = "Flamboyant Natural"
            elif scores["romantic"] > scores["dramatic"]:
                suggestion = "Soft Natural"
            else:
                suggestion = "Natural"
        elif leader == "classic":
            if scores["dramatic"] > scores["romantic"]:
                suggestion = "Dramatic Classic"
            elif scores["romantic"] > scores["dramatic"]:
                suggestion = "Soft Classic"
            else:
                suggestion = "Classic"
        elif leader == "gamine":
            suggestion = "Soft Gamine" if scores["romantic"] >= scores["dramatic"] else "Flamboyant Gamine"
        elif leader == "romantic":
            suggestion = "Theatrical Romantic" if scores["dramatic"] >= 3 else "Romantic"

    return {
        "pontuacoes": scores,
        "sugestao": suggestion,
        "observacao": (
            "Sugestao preliminar baseada nos sinais informados. "
            "A validacao final depende da leitura visual do admin."
        ),
    }


def calculate_coloracao(insumos: dict[str, Any]) -> dict[str, Any]:
    coloracao = insumos.get("coloracao") or {}
    profundidade = (
        _score_choice(coloracao.get("profundidade"))
        + _score_choice(coloracao.get("contraste_preto_branco"))
    )
    temperatura = (
        _score_choice(coloracao.get("reacao_sol"))
        + _score_choice(coloracao.get("metais"))
        + _score_choice(coloracao.get("azul_laranja"))
        + _score_choice(coloracao.get("veias_subtom"))
    )
    intensidade = (
        _score_choice(coloracao.get("intensidade"))
        + _score_choice(coloracao.get("cores_vibrantes"))
        + _score_choice(coloracao.get("laranja_vibrante"))
    )

    if profundidade == 0 and temperatura == 0 and intensidade == 0:
        suggestion = "Inconclusivo"
    elif abs(profundidade) >= abs(temperatura) and abs(profundidade) >= abs(intensidade):
        suggestion = "Outono Profundo" if profundidade > 0 and temperatura > 0 else (
            "Inverno Profundo" if profundidade > 0 else (
                "Primavera Clara" if temperatura > 0 else "Verão Claro"
            )
        )
    elif abs(temperatura) >= abs(intensidade):
        suggestion = "Outono Quente" if temperatura > 0 and profundidade >= 0 else (
            "Primavera Quente" if temperatura > 0 else "Verão Frio"
        )
    else:
        suggestion = "Primavera Brilhante" if intensidade > 0 and temperatura > 0 else (
            "Inverno Brilhante" if intensidade > 0 else "Suave / verificar presencialmente"
        )

    return {
        "saldo_profundidade_contraste": profundidade,
        "saldo_temperatura": temperatura,
        "saldo_intensidade": intensidade,
        "sugestao_cartela_sazonal": suggestion,
        "observacao": "Leitura cromatica preliminar. Fotos e avaliacao humana seguem necessarias.",
    }


def calculate_patton(insumos: dict[str, Any]) -> dict[str, Any]:
    dados_base = insumos.get("dados_base") or {}
    patton = insumos.get("patton") or {}
    autoidentificacao = _lower(dados_base.get("autoidentificacao_racial"))
    aplicavel = any(
        marker in autoidentificacao
        for marker in ("negra", "preta", "parda", "miscigenada")
    ) or bool(patton)
    source = " ".join(_clean(value) for value in patton.values())

    suggestion = ""
    if _contains(source, "blues"):
        suggestion = "BLUES"
    elif _contains(source, "jazz"):
        suggestion = "JAZZ"
    elif _contains(source, "nilo"):
        suggestion = "NILO"
    elif _contains(source, "saara"):
        suggestion = "SAARA"
    elif _contains(source, "calypso"):
        suggestion = "CALYPSO"
    elif _contains(source, "spice"):
        suggestion = "SPICE"
    elif aplicavel:
        suggestion = "Verificar pela leitura visual"

    return {
        "aplicavel": aplicavel,
        "sugestao": suggestion,
        "observacao": (
            "Patton deve ser usado como refinamento respeitoso para peles negras "
            "ou miscigenadas, nunca como classificacao automatica definitiva."
        ),
    }


def calculate_cabelo(insumos: dict[str, Any]) -> dict[str, Any]:
    cabelo = insumos.get("cabelo") or {}
    curvatura = _clean(cabelo.get("curvatura")) or "Nao informado"
    densidade = _clean(cabelo.get("densidade")) or "Analisar"
    porosidade = cabelo.get("porosidade_absorcao")
    quimica = cabelo.get("saude_quimica")
    moldura = cabelo.get("percepcao_moldura")
    rotina = cabelo.get("tempo_rotina")

    if _contains(porosidade, "alta") or _contains(quimica, "alisado", "descolor", "quim"):
        tratamento = "Foco: Reconstrucao (danos/porosidade)"
    elif _contains(porosidade, "baixa") or _contains(cabelo.get("day_after"), "pesado"):
        tratamento = "Foco: Hidratacao e leveza"
    else:
        tratamento = "Foco: Nutricao e manutencao"

    if _choice_letter(moldura) == "A":
        conexao = "Alta conexao: reforcar a marca registrada"
    elif _choice_letter(moldura) == "B":
        conexao = "Em busca: sugerir ajustes sutis de finalizacao"
    else:
        conexao = "Verificar conexao com a assinatura visual"

    if _contains(rotina, "praticidade", "pouco tempo"):
        perfil_rotina = "Perfil pratico: sugerir produtos multifuncionais"
    elif _contains(rotina, "moderada", "algum tempo"):
        perfil_rotina = "Perfil equilibrado: rotina padrao"
    elif _clean(rotina):
        perfil_rotina = "Perfil elaborado: pode sustentar ritual capilar"
    else:
        perfil_rotina = "Nao informado"

    return {
        "perfil_curvatura_densidade": f"{curvatura} / {densidade}",
        "necessidade_tratamento": tratamento,
        "indice_conexao_moldura": conexao,
        "perfil_rotina": perfil_rotina,
    }


def normalize_archetype_name(value: Any) -> str:
    text = _clean(value)
    replacements = {
        "deméter": "demeter",
        "demeter": "demeter",
        "afrodite": "afrodite",
        "hera": "hera",
        "athena": "athena",
        "artemis": "artemis",
        "perséfone": "persefone",
        "persefone": "persefone",
    }
    return replacements.get(text.lower(), text.lower())


def calculate_arquetipos(
    insumos: dict[str, Any],
    produto1_result: dict[str, Any] | None = None,
    cliente: dict[str, Any] | None = None,
) -> dict[str, Any]:
    essencia = insumos.get("essencia") or {}
    dominant = (
        (produto1_result or {}).get("principal")
        or (cliente or {}).get("arquetipo_principal")
        or essencia.get("deusa_principal")
        or ""
    )
    secondary = (
        (produto1_result or {}).get("secundario")
        or (cliente or {}).get("arquetipo_secundario")
        or essencia.get("deusa_auxiliar")
        or ""
    )
    composite = (
        (produto1_result or {}).get("nomeComposto")
        or (cliente or {}).get("resultado")
        or essencia.get("arquetipo_mesclado")
        or ""
    )

    if not composite and dominant and secondary:
        key = (normalize_archetype_name(dominant), normalize_archetype_name(secondary))
        reverse_key = (key[1], key[0])
        composite = ARCHETYPE_COMBINATIONS.get(key) or ARCHETYPE_COMBINATIONS.get(reverse_key) or ""

    return {
        "dominante": _clean(dominant),
        "auxiliar": _clean(secondary),
        "composto": _clean(composite),
    }


def build_produto2_analise_preliminar(
    *,
    insumos: dict[str, Any],
    produto1_result: dict[str, Any] | None = None,
    cliente: dict[str, Any] | None = None,
) -> dict[str, Any]:
    return {
        "kibbe": calculate_kibbe(insumos),
        "coloracao": calculate_coloracao(insumos),
        "patton": calculate_patton(insumos),
        "cabelo": calculate_cabelo(insumos),
        "arquetipos": calculate_arquetipos(
            insumos,
            produto1_result=produto1_result,
            cliente=cliente,
        ),
    }
