export default function OnboardingLeftPanel({ formData }) {
  const objective = Array.isArray(formData.mainDesire)
    ? formData.mainDesire.join(", ")
    : formData.mainDesire;

  const summaryItems = [
    {
      label: "Nome",
      value: formData.preferredName,
      fallback: "Ainda não nomeada",
    },
    {
      label: "Momento",
      value: formData.journeyStage,
      fallback: "Ainda em reconhecimento",
    },
    {
      label: "Objetivo",
      value: objective,
      fallback: "Ainda em formação",
    },
  ];

  return (
    <aside
      className="relative hidden h-full min-h-0 overflow-hidden border-r lg:flex lg:flex-col"
      style={{
        borderColor: "rgba(242,185,104,0.10)",
        background:
          "radial-gradient(circle at 0% 18%, rgba(210,135,70,0.16), transparent 28%), radial-gradient(circle at 62% -8%, rgba(242,185,104,0.12), transparent 26%), linear-gradient(180deg, rgba(16,7,9,0.88) 0%, rgba(20,7,12,0.82) 52%, rgba(8,3,5,0.94) 100%)",
      }}
    >
      <video
        className="absolute inset-0 h-full w-full object-cover opacity-30"
        autoPlay
        loop
        muted
        playsInline
        preload="none"
      >
        <source
          src="/videos/quizz/quizz-bg.mp4"
          type="video/mp4"
          media="(min-width: 1024px)"
        />
      </video>
      <div className="absolute inset-0 bg-gradient-to-b from-[rgba(5,2,2,0.30)] via-[rgba(5,2,2,0.58)] to-[rgba(5,2,2,0.88)]" />
      <div className="absolute inset-0 opacity-[0.025]">
        <div className="h-full w-full bg-[radial-gradient(circle_at_center,rgba(242,185,104,0.18)_1px,transparent_1px)] [background-size:28px_28px]" />
      </div>
      <div className="absolute -left-36 top-12 h-72 w-72 rounded-full bg-[rgba(210,135,70,0.09)] blur-[2px]" />
      <div className="absolute -right-32 top-20 h-72 w-72 rounded-full border border-[rgba(242,185,104,0.06)]" />
      <div
        className="absolute left-1/2 top-0 z-20 grid h-[88px] w-[112px] -translate-x-1/2 place-items-center rounded-b-[24px] border-x border-b"
        style={{
          borderColor: "rgba(242,185,104,0.14)",
          background:
            "linear-gradient(180deg, rgba(247,234,216,0.09), rgba(5,2,2,0.62))",
          boxShadow:
            "0 16px 34px rgba(0,0,0,0.22), 0 0 30px rgba(242,185,104,0.055)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
        }}
      >
        <img
          src="/images/logo/logo-ori.png"
          alt="Método ORI"
          className="h-[72px] w-[72px] object-contain"
        />
      </div>

      <div
        className="absolute left-5 top-5 z-30 inline-flex items-center gap-2 rounded-full border px-3 py-1.5"
        style={{
          borderColor: "rgba(242,185,104,0.12)",
          background:
            "linear-gradient(90deg, rgba(242,185,104,0.055), rgba(255,255,255,0.012))",
          color: "rgba(255,245,235,0.56)",
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
        }}
      >
        <span className="h-1.5 w-1.5 rounded-full bg-[#f2b968] shadow-[0_0_12px_rgba(242,185,104,0.36)]" />
        <span className="ori-type-system text-[9px]">
          Entrada rápida
        </span>
      </div>

      <div className="relative z-10 flex min-h-0 flex-1 flex-col justify-center px-8 pb-6 pt-28 xl:px-10">
        <h1
          className="ori-type-hero max-w-[430px] shrink-0 text-[32px] xl:text-[39px]"
          style={{
            color: "rgba(242,185,104,0.96)",
            fontWeight: 660,
            letterSpacing: "-0.065em",
            textShadow: "0 0 42px rgba(242,185,104,0.13)",
          }}
        >
          Crie seu perfil ORI.
        </h1>

        <p
          className="ori-type-reading-soft mt-3 max-w-[410px] shrink-0 text-[13px]"
          style={{ color: "rgba(255,245,235,0.62)" }}
        >
          Essas informações ajudam a personalizar sua experiência no portal.
        </p>

        <div className="mt-6 min-h-0">
          <div className="mb-2.5 flex items-center gap-3">
            <span className="h-px flex-1 bg-gradient-to-r from-[rgba(242,185,104,0.20)] to-transparent" />
            <p
              className="ori-type-system text-[10px]"
              style={{ color: "rgba(242,185,104,0.62)" }}
            >
              Resumo
            </p>
          </div>

          <div className="grid gap-2">
            {summaryItems.map((item) => (
              <SummaryRow
                key={item.label}
                label={item.label}
                value={item.value}
                fallback={item.fallback}
              />
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}

function SummaryRow({ label, value, fallback }) {
  const active = Boolean(value);

  return (
    <div
      className="ori-card-secondary min-w-0 rounded-[14px] border px-3.5 py-2.5 transition"
      data-state={active ? "revealed" : "sealed"}
      style={{
        borderColor: active
          ? "rgba(242,185,104,0.18)"
          : "rgba(242,185,104,0.055)",
        background: active
          ? "linear-gradient(135deg, rgba(242,185,104,0.058), rgba(255,255,255,0.014))"
          : "linear-gradient(135deg, rgba(255,255,255,0.010), rgba(255,255,255,0.004))",
        boxShadow: active
          ? "inset 0 0 18px rgba(242,185,104,0.018)"
          : "inset 0 0 12px rgba(255,255,255,0.006)",
      }}
    >
      <div className="mb-1 flex items-center justify-between gap-3">
        <span
          className="ori-type-system truncate text-[9px]"
          style={{ color: "rgba(242,185,104,0.62)" }}
        >
          {label}
        </span>
        <span
          className="h-1.5 w-1.5 shrink-0 rounded-full"
          style={{
            background: active
              ? "rgba(242,185,104,0.9)"
              : "rgba(255,245,235,0.18)",
            boxShadow: active ? "0 0 12px rgba(242,185,104,0.32)" : "none",
          }}
        />
      </div>
      <span
        className="ori-type-reading-soft block truncate text-[13px]"
        style={{
          color: active ? "rgba(247,234,216,0.9)" : "rgba(255,245,235,0.44)",
        }}
      >
        {value || fallback}
      </span>
    </div>
  );
}
