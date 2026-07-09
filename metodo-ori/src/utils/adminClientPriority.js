const DEFAULT_TOTAL_QUESTIONS = 36;

function getProduto1Progress(resposta) {
  if (!resposta) return null;

  return Math.round(
    ((resposta.answered_count || 0) /
      (resposta.total_questions || DEFAULT_TOTAL_QUESTIONS)) *
      100,
  );
}

function getTodayKey() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
  }).format(new Date());
}

function hasTodayOracle(oraculoCarta) {
  return oraculoCarta?.date_key === getTodayKey();
}

function getFirstName(cliente, onboardingProfile = {}) {
  return (
    onboardingProfile.preferredName ||
    cliente?.nome?.trim()?.split(" ")?.[0] ||
    "Cliente"
  );
}

export function getAdminClientNextBestAction({
  cliente,
  resposta,
  feedback,
  oraculoCarta,
  onboardingProfile = {},
}) {
  const progress = getProduto1Progress(resposta);
  const firstName = getFirstName(cliente, onboardingProfile);

  if (!cliente?.perfil_onboarding_concluido) {
    return {
      score: 96,
      label: "Perfil inicial pendente",
      reason: "Entrada ORI não concluída.",
      action: "Solicitar conclusão do perfil inicial antes da leitura.",
      messageGoal: "Enviar lembrete curto, sem explicar todo o processo.",
      state: "sealed",
    };
  }

  if (resposta && !resposta.is_complete) {
    return {
      score: 86,
      label: "Leitura em andamento",
      reason: `${firstName} iniciou o Código das Deusas e respondeu ${progress || 0}% do quiz.`,
      action: "Solicitar conclusão das respostas do Produto 1.",
      messageGoal: "Enviar lembrete objetivo para concluir a etapa iniciada.",
      state: "progress",
    };
  }

  if (!cliente?.resultado) {
    return {
      score: 78,
      label: "Iniciar Código das Deusas",
      reason: "Cliente ainda não tem leitura do Produto 1 registrada.",
      action: "Direcionar para iniciar o Código das Deusas.",
      messageGoal: "Indicar o primeiro passo com clareza.",
      state: "active",
    };
  }

  if (!feedback?.response) {
    return {
      score: 88,
      label: "Resposta pós-leitura pendente",
      reason: "Leitura concluída. Resposta pós-leitura ainda não registrada.",
      action: "Solicitar resposta pós-leitura antes de convidar para a próxima etapa.",
      messageGoal: "Entender se a leitura foi clara, abstrata ou desalinhada.",
      state: "attention",
    };
  }

  if (feedback?.response === "nao_me_reconheci") {
    return {
      score: 100,
      label: "Revisar leitura",
      reason: "Cliente informou que não se reconheceu na leitura.",
      action: "Revisar sinais antes de qualquer convite para o Dossiê.",
      messageGoal: "Pedir contexto, reduzir desalinhamento e evitar avanço prematuro.",
      state: "risk",
    };
  }

  if (feedback?.response === "fez_sentido_mas_abstrato") {
    return {
      score: 90,
      label: "Enviar exemplos práticos",
      reason: "Leitura compreendida, mas ainda abstrata.",
      action: "Enviar exemplos práticos antes do convite.",
      messageGoal: "Conectar a leitura a corpo, imagem e rotina.",
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
      reason: "Resposta positiva registrada. Cliente apta para convite ao Dossiê.",
      action: "Enviar convite para o Dossiê ORI.",
      messageGoal: "Explicar o Dossiê como o próximo passo prático, sem pressão.",
      state: "positive",
    };
  }

  if (cliente?.resultado && !cliente?.produto_2_liberado) {
    return {
      score: 72,
      label: "Avaliar convite",
      reason: "Código das Deusas concluído e Dossiê ainda fechado.",
      action: "Avaliar convite para o Dossiê com base no contexto da cliente.",
      messageGoal: "Conectar o convite ao resultado do Produto 1.",
      state: "positive",
    };
  }

  if (cliente?.produto_2_liberado && !cliente?.produto_3_liberado) {
    return {
      score: 48,
      label: "Acompanhar Dossiê",
      reason: "Dossiê ORI liberado e Código Final ainda fechado.",
      action: "Acompanhar avanço no Dossiê antes de liberar o Código Final.",
      messageGoal: "Acompanhar execução sem antecipar a próxima etapa.",
      state: "progress",
    };
  }

  if (cliente?.resultado && !hasTodayOracle(oraculoCarta)) {
    return {
      score: 28,
      label: "Ativar Oráculo",
      reason: "Carta diária de hoje ainda não registrada.",
      action: "Sugerir uso do Oráculo como acompanhamento leve.",
      messageGoal: "Manter engajamento sem criar pressão comercial.",
      state: "active",
    };
  }

  if (
    cliente?.produto_3_liberado &&
    cliente?.status_jornada !== "Jornada finalizada"
  ) {
    return {
      score: 24,
      label: "Fechar jornada",
      reason: "Código Final liberado e fechamento administrativo ainda pendente.",
      action: "Marcar o encerramento quando a entrega estiver concluída.",
      messageGoal: "Registrar fechamento com cuidado.",
      state: "done",
    };
  }

  return {
    score: 10,
    label: "Sem urgência",
    reason: "Nenhuma pendência relevante identificada.",
    action: "Manter acompanhamento normal.",
    messageGoal: "Sem necessidade de contato ativo agora.",
    state: "empty",
  };
}

export function getAdminClientPriority({
  cliente,
  resposta,
  feedback,
  oraculoCarta,
  onboardingProfile = {},
}) {
  return getAdminClientNextBestAction({
    cliente,
    resposta,
    feedback,
    oraculoCarta,
    onboardingProfile,
  });
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
    onboardingProfile.preferredName || getFirstName(cliente, onboardingProfile);
  const resultName =
    resposta?.result?.nomeComposto || cliente?.resultado || "sem resultado definido";
  const progress = getProduto1Progress(resposta);
  const profileMoment = onboardingProfile.journeyStage;
  const mainPain =
    onboardingProfile.mainPain === "Quero escrever com minhas palavras"
      ? onboardingProfile.mainPainCustom || onboardingProfile.mainPain
      : onboardingProfile.mainPain || onboardingProfile.mainPainCustom;
  const mainDesire = onboardingProfile.mainDesire;

  let stateText = `${preferredName} ainda está na etapa de entrada.`;

  if (!cliente?.perfil_onboarding_concluido) {
    stateText =
      `${preferredName} ainda não concluiu o perfil inicial.`;
  } else if (resposta && !resposta.is_complete) {
    stateText =
      `${preferredName} iniciou o Código das Deusas e respondeu ${progress || 0}% do quiz.`;
  } else if (cliente?.resultado) {
    stateText =
      `${preferredName} concluiu o Código das Deusas com leitura ${resultName}.`;
  }

  let receptionText = "Resposta pós-leitura ainda pendente.";

  if (feedback?.response === "me_senti_vista") {
    receptionText =
      "Na resposta pós-leitura, ela sinalizou que se sentiu vista.";
  } else if (feedback?.response === "fez_sentido_mas_abstrato") {
    receptionText =
      "Na resposta pós-leitura, informou que a leitura fez sentido, mas permaneceu abstrata.";
  } else if (feedback?.response === "nao_me_reconheci") {
    receptionText =
      "Na resposta pós-leitura, informou que não se reconheceu em alguns pontos.";
  }

  const contextParts = [
    profileMoment ? `Momento: ${profileMoment}` : "",
    mainPain ? `Dor: ${mainPain}` : "",
    mainDesire ? `Desejo: ${mainDesire}` : "",
  ].filter(Boolean);

  return {
    title: "Resumo da cliente",
    summary: `${stateText} ${receptionText}`,
    signals: contextParts,
    nextContact:
      `${activePriority.action} ` +
      `${activePriority.messageGoal || "Orientar pelo próximo passo objetivo."}`,
  };
}

export function getAdminClientApproach({
  cliente,
  feedbackBridge,
  onboardingProfile = {},
  priority,
}) {
  const firstName = getFirstName(cliente, onboardingProfile);

  if (feedbackBridge?.text) {
    return {
      title: feedbackBridge.title || "Mensagem sugerida",
      text: feedbackBridge.text,
    };
  }

  if (priority?.label === "Resposta pós-leitura pendente") {
    return {
      title: "Solicitar resposta pós-leitura",
      text:
        `Oi, ${firstName}. Vi que sua primeira leitura do Código das Deusas já ficou pronta. ` +
        "Antes de seguir para a próxima etapa, queria saber como ela chegou para você: fez sentido, ficou abstrata ou não te encontrou? " +
        "Seu retorno me ajuda a conduzir o próximo passo com mais precisão.",
    };
  }

  if (priority?.state === "progress") {
    return {
      title: "Solicitar conclusão da leitura",
      text:
        `Oi, ${firstName}. Vi que você já começou sua leitura no ORI. ` +
        "Quando puder, finalize as respostas para o ORI organizar sua primeira leitura com mais precisão.",
    };
  }

  if (priority?.state === "positive") {
    return {
      title: "Convite para o Dossiê",
      text:
        `Oi, ${firstName}. Seu Código das Deusas já mostrou uma direção importante: a força que organiza sua imagem por dentro. ` +
        "O Dossiê ORI é a próxima etapa para ver como isso aparece no corpo, nas cores, no cabelo, na beleza e na rotina real. " +
        "Se fizer sentido para você, posso te explicar com calma como funciona.",
    };
  }

  if (priority?.state === "sealed") {
    return {
      title: "Solicitar conclusão da Entrada ORI",
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
