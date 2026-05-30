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
      label: "Finalizar Entrada ORI",
      reason: "A cliente ainda não completou o perfil inicial.",
      action: "Enviar lembrete para concluir a Entrada ORI antes da leitura.",
      messageGoal: "Retomar o cadastro sem explicar toda a jornada.",
      state: "sealed",
    };
  }

  if (resposta && !resposta.is_complete) {
    return {
      score: 86,
      label: "Acompanhar leitura",
      reason: `${firstName} iniciou o Código das Deusas e avançou ${progress || 0}%.`,
      action: "Convidar a concluir as respostas do Produto 1.",
      messageGoal: "Remover fricção e trazer a cliente de volta ao fluxo.",
      state: "progress",
    };
  }

  if (!cliente?.resultado) {
    return {
      score: 78,
      label: "Iniciar Código das Deusas",
      reason: "Ainda não existe leitura revelada para esta cliente.",
      action: "Direcionar para a primeira leitura simbólica.",
      messageGoal: "Abrir a primeira camada sem criar excesso de explicação.",
      state: "active",
    };
  }

  if (!feedback?.response) {
    return {
      score: 88,
      label: "Pedir retorno da leitura",
      reason: "Ela concluiu a leitura, mas ainda não contou como recebeu.",
      action: "Pedir retorno antes de convidar para outra camada.",
      messageGoal: "Entender se a leitura encontrou, confundiu ou precisa de ponte prática.",
      state: "attention",
    };
  }

  if (feedback?.response === "nao_me_reconheci") {
    return {
      score: 100,
      label: "Revisar leitura",
      reason: "A cliente disse que não se reconheceu.",
      action: "Acolher o retorno dela e revisar sinais antes de convidar para outra camada.",
      messageGoal: "Diminuir ruído, pedir contexto e recuperar confiança.",
      state: "risk",
    };
  }

  if (feedback?.response === "fez_sentido_mas_abstrato") {
    return {
      score: 90,
      label: "Dar exemplos concretos",
      reason: "Ela entendeu a leitura, mas precisa ver isso em exemplos reais.",
      action: "Enviar ponte prática antes do convite.",
      messageGoal: "Transformar a leitura em exemplos de corpo, imagem e rotina.",
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
      reason: "Ela se sentiu vista e pode receber um convite com cuidado.",
      action: "Abrir abordagem de aprofundamento.",
      messageGoal: "Conectar a força revelada com corpo, cor, cabelo e presença.",
      state: "positive",
    };
  }

  if (cliente?.resultado && !cliente?.produto_2_liberado) {
    return {
      score: 72,
      label: "Pronta para convite",
      reason: "Código das Deusas concluído e Dossiê ainda fechado.",
      action: "Avaliar abordagem para próxima camada.",
      messageGoal: "Convidar com cuidado, usando a leitura como ponte.",
      state: "positive",
    };
  }

  if (cliente?.produto_2_liberado && !cliente?.produto_3_liberado) {
    return {
      score: 48,
      label: "Acompanhar Dossiê",
      reason: "A próxima camada já foi liberada.",
      action: "Observar avanço antes do Código Final.",
      messageGoal: "Acompanhar aplicação visual sem apressar o fechamento.",
      state: "progress",
    };
  }

  if (cliente?.resultado && !hasTodayOracle(oraculoCarta)) {
    return {
      score: 28,
      label: "Ativar Oráculo",
      reason: "A cliente ainda não tirou a carta diária de hoje.",
      action: "Lembrar a carta diária como ritual leve de continuidade.",
      messageGoal: "Manter vínculo sem transformar tudo em venda ou tarefa pesada.",
      state: "active",
    };
  }

  if (cliente?.produto_3_liberado && cliente?.status_jornada !== "Finalizado") {
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
    reason: "Nenhum sinal forte pedindo ação agora.",
    action: "Manter acompanhamento normal.",
    messageGoal: "Observar sem interferir.",
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

  let receptionText = "Ela ainda não contou como recebeu a leitura.";

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
    title: "Agora",
    summary: `${stateText} ${receptionText}`,
    signals: contextParts,
    nextContact:
      `${activePriority.action} ` +
      `${activePriority.messageGoal || "Entrar pelo próximo passo, não por uma nova explicação da jornada."}`,
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

  if (priority?.label === "Pedir retorno da leitura") {
    return {
      title: "Pedir como ela recebeu",
      text:
        `Oi, ${firstName}. Vi que sua leitura do Código das Deusas já abriu. ` +
        "Antes de seguir para a próxima camada, queria saber como ela chegou para você: fez sentido, ficou abstrata ou não te encontrou? " +
        "Seu retorno me ajuda a conduzir o próximo passo com mais precisão.",
    };
  }

  if (priority?.state === "progress") {
    return {
      title: "Retomada da leitura",
      text:
        `Oi, ${firstName}. Vi que você já começou sua leitura no ORI. ` +
        "Quando puder, finalize as respostas para o sistema revelar sua composição arquetípica com mais precisão.",
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
