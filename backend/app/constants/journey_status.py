from typing import Literal

JourneyStatus = Literal[
    "Cadastro recebido",
    "Entrada ORI em andamento",
    "Entrada ORI concluída",
    "Código das Deusas liberado",
    "Código das Deusas em andamento",
    "Código das Deusas concluído",
    "Dossiê ORI liberado",
    "Dossiê ORI em preenchimento",
    "Dossiê ORI em análise",
    "Dossiê ORI publicado",
    "Código Final liberado",
    "Código Final em preenchimento",
    "Código Final em análise",
    "Código Final publicado",
    "Jornada finalizada",
]

CADASTRO_RECEBIDO = "Cadastro recebido"
ENTRADA_ORI_EM_ANDAMENTO = "Entrada ORI em andamento"
ENTRADA_ORI_CONCLUIDA = "Entrada ORI concluída"
CODIGO_DAS_DEUSAS_LIBERADO = "Código das Deusas liberado"
CODIGO_DAS_DEUSAS_EM_ANDAMENTO = "Código das Deusas em andamento"
CODIGO_DAS_DEUSAS_CONCLUIDO = "Código das Deusas concluído"
DOSSIE_ORI_LIBERADO = "Dossiê ORI liberado"
DOSSIE_ORI_EM_PREENCHIMENTO = "Dossiê ORI em preenchimento"
DOSSIE_ORI_EM_ANALISE = "Dossiê ORI em análise"
DOSSIE_ORI_PUBLICADO = "Dossiê ORI publicado"
CODIGO_FINAL_LIBERADO = "Código Final liberado"
CODIGO_FINAL_EM_PREENCHIMENTO = "Código Final em preenchimento"
CODIGO_FINAL_EM_ANALISE = "Código Final em análise"
CODIGO_FINAL_PUBLICADO = "Código Final publicado"
JORNADA_FINALIZADA = "Jornada finalizada"

OFFICIAL_JOURNEY_STATUSES: tuple[str, ...] = (
    CADASTRO_RECEBIDO,
    ENTRADA_ORI_EM_ANDAMENTO,
    ENTRADA_ORI_CONCLUIDA,
    CODIGO_DAS_DEUSAS_LIBERADO,
    CODIGO_DAS_DEUSAS_EM_ANDAMENTO,
    CODIGO_DAS_DEUSAS_CONCLUIDO,
    DOSSIE_ORI_LIBERADO,
    DOSSIE_ORI_EM_PREENCHIMENTO,
    DOSSIE_ORI_EM_ANALISE,
    DOSSIE_ORI_PUBLICADO,
    CODIGO_FINAL_LIBERADO,
    CODIGO_FINAL_EM_PREENCHIMENTO,
    CODIGO_FINAL_EM_ANALISE,
    CODIGO_FINAL_PUBLICADO,
    JORNADA_FINALIZADA,
)
