export default function OnboardingProgress({
  step,
  stepIndex,
  totalSteps,
  progress,
}) {
  const visibleStep = Math.min(stepIndex + 1, Math.max(totalSteps - 1, 1));
  const isDone = stepIndex > 2;

  return (
    <header className="relative z-10 mb-2 shrink-0">
      <div className="mb-2 flex items-center justify-between gap-4">
        <p
          className="ori-type-system truncate text-[10px]"
          style={{ color: "rgba(242,185,104,0.76)" }}
        >
          {isDone ? "Perfil criado" : step?.eyebrow || "Perfil de Entrada ORI"}
        </p>

        <p
          className="ori-type-system hidden shrink-0 text-[9px] sm:block"
          style={{ color: "rgba(255,245,235,0.38)" }}
        >
          {isDone
            ? "Registro completo"
            : `Etapa ${visibleStep} de ${Math.max(totalSteps - 1, 1)}`}
        </p>
      </div>

      <div
        className="ori-progress h-px"
        style={{
          background:
            "linear-gradient(90deg, rgba(255,255,255,0.030), rgba(242,185,104,0.08), rgba(255,255,255,0.030))",
        }}
      >
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${progress}%`,
            background:
              "linear-gradient(90deg, rgba(210,135,70,0.65), rgba(255,213,143,0.95))",
            boxShadow: "0 0 18px rgba(242,185,104,0.28)",
          }}
        />
      </div>
    </header>
  );
}
