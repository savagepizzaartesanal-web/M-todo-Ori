const blockMeanings = {
  "Sua Presença": "como sua presença chega antes da explicação",
  "Seu Estilo": "como sua imagem tenta se organizar no vestir",
  "Seu Corpo": "como corpo, postura e movimento entram na leitura",
  "Seus Relacionamentos": "como vínculo, espaço e troca aparecem no seu campo",
  "Seu Mundo Interno": "como desejo, controle, imaginação e direção operam por dentro",
  "Seus Padrões": "onde a força pode virar defesa, excesso ou ruído",
};

const archetypeTone = {
  afrodite: "magnetismo, prazer, beleza e desejo de conexão",
  persefone: "profundidade, intuição, recolhimento e mundo interno",
  hera: "dignidade, reconhecimento, posição e compromisso",
  demeter: "cuidado, vínculo, acolhimento e sustentação",
  athena: "clareza, estratégia, leitura de contexto e controle",
  artemis: "liberdade, território, movimento e autonomia",
};

function getAnswerValue(answers, questionId) {
  return Number(answers?.[questionId] || 0);
}

function getBlockStats(questions, answers) {
  const grouped = questions.reduce((acc, question) => {
    const value = getAnswerValue(answers, question.id);

    if (!acc[question.bloco]) {
      acc[question.bloco] = {
        bloco: question.bloco,
        total: 0,
        count: 0,
        high: [],
        low: [],
      };
    }

    acc[question.bloco].total += value;
    acc[question.bloco].count += 1;

    if (value >= 4) {
      acc[question.bloco].high.push({ ...question, value });
    }

    if (value > 0 && value <= 2) {
      acc[question.bloco].low.push({ ...question, value });
    }

    return acc;
  }, {});

  return Object.values(grouped).map((block) => ({
    ...block,
    average: block.count ? block.total / block.count : 0,
  }));
}

function getArchetypeEvidence(questions, answers, archetypeId) {
  return questions
    .map((question) => ({
      question,
      value: getAnswerValue(answers, question.id),
      weight: question.scores[archetypeId] || 0,
    }))
    .filter((item) => item.weight > 0 && item.value >= 4)
    .sort((a, b) => b.value * b.weight - a.value * a.weight)
    .slice(0, 3);
}

function formatQuestionList(items) {
  if (!items.length) return "";

  return items
    .slice(0, 3)
    .map((item) => `“${item.question.pergunta}”`)
    .join(", ");
}

function createPersonalizedReading({ questions, answers, result }) {
  const answeredCount = Object.keys(answers || {}).length;

  if (!answeredCount || !result) {
    return null;
  }

  const blocks = getBlockStats(questions, answers);
  const strongestBlocks = [...blocks]
    .sort((a, b) => b.average - a.average)
    .slice(0, 2);
  const mostTenseBlock = [...blocks]
    .filter((block) => block.low.length > 0 || block.bloco === "Seus Padrões")
    .sort((a, b) => b.average - a.average)[0];
  const principalEvidence = getArchetypeEvidence(
    questions,
    answers,
    result.principalId,
  );
  const secondaryEvidence = getArchetypeEvidence(
    questions,
    answers,
    result.secundarioId,
  );

  const strongestBlockText = strongestBlocks
    .map(
      (block) =>
        `${block.bloco.toLowerCase()} (${blockMeanings[block.bloco]})`,
    )
    .join(" e ");
  const principalTone =
    archetypeTone[result.principalId] || result.principal?.toLowerCase();
  const secondaryTone =
    archetypeTone[result.secundarioId] || result.secundario?.toLowerCase();
  const principalQuestions = formatQuestionList(principalEvidence);
  const secondaryQuestions = formatQuestionList(secondaryEvidence);

  return {
    reconhecimento:
      `Antes de nomear sua composição como ${result.nomeComposto}, o ORI leu o padrão das suas respostas. O que ganhou mais força foi ${strongestBlockText}. Isso indica que o resultado não nasceu apenas de uma soma de arquétipos: ele apareceu pela forma como sua presença, suas escolhas e seus padrões se repetiram no mapa.\n\n` +
      `A força principal, ${result.principal}, apareceu ligada a ${principalTone}. ${principalQuestions ? `Ela se confirmou especialmente quando você marcou com intensidade sinais como ${principalQuestions}.` : "Ela se confirmou pela recorrência dos sinais associados a essa energia."}`,

    dinamica:
      `A dinâmica interna desta leitura mostra um encontro entre ${principalTone} e ${secondaryTone}. A força principal aponta o eixo que mais organiza sua imagem; a força secundária mostra a camada que dá nuance, tensão e profundidade ao resultado.\n\n` +
      `${secondaryQuestions ? `A presença de ${result.secundario} aparece em respostas como ${secondaryQuestions}.` : `A presença de ${result.secundario} aparece como uma segunda corrente atravessando sua leitura.`} Por isso, a leitura não deve ser entendida como um rótulo fixo, mas como um movimento entre duas forças que precisam aprender a trabalhar juntas.`,

    sombra:
      mostTenseBlock
        ? `O ponto de maior atenção aparece em ${mostTenseBlock.bloco.toLowerCase()}. Esse bloco fala de ${blockMeanings[mostTenseBlock.bloco]}, e mostra onde sua imagem pode perder clareza quando tenta compensar, se proteger ou responder demais ao ambiente.\n\nA sombra aqui não significa erro. Ela mostra o lugar onde a força nomeada precisa de mais consciência para não virar defesa, excesso ou fragmentação visual.`
        : `O ponto de atenção desta leitura está menos em uma falha específica e mais na necessidade de sustentar coerência entre essência, presença e imagem. Quando essas camadas se separam, a força nomeada pode parecer menor do que realmente é.`,

    essenciaImagem:
      `Quando cruzamos o resultado com suas respostas, a direção de imagem pede mais do que estética bonita: ela precisa traduzir o modo como você funciona. A roupa, a beleza, a cor e o gesto precisam sustentar ${principalTone}, sem apagar ${secondaryTone}.\n\nÉ aqui que começa a ponte para o Dossiê ORI: a primeira leitura nomeia a força, mas ainda não resolve sozinha como essa força deve aparecer no corpo, no rosto, no cabelo, na coloração e na rotina real.`,

    leituraFinal:
      `Esta leitura foi construída a partir das suas respostas, não apenas da combinação arquetípica final. O ORI observou onde você marcou intensidade, onde apareceu contraste e onde sua imagem parece pedir mais tradução.\n\nPor isso, ${result.nomeComposto} é menos uma etiqueta e mais uma chave de leitura: ela mostra a força que organiza sua presença agora e aponta o próximo passo. Depois de nomear essa base, o Dossiê ORI aprofunda a tradução para a sua imagem concreta: corpo, cor, beleza, cabelo, proporção, textura e presença visual aplicada.`,
  };
}

export function enrichReportWithSignals({ report, questions, answers, result }) {
  const personalized = createPersonalizedReading({ questions, answers, result });

  if (!report || !personalized) return report;

  return {
    ...report,
    reconhecimento: `${personalized.reconhecimento}\n\n${report.reconhecimento}`,
    dinamica: `${personalized.dinamica}\n\n${report.dinamica}`,
    sombra: `${personalized.sombra}\n\n${report.sombra}`,
    essenciaImagem: `${report.essenciaImagem}\n\n${personalized.essenciaImagem}`,
    leituraFinal: `${report.leituraFinal}\n\n${personalized.leituraFinal}`,
  };
}
