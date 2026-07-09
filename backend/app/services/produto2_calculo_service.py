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

PATTON_RACIAL_MARKERS = ("negra", "preta", "parda", "miscigenada")

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


def _score_letter(value: Any, scores: dict[str, int]) -> int:
    letter = _choice_letter(value)
    return scores.get(letter or "", 0)


def is_patton_applicable(insumos: dict[str, Any]) -> bool:
    dados_base = insumos.get("dados_base") or {}
    autoidentificacao = _lower(dados_base.get("autoidentificacao_racial"))
    return any(marker in autoidentificacao for marker in PATTON_RACIAL_MARKERS)


def _resolve_kibbe_suggestion(scores: dict[str, int]) -> tuple[str, list[str]]:
    max_score = max(scores.values()) if scores else 0
    leaders = [key for key, value in scores.items() if value == max_score and value > 0]

    suggestion = "Inconclusivo"
    if max_score <= 0:
        return suggestion, leaders

    if scores["dramatic"] == max_score:
        suggestion = "Soft Dramatic" if scores["romantic"] >= 3 else "Dramatic"
    elif scores["natural"] == max_score:
        if scores["dramatic"] > scores["romantic"]:
            suggestion = "Flamboyant Natural"
        elif scores["romantic"] > scores["dramatic"]:
            suggestion = "Soft Natural"
        else:
            suggestion = "Natural"
    elif scores["classic"] == max_score:
        if scores["dramatic"] > scores["romantic"]:
            suggestion = "Dramatic Classic"
        elif scores["romantic"] > scores["dramatic"]:
            suggestion = "Soft Classic"
        else:
            suggestion = "Classic"
    elif scores["gamine"] == max_score:
        if scores["dramatic"] > scores["romantic"]:
            suggestion = "Flamboyant Gamine"
        elif scores["romantic"] > scores["dramatic"]:
            suggestion = "Soft Gamine"
        else:
            suggestion = "Gamine"
    elif scores["romantic"] == max_score:
        suggestion = "Theatrical Romantic" if scores["dramatic"] >= 3 else "Romantic"

    return suggestion, leaders


def calculate_kibbe(insumos: dict[str, Any]) -> dict[str, Any]:
    estrutura = insumos.get("estrutura_corporal") or {}
    structural_scores = {key: 0 for key in KIBBE_KEYS.values()}
    answered_count = 0

    for field in KIBBE_FIELDS:
        letter = _choice_letter(estrutura.get(field))
        if letter:
            structural_scores[KIBBE_KEYS[letter]] += 1
            answered_count += 1

    scores = dict(structural_scores)
    suggestion, leaders = _resolve_kibbe_suggestion(scores)

    return {
        "pontuacoes": scores,
        "pontuacoes_estruturais": structural_scores,
        "pontuacoes_moduladas": scores,
        "respostas_validas": answered_count,
        "total_campos": len(KIBBE_FIELDS),
        "empate": leaders if len(leaders) > 1 else [],
        "sugestao": suggestion,
        "observacao": (
            "Sugestao preliminar baseada nos sinais corporais informados, seguindo "
            "a pontuacao estrutural da planilha original. "
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
        + _score_choice(coloracao.get("batons"))
        + _score_choice(coloracao.get("nude"))
        + _score_choice(coloracao.get("gengiva_labios"))
        + _score_choice(coloracao.get("laranja_vibrante"))
    )
    intensidade = (
        _score_choice(coloracao.get("intensidade"))
        + _score_letter(coloracao.get("batons"), {"B": -1})
        + _score_choice(coloracao.get("cores_vibrantes"))
        + _score_choice(coloracao.get("brilho_texturas"))
    )

    if profundidade == 0 and temperatura == 0 and intensidade == 0:
        suggestion = "Inconclusivo"
    elif abs(profundidade) >= abs(temperatura) and abs(profundidade) >= abs(intensidade):
        suggestion = (
            "Outono Profundo" if profundidade > 0 and temperatura > 0
            else "Inverno Profundo" if profundidade > 0
            else "Primavera Clara" if temperatura > 0
            else "Verão Claro"
        )
    elif abs(temperatura) >= abs(intensidade):
        suggestion = (
            "Primavera Quente" if temperatura > 0 and intensidade > 0
            else "Outono Quente" if temperatura > 0
            else "Inverno Frio" if intensidade > 0
            else "Verão Frio"
        )
    else:
        suggestion = (
            "Primavera Brilhante" if intensidade > 0 and temperatura > 0
            else "Inverno Brilhante" if intensidade > 0
            else "Outono Suave" if temperatura > 0
            else "Verão Suave"
        )

    return {
        "saldo_profundidade_contraste": profundidade,
        "saldo_temperatura": temperatura,
        "saldo_intensidade": intensidade,
        "sugestao_cartela_sazonal": suggestion,
        "observacao": "Leitura cromatica preliminar. Fotos e avaliacao humana seguem necessarias.",
    }


def calculate_patton(insumos: dict[str, Any]) -> dict[str, Any]:
    patton = insumos.get("patton") or {}
    aplicavel = is_patton_applicable(insumos)
    source = _clean(patton.get("reflexo_sol"))

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
    else:
        suggestion = "Verificar"

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
    curvatura_source = cabelo.get("curvatura")
    densidade_source = cabelo.get("densidade")
    if _contains(curvatura_source, "liso"):
        curvatura = "Liso"
    elif _contains(curvatura_source, "ondulado"):
        curvatura = "Ondulado"
    elif _contains(curvatura_source, "cacheado"):
        curvatura = "Cacheado"
    elif _contains(curvatura_source, "crespo"):
        curvatura = "Crespo"
    else:
        curvatura = "Transição/Outro"

    if _contains(densidade_source, "pouco"):
        densidade = "Pouco Cabelo"
    elif _contains(densidade_source, "médio", "medio"):
        densidade = "Densidade Média"
    elif _contains(densidade_source, "muito"):
        densidade = "Muito Cabelo"
    else:
        densidade = "Analisar"

    porosidade = cabelo.get("porosidade_absorcao")
    espessura = cabelo.get("espessura_fio")
    quimica = cabelo.get("saude_quimica")
    moldura = cabelo.get("percepcao_moldura")
    rotina = cabelo.get("tempo_rotina")

    if _contains(porosidade, "alta") or _contains(quimica, "alisado", "descolor", "quim"):
        tratamento = "Foco: Reconstrução (Danos/Porosidade)"
    elif _contains(porosidade, "baixa") or _contains(espessura, "grosso"):
        tratamento = "Foco: Hidratação Profunda (Dificuldade de absorção)"
    else:
        tratamento = "Foco: Nutrição e Manutenção"

    if _choice_letter(moldura) == "A":
        conexao = "Alta Conexão: Reforçar a marca registrada"
    elif _choice_letter(moldura) == "B":
        conexao = "Em Busca: Sugerir ajustes sutis de finalização"
    elif _choice_letter(moldura) == "C":
        conexao = "Desconexão: Foco em Transformação e Aceitação"
    else:
        conexao = "Verificar conexão com a assinatura visual"

    if _contains(rotina, "praticidade", "pouco tempo"):
        perfil_rotina = "Perfil Prático: Sugerir produtos multifuncionais"
    elif _contains(rotina, "moderada", "algum tempo"):
        perfil_rotina = "Perfil Equilibrado: Rotina padrão"
    elif _contains(rotina, "ritual"):
        perfil_rotina = "Perfil Ritualístico: Detalhar fitagem e cronograma"
    else:
        perfil_rotina = "Não informado"

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
