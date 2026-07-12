import { JOURNEY_STATUS } from "../constants/journeyStatus";

export function getBaseJourneyStatus(cliente) {
  if (cliente?.resultado) return JOURNEY_STATUS.CODIGO_DAS_DEUSAS_CONCLUIDO;
  if (cliente?.perfil_onboarding_concluido) return JOURNEY_STATUS.ENTRADA_ORI_CONCLUIDA;
  return JOURNEY_STATUS.CADASTRO_RECEBIDO;
}

export function getStatusAfterProduto2AccessChange(cliente, produto2Liberado) {
  return produto2Liberado
    ? JOURNEY_STATUS.DOSSIE_ORI_LIBERADO
    : getBaseJourneyStatus(cliente);
}

export function getStatusAfterProduto3AccessChange(cliente, produto3Liberado) {
  if (produto3Liberado) return JOURNEY_STATUS.CODIGO_FINAL_LIBERADO;
  if (cliente?.produto_2_liberado) return JOURNEY_STATUS.DOSSIE_ORI_LIBERADO;
  return getBaseJourneyStatus(cliente);
}
