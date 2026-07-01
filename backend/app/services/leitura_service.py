import json
import os
import asyncio
from hashlib import sha256
from datetime import UTC, datetime
from functools import lru_cache
from pathlib import Path

import httpx
from fastapi import HTTPException, status

from app.data.quiz import QUESTIONS
from app.schemas.auth import CurrentUser
from app.schemas.produto1 import (
    Produto1LeituraHighlight,
    Produto1LeituraPerfil,
    Produto1LeituraResponse,
    Produto1RelatorioResponse,
    Produto1RelatorioSection,
)
from app.services.admin_ai_service import (
    generate_structured_ai_content,
    get_ai_provider_config,
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

BLOCK_PRACTICAL_SIGNALS = {
    "Sua Presença": (
        "quando você chega em um lugar, muda o clima da conversa ou sente que precisa modular "
        "sua intensidade para ser recebida"
    ),
    "Seu Estilo": (
        "quando uma roupa bonita ainda parece errada porque não sustenta o jeito como você quer "
        "se mover, ser vista ou se proteger"
    ),
    "Seu Corpo": (
        "quando postura, conforto, movimento e sensação física dizem antes da cabeça se algo "
        "combina com você"
    ),
    "Seus Relacionamentos": (
        "quando vínculo, troca, distância, escolha ou disponibilidade mexem diretamente com a "
        "sua segurança"
    ),
    "Seu Mundo Interno": (
        "quando desejo, intuição, análise, imaginação ou controle definem o ritmo das suas escolhas"
    ),
    "Seus Padrões": (
        "quando você repete uma defesa conhecida: agradar, endurecer, sumir, controlar, cuidar "
        "demais ou romper antes de nomear o incômodo"
    ),
}

ARCHETYPE_PRACTICAL_ACTIONS = {
    "afrodite": "escolha uma peça, gesto ou beleza que aumente prazer sem depender de aprovação externa",
    "persefone": "observe uma sensação antes de explicá-la e anote o que seu corpo percebeu primeiro",
    "hera": "defina onde você precisa de respeito real, não apenas de reconhecimento aparente",
    "demeter": "ofereça cuidado sem assumir uma responsabilidade que não precisa ser sua",
    "athena": "transforme uma percepção solta em uma decisão simples, com critério e limite",
    "artemis": "preserve espaço de movimento antes de aceitar uma demanda que aperta seu território",
}

ARCHETYPE_DECISION_QUESTIONS = {
    "afrodite": "isso me dá prazer real ou só tenta produzir desejo no olhar de fora?",
    "persefone": "meu corpo já percebeu algo que minha cabeça ainda está tentando explicar?",
    "hera": "esse lugar me reconhece de verdade ou só exige que eu sustente uma posição?",
    "demeter": "esse cuidado nasce de presença ou de uma tentativa de ser necessária?",
    "athena": "essa escolha tem critério claro ou virou controle para evitar vulnerabilidade?",
    "artemis": "esse caminho respeita meu espaço ou começa a me prender por dentro?",
}

ARCHETYPE_IMAGE_NEEDS = {
    "afrodite": "prazer, presença sensorial e beleza que não precise implorar por validação",
    "persefone": "profundidade, pausa e uma imagem que revele por camadas, sem se explicar demais",
    "hera": "dignidade, estrutura e uma presença que comunique valor sem endurecer",
    "demeter": "acolhimento, conforto e sustentação sem apagar contorno pessoal",
    "athena": "clareza, intenção e escolhas visuais com critério, sem rigidez excessiva",
    "artemis": "movimento, território e liberdade suficiente para o corpo respirar",
}

ARCHETYPE_TONE = {
    "afrodite": "magnetismo, prazer, beleza e desejo de conexão",
    "persefone": "profundidade, intuição, recolhimento e mundo interno",
    "hera": "dignidade, reconhecimento, posição e compromisso",
    "demeter": "cuidado, vínculo, acolhimento e sustentação",
    "athena": "clareza, estratégia, leitura de contexto e controle",
    "artemis": "liberdade, território, movimento e autonomia",
}

REPORTS_PATH = Path(__file__).resolve().parents[1] / "data" / "reports.json"
AI_LAYER_CACHE: dict[str, str] = {}
AI_REQUEST_SEMAPHORE = asyncio.Semaphore(1)
AI_RETRYABLE_STATUS_CODES = {502, 503, 504}
AI_MAX_ATTEMPTS = 3
AI_LAYER_MISSIONS = {
    "dinamica": {
        "title": "Dinâmica psíquica",
        "mission": (
            "traduzir o funcionamento interno em decisões, reações, sinais corporais "
            "e formas de proteção"
        ),
        "focus": (
            "explique como as duas forças operam por dentro, o que a pessoa tende a tentar "
            "controlar ou preservar, e como isso aparece em escolhas reais"
        ),
        "avoid": "não repita a camada Vida real; não transforme em diagnóstico psicológico",
    },
    "vidaReal": {
        "title": "Como isso aparece na vida real",
        "mission": (
            "mostrar a primeira aplicação concreta da leitura fora da tela, sem sugerir "
            "atualização semanal"
        ),
        "focus": (
            "traga cenas de decisão, vínculo e imagem como exercício inicial de reconhecimento; "
            "use linguagem atemporal, como 'para começar' ou 'quando isso aparecer de novo'"
        ),
        "avoid": "não fale em semana atual, previsão, rotina recorrente do produto ou acompanhamento contínuo",
    },
    "sombra": {
        "title": "Sombra",
        "mission": "mostrar quando a força vira defesa, excesso ou padrão repetido",
        "focus": (
            "nomeie a defesa de forma concreta, mostre o custo no corpo, nos vínculos ou na imagem, "
            "e indique um ajuste observável"
        ),
        "avoid": "não patologize, não use linguagem clínica e não trate sombra como erro moral",
    },
    "padraoRelacional": {
        "title": "Padrão relacional",
        "mission": (
            "mostrar como a força aparece em vínculo, aproximação, distância, expectativa "
            "e necessidade de segurança"
        ),
        "focus": (
            "traga situações de conversa, espera, cobrança, silêncio, escolha, desejo, cuidado, "
            "controle ou liberdade"
        ),
        "avoid": "não dê conselho afetivo prescritivo e não diga como a pessoa deve se relacionar",
    },
    "essenciaImagem": {
        "title": "Essência de imagem",
        "mission": "traduzir símbolo em roupa, gesto, beleza e presença visual",
        "focus": (
            "explique o que uma escolha visual precisa sustentar, o que pode estar bonito mas desalinhado, "
            "e que pergunta fazer antes de escolher roupa, beleza ou postura"
        ),
        "avoid": (
            "não invente análise de coloração pessoal, biotipo, proporção corporal, cabelo ou diagnóstico visual "
            "que ainda pertence ao Dossiê ORI"
        ),
    },
}
REPORT_SECTION_ORDER = [
    ("reconhecimento", "01", "Reconhecimento"),
    ("essencia", "02", "Essência"),
    ("dinamica", "03", "Dinâmica psíquica"),
    ("vidaReal", "04", "Como isso aparece na vida real"),
    ("percebida", "05", "Como você é percebida"),
    ("sombra", "06", "Sombra"),
    ("padraoRelacional", "07", "Padrão relacional"),
    ("caminho", "08", "Caminho de individuação"),
    ("essenciaImagem", "09", "Essência de imagem"),
    ("paleta", "10", "Paleta simbólica"),
    ("modelagem", "11", "Modelagem"),
    ("tecidos", "12", "Tecidos"),
    ("beleza", "13", "Beleza"),
    ("presenca", "14", "Presença"),
    ("evitar", "15", "O que quebra seu arquétipo"),
    ("leituraFinal", "16", "Leitura final"),
]


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


@lru_cache
def load_base_reports() -> dict:
    if not REPORTS_PATH.exists():
        return {}

    return json.loads(REPORTS_PATH.read_text(encoding="utf-8"))


def build_complete_report(
    *,
    result_name: str | None,
    camadas: dict[str, str],
) -> dict | None:
    if not result_name:
        return None

    base_report = load_base_reports().get(result_name)

    if not base_report:
        return None

    return {
        **base_report,
        "reconhecimento": (
            f"{camadas['reconhecimento']}\n\n{base_report['reconhecimento']}"
            if camadas.get("reconhecimento")
            else base_report.get("reconhecimento", "")
        ),
        "dinamica": (
            f"{camadas['dinamica']}\n\n{base_report['dinamica']}"
            if camadas.get("dinamica")
            else base_report.get("dinamica", "")
        ),
        "sombra": (
            f"{camadas['sombra']}\n\n{base_report['sombra']}"
            if camadas.get("sombra")
            else base_report.get("sombra", "")
        ),
        "vidaReal": camadas.get("vidaReal", ""),
        "essenciaImagem": (
            f"{base_report['essenciaImagem']}\n\n{camadas['essenciaImagem']}"
            if camadas.get("essenciaImagem")
            else base_report.get("essenciaImagem", "")
        ),
        "leituraFinal": (
            f"{base_report['leituraFinal']}\n\n{camadas['leituraFinal']}"
            if camadas.get("leituraFinal")
            else base_report.get("leituraFinal", "")
        ),
    }


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
            pain
            or (cliente or {}).get("principal_dor")
            or (cliente or {}).get("dor_atual")
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


def build_vida_real_text(
    *,
    result_name: str,
    principal_tone: str,
    secondary_tone: str,
    principal_id: str | None,
    secondary_id: str | None,
    tense_block_name: str,
    practical_block_text: str,
    principal_action: str,
    secondary_action: str,
) -> str:
    decision_question = ARCHETYPE_DECISION_QUESTIONS.get(
        principal_id,
        "essa escolha sustenta minha presença ou me coloca em uma versão menor de mim?",
    )
    secondary_question = ARCHETYPE_DECISION_QUESTIONS.get(
        secondary_id,
        "essa nuance precisa aparecer com mais verdade ou está ficando escondida?",
    )
    principal_image_need = ARCHETYPE_IMAGE_NEEDS.get(
        principal_id,
        principal_tone,
    )
    secondary_image_need = ARCHETYPE_IMAGE_NEEDS.get(
        secondary_id,
        secondary_tone,
    )

    return (
        f"Na vida real, {result_name} aparece menos como uma ideia e mais como um modo de reagir. "
        f"Ela pode surgir {practical_block_text}. Quando essa força está viva, você tende a perceber "
        "rapidamente se uma situação expande sua presença ou se começa a apertar seu corpo por dentro.\n\n"
        f"Nas decisões, a pergunta silenciosa costuma ser: “{decision_question}”. "
        f"A resposta nem sempre vem como pensamento organizado. Às vezes aparece como impaciência, "
        "distância, vontade de recuar, necessidade de controlar ou dificuldade de permanecer em algo que "
        "parece bonito por fora, mas estreito por dentro.\n\n"
        f"Nas relações, o ponto de atenção em {tense_block_name.lower()} mostra onde você pode se adaptar, se defender "
        "ou esperar que o outro adivinhe o que está acontecendo. Esse é um ponto importante da leitura: não para se "
        "cobrar, mas para perceber onde a sua força vira proteção automática.\n\n"
        f"Na imagem, uma escolha pode estar bonita e ainda assim não funcionar. O que sustenta você precisa "
        f"dar espaço para {principal_image_need}, sem apagar {secondary_image_need}. Antes de escolher roupa, "
        "beleza ou postura, pergunte se aquilo deixa você mais presente no corpo ou se apenas encaixa você "
        "em um papel aceitável.\n\n"
        "Para começar a aplicar esta leitura, observe uma situação em que você quase disse sim no automático. "
        f"Antes de responder, {principal_action}. Depois, {secondary_action}. "
        f"Se precisar de uma frase simples para reconhecer esse movimento fora da tela, use esta: “{secondary_question}”."
    )


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
    practical_block_text = " e ".join(
        BLOCK_PRACTICAL_SIGNALS[block["bloco"]] for block in strongest_blocks
    )
    profile_text = build_profile_text(perfil)
    result_name = result.get("nomeComposto") or "seu resultado"
    principal = result.get("principal") or "força principal"
    secondary = result.get("secundario") or "força secundária"
    principal_action = ARCHETYPE_PRACTICAL_ACTIONS.get(
        result.get("principalId"),
        "escolha uma ação pequena que sustente sua força principal sem performar para o olhar externo",
    )
    secondary_action = ARCHETYPE_PRACTICAL_ACTIONS.get(
        result.get("secundarioId"),
        "observe qual nuance da sua força secundária precisa aparecer com mais clareza",
    )
    vida_real_text = build_vida_real_text(
        result_name=result_name,
        principal_tone=principal_tone,
        secondary_tone=secondary_tone,
        principal_id=result.get("principalId"),
        secondary_id=result.get("secundarioId"),
        tense_block_name=tense_block["bloco"],
        practical_block_text=practical_block_text,
        principal_action=principal_action,
        secondary_action=secondary_action,
    )

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
        "vidaReal": vida_real_text,
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


def ai_reading_enabled() -> bool:
    return os.getenv("AI_READING_ENABLED", "true").strip().lower() not in {
        "0",
        "false",
        "no",
        "off",
    }


def sanitize_customer_reading_text(text: str) -> str:
    return (
        text.replace("No Produto 1,", "Nesta leitura arquetípica,")
        .replace("no Produto 1,", "nesta leitura arquetípica,")
        .replace("Produto 1", "leitura arquetípica")
        .replace("Produto 2", "Dossiê ORI")
    )


def build_ai_layer_cache_key(
    *,
    layer_id: str,
    result: dict,
    answers: dict,
    perfil: Produto1LeituraPerfil,
    base_text: str,
) -> str:
    payload = {
        "layer_id": layer_id,
        "result": {
            "nomeComposto": result.get("nomeComposto"),
            "principal": result.get("principal"),
            "secundario": result.get("secundario"),
            "principalId": result.get("principalId"),
            "secundarioId": result.get("secundarioId"),
        },
        "answers": answers,
        "perfil": perfil.model_dump(),
        "base_text": base_text,
    }
    encoded = json.dumps(payload, ensure_ascii=False, sort_keys=True).encode("utf-8")
    return sha256(encoded).hexdigest()


def build_ai_layer_prompts(
    *,
    layer_id: str,
    result: dict,
    answers: dict,
    perfil: Produto1LeituraPerfil,
    base_text: str,
) -> tuple[str, str]:
    mission = AI_LAYER_MISSIONS[layer_id]
    blocks = get_block_stats(answers)
    strongest_blocks = sorted(blocks, key=lambda item: item["average"], reverse=True)[:3]
    tense_blocks = sorted(
        [block for block in blocks if block["low"] or block["bloco"] == "Seus Padrões"],
        key=lambda item: item["average"],
        reverse=True,
    )[:2]
    context = {
        "camada": {
            "id": layer_id,
            "titulo": mission["title"],
            "missao": mission["mission"],
            "foco": mission["focus"],
            "evitar": mission["avoid"],
        },
        "resultado_calculado": result.get("nomeComposto"),
        "arquetipo_principal": result.get("principal"),
        "arquetipo_secundario": result.get("secundario"),
        "tons_permitidos": {
            "principal": ARCHETYPE_TONE.get(result.get("principalId")),
            "secundario": ARCHETYPE_TONE.get(result.get("secundarioId")),
        },
        "perfil_entrada": perfil.model_dump(),
        "blocos_mais_fortes": [
            {
                "bloco": block["bloco"],
                "media": round(block["average"], 2),
                "significado": BLOCK_MEANINGS.get(block["bloco"]),
                "sinal_pratico": BLOCK_PRACTICAL_SIGNALS.get(block["bloco"]),
            }
            for block in strongest_blocks
        ],
        "blocos_de_atencao": [
            {
                "bloco": block["bloco"],
                "media": round(block["average"], 2),
                "significado": BLOCK_MEANINGS.get(block["bloco"]),
                "respostas_baixas": [
                    item["pergunta"] for item in block.get("low", [])[:3]
                ],
            }
            for block in tense_blocks
        ],
        "evidencias_principal": [
            item["question"]["pergunta"]
            for item in get_archetype_evidence(answers, result.get("principalId"))
        ],
        "evidencias_secundario": [
            item["question"]["pergunta"]
            for item in get_archetype_evidence(answers, result.get("secundarioId"))
        ],
        "texto_base_da_camada": base_text,
    }
    system_prompt = (
        "Você é uma assistente editorial interna do Método ORI. "
        "Você reescreve uma camada específica de uma leitura arquetípica já calculada. "
        "Nunca troque, questione ou recalcule o resultado arquetípico. "
        "Sua função é deixar a camada mais concreta, reconhecível e aplicável, cumprindo apenas a missão indicada. "
        "Use português do Brasil, tom humano, sofisticado, direto e com presença editorial. "
        "O texto deve fazer a cliente sentir 'isso é para mim e eu entendi', sem parecer checklist. "
        "Use corpo, gesto, vínculo, roupa, decisão e situações comuns quando fizer sentido. "
        "Não faça diagnóstico clínico, previsão, promessa espiritual, conselho médico ou afirmação absoluta. "
        "Não invente dados técnicos ausentes. Não fale que foi gerado por IA. "
        "Não mencione nomes internos como Produto 1, Produto 2, camada técnica ou backend. "
        "Evite linguagem de autoajuda e termos genéricos como jornada, potência, transformação e expansão. "
        "Escreva de 3 a 5 parágrafos curtos. Não inclua título dentro do texto. "
        "Responda apenas JSON válido com as chaves title e text."
    )
    user_prompt = (
        f"Reescreva a camada {mission['title']} com base no contexto abaixo. "
        "Use o texto base como chão autoral, mas deixe a leitura mais aterrada. "
        "Não repita a função das outras camadas. Cumpra a missão desta camada.\n\n"
        f"{json.dumps(context, ensure_ascii=False, indent=2)}"
    )
    return system_prompt, user_prompt


async def maybe_generate_ai_layer_text(
    *,
    layer_id: str,
    result: dict,
    answers: dict,
    perfil: Produto1LeituraPerfil,
    base_text: str,
    provider: str,
    api_key: str,
    model: str,
) -> str:
    clean_base_text = str(base_text or "").strip()

    if not clean_base_text or layer_id not in AI_LAYER_MISSIONS:
        return clean_base_text

    cache_key = build_ai_layer_cache_key(
        layer_id=layer_id,
        result=result,
        answers=answers,
        perfil=perfil,
        base_text=clean_base_text,
    )
    cached_text = AI_LAYER_CACHE.get(cache_key)

    if cached_text:
        return cached_text

    system_prompt, user_prompt = build_ai_layer_prompts(
        layer_id=layer_id,
        result=result,
        answers=answers,
        perfil=perfil,
        base_text=clean_base_text,
    )

    parsed = None

    for attempt in range(1, AI_MAX_ATTEMPTS + 1):
        try:
            async with AI_REQUEST_SEMAPHORE:
                parsed = await generate_structured_ai_content(
                    provider=provider,
                    api_key=api_key,
                    model=model,
                    system_prompt=system_prompt,
                    user_prompt=user_prompt,
                )
            break
        except httpx.HTTPStatusError as error:
            status_code = error.response.status_code
            should_retry = (
                status_code in AI_RETRYABLE_STATUS_CODES
                and attempt < AI_MAX_ATTEMPTS
            )

            if should_retry:
                wait_seconds = attempt * 2
                print(
                    "AI reading layer retry: "
                    f"layer={layer_id} status={status_code} "
                    f"attempt={attempt + 1}/{AI_MAX_ATTEMPTS} wait={wait_seconds}s"
                )
                await asyncio.sleep(wait_seconds)
                continue

            detail = error.response.text.replace("\n", " ")[:500]
            print(
                "AI reading layer fallback: "
                f"layer={layer_id} reason=HTTPStatusError "
                f"status={status_code} attempts={attempt} detail={detail}"
            )
            return clean_base_text
        except (httpx.HTTPError, KeyError, IndexError, TypeError, json.JSONDecodeError) as error:
            print(
                "AI reading layer fallback: "
                f"layer={layer_id} reason={type(error).__name__} attempts={attempt}"
            )
            return clean_base_text

    if not isinstance(parsed, dict):
        print(f"AI reading layer fallback: layer={layer_id} reason=invalid_payload")
        return clean_base_text

    ai_text = sanitize_customer_reading_text(str(parsed.get("text") or "").strip())

    if len(ai_text) < 80:
        print(f"AI reading layer fallback: layer={layer_id} reason=short_text")
        return clean_base_text

    AI_LAYER_CACHE[cache_key] = ai_text[:3200]
    print(f"AI reading layer generated: layer={layer_id}")
    return AI_LAYER_CACHE[cache_key]


async def maybe_generate_ai_report_layers(
    *,
    report: dict | None,
    result: dict | None,
    answers: dict,
    perfil: Produto1LeituraPerfil,
) -> dict | None:
    if not report or not result or not ai_reading_enabled():
        return report

    provider, api_key, model, _ = get_ai_provider_config()

    if not api_key:
        return report

    layer_ids = [
        "dinamica",
        "vidaReal",
        "sombra",
        "padraoRelacional",
        "essenciaImagem",
    ]
    requested_layers = [layer_id for layer_id in layer_ids if report.get(layer_id)]

    if not requested_layers:
        return report

    next_report = {**report}
    missing_layers: list[str] = []
    cache_keys: dict[str, str] = {}

    for layer_id in requested_layers:
        cache_key = build_ai_layer_cache_key(
            layer_id=layer_id,
            result=result,
            answers=answers,
            perfil=perfil,
            base_text=report.get(layer_id, ""),
        )
        cache_keys[layer_id] = cache_key
        cached_text = AI_LAYER_CACHE.get(cache_key)

        if cached_text:
            next_report[layer_id] = cached_text
        else:
            missing_layers.append(layer_id)

    if not missing_layers:
        return next_report

    layer_prompts = []
    system_prompt = ""

    for layer_id in missing_layers:
        layer_system_prompt, layer_user_prompt = build_ai_layer_prompts(
            layer_id=layer_id,
            result=result,
            answers=answers,
            perfil=perfil,
            base_text=report.get(layer_id, ""),
        )
        system_prompt = layer_system_prompt
        layer_prompts.append(f"CAMADA {layer_id}\n{layer_user_prompt}")

    system_prompt = system_prompt.replace(
        "Responda apenas JSON válido com as chaves title e text.",
        (
            "Responda apenas um JSON válido. Cada chave deve ser o identificador "
            "da camada solicitado e cada valor deve ser somente o texto reescrito."
        ),
    )
    user_prompt = (
        "Reescreva todas as camadas abaixo em uma única resposta. Preserve a missão "
        "individual de cada uma e evite repetir o mesmo conteúdo entre elas.\n\n"
        + "\n\n---\n\n".join(layer_prompts)
    )
    response_schema = {
        "type": "object",
        "properties": {
            layer_id: {"type": "string"}
            for layer_id in missing_layers
        },
        "required": missing_layers,
    }

    parsed = None

    for attempt in range(1, AI_MAX_ATTEMPTS + 1):
        try:
            async with AI_REQUEST_SEMAPHORE:
                parsed = await generate_structured_ai_content(
                    provider=provider,
                    api_key=api_key,
                    model=model,
                    system_prompt=system_prompt,
                    user_prompt=user_prompt,
                    response_schema=response_schema,
                    max_output_tokens=2400,
                )
            break
        except httpx.HTTPStatusError as error:
            status_code = error.response.status_code
            should_retry = (
                status_code in AI_RETRYABLE_STATUS_CODES
                and attempt < AI_MAX_ATTEMPTS
            )

            if should_retry:
                wait_seconds = attempt * 2
                print(
                    "AI reading batch retry: "
                    f"status={status_code} attempt={attempt + 1}/{AI_MAX_ATTEMPTS} "
                    f"wait={wait_seconds}s"
                )
                await asyncio.sleep(wait_seconds)
                continue

            detail = error.response.text.replace("\n", " ")[:500]
            print(
                "AI reading batch fallback: "
                f"reason=HTTPStatusError status={status_code} "
                f"attempts={attempt} detail={detail}"
            )
            return next_report
        except (httpx.HTTPError, KeyError, IndexError, TypeError, json.JSONDecodeError) as error:
            print(
                "AI reading batch fallback: "
                f"reason={type(error).__name__} attempts={attempt}"
            )
            return next_report

    if not isinstance(parsed, dict):
        print("AI reading batch fallback: reason=invalid_payload")
        return next_report

    for layer_id in missing_layers:
        ai_text = sanitize_customer_reading_text(
            str(parsed.get(layer_id) or "").strip()
        )

        if len(ai_text) < 80:
            print(f"AI reading batch skipped: layer={layer_id} reason=short_text")
            continue

        AI_LAYER_CACHE[cache_keys[layer_id]] = ai_text[:3200]
        next_report[layer_id] = AI_LAYER_CACHE[cache_keys[layer_id]]
        print(f"AI reading layer generated: layer={layer_id} source=batch")

    return next_report


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
    result_name = (result or {}).get("nomeComposto")
    report = build_complete_report(
        result_name=result_name,
        camadas=camadas,
    )
    report = await maybe_generate_ai_report_layers(
        report=report,
        result=result,
        answers=respostas.answers,
        perfil=perfil,
    )

    return Produto1LeituraResponse(
        user_id=current_user.user_id,
        email=(cliente or {}).get("email") or current_user.email,
        resultado=result_name,
        perfil=perfil,
        highlights=highlights,
        camadas=camadas,
        report=report,
    )


def build_relatorio_sections(report: dict) -> list[Produto1RelatorioSection]:
    sections = []

    for key, label, title in REPORT_SECTION_ORDER:
        value = report.get(key)

        if not value:
            continue

        if isinstance(value, list):
            text = "\n".join(f"- {item}" for item in value)
        else:
            text = str(value)

        sections.append(
            Produto1RelatorioSection(
                id=key,
                label=label,
                title=title,
                text=text,
            )
        )

    return sections


async def get_produto1_relatorio(
    *,
    current_user: CurrentUser,
) -> Produto1RelatorioResponse:
    leitura = await get_produto1_leitura_personalizada(current_user=current_user)

    if not leitura.report or not leitura.resultado:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A leitura do Produto 1 ainda não está pronta para relatório.",
        )

    report = leitura.report

    return Produto1RelatorioResponse(
        user_id=leitura.user_id,
        email=leitura.email,
        generated_at=datetime.now(UTC),
        resultado=leitura.resultado,
        combinacao=report.get("combinacao"),
        title=f"Relatório ORI · {leitura.resultado}",
        subtitle=report.get("fraseHero"),
        perfil=leitura.perfil,
        highlights=leitura.highlights,
        sections=build_relatorio_sections(report),
        formula=report.get("formula"),
        next_step=report.get("proximoPasso"),
    )
