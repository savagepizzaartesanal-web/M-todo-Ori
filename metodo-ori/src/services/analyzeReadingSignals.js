const blockMeanings = {
  "Sua Presença": "como sua presença chega antes da explicação",
  "Seu Estilo": "como sua imagem tenta se organizar no vestir",
  "Seu Corpo": "como corpo, postura e movimento entram na leitura",
  "Seus Relacionamentos": "como vínculo, espaço e troca aparecem no seu campo",
  "Seu Mundo Interno": "como desejo, controle, imaginação e direção operam por dentro",
  "Seus Padrões": "onde a força pode virar defesa, excesso ou ruído",
};

const blockPracticalSignals = {
  "Sua Presença":
    "quando você chega em um lugar, muda o clima da conversa ou sente que precisa modular sua intensidade para ser recebida",
  "Seu Estilo":
    "quando uma roupa bonita ainda parece errada porque não sustenta o jeito como você quer se mover, ser vista ou se proteger",
  "Seu Corpo":
    "quando postura, conforto, movimento e sensação física dizem antes da cabeça se algo combina com você",
  "Seus Relacionamentos":
    "quando vínculo, troca, distância, escolha ou disponibilidade mexem diretamente com a sua segurança",
  "Seu Mundo Interno":
    "quando desejo, intuição, análise, imaginação ou controle definem o ritmo das suas escolhas",
  "Seus Padrões":
    "quando você repete uma defesa conhecida: agradar, endurecer, sumir, controlar, cuidar demais ou romper antes de nomear o incômodo",
};

const archetypePracticalActions = {
  afrodite:
    "escolha uma peça, gesto ou beleza que aumente prazer sem depender de aprovação externa",
  persefone:
    "observe uma sensação antes de explicá-la e anote o que seu corpo percebeu primeiro",
  hera:
    "defina onde você precisa de respeito real, não apenas de reconhecimento aparente",
  demeter:
    "ofereça cuidado sem assumir uma responsabilidade que não precisa ser sua",
  athena:
    "transforme uma percepção solta em uma decisão simples, com critério e limite",
  artemis:
    "preserve espaço de movimento antes de aceitar uma demanda que aperta seu território",
};

const archetypeDecisionQuestions = {
  afrodite:
    "isso me dá prazer real ou só tenta produzir desejo no olhar de fora?",
  persefone:
    "meu corpo já percebeu algo que minha cabeça ainda está tentando explicar?",
  hera:
    "esse lugar me reconhece de verdade ou só exige que eu sustente uma posição?",
  demeter:
    "esse cuidado nasce de presença ou de uma tentativa de ser necessária?",
  athena:
    "essa escolha tem critério claro ou virou controle para evitar vulnerabilidade?",
  artemis:
    "esse caminho respeita meu espaço ou começa a me prender por dentro?",
};

const archetypeImageNeeds = {
  afrodite:
    "prazer, presença sensorial e beleza que não precise implorar por validação",
  persefone:
    "profundidade, pausa e uma imagem que revele por camadas, sem se explicar demais",
  hera: "dignidade, estrutura e uma presença que comunique valor sem endurecer",
  demeter: "acolhimento, conforto e sustentação sem apagar contorno pessoal",
  athena:
    "clareza, intenção e escolhas visuais com critério, sem rigidez excessiva",
  artemis: "movimento, território e liberdade suficiente para o corpo respirar",
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

function createVidaRealText({
  result,
  practicalBlockText,
  principalTone,
  secondaryTone,
  mostTenseBlock,
  principalAction,
  secondaryAction,
}) {
  const decisionQuestion =
    archetypeDecisionQuestions[result.principalId] ||
    "essa escolha sustenta minha presença ou me coloca em uma versão menor de mim?";
  const secondaryQuestion =
    archetypeDecisionQuestions[result.secundarioId] ||
    "essa nuance precisa aparecer com mais verdade ou está ficando escondida?";
  const principalImageNeed =
    archetypeImageNeeds[result.principalId] || principalTone;
  const secondaryImageNeed =
    archetypeImageNeeds[result.secundarioId] || secondaryTone;
  const tenseBlockName = mostTenseBlock?.bloco || "seus padrões";

  return (
    `Na vida real, ${result.nomeComposto} aparece menos como uma ideia e mais como um modo de reagir. ` +
    `Ela pode surgir ${practicalBlockText}. Quando essa força está viva, você tende a perceber rapidamente se uma situação expande sua presença ou se começa a apertar seu corpo por dentro.\n\n` +
    `Nas decisões, a pergunta silenciosa costuma ser: “${decisionQuestion}”. A resposta nem sempre vem como pensamento organizado. Às vezes aparece como impaciência, distância, vontade de recuar, necessidade de controlar ou dificuldade de permanecer em algo que parece bonito por fora, mas estreito por dentro.\n\n` +
    `Nas relações, o ponto de atenção em ${tenseBlockName.toLowerCase()} mostra onde você pode se adaptar, se defender ou esperar que o outro adivinhe o que está acontecendo. Esse é um ponto importante da leitura: não para se cobrar, mas para perceber onde a sua força vira proteção automática.\n\n` +
    `Na imagem, uma escolha pode estar bonita e ainda assim não funcionar. O que sustenta você precisa dar espaço para ${principalImageNeed}, sem apagar ${secondaryImageNeed}. Antes de escolher roupa, beleza ou postura, pergunte se aquilo deixa você mais presente no corpo ou se apenas encaixa você em um papel aceitável.\n\n` +
    `Para começar a aplicar esta leitura, observe uma situação em que você quase disse sim no automático. Antes de responder, ${principalAction}. Depois, ${secondaryAction}. Se precisar de uma frase simples para reconhecer esse movimento fora da tela, use esta: “${secondaryQuestion}”.`
  );
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
  const practicalBlockText = strongestBlocks
    .map((block) => blockPracticalSignals[block.bloco])
    .join(" e ");
  const principalTone =
    archetypeTone[result.principalId] || result.principal?.toLowerCase();
  const secondaryTone =
    archetypeTone[result.secundarioId] || result.secundario?.toLowerCase();
  const principalQuestions = formatQuestionList(principalEvidence);
  const secondaryQuestions = formatQuestionList(secondaryEvidence);
  const principalAction =
    archetypePracticalActions[result.principalId] ||
    "escolha uma ação pequena que sustente sua força principal sem performar para o olhar externo";
  const secondaryAction =
    archetypePracticalActions[result.secundarioId] ||
    "observe qual nuance da sua força secundária precisa aparecer com mais clareza";
  const vidaReal = createVidaRealText({
    result,
    practicalBlockText,
    principalTone,
    secondaryTone,
    mostTenseBlock,
    principalAction,
    secondaryAction,
  });

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

    vidaReal,

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
    vidaReal: personalized.vidaReal,
    essenciaImagem: `${report.essenciaImagem}\n\n${personalized.essenciaImagem}`,
    leituraFinal: `${report.leituraFinal}\n\n${personalized.leituraFinal}`,
  };
}
