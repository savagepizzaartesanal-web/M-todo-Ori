import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";

import { OriBadge, OriButton, OriCard } from "../components/ui";
import { FEATURES } from "../config/features";
import { JOURNEY_LABELS } from "../content/journeyCopy";

const productPhases = [
  {
    number: "01",
    title: "Código das Deusas",
    subtitle: "Leitura Arquetípica da Imagem",
    keyPhrase: "Entenda a força que organiza sua imagem por dentro.",
    pain: "Essa etapa começa quando nenhum estilo pronto parece dar conta de você. Você testa referências, muda detalhes, tenta se reconhecer, mas algo ainda parece personagem.",
    whatIs:
      "Aqui o ORI identifica sua base simbólica: como você deseja, se protege, se expressa e ocupa espaço. Antes da roupa, existe uma força organizando sua imagem.",
    value:
      "Você deixa de tentar se encaixar em estilos prontos e começa a reconhecer a força que organiza sua imagem por dentro.",
    cta: "Iniciar Código das Deusas",
    href: "/produto-1",
    delivers: [
      "Arquétipo dominante, auxiliar e composto",
      "Leitura da sua dinâmica feminina",
      "Sombra, desejo e mecanismo de presença",
      "Como sua energia tende a ser percebida",
      "Base simbólica da sua identidade visual",
    ],
  },
  {
    number: "02",
    title: "Dossiê ORI",
    subtitle: "Guia de Imagem Integrada",
    keyPhrase:
      "Veja como sua leitura aparece no corpo, nas cores, no cabelo e na beleza.",
    pain: "Essa etapa abre quando você até entende partes de si, mas elas não conversam. Corpo, cor, cabelo, presença e estética parecem fragmentos soltos, e a imagem ainda não parece inteira.",
    whatIs:
      "Aqui o Método ORI cruza psique, corpo, cor, cabelo, ancestralidade, presença e rotina para transformar informação solta em coerência visual.",
    value:
      "Sua imagem deixa de parecer fragmentada e começa a ganhar forma visível, coerente e inteira.",
    cta: FEATURES.produto2 ? "Conhecer o Dossiê ORI" : "Dossiê ORI em preparação",
    href: FEATURES.produto2 ? "/produto-2" : "/portal",
    delivers: [
      "Base identitária integrada",
      "Leitura corporal / Kibbe",
      "Direção cromática",
      "Cabelo, beleza e presença visual",
      "Pontos de coerência e ruído na imagem",
    ],
  },
  {
    number: "03",
    title: "Código Final",
    subtitle: "Imagem e Essência Aplicadas",
    keyPhrase:
      "Leve sua imagem para escolhas reais no dia a dia.",
    pain: "Essa etapa chega quando você já tem clareza, mas o armário real ainda não acompanha. Você compra, improvisa, mistura versões antigas e continua sentindo desgaste para se vestir.",
    whatIs:
      "Aqui a identidade revelada vira direção de vida visual: cápsula, compras, repetição estética, combinações, lacunas e assinatura pessoal.",
    value:
      "Você para de improvisar imagem e começa a sustentar presença com escolhas reais.",
    cta: "Ver aplicação final",
    href: "/produto-3",
    delivers: [
      "Filosofia da cápsula",
      "Peças-base por categoria",
      "Paleta da cápsula e regra de ouro",
      "Fórmula da imagem aplicada",
      "Direção de compra e repetição consciente",
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
    eyebrow: "Jornada ORI",
    summary: "Imagem como expressão da essência, não superfície isolada.",
  },
  {
    id: "camadas",
    number: "03",
    title: "Como a jornada acontece",
    eyebrow: "Entender · Dar forma · Aplicar",
    summary: "A jornada respeita uma ordem clara e prática.",
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
    summary: "Cada etapa prepara o próximo passo da sua imagem.",
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
      className="relative z-20 p-2.5 md:p-4"
      style={{
        borderBottom: "1px solid rgba(242,185,104,0.075)",
      }}
    >
      <div className="relative z-10">
        <div className="mb-2.5 md:mb-4 flex items-center justify-between gap-4">
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
                aria-label={`Abrir etapa ${layer.number}: ${layer.title}`}
                className="ori-tab flex h-[38px] w-[118px] shrink-0 items-center rounded-[14px] px-2 py-1.5 text-left transition-all hover:-translate-y-0.5 md:h-[46px] md:w-[196px] md:px-3.5 md:py-2"
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
                  opacity: active ? 1 : 0.78,
                }}
              >
                <div className="flex items-center gap-2 md:gap-2.5">
                  <span
                    className="flex h-5 w-5 items-center justify-center rounded-[8px] text-[8px] md:h-7 md:w-7 md:rounded-[10px] md:text-[10px]"
                    style={{
                      background: active
                        ? "var(--gold-primary)"
                        : "rgba(242,185,104,0.055)",
                      color: active ? "#090506" : "rgba(242,185,104,0.82)",
                      fontWeight: 750,
                    }}
                  >
                    {layer.number}
                  </span>

                  <span
                    className="text-[10px] leading-tight md:text-[13px]"
                    style={{
                      color: active
                        ? "var(--text-primary)"
                        : "rgba(255,245,235,0.68)",
                      fontWeight: active ? 700 : 620,
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
      className="relative z-10 p-3.5 md:p-6 min-h-[auto] md:min-h-[440px]"
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
    <OriCard
      variant="secondary"
      padding="none"
      radius="lg"
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
            <OriBadge
              tone="gold"
              size="sm"
              className="inline-flex h-7 w-7 items-center justify-center rounded-full text-[10px]"
              style={{
                background: "rgba(242,185,104,0.10)",
                border: "1px solid rgba(242,185,104,0.14)",
                color: "var(--gold-primary)",
                fontWeight: 760,
              }}
            >
              {phase.number}
            </OriBadge>

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

        <OriButton
          as={Link}
          to={phase.href}
          variant="secondary"
          className="px-5 py-2.5 text-sm"
          style={{
            background: "rgba(242,185,104,0.09)",
            border: "1px solid rgba(242,185,104,0.15)",
            color: "var(--gold-primary)",
            fontWeight: 650,
          }}
        >
          {phase.cta}
        </OriButton>
      </div>

      <p
        className="text-base md:text-lg leading-relaxed mb-4"
        style={{ color: "var(--text-primary)" }}
      >
        {phase.keyPhrase}
      </p>

      <div className="grid md:grid-cols-2 gap-3 mb-4">
        <InfoPane title="Quando essa etapa faz sentido" text={phase.pain} />
        <InfoPane title="O que você entende aqui" text={phase.whatIs} />
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
            <OriBadge
              key={item}
              tone="muted"
              size="sm"
              className="flex min-h-9 items-center rounded-[14px] px-3 py-2 text-[11px] leading-snug"
              style={{
                background:
                  "linear-gradient(180deg, rgba(255,255,255,0.026), rgba(255,255,255,0.010))",
                border: "1px solid rgba(255,255,255,0.055)",
                color: "rgba(255,245,235,0.64)",
              }}
            >
              {item}
            </OriBadge>
          ))}
          {phase.delivers.length > 4 && (
            <OriBadge
              tone="gold"
              size="sm"
              className="flex min-h-9 items-center rounded-[14px] px-3 py-2 text-[11px] leading-snug"
              style={{
                background:
                  "linear-gradient(90deg, rgba(242,185,104,0.050), rgba(255,255,255,0.010))",
                border: "1px solid rgba(242,185,104,0.08)",
                color: "rgba(242,185,104,0.76)",
              }}
            >
              + {phase.delivers.length - 4} entregas guardadas para a etapa
            </OriBadge>
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
    </OriCard>
  );
}

function InfoPane({ title, text }) {
  return (
    <OriCard
      variant="secondary"
      padding="none"
      radius="md"
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
    </OriCard>
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
            O ORI começa quando mais uma compra já não resolve. A partir daí, a
            pergunta deixa de ser "o que eu compro?" e passa a ser "o que
            precisa fazer sentido em mim?"
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
          Mais do que estética: um jeito de entender sua imagem por dentro.
        </p>

        <p
          className="ori-type-reading-soft text-sm md:text-base max-w-3xl mb-6"
          style={{ color: "rgba(255,245,235,0.68)" }}
        >
          O Método ORI não olha para a imagem como superfície. Ele cruza
          símbolo, corpo, cor, cabelo, beleza e rotina para construir uma
          direção visual que faça sentido para você.
        </p>

        <div className="flex flex-wrap gap-3 mb-7">
          {integrations.map((item) => (
            <OriBadge
              key={item}
              tone="muted"
              size="sm"
              className="ori-chip px-3 py-1.5 text-[11px]"
              data-state="revealed"
              style={{
                background: "rgba(255,255,255,0.022)",
                border: "1px solid rgba(255,255,255,0.055)",
                color: "rgba(255,245,235,0.62)",
              }}
            >
              {item}
            </OriBadge>
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
            No ORI, imagem não é improviso. É escolha visual com raiz, direção e
            prática.
          </p>
        </div>
      </SectionShell>
    );
  }

  if (layer.id === "camadas") {
    const steps = [
      {
        number: "01",
        title: "Entender a base",
        text: "Primeiro o método nomeia a força que organiza sua imagem por dentro.",
      },
      {
        number: "02",
        title: "Dar forma",
        text: "Depois essa força ganha corpo, cor, cabelo, beleza e direção estética.",
      },
      {
        number: "03",
        title: "Aplicar na vida real",
        text: "Por fim, a leitura entra no guarda-roupa real e sustenta escolhas concretas.",
      },
    ];

    return (
      <SectionShell layer={layer}>
        <p
          className="ori-type-reading text-lg md:text-xl max-w-3xl mb-7"
          style={{ color: "var(--text-primary)" }}
        >
          Sua imagem não se organiza de uma vez. Primeiro você entende a base,
          depois dá forma, depois aplica.
        </p>

        <div className="grid md:grid-cols-3 gap-3">
          {steps.map((step) => (
            <OriCard
              variant="secondary"
              padding="none"
              radius="md"
              key={step.number}
              className="ori-card-secondary relative overflow-hidden rounded-[20px] p-4 min-h-[180px]"
              style={{
                background:
                  "linear-gradient(180deg, rgba(255,255,255,0.032), rgba(255,255,255,0.010))",
                border: "1px solid rgba(242,185,104,0.095)",
              }}
            >
              <OriBadge
                tone="gold"
                size="md"
                className="h-8 w-8 rounded-full flex items-center justify-center mb-4 text-[11px]"
                style={{
                  background: "rgba(242,185,104,0.10)",
                  border: "1px solid rgba(242,185,104,0.16)",
                  color: "var(--gold-primary)",
                  fontWeight: 760,
                }}
              >
                {step.number}
              </OriBadge>

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
            </OriCard>
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
          <div className="grid gap-1.5 sm:grid-cols-3 md:gap-2">
            {productPhases.map((phase, index) => {
              const active = activeProduct === index;

              return (
                <button
                  key={phase.number}
                  type="button"
                  onClick={() => setActiveProduct(index)}
                  aria-pressed={active}
                  aria-label={`Ver produto ${phase.number}: ${phase.title}`}
                  className="ori-tab rounded-[14px] px-2.5 py-2 text-left transition-all hover:-translate-y-0.5 md:rounded-[18px] md:px-3.5 md:py-3"
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
                        fontWeight: 760,
                      }}
                    >
                      {phase.number}
                    </span>

                    <span className="min-w-0">
                      <span
                        className="ori-type-system block text-sm leading-tight normal-case"
                        style={{
                          color: active
                            ? "var(--gold-primary)"
                            : "rgba(255,245,235,0.78)",
                          fontWeight: 680,
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
            <OriCard
              variant="secondary"
              padding="none"
              radius="md"
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
            </OriCard>
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
              Porque a dificuldade não está só na roupa.
            </h3>
            <p
              className="ori-type-reading-soft text-sm md:text-base"
              style={{ color: "rgba(255,245,235,0.68)" }}
            >
              Às vezes o problema não é falta de peça. É falta de direção.
              Antes de montar looks, você precisa entender sua força, ver como
              ela aparece na imagem e aprender a repetir isso na rotina.
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
                <OriBadge
                  key={item}
                  tone="muted"
                  size="sm"
                  className="ori-chip px-3 py-1.5 text-[11px]"
                  data-state="sealed"
                  style={{
                    background: "rgba(255,255,255,0.022)",
                    border: "1px solid rgba(255,255,255,0.055)",
                    color: "rgba(255,245,235,0.62)",
                  }}
                >
                  {item}
                </OriBadge>
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
        Cada etapa prepara a próxima. Seu portal mostra onde você está agora e
        qual passo ajuda sua imagem a ficar mais clara, mais inteira e mais
        prática.
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
            ["Dossiê ORI", JOURNEY_LABELS.proximoPasso, "Imagem e essência"],
            ["Código Final", "Ainda não iniciado", "Guarda-roupa real"],
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
          Sua imagem não começa no armário. Começa no que precisa ficar claro em
          você.
        </h3>
        <p
          className="text-sm md:text-base leading-relaxed max-w-3xl"
          style={{ color: "rgba(255,245,235,0.70)" }}
        >
          Antes da roupa, existe direção. Antes da cápsula, existe uma força que
          precisa ser reconhecida. O Método ORI organiza esse caminho com
          profundidade, clareza e aplicação real.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <OriButton
          as={Link}
          to="/portal"
          variant="gradient"
          className="justify-center px-7 py-3.5 text-sm"
          style={{
            fontWeight: 750,
            boxShadow:
              "0 0 38px rgba(210,135,70,0.16), inset 0 0 16px rgba(255,255,255,0.16)",
          }}
        >
          Ir para minha etapa atual
        </OriButton>

        <OriButton
          as={Link}
          to="/portal"
          variant="secondary"
          className="justify-center px-7 py-3.5 text-sm"
          style={{
            background: "rgba(255,255,255,0.026)",
            border: "1px solid rgba(242,185,104,0.12)",
            color: "rgba(255,245,235,0.72)",
          }}
        >
          Voltar ao portal
        </OriButton>
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
    ? "Continue pelos passos antes de avançar na página."
    : activeLayer < layers.length - 1
      ? "Avance quando esta etapa fizer sentido."
      : "A travessia conceitual está completa.";
  const nextButtonLabel = hasNextProductStep
    ? JOURNEY_LABELS.proximoPasso
    : JOURNEY_LABELS.proximoPasso;
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
        className="ori-main-frame ori-hero-panel relative overflow-hidden rounded-[24px] md:rounded-[40px] p-4 pt-7 md:p-8 mb-5 min-h-[350px] md:min-h-[460px] flex items-center cinematic-card"
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
            className="ori-type-hero text-[36px] md:text-6xl xl:text-[68px] mb-3 md:mb-5"
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
            className="ori-type-reading text-[15px] md:text-xl max-w-3xl mb-4 md:mb-5"
            style={{ color: "var(--text-primary)" }}
          >
            Uma jornada para entender a força que organiza sua imagem, dar forma
            a essa força no visual e levar tudo para a vida real.
          </p>

          <p
            className="ori-type-reading-soft hidden text-sm md:mb-6 md:block md:text-base max-w-2xl"
            style={{ color: "rgba(255,245,235,0.68)" }}
          >
            O ORI não começa pela roupa. Primeiro, você entende o que sustenta
            sua imagem por dentro. Depois, isso aparece no corpo, nas cores, no
            cabelo e na beleza. Por fim, vira escolha real no armário e na
            rotina.
          </p>

          <div className="flex flex-col gap-2.5 sm:flex-row sm:gap-3">
            <OriButton
              type="button"
              onClick={() => selectLayer(0)}
              variant="gradient"
              className="justify-center px-6 py-3 text-sm md:px-7 md:py-3.5"
              style={{
                fontWeight: 750,
                boxShadow:
                  "0 0 38px rgba(210,135,70,0.16), inset 0 0 16px rgba(255,255,255,0.16)",
              }}
            >
              Entender a jornada
            </OriButton>

            <OriButton
              as={Link}
              to="/portal"
              variant="secondary"
              className="justify-center px-5 py-2.5 text-xs md:px-7 md:py-3.5 md:text-sm"
              style={{
                background: "rgba(255,255,255,0.026)",
                border: "1px solid rgba(242,185,104,0.12)",
                color: "rgba(255,245,235,0.72)",
              }}
            >
              Ver minha etapa atual
            </OriButton>
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
            className="mt-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 rounded-[18px] px-3 py-2.5 md:rounded-[20px] md:px-3.5 md:py-3"
            style={{
              background:
                "linear-gradient(90deg, rgba(255,255,255,0.020), rgba(255,255,255,0.010))",
              border: "1px solid rgba(242,185,104,0.075)",
            }}
          >
            <p
              className="ori-type-reading-soft text-xs md:text-[13px]"
              style={{ color: "rgba(255,245,235,0.54)" }}
            >
              {footerText}
            </p>

            <div className="flex gap-2.5">
              {activeLayer > 0 && (
              <OriButton
                type="button"
                variant="secondary"
                onClick={goBack}
                aria-label="Voltar para a etapa anterior"
                className="px-4 py-2.5 text-xs md:text-sm"
                  style={{
                    background: "rgba(255,255,255,0.026)",
                    border: "1px solid rgba(242,185,104,0.10)",
                    color: "rgba(255,245,235,0.68)",
                  }}
                >
                  Etapa anterior
                </OriButton>
              )}

              {activeLayer < layers.length - 1 ? (
                <OriButton
                  type="button"
                  onClick={goNext}
                  aria-label={`Avançar para ${nextButtonLabel}`}
                  variant="gradient"
                  className="px-5 py-2.5 text-xs md:text-sm"
                  style={{
                    fontWeight: 750,
                    boxShadow:
                      "0 0 26px rgba(210,135,70,0.13), inset 0 0 12px rgba(255,255,255,0.14)",
                  }}
                >
                  {nextButtonLabel}
                </OriButton>
              ) : (
                <OriButton
                  as={Link}
                  to="/portal"
                  variant="gradient"
                  className="justify-center px-5 py-2.5 text-xs md:text-sm"
                  style={{
                    fontWeight: 750,
                    boxShadow:
                      "0 0 26px rgba(210,135,70,0.13), inset 0 0 12px rgba(255,255,255,0.14)",
                  }}
                >
                  Continuar minha jornada
                </OriButton>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MetodoOri;
