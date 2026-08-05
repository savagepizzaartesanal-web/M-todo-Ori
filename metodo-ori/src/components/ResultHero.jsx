import { archetypeThemes } from "../data/archetypeThemes";

function ArchetypeSignalChip({ label, value, variant = "primary" }) {
  const isPrimary = variant === "primary";

  return (
    <div
      className="relative overflow-hidden rounded-[20px] px-4 py-3.5"
      style={{
        background:
          "linear-gradient(135deg, rgba(5,2,2,0.74), rgba(18,9,10,0.46))",
        border: isPrimary
          ? "1px solid rgba(242,185,104,0.18)"
          : "1px solid rgba(210,135,70,0.13)",
        color: "rgba(255,245,235,0.78)",
        boxShadow: isPrimary
          ? "0 0 28px rgba(242,185,104,0.030), inset 0 0 18px rgba(242,185,104,0.018)"
          : "0 0 22px rgba(210,135,70,0.022), inset 0 0 16px rgba(210,135,70,0.014)",
        backdropFilter: "blur(18px)",
        WebkitBackdropFilter: "blur(18px)",
      }}
    >
      <div
        className="absolute inset-y-0 left-0 w-[5px]"
        style={{
          background: isPrimary
            ? "linear-gradient(180deg, rgba(242,185,104,0.95), rgba(128,53,34,0.70))"
            : "linear-gradient(180deg, rgba(210,135,70,0.82), rgba(84,37,34,0.62))",
          boxShadow: "0 0 18px rgba(210,135,70,0.20)",
        }}
      />

      <div
        className="pointer-events-none absolute inset-0 opacity-[0.08]"
        style={{
          backgroundImage:
            "linear-gradient(135deg, transparent 0 44%, rgba(242,185,104,0.60) 45% 47%, transparent 48% 100%), linear-gradient(45deg, transparent 0 48%, rgba(242,185,104,0.38) 49% 51%, transparent 52% 100%)",
          backgroundSize: "28px 28px",
        }}
      />

      <div className="relative z-10 flex items-center gap-3">
        <div
          className="grid h-9 w-9 shrink-0 place-items-center rounded-full"
          style={{
            background: isPrimary
              ? "radial-gradient(circle, rgba(242,185,104,0.15), rgba(5,2,2,0.88))"
              : "radial-gradient(circle, rgba(210,135,70,0.12), rgba(5,2,2,0.88))",
            border: "1px solid rgba(242,185,104,0.18)",
            boxShadow: "0 0 18px rgba(210,135,70,0.11)",
          }}
        >
          <span
            className="h-2 w-2 rounded-full"
            style={{
              background: isPrimary
                ? "rgba(242,185,104,0.92)"
                : "rgba(210,135,70,0.82)",
              boxShadow: "0 0 12px rgba(242,185,104,0.35)",
            }}
          />
        </div>

        <div className="min-w-0">
          <span
            className="ori-type-system block text-[8px] mb-1"
            style={{ color: "rgba(242,185,104,0.78)" }}
          >
            {label}
          </span>

          <p className="truncate text-[15px] leading-snug md:text-base">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}

function ResultHero({ nome, principal, secundario, frase, imagem }) {
  const fraseFinal =
    frase || "Sua imagem começa a mostrar o que já existe em você.";

  const fraseFormatada =
    fraseFinal === "Sua imagem começa a mostrar o que já existe em você."
      ? "Sua imagem começa a mostrar\no que já existe em você."
      : fraseFinal ===
          "Você segue aquilo que sente antes mesmo de conseguir explicar."
        ? "Você segue aquilo que sente\nantes mesmo de conseguir explicar."
        : fraseFinal;

  const theme = archetypeThemes[nome] || {
    accent: "var(--gold-primary)",
    glow: "rgba(242,185,104,0.18)",
    border: "rgba(242,185,104,0.18)",
    gradient:
      "radial-gradient(circle at top right, rgba(242,185,104,0.14), transparent 35%), linear-gradient(180deg, rgba(18,9,10,0.98), rgba(5,2,2,1))",
  };

  return (
    <section
      className="
        cinematic-card
        relative
        left-1/2
        overflow-hidden
        mb-8
        min-h-[620px]
        w-screen
        -translate-x-1/2
        md:min-h-[calc(100vh-132px)]
      "
      style={{
        background:
          "linear-gradient(135deg, rgba(18,9,10,0.92), rgba(5,2,2,0.98))",
        borderBottom: "1px solid rgba(242,185,104,0.10)",
        boxShadow:
          "0 40px 90px rgba(0,0,0,0.32), inset 0 0 90px rgba(242,185,104,0.018)",
      }}
    >
      {imagem && (
        <img
          src={imagem}
          alt={nome}
          loading="eager"
          decoding="async"
          className="
            absolute
            inset-0
            w-full
            h-full
            object-cover
            object-[70%_center]
            md:object-center
            cinematic-image-reveal
          "
        />
      )}

      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(90deg, rgba(5,2,2,0.96) 0%, rgba(5,2,2,0.80) 28%, rgba(5,2,2,0.46) 52%, rgba(5,2,2,0.20) 74%, rgba(5,2,2,0.10) 100%)",
        }}
      />

      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(180deg, rgba(5,2,2,0.30) 0%, rgba(5,2,2,0.04) 42%, rgba(5,2,2,0.72) 100%), radial-gradient(circle at 70% 36%, rgba(242,185,104,0.18), transparent 30%), radial-gradient(circle at 18% 84%, rgba(183,140,255,0.05), transparent 32%)",
        }}
      />

      <div
        className="absolute inset-0 pointer-events-none opacity-[0.02]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(242,185,104,0.16) 1px, transparent 1px), linear-gradient(90deg, rgba(242,185,104,0.07) 1px, transparent 1px)",
          backgroundSize: "72px 72px",
        }}
      />

      <div
        className="absolute -top-24 -right-24 w-[320px] h-[320px] rounded-full blur-3xl opacity-[0.10] pointer-events-none"
        style={{ background: theme.accent }}
      />

      <div
        className="absolute bottom-[-110px] left-[-70px] w-[240px] h-[240px] rounded-full blur-3xl opacity-[0.06] pointer-events-none"
        style={{ background: "var(--gold-primary)" }}
      />

      <div
        className="absolute bottom-0 left-0 w-full h-px pointer-events-none"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(242,185,104,0.14), transparent)",
        }}
      />

      <div
        className="
          relative
          z-10
          mx-auto
          flex
          min-h-[620px]
          max-w-7xl
          flex-col
          justify-center
          px-6
          py-16
          md:min-h-[calc(100vh-132px)]
          md:px-10
          lg:px-14
        "
      >
        <div
          className="ori-label-line reveal-step mb-6 mt-10 justify-center md:mt-12 md:justify-start"
          style={{ "--delay": "0.1s" }}
        >
          <p
            className="ori-type-system text-[9px]"
            style={{
              color: "var(--gold-soft)",
              textShadow: "0 0 14px rgba(242,185,104,0.10)",
            }}
          >
            Seu código foi revelado
          </p>
        </div>

        <h1
          className="
            reveal-step
            ori-type-hero
            text-[42px]
            md:text-[66px]
            xl:text-[78px]
            font-semibold
            leading-[0.92]
            mb-5
            max-w-3xl
          "
          style={{
            color: "var(--gold-primary)",
            letterSpacing: "-0.075em",
            textShadow: "0 0 34px rgba(242,185,104,0.12)",
            "--delay": "0.28s",
          }}
        >
          {nome}
        </h1>

        <p
          className="
            reveal-step
            ori-type-reading
            text-lg
            md:text-[27px]
            leading-[1.38]
            max-w-[680px]
            mb-7
            whitespace-pre-line
          "
          style={{
            color: "var(--text-primary)",
            textShadow: "0 0 22px rgba(0,0,0,0.42)",
            "--delay": "0.48s",
          }}
        >
          {fraseFormatada}
        </p>

        <div
          className="reveal-step grid max-w-xl gap-3 sm:grid-cols-2 mb-5"
          style={{ "--delay": "0.68s" }}
        >
          <ArchetypeSignalChip label="Arquétipo principal" value={principal} />
          <ArchetypeSignalChip
            label="Arquétipo secundário"
            value={secundario}
            variant="secondary"
          />
        </div>

        <div
          className="reveal-step relative max-w-xl overflow-hidden rounded-[20px] px-4 py-3.5"
          style={{
            background:
              "linear-gradient(135deg, rgba(8,8,9,0.72), rgba(34,31,29,0.38))",
            border: "1px solid rgba(214,205,190,0.15)",
            boxShadow:
              "0 0 24px rgba(214,205,190,0.020), inset 0 0 18px rgba(214,205,190,0.014)",
            backdropFilter: "blur(18px)",
            WebkitBackdropFilter: "blur(18px)",
            "--delay": "0.88s",
          }}
        >
          <div
            className="absolute inset-y-0 left-0 w-[5px]"
            style={{
              background:
                "linear-gradient(180deg, rgba(230,224,211,0.72), rgba(126,116,106,0.58))",
              boxShadow: "0 0 16px rgba(214,205,190,0.16)",
            }}
          />

          <div
            className="pointer-events-none absolute inset-0 opacity-[0.06]"
            style={{
              backgroundImage:
                "linear-gradient(135deg, transparent 0 44%, rgba(230,224,211,0.52) 45% 47%, transparent 48% 100%), linear-gradient(45deg, transparent 0 48%, rgba(214,205,190,0.34) 49% 51%, transparent 52% 100%)",
              backgroundSize: "28px 28px",
            }}
          />

          <div className="relative z-10 flex items-center gap-3">
            <div
              className="grid h-8 w-8 shrink-0 place-items-center rounded-full"
              style={{
                background:
                  "radial-gradient(circle, rgba(230,224,211,0.14), rgba(5,2,2,0.88))",
                border: "1px solid rgba(214,205,190,0.17)",
                boxShadow: "0 0 16px rgba(214,205,190,0.11)",
              }}
            >
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{
                  background: "rgba(230,224,211,0.92)",
                  boxShadow: "0 0 12px rgba(230,224,211,0.30)",
                }}
              />
            </div>

            <p
              className="ori-type-reading-soft text-sm md:text-[15px]"
              style={{ color: "rgba(255,245,235,0.72)" }}
            >
              Esta é sua base arquetípica inicial: a força que organiza sua
              imagem antes de virar roupa, cor, beleza e assinatura visual.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ResultHero;
