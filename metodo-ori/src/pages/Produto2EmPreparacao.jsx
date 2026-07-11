import { Link } from "react-router-dom";

import { OriButton, OriCard } from "../components/ui";

function Produto2EmPreparacao() {
  return (
    <div className="ori-atmosphere ori-atmosphere-dossie relative max-w-[1320px] overflow-hidden">
      <section
        className="ori-main-frame ori-hero-panel cinematic-card relative mb-5 flex min-h-[360px] items-center overflow-hidden rounded-[24px] p-4 pt-7 md:min-h-[clamp(460px,calc(100vh-120px),580px)] md:rounded-[36px] md:p-7"
        style={{
          background:
            "linear-gradient(135deg, rgba(18,9,10,0.88), rgba(5,2,2,0.96))",
          border: "1px solid rgba(242,185,104,0.14)",
          boxShadow:
            "0 0 90px rgba(242,185,104,0.055), inset 0 0 80px rgba(255,255,255,0.018)",
        }}
      >
        <img
          src="/images/heroes/dossie-ori.png"
          alt="Dossiê ORI"
          loading="eager"
          decoding="async"
          className="pointer-events-none absolute inset-0 h-full w-full select-none object-cover object-[76%_center] opacity-95 md:object-[82%_center]"
        />

        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "linear-gradient(90deg, rgba(5,2,2,0.98) 0%, rgba(5,2,2,0.92) 31%, rgba(5,2,2,0.62) 50%, rgba(5,2,2,0.18) 73%, rgba(5,2,2,0.04) 100%)",
          }}
        />

        <div className="relative z-10 max-w-[610px]">
          <div className="mb-3 inline-flex items-center gap-3">
            <div
              className="h-px w-7"
              style={{
                background:
                  "linear-gradient(90deg, var(--gold-primary), transparent)",
              }}
            />
            <p className="ori-type-system" style={{ color: "var(--gold-soft)" }}>
              Próxima camada
            </p>
          </div>

          <h1
            className="ori-type-hero mb-3 text-[38px] md:text-5xl xl:text-[50px]"
            style={{
              color: "var(--gold-primary)",
              fontWeight: 600,
              letterSpacing: "-0.075em",
            }}
          >
            Dossiê ORI
          </h1>

          <p
            className="ori-type-reading mb-4 max-w-[530px] text-sm"
            style={{ color: "var(--text-primary)" }}
          >
            Depois da primeira leitura, o ORI observa como sua essência aparece
            na imagem real: corpo, rosto, cor, cabelo, beleza, presença e rotina.
          </p>

          <div
            className="relative mb-4 max-w-[560px] overflow-hidden rounded-[20px] p-4 md:p-5"
            style={{
              background:
                "linear-gradient(90deg, rgba(242,185,104,0.075), rgba(255,255,255,0.016))",
              border: "1px solid rgba(242,185,104,0.14)",
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
            }}
          >
            <p
              className="ori-type-system mb-2 text-[9px]"
              style={{ color: "rgba(183,140,255,0.78)" }}
            >
              Em preparação
            </p>
            <h2
              className="ori-type-revelation mb-2 text-lg md:text-xl"
              style={{
                color: "var(--gold-primary)",
                fontWeight: 600,
                letterSpacing: "-0.045em",
              }}
            >
              Sua próxima etapa está sendo preparada.
            </h2>
            <p
              className="ori-type-reading-soft max-w-[510px] text-sm"
              style={{ color: "var(--text-soft)" }}
            >
              Esta camada será liberada quando estiver pronta para a sua jornada.
              Enquanto isso, sua primeira leitura segue como base viva do caminho.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <OriButton
              as={Link}
              to="/portal"
              variant="primary"
              className="px-5 py-2.5 text-sm"
              style={{
                background: "var(--gold-primary)",
                color: "#120706",
              }}
            >
              Voltar ao portal
            </OriButton>

            <OriButton
              as={Link}
              to="/produto-1/relatorio"
              variant="secondary"
              className="px-5 py-2.5 text-sm"
              style={{
                background: "rgba(255,255,255,0.018)",
                border: "1px solid rgba(242,185,104,0.14)",
                color: "var(--text-soft)",
              }}
            >
              Rever primeira leitura
            </OriButton>
          </div>
        </div>
      </section>

      <section
        className="ori-main-frame relative overflow-hidden rounded-[24px] p-5 md:rounded-[30px] md:p-7"
        style={{
          background:
            "linear-gradient(135deg, rgba(18,9,10,0.72), rgba(5,2,2,0.92))",
          border: "1px solid rgba(242,185,104,0.10)",
        }}
      >
        <div className="grid gap-4 md:grid-cols-3">
          {[
            ["Corpo e linhas", "A forma como sua presença ocupa espaço."],
            ["Cor e beleza", "A temperatura, o contraste e a força visual."],
            ["Cabelo e rotina", "A moldura real da sua expressão diária."],
          ].map(([title, text]) => (
            <OriCard
              variant="secondary"
              padding="none"
              radius="md"
              key={title}
              className="rounded-[18px] p-4"
              style={{
                background: "rgba(255,255,255,0.018)",
                border: "1px solid rgba(242,185,104,0.08)",
              }}
            >
              <p
                className="ori-type-system mb-2 text-[9px]"
                style={{ color: "var(--gold-soft)" }}
              >
                Dossiê ORI
              </p>
              <h3
                className="ori-type-revelation mb-2 text-base"
                style={{ color: "var(--gold-primary)", fontWeight: 600 }}
              >
                {title}
              </h3>
              <p
                className="ori-type-reading-soft text-sm"
                style={{ color: "var(--text-soft)" }}
              >
                {text}
              </p>
            </OriCard>
          ))}
        </div>
      </section>
    </div>
  );
}

export default Produto2EmPreparacao;
