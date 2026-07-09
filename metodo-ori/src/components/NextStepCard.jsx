import { Link } from "react-router-dom";

import { FEATURES } from "../config/features";
import { JOURNEY_COPY, JOURNEY_LABELS } from "../content/journeyCopy";

function NextStepCard() {
  return (
    <section
      className="
        relative
        overflow-hidden
        rounded-[24px]
        md:rounded-[42px]
        p-4
        md:p-8
        xl:p-10
        mt-6
        mb-5
        md:mt-10
        md:mb-8
        ori-main-frame
        cinematic-card
        ori-hero-panel
        fade-up
        min-h-[330px]
        md:min-h-[390px]
        flex
        items-center
      "
      style={{
        background:
          "linear-gradient(135deg, rgba(18,9,10,0.88), rgba(5,2,2,0.96))",
        border: "1px solid rgba(242,185,104,0.14)",
        boxShadow:
          "0 0 90px rgba(242,185,104,0.055), inset 0 0 80px rgba(255,255,255,0.018)",
        backdropFilter: "blur(18px)",
        WebkitBackdropFilter: "blur(18px)",
      }}
    >
      <img
        src="/images/heroes/dossie-ori-cta.png"
        alt="Dossiê ORI"
        className="
          absolute
          inset-0
          w-full
          h-full
          object-cover
          object-[78%_center]
          opacity-95
          pointer-events-none
          select-none
        "
      />

      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(90deg, rgba(5,2,2,0.98) 0%, rgba(5,2,2,0.93) 31%, rgba(5,2,2,0.62) 52%, rgba(5,2,2,0.22) 74%, rgba(5,2,2,0.04) 100%)",
        }}
      />

      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(circle at 82% 34%, rgba(242,185,104,0.12), transparent 33%), radial-gradient(circle at 18% 85%, rgba(183,140,255,0.08), transparent 34%)",
        }}
      />

      <div
        className="absolute inset-0 pointer-events-none opacity-[0.028]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(242,185,104,0.22) 1px, transparent 1px), linear-gradient(90deg, rgba(242,185,104,0.10) 1px, transparent 1px)",
          backgroundSize: "72px 72px",
        }}
      />

      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 18px 18px, rgba(242,185,104,0.45) 1px, transparent 1px)",
          backgroundSize: "42px 42px",
        }}
      />

      <div
        className="absolute top-0 left-0 w-full h-px pointer-events-none"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(242,185,104,0.55), transparent)",
        }}
      />

      <div
        className="absolute bottom-0 left-0 w-full h-px pointer-events-none"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(242,185,104,0.18), transparent)",
        }}
      />

      <div
        className="absolute left-0 top-0 h-full w-px pointer-events-none"
        style={{
          background:
            "linear-gradient(180deg, transparent, rgba(242,185,104,0.20), transparent)",
        }}
      />

      <div className="relative z-10 max-w-[590px]">
        <div className="inline-flex items-center gap-4 mb-4">
          <div
            className="w-8 h-px"
            style={{
              background:
                "linear-gradient(90deg, var(--gold-primary), transparent)",
            }}
          />

          <p
            className="ori-type-system text-[10px] md:text-xs"
            style={{ color: "var(--gold-soft)" }}
          >
            {JOURNEY_LABELS.proximoPasso}
          </p>
        </div>

        <h2
          className="ori-type-hero text-4xl md:text-5xl xl:text-[56px] mb-3"
          style={{
            color: "var(--gold-primary)",
            fontWeight: 600,
            letterSpacing: "-0.075em",
            textShadow: "0 0 42px rgba(242,185,104,0.12)",
          }}
        >
          Dossiê ORI
        </h2>

        <p
          className="ori-type-revelation text-xl md:text-2xl mb-5"
          style={{
            color: "var(--text-primary)",
            fontWeight: 400,
            letterSpacing: "-0.035em",
            textShadow: "0 0 28px rgba(0,0,0,0.45)",
          }}
        >
          Sua leitura ganhando forma visual
        </p>

        <p
          className="ori-type-reading-soft text-sm md:text-base max-w-[540px] mb-6"
          style={{
            color: "var(--text-soft)",
            textShadow: "0 0 28px rgba(0,0,0,0.45)",
          }}
        >
          {JOURNEY_COPY.dossieOri.nextBodyCompact}
        </p>

        <div className="flex flex-wrap gap-3 mb-7 max-w-[540px]">
          {["Corpo e rosto", "Coloração", "Cabelo e beleza", "Presença"].map(
            (item) => (
              <div
                key={item}
                className="ori-chip px-4 py-2 text-xs"
                data-state="next"
                style={{
                  background: "rgba(255,255,255,0.028)",
                  border: "1px solid rgba(242,185,104,0.11)",
                  color: "rgba(255,245,235,0.70)",
                  backdropFilter: "blur(10px)",
                  WebkitBackdropFilter: "blur(10px)",
                }}
              >
                {item}
              </div>
            ),
          )}
        </div>

        <div className="flex flex-col md:flex-row md:items-center gap-4">
          {FEATURES.produto2 ? (
            <Link
              to="/produto-2"
              className="
              ori-journey-action
              inline-flex
              justify-center
              px-6
              py-3.5
              rounded-full
              text-sm
              font-medium
              transition-all
              duration-500
              hover:translate-x-1
              w-full
              md:w-fit
            "
              style={{
                background: "var(--gold-primary)",
                color: "#090506",
                boxShadow:
                  "0 0 42px rgba(242,185,104,0.16), inset 0 0 18px rgba(255,255,255,0.18)",
              }}
            >
              Continuar para o Dossiê ORI
            </Link>
          ) : (
            <button
              type="button"
              disabled
              className="
                inline-flex
                w-full
                cursor-not-allowed
                justify-center
                rounded-full
                px-6
                py-3.5
                text-sm
                font-medium
                opacity-70
                md:w-fit
              "
              style={{
                background: "rgba(255,255,255,0.035)",
                border: "1px solid rgba(242,185,104,0.12)",
                color: "rgba(255,245,235,0.58)",
              }}
            >
              Dossiê em preparação
            </button>
          )}

          <p
            className="ori-type-reading-soft text-xs md:text-sm max-w-[340px]"
            style={{ color: "rgba(255,245,235,0.58)" }}
          >
            Quando essa etapa estiver liberada, você poderá continuar por aqui.
          </p>
        </div>
      </div>
    </section>
  );
}

export default NextStepCard;
