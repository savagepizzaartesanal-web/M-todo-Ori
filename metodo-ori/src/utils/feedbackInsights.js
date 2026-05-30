export const FEEDBACK_LABELS = {
  me_senti_vista: "Me senti vista",
  fez_sentido_mas_abstrato: "Fez sentido, mas ficou abstrato",
  nao_me_reconheci: "Não me reconheci",
};

const INSIGHTS = {
  me_senti_vista: {
    label: "Alta aderência",
    action: "Boa candidata para convite ao Dossiê.",
    state: "positive",
    bridgeTitle: "Convite direto com aprofundamento",
    bridgeText:
      "Oi, {nome}. Fiquei feliz em saber que a leitura te encontrou. O próximo movimento é levar essa força para o corpo, a imagem e as escolhas práticas do dia a dia. Se fizer sentido para você, o Dossiê ORI é a camada em que a gente traduz essa base em presença visual.",
  },
  fez_sentido_mas_abstrato: {
    label: "Precisa clareza prática",
    action: "Enviar ponte mais concreta antes do convite.",
    state: "attention",
    bridgeTitle: "Ponte prática antes do convite",
    bridgeText:
      "Oi, {nome}. Obrigada por me contar isso. Quando a leitura faz sentido, mas ainda parece abstrata, o melhor próximo passo é trazer essa força para exemplos bem concretos: corpo, cabelo, cor, beleza, postura e rotina. Antes de avançar, eu te mostraria como essa leitura aparece na sua imagem.",
  },
  nao_me_reconheci: {
    label: "Risco de desalinhamento",
    action: "Revisar leitura antes de convidar.",
    state: "risk",
    bridgeTitle: "Revisão cuidadosa da leitura",
    bridgeText:
      "Oi, {nome}. Obrigada por responder com sinceridade. Se a leitura não te encontrou, eu não avançaria direto para uma próxima camada. Primeiro vale revisar os sinais, entender onde ficou distante e ajustar a leitura para que ela converse melhor com a sua experiência real.",
  },
};

export function getFeedbackInsight(feedback) {
  if (!feedback?.response) {
    return {
      label: "Sem feedback",
      action: "Pedir retorno da leitura.",
      state: "empty",
    };
  }

  return (
    INSIGHTS[feedback.response] || {
      label: FEEDBACK_LABELS[feedback.response] || feedback.response,
      action: "Ler comentário aberto e definir próximo contato.",
      state: "attention",
    }
  );
}

export function getFeedbackBridge(feedback, cliente) {
  const insight = getFeedbackInsight(feedback);
  const firstName = cliente?.nome?.trim()?.split(" ")?.[0] || "nome";

  return {
    title: insight.bridgeTitle || "Abordagem manual",
    text: (insight.bridgeText || "Oi, {nome}. Li seu retorno e vou olhar sua leitura com calma antes de sugerir o próximo movimento.").replace(
      "{nome}",
      firstName,
    ),
  };
}
