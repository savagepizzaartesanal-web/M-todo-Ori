import json

from app.data.quiz import QUESTIONS
from app.schemas.auth import CurrentUser
from app.schemas.produto1 import (
    Produto1LeituraHighlight,
    Produto1LeituraPerfil,
    Produto1LeituraResponse,
)
from app.services.jornada_service import fetch_current_cliente
from app.services.produto1_service import get_produto1_respostas

BLOCK_MEANINGS = {
    "Sua Presença": "como sua presença chega antes da explicação",
    "Seu Estilo": "como sua imagem tenta se organizar no vestir",
    "Seu Corpo": "como corpo, postura e movimento entram na leitura",
    "Seus Relacionamentos": "como vínculo, espaço e troca aparecem no seu campo",
    "Seu Mundo Interno": "como desejo, controle, imaginação e direção operam por dentro",
    "Seus Padrões": "onde a força pode virar defesa, excesso ou ruído",
}

ARCHETYPE_TONE = {
    "afrodite": "magnetismo, prazer, beleza e desejo de conexão",
    "persefone": "profundidade, intuição, recolhimento e mundo interno",
    "hera": "dignidade, reconhecimento, posição e compromisso",
    "demeter": "cuidado, vínculo, acolhimento e sustentação",
    "athena": "clareza, estratégia, leitura de contexto e controle",
    "artemis": "liberdade, território, movimento e autonomia",
}


def get_answer_value(answers: dict, question_id: int) -> int:
    return int(answers.get(str(question_id)) or answers.get(question_id) or 0)


def parse_profile(profile_data) -> dict:
    if not profile_data:
        return {}

    if isinstance(profile_data, dict):
        return profile_data

    try:
        return json.loads(profile_data)
    except (TypeError, json.JSONDecodeError):
        return {}


def format_profile_value(value) -> str | None:
    if isinstance(value, list):
        clean_values = [str(item).strip() for item in value if str(item).strip()]
        return ", ".join(clean_values) if clean_values else None

    if value is None:
        return None

    clean_value = str(value).strip()
    return clean_value or None


def get_profile_context(cliente: dict | None) -> Produto1LeituraPerfil:
    profile = parse_profile(cliente.get("perfil_onboarding") if cliente else None)
    pain = format_profile_value(profile.get("mainPain"))

    if pain == "Quero escrever com minhas palavras":
        pain = format_profile_value(profile.get("mainPainCustom")) or pain

    return Produto1LeituraPerfil(
        momento_atual=format_profile_value(
            profile.get("journeyStage") or (cliente or {}).get("momento_atual")
        ),
        dor_atual=format_profile_value(
            pain or (cliente or {}).get("dor_atual")
        ),
        objetivo_principal=format_profile_value(
            profile.get("mainDesire") or (cliente or {}).get("objetivo_principal")
        ),
    )


def get_block_stats(answers: dict) -> list[dict]:
    grouped: dict[str, dict] = {}

    for question in QUESTIONS:
        value = get_answer_value(answers, question["id"])
        block_name = question["bloco"]

        if block_name not in grouped:
            grouped[block_name] = {
                "bloco": block_name,
                "total": 0,
                "count": 0,
                "high": [],
                "low": [],
            }

        grouped[block_name]["total"] += value
        grouped[block_name]["count"] += 1

        if value >= 4:
            grouped[block_name]["high"].append({**question, "value": value})

        if 0 < value <= 2:
            grouped[block_name]["low"].append({**question, "value": value})

    return [
        {
            **block,
            "average": block["total"] / block["count"] if block["count"] else 0,
        }
        for block in grouped.values()
    ]


def get_archetype_evidence(answers: dict, archetype_id: str | None) -> list[dict]:
    if not archetype_id:
        return []

    evidence = []

    for question in QUESTIONS:
        value = get_answer_value(answers, question["id"])
        weight = question["scores"].get(archetype_id, 0)

        if weight > 0 and value >= 4:
            evidence.append(
                {
                    "question": question,
                    "value": value,
                    "weight": weight,
                    "score": value * weight,
                }
            )

    return sorted(evidence, key=lambda item: item["score"], reverse=True)[:3]


def format_question_list(items: list[dict]) -> str:
    if not items:
        return ""

    return ", ".join(
        f"“{item['question']['pergunta']}”" for item in items[:3]
    )


def build_profile_text(perfil: Produto1LeituraPerfil) -> str:
    fragments = []

    if perfil.momento_atual:
        fragments.append(f"seu momento atual é “{perfil.momento_atual}”")

    if perfil.dor_atual:
        fragments.append(f"o que mais pesa hoje é “{perfil.dor_atual}”")

    if perfil.objetivo_principal:
        fragments.append(f"seu objetivo principal é “{perfil.objetivo_principal}”")

    if not fragments:
        return (
            "Seu perfil de entrada ainda não trouxe todos os pontos de partida, "
            "então esta camada se apoia principalmente no mapa do quiz."
        )

    return "No seu perfil de entrada, você indicou que " + ", e ".join(fragments) + "."


def build_personalized_layers(
    *,
    result: dict | None,
    answers: dict,
    perfil: Produto1LeituraPerfil,
) -> tuple[list[Produto1LeituraHighlight], dict[str, str]]:
    if not result:
        return [], {}

    blocks = get_block_stats(answers)
    strongest_blocks = sorted(blocks, key=lambda item: item["average"], reverse=True)[:2]
    tense_block = sorted(
        [block for block in blocks if block["low"] or block["bloco"] == "Seus Padrões"],
        key=lambda item: item["average"],
        reverse=True,
    )[0]
    principal_tone = ARCHETYPE_TONE.get(
        result.get("principalId"),
        str(result.get("principal") or "").lower(),
    )
    secondary_tone = ARCHETYPE_TONE.get(
        result.get("secundarioId"),
        str(result.get("secundario") or "").lower(),
    )
    principal_questions = format_question_list(
        get_archetype_evidence(answers, result.get("principalId"))
    )
    secondary_questions = format_question_list(
        get_archetype_evidence(answers, result.get("secundarioId"))
    )
    strongest_block_text = " e ".join(
        f"{block['bloco'].lower()} ({BLOCK_MEANINGS[block['bloco']]})"
        for block in strongest_blocks
    )
    profile_text = build_profile_text(perfil)
    result_name = result.get("nomeComposto") or "seu resultado"
    principal = result.get("principal") or "força principal"
    secondary = result.get("secundario") or "força secundária"

    highlights = [
        Produto1LeituraHighlight(
            label="O que suas respostas mostraram",
            text=(
                f"O mapa marcou com mais força {strongest_block_text}. "
                f"Isso mostra que {result_name} apareceu pela repetição dos seus sinais, "
                "não por uma leitura genérica."
            ),
        ),
        Produto1LeituraHighlight(
            label="O que seu perfil trouxe",
            text=(
                f"{profile_text} Esses dados ajudam o ORI a entender onde essa força "
                "precisa virar imagem real, e não apenas nome simbólico."
            ),
        ),
    ]

    camadas = {
        "reconhecimento": (
            f"Antes de nomear sua composição como {result_name}, o ORI cruzou suas respostas "
            f"com o seu ponto de partida. O que ganhou mais força foi {strongest_block_text}.\n\n"
            f"{profile_text} Por isso, esta leitura olha para você a partir do que foi marcado, "
            "do que se repetiu e do que sua imagem parece pedir agora.\n\n"
            f"A força principal, {principal}, apareceu ligada a {principal_tone}. "
            f"{f'Ela se confirmou especialmente quando você marcou com intensidade sinais como {principal_questions}.' if principal_questions else 'Ela se confirmou pela recorrência dos sinais associados a essa energia.'}"
        ),
        "dinamica": (
            f"A dinâmica interna desta leitura mostra um encontro entre {principal_tone} e {secondary_tone}. "
            "A força principal aponta o eixo que mais organiza sua imagem; a força secundária mostra nuance, tensão e profundidade.\n\n"
            f"{f'A presença de {secondary} apareceu em respostas como {secondary_questions}.' if secondary_questions else f'A presença de {secondary} aparece como uma segunda corrente atravessando sua leitura.'} "
            "É por isso que essa leitura não deve ser entendida como rótulo fixo, mas como movimento entre duas forças que precisam aprender a trabalhar juntas."
        ),
        "sombra": (
            f"O ponto de maior atenção apareceu em {tense_block['bloco'].lower()}. "
            f"Esse bloco fala de {BLOCK_MEANINGS[tense_block['bloco']]}, e mostra onde sua imagem pode perder clareza "
            "quando tenta compensar, se proteger ou responder demais ao ambiente.\n\n"
            "A sombra aqui não significa erro. Ela mostra onde a força nomeada precisa de consciência para não virar defesa, excesso ou fragmentação visual."
        ),
        "essenciaImagem": (
            f"Quando cruzamos o resultado com o seu perfil, a direção de imagem precisa responder a algo concreto: {profile_text}\n\n"
            f"A roupa, a beleza, a cor e o gesto precisam sustentar {principal_tone}, sem apagar {secondary_tone}. "
            "É aqui que começa a ponte para o Dossiê ORI: a primeira leitura nomeia a força, mas ainda não resolve sozinha como ela deve aparecer no corpo, no rosto, no cabelo, na coloração e na rotina real."
        ),
        "leituraFinal": (
            "Esta leitura foi construída a partir das suas respostas e do seu perfil de entrada. "
            "O ORI observou onde você marcou intensidade, onde apareceu contraste e onde sua imagem parece pedir mais tradução.\n\n"
            f"Por isso, {result_name} é menos uma etiqueta e mais uma chave de leitura. "
            "Ela mostra a força que organiza sua presença agora e aponta o próximo passo: traduzir essa base em imagem concreta, coerente e possível de sustentar."
        ),
    }

    return highlights, camadas


async def get_produto1_leitura_personalizada(
    *,
    current_user: CurrentUser,
) -> Produto1LeituraResponse:
    cliente = await fetch_current_cliente(current_user)
    respostas = await get_produto1_respostas(current_user=current_user)
    result = respostas.result.model_dump() if respostas.result else None

    if not result and cliente and cliente.get("resultado"):
        result = {
            "nomeComposto": cliente.get("resultado"),
            "principal": cliente.get("arquetipo_principal"),
            "secundario": cliente.get("arquetipo_secundario"),
            "principalId": None,
            "secundarioId": None,
            "scores": {},
        }

    perfil = get_profile_context(cliente)
    highlights, camadas = build_personalized_layers(
        result=result,
        answers=respostas.answers,
        perfil=perfil,
    )

    return Produto1LeituraResponse(
        user_id=current_user.user_id,
        email=(cliente or {}).get("email") or current_user.email,
        resultado=(result or {}).get("nomeComposto"),
        perfil=perfil,
        highlights=highlights,
        camadas=camadas,
    )
