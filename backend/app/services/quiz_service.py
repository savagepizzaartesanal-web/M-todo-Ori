from app.data.quiz import ARCHETYPES, COMBINATIONS, QUESTIONS

INITIAL_SCORES = {
    "afrodite": 0,
    "persefone": 0,
    "hera": 0,
    "demeter": 0,
    "athena": 0,
    "artemis": 0,
}

FALLBACK_TIE_ORDER = [
    "persefone",
    "afrodite",
    "athena",
    "demeter",
    "hera",
    "artemis",
]


def create_tie_stats() -> dict[str, dict[str, int]]:
    return {
        archetype: {
            "strongFive": 0,
            "strongFourOrFive": 0,
            "highIntensityWeight": 0,
        }
        for archetype in INITIAL_SCORES
    }


def normalize_answers(answers: dict[str, int]) -> dict[int, int]:
    normalized = {}

    for question_id, answer in answers.items():
      try:
          parsed_id = int(question_id)
      except (TypeError, ValueError) as exc:
          raise ValueError(f"Pergunta inválida: {question_id}") from exc

      parsed_answer = int(answer)

      if parsed_answer < 1 or parsed_answer > 5:
          raise ValueError(
              f"Resposta inválida na pergunta {parsed_id}. Use valores de 1 a 5."
          )

      normalized[parsed_id] = parsed_answer

    return normalized


def calculate_quiz_result(answers: dict[str, int]) -> dict:
    normalized_answers = normalize_answers(answers)
    expected_question_ids = {question["id"] for question in QUESTIONS}
    missing = sorted(expected_question_ids - set(normalized_answers.keys()))

    if missing:
        raise ValueError(
            "Responda todos os sinais antes de revelar o Código ORI. "
            f"Faltam: {', '.join(str(item) for item in missing)}."
        )

    scores = INITIAL_SCORES.copy()
    tie_stats = create_tie_stats()

    for question in QUESTIONS:
        answer_value = normalized_answers.get(question["id"], 0)

        for archetype, weight in question["scores"].items():
            weighted_score = answer_value * weight
            scores[archetype] += weighted_score

            if weight > 0 and answer_value == 5:
                tie_stats[archetype]["strongFive"] += 1
                tie_stats[archetype]["highIntensityWeight"] += weight

            if weight > 0 and answer_value >= 4:
                tie_stats[archetype]["strongFourOrFive"] += 1

    def sort_key(item: tuple[str, int]):
        archetype, score = item
        stats = tie_stats[archetype]

        return (
            -score,
            -stats["strongFive"],
            -stats["strongFourOrFive"],
            -stats["highIntensityWeight"],
            FALLBACK_TIE_ORDER.index(archetype),
        )

    sorted_scores = sorted(scores.items(), key=sort_key)
    principal_id = sorted_scores[0][0]
    secundario_id = sorted_scores[1][0]
    combination_key = f"{principal_id}+{secundario_id}"

    return {
        "scores": scores,
        "principal": ARCHETYPES[principal_id]["nome"],
        "secundario": ARCHETYPES[secundario_id]["nome"],
        "principalId": principal_id,
        "secundarioId": secundario_id,
        "nomeComposto": COMBINATIONS[combination_key],
    }
