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
    <div className="relative overflow-hidden max-w-[1320px]">
      <section
        className="relative overflow-hidden rounded-[30px] md:rounded-[38px] p-6 md:p-7 xl:p-8 mb-6 cinematic-card min-h-[clamp(500px,calc(100vh-96px),620px)] flex items-center"
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
          className="
            absolute
            inset-0
            w-full
            h-full
            object-cover
            object-[82%_center]
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
              className="uppercase tracking-[0.46em] text-[9px] md:text-[10px]"
              style={{ color: "var(--gold-soft)" }}
            >
              Produto 2 · Integração
            </p>
          </div>

          <h1
            className="text-4xl md:text-5xl xl:text-[50px] leading-[0.94] mb-3"
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
            className="text-sm leading-relaxed max-w-[500px] mb-4"
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
            className="text-sm md:text-[15px] leading-relaxed max-w-[520px] mb-4"
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
            className="relative overflow-hidden rounded-[22px] p-4 max-w-[520px] mb-4"
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

            <div className="relative z-10">
              <p
                className="uppercase tracking-[0.32em] text-[8px] mb-2"
                style={{ color: "var(--gold-soft)" }}
              >
                Camada ainda selada
              </p>

              <h2
                className="text-lg md:text-xl leading-tight mb-2"
                style={{
                  color: "var(--gold-primary)",
                  fontWeight: 600,
                  letterSpacing: "-0.045em",
                }}
              >
                Produto 2 aguardando liberação
              </h2>

              <p
                className="text-sm leading-relaxed max-w-[480px]"
                style={{ color: "var(--text-soft)" }}
              >
                Esta etapa abre quando o Código das Deusas já nomeou sua base
                arquetípica. O Dossiê não substitui a primeira leitura: ele
                traduz essa força para imagem.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2.5 mb-4 max-w-[540px]">
            {[
              "Corpo e rosto",
              "Coloração",
              "Cabelo e beleza",
              "Presença visual",
              "Lei da coerência",
            ].map((item) => (
              <div
                key={item}
                className="px-3.5 py-1.5 rounded-full text-[11px]"
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
            className="inline-flex justify-center px-5 py-2.5 rounded-full text-sm font-medium transition-all hover:translate-x-1"
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

      <section className="grid md:grid-cols-3 gap-4">
        {dossieLayers.map((item) => (
          <article
            key={item.title}
            className="relative overflow-hidden rounded-[24px] p-5"
            style={{
              background:
                "linear-gradient(180deg, rgba(18,9,10,0.72), rgba(5,2,2,0.90))",
              border: "1px solid rgba(242,185,104,0.11)",
              boxShadow:
                "inset 0 0 34px rgba(255,255,255,0.012), 0 0 44px rgba(242,185,104,0.028)",
              backdropFilter: "blur(14px)",
              WebkitBackdropFilter: "blur(14px)",
            }}
          >
            <p
              className="uppercase tracking-[0.28em] text-[8px] mb-3"
              style={{ color: "var(--gold-soft)" }}
            >
              Dossiê ORI
            </p>

            <h2
              className="text-xl leading-tight mb-3"
              style={{
                color: "var(--gold-primary)",
                fontWeight: 600,
                letterSpacing: "-0.045em",
              }}
            >
              {item.title}
            </h2>

            <p
              className="text-sm leading-relaxed"
              style={{ color: "var(--text-soft)" }}
            >
              {item.text}
            </p>
          </article>
        ))}
      </section>
    </div>
  );
}

export default Produto2;
