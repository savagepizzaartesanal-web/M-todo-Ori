export const JOURNEY_STATUS = Object.freeze({
  CADASTRO_RECEBIDO: "Cadastro recebido",
  ENTRADA_ORI_EM_ANDAMENTO: "Entrada ORI em andamento",
  ENTRADA_ORI_CONCLUIDA: "Entrada ORI concluída",
  CODIGO_DAS_DEUSAS_LIBERADO: "Código das Deusas liberado",
  CODIGO_DAS_DEUSAS_EM_ANDAMENTO: "Código das Deusas em andamento",
  CODIGO_DAS_DEUSAS_CONCLUIDO: "Código das Deusas concluído",
  DOSSIE_ORI_LIBERADO: "Dossiê ORI liberado",
  DOSSIE_ORI_EM_PREENCHIMENTO: "Dossiê ORI em preenchimento",
  DOSSIE_ORI_EM_ANALISE: "Dossiê ORI em análise",
  DOSSIE_ORI_PUBLICADO: "Dossiê ORI publicado",
  CODIGO_FINAL_LIBERADO: "Código Final liberado",
  CODIGO_FINAL_EM_PREENCHIMENTO: "Código Final em preenchimento",
  CODIGO_FINAL_EM_ANALISE: "Código Final em análise",
  CODIGO_FINAL_PUBLICADO: "Código Final publicado",
  JORNADA_FINALIZADA: "Jornada finalizada",
});

export const OFFICIAL_JOURNEY_STATUSES = Object.freeze(
  Object.values(JOURNEY_STATUS),
);
