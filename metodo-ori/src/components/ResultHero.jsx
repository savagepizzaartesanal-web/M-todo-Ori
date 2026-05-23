import { archetypeThemes } from "../data/archetypeThemes";

function ResultHero({ nome, principal, secundario, frase, imagem }) {
  const fraseFinal =
    frase || "Sua imagem revela aquilo que sua essência já sabe.";

  const fraseFormatada =
    fraseFinal ===
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
        ori-main-frame
        cinematic-card
        relative
        overflow-hidden
        rounded-[28px]
        md:rounded-[36px]
        mb-5
        min-h-[380px]
        md:min-h-[420px]
        xl:min-h-[430px]
      "
      style={{
        background:
          "linear-gradient(135deg, rgba(18,9,10,0.82), rgba(5,2,2,0.94))",
        border: "1px solid rgba(242,185,104,0.12)",
        boxShadow:
          "0 0 72px rgba(242,185,104,0.04), inset 0 0 52px rgba(255,255,255,0.012)",
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
      }}
    >
      {imagem && (
        <img
          src={imagem}
          alt={nome}
          className="
            absolute
            inset-0
            w-full
            h-full
            object-cover
            object-[74%_18%]
            md:object-[76%_18%]
            lg:object-[77%_18%]
            cinematic-image-reveal
          "
        />
      )}

      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(90deg, rgba(5,2,2,0.97) 0%, rgba(5,2,2,0.92) 24%, rgba(5,2,2,0.78) 42%, rgba(5,2,2,0.46) 58%, rgba(5,2,2,0.18) 76%, rgba(5,2,2,0.04) 100%)",
        }}
      />

      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(circle at 74% 28%, rgba(242,185,104,0.12), transparent 26%), radial-gradient(circle at 18% 84%, rgba(183,140,255,0.05), transparent 32%)",
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
        className="absolute top-0 left-0 w-full h-px pointer-events-none"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(242,185,104,0.40), transparent)",
        }}
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
          px-6
          py-6
          md:px-8
          md:py-7
          xl:px-10
          xl:py-8
          max-w-[94%]
          md:max-w-[56%]
          lg:max-w-[50%]
          min-h-[380px]
          md:min-h-[420px]
          xl:min-h-[430px]
          flex
          flex-col
          justify-center
        "
      >
        <div
          className="ori-label-line reveal-step mb-5"
          style={{ "--delay": "0.1s" }}
        >
          <p
            className="ori-type-system text-[9px]"
            style={{
              color: "var(--gold-soft)",
              textShadow: "0 0 14px rgba(242,185,104,0.10)",
            }}
          >
            Revelação Arquetípica
          </p>
        </div>

        <h1
          className="
            reveal-step
            ori-type-hero
            text-[42px]
            md:text-[54px]
            xl:text-[64px]
            font-semibold
            leading-[0.90]
            mb-4
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
            md:text-[25px]
            leading-[1.28]
            max-w-xl
            mb-5
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
          className="reveal-step grid sm:grid-cols-2 gap-2.5 mb-4 max-w-lg"
          style={{ "--delay": "0.68s" }}
        >
          <div
            className="ori-card-secondary px-3.5 py-3 rounded-[18px]"
            style={{
              background: "rgba(255,255,255,0.020)",
              border: "1px solid rgba(242,185,104,0.09)",
              color: "rgba(255,245,235,0.74)",
              boxShadow:
                "inset 0 0 14px rgba(242,185,104,0.014), 0 0 14px rgba(242,185,104,0.014)",
              backdropFilter: "blur(10px)",
              WebkitBackdropFilter: "blur(10px)",
            }}
          >
            <span
              className="ori-type-system block text-[8px] mb-1"
              style={{ color: "rgba(242,185,104,0.78)" }}
            >
              Arquétipo principal
            </span>

            <p className="text-[15px] md:text-base leading-snug">{principal}</p>
          </div>

          <div
            className="ori-card-secondary px-3.5 py-3 rounded-[18px]"
            style={{
              background: "rgba(255,255,255,0.020)",
              border: "1px solid rgba(242,185,104,0.09)",
              color: "rgba(255,245,235,0.74)",
              boxShadow:
                "inset 0 0 14px rgba(242,185,104,0.014), 0 0 14px rgba(242,185,104,0.014)",
              backdropFilter: "blur(10px)",
              WebkitBackdropFilter: "blur(10px)",
            }}
          >
            <span
              className="ori-type-system block text-[8px] mb-1"
              style={{ color: "rgba(242,185,104,0.78)" }}
            >
              Arquétipo secundário
            </span>

            <p className="text-[15px] md:text-base leading-snug">
              {secundario}
            </p>
          </div>

        </div>

        <div
          className="
            reveal-step
            ori-card-secondary
            inline-flex
            items-start
            gap-3
            px-4
            py-3
            rounded-[20px]
            max-w-xl
          "
          style={{
            background:
              "linear-gradient(90deg, rgba(242,185,104,0.045), rgba(255,255,255,0.012))",
            border: "1px solid rgba(242,185,104,0.09)",
            boxShadow:
              "inset 0 0 18px rgba(242,185,104,0.014), 0 0 20px rgba(242,185,104,0.018)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            "--delay": "0.88s",
          }}
        >
          <div
            className="w-1.5 h-1.5 rounded-full mt-2.5 shrink-0"
            style={{
              background: "var(--gold-primary)",
              boxShadow: "0 0 12px rgba(242,185,104,0.28)",
            }}
          />

          <p
            className="ori-type-reading-soft text-sm md:text-[15px]"
            style={{ color: "rgba(255,245,235,0.72)" }}
          >
            Esta é sua base arquetípica inicial: a força que sustenta sua
            presença antes de virar roupa, cor, beleza e assinatura visual.
          </p>
        </div>
      </div>
    </section>
  );
}

export default ResultHero;
