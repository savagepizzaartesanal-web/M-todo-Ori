from datetime import UTC, datetime

from app.data.quiz import ARCHETYPES, QUESTIONS
from app.schemas.auth import CurrentUser
from app.schemas.mapa_vivo import (
    MapaVivoArchetypeInsight,
    MapaVivoBlockInsight,
    MapaVivoReading,
    MapaVivoReadingCard,
    MapaVivoRecommendation,
    MapaVivoResponse,
    MapaVivoSignal,
)
from app.schemas.produto1 import Produto1LeituraPerfil
from app.services.jornada_service import fetch_current_cliente
from app.services.leitura_service import (
    ARCHETYPE_TONE,
    BLOCK_MEANINGS,
    get_archetype_evidence,
    get_block_stats,
    get_profile_context,
)
from app.services.produto1_service import get_produto1_respostas


BLOCK_IDS = {
    "Sua Presença": "presenca",
    "Seu Estilo": "estilo",
    "Seu Corpo": "corpo",
    "Seus Relacionamentos": "relacionamentos",
    "Seu Mundo Interno": "mundo-interno",
    "Seus Padrões": "padroes",
}

BLOCK_CONSULTIVE_COPY = {
    "Sua Presença": {
        "title": "Presença",
        "form": "Sua presença já chega antes da explicação. A imagem precisa sustentar esse campo sem pedir licença para aparecer.",
        "attention": "O cuidado é não transformar força em defesa, nem suavizar demais aquilo que naturalmente já comunica.",
    },
    "Seu Estilo": {
        "title": "Estilo",
        "form": "Seu vestir está tentando encontrar uma forma mais fiel: menos adaptação automática, mais escolhas que pareçam suas no corpo.",
        "attention": "O cuidado é não usar roupa como tentativa de se organizar por fora enquanto sua presença pede mais verdade.",
    },
    "Seu Corpo": {
        "title": "Corpo",
        "form": "Seu corpo pede participação na imagem. Forma, caimento e movimento precisam conversar com presença real, não só com ideia estética.",
        "attention": "O cuidado é não tratar o corpo como detalhe técnico. Ele é uma parte viva da sua leitura.",
    },
    "Seus Relacionamentos": {
        "title": "Vínculos",
        "form": "A forma como você troca com o outro também aparece na imagem: aproximação, espaço, limite e desejo de ser vista.",
        "attention": "O cuidado é não vestir expectativas externas antes de escutar o que sua presença sustenta.",
    },
    "Seu Mundo Interno": {
        "title": "Mundo interno",
        "form": "Seu mundo interno pede imagem com linguagem própria. O que você sente por dentro precisa encontrar uma forma possível por fora.",
        "attention": "O cuidado é ficar tempo demais no imaginário e adiar a tradução concreta da imagem.",
    },
    "Seus Padrões": {
        "title": "Padrões",
        "form": "Seus padrões mostram onde a imagem pode se repetir por proteção. A próxima etapa ajuda a separar identidade de defesa.",
        "attention": "O cuidado é confundir proteção com estilo. Nem tudo que parece seguro revela você.",
    },
}


def get_answer_label(question_id: int) -> str:
    for question in QUESTIONS:
        if question["id"] == question_id:
            return question["pergunta"]

    return f"Sinal {question_id}"


def normalize_block_title(label: str | None, fallback: str = "Imagem") -> str:
    if not label:
        return fallback

    return BLOCK_CONSULTIVE_COPY.get(label, {}).get("title", label)


def get_block_copy(block: MapaVivoBlockInsight | None, key: str, fallback: str) -> str:
    if not block:
        return fallback

    return BLOCK_CONSULTIVE_COPY.get(block.label, {}).get(key, fallback)


def build_evidence_sentence(block: MapaVivoBlockInsight | None) -> str:
    if not block or not block.high_signals:
        return ""

    signal = block.high_signals[0].rstrip(".")
    return f"Esse sinal apareceu especialmente quando você marcou: “{signal}”."


def build_profile_anchor(perfil: Produto1LeituraPerfil) -> str:
    if perfil.objetivo_principal:
        return (
            f"Como seu objetivo agora é “{perfil.objetivo_principal}”, "
            "a leitura precisa virar direção prática, não só identificação."
        )

    if perfil.dor_atual:
        return (
            f"Como o ponto sensível agora é “{perfil.dor_atual}”, "
            "a imagem precisa trazer mais coerência e menos ruído."
        )

    if perfil.momento_atual:
        return (
            f"No seu momento atual, “{perfil.momento_atual}”, "
            "a leitura pede escolhas que você consiga sustentar na vida real."
        )

    return ""


def rounded_average(value: float) -> float:
    return round(value, 2)


def get_block_state(average: float) -> str:
    if average >= 4:
        return "dominante"

    if average >= 3:
        return "ativo"

    if average > 0:
        return "sensivel"

    return "sem_dados"


def build_confidence(scores: dict[str, int] | None) -> tuple[int, str]:
    if not scores:
        return 0, "Aguardando respostas"

    ordered_scores = sorted(scores.values(), reverse=True)

    if len(ordered_scores) < 2 or ordered_scores[0] <= 0:
        return 0, "Aguardando respostas"

    leader = ordered_scores[0]
    runner_up = ordered_scores[1]
    gap_ratio = (leader - runner_up) / leader
    confidence = max(35, min(96, round(58 + gap_ratio * 80)))

    if confidence >= 80:
        return confidence, "Alta nitidez"

    if confidence >= 62:
        return confidence, "Boa nitidez"

    return confidence, "Leitura em contraste"


def build_readiness_score(answered_count: int, total_questions: int, has_profile: bool) -> int:
    if total_questions <= 0:
        return 0

    quiz_weight = round((answered_count / total_questions) * 78)
    profile_weight = 22 if has_profile else 0

    return min(100, quiz_weight + profile_weight)


def build_archetypes(result: dict | None, answers: dict) -> list[MapaVivoArchetypeInsight]:
    if not result:
        return []

    insights = []
    roles = [
        ("principalId", "principal", "forca_principal"),
        ("secundarioId", "secundario", "forca_secundaria"),
    ]

    for id_key, name_key, role in roles:
        archetype_id = result.get(id_key)
        name = result.get(name_key)

        if not name:
            continue

        evidence = [
            item["question"]["pergunta"]
            for item in get_archetype_evidence(answers, archetype_id)
        ]
        tone = ARCHETYPE_TONE.get(archetype_id or "", "")

        if not tone and archetype_id in ARCHETYPES:
            tone = ARCHETYPES[archetype_id]["nome"]

        insights.append(
            MapaVivoArchetypeInsight(
                id=archetype_id,
                name=name,
                role=role,
                score=(result.get("scores") or {}).get(archetype_id),
                tone=tone or "sinal simbólico em formação",
                evidence=evidence,
            )
        )

    return insights


def build_blocks(answers: dict) -> list[MapaVivoBlockInsight]:
    blocks = []

    for block in get_block_stats(answers):
        label = block["bloco"]
        blocks.append(
            MapaVivoBlockInsight(
                id=BLOCK_IDS.get(label, label.lower().replace(" ", "-")),
                label=label,
                meaning=BLOCK_MEANINGS.get(label, "como este campo aparece na leitura"),
                average=rounded_average(block["average"]),
                state=get_block_state(block["average"]),
                high_signals=[item["pergunta"] for item in block["high"][:3]],
                low_signals=[item["pergunta"] for item in block["low"][:3]],
            )
        )

    return sorted(blocks, key=lambda item: item.average, reverse=True)


def build_strengths(blocks: list[MapaVivoBlockInsight], result: dict | None) -> list[MapaVivoSignal]:
    strengths = []

    for block in blocks[:2]:
        if block.average <= 0:
            continue

        strengths.append(
            MapaVivoSignal(
                id=f"forca-{block.id}",
                label=block.label,
                text=f"{block.meaning.capitalize()} apareceu como um dos pontos mais presentes.",
                intensity=block.average,
                source="quiz",
            )
        )

    if result and result.get("nomeComposto"):
        strengths.insert(
            0,
            MapaVivoSignal(
                id="resultado-composto",
                label="Composição simbólica",
                text=f"{result['nomeComposto']} organiza a leitura atual da sua presença.",
                intensity=5,
                source="resultado",
            ),
        )

    return strengths[:3]


def build_tensions(blocks: list[MapaVivoBlockInsight]) -> list[MapaVivoSignal]:
    tensions = []

    for block in blocks:
        if block.low_signals or block.label == "Seus Padrões":
            text = (
                f"{block.meaning.capitalize()} pede atenção para não virar defesa, "
                "excesso ou ruído na imagem."
            )
            tensions.append(
                MapaVivoSignal(
                    id=f"tensao-{block.id}",
                    label=block.label,
                    text=text,
                    intensity=block.average,
                    source="quiz",
                )
            )

    return tensions[:3]


def build_recommendations(
    *,
    result: dict | None,
    blocks: list[MapaVivoBlockInsight],
    readiness_score: int,
    has_profile: bool,
) -> tuple[list[MapaVivoRecommendation], list[MapaVivoRecommendation]]:
    recommendations = []
    next_steps = []

    if readiness_score < 100:
        next_steps.append(
            MapaVivoRecommendation(
                id="completar-base",
                title="Completar a base do mapa",
                text="Finalize o quiz e o perfil de entrada para que o ORI leia a jornada com mais precisão.",
                priority="alta",
                source="sistema",
            )
        )

    if not has_profile:
        recommendations.append(
            MapaVivoRecommendation(
                id="preencher-perfil",
                title="Adicionar contexto de vida",
                text="Momento atual, dor principal e objetivo ajudam a transformar arquétipo em direção prática.",
                priority="alta",
                source="perfil",
            )
        )

    dominant = blocks[0] if blocks else None
    tension = next((block for block in blocks if block.low_signals), None)

    if dominant:
        recommendations.append(
            MapaVivoRecommendation(
                id=f"aprofundar-{dominant.id}",
                title=f"Aprofundar {dominant.label.lower()}",
                text=f"Use este ponto como entrada principal: {dominant.meaning}.",
                priority="media",
                source="quiz",
            )
        )

    if tension:
        recommendations.append(
            MapaVivoRecommendation(
                id=f"regular-{tension.id}",
                title=f"Regular {tension.label.lower()}",
                text="Esse campo mostra contraste. Antes de avançar, vale traduzir o sinal em escolhas visuais simples.",
                priority="media",
                source="quiz",
            )
        )

    if result:
        next_steps.append(
            MapaVivoRecommendation(
                id="traduzir-imagem",
                title="Traduzir em imagem concreta",
                text="Leve a composição simbólica para cor, modelagem, beleza, presença e rotina real.",
                priority="alta",
                source="resultado",
            )
        )

    next_steps.append(
        MapaVivoRecommendation(
            id="revisitar-mapa",
            title="Revisitar o mapa vivo",
            text="Volte a este mapa quando uma nova etapa da jornada abrir ou quando seu momento interno mudar.",
            priority="baixa",
            source="jornada",
        )
    )

    return recommendations[:4], next_steps[:3]


def build_summary(
    *,
    result: dict | None,
    readiness_score: int,
    confidence_label: str,
    blocks: list[MapaVivoBlockInsight],
) -> str:
    if not result:
        return (
            "Seu Mapa Vivo ainda está começando. Quanto mais você responde, "
            "mais clara fica a leitura da sua jornada."
        )

    strongest = blocks[0].label.lower() if blocks else "seus sinais principais"

    return (
        f"O Mapa Vivo reconhece {result['nomeComposto']} como composição atual, "
        f"com {confidence_label.lower()} e maior força em {strongest}. "
        f"A prontidão da base está em {readiness_score}%."
    )


def get_journey_phase(*, result: dict | None, cliente: dict | None) -> str:
    if not result:
        return "nomeacao"

    if cliente and cliente.get("produto_3_liberado"):
        return "aplicacao"

    if cliente and cliente.get("produto_2_liberado"):
        return "traducao_aberta"

    return "traducao"


def build_phase_reading(
    *,
    phase: str,
    result: dict | None,
    blocks: list[MapaVivoBlockInsight],
    tensions: list[MapaVivoSignal],
    perfil: Produto1LeituraPerfil,
) -> MapaVivoReading:
    result_name = (result or {}).get("nomeComposto")
    strongest = blocks[0] if blocks else None
    secondary = blocks[1] if len(blocks) > 1 else strongest
    tension = tensions[0] if tensions else None
    force_title = result_name or "Primeira leitura em formação"
    form_title = normalize_block_title(secondary.label if secondary else None)
    attention_title = normalize_block_title(tension.label if tension else None, "Presença")
    form_text = get_block_copy(
        secondary,
        "form",
        "Sua imagem começa a pedir escolhas mais fiéis ao que sua presença sustenta.",
    )
    attention_text = get_block_copy(
        next((block for block in blocks if block.label == (tension.label if tension else "")), None),
        "attention",
        "Cuidado para não diminuir sua força tentando explicar demais. Antes da fala, sua imagem já começa a comunicar.",
    )
    evidence_sentence = build_evidence_sentence(secondary)
    profile_anchor = build_profile_anchor(perfil)
    translation_headline = (
        f"Sua primeira leitura mostrou {result_name}. Agora essa força já pode "
        "ganhar corpo, cor, cabelo, beleza e presença visual."
    )
    revealed_headline = (
        f"Sua primeira leitura mostrou {result_name}. Agora essa força precisa "
        "aparecer com mais verdade no jeito como você se veste, se move e ocupa presença."
    )

    if profile_anchor:
        translation_headline = f"{translation_headline} {profile_anchor}"
        revealed_headline = f"{revealed_headline} {profile_anchor}"

    practical_text = (
        profile_anchor
        or "Na próxima escolha de imagem, observe se ela sustenta sua força ou se apenas tenta caber no olhar de fora."
    )

    if phase == "nomeacao":
        return MapaVivoReading(
            phase=phase,
            phase_label="Primeira leitura",
            headline=(
                "O Espelho está reunindo seus sinais para mostrar a força simbólica "
                "que abre sua jornada de imagem."
            ),
            next_layer_title="Código das Deusas",
            next_layer_text=(
                "A primeira leitura identifica a base da sua imagem antes de qualquer "
                "direção visual."
            ),
            cards=[
                MapaVivoReadingCard(
                    id="forca-ativa",
                    label="Força ativa",
                    title=force_title,
                    text="Sua primeira força ainda está sendo formada a partir dos sinais da jornada.",
                    state="next",
                ),
                MapaVivoReadingCard(
                    id="o-que-pede-forma",
                    label="O que pede forma",
                    title="Essência",
                    text="Antes da imagem ganhar forma, o ORI precisa reconhecer qual energia sustenta sua presença.",
                    state="next",
                ),
                MapaVivoReadingCard(
                    id="ponto-atencao",
                    label="Ponto de atenção",
                    title="Escuta",
                    text=(
                        profile_anchor
                        or "Responda a primeira leitura sem tentar parecer pronta. A leitura começa onde você é mais verdadeira."
                    ),
                    state="next",
                ),
                MapaVivoReadingCard(
                    id="na-pratica",
                    label="Na prática",
                    title="Comece pela leitura",
                    text="O próximo passo é abrir o Código das Deusas e descobrir a força que sustenta sua imagem.",
                    state="next",
                ),
            ],
        )

    if phase == "traducao_aberta":
        return MapaVivoReading(
            phase=phase,
            phase_label="Imagem tomando forma",
            headline=translation_headline,
            next_layer_title="Dossiê ORI",
            next_layer_text=(
                "Esta etapa transforma força simbólica em escolhas visuais "
                "mais concretas."
            ),
            cards=[
                MapaVivoReadingCard(
                    id="forca-ativa",
                    label="Força ativa",
                    title=force_title,
                    text="O que apareceu aqui não é um rótulo. É a energia que começa a organizar sua imagem.",
                ),
                MapaVivoReadingCard(
                    id="o-que-pede-forma",
                    label="O que pede forma",
                    title=form_title,
                    text=f"{form_text} {evidence_sentence}".strip(),
                ),
                MapaVivoReadingCard(
                    id="ponto-atencao",
                    label="Ponto de atenção",
                    title=attention_title,
                    text=attention_text,
                ),
                MapaVivoReadingCard(
                    id="na-pratica",
                    label="Na prática",
                    title="Consulte o Dossiê",
                    text=practical_text,
                ),
            ],
        )

    if phase == "aplicacao":
        return MapaVivoReading(
            phase=phase,
            phase_label="Imagem em aplicação",
            headline=(
                f"{result_name} já passou da leitura para a aplicação. Agora a força "
                "precisa aparecer nas escolhas reais: armário, combinações, compras e rotina."
            ),
            next_layer_title="Código Final",
            next_layer_text=(
                "A próxima etapa organiza a identidade no cotidiano, para que a imagem "
                "não dependa só de inspiração."
            ),
            cards=[
                MapaVivoReadingCard(
                    id="forca-ativa",
                    label="Força ativa",
                    title=force_title,
                    text="Sua base simbólica continua guiando a imagem, mas agora precisa sustentar decisões práticas.",
                ),
                MapaVivoReadingCard(
                    id="o-que-pede-forma",
                    label="O que pede aplicação",
                    title="Rotina",
                    text="A pergunta deixa de ser só o que combina com você e passa a ser o que você consegue sustentar na vida real.",
                ),
                MapaVivoReadingCard(
                    id="ponto-atencao",
                    label="Ponto de atenção",
                    title="Coerência",
                    text="Evite acumular referências que não entram no corpo, no armário ou no gesto. A imagem precisa virar prática.",
                ),
                MapaVivoReadingCard(
                    id="na-pratica",
                    label="Na prática",
                    title="Escolha com direção",
                    text="Ao montar um look ou pensar em compra, pergunte se aquilo fortalece sua presença ou só preenche ruído.",
                ),
            ],
        )

    return MapaVivoReading(
        phase=phase,
        phase_label="Base identificada",
        headline=revealed_headline,
        next_layer_title="Dossiê ORI",
        next_layer_text=(
            "A próxima etapa mostra como essa força aparece no corpo, na cor, "
            "no cabelo, na beleza e na presença."
        ),
        cards=[
            MapaVivoReadingCard(
                id="forca-ativa",
                label="Força ativa",
                title=force_title,
                text="O que apareceu aqui não é um rótulo. É a força que começa a organizar sua presença, sua imagem e o modo como você se mostra.",
            ),
            MapaVivoReadingCard(
                id="o-que-pede-forma",
                label="O que pede forma",
                title=form_title,
                text=f"{form_text} {evidence_sentence}".strip(),
            ),
            MapaVivoReadingCard(
                id="ponto-atencao",
                label="Ponto de atenção",
                title=attention_title,
                text=attention_text,
            ),
            MapaVivoReadingCard(
                id="na-pratica",
                label="Na prática",
                title="Uma escolha por vez",
                text=practical_text,
            ),
        ],
    )


async def get_mapa_vivo(
    *,
    current_user: CurrentUser,
) -> MapaVivoResponse:
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
    has_profile = any(
        [perfil.momento_atual, perfil.dor_atual, perfil.objetivo_principal]
    )
    blocks = build_blocks(respostas.answers)
    readiness_score = build_readiness_score(
        respostas.answered_count,
        respostas.total_questions,
        has_profile,
    )
    confidence_score, confidence_label = build_confidence(
        result.get("scores") if result else None
    )
    recommendations, next_steps = build_recommendations(
        result=result,
        blocks=blocks,
        readiness_score=readiness_score,
        has_profile=has_profile,
    )
    tensions = build_tensions(blocks)
    phase = get_journey_phase(result=result, cliente=cliente)
    reading = build_phase_reading(
        phase=phase,
        result=result,
        blocks=blocks,
        tensions=tensions,
        perfil=perfil,
    )
    status = "ativo" if result else "em_formacao"

    return MapaVivoResponse(
        user_id=current_user.user_id,
        email=(cliente or {}).get("email") or current_user.email,
        generated_at=datetime.now(UTC),
        status=status,
        readiness_score=readiness_score,
        confidence_score=confidence_score,
        confidence_label=confidence_label,
        resultado=(result or {}).get("nomeComposto"),
        perfil=perfil,
        result=result,
        reading=reading,
        summary=build_summary(
            result=result,
            readiness_score=readiness_score,
            confidence_label=confidence_label,
            blocks=blocks,
        ),
        strengths=build_strengths(blocks, result),
        tensions=tensions,
        archetypes=build_archetypes(result, respostas.answers),
        blocks=blocks,
        recommendations=recommendations,
        next_steps=next_steps,
    )
