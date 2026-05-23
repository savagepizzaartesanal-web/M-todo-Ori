export default function OnboardingNavigation({
  step,
  stepIndex,
  totalSteps,
  canProceed = true,
  onBack,
  onNext,
}) {
  return (
    <div className="mt-4 flex flex-col-reverse gap-3 border-t border-[rgba(242,185,104,0.08)] pt-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        {stepIndex > 0 && step.type !== "success" && stepIndex < totalSteps && (
          <button
            type="button"
            onClick={onBack}
            className="ori-button-secondary px-5 py-2.5 text-sm transition duration-300 hover:border-[rgba(242,185,104,0.22)] hover:bg-white/[0.035] hover:text-[rgba(247,234,216,0.9)]"
            style={{
              borderColor: "rgba(242,185,104,0.11)",
              color: "rgba(255,245,235,0.64)",
              background: "rgba(255,255,255,0.012)",
            }}
          >
            Voltar
          </button>
        )}
      </div>

      <button
        type="button"
        disabled={!canProceed}
        onClick={onNext}
        className="ori-journey-action relative overflow-hidden rounded-full px-7 py-2.5 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-40"
        style={{
          background:
            "linear-gradient(135deg, rgba(210,135,70,1), rgba(242,185,104,1) 54%, rgba(255,213,142,1))",
          color: "#090506",
          boxShadow:
            "0 0 32px rgba(210,135,70,0.18), 0 12px 34px rgba(0,0,0,0.24), inset 0 1px 0 rgba(255,255,255,0.28)",
        }}
      >
        <span className="pointer-events-none absolute inset-x-5 top-0 h-px bg-white/45" />
        <span className="relative z-10">{step.ctaLabel || "Continuar"}</span>
      </button>
    </div>
  );
}
