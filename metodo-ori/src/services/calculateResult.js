const initialScores = {
  afrodite: 0,
  persefone: 0,
  hera: 0,
  demeter: 0,
  athena: 0,
  artemis: 0,
};

/*
  Ordem usada apenas como último critério de segurança.
  Mantive uma ordem equilibrada, alternando arquétipos de atração,
  profundidade, estrutura, cuidado, estratégia e liberdade.
*/
const fallbackTieOrder = [
  "persefone",
  "afrodite",
  "athena",
  "demeter",
  "hera",
  "artemis",
];

function createTieStats() {
  return Object.keys(initialScores).reduce((acc, archetype) => {
    acc[archetype] = {
      strongFive: 0,
      strongFourOrFive: 0,
      highIntensityWeight: 0,
    };

    return acc;
  }, {});
}

export function calculateResult(questions, answers, catalog = {}) {
  const archetypes = catalog.archetypes || {};
  const combinations = catalog.combinations || {};
  const scores = { ...initialScores };
  const tieStats = createTieStats();

  questions.forEach((question) => {
    const answerValue = Number(answers[question.id] || 0);

    Object.entries(question.scores).forEach(([archetype, weight]) => {
      const weightedScore = answerValue * weight;

      scores[archetype] += weightedScore;

      /*
        Critério de intensidade:
        só considera arquétipos que realmente pontuam naquela pergunta.
      */
      if (weight > 0 && answerValue === 5) {
        tieStats[archetype].strongFive += 1;
        tieStats[archetype].highIntensityWeight += weight;
      }

      if (weight > 0 && answerValue >= 4) {
        tieStats[archetype].strongFourOrFive += 1;
      }
    });
  });

  const sorted = Object.entries(scores).sort(
    ([archetypeA, scoreA], [archetypeB, scoreB]) => {
      if (scoreB !== scoreA) {
        return scoreB - scoreA;
      }

      const statsA = tieStats[archetypeA];
      const statsB = tieStats[archetypeB];

      if (statsB.strongFive !== statsA.strongFive) {
        return statsB.strongFive - statsA.strongFive;
      }

      if (statsB.strongFourOrFive !== statsA.strongFourOrFive) {
        return statsB.strongFourOrFive - statsA.strongFourOrFive;
      }

      if (statsB.highIntensityWeight !== statsA.highIntensityWeight) {
        return statsB.highIntensityWeight - statsA.highIntensityWeight;
      }

      return (
        fallbackTieOrder.indexOf(archetypeA) -
        fallbackTieOrder.indexOf(archetypeB)
      );
    },
  );

  const principalId = sorted[0][0];
  const secundarioId = sorted[1][0];

  const combinationKeyA = `${principalId}+${secundarioId}`;
  const combinationKeyB = `${secundarioId}+${principalId}`;

  const nomeComposto =
    combinations[combinationKeyA] || combinations[combinationKeyB];

  return {
    scores,
    tieStats,
    principal: archetypes[principalId]?.nome || principalId,
    secundario: archetypes[secundarioId]?.nome || secundarioId,
    principalId,
    secundarioId,
    nomeComposto,
  };
}
