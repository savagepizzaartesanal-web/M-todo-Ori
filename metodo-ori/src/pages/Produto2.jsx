import { Link } from "react-router-dom";

function Produto2() {
  const dossieLayers = [
    {
      title: "O que será integrado",
      text: "Sua base arquetípica será cruzada com corpo, rosto, cor, cabelo, beleza, ancestralidade estética, presença e rotina.",
    },
    {
      title: "O que você recebe",
      text: "Uma direção visual coerente: modelagem, silhueta, paleta, cabelo, beleza, presença e primeiros critérios para cápsula.",
    },
    {
      title: "O que muda na prática",
      text: "A imagem deixa de ser tentativa solta e começa a funcionar como linguagem: menos ruído, mais eixo e mais reconhecimento.",
    },
  ];

  return (
    <div className="ori-atmosphere ori-atmosphere-dossie relative overflow-hidden max-w-[1320px]">
      <section
        className="ori-main-frame ori-hero-panel relative mb-4 flex min-h-[318px] items-center overflow-hidden rounded-[22px] p-3.5 pt-6 md:mb-5 md:min-h-[clamp(460px,calc(100vh-120px),580px)] md:rounded-[36px] md:p-7"
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
          src="/images/heroes/dossie-ori.png"
          alt="Dossiê ORI"
          loading="eager"
          decoding="async"
          className="
            absolute
            inset-0
            w-full
            h-full
            object-cover
            object-[76%_center]
            md:object-[82%_center]
            opacity-95
            pointer-events-none
            select-none
          "
        />

        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "linear-gradient(90deg, rgba(5,2,2,0.98) 0%, rgba(5,2,2,0.92) 31%, rgba(5,2,2,0.62) 50%, rgba(5,2,2,0.18) 73%, rgba(5,2,2,0.04) 100%)",
          }}
        />

        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(circle at 80% 34%, rgba(242,185,104,0.10), transparent 32%), radial-gradient(circle at 18% 85%, rgba(183,140,255,0.08), transparent 34%)",
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

        <div className="relative z-10 max-w-[540px]">
          <div className="inline-flex items-center gap-3 mb-3">
            <div
              className="w-7 h-px"
              style={{
                background:
                  "linear-gradient(90deg, var(--gold-primary), transparent)",
              }}
            />

            <p
              className="ori-type-system"
              style={{ color: "var(--gold-soft)" }}
            >
              Integração
            </p>
          </div>

          <h1
            className="ori-type-hero mb-2.5 text-[34px] md:mb-3 md:text-5xl xl:text-[50px]"
            style={{
              color: "var(--gold-primary)",
              fontWeight: 600,
              letterSpacing: "-0.075em",
              textShadow: "0 0 42px rgba(242,185,104,0.12)",
            }}
          >
            Dossiê ORI
          </h1>

          <p
            className="ori-type-reading mb-3 max-w-[500px] text-sm md:mb-4"
            style={{
              color: "var(--text-primary)",
              textShadow: "0 0 28px rgba(0,0,0,0.45)",
            }}
          >
            A segunda camada da sua jornada traduz essência em forma:
            <br />
            corpo, rosto, cor, cabelo, beleza,
            <br /> presença visual e rotina real.
          </p>

          <p
            className="ori-type-reading-soft hidden text-sm md:mb-4 md:block md:text-[15px] max-w-[520px]"
            style={{ color: "var(--text-soft)" }}
          >
            Depois que sua força é nomeada, o Dossiê ORI mostra como ela se
            materializa no visual. Aqui a leitura deixa de ser apenas simbólica
            e começa a virar direção estética concreta.
          </p>

          <div
            className="w-20 h-px mb-4"
            style={{
              background:
                "linear-gradient(to right, var(--gold-primary), transparent)",
            }}
          />

          <div
            className="ori-card-teaser relative mb-3 max-w-[520px] overflow-hidden rounded-[16px] p-3 md:mb-4 md:rounded-[20px] md:p-4"
            data-state="sealed"
            style={{
              background:
                "linear-gradient(90deg, rgba(242,185,104,0.075), rgba(255,255,255,0.016))",
              border: "1px solid rgba(242,185,104,0.14)",
              boxShadow:
                "inset 0 0 30px rgba(242,185,104,0.035), 0 0 42px rgba(242,185,104,0.03)",
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
            }}
          >
            <div
              className="absolute inset-0 pointer-events-none opacity-[0.03]"
              style={{
                backgroundImage:
                  "linear-gradient(rgba(242,185,104,0.22) 1px, transparent 1px), linear-gradient(90deg, rgba(242,185,104,0.10) 1px, transparent 1px)",
                backgroundSize: "42px 42px",
              }}
            />

            <div className="relative z-10 flex min-h-[82px] flex-col justify-center pr-8 md:min-h-[132px]">
              <div
                className="absolute right-0 top-0 text-lg leading-none"
                style={{
                  color: "rgba(242,185,104,0.58)",
                  textShadow: "0 0 18px rgba(242,185,104,0.10)",
                }}
                aria-hidden="true"
              >
                🔒
              </div>

              <h2
                className="ori-type-revelation mb-1.5 text-base md:mb-2 md:text-xl"
                style={{
                  color: "var(--gold-primary)",
                  fontWeight: 600,
                  letterSpacing: "-0.045em",
                }}
              >
                Produto 2 aguardando liberação
              </h2>

              <p
                className="ori-type-reading-soft max-w-[480px] text-xs md:text-sm"
                style={{ color: "var(--text-soft)" }}
              >
                <span className="md:hidden">
                  O Dossiê abre quando sua base arquetípica já foi nomeada.
                </span>
                <span className="hidden md:inline">
                  Esta etapa abre quando o Código das Deusas já nomeou sua base
                  arquetípica. O Dossiê não substitui a primeira leitura: ele
                  traduz essa força para imagem.
                </span>
              </p>
            </div>
          </div>

          <div className="hidden flex-wrap gap-2.5 mb-4 max-w-[540px] sm:flex">
            {[
              "Corpo e rosto",
              "Coloração",
              "Cabelo e beleza",
              "Presença visual",
              "Lei da coerência",
            ].map((item) => (
              <div
                key={item}
                className="ori-chip px-3.5 py-1.5 text-[11px]"
                data-state="soon"
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
            ))}
          </div>

          <Link
            to="/produto-1"
            className="ori-journey-action inline-flex justify-center px-5 py-2.5 rounded-full text-sm font-medium"
            style={{
              background: "var(--gold-primary)",
              color: "#090506",
              boxShadow: "0 0 40px rgba(242,185,104,0.14)",
            }}
          >
            Voltar ao Código das Deusas
          </Link>
        </div>
      </section>

      <section
        className="ori-main-frame ori-card-secondary relative overflow-hidden rounded-[18px] p-3 md:rounded-[30px] md:p-5"
        style={{
          background:
            "linear-gradient(180deg, rgba(18,9,10,0.70), rgba(5,2,2,0.90))",
          border: "1px solid rgba(242,185,104,0.10)",
          boxShadow:
            "inset 0 0 34px rgba(255,255,255,0.010), 0 0 44px rgba(242,185,104,0.024)",
          backdropFilter: "blur(14px)",
          WebkitBackdropFilter: "blur(14px)",
        }}
      >
        <div className="ori-label-line mb-3 md:mb-4">
          <p
            className="ori-type-system text-[9px] md:text-[10px]"
            style={{ color: "var(--gold-soft)" }}
          >
            Preview do Dossiê
          </p>
        </div>

        <div className="grid gap-3 lg:grid-cols-[1.1fr_0.9fr]">
          <article
            className="ori-card-protagonist relative overflow-hidden rounded-[16px] p-3 md:rounded-[20px] md:p-5"
            style={{
              background:
                "linear-gradient(90deg, rgba(242,185,104,0.080), rgba(255,255,255,0.012))",
              border: "1px solid rgba(242,185,104,0.14)",
            }}
          >
            <p
              className="ori-type-system mb-2 md:mb-3"
              style={{ color: "var(--gold-soft)" }}
            >
              Próxima camada
            </p>

            <h2
              className="ori-type-revelation mb-2 text-lg md:mb-3 md:text-2xl"
              style={{
                color: "var(--gold-primary)",
                fontWeight: 620,
                letterSpacing: "-0.045em",
              }}
            >
              {dossieLayers[0].title}
            </h2>

            <p
              className="ori-mobile-preview-3 ori-type-reading-soft text-sm"
              style={{ color: "var(--text-soft)" }}
            >
              {dossieLayers[0].text}
            </p>
          </article>

          <div className="grid gap-2">
            {dossieLayers.slice(1).map((item) => (
          <article
            key={item.title}
                className="ori-card-teaser relative overflow-hidden rounded-[16px] p-3 md:rounded-[18px] md:p-3.5"
            style={{
              background:
                    "linear-gradient(180deg, rgba(255,255,255,0.024), rgba(255,255,255,0.008))",
                  border: "1px solid rgba(242,185,104,0.075)",
            }}
          >
            <p
                  className="ori-type-system mb-2"
              style={{ color: "var(--gold-soft)" }}
            >
                  Preview selado
            </p>

            <h2
                  className="ori-type-revelation text-base mb-2"
              style={{
                    color: "rgba(247,234,216,0.82)",
                fontWeight: 600,
                    letterSpacing: "-0.030em",
              }}
            >
              {item.title}
            </h2>

            <p
                  className="ori-type-reading-soft text-xs"
                  style={{ color: "rgba(247,234,216,0.54)" }}
            >
                  {item.text.split(":")[0]}
            </p>
          </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

export default Produto2;
