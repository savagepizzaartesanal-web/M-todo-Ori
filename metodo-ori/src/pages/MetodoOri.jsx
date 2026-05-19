import { useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";

const productPhases = [
  {
    number: "01",
    title: "Código das Deusas",
    subtitle: "Leitura Arquetípica da Imagem",
    keyPhrase: "A etapa que revela a força simbólica que estrutura sua imagem.",
    pain:
      "Essa camada começa quando você sente uma força interna, mas ainda não sabe qual energia sustenta sua presença, por que certas escolhas funcionam e por que outras quebram sua imagem.",
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
    keyPhrase: "A etapa que transforma identidade em linguagem visual coerente.",
    pain:
      "Essa camada abre quando você começa a entender sua força, mas ainda não sabe como ela aparece no corpo, na cor, no cabelo, na beleza e na presença.",
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
    pain:
      "Essa camada chega quando você já entende sua essência e sua direção estética, mas ainda sente que o armário real não sustenta sua rotina, suas escolhas e a mulher que você está construindo.",
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

function ExpandBlock({ title, items, tone = "gold" }) {
  const [open, setOpen] = useState(false);
  const isSoft = tone === "soft";

  return (
    <div
      className="rounded-[20px] overflow-hidden"
      style={{
        background: "rgba(255,255,255,0.024)",
        border: isSoft
          ? "1px solid rgba(255,245,235,0.08)"
          : "1px solid rgba(242,185,104,0.12)",
      }}
    >
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left"
      >
        <span
          className="text-sm"
          style={{
            color: isSoft ? "rgba(255,245,235,0.72)" : "var(--gold-primary)",
            fontWeight: 650,
          }}
        >
          {title}
        </span>

        <span
          className="h-8 w-8 rounded-full flex items-center justify-center text-lg"
          style={{
            background: "rgba(255,255,255,0.026)",
            border: "1px solid rgba(242,185,104,0.10)",
            color: "var(--gold-primary)",
          }}
        >
          {open ? "−" : "+"}
        </span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 grid sm:grid-cols-2 gap-3">
              {items.map((item) => (
                <div
                  key={item}
                  className="rounded-2xl px-4 py-3 text-sm leading-relaxed"
                  style={{
                    background: "rgba(5,2,2,0.34)",
                    border: "1px solid rgba(255,255,255,0.055)",
                    color: "rgba(255,245,235,0.70)",
                  }}
                >
                  {item}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ProgressRail({ activeLayer, onSelect }) {
  return (
    <aside
      className="lg:sticky lg:top-6 rounded-[26px] p-4 h-fit"
      style={{
        background:
          "linear-gradient(180deg, rgba(18,9,10,0.68), rgba(5,2,2,0.84))",
        border: "1px solid rgba(242,185,104,0.10)",
        boxShadow: "inset 0 0 30px rgba(255,255,255,0.010)",
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
      }}
    >
      <p
        className="uppercase tracking-[0.32em] text-[9px] mb-4"
        style={{ color: "var(--gold-soft)" }}
      >
        Trilha do método
      </p>

      <div className="grid sm:grid-cols-2 lg:grid-cols-1 gap-2">
        {layers.map((layer, index) => {
          const active = activeLayer === index;

          return (
            <button
              key={layer.id}
              type="button"
              onClick={() => onSelect(index)}
              className="text-left rounded-[18px] p-3 transition-all hover:-translate-y-0.5"
              style={{
                background: active
                  ? "rgba(242,185,104,0.095)"
                  : "rgba(255,255,255,0.020)",
                border: active
                  ? "1px solid rgba(242,185,104,0.20)"
                  : "1px solid rgba(255,255,255,0.055)",
                boxShadow: active
                  ? "0 0 26px rgba(242,185,104,0.06), inset 0 0 16px rgba(242,185,104,0.014)"
                  : "inset 0 0 12px rgba(255,255,255,0.006)",
              }}
            >
              <div className="flex items-center gap-3 mb-2">
                <span
                  className="h-9 w-9 rounded-[13px] flex items-center justify-center text-xs"
                  style={{
                    background: active
                      ? "var(--gold-primary)"
                      : "rgba(255,255,255,0.026)",
                    color: active ? "#090506" : "var(--gold-primary)",
                    fontWeight: 750,
                  }}
                >
                  {layer.number}
                </span>

                <span
                  className="text-sm"
                  style={{
                    color: active
                      ? "var(--text-primary)"
                      : "rgba(255,245,235,0.72)",
                    fontWeight: 650,
                  }}
                >
                  {layer.title}
                </span>
              </div>

              <p
                className="text-xs leading-relaxed"
                style={{ color: "rgba(255,245,235,0.52)" }}
              >
                {layer.summary}
              </p>
            </button>
          );
        })}
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
      className="relative overflow-hidden rounded-[30px] md:rounded-[38px] p-5 md:p-7 min-h-[560px]"
      style={{
        background:
          "radial-gradient(circle at 88% 12%, rgba(242,185,104,0.10), transparent 34%), radial-gradient(circle at 8% 92%, rgba(183,140,255,0.07), transparent 34%), linear-gradient(135deg, rgba(18,9,10,0.76), rgba(5,2,2,0.92))",
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

      <div className="relative z-10">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-7">
          <div>
            <p
              className="uppercase tracking-[0.34em] text-[9px] md:text-[10px] mb-3"
              style={{ color: "var(--gold-soft)" }}
            >
              {layer.eyebrow}
            </p>
            <h2
              className="text-3xl md:text-5xl leading-[0.96]"
              style={{
                color: "var(--gold-primary)",
                fontWeight: 680,
                letterSpacing: "-0.065em",
              }}
            >
              {layer.title}
            </h2>
          </div>

          <div
            className="h-14 w-14 rounded-[20px] flex items-center justify-center"
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
      className="rounded-[26px] p-5 md:p-6"
      style={{
        background:
          "linear-gradient(180deg, rgba(255,255,255,0.032), rgba(255,255,255,0.010))",
        border: "1px solid rgba(242,185,104,0.11)",
        boxShadow: "inset 0 0 32px rgba(255,255,255,0.010)",
      }}
    >
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-5">
        <div>
          <p
            className="uppercase tracking-[0.30em] text-[9px] mb-3"
            style={{ color: "var(--gold-soft)" }}
          >
            Etapa {phase.number}
          </p>

          <h3
            className="text-2xl md:text-4xl leading-[0.98] mb-2"
            style={{
              color: "var(--gold-primary)",
              fontWeight: 680,
              letterSpacing: "-0.055em",
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
          className="inline-flex justify-center px-5 py-3 rounded-full text-sm"
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
        className="text-lg md:text-xl leading-relaxed mb-5"
        style={{ color: "var(--text-primary)" }}
      >
        {phase.keyPhrase}
      </p>

      <div className="grid md:grid-cols-2 gap-4 mb-5">
        <InfoPane title="Quando essa camada abre" text={phase.pain} />
        <InfoPane title="O que começa a ficar claro" text={phase.whatIs} />
      </div>

      <div className="mb-5">
        <ExpandBlock title="O que entrega" items={phase.delivers} />
      </div>

      <div
        className="rounded-[20px] p-4"
        style={{
          background:
            "linear-gradient(90deg, rgba(242,185,104,0.075), rgba(255,255,255,0.012))",
          border: "1px solid rgba(242,185,104,0.10)",
        }}
      >
        <p className="text-sm mb-2" style={{ color: "var(--gold-soft)" }}>
          O que muda depois dessa etapa
        </p>
        <p className="text-base leading-relaxed" style={{ color: "var(--text-primary)" }}>
          {phase.value}
        </p>
      </div>
    </div>
  );
}

function InfoPane({ title, text }) {
  return (
    <div
      className="rounded-[20px] p-4"
      style={{
        background: "rgba(5,2,2,0.34)",
        border: "1px solid rgba(255,255,255,0.055)",
      }}
    >
      <p
        className="uppercase tracking-[0.24em] text-[9px] mb-3"
        style={{ color: "var(--gold-soft)" }}
      >
        {title}
      </p>
      <p className="text-sm leading-relaxed" style={{ color: "rgba(255,245,235,0.70)" }}>
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
          className="text-xl md:text-2xl leading-relaxed max-w-3xl mb-5"
          style={{ color: "var(--text-primary)" }}
        >
          Talvez você chegue achando que precisa de mais roupa. Mas, por baixo
          da compra, existe uma sensação mais profunda: a imagem ainda não
          parece inteira.
        </p>

        <p
          className="text-sm md:text-base leading-relaxed max-w-3xl mb-6"
          style={{ color: "rgba(255,245,235,0.68)" }}
        >
          A dor aparece na frente do espelho, no armário lotado, na demora para
          se arrumar, na compra que prometia resolver tudo e não resolveu. É
          quando a imagem vira tentativa, não direção.
        </p>

        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-3 mb-6">
          {pains.map((pain) => (
            <div
              key={pain}
              className="rounded-[22px] p-5"
              style={{
                background: "rgba(255,255,255,0.026)",
                border: "1px solid rgba(242,185,104,0.09)",
              }}
            >
              <p className="text-sm md:text-base leading-relaxed" style={{ color: "var(--text-soft)" }}>
                “{pain}”
              </p>
            </div>
          ))}
        </div>

        <p className="text-base leading-relaxed max-w-3xl" style={{ color: "var(--gold-primary)" }}>
          O ORI começa exatamente nesse ponto: quando a imagem já não pode ser
          resolvida só com mais uma compra, mais uma tendência ou mais uma
          tentativa.
        </p>
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
          className="text-xl md:text-2xl leading-relaxed max-w-3xl mb-6"
          style={{ color: "var(--text-primary)" }}
        >
          Mais do que estética. Um sistema de leitura identitária da imagem.
        </p>

        <p
          className="text-sm md:text-base leading-relaxed max-w-3xl mb-6"
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
              className="px-4 py-2 rounded-full text-xs"
              style={{
                background: "rgba(255,255,255,0.026)",
                border: "1px solid rgba(242,185,104,0.10)",
                color: "rgba(255,245,235,0.72)",
              }}
            >
              {item}
            </span>
          ))}
        </div>

        <div
          className="rounded-[26px] p-5 md:p-6"
          style={{
            background:
              "linear-gradient(90deg, rgba(242,185,104,0.085), rgba(255,255,255,0.012))",
            border: "1px solid rgba(242,185,104,0.13)",
          }}
        >
          <p className="text-lg md:text-2xl leading-relaxed" style={{ color: "var(--gold-primary)" }}>
            No ORI, imagem não é improviso. É tradução coerente daquilo que
            você é.
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
          className="text-xl md:text-2xl leading-relaxed max-w-3xl mb-7"
          style={{ color: "var(--text-primary)" }}
        >
          A sua imagem não se resolve de uma vez. Ela se revela em camadas.
        </p>

        <div className="grid md:grid-cols-3 gap-4">
          {steps.map((step) => (
            <div
              key={step.number}
              className="relative overflow-hidden rounded-[26px] p-5 min-h-[240px]"
              style={{
                background:
                  "linear-gradient(180deg, rgba(255,255,255,0.032), rgba(255,255,255,0.010))",
                border: "1px solid rgba(242,185,104,0.11)",
              }}
            >
              <div
                className="h-14 w-14 rounded-[18px] flex items-center justify-center mb-7"
                style={{
                  background: "rgba(242,185,104,0.10)",
                  border: "1px solid rgba(242,185,104,0.16)",
                  color: "var(--gold-primary)",
                  fontWeight: 760,
                }}
              >
                {step.number}
              </div>

              <h3 className="text-2xl mb-4" style={{ color: "var(--gold-primary)", fontWeight: 680 }}>
                {step.title}
              </h3>

              <p className="text-sm leading-relaxed" style={{ color: "rgba(255,245,235,0.66)" }}>
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
        <div className="grid md:grid-cols-3 gap-3 mb-5">
          {productPhases.map((phase, index) => {
            const active = activeProduct === index;

            return (
              <button
                key={phase.number}
                type="button"
                onClick={() => setActiveProduct(index)}
                className="text-left rounded-[22px] p-4 transition-all hover:-translate-y-0.5"
                style={{
                  background: active
                    ? "rgba(242,185,104,0.10)"
                    : "rgba(255,255,255,0.026)",
                  border: active
                    ? "1px solid rgba(242,185,104,0.24)"
                    : "1px solid rgba(242,185,104,0.10)",
                  boxShadow: active
                    ? "0 0 28px rgba(242,185,104,0.06), inset 0 0 18px rgba(242,185,104,0.018)"
                    : "inset 0 0 14px rgba(255,255,255,0.006)",
                }}
              >
                <span
                  className="h-10 w-10 rounded-[14px] flex items-center justify-center text-xs mb-4"
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
                <span
                  className="block text-base mb-2"
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
                  className="block text-xs leading-relaxed mb-4"
                  style={{ color: "rgba(255,245,235,0.56)" }}
                >
                  {phase.subtitle}
                </span>
                <span
                  className="inline-flex text-xs"
                  style={{
                    color: active
                      ? "var(--gold-primary)"
                      : "rgba(242,185,104,0.68)",
                  }}
                >
                  {active ? "Etapa aberta" : "Abrir etapa"}
                </span>
              </button>
            );
          })}
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
      ["Código das Deusas", "Quem sou eu em essência?", "Qual é a força simbólica que estrutura minha imagem?"],
      ["Dossiê ORI", "Como essa força ganha forma?", "Como ela se traduz em corpo, cor, cabelo, presença e direção estética?"],
      ["Código Final", "Como essa identidade sustenta minha vida real?", "Como ela entra no meu armário, nas minhas escolhas e na minha rotina?"],
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
        <div className="grid lg:grid-cols-3 gap-4 mb-6">
          {questions.map(([product, question, answer]) => (
            <div
              key={product}
              className="rounded-[24px] p-5"
              style={{
                background: "rgba(255,255,255,0.026)",
                border: "1px solid rgba(242,185,104,0.10)",
              }}
            >
              <p className="text-xs mb-4" style={{ color: "var(--gold-soft)" }}>
                {product}
              </p>
              <h3 className="text-xl leading-tight mb-4" style={{ color: "var(--gold-primary)", fontWeight: 650 }}>
                {question}
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: "rgba(255,245,235,0.66)" }}>
                {answer}
              </p>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-[1fr_0.9fr] gap-4">
          <div
            className="rounded-[24px] p-5"
            style={{
              background: "rgba(255,255,255,0.024)",
              border: "1px solid rgba(242,185,104,0.10)",
            }}
          >
            <h3 className="text-2xl mb-4" style={{ color: "var(--gold-primary)", fontWeight: 680 }}>
              Porque a sua dor também aparece em camadas.
            </h3>
            <p className="text-sm md:text-base leading-relaxed" style={{ color: "rgba(255,245,235,0.68)" }}>
              Você não sofre apenas porque não sabe se vestir. Antes disso,
              pode não conseguir nomear a própria força, traduzir essa força em
              imagem ou aplicar essa imagem ao cotidiano. O Método ORI
              respeita essa ordem: primeiro revela, depois traduz, por fim
              aplica.
            </p>
          </div>

          <div
            className="rounded-[24px] p-5"
            style={{
              background: "rgba(255,255,255,0.024)",
              border: "1px solid rgba(242,185,104,0.10)",
            }}
          >
            <h3 className="text-2xl mb-4" style={{ color: "var(--gold-primary)", fontWeight: 680 }}>
              O ORI não parte da tendência.
            </h3>
            <div className="flex flex-wrap gap-2">
              {notDo.map((item) => (
                <span
                  key={item}
                  className="px-3 py-2 rounded-full text-xs"
                  style={{
                    background: "rgba(255,255,255,0.026)",
                    border: "1px solid rgba(255,255,255,0.06)",
                    color: "rgba(255,245,235,0.68)",
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
        className="text-xl md:text-2xl leading-relaxed max-w-3xl mb-6"
        style={{ color: "var(--text-primary)" }}
      >
        Cada etapa abre a próxima. Seu portal mostra não apenas onde você está,
        mas o que sua próxima camada está pronta para revelar.
      </p>

      <div className="grid md:grid-cols-3 gap-4 mb-7">
        {[
          ["Código das Deusas", "Concluído", "Primeira leitura"],
          ["Dossiê ORI", "Próxima camada", "Imagem e essência"],
          ["Código Final", "Ainda selado", "Guarda-roupa real"],
        ].map(([product, status, title]) => (
          <div
            key={product}
            className="rounded-[24px] p-5"
            style={{
              background: "rgba(255,255,255,0.026)",
              border: "1px solid rgba(242,185,104,0.10)",
            }}
          >
            <p className="text-xs mb-3" style={{ color: "var(--gold-soft)" }}>
              {product}
            </p>
            <h3 className="text-xl mb-4" style={{ color: "var(--gold-primary)", fontWeight: 680 }}>
              {title}
            </h3>
            <span
              className="inline-flex px-3 py-2 rounded-full text-xs"
              style={{
                background: "rgba(242,185,104,0.08)",
                border: "1px solid rgba(242,185,104,0.12)",
                color: "var(--gold-primary)",
              }}
            >
              {status}
            </span>
          </div>
        ))}
      </div>

      <div
        className="rounded-[28px] p-6 md:p-7 mb-6"
        style={{
          background:
            "linear-gradient(90deg, rgba(242,185,104,0.085), rgba(255,255,255,0.012))",
          border: "1px solid rgba(242,185,104,0.13)",
        }}
      >
        <h3 className="text-3xl md:text-4xl leading-[0.98] mb-5" style={{ color: "var(--gold-primary)", fontWeight: 680, letterSpacing: "-0.055em" }}>
          Sua imagem não começa no armário. Começa na leitura.
        </h3>
        <p className="text-sm md:text-base leading-relaxed max-w-3xl" style={{ color: "rgba(255,245,235,0.70)" }}>
          Antes da roupa, existe presença. Antes da presença, existe uma
          estrutura. Antes da cápsula, existe uma força que precisa ser
          reconhecida. O Método ORI foi criado para conduzir essa travessia com
          profundidade, clareza e coerência.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <Link
          to="/portal"
          className="inline-flex justify-center px-7 py-3.5 rounded-full text-sm"
          style={{
            background: "var(--gold-primary)",
            color: "#090506",
            fontWeight: 750,
            boxShadow:
              "0 0 38px rgba(242,185,104,0.16), inset 0 0 16px rgba(255,255,255,0.16)",
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
  const activeProgress = useMemo(
    () => Math.round(((activeLayer + 1) / layers.length) * 100),
    [activeLayer],
  );
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
    <div className="relative overflow-hidden">
      <section
        className="relative overflow-hidden rounded-[34px] md:rounded-[46px] p-6 md:p-9 mb-6 min-h-[520px] flex items-end cinematic-card"
        style={{
          background:
            "linear-gradient(135deg, rgba(18,9,10,0.88), rgba(5,2,2,0.96))",
          border: "1px solid rgba(242,185,104,0.14)",
          boxShadow:
            "0 0 90px rgba(242,185,104,0.055), inset 0 0 80px rgba(255,255,255,0.018)",
        }}
      >
        <img
          src="/images/backgrounds/master-bg.png"
          alt=""
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
          <p
            className="uppercase tracking-[0.46em] text-[10px] md:text-xs mb-5"
            style={{ color: "var(--gold-soft)" }}
          >
            Método ORI by Telúrica
          </p>

          <h1
            className="text-5xl md:text-7xl xl:text-[86px] leading-[0.88] mb-6"
            style={{
              color: "var(--gold-primary)",
              fontWeight: 680,
              letterSpacing: "-0.085em",
              textShadow: "0 0 56px rgba(242,185,104,0.16)",
            }}
          >
            Conheça o Método ORI
          </h1>

          <p
            className="text-lg md:text-2xl leading-relaxed max-w-3xl mb-6"
            style={{ color: "var(--text-primary)" }}
          >
            Uma jornada em camadas para revelar a força que sustenta sua imagem,
            traduzir essa força em linguagem visual e aplicar tudo à sua vida
            real.
          </p>

          <p
            className="text-sm md:text-base leading-relaxed max-w-2xl mb-7"
            style={{ color: "rgba(255,245,235,0.68)" }}
          >
            O Método ORI não começa pela roupa. Primeiro, a força é nomeada.
            Depois, ela ganha corpo, cor, cabelo, beleza e direção estética. Por
            fim, essa identidade entra no guarda-roupa real.
          </p>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={() => selectLayer(0)}
              className="inline-flex justify-center px-7 py-3.5 rounded-full text-sm"
              style={{
                background: "var(--gold-primary)",
                color: "#090506",
                fontWeight: 750,
                boxShadow:
                  "0 0 38px rgba(242,185,104,0.16), inset 0 0 16px rgba(255,255,255,0.16)",
              }}
            >
              Entender as camadas
            </button>

            <Link
              to="/portal"
              className="inline-flex justify-center px-7 py-3.5 rounded-full text-sm"
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

      <div className="grid lg:grid-cols-[300px_1fr] gap-5 items-start">
        <ProgressRail activeLayer={activeLayer} onSelect={selectLayer} />

        <div ref={readingRef} className="scroll-mt-5 md:scroll-mt-6">
          <div
            className="rounded-[24px] p-4 mb-4"
            style={{
              background: "rgba(255,255,255,0.024)",
              border: "1px solid rgba(242,185,104,0.09)",
            }}
          >
            <div className="flex items-center justify-between gap-4 mb-3">
              <p
                className="uppercase tracking-[0.28em] text-[9px]"
                style={{ color: "var(--gold-soft)" }}
              >
                Camada revelada
              </p>
              <p className="text-xs" style={{ color: "rgba(255,245,235,0.58)" }}>
                {activeProgress}%
              </p>
            </div>
            <div
              className="h-1.5 rounded-full overflow-hidden"
              style={{ background: "rgba(255,255,255,0.045)" }}
            >
              <motion.div
                className="h-full rounded-full"
                animate={{ width: `${activeProgress}%` }}
                transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                style={{
                  background:
                    "linear-gradient(90deg, rgba(242,185,104,0.52), rgba(255,213,143,1))",
                }}
              />
            </div>
          </div>

          <AnimatePresence mode="wait">
            <MetodoOriLayer
              key={layers[activeLayer].id}
              activeLayer={activeLayer}
              activeProduct={activeProduct}
              setActiveProduct={setActiveProduct}
            />
          </AnimatePresence>

          <div
            className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-[24px] p-4"
            style={{
              background: "rgba(255,255,255,0.024)",
              border: "1px solid rgba(242,185,104,0.09)",
            }}
          >
            <p className="text-sm" style={{ color: "rgba(255,245,235,0.62)" }}>
              {footerText}
            </p>

            <div className="flex gap-3">
              {activeLayer > 0 && (
                <button
                  type="button"
                  onClick={goBack}
                  className="px-5 py-3 rounded-full text-sm"
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
                  className="px-6 py-3 rounded-full text-sm"
                  style={{
                    background: "var(--gold-primary)",
                    color: "#090506",
                    fontWeight: 750,
                    boxShadow:
                      "0 0 34px rgba(242,185,104,0.14), inset 0 0 14px rgba(255,255,255,0.16)",
                  }}
                >
                  {nextButtonLabel}
                </button>
              ) : (
                <Link
                  to="/portal"
                  className="inline-flex justify-center px-6 py-3 rounded-full text-sm"
                  style={{
                    background: "var(--gold-primary)",
                    color: "#090506",
                    fontWeight: 750,
                    boxShadow:
                      "0 0 34px rgba(242,185,104,0.14), inset 0 0 14px rgba(255,255,255,0.16)",
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
