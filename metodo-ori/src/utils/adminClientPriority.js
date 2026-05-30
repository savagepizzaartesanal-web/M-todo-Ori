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

export function getAdminClientMemory({
  cliente,
  resposta,
  feedback,
  onboardingProfile = {},
  priority,
}) {
  const activePriority =
    priority || getAdminClientPriority({ cliente, resposta, feedback });
  const preferredName =
    onboardingProfile.preferredName ||
    cliente?.nome?.trim()?.split(" ")?.[0] ||
    "Cliente";
  const resultName =
    resposta?.result?.nomeComposto || cliente?.resultado || "sem resultado definido";
  const progress = getProduto1Progress(resposta);
  const profileMoment = onboardingProfile.journeyStage;
  const mainPain =
    onboardingProfile.mainPain === "Quero escrever com minhas palavras"
      ? onboardingProfile.mainPainCustom || onboardingProfile.mainPain
      : onboardingProfile.mainPain || onboardingProfile.mainPainCustom;
  const mainDesire = onboardingProfile.mainDesire;

  let stateText = `${preferredName} ainda está em entrada.`;

  if (!cliente?.perfil_onboarding_concluido) {
    stateText =
      `${preferredName} ainda não concluiu o perfil inicial. O foco é destravar a Entrada ORI.`;
  } else if (resposta && !resposta.is_complete) {
    stateText =
      `${preferredName} iniciou o Código das Deusas e avançou ${progress || 0}%.`;
  } else if (cliente?.resultado) {
    stateText =
      `${preferredName} concluiu o Código das Deusas com leitura ${resultName}.`;
  }

  let receptionText = "Ainda não há feedback pós-leitura registrado.";

  if (feedback?.response === "me_senti_vista") {
    receptionText =
      "A leitura teve alta aderência: ela sinalizou que se sentiu vista.";
  } else if (feedback?.response === "fez_sentido_mas_abstrato") {
    receptionText =
      "A leitura tocou, mas ainda precisa virar exemplo concreto antes do convite.";
  } else if (feedback?.response === "nao_me_reconheci") {
    receptionText =
      "Há risco de desalinhamento: ela disse que não se reconheceu na leitura.";
  }

  const contextParts = [
    profileMoment ? `Momento: ${profileMoment}` : "",
    mainPain ? `Dor: ${mainPain}` : "",
    mainDesire ? `Desejo: ${mainDesire}` : "",
  ].filter(Boolean);

  return {
    title: "Estado da cliente agora",
    summary: `${stateText} ${receptionText}`,
    signals: contextParts,
    nextContact:
      `${activePriority.action} ` +
      "Entrar pelo próximo passo, não por uma nova explicação da jornada.",
  };
}

export function getAdminClientApproach({
  cliente,
  feedbackBridge,
  onboardingProfile = {},
  priority,
}) {
  const firstName =
    onboardingProfile.preferredName ||
    cliente?.nome?.trim()?.split(" ")?.[0] ||
    "nome";

  if (feedbackBridge?.text) {
    return {
      title: feedbackBridge.title || "Mensagem sugerida",
      text: feedbackBridge.text,
    };
  }

  if (priority?.state === "positive") {
    return {
      title: "Convite para próxima camada",
      text:
        `Oi, ${firstName}. Sua leitura já mostrou uma direção importante. ` +
        "O próximo passo é traduzir essa força no corpo, cabelo, cor, beleza e presença. " +
        "Se fizer sentido para você, posso te explicar como funciona o Dossiê ORI.",
    };
  }

  if (priority?.state === "sealed") {
    return {
      title: "Retomada da Entrada ORI",
      text:
        `Oi, ${firstName}. Vi que sua Entrada ORI ainda não foi finalizada. ` +
        "Quando você completar essa parte, consigo ler sua jornada com mais precisão e liberar a próxima etapa.",
    };
  }

  return {
    title: "Acompanhamento leve",
    text:
      `Oi, ${firstName}. Passei para acompanhar sua jornada no ORI. ` +
      "Quando você quiser, posso te orientar no próximo passo com calma.",
  };
}
