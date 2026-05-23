import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";

const productPhases = [
  {
    number: "01",
    title: "Código das Deusas",
    subtitle: "Leitura Arquetípica da Imagem",
    keyPhrase: "A etapa que revela a força simbólica que estrutura sua imagem.",
    pain: "Essa camada começa quando você sente uma força interna, mas ainda não sabe qual energia sustenta sua presença, por que certas escolhas funcionam e por que outras quebram sua imagem.",
    whatIs:
      "Aqui o método revela a base simbólica da sua presença antes de falar de armário real, compras ou cápsula. Você começa a entender o que organiza sua imagem por dentro.",
    value:
      "Você deixa de montar imagem por tentativa e começa a reconhecer a força simbólica que organiza sua presença.",
    cta: "Iniciar Código das Deusas",
    href: "/produto-1",
    delivers: [
      "Arquétipo dominante, auxiliar e composto",
      "Leitura arquetípica profunda",
      "Dinâmica psíquica, sombra e padrão relacional",
      "Como você tende a ser percebida",
      "Caminhos de individuação",
      "Essência de imagem e manual estético inicial",
      "Paleta, modelagem, tecidos, beleza e presença simbólica",
      "O que quebra o arquétipo e fórmula da imagem",
    ],
  },
  {
    number: "02",
    title: "Dossiê ORI",
    subtitle: "Guia da Imagem e Essência",
    keyPhrase:
      "A etapa que transforma identidade em linguagem visual coerente.",
    pain: "Essa camada abre quando você começa a entender sua força, mas ainda não sabe como ela aparece no corpo, na cor, no cabelo, na beleza e na presença.",
    whatIs:
      "É a etapa de integração identitária da imagem. Aqui o método cruza a base arquetípica com corpo, rosto, coloração, cabelo, ancestralidade, presença visual e rotina.",
    value:
      "Sua identidade começa a ganhar forma visível. O que antes parecia fragmentado passa a ter direção estética.",
    cta: "Conhecer próxima camada",
    href: "/produto-2",
    delivers: [
      "Manifesto da imagem como sistema",
      "Base identitária integrada",
      "Arquitetura psicológica",
      "Leitura corporal / Kibbe",
      "Coloração sazonal e cartela Patton quando aplicável",
      "Ancestralidade estética quando aplicável",
      "Modelagem, tecidos, beleza e cabelo",
      "Mapa e checklist da cápsula ORI",
    ],
  },
  {
    number: "03",
    title: "Código Final",
    subtitle: "Imagem e Essência Aplicadas",
    keyPhrase:
      "A etapa que aplica sua identidade ao guarda-roupa que sustenta sua vida.",
    pain: "Essa camada chega quando você já entende sua essência e sua direção estética, mas ainda sente que o armário real não sustenta sua rotina, suas escolhas e a mulher que você está construindo.",
    whatIs:
      "Aqui o método entra no acervo, na cápsula, nas combinações, nas lacunas e nas prioridades concretas. A identidade deixa de ser conceito e passa a sustentar escolhas reais.",
    value:
      "Sua identidade começa a caber na sua vida, no seu armário e nas suas decisões de compra.",
    cta: "Ver aplicação final",
    href: "/produto-3",
    delivers: [
      "Filosofia e manual de utilização da cápsula",
      "Peças-base e quantidade ideal por categoria",
      "Paleta da cápsula e regra de ouro",
      "Fórmula da imagem aplicada",
      "O que sustenta e o que gera ruído",
      "Estrutura final da cápsula",
      "Fórmulas de looks",
      "Lacunas reais, estratégia de compra e prioridades",
    ],
  },
];

const layers = [
  {
    id: "dor",
    number: "01",
    title: "Quando vestir parece esforço",
    eyebrow: "Antes da clareza",
    summary: "Situações reais que fazem a imagem parecer desalinhada.",
  },
  {
    id: "metodo",
    number: "02",
    title: "O Método",
    eyebrow: "Sistema ORI",
    summary: "Imagem como expressão da essência, não superfície isolada.",
  },
  {
    id: "camadas",
    number: "03",
    title: "As Camadas",
    eyebrow: "Revelar · Traduzir · Aplicar",
    summary: "A jornada respeita uma ordem simbólica e prática.",
  },
  {
    id: "produtos",
    number: "04",
    title: "As Etapas",
    eyebrow: "Três portas, uma travessia",
    summary: "Cada produto responde a uma pergunta diferente da jornada.",
  },
  {
    id: "clareza",
    number: "05",
    title: "Clareza",
    eyebrow: "O que o ORI faz e não faz",
    summary: "O método parte da presença, não da tendência.",
  },
  {
    id: "jornada",
    number: "06",
    title: "Sua Jornada",
    eyebrow: "Posição no portal",
    summary: "Cada etapa abre a próxima camada da leitura.",
  },
];

const fadeLayer = {
  hidden: { opacity: 0, y: 18, filter: "blur(8px)" },
  visible: { opacity: 1, y: 0, filter: "blur(0px)" },
  exit: { opacity: 0, y: -14, filter: "blur(8px)" },
};

function ProgressRail({ activeLayer, onSelect }) {
  return (
    <aside
      className="relative z-20 p-2 md:p-4"
      style={{
        borderBottom: "1px solid rgba(242,185,104,0.075)",
      }}
    >
      <div className="relative z-10">
        <div className="mb-2 flex items-center justify-between gap-4 md:mb-4">
          <div className="ori-label-line">
            <p
              className="ori-type-system"
              style={{ color: "var(--gold-soft)" }}
            >
              A Jornada ORI
            </p>
          </div>

          <p
            className="text-[10px]"
            style={{ color: "rgba(255,245,235,0.44)" }}
          >
            {activeLayer + 1}/{layers.length}
          </p>
        </div>

        <div className="ori-premium-scroll flex gap-1.5 overflow-x-auto pb-1 md:gap-2 md:pb-2">
          {layers.map((layer, index) => {
            const active = activeLayer === index;

            return (
              <button
                key={layer.id}
                type="button"
                onClick={() => onSelect(index)}
                aria-current={active ? "step" : undefined}
                aria-label={`Abrir camada ${layer.number}: ${layer.title}`}
                className="ori-tab flex h-[34px] w-[94px] shrink-0 items-center rounded-[12px] px-1.5 py-1 text-left transition-all hover:-translate-y-0.5 md:h-[46px] md:w-[196px] md:rounded-[14px] md:px-3.5 md:py-2"
                style={{
                  background: active
                    ? "linear-gradient(90deg, rgba(242,185,104,0.145), rgba(210,135,70,0.055))"
                    : "rgba(255,255,255,0.014)",
                  border: active
                    ? "1px solid rgba(242,185,104,0.28)"
                    : "1px solid rgba(255,255,255,0.045)",
                  boxShadow: active
                    ? "0 0 28px rgba(242,185,104,0.065), inset 0 0 18px rgba(242,185,104,0.018)"
                    : "inset 0 0 10px rgba(255,255,255,0.005)",
                  opacity: active ? 1 : 0.58,
                }}
              >
                <div className="flex items-center gap-1.5 md:gap-2.5">
                  <span
                    className="flex h-5 w-5 items-center justify-center rounded-[8px] text-[8px] md:h-7 md:w-7 md:rounded-[10px] md:text-[10px]"
                    style={{
                      background: active
                        ? "var(--gold-primary)"
                        : "rgba(242,185,104,0.055)",
                      color: active ? "#090506" : "rgba(242,185,104,0.82)",
                      fontWeight: 650,
                    }}
                  >
                    {layer.number}
                  </span>

                  <span
                    className="text-[9px] leading-tight md:text-[13px]"
                    style={{
                      color: active
                        ? "var(--text-primary)"
                        : "rgba(255,245,235,0.68)",
                      fontWeight: active ? 620 : 440,
                    }}
                  >
                    {layer.id === "dor" ? (
                      <>
                        <span className="md:hidden">Vestir</span>
                        <span className="hidden md:inline">Quando vestir</span>
                        <br />
                        <span className="md:hidden">esforço</span>
                        <span className="hidden md:inline">parece esforço</span>
                      </>
                    ) : (
                      layer.title
                    )}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

      </div>
    </aside>
  );
}
function SectionShell({ layer, children }) {
  return (
    <motion.section
      key={layer.id}
      variants={fadeLayer}
      initial="hidden"
      animate="visible"
      exit="exit"
      transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
      className="relative z-10 min-h-[auto] p-3 md:min-h-[440px] md:p-6"
      style={{
        background: "transparent",
      }}
    >
      <div className="relative z-10">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-4 mb-4 md:mb-5">
          <div>
            <h2
              className="ori-type-revelation text-[26px] md:text-[38px]"
              style={{
                color: "var(--gold-primary)",
                fontWeight: 620,
                letterSpacing: "-0.052em",
              }}
            >
              {layer.title}
            </h2>
          </div>

          <div
            className="hidden h-12 w-12 rounded-[18px] md:flex items-center justify-center"
            style={{
              background: "rgba(255,255,255,0.026)",
              border: "1px solid rgba(242,185,104,0.14)",
              color: "var(--gold-primary)",
              fontWeight: 760,
            }}
          >
            {layer.number}
          </div>
        </div>

        {children}
      </div>
    </motion.section>
  );
}

function ProductPhaseCard({ phase }) {
  return (
    <div
      className="ori-card-secondary rounded-[24px] p-4 md:p-5"
      style={{
        background:
          "linear-gradient(180deg, rgba(255,255,255,0.032), rgba(255,255,255,0.010))",
        border: "1px solid rgba(242,185,104,0.11)",
        boxShadow: "inset 0 0 32px rgba(255,255,255,0.010)",
      }}
    >
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span
              className="inline-flex h-7 w-7 items-center justify-center rounded-full text-[10px]"
              style={{
                background: "rgba(242,185,104,0.10)",
                border: "1px solid rgba(242,185,104,0.14)",
                color: "var(--gold-primary)",
                fontWeight: 760,
              }}
            >
              {phase.number}
            </span>

            <p
              className="ori-type-system"
              style={{ color: "var(--gold-soft)" }}
            >
              Etapa ativa
            </p>
          </div>

          <h3
            className="ori-type-revelation text-2xl md:text-[34px] mb-1.5"
            style={{
              color: "var(--gold-primary)",
              fontWeight: 640,
              letterSpacing: "-0.050em",
            }}
          >
            {phase.title}
          </h3>

          <p className="text-sm" style={{ color: "rgba(255,245,235,0.66)" }}>
            {phase.subtitle}
          </p>
        </div>

        <Link
          to={phase.href}
          className="ori-button-secondary inline-flex justify-center px-5 py-2.5 text-sm"
          style={{
            background: "rgba(242,185,104,0.09)",
            border: "1px solid rgba(242,185,104,0.15)",
            color: "var(--gold-primary)",
            fontWeight: 650,
          }}
        >
          {phase.cta}
        </Link>
      </div>

      <p
        className="text-base md:text-lg leading-relaxed mb-4"
        style={{ color: "var(--text-primary)" }}
      >
        {phase.keyPhrase}
      </p>

      <div className="grid md:grid-cols-2 gap-3 mb-4">
        <InfoPane title="Quando essa camada abre" text={phase.pain} />
        <InfoPane title="O que começa a ficar claro" text={phase.whatIs} />
      </div>

      <div
        className="mb-4 rounded-[18px] p-3.5"
        style={{
          background:
            "linear-gradient(90deg, rgba(242,185,104,0.060), rgba(255,255,255,0.012))",
          border: "1px solid rgba(242,185,104,0.10)",
        }}
      >
        <p
          className="text-sm mb-2"
          style={{ color: "var(--gold-primary)", fontWeight: 700 }}
        >
          Entregas principais
        </p>

        <div className="grid gap-2 sm:grid-cols-2">
          {phase.delivers.slice(0, 4).map((item) => (
            <span
              key={item}
              className="flex min-h-9 items-center rounded-[14px] px-3 py-2 text-[11px] leading-snug"
              style={{
                background:
                  "linear-gradient(180deg, rgba(255,255,255,0.026), rgba(255,255,255,0.010))",
                border: "1px solid rgba(255,255,255,0.055)",
                color: "rgba(255,245,235,0.64)",
              }}
            >
              {item}
            </span>
          ))}
          {phase.delivers.length > 4 && (
            <span
              className="flex min-h-9 items-center rounded-[14px] px-3 py-2 text-[11px] leading-snug"
              style={{
                background:
                  "linear-gradient(90deg, rgba(242,185,104,0.050), rgba(255,255,255,0.010))",
                border: "1px solid rgba(242,185,104,0.08)",
                color: "rgba(242,185,104,0.76)",
              }}
            >
              + {phase.delivers.length - 4} entregas guardadas para a etapa
            </span>
          )}
        </div>
      </div>

      <div
        className="rounded-[18px] p-3.5"
        style={{
          background:
            "linear-gradient(90deg, rgba(242,185,104,0.075), rgba(255,255,255,0.012))",
          border: "1px solid rgba(242,185,104,0.10)",
        }}
      >
        <p className="text-xs mb-1.5" style={{ color: "var(--gold-soft)" }}>
          O que muda depois dessa etapa
        </p>
        <p
          className="text-sm md:text-base leading-relaxed"
          style={{ color: "var(--text-primary)" }}
        >
          {phase.value}
        </p>
      </div>
    </div>
  );
}

function InfoPane({ title, text }) {
  return (
    <div
      className="rounded-[18px] p-3.5"
      style={{
        background:
          "linear-gradient(180deg, rgba(255,255,255,0.026), rgba(255,255,255,0.008))",
        border: "1px solid rgba(242,185,104,0.075)",
      }}
    >
      <p
        className="ori-type-system mb-2"
        style={{ color: "var(--gold-soft)" }}
      >
        {title}
      </p>
      <p
        className="text-sm leading-relaxed"
        style={{ color: "rgba(255,245,235,0.70)" }}
      >
        {text}
      </p>
    </div>
  );
}

function MetodoOriLayer({ activeLayer, activeProduct, setActiveProduct }) {
  const layer = layers[activeLayer];

  if (layer.id === "dor") {
    const pains = [
      "Você compra peças novas, mas continua sentindo que não tem roupa.",
      "Seu armário está cheio, mas escolher um look simples vira uma negociação interna.",
      "Você gasta tempo se arrumando e, mesmo assim, sai com a sensação de que algo não fechou.",
      "Você salva referências lindas, mas quando tenta usar em você parece que não encaixa.",
      "Você muda cabelo, testa cor, compra roupa, mas a sensação de identidade continua instável.",
      "Você sente que existe uma mulher forte em você, mas sua imagem ainda não sustenta essa presença.",
    ];

    return (
      <SectionShell layer={layer}>
        <p
          className="ori-type-reading text-base md:text-lg max-w-3xl mb-4"
          style={{ color: "var(--text-primary)" }}
        >
          Talvez você chegue achando que precisa de mais roupa. Mas, por baixo
          da compra, existe uma sensação mais profunda: a imagem ainda não
          parece inteira.
        </p>

        <p
          className="ori-type-reading-soft text-sm max-w-3xl mb-5"
          style={{ color: "rgba(255,245,235,0.68)" }}
        >
          A dor aparece na frente do espelho, no armário lotado, na demora para
          se arrumar, na compra que prometia resolver tudo e não resolveu. É
          quando a imagem vira tentativa, não direção.
        </p>

        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-2.5 mb-5">
          {pains.map((pain) => (
            <div
              key={pain}
              className="rounded-[16px] p-3"
              style={{
                background:
                  "linear-gradient(180deg, rgba(255,255,255,0.026), rgba(255,255,255,0.008))",
                border: "1px solid rgba(242,185,104,0.075)",
              }}
            >
              <p
                className="ori-type-reading-soft text-[13px]"
                style={{ color: "var(--text-soft)" }}
              >
                “{pain}”
              </p>
            </div>
          ))}
        </div>

        <div
          className="rounded-[18px] px-4 py-3"
          style={{
            background:
              "linear-gradient(90deg, rgba(242,185,104,0.060), rgba(255,255,255,0.010))",
            border: "1px solid rgba(242,185,104,0.09)",
          }}
        >
          <p
            className="ori-type-reading text-sm md:text-base max-w-3xl"
            style={{ color: "var(--gold-primary)" }}
          >
            O ORI começa exatamente nesse ponto: quando a imagem já não pode ser
            resolvida só com mais uma compra, mais uma tendência ou mais uma
            tentativa.
          </p>
        </div>
      </SectionShell>
    );
  }

  if (layer.id === "metodo") {
    const integrations = [
      "arquétipo",
      "corpo",
      "coloração",
      "cabelo",
      "presença visual",
      "linguagem estética",
      "guarda-roupa real",
    ];

    return (
      <SectionShell layer={layer}>
        <p
          className="ori-type-reading text-lg md:text-xl max-w-3xl mb-6"
          style={{ color: "var(--text-primary)" }}
        >
          Mais do que estética. Um sistema de leitura identitária da imagem.
        </p>

        <p
          className="ori-type-reading-soft text-sm md:text-base max-w-3xl mb-6"
          style={{ color: "rgba(255,245,235,0.68)" }}
        >
          O Método ORI é um sistema autoral que não trabalha a imagem como
          superfície isolada. Ele trata a imagem como expressão da essência.
          Cada etapa revela uma camada diferente da sua identidade, e cada uma
          prepara o terreno da próxima.
        </p>

        <div className="flex flex-wrap gap-3 mb-7">
          {integrations.map((item) => (
            <span
              key={item}
              className="ori-chip px-3 py-1.5 text-[11px]"
              data-state="revealed"
              style={{
                background: "rgba(255,255,255,0.022)",
                border: "1px solid rgba(255,255,255,0.055)",
                color: "rgba(255,245,235,0.62)",
              }}
            >
              {item}
            </span>
          ))}
        </div>

        <div
          className="rounded-[20px] p-4 md:p-5"
          style={{
            background:
              "linear-gradient(90deg, rgba(242,185,104,0.070), rgba(255,255,255,0.012))",
            border: "1px solid rgba(242,185,104,0.11)",
          }}
        >
          <p
            className="ori-type-reading text-base md:text-lg"
            style={{ color: "var(--gold-primary)" }}
          >
            No ORI, imagem não é improviso. É tradução coerente daquilo que você
            é.
          </p>
        </div>
      </SectionShell>
    );
  }

  if (layer.id === "camadas") {
    const steps = [
      {
        number: "01",
        title: "Revelar",
        text: "Primeiro o método nomeia a força simbólica que sustenta a presença.",
      },
      {
        number: "02",
        title: "Traduzir",
        text: "Depois essa força ganha corpo, cor, cabelo, beleza e direção estética.",
      },
      {
        number: "03",
        title: "Aplicar",
        text: "Por fim, a leitura entra no guarda-roupa real e sustenta escolhas concretas.",
      },
    ];

    return (
      <SectionShell layer={layer}>
        <p
          className="ori-type-reading text-lg md:text-xl max-w-3xl mb-7"
          style={{ color: "var(--text-primary)" }}
        >
          A sua imagem não se resolve de uma vez. Ela se revela em camadas.
        </p>

        <div className="grid md:grid-cols-3 gap-3">
          {steps.map((step) => (
            <div
              key={step.number}
              className="ori-card-secondary relative overflow-hidden rounded-[20px] p-4 min-h-[180px]"
              style={{
                background:
                  "linear-gradient(180deg, rgba(255,255,255,0.032), rgba(255,255,255,0.010))",
                border: "1px solid rgba(242,185,104,0.095)",
              }}
            >
              <div
                className="h-8 w-8 rounded-full flex items-center justify-center mb-4 text-[11px]"
                style={{
                  background: "rgba(242,185,104,0.10)",
                  border: "1px solid rgba(242,185,104,0.16)",
                  color: "var(--gold-primary)",
                  fontWeight: 760,
                }}
              >
                {step.number}
              </div>

              <h3
                className="ori-type-revelation text-xl mb-3"
                style={{ color: "var(--gold-primary)", fontWeight: 650 }}
              >
                {step.title}
              </h3>

              <p
                className="ori-type-reading-soft text-sm"
                style={{ color: "rgba(255,245,235,0.66)" }}
              >
                {step.text}
              </p>
            </div>
          ))}
        </div>
      </SectionShell>
    );
  }

  if (layer.id === "produtos") {
    return (
      <SectionShell layer={layer}>
        <div
          className="mb-5 rounded-[22px] p-2 md:p-2.5"
          style={{
            background: "rgba(255,255,255,0.018)",
            border: "1px solid rgba(242,185,104,0.08)",
          }}
        >
          <div className="ori-premium-scroll flex gap-1.5 overflow-x-auto pb-1 sm:grid sm:grid-cols-3 sm:overflow-visible sm:pb-0 md:gap-2">
            {productPhases.map((phase, index) => {
              const active = activeProduct === index;

              return (
                <button
                  key={phase.number}
                  type="button"
                  onClick={() => setActiveProduct(index)}
                  aria-pressed={active}
                  aria-label={`Ver produto ${phase.number}: ${phase.title}`}
                  className="ori-tab min-w-[132px] shrink-0 rounded-[13px] px-2.5 py-2 text-left transition-all hover:-translate-y-0.5 sm:min-w-0 md:rounded-[18px] md:px-3.5 md:py-3"
                  data-state={active ? "active" : "sealed"}
                  style={{
                    background: active
                      ? "linear-gradient(90deg, rgba(242,185,104,0.11), rgba(255,255,255,0.022))"
                      : "transparent",
                    border: active
                      ? "1px solid rgba(242,185,104,0.22)"
                      : "1px solid rgba(255,255,255,0.045)",
                    boxShadow: active
                      ? "0 0 22px rgba(242,185,104,0.045), inset 0 0 16px rgba(242,185,104,0.014)"
                      : "none",
                  }}
                >
                  <div className="flex items-center gap-2.5 md:gap-3">
                    <span
                      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] md:h-8 md:w-8 md:text-[11px]"
                      style={{
                        background: active
                          ? "var(--gold-primary)"
                          : "rgba(255,255,255,0.026)",
                        color: active ? "#090506" : "var(--gold-primary)",
                        fontWeight: 650,
                      }}
                    >
                      {phase.number}
                    </span>

                    <span className="min-w-0">
                      <span
                        className="ori-type-system block text-xs leading-tight normal-case md:text-sm"
                        style={{
                          color: active
                            ? "var(--gold-primary)"
                            : "rgba(255,245,235,0.78)",
                          fontWeight: active ? 620 : 440,
                        }}
                      >
                        {phase.title}
                      </span>
                      <span
                        className="ori-type-reading-soft mt-1 hidden text-[11px] sm:block"
                        style={{ color: "rgba(255,245,235,0.50)" }}
                      >
                        {active ? "Etapa aberta" : phase.subtitle}
                      </span>
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={productPhases[activeProduct].number}
            variants={fadeLayer}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
          >
            <ProductPhaseCard phase={productPhases[activeProduct]} />
          </motion.div>
        </AnimatePresence>
      </SectionShell>
    );
  }

  if (layer.id === "clareza") {
    const questions = [
      [
        "Código das Deusas",
        "Quem sou eu em essência?",
        "Qual é a força simbólica que estrutura minha imagem?",
      ],
      [
        "Dossiê ORI",
        "Como essa força ganha forma?",
        "Como ela se traduz em corpo, cor, cabelo, presença e direção estética?",
      ],
      [
        "Código Final",
        "Como essa identidade sustenta minha vida real?",
        "Como ela entra no meu armário, nas minhas escolhas e na minha rotina?",
      ],
    ];
    const notDo = [
      "não corrige seu corpo",
      "não entrega estética genérica",
      "não separa identidade de imagem",
      "não mistura etapas com funções diferentes",
      "não cria personagem desconectada da sua essência",
    ];

    return (
      <SectionShell layer={layer}>
        <div className="grid lg:grid-cols-3 gap-3 mb-5">
          {questions.map(([product, question, answer]) => (
            <div
              key={product}
              className="ori-card-secondary rounded-[18px] p-4"
              style={{
                background:
                  "linear-gradient(180deg, rgba(255,255,255,0.026), rgba(255,255,255,0.008))",
                border: "1px solid rgba(242,185,104,0.075)",
              }}
            >
              <p
                className="ori-type-system text-[11px] mb-2"
                style={{ color: "var(--gold-soft)" }}
              >
                {product}
              </p>
              <h3
                className="ori-type-revelation text-base md:text-lg mb-3"
                style={{ color: "var(--gold-primary)", fontWeight: 650 }}
              >
                {question}
              </h3>
              <p
                className="ori-type-reading-soft text-sm"
                style={{ color: "rgba(255,245,235,0.66)" }}
              >
                {answer}
              </p>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-[1fr_0.9fr] gap-4">
          <div
            className="rounded-[20px] p-4 md:p-5"
            style={{
              background:
                "linear-gradient(180deg, rgba(255,255,255,0.026), rgba(255,255,255,0.008))",
              border: "1px solid rgba(242,185,104,0.085)",
            }}
          >
            <h3
              className="ori-type-revelation text-xl md:text-2xl mb-3"
              style={{ color: "var(--gold-primary)", fontWeight: 650 }}
            >
              Porque a sua dor também aparece em camadas.
            </h3>
            <p
              className="ori-type-reading-soft text-sm md:text-base"
              style={{ color: "rgba(255,245,235,0.68)" }}
            >
              Você não sofre apenas porque não sabe se vestir. Antes disso, pode
              não conseguir nomear a própria força, traduzir essa força em
              imagem ou aplicar essa imagem ao cotidiano. O Método ORI respeita
              essa ordem: primeiro revela, depois traduz, por fim aplica.
            </p>
          </div>

          <div
            className="rounded-[20px] p-4 md:p-5"
            style={{
              background:
                "linear-gradient(180deg, rgba(255,255,255,0.026), rgba(255,255,255,0.008))",
              border: "1px solid rgba(242,185,104,0.085)",
            }}
          >
            <h3
              className="ori-type-revelation text-xl md:text-2xl mb-3"
              style={{ color: "var(--gold-primary)", fontWeight: 650 }}
            >
              O ORI não parte da tendência.
            </h3>
            <div className="flex flex-wrap gap-2">
              {notDo.map((item) => (
                <span
                  key={item}
                  className="ori-chip px-3 py-1.5 text-[11px]"
                  data-state="sealed"
                  style={{
                    background: "rgba(255,255,255,0.022)",
                    border: "1px solid rgba(255,255,255,0.055)",
                    color: "rgba(255,245,235,0.62)",
                  }}
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      </SectionShell>
    );
  }

  return (
    <SectionShell layer={layer}>
      <p
        className="ori-type-reading text-lg md:text-xl max-w-3xl mb-6"
        style={{ color: "var(--text-primary)" }}
      >
        Cada etapa abre a próxima. Seu portal mostra não apenas onde você está,
        mas o que sua próxima camada está pronta para revelar.
      </p>

      <div
        className="mb-5 rounded-[22px] p-2 md:p-2.5"
        style={{
          background: "rgba(255,255,255,0.018)",
          border: "1px solid rgba(242,185,104,0.08)",
        }}
      >
        <div className="grid gap-2 md:grid-cols-3">
          {[
            ["Código das Deusas", "Concluído", "Primeira leitura"],
            ["Dossiê ORI", "Próxima camada", "Imagem e essência"],
            ["Código Final", "Ainda selado", "Guarda-roupa real"],
          ].map(([product, status, title], index) => {
            const active = index === 0;

            return (
              <div
                key={product}
                className="rounded-[18px] px-3.5 py-3"
                style={{
                  background: active
                    ? "linear-gradient(90deg, rgba(242,185,104,0.11), rgba(255,255,255,0.022))"
                    : "transparent",
                  border: active
                    ? "1px solid rgba(242,185,104,0.22)"
                    : "1px solid rgba(255,255,255,0.045)",
                  boxShadow: active
                    ? "0 0 22px rgba(242,185,104,0.045), inset 0 0 16px rgba(242,185,104,0.014)"
                    : "none",
                }}
              >
                <div className="flex items-center gap-3">
                  <span
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px]"
                    style={{
                      background: active
                        ? "var(--gold-primary)"
                        : "rgba(255,255,255,0.026)",
                      color: active ? "#090506" : "var(--gold-primary)",
                      fontWeight: 760,
                    }}
                  >
                    0{index + 1}
                  </span>

                  <span className="min-w-0">
                    <span
                      className="block text-sm leading-tight"
                      style={{
                        color: active
                          ? "var(--gold-primary)"
                          : "rgba(255,245,235,0.78)",
                        fontWeight: 680,
                      }}
                    >
                      {product}
                    </span>
                    <span
                      className="mt-1 block text-[11px] leading-relaxed"
                      style={{ color: "rgba(255,245,235,0.50)" }}
                    >
                      {status} · {title}
                    </span>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div
        className="rounded-[22px] p-4 md:p-5 mb-5"
        style={{
          background:
            "linear-gradient(90deg, rgba(242,185,104,0.070), rgba(255,255,255,0.012))",
          border: "1px solid rgba(242,185,104,0.11)",
        }}
      >
        <h3
          className="text-2xl md:text-[34px] leading-[1.02] mb-3"
          style={{
            color: "var(--gold-primary)",
            fontWeight: 640,
            letterSpacing: "-0.050em",
          }}
        >
          Sua imagem não começa no armário. Começa na leitura.
        </h3>
        <p
          className="text-sm md:text-base leading-relaxed max-w-3xl"
          style={{ color: "rgba(255,245,235,0.70)" }}
        >
          Antes da roupa, existe presença. Antes da presença, existe uma
          estrutura. Antes da cápsula, existe uma força que precisa ser
          reconhecida. O Método ORI foi criado para conduzir essa travessia com
          profundidade, clareza e coerência.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <Link
          to="/portal"
          className="ori-journey-action inline-flex justify-center px-7 py-3.5 rounded-full text-sm"
          style={{
            background:
              "linear-gradient(90deg, var(--copper-primary), var(--gold-primary))",
            color: "#090506",
            fontWeight: 750,
            boxShadow:
              "0 0 38px rgba(210,135,70,0.16), inset 0 0 16px rgba(255,255,255,0.16)",
          }}
        >
          Ir para minha etapa atual
        </Link>

        <Link
          to="/portal"
          className="inline-flex justify-center px-7 py-3.5 rounded-full text-sm"
          style={{
            background: "rgba(255,255,255,0.026)",
            border: "1px solid rgba(242,185,104,0.12)",
            color: "rgba(255,245,235,0.72)",
          }}
        >
          Voltar ao portal
        </Link>
      </div>
    </SectionShell>
  );
}

function MetodoOri() {
  const [activeLayer, setActiveLayer] = useState(0);
  const [activeProduct, setActiveProduct] = useState(0);
  const readingRef = useRef(null);
  const isProductLayer = layers[activeLayer]?.id === "produtos";
  const hasNextProductStep =
    isProductLayer && activeProduct < productPhases.length - 1;
  const footerText = hasNextProductStep
    ? "Continue pelas etapas antes de avançar para a próxima camada da página."
    : activeLayer < layers.length - 1
      ? "Avance quando esta camada fizer sentido."
      : "A travessia conceitual está completa.";
  const nextButtonLabel = hasNextProductStep
    ? "Próxima etapa"
    : "Próxima camada";
  const scrollToReading = () => {
    window.setTimeout(() => {
      readingRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 80);
  };

  const selectLayer = (index) => {
    setActiveLayer(index);
    scrollToReading();
  };

  const goNext = () => {
    if (hasNextProductStep) {
      setActiveProduct((current) =>
        Math.min(current + 1, productPhases.length - 1),
      );
      scrollToReading();
      return;
    }

    selectLayer(Math.min(activeLayer + 1, layers.length - 1));
  };

  const goBack = () => {
    selectLayer(Math.max(activeLayer - 1, 0));
  };

  return (
    <div className="ori-atmosphere ori-atmosphere-method relative overflow-hidden">
      <section
        className="ori-main-frame ori-hero-panel relative mb-4 flex min-h-[318px] items-center overflow-hidden rounded-[22px] p-3.5 pt-6 md:mb-5 md:min-h-[460px] md:rounded-[40px] md:p-8"
        style={{
          background:
            "linear-gradient(135deg, rgba(18,9,10,0.88), rgba(5,2,2,0.96))",
          border: "1px solid rgba(242,185,104,0.14)",
          boxShadow:
            "0 0 90px rgba(242,185,104,0.055), inset 0 0 80px rgba(255,255,255,0.018)",
        }}
      >
        <img
          src="/images/metodo-ori/hero-metodo-ori.png"
          alt=""
          loading="eager"
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover opacity-55"
        />

        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(90deg, rgba(5,2,2,0.96) 0%, rgba(5,2,2,0.84) 42%, rgba(5,2,2,0.36) 72%, rgba(5,2,2,0.12) 100%)",
          }}
        />

        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(circle at 78% 22%, rgba(242,185,104,0.12), transparent 34%), radial-gradient(circle at 16% 84%, rgba(183,140,255,0.08), transparent 36%)",
          }}
        />

        <div className="relative z-10 max-w-[760px]">
          <div className="ori-label-line mb-3 md:mb-5">
            <p
              className="ori-type-system"
              style={{ color: "var(--gold-soft)" }}
            >
              Método ORI by Telúrica
            </p>
          </div>

          <h1
            className="ori-type-hero mb-2.5 text-[33px] md:mb-5 md:text-6xl xl:text-[68px]"
            style={{
              color: "var(--gold-primary)",
              fontWeight: 640,
              letterSpacing: "-0.070em",
              textShadow: "0 0 56px rgba(242,185,104,0.16)",
            }}
          >
            Conheça o Método ORI
          </h1>

          <p
            className="ori-type-reading mb-3 max-w-3xl text-sm md:mb-5 md:text-xl"
            style={{ color: "var(--text-primary)" }}
          >
            Uma jornada em camadas para revelar a força que sustenta sua imagem,
            traduzir essa força em linguagem visual e aplicar tudo à sua vida
            real.
          </p>

          <p
            className="ori-type-reading-soft hidden text-sm md:mb-6 md:block md:text-base max-w-2xl"
            style={{ color: "rgba(255,245,235,0.68)" }}
          >
            O Método ORI não começa pela roupa. Primeiro, a força é nomeada.
            Depois, ela ganha corpo, cor, cabelo, beleza e direção estética. Por
            fim, essa identidade entra no guarda-roupa real.
          </p>

          <div className="flex flex-col gap-2.5 sm:flex-row sm:gap-3">
            <button
              type="button"
              onClick={() => selectLayer(0)}
              className="ori-journey-action inline-flex justify-center rounded-full px-6 py-2.5 text-sm md:px-7 md:py-3.5"
              style={{
                background:
                  "linear-gradient(90deg, var(--copper-primary), var(--gold-primary))",
                color: "#090506",
                fontWeight: 750,
                boxShadow:
                  "0 0 38px rgba(210,135,70,0.16), inset 0 0 16px rgba(255,255,255,0.16)",
              }}
            >
              Entender as camadas
            </button>

            <Link
              to="/portal"
              className="ori-button-secondary inline-flex justify-center px-5 py-2.5 text-xs md:px-7 md:py-3.5 md:text-sm"
              style={{
                background: "rgba(255,255,255,0.026)",
                border: "1px solid rgba(242,185,104,0.12)",
                color: "rgba(255,245,235,0.72)",
              }}
            >
              Ver minha etapa atual
            </Link>
          </div>
        </div>
      </section>

      <div
        className="ori-mobile-section relative overflow-hidden rounded-[22px] md:rounded-[34px]"
        style={{
          backgroundColor: "rgba(5,2,2,0.92)",
          backgroundImage:
            "radial-gradient(circle at 88% 12%, rgba(242,185,104,0.09), transparent 34%), radial-gradient(circle at 8% 92%, rgba(183,140,255,0.05), transparent 34%), linear-gradient(90deg, rgba(5,2,2,0.88), rgba(5,2,2,0.68), rgba(5,2,2,0.92)), url('/images/espelho-ori/oraculo/fundo-oraculo-premium.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          border: "1px solid rgba(242,185,104,0.13)",
          boxShadow:
            "0 0 70px rgba(242,185,104,0.04), inset 0 0 54px rgba(255,255,255,0.012)",
          backdropFilter: "blur(18px)",
          WebkitBackdropFilter: "blur(18px)",
        }}
      >
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.022]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(242,185,104,0.18) 1px, transparent 1px), linear-gradient(90deg, rgba(242,185,104,0.08) 1px, transparent 1px)",
            backgroundSize: "64px 64px",
          }}
        />

        <ProgressRail
          activeLayer={activeLayer}
          onSelect={selectLayer}
        />

        <div ref={readingRef} className="scroll-mt-5 md:scroll-mt-6">
          <AnimatePresence mode="wait">
            <MetodoOriLayer
              key={layers[activeLayer].id}
              activeLayer={activeLayer}
              activeProduct={activeProduct}
              setActiveProduct={setActiveProduct}
            />
          </AnimatePresence>

          <div
            className="mt-3 flex flex-col gap-2.5 rounded-[18px] px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between md:rounded-[20px] md:px-3.5 md:py-3"
            style={{
              background:
                "linear-gradient(90deg, rgba(255,255,255,0.020), rgba(255,255,255,0.010))",
              border: "1px solid rgba(242,185,104,0.075)",
            }}
          >
            <p
              className="ori-mobile-preview-3 ori-type-reading-soft text-xs md:text-[13px]"
              style={{ color: "rgba(255,245,235,0.54)" }}
            >
              {footerText}
            </p>

            <div className="flex gap-2.5">
              {activeLayer > 0 && (
              <button
                type="button"
                onClick={goBack}
                aria-label="Voltar para a camada anterior"
                className="flex-1 rounded-full px-4 py-2.5 text-xs sm:flex-none md:text-sm"
                  style={{
                    background: "rgba(255,255,255,0.026)",
                    border: "1px solid rgba(242,185,104,0.10)",
                    color: "rgba(255,245,235,0.68)",
                  }}
                >
                  Voltar
                </button>
              )}

              {activeLayer < layers.length - 1 ? (
                <button
                  type="button"
                  onClick={goNext}
                  aria-label={`Avançar para ${nextButtonLabel}`}
                  className="ori-journey-action flex-1 rounded-full px-5 py-2.5 text-xs sm:flex-none md:text-sm"
                  style={{
                    background:
                      "linear-gradient(90deg, var(--copper-primary), var(--gold-primary))",
                    color: "#090506",
                    fontWeight: 750,
                    boxShadow:
                      "0 0 26px rgba(210,135,70,0.13), inset 0 0 12px rgba(255,255,255,0.14)",
                  }}
                >
                  {nextButtonLabel}
                </button>
              ) : (
                <Link
                  to="/portal"
                  className="ori-journey-action inline-flex justify-center px-5 py-2.5 rounded-full text-xs md:text-sm"
                  style={{
                    background:
                      "linear-gradient(90deg, var(--copper-primary), var(--gold-primary))",
                    color: "#090506",
                    fontWeight: 750,
                    boxShadow:
                      "0 0 26px rgba(210,135,70,0.13), inset 0 0 12px rgba(255,255,255,0.14)",
                  }}
                >
                  Continuar minha jornada
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MetodoOri;
