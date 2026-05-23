function QuizHero({
  onPrimaryAction,
  primaryActionLabel = "Começar minha leitura",
}) {
  return (
    <section
      className="ori-main-frame ori-hero-panel relative overflow-hidden rounded-[28px] md:rounded-[36px] p-5 md:p-6 xl:p-7 mb-5 cinematic-card min-h-[clamp(400px,calc(100vh-160px),500px)] flex items-center"
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
        src="/images/heroes/diagnostico-arquetipico.png"
        alt="Diagnóstico Arquetípico de Imagem"
        className="
          absolute
          inset-0
          w-full
          h-full
          object-cover
          object-[82%_center]
          opacity-90
          pointer-events-none
          select-none
        "
      />

      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(90deg, rgba(5,2,2,0.98) 0%, rgba(5,2,2,0.92) 30%, rgba(5,2,2,0.66) 48%, rgba(5,2,2,0.22) 72%, rgba(5,2,2,0.06) 100%)",
        }}
      />

      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(circle at 78% 44%, rgba(242,185,104,0.10), transparent 34%), radial-gradient(circle at 18% 85%, rgba(183,140,255,0.08), transparent 34%)",
        }}
      />

      <div
        className="absolute inset-0 pointer-events-none opacity-[0.035]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(242,185,104,0.22) 1px, transparent 1px), linear-gradient(90deg, rgba(242,185,104,0.10) 1px, transparent 1px)",
          backgroundSize: "72px 72px",
        }}
      />

      <div
        className="absolute inset-0 pointer-events-none opacity-[0.04]"
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
        className="absolute right-[58px] top-[46px] hidden xl:block w-[220px] h-[220px] rounded-full pointer-events-none opacity-[0.12]"
        style={{
          border: "1px solid rgba(242,185,104,0.18)",
          boxShadow:
            "inset 0 0 45px rgba(242,185,104,0.05), 0 0 60px rgba(242,185,104,0.04)",
        }}
      />

      <div className="relative z-10 max-w-[610px]">
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
            Nomeação
          </p>
        </div>

        <h1
          className="ori-type-hero text-4xl md:text-5xl xl:text-[48px] mb-3 max-w-[560px]"
          style={{
            color: "var(--gold-primary)",
            fontWeight: 600,
            letterSpacing: "-0.07em",
            textShadow: "0 0 42px rgba(242,185,104,0.12)",
          }}
        >
          Diagnóstico
          <br />
          Arquetípico
          <br />
          <span
            className="text-[0.72em]"
            style={{
              color: "rgba(242,185,104,0.88)",
              letterSpacing: "-0.055em",
            }}
          >
            de Imagem
          </span>
        </h1>

        <p
          className="ori-type-reading text-base md:text-[17px] max-w-[560px] mb-4"
          style={{
            color: "var(--text-primary)",
          }}
        >
          Sua imagem não começa na aparência.
          <br />
          Ela começa nos padrões que moldam sua presença.
        </p>

        <div
          className="w-20 h-px mb-4"
          style={{
            background:
              "linear-gradient(to right, var(--gold-primary), transparent)",
          }}
        />

        <div
          className="relative max-w-[570px] mb-4 rounded-[20px]"
          style={{
            background:
              "linear-gradient(90deg, rgba(5,2,2,0.34), rgba(255,255,255,0.012))",
            border: "1px solid rgba(242,185,104,0.075)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
          }}
        >
          <div
            className="max-h-[104px] overflow-y-auto px-4 py-3 pr-5"
            style={{
              scrollbarWidth: "thin",
              scrollbarColor: "rgba(242,185,104,0.22) transparent",
            }}
          >
            <p
              className="ori-type-reading-soft text-sm mb-3"
              style={{
                color: "var(--text-soft)",
              }}
            >
              Nesta primeira etapa, o ORI identifica sua composição arquetípica
              inicial: a força principal, a força secundária e o arquétipo
              composto que organiza sua forma de desejar, se proteger, se
              posicionar e ser percebida.
            </p>

            <p
              className="ori-type-reading-soft text-sm"
              style={{
                color: "rgba(255,245,235,0.68)",
              }}
            >
              Não é uma dica de estilo pronta. É a etapa que nomeia a estrutura
              simbólica por trás da sua imagem, para que as próximas camadas
              possam traduzir essa força em corpo, cor, cabelo, beleza e
              presença visual.
            </p>
          </div>

          <div
            className="absolute inset-x-0 bottom-0 h-8 pointer-events-none rounded-b-[22px]"
            style={{
              background:
                "linear-gradient(180deg, transparent, rgba(5,2,2,0.38))",
            }}
          />
        </div>

        <div className="flex flex-wrap gap-2.5 mb-5">
          {[
            "Nomeação",
            "Composição arquetípica",
            "Sombra",
            "Primeiros códigos",
          ].map((item) => (
            <div
              key={item}
              className="ori-chip px-3 py-1.5 text-[10px]"
              data-state="revealed"
              style={{
                background: "rgba(255,255,255,0.025)",
                border: "1px solid rgba(242,185,104,0.10)",
                color: "rgba(255,245,235,0.66)",
                backdropFilter: "blur(10px)",
              }}
            >
              {item}
            </div>
          ))}
        </div>

        {onPrimaryAction && (
          <button
            type="button"
            onClick={onPrimaryAction}
            className="ori-journey-action px-7 py-3 rounded-full text-sm md:text-[15px]"
            style={{
              background: "var(--gold-primary)",
              color: "#090506",
              fontWeight: 700,
              boxShadow:
                "0 0 42px rgba(242,185,104,0.18), inset 0 0 16px rgba(255,255,255,0.18)",
            }}
          >
            {primaryActionLabel}
          </button>
        )}
      </div>
    </section>
  );
}

export default QuizHero;
