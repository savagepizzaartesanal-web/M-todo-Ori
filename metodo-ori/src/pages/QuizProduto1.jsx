import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

import { questions } from "../data/questions";
import { reports } from "../data/reports";
import { calculateResult } from "../services/calculateResult";
import { enrichReportWithSignals } from "../services/analyzeReadingSignals";
import { archetypeImages } from "../data/archetypeImages";
import { supabase } from "../lib/supabaseClient";

import QuizHero from "../components/QuizHero";
import ResultHero from "../components/ResultHero";
import NextStepCard from "../components/NextStepCard";

const LEGACY_STORAGE_KEY = "ori_produto_1_quiz";
const ORACLE_PANEL_BACKGROUND =
  "radial-gradient(circle at 88% 12%, rgba(242,185,104,0.09), transparent 34%), radial-gradient(circle at 8% 92%, rgba(183,140,255,0.05), transparent 34%), linear-gradient(90deg, rgba(5,2,2,0.88), rgba(5,2,2,0.68), rgba(5,2,2,0.92)), url('/images/espelho-ori/oraculo/fundo-oraculo-premium.png')";

const getQuizStorageKey = (userId) => {
  return userId ? `ori_produto_1_quiz_${userId}` : "ori_produto_1_quiz_guest";
};

const readQuizFromStorage = (storageKey) => {
  try {
    const savedData = localStorage.getItem(storageKey);
    return savedData ? JSON.parse(savedData) : null;
  } catch (error) {
    console.log("Erro ao ler quiz salvo:", error);
    return null;
  }
};

const getResultFromCliente = (cliente) => {
  if (!cliente?.resultado) return null;

  const combinacao = reports[cliente.resultado]?.combinacao || "";

  return {
    nomeComposto: cliente.resultado,
    principal:
      cliente.arquetipo_principal || combinacao.split("+")?.[0]?.trim() || "",
    secundario:
      cliente.arquetipo_secundario || combinacao.split("+")?.[1]?.trim() || "",
  };
};

const loadingMessages = [
  "Tecendo sua essência...",
  "Consultando os arquétipos...",
  "Sua imagem está sendo revelada...",
];

const scaleLabels = [
  { value: 1, label: "Nada a ver comigo", short: "Nada" },
  { value: 2, label: "Pouco a ver comigo", short: "Pouco" },
  { value: 3, label: "Neutro", short: "Neutro" },
  { value: 4, label: "Tem bastante a ver comigo", short: "Forte" },
  { value: 5, label: "Totalmente eu", short: "Muito forte" },
];

const blockDescriptions = {
  "Sua Presença": "Como sua energia chega antes das suas palavras.",
  "Seu Estilo": "Como sua estética comunica desejo, proteção e identidade.",
  "Seu Corpo": "Como você habita presença, movimento e sensação.",
  "Seus Relacionamentos": "Como sua energia cria vínculos, desejo e distância.",
  "Seu Mundo Interno":
    "Como seus padrões internos conduzem escolhas e percepção.",
  "Seus Padrões": "Onde sua imagem pode revelar força, sombra e repetição.",
};

const blockThemes = {
  "Sua Presença": {
    symbol: "I",
    accent: "rgba(242,185,104,0.95)",
    glow: "rgba(242,185,104,0.20)",
    aura: "radial-gradient(circle at 78% 22%, rgba(242,185,104,0.16), transparent 34%), radial-gradient(circle at 12% 82%, rgba(183,140,255,0.08), transparent 34%)",
    reward: "O método começou a ler o modo como sua energia chega.",
  },
  "Seu Estilo": {
    symbol: "II",
    accent: "rgba(217,189,255,0.95)",
    glow: "rgba(183,140,255,0.22)",
    aura: "radial-gradient(circle at 76% 22%, rgba(183,140,255,0.18), transparent 34%), radial-gradient(circle at 14% 82%, rgba(242,185,104,0.08), transparent 34%)",
    reward: "Sua estética começou a revelar desejo, proteção e linguagem.",
  },
  "Seu Corpo": {
    symbol: "III",
    accent: "rgba(155,231,174,0.95)",
    glow: "rgba(120,255,160,0.18)",
    aura: "radial-gradient(circle at 76% 22%, rgba(120,255,160,0.12), transparent 34%), radial-gradient(circle at 14% 82%, rgba(242,185,104,0.10), transparent 34%)",
    reward: "Seu corpo entrou na leitura como presença, ritmo e sensação.",
  },
  "Seus Relacionamentos": {
    symbol: "IV",
    accent: "rgba(255,166,128,0.96)",
    glow: "rgba(255,118,80,0.18)",
    aura: "radial-gradient(circle at 76% 22%, rgba(255,118,80,0.14), transparent 34%), radial-gradient(circle at 14% 82%, rgba(183,140,255,0.08), transparent 34%)",
    reward: "O espelho começou a ver como você cria vínculo e distância.",
  },
  "Seu Mundo Interno": {
    symbol: "V",
    accent: "rgba(168,212,255,0.96)",
    glow: "rgba(100,170,255,0.16)",
    aura: "radial-gradient(circle at 76% 22%, rgba(100,170,255,0.14), transparent 34%), radial-gradient(circle at 14% 82%, rgba(242,185,104,0.08), transparent 34%)",
    reward: "Sua camada interna começou a ganhar nome e contorno.",
  },
  "Seus Padrões": {
    symbol: "VI",
    accent: "rgba(255,213,143,0.98)",
    glow: "rgba(242,185,104,0.24)",
    aura: "radial-gradient(circle at 76% 22%, rgba(242,185,104,0.18), transparent 34%), radial-gradient(circle at 14% 82%, rgba(120,255,160,0.08), transparent 34%)",
    reward: "Os últimos sinais preparam a revelação do seu Código.",
  },
};

const defaultBlockTheme = {
  symbol: "ORI",
  accent: "var(--gold-primary)",
  glow: "rgba(242,185,104,0.18)",
  aura: "radial-gradient(circle at 76% 22%, rgba(242,185,104,0.14), transparent 34%), radial-gradient(circle at 14% 82%, rgba(183,140,255,0.08), transparent 34%)",
  reward: "O espelho registrou mais um fragmento da sua leitura.",
};

const blockRevealTexts = {
  "Sua Presença": {
    title: "Primeiro reflexo revelado",
    text: "Sua leitura começou a perceber como sua energia chega no mundo antes mesmo das palavras. O espelho já captou um primeiro traço da sua presença.",
  },
  "Seu Estilo": {
    title: "Segundo reflexo revelado",
    text: "Um padrão estético começou a aparecer. Ainda não é a imagem final, mas já existe uma direção entre desejo, proteção e forma.",
  },
  "Seu Corpo": {
    title: "Terceiro reflexo revelado",
    text: "O corpo começou a entrar na leitura. Movimento, postura, toque e sensação ajudam o ORI a entender como sua presença se materializa.",
  },
  "Seus Relacionamentos": {
    title: "Quarto reflexo revelado",
    text: "Agora o espelho percebe como você se aproxima, se protege, deseja, cuida ou preserva distância nos vínculos.",
  },
  "Seu Mundo Interno": {
    title: "Quinto reflexo revelado",
    text: "A camada interna começou a ganhar contorno. Suas escolhas, medos, desejos e formas de controle já estão desenhando uma estrutura simbólica.",
  },
  "Seus Padrões": {
    title: "Último reflexo revelado",
    text: "Sua composição está pronta para ser traduzida. O ORI agora vai cruzar seus sinais e revelar o Código das Deusas.",
  },
};

const colors = {
  gold: "var(--gold-primary)",
  goldSoft: "var(--gold-soft)",
  text: "var(--text-primary)",
  soft: "var(--text-soft)",
  muted: "var(--text-muted)",
};

const fadeUp = {
  hidden: { opacity: 0, y: 24, filter: "blur(10px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.58, ease: [0.22, 1, 0.36, 1] },
  },
  exit: {
    opacity: 0,
    y: -14,
    filter: "blur(8px)",
    transition: { duration: 0.26, ease: [0.22, 1, 0.36, 1] },
  },
};

function useMobileMotionOff() {
  const [isMobile, setIsMobile] = useState(() =>
    typeof window === "undefined"
      ? false
      : window.matchMedia("(max-width: 767px)").matches,
  );

  useEffect(() => {
    if (typeof window === "undefined") return undefined;

    const media = window.matchMedia("(max-width: 767px)");
    const handleChange = () => setIsMobile(media.matches);

    handleChange();
    media.addEventListener("change", handleChange);

    return () => media.removeEventListener("change", handleChange);
  }, []);

  return isMobile;
}

function getGroupedQuestions() {
  return questions.reduce((groups, question) => {
    if (!groups[question.bloco]) groups[question.bloco] = [];
    groups[question.bloco].push(question);
    return groups;
  }, {});
}

function getBlockOrder() {
  return [...new Set(questions.map((question) => question.bloco))];
}

function getFirstUnansweredIndex(answers) {
  const firstUnanswered = questions.findIndex(
    (question) => !answers[question.id],
  );
  return firstUnanswered === -1 ? questions.length - 1 : firstUnanswered;
}

function getAnsweredCount(answers) {
  return questions.filter((question) => answers[question.id]).length;
}

function getBlockProgress(blockQuestions, answers) {
  return blockQuestions.filter((question) => answers[question.id]).length;
}

function Eyebrow({ children, className = "", line = false }) {
  if (line) {
    return (
      <div className={`ori-label-line ${className}`}>
        <p className="ori-type-system ori-label-md" style={{ color: colors.goldSoft }}>
          {children}
        </p>
      </div>
    );
  }

  return (
    <p
      className={`ori-type-system ori-label-md ${className}`}
      style={{ color: colors.goldSoft }}
    >
      {children}
    </p>
  );
}

function LoadingDossie({ loadingRef, reduceMotion }) {
  const analysisSteps = [
    {
      label: "Presença",
      detail: "primeiros sinais",
      title: "Tecendo sua essência...",
      note: "O espelho observa os primeiros sinais da sua presença.",
    },
    {
      label: "Imagem",
      detail: "forma simbólica",
      title: "Consultando sua imagem...",
      note: "Forma, desejo e linguagem visual começam a se organizar.",
    },
    {
      label: "Sombra",
      detail: "tensão ativa",
      title: "Lendo tensões ativas...",
      note: "O sistema reconhece padrões de proteção, força e repetição.",
    },
    {
      label: "Essência",
      detail: "núcleo interno",
      title: "Cruzando seu núcleo...",
      note: "As camadas internas começam a ganhar estrutura simbólica.",
    },
    {
      label: "Arquétipos",
      detail: "forças dominantes",
      title: "Organizando arquétipos...",
      note: "As forças dominantes se aproximam da composição final.",
    },
    {
      label: "Síntese",
      detail: "código final",
      title: "Preparando sua revelação...",
      note: "A leitura cruza os últimos sinais para revelar seu Código.",
    },
  ];
  const [activeStationIndex, setActiveStationIndex] = useState(0);
  const activeStation = analysisSteps[activeStationIndex] || analysisSteps[0];
  const stationProgressWidth = Math.round(
    ((activeStationIndex + 1) / analysisSteps.length) * 100,
  );
  const readingParticles = [
    { left: "18%", top: "26%", size: 3, delay: 0 },
    { left: "30%", top: "14%", size: 2, delay: 0.55 },
    { left: "72%", top: "18%", size: 3, delay: 1.05 },
    { left: "84%", top: "38%", size: 2, delay: 0.25 },
    { left: "76%", top: "72%", size: 2, delay: 1.4 },
    { left: "56%", top: "84%", size: 3, delay: 0.75 },
    { left: "25%", top: "76%", size: 2, delay: 1.8 },
    { left: "12%", top: "56%", size: 2, delay: 1.15 },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStationIndex((current) => (current + 1) % analysisSteps.length);
    }, 1600);

    return () => clearInterval(interval);
  }, [analysisSteps.length]);

  return (
    <motion.div
      ref={loadingRef}
      initial={
        reduceMotion ? false : { opacity: 0, y: 18, filter: "blur(8px)" }
      }
      animate={
        reduceMotion ? undefined : { opacity: 1, y: 0, filter: "blur(0px)" }
      }
      transition={{ duration: 0.62, ease: [0.22, 1, 0.36, 1] }}
      className="mb-5 rounded-[24px] md:rounded-[38px] p-4 md:p-7 text-center relative overflow-hidden scroll-mt-8 min-h-[430px] md:min-h-[520px] flex items-center justify-center"
      style={{
        background:
          "radial-gradient(circle at center, rgba(210,135,70,0.12), transparent 34%), linear-gradient(135deg, var(--wine-deep), rgba(5,2,2,0.98))",
        border: "1px solid var(--copper-soft)",
        boxShadow:
          "0 0 110px rgba(210,135,70,0.10), inset 0 0 90px rgba(255,255,255,0.018)",
        backdropFilter: "blur(18px)",
        WebkitBackdropFilter: "blur(18px)",
      }}
    >
      <img
        src="/images/heroes/loading-ori.png"
        alt="Processamento ORI"
        className="absolute inset-0 w-full h-full object-cover object-center opacity-70 pointer-events-none select-none"
      />

      <video
        aria-hidden="true"
        className="absolute inset-0 h-full w-full object-cover opacity-85 pointer-events-none"
        autoPlay
        loop
        muted
        playsInline
        preload="none"
      >
        <source src="/videos/quizz/quizz-bg.mp4" type="video/mp4" />
      </video>

      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(180deg, rgba(33,6,6,0.42), rgba(5,2,2,0.72)), radial-gradient(circle at center, rgba(210,135,70,0.10), rgba(33,6,6,0.20) 42%, rgba(5,2,2,0.82) 100%)",
        }}
      />

      <motion.div
        className="absolute inset-0 pointer-events-none"
        animate={
          reduceMotion
            ? undefined
            : {
                opacity: [0.55, 0.92, 0.66],
              }
        }
        transition={{
          duration: 4.8,
          repeat: Infinity,
          repeatType: "mirror",
          ease: "easeInOut",
        }}
        style={{
          background:
            "radial-gradient(circle at 50% 45%, rgba(210,135,70,0.16), transparent 28%), radial-gradient(circle at 50% 58%, rgba(74,26,26,0.16), transparent 40%)",
        }}
      />

      <div
        className="absolute inset-0 pointer-events-none opacity-[0.035]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(210,135,70,0.22) 1px, transparent 1px), linear-gradient(90deg, rgba(210,135,70,0.10) 1px, transparent 1px)",
          backgroundSize: "70px 70px",
        }}
      />

      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[0, 1, 2].map((item) => (
          <motion.span
            key={item}
            className="absolute h-px w-[34%]"
            animate={
              reduceMotion
                ? undefined
                : {
                    x: item % 2 === 0 ? ["-10%", "120%"] : ["120%", "-10%"],
                    opacity: [0, 0.30, 0],
                  }
            }
            transition={{
              duration: 6.8 + item * 0.9,
              repeat: Infinity,
              ease: "easeInOut",
              delay: item * 0.35,
            }}
            style={{
              top: `${24 + item * 16}%`,
              left: item % 2 === 0 ? "-20%" : "78%",
              background:
                "linear-gradient(90deg, transparent, rgba(210,135,70,0.34), transparent)",
            }}
          />
        ))}
      </div>

      <div
            className="ori-badge absolute right-5 top-5 z-20 px-3 py-1.5 text-[9px] md:right-7 md:top-7"
            data-state="translating"
        style={{
          background:
            "linear-gradient(90deg, rgba(242,185,104,0.090), rgba(255,255,255,0.018))",
          border: "1px solid rgba(242,185,104,0.16)",
          color: "rgba(255,245,235,0.72)",
          boxShadow:
            "0 0 22px rgba(242,185,104,0.075), inset 0 0 14px rgba(255,255,255,0.010)",
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
        }}
      >
        Leitura ativa
      </div>

      <div className="relative z-10 w-full max-w-4xl mx-auto py-3 md:py-4">
        <Eyebrow className="mb-2">Tecnologia ORI em análise</Eyebrow>

        <AnimatePresence mode="wait">
          <motion.h2
            key={activeStation.title}
            initial={
              reduceMotion ? false : { opacity: 0, y: 12, filter: "blur(8px)" }
            }
            animate={
              reduceMotion
                ? undefined
                : { opacity: 1, y: 0, filter: "blur(0px)" }
            }
            exit={
              reduceMotion
                ? undefined
                : { opacity: 0, y: -10, filter: "blur(8px)" }
            }
            transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
            className="ori-type-revelation text-3xl md:text-5xl xl:text-[48px] mb-2.5"
            style={{
              color: colors.gold,
              letterSpacing: "-0.065em",
              textShadow: "0 0 52px rgba(242,185,104,0.22)",
              fontWeight: 680,
            }}
          >
            {activeStation.title}
          </motion.h2>
        </AnimatePresence>

        <AnimatePresence mode="wait">
          <motion.p
            key={activeStation.note}
            initial={reduceMotion ? false : { opacity: 0, y: 8 }}
            animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: -8 }}
            transition={{ duration: 0.34 }}
            className="ori-type-reading-soft text-xs md:text-sm max-w-xl mx-auto"
            style={{ color: "rgba(255,245,235,0.58)" }}
          >
            {activeStation.note}
          </motion.p>
        </AnimatePresence>

        <div className="relative mx-auto my-5 md:my-6 h-[196px] md:h-[220px] w-[min(72vw,430px)]">
          <motion.div
            className="absolute inset-0 rounded-full"
            animate={reduceMotion ? undefined : { rotate: 360 }}
            transition={{ duration: 34, repeat: Infinity, ease: "linear" }}
            style={{
              border: "1px solid rgba(242,185,104,0.13)",
              boxShadow:
                "inset 0 0 72px rgba(242,185,104,0.045), 0 0 58px rgba(210,135,70,0.070)",
            }}
          />

          <motion.div
            className="absolute inset-[10%] rounded-full"
            animate={reduceMotion ? undefined : { rotate: -360 }}
            transition={{ duration: 26, repeat: Infinity, ease: "linear" }}
            style={{
              border: "1px solid rgba(183,140,255,0.12)",
              boxShadow: "inset 0 0 52px rgba(183,140,255,0.028)",
            }}
          />

          <div
            className="absolute inset-[22%] rounded-full"
            style={{
              border: "1px solid rgba(242,185,104,0.09)",
              background:
                "radial-gradient(circle, rgba(242,185,104,0.05), transparent 64%)",
            }}
          />

          <motion.div
            className="absolute left-1/2 top-1/2 h-[42%] w-[42%] -translate-x-1/2 -translate-y-1/2 rounded-full"
            animate={
              reduceMotion
                ? undefined
                : {
                    scale: [1, 1.09, 1],
                    opacity: [0.78, 1, 0.82],
                  }
            }
            transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
            style={{
              background:
                "radial-gradient(circle, rgba(255,213,143,0.30), rgba(210,135,70,0.10) 44%, transparent 70%)",
              border: "1px solid rgba(242,185,104,0.24)",
              boxShadow:
                "0 0 86px rgba(242,185,104,0.28), inset 0 0 46px rgba(255,255,255,0.060)",
            }}
          />

          <div
            className="absolute left-1/2 top-1/2 h-px w-[88%] -translate-x-1/2"
            style={{
              background:
                "linear-gradient(90deg, transparent, rgba(242,185,104,0.20), transparent)",
            }}
          />
          <div
            className="absolute left-1/2 top-1/2 h-[88%] w-px -translate-y-1/2"
            style={{
              background:
                "linear-gradient(180deg, transparent, rgba(242,185,104,0.16), transparent)",
            }}
          />

          <motion.div
            className="absolute inset-[16%] rounded-full"
            animate={reduceMotion ? undefined : { rotate: 360 }}
            transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
          >
            <span
              className="absolute left-1/2 top-0 h-1.5 w-1.5 -translate-x-1/2 rounded-full"
              style={{
                background: "rgba(255,213,143,0.92)",
                boxShadow: "0 0 24px rgba(242,185,104,0.44)",
              }}
            />
          </motion.div>

          {readingParticles.map((particle) => (
            <motion.span
              key={`${particle.left}-${particle.top}`}
              className="absolute rounded-full"
              animate={
                reduceMotion
                  ? undefined
                  : {
                      opacity: [0.20, 0.82, 0.28],
                      y: [0, -10, 0],
                    }
              }
              transition={{
                duration: 3.8,
                delay: particle.delay,
                repeat: Infinity,
                repeatType: "mirror",
                ease: "easeInOut",
              }}
              style={{
                left: particle.left,
                top: particle.top,
                width: particle.size,
                height: particle.size,
                background: "rgba(242,185,104,0.78)",
                boxShadow: "0 0 20px rgba(242,185,104,0.44)",
              }}
            />
          ))}

          {analysisSteps.map((step, index) => {
            const angle =
              (index / analysisSteps.length) * Math.PI * 2 - Math.PI / 2;
            const x = 50 + Math.cos(angle) * 43;
            const y = 50 + Math.sin(angle) * 43;
            const active = index <= activeStationIndex;

            return (
              <motion.span
                key={step.label}
                className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full"
                animate={
                  reduceMotion
                    ? undefined
                    : {
                        scale: active ? [1, 1.18, 1] : 1,
                        opacity: active ? [0.72, 1, 0.82] : 0.26,
                      }
                }
                transition={{
                  duration: 2.4,
                  repeat: active && !reduceMotion ? Infinity : 0,
                  ease: "easeInOut",
                }}
                style={{
                  left: `${x}%`,
                  top: `${y}%`,
                  width: active ? 8 : 6,
                  height: active ? 8 : 6,
                  background: active
                    ? "rgba(255,213,143,0.94)"
                    : "rgba(255,245,235,0.18)",
                  border: active
                    ? "1px solid rgba(242,185,104,0.70)"
                    : "1px solid rgba(255,255,255,0.10)",
                  boxShadow: active
                    ? "0 0 30px rgba(242,185,104,0.50)"
                    : "none",
                }}
              />
            );
          })}

          <div className="absolute inset-0 flex items-center justify-center">
            <img
              src="/images/logo/logo-ori.png"
              alt="Método ORI"
              className="w-28 md:w-36 opacity-95"
              style={{
                filter:
                  "drop-shadow(0 0 22px rgba(242,185,104,0.34)) drop-shadow(0 0 44px rgba(210,135,70,0.20))",
              }}
            />
          </div>
        </div>

        <div
          className="ori-progress relative h-1.5 max-w-xl mx-auto mb-4"
          style={{
            background: "rgba(255,255,255,0.035)",
            border: "1px solid rgba(242,185,104,0.08)",
            boxShadow: "inset 0 0 16px rgba(0,0,0,0.24)",
          }}
        >
          <motion.div
            className="absolute top-0 left-0 h-full rounded-full"
            animate={{ width: `${stationProgressWidth}%` }}
            transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
            style={{
              background:
                "linear-gradient(90deg, rgba(210,135,70,0.58), rgba(255,213,143,0.96), rgba(242,185,104,0.72))",
              boxShadow: "0 0 28px rgba(242,185,104,0.36)",
            }}
          />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 max-w-4xl mx-auto">
          {analysisSteps.map((item, index) => {
            const completed = index < activeStationIndex;
            const active = index === activeStationIndex;
            const status = completed
              ? "Concluído"
              : active
                ? "Em leitura"
                : "Em espera";

            return (
              <motion.div
                key={item.label}
                animate={
                  reduceMotion
                    ? undefined
                    : {
                        opacity: completed || active ? 1 : 0.42,
                        y: active ? -2 : 0,
                      }
                }
                transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
                className={`ori-step relative overflow-hidden rounded-full px-3 py-2`}
                style={{
                  background: active
                    ? "linear-gradient(90deg, rgba(242,185,104,0.14), rgba(255,255,255,0.020))"
                    : completed
                      ? "linear-gradient(90deg, rgba(242,185,104,0.070), rgba(255,255,255,0.012))"
                      : "rgba(255,255,255,0.014)",
                  border: active
                    ? "1px solid rgba(242,185,104,0.32)"
                    : completed
                      ? "1px solid rgba(242,185,104,0.16)"
                      : "1px solid rgba(242,185,104,0.060)",
                  color:
                    completed || active
                      ? "rgba(255,245,235,0.82)"
                      : "rgba(255,245,235,0.42)",
                  boxShadow: active
                    ? "0 0 28px rgba(242,185,104,0.12), inset 0 0 18px rgba(242,185,104,0.025)"
                    : "none",
                }}
              >
                <span
                  className="absolute inset-x-4 top-0 h-px"
                  style={{
                    background:
                      completed || active
                        ? "linear-gradient(90deg, transparent, rgba(242,185,104,0.38), transparent)"
                        : "linear-gradient(90deg, transparent, rgba(255,255,255,0.10), transparent)",
                  }}
                />
                <span className="flex items-center justify-center gap-2">
                  <span
                    className="h-1.5 w-1.5 rounded-full"
                    style={{
                      background: active
                        ? "rgba(255,213,143,0.96)"
                        : completed
                          ? "rgba(242,185,104,0.72)"
                          : "rgba(255,255,255,0.18)",
                      boxShadow: active
                        ? "0 0 18px rgba(242,185,104,0.58)"
                        : completed
                          ? "0 0 10px rgba(242,185,104,0.24)"
                          : "none",
                    }}
                  />
                  <span
                    className="ori-type-system text-[8px]"
                    style={{
                      color:
                        completed || active
                          ? "rgba(242,185,104,0.82)"
                          : "rgba(255,245,235,0.30)",
                    }}
                  >
                    {status}
                  </span>
                </span>
                <span
                  className="block text-xs font-semibold mt-1"
                  style={{
                    color:
                      completed || active
                        ? "rgba(255,245,235,0.82)"
                        : "rgba(255,245,235,0.38)",
                    letterSpacing: "-0.01em",
                  }}
                >
                  {item.label}
                </span>
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}

function QuizIntro({
  onStart,
  answeredQuestions,
  totalQuestions,
  reduceMotion,
}) {
  const hasProgress = answeredQuestions > 0;
  const methodSteps = [
    {
      title: "Nomear",
      text: "A leitura identifica a força principal, a força secundária e a composição que organiza sua presença.",
    },
    {
      title: "Reconhecer",
      text: "O método observa desejo, proteção, sombra, vínculos e repetição para revelar o que sustenta sua imagem por dentro.",
    },
    {
      title: "Abrir caminho",
      text: "O resultado cria a base para o Espelho ORI e para as próximas camadas: corpo, cor, cabelo, beleza e guarda-roupa real.",
    },
  ];

  return (
    <motion.section
      variants={fadeUp}
      initial={reduceMotion ? false : "hidden"}
      animate={reduceMotion ? undefined : "visible"}
      className="relative overflow-hidden rounded-[24px] md:rounded-[38px] p-4 md:p-7 mb-5 md:mb-6"
      style={{
        background:
          "radial-gradient(circle at top right, rgba(242,185,104,0.11), transparent 34%), radial-gradient(circle at bottom left, rgba(183,140,255,0.06), transparent 38%), linear-gradient(135deg, rgba(18,9,10,0.72), rgba(5,2,2,0.92))",
        border: "1px solid rgba(242,185,104,0.10)",
        boxShadow:
          "0 0 48px rgba(242,185,104,0.036), inset 0 0 36px rgba(255,255,255,0.010)",
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
      }}
    >
      <div className="relative z-10 grid lg:grid-cols-[0.9fr_1.1fr] gap-6 items-center">
        <div>
          <Eyebrow className="mb-4">Código das Deusas</Eyebrow>

          <h1
            className="ori-type-revelation text-3xl md:text-5xl mb-4"
            style={{
              color: colors.gold,
              letterSpacing: "-0.075em",
              fontWeight: 680,
              textShadow: "0 0 60px rgba(242,185,104,0.16)",
            }}
          >
            O espelho começa lendo seus sinais.
          </h1>

          <p
            className="ori-mobile-preview-3 ori-type-reading text-base md:text-lg max-w-2xl mb-4"
            style={{ color: colors.soft }}
          >
            Responda intuitivamente. Quando você não racionaliza demais as
            questões, a leitura se aproxima com mais precisão dos padrões reais
            da sua psique, da sua presença e da imagem que começa dentro de
            você.
          </p>

          <p
            className="ori-type-reading-soft text-sm md:text-base max-w-2xl mb-4"
            style={{ color: "rgba(255,245,235,0.66)" }}
          >
            Esta primeira etapa não entrega uma consultoria visual completa. Ela
            nomeia a base simbólica que depois será traduzida em corpo, cor,
            cabelo, beleza, presença e armário.
          </p>

          <motion.button
            type="button"
            onClick={onStart}
            whileHover={
              reduceMotion
                ? undefined
                : {
                    scale: 1.025,
                    y: -2,
                    letterSpacing: "0.035em",
                    boxShadow:
                      "0 0 42px rgba(210,135,70,0.24), inset 0 0 16px rgba(255,255,255,0.16)",
                  }
            }
            whileTap={reduceMotion ? undefined : { scale: 0.98 }}
            className="ori-journey-action px-6 py-3 rounded-full text-sm md:text-base"
            style={{
              background:
                "linear-gradient(90deg, var(--copper-primary), var(--gold-primary))",
              color: "#090506",
              fontWeight: 700,
              boxShadow:
                "0 0 24px rgba(210,135,70,0.12), inset 0 0 10px rgba(255,255,255,0.12)",
            }}
          >
            {hasProgress ? "Continuar minha leitura" : "Começar minha leitura"}
          </motion.button>
        </div>

        <div
          className="relative overflow-hidden rounded-[22px] p-4 md:p-5"
          style={{
            background:
              "linear-gradient(180deg, rgba(255,255,255,0.028), rgba(255,255,255,0.008))",
            border: "1px solid rgba(242,185,104,0.09)",
            boxShadow: "inset 0 0 28px rgba(255,255,255,0.010)",
          }}
        >
          <Eyebrow className="mb-4">Travessia ORI</Eyebrow>

          <div className="grid gap-4">
            {methodSteps.map((item) => (
              <div
                key={item.title}
                className="rounded-[16px] p-3"
                style={{
                  background: "rgba(255,255,255,0.02)",
                  border: "1px solid rgba(242,185,104,0.06)",
                }}
              >
                <h3
                  className="ori-type-revelation text-lg mb-1"
                  style={{
                    color: colors.text,
                    fontWeight: 620,
                    letterSpacing: "-0.035em",
                  }}
                >
                  {item.title}
                </h3>

                <p
                  className="ori-type-reading-soft text-sm"
                  style={{ color: colors.soft }}
                >
                  {item.text}
                </p>
              </div>
            ))}
          </div>

          {hasProgress && (
            <div className="mt-4">
              <p className="ori-type-reading-soft text-sm mb-2" style={{ color: colors.soft }}>
                Você já revelou {answeredQuestions} de {totalQuestions} sinais.
              </p>

              <div
                className="ori-progress h-2"
                style={{ background: "rgba(255,255,255,0.04)" }}
              >
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${Math.round((answeredQuestions / totalQuestions) * 100)}%`,
                    background:
                      "linear-gradient(90deg, rgba(242,185,104,0.55), rgba(255,213,143,1))",
                    boxShadow: "0 0 30px rgba(242,185,104,0.28)",
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.section>
  );
}

function LayerReveal({
  bloco,
  onContinue,
  onBack,
  isFinalBlock,
  reduceMotion,
}) {
  const reveal = blockRevealTexts[bloco] || {
    title: "Camada revelada",
    text: "O espelho captou mais um fragmento da sua leitura. Continue para tornar sua composição mais nítida.",
  };
  const theme = blockThemes[bloco] || defaultBlockTheme;

  return (
    <motion.section
      key={`reveal-${bloco}`}
      variants={fadeUp}
      initial={reduceMotion ? false : "hidden"}
      animate={reduceMotion ? undefined : "visible"}
      exit={reduceMotion ? undefined : "exit"}
      className="relative mb-4 min-h-[360px] overflow-hidden rounded-[22px] p-3.5 md:mb-6 md:min-h-[520px] md:rounded-[38px] md:p-7"
      style={{
        background: `${theme.aura}, linear-gradient(135deg, rgba(18,9,10,0.72), rgba(5,2,2,0.92))`,
        border: "1px solid rgba(242,185,104,0.10)",
        boxShadow:
          "0 0 48px rgba(242,185,104,0.036), inset 0 0 36px rgba(255,255,255,0.010)",
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
      }}
    >
      <video
        aria-hidden="true"
        className="absolute inset-0 h-full w-full object-cover opacity-30 pointer-events-none"
        autoPlay
        loop
        muted
        playsInline
        preload="none"
      >
        <source src="/videos/quizz/quizz-bg.mp4" type="video/mp4" />
      </video>

      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(180deg, rgba(5,2,2,0.34), rgba(5,2,2,0.64)), radial-gradient(circle at 20% 18%, rgba(242,185,104,0.10), transparent 32%), radial-gradient(circle at 85% 90%, rgba(183,140,255,0.06), transparent 34%), linear-gradient(180deg, rgba(5,2,2,0.10), rgba(5,2,2,0.88))",
        }}
      />

      <div className="relative z-10 flex min-h-[324px] items-center justify-center md:min-h-[466px]">
        <div className="w-full max-w-3xl mx-auto text-center">
          <motion.div
            initial={reduceMotion ? false : { scale: 0.94, opacity: 0 }}
            animate={reduceMotion ? undefined : { scale: 1, opacity: 1 }}
            transition={{ duration: 0.46, ease: [0.22, 1, 0.36, 1] }}
            className="mx-auto mb-2.5 flex h-11 w-11 items-center justify-center rounded-full text-sm md:mb-3 md:h-12 md:w-12 md:text-base"
            style={{
              background:
                "radial-gradient(circle at 50% 35%, rgba(242,185,104,0.13), rgba(6,3,3,0.72) 64%)",
              border: `1px solid rgba(242,185,104,0.16)`,
              color: theme.accent,
              boxShadow: `0 0 22px ${theme.glow}, inset 0 0 16px rgba(255,255,255,0.035)`,
              fontWeight: 650,
            }}
          >
            {theme.symbol}
          </motion.div>

          <div
            className="ori-reveal-badge mb-3 inline-flex items-center gap-2 rounded-full px-3 py-1 md:mb-5 md:px-3.5"
            style={{
              background:
                "linear-gradient(90deg, rgba(242,185,104,0.060), rgba(255,255,255,0.010))",
              border: "1px solid rgba(242,185,104,0.12)",
              color: "rgba(255,245,235,0.70)",
              boxShadow: "inset 0 0 14px rgba(255,255,255,0.010)",
            }}
          >
            <span
              className="text-[10px]"
              style={{ color: "rgba(242,185,104,0.88)" }}
            >
              ✓
            </span>
            <span className="ori-type-system text-[9px]">
              Camada registrada
            </span>
          </div>

          <Eyebrow className="mb-3 md:mb-4">{bloco}</Eyebrow>

          <h2
            className="ori-type-revelation mb-3 text-[28px] md:mb-5 md:text-5xl"
            style={{
              color: theme.accent,
              fontWeight: 680,
              letterSpacing: "-0.07em",
              textShadow: `0 0 34px ${theme.glow}`,
            }}
          >
            {reveal.title}
          </h2>

          <p
            className="ori-type-reading mx-auto mb-5 max-w-[680px] text-sm md:mb-6 md:text-base"
            style={{
              color: "rgba(255,245,235,0.70)",
              fontWeight: 520,
              textShadow: "0 0 18px rgba(0,0,0,0.24)",
            }}
          >
            {reveal.text}
          </p>

          <div className="mb-6 hidden flex-wrap justify-center gap-2.5 md:flex md:mb-7">
            {[
              `Camada ${String(blockRevealTexts[bloco] ? Object.keys(blockRevealTexts).indexOf(bloco) + 1 : 1).padStart(2, "0")} concluída`,
              "+1 fragmento desbloqueado",
              "Espelho mais nítido",
            ].map((item) => (
              <span
                key={item}
                className="ori-reveal-chip ori-chip"
                style={{
                  background:
                    `linear-gradient(90deg, rgba(255,255,255,0.014), ${theme.glow}, rgba(255,255,255,0.008))`,
                  border: `1px solid ${theme.glow}`,
                  color: theme.accent,
                  padding: "0.42rem 0.74rem",
                  fontWeight: 600,
                  boxShadow: `0 0 14px ${theme.glow}, inset 0 0 12px rgba(255,255,255,0.006)`,
                }}
              >
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{
                    background: theme.accent,
                    boxShadow: `0 0 10px ${theme.glow}`,
                  }}
                />
                {item}
              </span>
            ))}
          </div>

          <div className="flex flex-col items-center justify-center gap-2.5 sm:flex-row md:gap-3">
            <motion.button
              type="button"
              onClick={onBack}
              whileHover={reduceMotion ? undefined : { x: -2 }}
              whileTap={reduceMotion ? undefined : { scale: 0.98 }}
              className="ori-button-secondary w-full min-w-[190px] px-6 py-3 text-sm sm:w-auto md:text-[15px]"
              style={{
                background: "rgba(255,255,255,0.024)",
                color: "rgba(255,245,235,0.70)",
                fontWeight: 650,
                letterSpacing: "0.004em",
                border: "1px solid rgba(255,245,235,0.10)",
                boxShadow: "inset 0 0 14px rgba(255,255,255,0.008)",
              }}
            >
              ← Voltar etapa anterior
            </motion.button>

            <motion.button
              type="button"
              onClick={onContinue}
              whileHover={
                reduceMotion
                  ? undefined
                  : {
                      scale: 1.018,
                      y: -2,
                      boxShadow:
                        "0 0 34px rgba(210,135,70,0.22), inset 0 0 16px rgba(255,255,255,0.14)",
                    }
              }
              whileTap={reduceMotion ? undefined : { scale: 0.98 }}
              className="ori-journey-action w-full min-w-[190px] rounded-full px-6 py-3 text-sm sm:w-auto md:text-[15px]"
              style={{
                background: `linear-gradient(90deg, ${theme.accent}, rgba(255,245,235,0.92))`,
                color: "#090506",
                fontWeight: 700,
                letterSpacing: "0.012em",
                border: `1px solid ${theme.glow}`,
                boxShadow: `0 0 24px ${theme.glow}, inset 0 0 12px rgba(255,255,255,0.10)`,
              }}
            >
              {isFinalBlock ? "Preparar revelação" : "Continuar leitura"}
            </motion.button>
          </div>
        </div>
      </div>
    </motion.section>
  );
}

function QuizQuestionView({
  currentQuestion,
  currentQuestionIndex,
  totalQuestions,
  answers,
  onAnswer,
  onBack,
  groupedQuestions,
  blockOrder,
  progress,
  answeredQuestions,
  reduceMotion,
}) {
  const selectedValue = answers[currentQuestion.id];
  const currentBlock = currentQuestion.bloco;
  const blockIndex = blockOrder.indexOf(currentBlock);
  const currentBlockQuestions = groupedQuestions[currentBlock] || [];
  const theme = blockThemes[currentBlock] || defaultBlockTheme;
  const questionIndexInBlock = currentBlockQuestions.findIndex(
    (question) => question.id === currentQuestion.id,
  );
  const answeredInBlock = getBlockProgress(currentBlockQuestions, answers);
  const blockProgress = Math.round(
    (answeredInBlock / currentBlockQuestions.length) * 100,
  );
  const captured = Boolean(selectedValue);
  const canGoBack = currentQuestionIndex > 0;

  const progressDots = currentBlockQuestions.map((question, index) => ({
    id: question.id,
    active: index === questionIndexInBlock,
    answered: Boolean(answers[question.id]),
  }));

  return (
    <motion.section
      variants={fadeUp}
      initial={reduceMotion ? false : "hidden"}
      animate={reduceMotion ? undefined : "visible"}
      exit={reduceMotion ? undefined : "exit"}
      className="ori-quiz-mobile-shell relative mb-4 flex min-h-[auto] items-center overflow-hidden rounded-[22px] p-2.5 md:mb-5 md:min-h-[380px] md:rounded-[32px] md:p-4 xl:p-5"
      style={{
        background: `${theme.aura}, radial-gradient(circle at 50% 42%, ${theme.glow}, transparent 32%), linear-gradient(135deg, rgba(18,9,10,0.74), rgba(5,2,2,0.94))`,
        border: "1px solid rgba(242,185,104,0.10)",
        boxShadow: `0 0 58px ${theme.glow}, inset 0 0 40px rgba(255,255,255,0.010)`,
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
      }}
    >
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.02]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(242,185,104,0.14) 1px, transparent 1px), linear-gradient(90deg, rgba(242,185,104,0.06) 1px, transparent 1px)",
          backgroundSize: "86px 86px",
        }}
      />

      <video
        aria-hidden="true"
        className="absolute inset-0 h-full w-full object-cover opacity-42 pointer-events-none"
        autoPlay
        loop
        muted
        playsInline
        preload="none"
      >
        <source
          src="/videos/quizz/quizz-bg.mp4"
          type="video/mp4"
          media="(min-width: 768px)"
        />
      </video>

      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(180deg, rgba(5,2,2,0.38), rgba(5,2,2,0.62)), radial-gradient(circle at center, rgba(5,2,2,0.08), rgba(5,2,2,0.58) 72%)",
        }}
      />

      <div className="relative z-10 w-full max-w-5xl mx-auto">
        <div className="ori-quiz-mobile-top mb-2 flex flex-row items-start justify-between gap-2 px-0">
          <div>
            <Eyebrow className="mb-1">Câmara de Leitura ORI</Eyebrow>
            <p
              className="uppercase tracking-[0.16em] text-[7px] leading-relaxed md:text-[9px] md:tracking-[0.22em]"
              style={{ color: "rgba(255,245,235,0.50)" }}
            >
              Sinal {String(currentQuestion.id).padStart(2, "0")} de{" "}
              {String(totalQuestions).padStart(2, "0")}
              <span className="hidden md:inline">
                <span
                  className="mx-2"
                  style={{ color: "rgba(255,245,235,0.18)" }}
                >
                  ·
                </span>
                {currentBlock}
                <span
                  className="mx-2"
                  style={{ color: "rgba(255,245,235,0.18)" }}
                >
                  ·
                </span>
                Camada {String(blockIndex + 1).padStart(2, "0")}
              </span>
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <div
              className="hidden sm:flex items-center gap-2 px-2 py-1.5 rounded-full text-[11px]"
              style={{
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(242,185,104,0.08)",
                color: "rgba(255,245,235,0.58)",
              }}
            >
              <span style={{ color: theme.accent }}>◇</span>
              {answeredQuestions} sinais
            </div>

            <div
              className="px-2 py-1 rounded-full text-[10px] md:py-1.5 md:text-[11px]"
              style={{
                background: captured
                  ? `linear-gradient(90deg, ${theme.glow}, rgba(255,255,255,0.014))`
                  : "rgba(255,255,255,0.018)",
                border: captured
                  ? `1px solid ${theme.glow}`
                  : `1px solid rgba(242,185,104,0.08)`,
                color: theme.accent,
                boxShadow: captured ? `0 0 12px ${theme.glow}` : "none",
              }}
            >
              {captured ? "Sinal capturado" : `${blockProgress}% da camada`}
            </div>
          </div>
        </div>

        <div
          className="ori-quiz-mobile-card relative flex min-h-[auto] flex-col justify-between overflow-hidden rounded-[18px] px-3 py-3 md:min-h-[360px] md:rounded-[28px] md:px-5 md:py-4 xl:px-7 xl:py-5"
          style={{
            background:
              "radial-gradient(circle at top, rgba(255,255,255,0.048), transparent 38%), linear-gradient(180deg, rgba(255,255,255,0.028), rgba(255,255,255,0.008))",
            border: `1px solid ${theme.glow}`,
            boxShadow: `0 0 48px ${theme.glow}, inset 0 0 38px rgba(255,255,255,0.010)`,
          }}
        >
          <div
            className="absolute inset-[8px] rounded-[18px] md:rounded-[26px] pointer-events-none"
            style={{ border: "1px solid rgba(242,185,104,0.035)" }}
          />

          <div className="relative z-10 flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-2.5 md:gap-3">
              <div
                className="h-8 w-8 rounded-full flex items-center justify-center text-xs shrink-0 md:h-10 md:w-10 md:text-sm"
                style={{
                  background: "rgba(5,2,2,0.56)",
                  border: `1px solid ${theme.glow}`,
                  color: theme.accent,
                  boxShadow: `0 0 20px ${theme.glow}, inset 0 0 12px rgba(255,255,255,0.014)`,
                  fontWeight: 700,
                }}
              >
                {theme.symbol}
              </div>

              <div>
                <p
                  className="uppercase tracking-[0.16em] text-[7px] mb-0.5 md:tracking-[0.22em] md:text-[8px] md:mb-1"
                  style={{ color: colors.goldSoft }}
                >
                  {currentBlock}
                </p>

                <p
                  className="ori-mobile-preview hidden text-xs md:block md:text-sm"
                  style={{ color: "rgba(255,245,235,0.54)" }}
                >
                  {blockDescriptions[currentBlock]}
                </p>
              </div>
            </div>

            <div className="hidden md:flex items-center gap-1.5">
              {progressDots.map((dot) => (
                <span
                  key={dot.id}
                  className="h-1.5 w-1.5 rounded-full"
                  style={{
                    background: dot.answered
                      ? theme.accent
                      : dot.active
                        ? "rgba(255,245,235,0.42)"
                        : "rgba(255,255,255,0.12)",
                    boxShadow: dot.active ? `0 0 14px ${theme.glow}` : "none",
                  }}
                />
              ))}
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestion.id}
              initial={
                reduceMotion
                  ? false
                  : {
                      opacity: 0,
                      y: 16,
                      filter: "blur(8px)",
                    }
              }
              animate={
                reduceMotion
                  ? undefined
                  : {
                      opacity: 1,
                      y: 0,
                      filter: "blur(0px)",
                    }
              }
              exit={
                reduceMotion
                  ? undefined
                  : {
                      opacity: 0,
                      y: -16,
                      filter: "blur(6px)",
                    }
              }
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              className="ori-quiz-mobile-question-wrap relative z-10"
            >
              <div className="ori-quiz-mobile-question mx-auto max-w-4xl py-3 text-center md:py-4">
                <p
                  className="uppercase tracking-[0.18em] text-[7px] md:tracking-[0.26em] md:text-[9px] mb-2 md:mb-4"
                  style={{ color: "rgba(255,245,235,0.45)" }}
                >
                  Pergunta {questionIndexInBlock + 1} de{" "}
                  {currentBlockQuestions.length}
                </p>

                <h3
                  className="text-[21px] md:text-[34px] xl:text-[38px] leading-[1.08] md:leading-[1.04] max-w-[820px] mx-auto [text-wrap:balance]"
                  style={{
                    color: theme.accent,
                    fontWeight: 690,
                    letterSpacing: "-0.072em",
                    textShadow: `0 0 38px ${theme.glow}`,
                  }}
                >
                  {currentQuestion.pergunta}
                </h3>
              </div>

              <div className="max-w-3xl mx-auto mb-2 md:mb-3">
                <AnimatePresence mode="wait">
                  <motion.p
                    key={captured ? `captured-${selectedValue}` : "empty"}
                    initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                    animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                    exit={reduceMotion ? undefined : { opacity: 0, y: -8 }}
                    transition={{ duration: 0.22 }}
                    className="text-center text-[11px] md:text-sm mb-2 md:mb-3"
                    style={{
                      color: captured
                        ? "rgba(255,245,235,0.74)"
                        : colors.muted,
                    }}
                  >
                    {captured
                      ? "Sinal registrado. O espelho avança para a próxima leitura..."
                      : "Escolha a intensidade que mais se aproxima da sua verdade atual."}
                  </motion.p>
                </AnimatePresence>

                <div className="ori-quiz-mobile-scale relative z-10 grid grid-cols-5 gap-1.5 md:gap-1.5">
                  {scaleLabels.map((item) => {
                    const active = selectedValue === item.value;

                    return (
                      <motion.button
                        key={item.value}
                        type="button"
                        onClick={() => onAnswer(currentQuestion.id, item.value)}
                        aria-pressed={active}
                        aria-label={`Responder ${item.value}: ${item.short}`}
                        whileHover={
                          reduceMotion ? undefined : { y: -2, scale: 1.01 }
                        }
                        whileTap={reduceMotion ? undefined : { scale: 0.96 }}
                        className="ori-quiz-mobile-scale-option group flex min-h-[58px] flex-col items-center justify-center gap-1 rounded-[13px] px-1 py-1.5 transition-colors duration-300 md:min-h-[64px] md:rounded-[14px] md:px-1 md:py-1.5"
                        style={{
                          background: active
                            ? "linear-gradient(90deg, rgba(210,135,70,0.10), transparent), rgba(255,255,255,0.018)"
                            : "rgba(255,255,255,0.008)",
                          border: active
                            ? "1px solid var(--copper-primary)"
                            : "1px solid rgba(210,135,70,0.15)",
                          boxShadow: active
                            ? "0 0 30px rgba(210,135,70,0.15), inset 0 0 18px rgba(255,255,255,0.012)"
                            : "inset 0 0 12px rgba(255,255,255,0.004)",
                        }}
                        onMouseEnter={(event) => {
                          if (active) return;
                          event.currentTarget.style.boxShadow =
                            "0 0 24px rgba(210,135,70,0.15), inset 0 0 12px rgba(255,255,255,0.006)";
                          event.currentTarget.style.border =
                            "1px solid rgba(210,135,70,0.28)";
                        }}
                        onMouseLeave={(event) => {
                          if (active) return;
                          event.currentTarget.style.boxShadow =
                            "inset 0 0 12px rgba(255,255,255,0.004)";
                          event.currentTarget.style.border =
                            "1px solid rgba(210,135,70,0.15)";
                        }}
                      >
                        <motion.span
                          className="h-7 w-7 rounded-full flex items-center justify-center text-xs md:h-8 md:w-8 md:text-sm"
                          animate={
                            active && !reduceMotion
                              ? { scale: [1, 1.04, 1] }
                              : { scale: 1 }
                          }
                          transition={{
                            duration: 1.2,
                            repeat: active && !reduceMotion ? Infinity : 0,
                            ease: "easeInOut",
                          }}
                          style={{
                            background: active
                              ? "var(--copper-primary)"
                              : "rgba(210,135,70,0.10)",
                            border: active
                              ? "1px solid var(--copper-primary)"
                              : "1px solid rgba(210,135,70,0.16)",
                            color: active ? "#090506" : "var(--copper-primary)",
                            fontWeight: 650,
                            boxShadow: active
                              ? "0 0 20px rgba(210,135,70,0.14)"
                              : "none",
                          }}
                        >
                          {item.value}
                        </motion.span>

                        <span
                          className="text-[9px] md:text-xs leading-tight"
                          style={{
                            color: active
                              ? "var(--copper-primary)"
                              : colors.text,
                            fontWeight: active ? 600 : 500,
                          }}
                        >
                          {item.short}
                        </span>
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          <div
            className="ori-quiz-mobile-footer relative z-10 mx-auto flex max-w-3xl flex-col gap-2 rounded-[14px] px-3 py-2 md:flex-row md:items-center md:justify-between md:gap-3 md:rounded-[16px]"
            style={{
              background: "rgba(5,2,2,0.22)",
              border: "1px solid rgba(242,185,104,0.06)",
            }}
          >
            {canGoBack ? (
              <motion.button
                type="button"
                onClick={onBack}
                whileHover={reduceMotion ? undefined : { x: -2 }}
                whileTap={reduceMotion ? undefined : { scale: 0.98 }}
                className="px-3.5 py-2 rounded-full text-xs md:px-4 md:py-2.5 md:text-sm w-fit"
                style={{
                  background: "rgba(255,255,255,0.020)",
                  border: "1px solid rgba(242,185,104,0.12)",
                  color: "rgba(255,245,235,0.66)",
                }}
              >
                ← Voltar etapa anterior
              </motion.button>
            ) : (
              <span
                className="hidden md:block text-xs"
                style={{ color: "rgba(255,245,235,0.28)" }}
              >
                Primeiro sinal desta leitura
              </span>
            )}

            <div className="grid grid-cols-2 gap-2.5 md:gap-4 flex-1">
              {[
                { label: "Clareza do Espelho", value: progress },
                { label: "Camada atual", value: blockProgress },
              ].map((item) => (
                <div key={item.label}>
                  <div className="flex justify-between gap-3 mb-1.5">
                    <span
                      className="text-[10px] md:text-[11px]"
                      style={{ color: "rgba(255,245,235,0.52)" }}
                    >
                      {item.label}
                    </span>
                    <span
                      className="text-[10px] md:text-[11px]"
                      style={{ color: theme.accent }}
                    >
                      {item.value}%
                    </span>
                  </div>

                  <div
                    className="relative overflow-hidden h-1 rounded-full"
                    style={{ background: "rgba(255,255,255,0.04)" }}
                  >
                    <motion.div
                      className="absolute left-0 top-0 h-full rounded-full"
                      animate={{ width: `${item.value}%` }}
                      transition={{
                        duration: 0.45,
                        ease: [0.22, 1, 0.36, 1],
                      }}
                      style={{
                        background: `linear-gradient(90deg, ${theme.glow}, ${theme.accent})`,
                        boxShadow: `0 0 14px ${theme.glow}`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  );
}

function createGuidedReadingBlocks(paragraphs) {
  const labels = [
    "O que isso revela",
    "Como isso aparece",
    "O que observar agora",
  ];

  if (!paragraphs.length) return [];

  const blockCount = Math.min(labels.length, paragraphs.length);
  const chunkSize = Math.ceil(paragraphs.length / blockCount);

  return labels.slice(0, blockCount).map((label, index) => {
    const start = index * chunkSize;
    const end = index === blockCount - 1 ? paragraphs.length : start + chunkSize;

    return {
      label,
      paragraphs: paragraphs.slice(start, end),
    };
  });
}

function getReadingAxisLabel(index) {
  const labels = ["Revelação", "Manifestação", "Direção", "Aprofundamento"];

  return labels[index] || `Camada ${String(index + 1).padStart(2, "0")}`;
}

function ReadingLayerPanel({ layer }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  const mobileMotionOff = useMobileMotionOff();
  const reduceMotion = prefersReducedMotion || mobileMotionOff;

  if (!layer) return null;

  const paragraphs = String(layer.content || "")
    .split(/\n+/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
  const [leadParagraph, ...bodyParagraphs] = paragraphs;
  const guidedBlocks = createGuidedReadingBlocks(bodyParagraphs);

  return (
    <motion.article
      key={layer.number}
      initial={reduceMotion ? false : { opacity: 0, y: 16, filter: "blur(8px)" }}
      animate={reduceMotion ? undefined : { opacity: 1, y: 0, filter: "blur(0px)" }}
      exit={reduceMotion ? undefined : { opacity: 0, y: -10, filter: "blur(6px)" }}
      transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
      className={`relative overflow-hidden rounded-[18px] md:rounded-[26px] ${
        isExpanded ? "lg:min-h-[560px]" : "lg:min-h-[350px]"
      }`}
      style={{
        background:
          "radial-gradient(circle at top right, rgba(242,185,104,0.10), transparent 34%), linear-gradient(135deg, rgba(18,9,10,0.56), rgba(5,2,2,0.70))",
        border: "1px solid rgba(242,185,104,0.11)",
        boxShadow:
          "0 0 66px rgba(242,185,104,0.035), inset 0 0 40px rgba(255,255,255,0.010)",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
      }}
    >
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.024]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(242,185,104,0.16) 1px, transparent 1px), linear-gradient(90deg, rgba(242,185,104,0.07) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
        }}
      />

      <div className="absolute right-0 top-0 hidden h-[350px] w-[46%] lg:block">
        <img
          src={layer.image}
          alt={layer.eyebrow}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover object-right opacity-[0.86] scale-[1.06]"
        />
      </div>

      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(90deg, rgba(5,2,2,0.90) 0%, rgba(5,2,2,0.82) 34%, rgba(5,2,2,0.58) 50%, rgba(5,2,2,0.20) 72%, rgba(5,2,2,0.04) 100%)",
        }}
      />

      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(circle at 82% 38%, rgba(242,185,104,0.08), transparent 28%), linear-gradient(90deg, transparent 0%, rgba(5,2,2,0.06) 52%, rgba(5,2,2,0.20) 100%)",
        }}
      />

      <div
        className={`relative z-10 ${
          isExpanded ? "lg:min-h-[560px]" : "lg:min-h-[350px]"
        }`}
      >
        <div
          className={`flex min-h-0 max-w-full flex-col p-3 md:p-5 lg:max-w-[54%] ${
            isExpanded ? "justify-center lg:min-h-[350px]" : "justify-center lg:min-h-[350px]"
          }`}
        >
          <div className="mb-2 flex flex-wrap items-center gap-2 md:mb-2.5">
            <span
              className="flex h-7 w-7 items-center justify-center rounded-full text-[10px] md:h-8 md:w-8 md:text-[11px]"
              style={{
                background: "rgba(242,185,104,0.09)",
                border: "1px solid rgba(242,185,104,0.16)",
                color: "var(--gold-primary)",
                boxShadow: "0 0 26px rgba(242,185,104,0.07)",
                fontWeight: 650,
              }}
            >
              {layer.number}
            </span>

            <div className="min-w-0">
              <p
                className="ori-type-system mb-0.5 text-[8px]"
                style={{ color: "var(--gold-soft)" }}
              >
                {layer.eyebrow}
              </p>
              <p
                className="ori-type-reading-soft text-[11px] md:text-xs"
                style={{ color: "rgba(255,245,235,0.62)" }}
              >
                Camada ativa da leitura
              </p>
            </div>
          </div>

          <h3
            className="ori-type-revelation mb-2 max-w-3xl whitespace-pre-line text-[22px] md:text-[30px] xl:text-[34px]"
            style={{
              color: "var(--gold-primary)",
              fontWeight: 650,
              letterSpacing: "-0.065em",
              textShadow: "0 0 38px rgba(242,185,104,0.12)",
            }}
          >
            {layer.title}
          </h3>

          <p
            className="ori-type-reading-soft mb-2.5 max-w-2xl text-[13px] md:mb-3 md:text-sm"
            style={{ color: "rgba(255,245,235,0.66)" }}
          >
            {layer.description}
          </p>

          {leadParagraph && !isExpanded && (
            <div
              className="mb-2 rounded-[15px] px-3 py-2.5 md:mb-2.5 md:px-3.5 md:py-3"
              style={{
                background:
                  "linear-gradient(90deg, rgba(242,185,104,0.060), rgba(255,255,255,0.010))",
                border: "1px solid rgba(242,185,104,0.10)",
                backdropFilter: "blur(8px)",
                WebkitBackdropFilter: "blur(8px)",
              }}
            >
              <p
                className="ori-type-system ori-label-sm mb-1.5"
                style={{ color: "var(--gold-soft)" }}
              >
                Síntese principal
              </p>

              <p
                className="ori-type-reading text-[13px] leading-relaxed md:text-sm"
                style={{ color: "rgba(255,245,235,0.88)" }}
              >
                {leadParagraph}
              </p>
            </div>
          )}

          {guidedBlocks.length > 0 && !isExpanded && (
            <div className="grid gap-2 md:gap-2.5">
              {guidedBlocks.slice(0, 2).map((block) => (
                <div
                  key={`${layer.number}-${block.label}`}
                  className="rounded-[14px] px-3 py-2 md:py-2.5"
                  style={{
                    background:
                      "linear-gradient(180deg, rgba(255,255,255,0.024), rgba(255,255,255,0.007))",
                    border: "1px solid rgba(242,185,104,0.065)",
                  }}
                >
                  <p
                    className="ori-type-system ori-label-sm mb-1.5"
                    style={{ color: "var(--gold-soft)" }}
                  >
                    {block.label}
                  </p>

                  <div className="space-y-1.5">
                    {block.paragraphs.slice(0, 1).map((paragraph, index) => (
                      <p
                        key={`${layer.number}-${block.label}-${index}`}
                        className="ori-type-reading-soft text-xs leading-relaxed md:text-[13px]"
                        style={{
                          color: "rgba(255,245,235,0.68)",
                          display: "-webkit-box",
                          WebkitBoxOrient: "vertical",
                          WebkitLineClamp: 3,
                          overflow: "hidden",
                        }}
                      >
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {paragraphs.length > 0 && (
            <button
              type="button"
              aria-expanded={isExpanded}
              onClick={() => setIsExpanded((current) => !current)}
              className="mt-2.5 w-fit rounded-full px-3.5 py-2 text-[11px] transition-all hover:translate-y-[-1px] md:mt-3"
              style={{
                background: "rgba(242,185,104,0.075)",
                border: "1px solid rgba(242,185,104,0.14)",
                color: "rgba(242,185,104,0.88)",
              }}
            >
              {isExpanded ? "Recolher leitura" : "Aprofundar leitura"}
            </button>
          )}
        </div>

        {paragraphs.length > 0 && isExpanded && (
          <div className="px-3.5 pb-3.5 md:px-5 md:pb-5">
            <div
              className="grid gap-2.5"
              style={{
                borderTop: "1px solid rgba(242,185,104,0.075)",
                paddingTop: "1rem",
              }}
            >
              <div className="flex items-center justify-between gap-3">
                <p
                  className="ori-type-system ori-label-sm"
                  style={{ color: "var(--gold-soft)" }}
                >
                  Leitura completa da camada
                </p>
                <span
                  className="text-[10px]"
                  style={{ color: "rgba(255,245,235,0.58)" }}
                >
                  {bodyParagraphs.length} trechos
                </span>
              </div>

              {leadParagraph && (
                <div
                  className="rounded-[16px] px-3.5 py-2.5 md:py-3"
                  style={{
                    background:
                      "linear-gradient(90deg, rgba(242,185,104,0.060), rgba(255,255,255,0.010))",
                    border: "1px solid rgba(242,185,104,0.10)",
                    backdropFilter: "blur(8px)",
                    WebkitBackdropFilter: "blur(8px)",
                  }}
                >
                  <p
                    className="ori-type-system ori-label-sm mb-2"
                    style={{ color: "var(--gold-soft)" }}
                  >
                    Síntese principal
                  </p>

                  <p
                    className="ori-type-reading text-sm md:text-[15px] leading-relaxed"
                    style={{ color: "rgba(255,245,235,0.88)" }}
                  >
                    {leadParagraph}
                  </p>
                </div>
              )}

              <div className="grid gap-2.5 lg:grid-cols-2">
                {bodyParagraphs.map((paragraph, index) => (
                  <div
                    key={`${layer.number}-full-${index}`}
                    className="rounded-[16px] px-3.5 py-3"
                    style={{
                      background:
                        "linear-gradient(180deg, rgba(255,255,255,0.026), rgba(255,255,255,0.008))",
                      border: "1px solid rgba(242,185,104,0.075)",
                      boxShadow: "inset 0 0 18px rgba(255,255,255,0.006)",
                    }}
                  >
                    <p
                      className="ori-type-system ori-label-sm mb-2"
                      style={{ color: "var(--gold-soft)" }}
                    >
                      {getReadingAxisLabel(index)}
                    </p>

                    <p
                      className="ori-type-reading-soft text-xs leading-relaxed md:text-[13px]"
                      style={{ color: "rgba(255,245,235,0.70)" }}
                    >
                      {paragraph}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.article>
  );
}

function LayerTabNavigation({ tabs, activeNumber, onSelect }) {
  const activeIndex = Math.max(
    tabs.findIndex((item) => item.number === activeNumber),
    0,
  );
  const activeTab = tabs[activeIndex] || tabs[0];
  const progress =
    tabs.length > 0 ? Math.round(((activeIndex + 1) / tabs.length) * 100) : 0;

  return (
    <div className="relative z-10 mb-3 md:mb-4">
      <div className="mb-2.5 flex flex-col gap-2.5 md:flex-row md:items-end md:justify-between md:gap-3">
        <div>
          <p
            className="ori-type-system ori-label-sm mb-1"
            style={{ color: "var(--gold-soft)" }}
          >
            Camada atual
          </p>
          <p
            className="ori-type-reading-soft text-xs md:text-sm"
            style={{ color: "rgba(255,245,235,0.58)" }}
          >
            {activeTab?.number} · {activeTab?.label}
          </p>
        </div>

        <div className="w-full md:w-48">
          <div className="mb-1.5 flex items-center justify-between">
            <span
              className="text-[10px]"
              style={{ color: "rgba(255,245,235,0.58)" }}
            >
              Progresso
            </span>
            <span className="text-[10px]" style={{ color: "var(--gold-soft)" }}>
              {progress}%
            </span>
          </div>
          <div
            className="ori-progress h-1.5"
            style={{ background: "rgba(255,255,255,0.045)" }}
          >
            <motion.div
              className="h-full rounded-full"
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              style={{
                background:
                  "linear-gradient(90deg, rgba(242,185,104,0.32), rgba(242,185,104,0.95))",
                boxShadow: "0 0 18px rgba(242,185,104,0.18)",
              }}
            />
          </div>
        </div>
      </div>

      <div className="ori-premium-scroll relative flex gap-1.5 overflow-x-auto pb-1 md:gap-2">
        {tabs.map((item, index) => {
          const isActive = activeNumber === item.number;
          const isPast = index < activeIndex;

          return (
            <motion.button
              key={item.number}
              type="button"
              onClick={() => onSelect(item.number)}
              aria-current={isActive ? "step" : undefined}
              aria-label={`Abrir camada ${item.number}: ${item.label}`}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="ori-tab group relative flex min-h-[38px] w-[102px] shrink-0 items-center gap-1.5 overflow-hidden rounded-[13px] px-2 py-1.5 text-left transition-all duration-300 md:min-h-[48px] md:w-[154px] md:gap-2.5 md:rounded-[16px] md:px-3 md:py-2"
              data-state={isActive ? "active" : isPast ? "done" : "sealed"}
              style={{
                background: isActive
                  ? "linear-gradient(90deg, rgba(242,185,104,0.13), rgba(242,185,104,0.035))"
                  : "rgba(255,255,255,0.022)",
                border: isActive
                  ? "1px solid rgba(242,185,104,0.28)"
                  : "1px solid rgba(242,185,104,0.08)",
                boxShadow: isActive
                  ? "0 0 24px rgba(242,185,104,0.075), inset 0 0 18px rgba(242,185,104,0.018)"
                  : "inset 0 0 16px rgba(255,255,255,0.006)",
              }}
            >
              <span
                className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[8px] md:h-7 md:w-7 md:text-[10px]"
                style={{
                  background: isActive
                    ? "var(--gold-primary)"
                    : isPast
                      ? "rgba(242,185,104,0.16)"
                      : "rgba(255,255,255,0.026)",
                  border: isActive
                    ? "1px solid rgba(242,185,104,0.42)"
                    : "1px solid rgba(242,185,104,0.12)",
                  color: isActive ? "#0a0505" : "var(--gold-soft)",
                  fontWeight: 650,
                  boxShadow: isActive
                    ? "0 0 14px rgba(242,185,104,0.18)"
                    : "inset 0 0 10px rgba(255,255,255,0.006)",
                }}
              >
                {item.number}
              </span>

              <p
                className="ori-type-reading-soft text-[10px] leading-tight md:text-xs"
                style={{
                  color: isActive
                    ? "var(--text-primary)"
                    : "rgba(255,245,235,0.62)",
                  fontWeight: isActive ? 620 : 440,
                  display: "-webkit-box",
                  WebkitBoxOrient: "vertical",
                  WebkitLineClamp: 2,
                  overflow: "hidden",
                }}
              >
                {item.label}
              </p>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

function QuizProduto1() {
  const prefersReducedMotion = useReducedMotion();
  const mobileMotionOff = useMobileMotionOff();
  const reduceMotion = prefersReducedMotion || mobileMotionOff;
  const location = useLocation();
  const navigate = useNavigate();
  const isReadingRoute =
    location.pathname.includes("/leitura") ||
    location.pathname === "/quiz-produto-1";
  const isLoadingPreview =
    import.meta.env.DEV &&
    new URLSearchParams(location.search).get("preview") === "loading";

  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [isLoadingResult, setIsLoadingResult] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [hasLoadedStorage, setHasLoadedStorage] = useState(false);
  const [showQuiz, setShowQuiz] = useState(true);
  const [storageKey, setStorageKey] = useState(null);
  const [hasStarted, setHasStarted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [completedLayer, setCompletedLayer] = useState(null);
  const [pendingNextIndex, setPendingNextIndex] = useState(null);
  const [isResettingQuiz, setIsResettingQuiz] = useState(false);
  const [activeResultCore, setActiveResultCore] = useState("estrutura");
  const [activeEstruturaInterna, setActiveEstruturaInterna] = useState("01");
  const [activeSombraVinculos, setActiveSombraVinculos] = useState("05");
  const [activeImagemPresenca, setActiveImagemPresenca] = useState("08");
  const [activeSinteseFinal, setActiveSinteseFinal] = useState("14");
  const [resultReadingCompleted, setResultReadingCompleted] = useState(false);

  const resultRef = useRef(null);
  const loadingRef = useRef(null);
  const quizRef = useRef(null);

  const groupedQuestions = useMemo(() => getGroupedQuestions(), []);
  const blockOrder = useMemo(() => getBlockOrder(), []);

  useEffect(() => {
    async function loadUserStorage() {
      const { data: sessionData } = await supabase.auth.getSession();
      const user = sessionData?.session?.user || null;
      const userStorageKey = getQuizStorageKey(user?.id);

      setStorageKey(userStorageKey);
      localStorage.removeItem(LEGACY_STORAGE_KEY);

      const parsedData = readQuizFromStorage(userStorageKey);
      const savedAnswers = parsedData?.answers || {};
      const hasSavedAnswers = Object.keys(savedAnswers).length > 0;

      if (parsedData) {
        setAnswers(savedAnswers);
        setResult(parsedData.result || null);

        if (parsedData.result) {
          setShowQuiz(false);
          setHasStarted(false);
        } else if (hasSavedAnswers) {
          setCurrentQuestionIndex(getFirstUnansweredIndex(savedAnswers));
        }
      }

      if (user?.id && !parsedData?.result && !hasSavedAnswers) {
        const { data, error } = await supabase
          .from("clientes")
          .select("resultado, arquetipo_principal, arquetipo_secundario")
          .eq("user_id", user.id)
          .maybeSingle();

        if (error) {
          console.log("Erro ao buscar resultado salvo:", error);
        }

        const savedResult = getResultFromCliente(data);

        if (savedResult) {
          setResult(savedResult);
          setShowQuiz(false);
          setHasStarted(false);
        }
      }

      setHasLoadedStorage(true);
    }

    loadUserStorage();
  }, []);

  useEffect(() => {
    if (!hasLoadedStorage || !storageKey) return;

    localStorage.setItem(
      storageKey,
      JSON.stringify({
        answers,
        result,
      }),
    );
  }, [answers, result, hasLoadedStorage, storageKey]);

  useEffect(() => {
    if (!isLoadingResult && !isLoadingPreview) return;

    let currentStep = 0;

    const interval = setInterval(() => {
      currentStep = (currentStep + 1) % loadingMessages.length;
      setLoadingStep(currentStep);
    }, 2000);

    return () => clearInterval(interval);
  }, [isLoadingResult, isLoadingPreview]);

  const totalQuestions = questions.length;
  const answeredQuestions = getAnsweredCount(answers);
  const progress = Math.round((answeredQuestions / totalQuestions) * 100);
  const isComplete = answeredQuestions === totalQuestions;
  const currentQuestion = questions[currentQuestionIndex] || questions[0];

  const saveResultToSupabase = async (resultado) => {
    const { data: sessionData } = await supabase.auth.getSession();
    const user = sessionData?.session?.user;

    if (!user?.email || !user?.id) {
      console.log("Nenhum usuário logado para salvar o resultado.");
      return;
    }

    const { data, error } = await supabase
      .from("clientes")
      .upsert(
        {
          user_id: user.id,
          email: user.email,
          nome: user.user_metadata?.nome || null,
          resultado: resultado.nomeComposto,
          arquetipo_principal: resultado.principal,
          arquetipo_secundario: resultado.secundario,
          status_jornada: "Código das Deusas concluído",
          produto_1_liberado: true,
        },
        {
          onConflict: "email",
        },
      )
      .select();

    console.log("Retorno upsert Supabase:", { data, error });

    if (error) {
      console.log("Erro ao salvar resultado no Supabase:", error);
    }
  };

  const resetResultInSupabase = async () => {
    const { data: sessionData } = await supabase.auth.getSession();
    const user = sessionData?.session?.user;

    if (!user?.id) {
      console.log("Nenhum usuário logado para reiniciar o resultado.");
      return;
    }

    const resetPayload = {
      resultado: null,
      arquetipo_principal: null,
      arquetipo_secundario: null,
      status_jornada: "Código das Deusas reiniciado",
      produto_1_liberado: true,
    };

    const { data, error } = await supabase
      .from("clientes")
      .update(resetPayload)
      .eq("user_id", user.id)
      .select("id");

    if (error) {
      console.log("Erro ao reiniciar resultado no Supabase:", error);
      throw error;
    }

    if (!data?.length && user.email) {
      const { error: emailError } = await supabase
        .from("clientes")
        .update(resetPayload)
        .eq("email", user.email);

      if (emailError) {
        console.log("Erro ao reiniciar resultado por e-mail:", emailError);
        throw emailError;
      }
    }
  };

  const handleStartQuiz = () => {
    setHasStarted(true);
    setShowQuiz(true);
    setCompletedLayer(null);
    setPendingNextIndex(null);
    setCurrentQuestionIndex(getFirstUnansweredIndex(answers));

    setTimeout(() => {
      quizRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 120);
  };

  const advanceFromQuestion = (nextAnswers) => {
    if (!currentQuestion || !nextAnswers[currentQuestion.id]) return;

    const currentBlock = currentQuestion.bloco;
    const nextIndex = currentQuestionIndex + 1;
    const isLastQuestion = currentQuestionIndex === totalQuestions - 1;
    const nextQuestion = questions[nextIndex];
    const shouldShowLayerReveal =
      isLastQuestion || (nextQuestion && nextQuestion.bloco !== currentBlock);

    if (shouldShowLayerReveal) {
      setCompletedLayer(currentBlock);
      setPendingNextIndex(isLastQuestion ? null : nextIndex);

      setTimeout(() => {
        quizRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 80);

      return;
    }

    setCurrentQuestionIndex(nextIndex);
  };

  const handleAnswer = (questionId, value) => {
    const nextAnswers = {
      ...answers,
      [questionId]: value,
    };

    setAnswers(nextAnswers);
    setResult(null);

    setTimeout(() => {
      advanceFromQuestion(nextAnswers);
    }, 360);
  };

  const clearAnswersFromIndex = (questionIndex) => {
    setAnswers((currentAnswers) => {
      const nextAnswers = { ...currentAnswers };

      questions.slice(questionIndex).forEach((question) => {
        delete nextAnswers[question.id];
      });

      return nextAnswers;
    });
    setResult(null);
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex <= 0) return;

    const previousIndex = Math.max(currentQuestionIndex - 1, 0);

    clearAnswersFromIndex(previousIndex);
    setCompletedLayer(null);
    setPendingNextIndex(null);
    setCurrentQuestionIndex(previousIndex);

    setTimeout(() => {
      quizRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 80);
  };

  const handleBackFromLayerReveal = () => {
    clearAnswersFromIndex(currentQuestionIndex);
    setCompletedLayer(null);
    setPendingNextIndex(null);
    setShowQuiz(true);
    setHasStarted(true);

    setTimeout(() => {
      quizRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 80);
  };

  const handleCalculate = () => {
    if (!isComplete) {
      alert("Responda todos os sinais antes de revelar o seu Código ORI.");
      return;
    }

    setResult(null);
    setLoadingStep(0);
    setShowQuiz(false);
    setHasStarted(false);
    setCompletedLayer(null);
    setPendingNextIndex(null);
    setIsLoadingResult(true);

    setTimeout(() => {
      loadingRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }, 100);

    const resultado = calculateResult(questions, answers);

    setTimeout(async () => {
      await saveResultToSupabase(resultado);
      setResult(resultado);
      setIsLoadingResult(false);

      setTimeout(() => {
        resultRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 500);
    }, 8500);
  };

  const handleContinueAfterLayer = () => {
    const isFinalLayer = pendingNextIndex === null;

    if (isFinalLayer) {
      setCompletedLayer(null);
      setPendingNextIndex(null);
      handleCalculate();
      return;
    }

    setCurrentQuestionIndex(pendingNextIndex);
    setCompletedLayer(null);
    setPendingNextIndex(null);

    setTimeout(() => {
      quizRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 80);
  };

  const handleReset = async () => {
    const confirmReset = window.confirm(
      "Deseja refazer a leitura? Suas respostas e resultado serão apagados.",
    );

    if (!confirmReset) return;

    setIsResettingQuiz(true);

    try {
      await resetResultInSupabase();

      if (storageKey) {
        localStorage.removeItem(storageKey);
      }

      localStorage.removeItem(LEGACY_STORAGE_KEY);

      setAnswers({});
      setResult(null);
      setIsLoadingResult(false);
      setLoadingStep(0);
      setShowQuiz(true);
      setHasStarted(false);
      setCurrentQuestionIndex(0);
      setCompletedLayer(null);
      setPendingNextIndex(null);

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } catch (error) {
      console.log("Não foi possível reiniciar a leitura:", error);
      alert(
        "Não foi possível reiniciar sua leitura agora. Tente novamente em instantes.",
      );
    } finally {
      setIsResettingQuiz(false);
    }
  };

  const baseReport = result ? reports[result.nomeComposto] : null;
  const report = useMemo(
    () =>
      enrichReportWithSignals({
        report: baseReport,
        questions,
        answers,
        result,
      }),
    [answers, baseReport, result],
  );
  const archetypeVisual = result ? archetypeImages[result.nomeComposto] : null;
  const estruturaInternaTabs = report
    ? [
        {
          number: "01",
          theme: "gold",
          eyebrow: "Reconhecimento",
          label: "Reconhecimento",
          title: "O que existe por \ntrás da sua presença",
          description:
            "Esta etapa revela os padrões sutis que moldam a forma como você ocupa o mundo e é percebida à sua volta.",
          content: report.reconhecimento,
          image: "/images/panels/reconhecimento.png",
        },
        {
          number: "02",
          theme: "purple",
          eyebrow: "Essência",
          label: "Essência",
          title: "A natureza da sua\ncomposição simbólica",
          description:
            "Aqui começa a leitura da estrutura arquetípica \nque sustenta sua presença, desejos e expressão.",
          content: report.essencia,
          image: "/images/panels/essencia.png",
        },
        {
          number: "03",
          theme: "silver",
          eyebrow: "Dinâmica Psíquica",
          label: "Dinâmica psíquica",
          title: "Como sua energia \nfunciona internamente",
          description:
            "Esta camada revela como sua psique reage, \nsente, protege e se movimenta diante do mundo.",
          content: report.dinamica,
          image: "/images/panels/dinamica-psiquica.png",
        },
        {
          number: "04",
          theme: "red",
          eyebrow: "Percepção",
          label: "Percepção",
          title: "Como você tende \na ser percebida",
          description:
            "Sua imagem não comunica apenas aparência. \nEla ativa sensações, leituras e projeções.",
          content: report.percebida,
          image: "/images/panels/percepcao.png",
        },
      ]
    : [];
  const sombraVinculosTabs = report
    ? [
        {
          number: "05",
          theme: "cyan",
          eyebrow: "Sombra",
          label: "Sombra",
          title: "O que pode \nenfraquecer sua presença",
          description:
            "Todo arquétipo possui excessos, compensações \ne mecanismos de defesa inconscientes.",
          content: report.sombra,
          image: "/images/panels/sombra.png",
        },
        {
          number: "06",
          theme: "green",
          eyebrow: "Padrão Relacional",
          label: "Padrão relacional",
          title: "Como você vive \nvínculos e conexões",
          description:
            "Esta leitura mostra como sua energia \ncria aproximação, intimidade e pertencimento.",
          content: report.padraoRelacional,
          image: "/images/panels/padrao-relacional.png",
        },
        {
          number: "07",
          theme: "gold",
          eyebrow: "Individuação",
          label: "Individuação",
          title: "Seu caminho de \nevolução simbólica",
          description:
            "Aqui começa o movimento onde sua \nimagem deixa de compensar e começa a revelar.",
          content: report.caminho,
          image: "/images/panels/individuacao.png",
        },
      ]
    : [];
  const imagemPresencaTabs = report
    ? [
        {
          number: "08",
          theme: "purple",
          eyebrow: "Essência de Imagem",
          label: "Essência de imagem",
          title: "Como sua estética \nfunciona melhor",
          description:
            "Sua estética ideal nasce quando sua \nimagem traduz sua energia sem esforço.",
          content: report.essenciaImagem,
          image: "/images/panels/essencia-imagem.png",
        },
        {
          number: "09",
          theme: "silver",
          eyebrow: "Paleta",
          label: "Paleta",
          title: "Cores que \namplificam sua presença",
          description:
            "As cores certas reforçam sua atmosfera \nnatural e aumentam sua coerência visual.",
          content: report.paleta,
          image: "/images/panels/paleta.png",
        },
        {
          number: "10",
          theme: "red",
          eyebrow: "Modelagem",
          label: "Modelagem",
          title: "Estruturas \ne caimentos ideais",
          description:
            "As formas que você veste alteram \ndiretamente a percepção da sua energia.",
          content: report.modelagem,
          image: "/images/panels/modelagem.png",
        },
        {
          number: "11",
          theme: "cyan",
          eyebrow: "Tecidos",
          label: "Tecidos",
          title: "Texturas que conversam \ncom sua energia",
          description:
            "Cada tecido cria uma sensação \nvisual, tátil e simbólica diferente.",
          content: report.tecidos,
          image: "/images/panels/tecidos.png",
        },
        {
          number: "12",
          theme: "green",
          eyebrow: "Beleza",
          label: "Beleza",
          title: "Expressão visual \ne acabamento",
          description:
            "Sua beleza funciona melhor quando \namplifica sua essência ao invés de escondê-la.",
          content: report.beleza,
          image: "/images/panels/beleza.png",
        },
        {
          number: "13",
          theme: "gold",
          eyebrow: "Presença",
          label: "Presença",
          title: "A forma como sua \nenergia ocupa o espaço",
          description:
            "Presença não é excesso. É coerência \nentre corpo, imagem e energia.",
          content: report.presenca,
          image: "/images/panels/presenca.png",
        },
      ]
    : [];
  const sinteseFinalTabs = report
    ? [
        {
          number: "14",
          theme: "purple",
          eyebrow: "Evitar",
          label: "Evitar",
          title: "O que pode \nenfraquecer sua imagem",
          description:
            "Alguns elementos estéticos rompem sua coerência simbólica e enfraquecem sua presença.",
          content: Array.isArray(report.evitar)
            ? report.evitar.join("\n")
            : report.evitar,
          image: "/images/panels/evitar.png",
        },
        {
          number: "15",
          theme: "silver",
          eyebrow: "Fórmula",
          label: "Fórmula",
          title: "A síntese simbólica \nda sua imagem",
          description:
            "Sua fórmula estética traduz visualmente \na essência da sua composição arquetípica.",
          content: report.formula,
          image: "/images/panels/formula.png",
        },
        {
          number: "16",
          theme: "red",
          eyebrow: "Leitura Final",
          label: "Leitura final",
          title: "Sua imagem começa \na revelar sua essência",
          description:
            "A etapa final revela o ponto onde presença, \nimagem e identidade começam a se alinhar.",
          content: report.leituraFinal,
          image: "/images/panels/leitura-final.png",
        },
      ]
    : [];
  const activeEstruturaInternaTab =
    estruturaInternaTabs.find(
      (item) => item.number === activeEstruturaInterna,
    ) || estruturaInternaTabs[0];
  const activeSombraVinculosTab =
    sombraVinculosTabs.find((item) => item.number === activeSombraVinculos) ||
    sombraVinculosTabs[0];
  const activeImagemPresencaTab =
    imagemPresencaTabs.find((item) => item.number === activeImagemPresenca) ||
    imagemPresencaTabs[0];
  const activeSinteseFinalTab =
    sinteseFinalTabs.find((item) => item.number === activeSinteseFinal) ||
    sinteseFinalTabs[0];
  const resultCoreTabs = [
    {
      id: "estrutura",
      number: "01",
      title: "Estrutura Interna",
      text: "Reconhecimento, essência, dinâmica e percepção.",
    },
    {
      id: "sombra",
      number: "02",
      title: "Sombra e Vínculos",
      text: "Sombra, padrão relacional e individuação.",
    },
    {
      id: "imagem",
      number: "03",
      title: "Imagem e Presença",
      text: "Essência visual, manual estético e presença.",
    },
    {
      id: "sintese",
      number: "04",
      title: "Síntese Final",
      text: "O que evitar, fórmula e leitura final.",
    },
  ];
  const activeResultCoreIndex = resultCoreTabs.findIndex(
    (item) => item.id === activeResultCore,
  );
  const activeResultCoreTab =
    resultCoreTabs.find((item) => item.id === activeResultCore) ||
    resultCoreTabs[0];
  const previousResultCore = resultCoreTabs[activeResultCoreIndex - 1] || null;
  const nextResultCore = resultCoreTabs[activeResultCoreIndex + 1] || null;
  const resultCoreLayerState = {
    estrutura: {
      tabs: estruturaInternaTabs,
      activeNumber: activeEstruturaInterna,
      setActiveNumber: setActiveEstruturaInterna,
    },
    sombra: {
      tabs: sombraVinculosTabs,
      activeNumber: activeSombraVinculos,
      setActiveNumber: setActiveSombraVinculos,
    },
    imagem: {
      tabs: imagemPresencaTabs,
      activeNumber: activeImagemPresenca,
      setActiveNumber: setActiveImagemPresenca,
    },
    sintese: {
      tabs: sinteseFinalTabs,
      activeNumber: activeSinteseFinal,
      setActiveNumber: setActiveSinteseFinal,
    },
  };
  const activeResultLayerState = resultCoreLayerState[activeResultCore];
  const activeResultLayerIndex =
    activeResultLayerState?.tabs.findIndex(
      (item) => item.number === activeResultLayerState.activeNumber,
    ) ?? -1;
  const hasNextResultLayer =
    activeResultLayerIndex >= 0 &&
    activeResultLayerIndex < activeResultLayerState.tabs.length - 1;
  const isLastResultLayerOfLastCore =
    activeResultCore === "sintese" && !hasNextResultLayer;
  const resultFlowLabel = hasNextResultLayer
    ? "Próxima camada"
    : nextResultCore
      ? "Avançar para o próximo núcleo"
      : "Concluir minha leitura";
  const resultFlowText = hasNextResultLayer
    ? "Continue pelas camadas deste núcleo antes de avançar para a próxima etapa."
    : nextResultCore
      ? `Este núcleo foi atravessado. Agora você pode seguir para ${nextResultCore.title}.`
      : resultReadingCompleted
        ? "Sua primeira leitura foi concluída. O próximo movimento é traduzir essa força no Dossiê ORI."
        : "Você chegou à última camada da sua primeira leitura.";

  const handleResultFlowNext = () => {
    if (!activeResultLayerState) return;

    if (hasNextResultLayer) {
      const nextLayer =
        activeResultLayerState.tabs[activeResultLayerIndex + 1]?.number;

      if (nextLayer) {
        activeResultLayerState.setActiveNumber(nextLayer);
      }

      return;
    }

    if (nextResultCore) {
      setActiveResultCore(nextResultCore.id);

      const nextLayerState = resultCoreLayerState[nextResultCore.id];
      const firstLayer = nextLayerState?.tabs?.[0]?.number;

      if (firstLayer) {
        nextLayerState.setActiveNumber(firstLayer);
      }

      return;
    }

    if (isLastResultLayerOfLastCore) {
      setResultReadingCompleted(true);
    }
  };

  if (!isReadingRoute) {
    return (
      <div className="max-w-6xl mx-auto">
        <QuizHero onPrimaryAction={() => navigate("/produto-1/leitura")} />

        {result && (
          <section
            className="ori-main-frame ori-card-protagonist mt-5 mb-6 rounded-[24px] md:mt-8 md:mb-10 md:rounded-[42px] p-4 md:p-8"
            data-state="revealed"
            style={{
              backgroundColor: "rgba(5,2,2,0.92)",
              backgroundImage: ORACLE_PANEL_BACKGROUND,
              backgroundSize: "cover",
              backgroundPosition: "center",
              border: "1px solid rgba(242,185,104,0.13)",
              boxShadow:
                "0 0 70px rgba(242,185,104,0.035), inset 0 0 44px rgba(255,255,255,0.010)",
            }}
          >
            <Eyebrow line className="mb-4">Leitura já revelada</Eyebrow>

            <h2
              className="ori-type-revelation text-3xl md:text-5xl mb-4"
              style={{
                color: colors.gold,
                fontWeight: 680,
                letterSpacing: "-0.065em",
              }}
            >
              Seu Código das Deusas já foi nomeado.
            </h2>

            <p
              className="ori-mobile-preview-3 ori-type-reading-soft text-sm md:text-base max-w-3xl mb-5 md:mb-6"
              style={{ color: colors.soft }}
            >
              Sua primeira camada já está salva no Portal ORI. Você pode acessar
              o Espelho ORI para ver a jornada aberta ou refazer a leitura se
              quiser reiniciar seus sinais.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                to="/espelho-ori"
                className="ori-journey-action inline-flex justify-center px-7 py-3.5 rounded-full text-sm"
                style={{
                  background: colors.gold,
                  color: "#090506",
                  fontWeight: 700,
                  boxShadow:
                    "0 0 38px rgba(242,185,104,0.16), inset 0 0 16px rgba(255,255,255,0.16)",
                }}
              >
                Ver meu Espelho ORI
              </Link>

              <button
                type="button"
                onClick={handleReset}
                disabled={isResettingQuiz}
                className="ori-button-secondary inline-flex justify-center px-7 py-3.5 text-sm disabled:opacity-60 disabled:cursor-not-allowed"
                style={{
                  background: "rgba(255,255,255,0.026)",
                  border: "1px solid rgba(242,185,104,0.14)",
                  color: colors.soft,
                }}
              >
                {isResettingQuiz ? "Reiniciando leitura..." : "Refazer leitura"}
              </button>
            </div>
          </section>
        )}
      </div>
    );
  }

  return (
    <main
      className="ori-atmosphere ori-atmosphere-reading relative min-h-screen overflow-hidden px-4 py-5 md:px-7 md:py-6"
      style={{ color: colors.text }}
    >
      <div
        className="fixed inset-0 -z-20"
        style={{
          background:
            "radial-gradient(circle at 72% 16%, rgba(242,185,104,0.14), transparent 32%), radial-gradient(circle at 12% 82%, rgba(183,140,255,0.10), transparent 34%), linear-gradient(180deg, rgba(5,2,2,0.86), rgba(5,2,2,0.96))",
        }}
      />

      <div
        className="fixed inset-0 -z-10 pointer-events-none opacity-[0.026]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(242,185,104,0.18) 1px, transparent 1px), linear-gradient(90deg, rgba(242,185,104,0.08) 1px, transparent 1px)",
          backgroundSize: "82px 82px",
        }}
      />

      {showQuiz && hasStarted && !result && (
        <div className="fixed left-0 right-0 top-0 z-50 h-px bg-transparent">
          <motion.div
            className="h-px"
            initial={false}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            style={{
              background: "var(--gold-primary)",
              boxShadow: "0 0 10px var(--gold-primary)",
            }}
          />
        </div>
      )}

      <div className="relative z-10 w-full max-w-6xl mx-auto">
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5">
          <Link
            to="/produto-1"
            className="inline-flex w-fit items-center gap-3 px-5 py-2.5 rounded-full text-sm"
            style={{
              background: "rgba(255,255,255,0.026)",
              border: "1px solid rgba(242,185,104,0.12)",
              color: "rgba(255,245,235,0.72)",
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
            }}
          >
            <span style={{ color: colors.gold }}>←</span>
            Voltar ao Produto 1
          </Link>

          <div
            className="inline-flex w-fit items-center gap-2 px-4 py-2 rounded-full text-[10px] uppercase tracking-[0.22em]"
            style={{
              background: "rgba(255,255,255,0.022)",
              border: "1px solid rgba(242,185,104,0.10)",
              color: "rgba(242,185,104,0.72)",
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
            }}
          >
            Câmara de Leitura ORI
          </div>
        </header>

        {(isLoadingResult || isLoadingPreview) && (
          <LoadingDossie
            loadingStep={loadingStep}
            loadingRef={loadingRef}
            reduceMotion={reduceMotion}
          />
        )}

        {showQuiz && !result && !isLoadingPreview && (
          <div ref={quizRef} className="scroll-mt-8">
            {!hasStarted && (
              <QuizIntro
                onStart={handleStartQuiz}
                answeredQuestions={answeredQuestions}
                totalQuestions={totalQuestions}
                reduceMotion={reduceMotion}
              />
            )}

            <AnimatePresence mode="wait">
              {hasStarted && completedLayer && (
                <LayerReveal
                  key={`layer-${completedLayer}`}
                  bloco={completedLayer}
                  isFinalBlock={pendingNextIndex === null}
                  onContinue={handleContinueAfterLayer}
                  onBack={handleBackFromLayerReveal}
                  reduceMotion={reduceMotion}
                />
              )}

              {hasStarted && !completedLayer && currentQuestion && (
                <QuizQuestionView
                  currentQuestion={currentQuestion}
                  currentQuestionIndex={currentQuestionIndex}
                  totalQuestions={totalQuestions}
                  answers={answers}
                  onAnswer={handleAnswer}
                  onBack={handlePreviousQuestion}
                  groupedQuestions={groupedQuestions}
                  blockOrder={blockOrder}
                  progress={progress}
                  answeredQuestions={answeredQuestions}
                  reduceMotion={reduceMotion}
                />
              )}
            </AnimatePresence>
          </div>
        )}

        {result && !isLoadingPreview && (
          <>
            <div className="mt-4 fade-up">
              <div ref={resultRef} className="scroll-mt-10">
                <ResultHero
                  nome={result.nomeComposto}
                  principal={result.principal}
                  secundario={result.secundario}
                  frase={report?.fraseHero}
                  imagem={archetypeVisual?.image}
                />
              </div>

              {report ? (
                <div
                  className="ori-main-frame ori-card-secondary relative overflow-hidden rounded-[24px] p-3 md:rounded-[30px] md:p-4"
                  style={{
                    background:
                      "radial-gradient(circle at top right, rgba(242,185,104,0.09), transparent 34%), linear-gradient(180deg, rgba(18,9,10,0.64), rgba(5,2,2,0.88))",
                    border: "1px solid rgba(242,185,104,0.10)",
                    boxShadow:
                      "0 0 48px rgba(242,185,104,0.032), inset 0 0 28px rgba(255,255,255,0.010)",
                    backdropFilter: "blur(12px)",
                    WebkitBackdropFilter: "blur(12px)",
                  }}
                >
                  <div
                    className="absolute inset-0 pointer-events-none opacity-[0.02]"
                    style={{
                      backgroundImage:
                        "linear-gradient(rgba(242,185,104,0.14) 1px, transparent 1px), linear-gradient(90deg, rgba(242,185,104,0.06) 1px, transparent 1px)",
                      backgroundSize: "52px 52px",
                    }}
                  />

                  <section className="relative z-10 pb-3">
                    <div className="relative z-10">
                      <div className="ori-label-line mb-2.5 md:mb-3">
                        <p
                          className="ori-type-system text-[9px] md:text-[10px]"
                          style={{ color: "var(--gold-soft)" }}
                        >
                          Navegação da Leitura
                        </p>
                      </div>

                      <div className="ori-premium-scroll flex gap-2 overflow-x-auto pb-1 md:grid md:grid-cols-4 md:overflow-visible md:pb-0">
                        {resultCoreTabs.map((item) => {
                          const isActive = activeResultCore === item.id;

                          return (
                            <button
                              key={item.number}
                              type="button"
                              onClick={() => setActiveResultCore(item.id)}
                              className="ori-tab min-w-[136px] shrink-0 rounded-[15px] px-2.5 py-2 text-left transition-all duration-500 hover:-translate-y-0.5 md:min-w-0 md:rounded-[16px] md:px-3 md:py-2.5"
                              data-state={isActive ? "active" : "sealed"}
                              style={{
                                background: isActive
                                  ? "rgba(242,185,104,0.085)"
                                  : "rgba(255,255,255,0.022)",
                                border: isActive
                                  ? "1px solid rgba(242,185,104,0.22)"
                                  : "1px solid rgba(242,185,104,0.08)",
                                boxShadow: isActive
                                  ? "0 0 28px rgba(242,185,104,0.060), inset 0 0 18px rgba(242,185,104,0.018)"
                                  : "inset 0 0 18px rgba(242,185,104,0.012), 0 0 18px rgba(0,0,0,0.14)",
                              }}
                            >
                              <div className="flex min-w-0 items-center gap-2 md:gap-2.5">
                                <div
                                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[11px] md:h-8 md:w-8 md:rounded-[12px]"
                                  style={{
                                    background:
                                      "linear-gradient(180deg, rgba(255,255,255,0.026), rgba(255,255,255,0.008))",
                                    border: isActive
                                      ? "1px solid rgba(242,185,104,0.22)"
                                      : "1px solid rgba(242,185,104,0.08)",
                                    color: isActive
                                      ? "var(--gold-primary)"
                                      : "rgba(242,185,104,0.88)",
                                    boxShadow: isActive
                                      ? "0 0 18px rgba(242,185,104,0.10)"
                                      : "0 0 14px rgba(242,185,104,0.03)",
                                  }}
                                >
                                  <span className="text-xs font-medium tracking-[-0.02em] md:text-sm md:tracking-[-0.06em]">
                                    {item.number}
                                  </span>
                                </div>

                                <h3
                                  className="ori-type-revelation min-w-0 text-xs md:text-[15px]"
                                  style={{
                                    color: "var(--text-primary)",
                                    fontWeight: isActive ? 620 : 440,
                                    letterSpacing: "-0.025em",
                                  }}
                                >
                                  {item.title}
                                </h3>
                              </div>
                            </button>
                          );
                        })}
                      </div>

                      <div
                        className="mt-2.5 rounded-[15px] px-3 py-2.5 md:mt-3 md:rounded-[16px] md:px-3.5 md:py-3"
                        style={{
                          background:
                            "linear-gradient(90deg, rgba(242,185,104,0.050), rgba(255,255,255,0.012))",
                          border: "1px solid rgba(242,185,104,0.075)",
                        }}
                      >
                        <p
                          className="ori-mobile-preview-3 ori-type-reading-soft text-xs md:text-sm"
                          style={{ color: "rgba(255,245,235,0.66)" }}
                        >
                          {activeResultCoreTab.text}
                        </p>
                      </div>
                    </div>
                  </section>

                  {activeResultCore === "estrutura" && (
                    <>
                      <section
                        id="nucleo-estrutura-interna"
                        className="relative z-10 overflow-hidden pt-3"
                        style={{
                          background: "transparent",
                        }}
                      >
                        <LayerTabNavigation
                          tabs={estruturaInternaTabs}
                          activeNumber={activeEstruturaInterna}
                          onSelect={setActiveEstruturaInterna}
                        />

                        <AnimatePresence mode="wait">
                          {activeEstruturaInternaTab && (
                            <ReadingLayerPanel
                              key={activeEstruturaInternaTab.number}
                              layer={activeEstruturaInternaTab}
                            />
                          )}
                        </AnimatePresence>
                      </section>
                    </>
                  )}

                  {activeResultCore === "sombra" && (
                    <>
                      <section
                        id="nucleo-sombra-vinculos"
                        className="relative z-10 overflow-hidden pt-3"
                        style={{
                          background: "transparent",
                        }}
                      >
                        <LayerTabNavigation
                          tabs={sombraVinculosTabs}
                          activeNumber={activeSombraVinculos}
                          onSelect={setActiveSombraVinculos}
                        />

                        <AnimatePresence mode="wait">
                          {activeSombraVinculosTab && (
                            <ReadingLayerPanel
                              key={activeSombraVinculosTab.number}
                              layer={activeSombraVinculosTab}
                            />
                          )}
                        </AnimatePresence>
                      </section>
                    </>
                  )}

                  {activeResultCore === "imagem" && (
                    <>
                      <section
                        id="nucleo-imagem-presenca"
                        className="relative z-10 overflow-hidden pt-3"
                        style={{
                          background: "transparent",
                        }}
                      >
                        <LayerTabNavigation
                          tabs={imagemPresencaTabs}
                          activeNumber={activeImagemPresenca}
                          onSelect={setActiveImagemPresenca}
                        />

                        <AnimatePresence mode="wait">
                          {activeImagemPresencaTab && (
                            <ReadingLayerPanel
                              key={activeImagemPresencaTab.number}
                              layer={activeImagemPresencaTab}
                            />
                          )}
                        </AnimatePresence>
                      </section>
                    </>
                  )}

                  {activeResultCore === "sintese" && (
                    <>
                      <section
                        id="nucleo-sintese-final"
                        className="relative z-10 overflow-hidden pt-3"
                        style={{
                          background: "transparent",
                        }}
                      >
                        <LayerTabNavigation
                          tabs={sinteseFinalTabs}
                          activeNumber={activeSinteseFinal}
                          onSelect={setActiveSinteseFinal}
                        />

                        <AnimatePresence mode="wait">
                          {activeSinteseFinalTab && (
                            <ReadingLayerPanel
                              key={activeSinteseFinalTab.number}
                              layer={activeSinteseFinalTab}
                            />
                          )}
                        </AnimatePresence>
                      </section>
                    </>
                  )}

                  <section
                    className="mt-3 flex flex-col gap-3 rounded-[18px] p-3 md:mt-5 md:flex-row md:items-center md:justify-between md:gap-4 md:rounded-[22px] md:p-4"
                    style={{
                      background:
                        "linear-gradient(180deg, rgba(18,9,10,0.58), rgba(5,2,2,0.82))",
                      border: "1px solid rgba(242,185,104,0.10)",
                      boxShadow: "inset 0 0 24px rgba(255,255,255,0.010)",
                    }}
                  >
                    <div>
                      <p
                        className="mb-1.5 text-[9px] uppercase tracking-[0.22em] md:mb-2 md:tracking-[0.28em]"
                        style={{ color: "var(--gold-soft)" }}
                      >
                        Fluxo da leitura
                      </p>
                      <p
                        className="ori-mobile-preview-3 text-[13px] leading-relaxed md:text-base"
                        style={{ color: "rgba(255,245,235,0.68)" }}
                      >
                        {resultFlowText}
                      </p>
                    </div>

                    <div className="flex flex-col gap-2.5 sm:flex-row md:gap-3">
                      {previousResultCore && (
                        <button
                          type="button"
                          onClick={() =>
                            setActiveResultCore(previousResultCore.id)
                          }
                          className="rounded-full px-5 py-2.5 text-sm md:py-3"
                          style={{
                            background: "rgba(255,255,255,0.026)",
                            border: "1px solid rgba(242,185,104,0.10)",
                            color: "rgba(255,245,235,0.68)",
                          }}
                        >
                          Núcleo anterior
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={handleResultFlowNext}
                        className="ori-journey-action rounded-full px-6 py-2.5 text-sm md:py-3"
                        style={{
                          background:
                            "linear-gradient(90deg, var(--copper-primary), var(--gold-primary))",
                          color: "#090506",
                          fontWeight: 700,
                          boxShadow:
                            "0 0 34px rgba(210,135,70,0.16), inset 0 0 14px rgba(255,255,255,0.16)",
                        }}
                      >
                        {resultFlowLabel}
                      </button>
                    </div>
                  </section>

                  {resultReadingCompleted && <NextStepCard />}
                </div>
              ) : (
                <div
                  className="rounded-[40px] p-10"
                  style={{
                    background:
                      "linear-gradient(180deg, rgba(18,9,10,0.98), rgba(7,3,4,1))",
                    border: "1px solid var(--border-primary)",
                  }}
                >
                  <p style={{ color: "var(--text-soft)" }}>
                    Relatório completo ainda não cadastrado para este resultado.
                  </p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </main>
  );
}

export default QuizProduto1;
