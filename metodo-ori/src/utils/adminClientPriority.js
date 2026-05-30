const DEFAULT_TOTAL_QUESTIONS = 36;

function getProduto1Progress(resposta) {
  if (!resposta) return null;

  return Math.round(
    ((resposta.answered_count || 0) /
      (resposta.total_questions || DEFAULT_TOTAL_QUESTIONS)) *
      100,
  );
}

export function getAdminClientPriority({ cliente, resposta, feedback }) {
  const progress = getProduto1Progress(resposta);

  if (feedback?.response === "nao_me_reconheci") {
    return {
      score: 100,
      label: "Revisar leitura",
      reason: "A cliente disse que não se reconheceu.",
      action: "Revisar sinais antes de convidar para outra camada.",
      state: "risk",
    };
  }

  if (feedback?.response === "fez_sentido_mas_abstrato") {
    return {
      score: 90,
      label: "Trazer para o concreto",
      reason: "A leitura fez sentido, mas ficou abstrata.",
      action: "Enviar ponte prática antes do convite.",
      state: "attention",
    };
  }

  if (
    feedback?.response === "me_senti_vista" &&
    cliente?.resultado &&
    !cliente?.produto_2_liberado
  ) {
    return {
      score: 82,
      label: "Convidar para Dossiê",
      reason: "Alta aderência depois da leitura do Produto 1.",
      action: "Abrir abordagem de aprofundamento.",
      state: "positive",
    };
  }

  if (cliente?.resultado && !cliente?.produto_2_liberado) {
    return {
      score: 72,
      label: "Pronta para convite",
      reason: "Código das Deusas concluído e Dossiê ainda fechado.",
      action: "Avaliar abordagem para próxima camada.",
      state: "positive",
    };
  }

  if (resposta && !resposta.is_complete) {
    return {
      score: 54,
      label: "Quiz em andamento",
      reason: `A cliente avançou ${progress || 0}% no Produto 1.`,
      action: "Acompanhar conclusão da leitura.",
      state: "progress",
    };
  }

  if (!cliente?.perfil_onboarding_concluido) {
    return {
      score: 42,
      label: "Perfil pendente",
      reason: "A Entrada ORI ainda não foi concluída.",
      action: "Convidar a finalizar o perfil inicial.",
      state: "sealed",
    };
  }

  if (cliente?.produto_2_liberado && !cliente?.produto_3_liberado) {
    return {
      score: 32,
      label: "Acompanhar Dossiê",
      reason: "A próxima camada já foi liberada.",
      action: "Observar avanço antes do Código Final.",
      state: "progress",
    };
  }

  return {
    score: 10,
    label: "Sem urgência",
    reason: "Nenhum sinal forte pedindo ação agora.",
    action: "Manter acompanhamento normal.",
    state: "empty",
  };
}
