import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

import { calculateResult } from "../services/calculateResult";
import {
  calculateQuizResult,
  completeProduto1,
  getProduto1Reading,
  getProduto1Answers,
  getProduto1Feedback,
  resetProduto1,
  saveProduto1Answers,
  saveProduto1Feedback,
} from "../services/api";
import { enrichReportWithSignals } from "../services/analyzeReadingSignals";
import { archetypeImages } from "../data/archetypeImages";
import { supabase } from "../lib/supabaseClient";
import { useProduto1Catalog } from "../hooks/useProduto1Catalog";

import QuizHero from "../components/QuizHero";
import ResultHero from "../components/ResultHero";
import NextStepCard from "../components/NextStepCard";
import SyncNotice from "../components/SyncNotice";

const LEGACY_STORAGE_KEY = "ori_produto_1_quiz";
const ORACLE_PANEL_BACKGROUND =
  "radial-gradient(circle at 88% 12%, rgba(242,185,104,0.09), transparent 34%), radial-gradient(circle at 8% 92%, rgba(183,140,255,0.05), transparent 34%), linear-gradient(90deg, rgba(5,2,2,0.88), rgba(5,2,2,0.68), rgba(5,2,2,0.92)), url('/images/espelho-ori/oraculo/fundo-oraculo-premium.png')";
const FEEDBACK_CONTEXT = "produto-1-leitura";

const FEEDBACK_OPTIONS = [
  {
    id: "me_senti_vista",
    label: "Me senti vista",
    text: "A leitura encontrou algo real em mim.",
  },
  {
    id: "fez_sentido_mas_abstrato",
    label: "Fez sentido, mas ficou abstrato",
    text: "Entendi a direção, mas queria mais clareza prática.",
  },
  {
    id: "nao_me_reconheci",
    label: "Não me reconheci muito",
    text: "A leitura ainda não pareceu minha.",
  },
];

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

const getResultFromCliente = (cliente, reports) => {
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

const syncCachedReadingToAccount = async ({ user, answers, result }) => {
  if (!user?.id || !result?.nomeComposto) return;

  const hasAnswers = Object.keys(answers || {}).length > 0;

  if (hasAnswers) {
    await saveProduto1Answers(answers);
  }

  const { error } = await supabase.from("clientes").upsert(
    {
      user_id: user.id,
      email: user.email || null,
      nome: user.user_metadata?.nome || null,
      resultado: result.nomeComposto,
      arquetipo_principal: result.principal,
      arquetipo_secundario: result.secundario,
      status_jornada: "Código das Deusas concluído",
      produto_1_liberado: true,
    },
    {
      onConflict: "email",
    },
  );

  if (error) {
    throw error;
  }
};

const fetchClienteByUser = async (user) => {
  if (!user?.id) return null;

  const { data, error } = await supabase
    .from("clientes")
    .select("resultado, arquetipo_principal, arquetipo_secundario")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    console.log("Erro ao buscar resultado salvo:", error);
  }

  if (data || !user.email) {
    return data || null;
  }

  const { data: emailData, error: emailError } = await supabase
    .from("clientes")
    .select("resultado, arquetipo_principal, arquetipo_secundario")
    .ilike("email", user.email)
    .maybeSingle();

  if (emailError) {
    console.log("Erro ao buscar resultado salvo por e-mail:", emailError);
  }

  return emailData || null;
};

const loadingMessages = [
  "Organizando seus primeiros sinais...",
  "Consultando os arquétipos...",
  "Sua leitura está tomando forma...",
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
  "Seu Corpo": "Como seu corpo expressa movimento, conforto e sensação.",
  "Seus Relacionamentos": "Como sua energia cria vínculos, desejo e distância.",
  "Seu Mundo Interno":
    "Como seus padrões internos conduzem escolhas e percepção.",
  "Seus Padrões": "Onde sua imagem mostra força, defesa e repetição.",
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
    reward: "Sua estética começou a mostrar desejo, proteção e linguagem.",
  },
  "Seu Corpo": {
    symbol: "III",
    accent: "rgba(155,231,174,0.95)",
    glow: "rgba(120,255,160,0.18)",
    aura: "radial-gradient(circle at 76% 22%, rgba(120,255,160,0.12), transparent 34%), radial-gradient(circle at 14% 82%, rgba(242,185,104,0.10), transparent 34%)",
    reward: "Seu corpo entrou na leitura como ritmo, conforto e sensação.",
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
    reward: "Seu mundo interno começou a ganhar nome e contorno.",
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
  reward: "O ORI registrou mais uma resposta importante da sua leitura.",
};

const blockRevealTexts = {
  "Sua Presença": {
    title: "Primeiro sinal organizado",
    text: "Sua leitura começou a perceber como sua energia chega no mundo antes mesmo das palavras. O espelho já captou um primeiro traço da sua presença.",
  },
  "Seu Estilo": {
    title: "Segundo sinal organizado",
    text: "Um padrão estético começou a aparecer. Ainda não é a imagem final, mas já existe uma direção entre desejo, proteção e forma.",
  },
  "Seu Corpo": {
    title: "Terceiro sinal organizado",
    text: "O corpo começou a entrar na leitura. Movimento, postura, toque e sensação ajudam o ORI a entender como sua presença se materializa.",
  },
  "Seus Relacionamentos": {
    title: "Quarto sinal organizado",
    text: "Agora o espelho percebe como você se aproxima, se protege, deseja, cuida ou preserva distância nos vínculos.",
  },
  "Seu Mundo Interno": {
    title: "Quinto sinal organizado",
    text: "Seu mundo interno começou a ganhar contorno. Suas escolhas, medos, desejos e formas de controle já estão desenhando uma estrutura simbólica.",
  },
  "Seus Padrões": {
    title: "Último sinal organizado",
    text: "Suas respostas já formam uma direção. O ORI agora cruza seus sinais para nomear seu Código das Deusas.",
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

function getGroupedQuestions(questions) {
  return questions.reduce((groups, question) => {
    if (!groups[question.bloco]) groups[question.bloco] = [];
    groups[question.bloco].push(question);
    return groups;
  }, {});
}

function getBlockOrder(questions) {
  return [...new Set(questions.map((question) => question.bloco))];
}

function getFirstUnansweredIndex(questions, answers) {
  const firstUnanswered = questions.findIndex(
    (question) => !answers[question.id],
  );
  return firstUnanswered === -1 ? questions.length - 1 : firstUnanswered;
}

function getAnsweredCount(questions, answers) {
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

function ReadingBootState({ reduceMotion }) {
  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0 }}
      animate={reduceMotion ? undefined : { opacity: 1 }}
      transition={{ duration: 0.28 }}
      className="relative flex min-h-[58vh] items-center justify-center px-6 pb-16 text-center"
      aria-live="polite"
      aria-busy="true"
    >
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 h-52 w-52 -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl"
        style={{
          background:
            "radial-gradient(circle, rgba(242,185,104,0.09), transparent 68%)",
        }}
      />

      <div className="relative">
        <motion.div
          className="relative mx-auto mb-7 flex h-14 w-14 items-center justify-center rounded-full"
          style={{
            border: "1px solid rgba(242,185,104,0.18)",
            background: "rgba(242,185,104,0.025)",
            boxShadow:
              "0 0 38px rgba(242,185,104,0.08), inset 0 0 24px rgba(242,185,104,0.035)",
          }}
          animate={
            reduceMotion
              ? undefined
              : {
                  scale: [1, 1.045, 1],
                  opacity: [0.72, 1, 0.72],
                }
          }
          transition={{
            duration: 2.2,
            ease: "easeInOut",
            repeat: Infinity,
          }}
        >
          <span
            className="ori-type-system text-[11px] tracking-[0.22em]"
            style={{ color: colors.goldSoft }}
          >
            ORI
          </span>
        </motion.div>

        <h1
          className="ori-type-revelation text-2xl md:text-3xl"
          style={{ color: colors.gold }}
        >
          Abrindo sua leitura...
        </h1>
        <p
          className="ori-type-reading-soft mt-3 text-xs md:text-sm"
          style={{ color: "rgba(255,245,235,0.50)" }}
        >
          Só um instante.
        </p>
      </div>
    </motion.div>
  );
}

function CatalogUnavailableState() {
  return (
    <section
      className="ori-main-frame ori-card-secondary relative mx-auto my-8 max-w-3xl overflow-hidden rounded-[24px] p-5 text-center md:rounded-[30px] md:p-7"
      style={{
        background:
          "linear-gradient(180deg, rgba(18,9,10,0.74), rgba(5,2,2,0.92))",
        border: "1px solid rgba(242,185,104,0.12)",
      }}
    >
      <p
        className="ori-type-system mb-3 text-[10px]"
        style={{ color: "var(--gold-soft)" }}
      >
        Leitura indisponível
      </p>
      <h2
        className="ori-type-revelation text-2xl"
        style={{ color: "var(--gold-primary)", fontWeight: 620 }}
      >
        Não conseguimos abrir as perguntas agora.
      </h2>
      <p
        className="ori-type-reading-soft mt-3 text-sm"
        style={{ color: "var(--text-soft)" }}
      >
        Tente novamente em instantes. Se você já tinha iniciado a leitura neste
        dispositivo, vamos usar o cache assim que ele estiver disponível.
      </p>
    </section>
  );
}

function LoadingDossie({ loadingRef, reduceMotion }) {
  const analysisSteps = [
    {
      label: "Primeiros sinais",
      detail: "primeiros sinais",
      title: "Organizando seus primeiros sinais...",
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
      label: "Mundo interno",
      detail: "núcleo interno",
      title: "Cruzando seu núcleo...",
      note: "As respostas começam a ganhar uma direção.",
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
      <video
        aria-hidden="true"
        className="absolute inset-0 h-full w-full object-cover opacity-70 pointer-events-none"
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
      text: "A leitura identifica a força principal, a força secundária e a composição que organiza sua imagem por dentro.",
    },
    {
      title: "Reconhecer",
      text: "O método observa desejo, proteção, sombra, vínculos e repetição para entender o que sustenta sua imagem por dentro.",
    },
    {
      title: "Abrir caminho",
      text: "O resultado cria a base para o Espelho ORI e para os próximos passos: corpo, cor, cabelo, beleza e guarda-roupa real.",
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

          <div
            className="mt-5 grid gap-2.5 rounded-[20px] p-3.5 sm:hidden"
            style={{
              background:
                "linear-gradient(180deg, rgba(255,255,255,0.034), rgba(255,255,255,0.010))",
              border: "1px solid rgba(242,185,104,0.10)",
              boxShadow: "inset 0 0 22px rgba(255,255,255,0.010)",
            }}
          >
            <p
              className="ori-type-system text-[8px]"
              style={{ color: "var(--gold-soft)" }}
            >
              O que você vai entender
            </p>

            <div className="grid grid-cols-3 gap-2">
              {["Como você chega", "Sua base", "Direção inicial"].map((item) => (
                <span
                  key={item}
                  className="rounded-full px-2 py-2 text-center text-[11px]"
                  style={{
                    background: "rgba(255,255,255,0.024)",
                    border: "1px solid rgba(242,185,104,0.08)",
                    color: "rgba(255,245,235,0.72)",
                  }}
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
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
    title: "Sinal organizado",
    text: "O ORI registrou mais uma resposta importante da sua leitura. Continue para tornar sua composição mais nítida.",
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
      className="ori-quiz-mobile-shell relative mb-4 flex min-h-[auto] items-center overflow-hidden rounded-[22px] p-2.5 md:mb-5 md:min-h-[520px] md:rounded-[32px] md:p-4 xl:min-h-[560px] xl:p-5"
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
              {captured ? "Sinal capturado" : `${blockProgress}% desta etapa`}
            </div>
          </div>
        </div>

        <div
          className="ori-quiz-mobile-card relative flex min-h-[auto] flex-col justify-between overflow-hidden rounded-[18px] px-3 py-3 md:min-h-[420px] md:rounded-[28px] md:px-5 md:py-4 xl:min-h-[455px] xl:px-7 xl:py-5"
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
              <div className="ori-quiz-mobile-question mx-auto flex max-w-4xl flex-col justify-center py-3 text-center md:min-h-[142px] md:py-4 xl:min-h-[158px]">
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

const readingLayerCopy = {
  "01": {
    lead: "Primeiro sinal",
    labels: ["O padrão que se repetiu", "Onde sua presença aparece", "Ponto de partida"],
  },
  "02": {
    lead: "Núcleo simbólico",
    labels: ["Forças em encontro", "O que sustenta sua composição", "Direção da sua base"],
  },
  "03": {
    lead: "Movimento interno",
    labels: ["Força principal", "Força secundária", "Ponto de tensão"],
  },
  "04": {
    lead: "No cotidiano",
    labels: ["A pergunta interna", "Corpo e imagem", "Primeiro exercício"],
  },
  "05": {
    lead: "Como você chega",
    labels: ["Como o outro lê", "Sensação que você provoca", "Ruído possível"],
  },
  "06": {
    lead: "Quando a força vira defesa",
    labels: ["O padrão que pesa", "O custo invisível", "Ajuste possível"],
  },
  "07": {
    lead: "Forma de vínculo",
    labels: ["Como você se aproxima", "Onde você se protege", "Maturidade relacional"],
  },
  "08": {
    lead: "Caminho de maturação",
    labels: ["O que precisa amadurecer", "Imagem sem compensação", "Próximo movimento"],
  },
  "09": {
    lead: "O que sustenta sua imagem",
    labels: ["Forma, cor e gesto", "Bonito, mas desalinhado", "Direção inicial"],
  },
  "10": {
    lead: "Clima cromático",
    labels: ["Cores que amplificam", "Sensação visual", "Como usar sem ruído"],
  },
  "11": {
    lead: "Estrutura no corpo",
    labels: ["Linhas que favorecem", "Caimento e proporção", "O que evitar na forma"],
  },
  "12": {
    lead: "Textura e sensação",
    labels: ["Peso visual", "Toque e movimento", "Matéria que conversa com você"],
  },
  "13": {
    lead: "Expressão no rosto",
    labels: ["Acabamento de beleza", "Cabelo e expressão", "O que aparece sem esforço"],
  },
  "14": {
    lead: "Como você ocupa o espaço",
    labels: ["Gesto e postura", "Chegar sem excesso", "Coerência no ambiente"],
  },
  "15": {
    lead: "O que quebra a leitura",
    labels: ["Ruído visual", "Quando a imagem perde força", "Ajuste necessário"],
  },
  "16": {
    lead: "Síntese da imagem",
    labels: ["Fórmula simbólica", "Como combinar os códigos", "Uso prático"],
  },
  "17": {
    lead: "Fechamento da leitura",
    labels: ["O que fica", "Como seguir", "Próximo passo"],
  },
};

const readingLayerCopyByLabel = {
  Reconhecimento: readingLayerCopy["01"],
  Essência: readingLayerCopy["02"],
  "Dinâmica psíquica": readingLayerCopy["03"],
  "Vida real": readingLayerCopy["04"],
  Percepção: readingLayerCopy["05"],
  Sombra: readingLayerCopy["06"],
  "Padrão relacional": readingLayerCopy["07"],
  Individuação: readingLayerCopy["08"],
  "Essência de imagem": readingLayerCopy["09"],
  Paleta: readingLayerCopy["10"],
  Modelagem: readingLayerCopy["11"],
  Tecidos: readingLayerCopy["12"],
  Beleza: readingLayerCopy["13"],
  Presença: readingLayerCopy["14"],
  Evitar: readingLayerCopy["15"],
  Fórmula: readingLayerCopy["16"],
  "Leitura final": readingLayerCopy["17"],
};

function getReadingLayerCopy(layer) {
  return (
    readingLayerCopyByLabel[layer?.label] ||
    readingLayerCopy[layer?.number] || {
      lead: "Ponto central",
      labels: ["O que se abre", "Como aparece", "O que observar"],
    }
  );
}

function createGuidedReadingBlocks(paragraphs, layer) {
  const labels = getReadingLayerCopy(layer).labels;

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

function splitParagraphForDesktop(paragraph, maxPreviewLength = 360) {
  const trimmedParagraph = String(paragraph || "").trim();

  if (!trimmedParagraph) {
    return {
      visible: "",
      hidden: "",
    };
  }

  if (trimmedParagraph.length <= maxPreviewLength) {
    return {
      visible: trimmedParagraph,
      hidden: "",
    };
  }

  const punctuationCut = Math.max(
    trimmedParagraph.lastIndexOf(". ", maxPreviewLength),
    trimmedParagraph.lastIndexOf("! ", maxPreviewLength),
    trimmedParagraph.lastIndexOf("? ", maxPreviewLength),
  );
  const cutPoint = punctuationCut > 180 ? punctuationCut + 1 : maxPreviewLength;
  const visible = trimmedParagraph.slice(0, cutPoint).trim();
  const hidden = trimmedParagraph.slice(cutPoint).trim();

  if (hidden.length < 90) {
    return {
      visible: trimmedParagraph,
      hidden: "",
    };
  }

  return {
    visible,
    hidden,
  };
}

function splitDesktopReadingBlock(block, maxPreviewLength = 360) {
  const [firstParagraph = "", ...extraParagraphs] = block.paragraphs;
  const splitFirstParagraph = splitParagraphForDesktop(
    firstParagraph,
    maxPreviewLength,
  );

  return {
    visibleParagraphs: splitFirstParagraph.visible
      ? [splitFirstParagraph.visible]
      : [],
    hiddenParagraphs: [
      ...(splitFirstParagraph.hidden ? [splitFirstParagraph.hidden] : []),
      ...extraParagraphs,
    ],
  };
}

function ReadingLayerPanel({ layer }) {
  const [isDeepReadingOpen, setIsDeepReadingOpen] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  const mobileMotionOff = useMobileMotionOff();
  const reduceMotion = prefersReducedMotion || mobileMotionOff;

  if (!layer) return null;

  const paragraphs = String(layer.content || "")
    .split(/\n+/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
  const copy = getReadingLayerCopy(layer);
  const [leadParagraph, ...bodyParagraphs] = paragraphs;
  const guidedBlocks = createGuidedReadingBlocks(bodyParagraphs, layer);
  const showCompleteText = mobileMotionOff;
  const leadSplit = showCompleteText
    ? { visible: leadParagraph, hidden: "" }
    : splitParagraphForDesktop(leadParagraph, 460);
  const desktopReadingBlocks = guidedBlocks
    .map((block) => ({
      ...block,
      ...splitDesktopReadingBlock(block),
    }))
    .filter(
      (block) =>
        block.visibleParagraphs.length > 0 || block.hiddenParagraphs.length > 0,
    );
  const hiddenDesktopBlocks = [
    ...(leadSplit.hidden
      ? [
          {
            label: copy.lead,
            paragraphs: [leadSplit.hidden],
          },
        ]
      : []),
    ...desktopReadingBlocks
    .map((block) => ({
      label: block.label,
      paragraphs: block.hiddenParagraphs,
    }))
    .filter((block) => block.paragraphs.length > 0),
  ];
  const hiddenDesktopCount = hiddenDesktopBlocks.reduce(
    (total, block) => total + block.paragraphs.length,
    0,
  );
  const hasHiddenDesktopReading = !showCompleteText && hiddenDesktopCount > 0;
  const visibleLeadParagraph = showCompleteText ? leadParagraph : leadSplit.visible;

  return (
    <motion.article
      key={layer.number}
      initial={reduceMotion ? false : { opacity: 0, y: 16, filter: "blur(8px)" }}
      animate={reduceMotion ? undefined : { opacity: 1, y: 0, filter: "blur(0px)" }}
      exit={reduceMotion ? undefined : { opacity: 0, y: -10, filter: "blur(6px)" }}
      transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
      className="relative overflow-hidden rounded-[18px] md:rounded-[26px] lg:min-h-[350px]"
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

      <div className="relative z-10 lg:min-h-[350px]">
        <div
          className="flex min-h-0 max-w-full flex-col justify-center p-3 md:p-5 lg:min-h-[350px] lg:max-w-[54%]"
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

          {visibleLeadParagraph && (
            <div
              className="mb-2 w-full rounded-[15px] px-3 py-2.5 text-left transition-transform md:mb-2.5 md:px-3.5 md:py-3 md:hover:-translate-y-0.5"
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
                {copy.lead}
              </p>

              <p
                className="ori-type-reading text-[13px] leading-relaxed md:text-sm"
                style={{ color: "rgba(255,245,235,0.88)" }}
              >
                {visibleLeadParagraph}
              </p>
            </div>
          )}

          {desktopReadingBlocks.length > 0 && (
            <div className="grid gap-2 md:gap-2.5">
              {desktopReadingBlocks.map((block) => {
                const visibleParagraphs = showCompleteText
                  ? block.paragraphs
                  : block.visibleParagraphs;

                return (
                visibleParagraphs.length > 0 && (
                <div
                  key={`${layer.number}-${block.label}`}
                  className="rounded-[14px] px-3 py-2 text-left transition-transform md:py-2.5"
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
                    {visibleParagraphs.map((paragraph, index) => (
                      <p
                        key={`${layer.number}-${block.label}-${index}`}
                        className="ori-type-reading-soft text-xs leading-relaxed md:text-[13px]"
                        style={{
                          color: "rgba(255,245,235,0.68)",
                        }}
                      >
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </div>
                )
                );
              })}
            </div>
          )}

          {hasHiddenDesktopReading && (
            <div className="mt-3 hidden md:block">
              <button
                type="button"
                onClick={() => setIsDeepReadingOpen((current) => !current)}
                className="ori-button-secondary rounded-full px-4 py-2 text-xs"
                aria-expanded={isDeepReadingOpen}
              >
                {isDeepReadingOpen ? "Recolher leitura" : "Aprofundar leitura"}
              </button>
            </div>
          )}
        </div>
      </div>

      {hasHiddenDesktopReading && isDeepReadingOpen && (
        <div className="relative z-10 hidden border-t border-[rgba(242,185,104,0.08)] p-5 md:block">
          <div
            className="rounded-[18px] px-4 py-4"
            style={{
              background:
                "linear-gradient(180deg, rgba(255,255,255,0.022), rgba(255,255,255,0.007))",
              border: "1px solid rgba(242,185,104,0.075)",
            }}
          >
            <div className="mb-3 flex items-center justify-between gap-4">
              <p
                className="ori-type-system ori-label-sm"
                style={{ color: "var(--gold-soft)" }}
              >
                Leitura completa da seção
              </p>
              <span
                className="text-[11px]"
                style={{ color: "rgba(255,245,235,0.48)" }}
              >
                {hiddenDesktopCount} {hiddenDesktopCount === 1 ? "trecho" : "trechos"}
              </span>
            </div>

            <div className="grid gap-3">
              {hiddenDesktopBlocks.map((block, blockIndex) => (
                <div
                  key={`${layer.number}-deep-${block.label}-${blockIndex}`}
                  className="space-y-2"
                >
                  {block.paragraphs.map((paragraph, index) => (
                    <p
                      key={`${layer.number}-complete-${block.label}-${blockIndex}-${index}`}
                      className="ori-type-reading-soft text-sm leading-relaxed"
                      style={{ color: "rgba(255,245,235,0.74)" }}
                    >
                      {paragraph}
                    </p>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
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
              aria-label={`Abrir seção ${item.number}: ${item.label}`}
              data-layer-tab={item.number}
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
  const {
    catalog: produto1Catalog,
    questions,
    reports,
    loading: catalogLoading,
    error: catalogError,
  } = useProduto1Catalog();

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
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [feedbackResponse, setFeedbackResponse] = useState("");
  const [feedbackComment, setFeedbackComment] = useState("");
  const [feedbackSaving, setFeedbackSaving] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [backendReading, setBackendReading] = useState(null);
  const [syncNotice, setSyncNotice] = useState("");

  const resultRef = useRef(null);
  const loadingRef = useRef(null);
  const quizRef = useRef(null);
  const readingNavigationRef = useRef(null);
  const readingLayerRef = useRef(null);
  const feedbackRef = useRef(null);
  const nextStepRef = useRef(null);

  const groupedQuestions = useMemo(
    () => getGroupedQuestions(questions),
    [questions],
  );
  const blockOrder = useMemo(() => getBlockOrder(questions), [questions]);

  useEffect(() => {
    if (catalogLoading || !questions.length) return undefined;

    let isMounted = true;

    async function loadUserStorage() {
      const { data: sessionData } = await supabase.auth.getSession();
      const user = sessionData?.session?.user || null;
      const userStorageKey = getQuizStorageKey(user?.id);

      setStorageKey(userStorageKey);
      localStorage.removeItem(LEGACY_STORAGE_KEY);

      const parsedData = readQuizFromStorage(userStorageKey);
      let savedAnswers = parsedData?.answers || {};
      let savedResult = parsedData?.result || null;
      const shouldSyncCachedResult = Boolean(savedResult);
      let hasSavedAnswers = Object.keys(savedAnswers).length > 0;

      if (user?.id) {
        try {
          const apiAnswers = await getProduto1Answers();
          const backendAnswers = apiAnswers?.answers || {};
          const hasBackendAnswers = Object.keys(backendAnswers).length > 0;

          if (hasBackendAnswers) {
            savedAnswers = backendAnswers;
            savedResult = apiAnswers.result || savedResult;
            hasSavedAnswers = true;
            setSyncNotice("");
          }
        } catch (apiError) {
          console.log(
            "API de respostas indisponível, usando histórico local:",
            apiError,
          );
          setSyncNotice(
            apiError?.userMessage ||
              "Estamos usando o histórico salvo neste dispositivo enquanto o ORI sincroniza.",
          );
        }
      }

      if (parsedData || hasSavedAnswers || savedResult) {
        setAnswers(savedAnswers);
        setResult(savedResult);

        if (savedResult) {
          setShowQuiz(false);
          setHasStarted(false);
        } else if (hasSavedAnswers) {
          setCurrentQuestionIndex(getFirstUnansweredIndex(questions, savedAnswers));
        }
      }

      if (user?.id && savedResult) {
        if (shouldSyncCachedResult) {
          syncCachedReadingToAccount({
            user,
            answers: savedAnswers,
            result: savedResult,
          })
            .then(() => setSyncNotice(""))
            .catch((syncError) => {
              console.log("Não foi possível sincronizar leitura local:", syncError);
              setSyncNotice(
                "Sua leitura apareceu neste navegador, mas ainda não conseguimos sincronizar com sua conta.",
              );
            });
        }

        try {
          const savedFeedback = await getProduto1Feedback(FEEDBACK_CONTEXT);

          if (savedFeedback) {
            setFeedbackResponse(savedFeedback.response || "");
            setFeedbackComment(savedFeedback.comment || "");
            setFeedbackSubmitted(true);
          }
        } catch (apiError) {
          console.log("Feedback salvo indisponível no fluxo da leitura:", apiError);
        }
      }

      if (user?.id && !savedResult && !hasSavedAnswers) {
        const clienteResult = getResultFromCliente(
          await fetchClienteByUser(user),
          reports,
        );

        if (clienteResult) {
          setResult(clienteResult);
          setShowQuiz(false);
          setHasStarted(false);

          try {
            const savedFeedback = await getProduto1Feedback(FEEDBACK_CONTEXT);

            if (savedFeedback) {
              setFeedbackResponse(savedFeedback.response || "");
              setFeedbackComment(savedFeedback.comment || "");
              setFeedbackSubmitted(true);
            }
          } catch (apiError) {
            console.log("Feedback salvo indisponível no fluxo da leitura:", apiError);
          }
        }
      }

      if (isMounted) setHasLoadedStorage(true);
    }

    loadUserStorage();

    return () => {
      isMounted = false;
    };
  }, [catalogLoading, questions, reports]);

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
  const answeredQuestions = getAnsweredCount(questions, answers);
  const progress = totalQuestions
    ? Math.round((answeredQuestions / totalQuestions) * 100)
    : 0;
  const isComplete = totalQuestions > 0 && answeredQuestions === totalQuestions;
  const currentQuestion = questions[currentQuestionIndex] || questions[0];
  const catalogUnavailable = Boolean(catalogError) && !questions.length;

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

  const calculateResultWithFallback = async () => {
    try {
      return await calculateQuizResult(answers);
    } catch (apiError) {
      console.log("API do quiz indisponível, usando cálculo local:", apiError);
      setSyncNotice(
        apiError?.userMessage ||
          "A leitura foi calculada localmente. Vamos sincronizar com o ORI em seguida.",
      );
      return calculateResult(questions, answers, produto1Catalog);
    }
  };

  const completeProduto1WithFallback = async () => {
    try {
      const conclusao = await completeProduto1(answers);
      return conclusao.result;
    } catch (apiError) {
      console.log(
        "API de conclusão indisponível, usando fluxo local:",
        apiError,
      );
      setSyncNotice(
        apiError?.userMessage ||
          "Sua leitura foi preservada. A sincronização completa será retomada em instantes.",
      );
      const resultado = await calculateResultWithFallback();
      await saveResultToSupabase(resultado);
      return resultado;
    }
  };

  const resetProduto1InSupabase = async () => {
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

    const { error: respostasError } = await supabase
      .from("produto_1_respostas")
      .upsert(
        {
          user_id: user.id,
          email: user.email || null,
          answers: {},
          answered_count: 0,
          total_questions: totalQuestions,
          is_complete: false,
          result: null,
        },
        {
          onConflict: "user_id",
        },
      );

    if (respostasError) {
      console.log("Erro ao limpar respostas persistidas:", respostasError);
      throw respostasError;
    }

    const { error: feedbackError } = await supabase
      .from("produto_1_feedbacks")
      .delete()
      .eq("user_id", user.id)
      .eq("context", FEEDBACK_CONTEXT);

    if (feedbackError) {
      console.log("Erro ao limpar feedback anterior:", feedbackError);
      throw feedbackError;
    }
  };

  const handleStartQuiz = () => {
    setHasStarted(true);
    setShowQuiz(true);
    setCompletedLayer(null);
    setPendingNextIndex(null);
    setCurrentQuestionIndex(getFirstUnansweredIndex(questions, answers));

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
    setResultReadingCompleted(false);
    setFeedbackSubmitted(false);
    setFeedbackResponse("");
    setFeedbackComment("");
    setFeedbackMessage("");
    saveProduto1Answers(nextAnswers)
      .then(() => setSyncNotice(""))
      .catch((apiError) => {
        console.log("API de respostas indisponível, mantendo salvamento local:", apiError);
        setSyncNotice(
          apiError?.userMessage ||
            "Suas respostas seguem salvas neste dispositivo enquanto o ORI sincroniza.",
        );
      });

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
    setResultReadingCompleted(false);
    setFeedbackSubmitted(false);
    setFeedbackResponse("");
    setFeedbackComment("");
    setFeedbackMessage("");
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
      alert("Responda todos os sinais antes de ver o seu Código ORI.");
      return;
    }

    setResult(null);
    setResultReadingCompleted(false);
    setFeedbackSubmitted(false);
    setFeedbackResponse("");
    setFeedbackComment("");
    setFeedbackMessage("");
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

    setTimeout(async () => {
      const resultado = await completeProduto1WithFallback();

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
      try {
        await resetProduto1();
        setSyncNotice("");
      } catch (apiError) {
        console.log("API de reinício indisponível, usando Supabase direto:", apiError);
        setSyncNotice(
          apiError?.userMessage ||
            "Estamos reiniciando sua leitura pelos dados salvos.",
        );
        await resetProduto1InSupabase();
      }

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
      setResultReadingCompleted(false);
      setFeedbackSubmitted(false);
      setFeedbackResponse("");
      setFeedbackComment("");
      setFeedbackMessage("");

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
  useEffect(() => {
    if (!result) {
      return undefined;
    }

    let isMounted = true;

    async function loadPersonalReading() {
      try {
        const reading = await getProduto1Reading();

        if (isMounted) {
          setBackendReading(reading);
          setSyncNotice("");
        }
      } catch (apiError) {
        console.log(
          "Leitura personalizada do backend indisponível:",
          apiError,
        );

        if (isMounted) {
          setBackendReading(null);
          setSyncNotice(
            apiError?.userMessage ||
              "Estamos usando a leitura salva enquanto o ORI termina a sincronização.",
          );
        }
      }
    }

    loadPersonalReading();

    return () => {
      isMounted = false;
    };
  }, [result]);
  const activeBackendReading =
    backendReading?.resultado === result?.nomeComposto ? backendReading : null;

  const report = useMemo(
    () => {
      if (!baseReport) return null;

      if (
        activeBackendReading?.report &&
        Object.keys(activeBackendReading.report).length > 0
      ) {
        return activeBackendReading.report;
      }

      if (
        activeBackendReading?.camadas &&
        Object.keys(activeBackendReading.camadas).length > 0
      ) {
        const camadas = activeBackendReading.camadas;

        return {
          ...baseReport,
          reconhecimento: camadas.reconhecimento
            ? `${camadas.reconhecimento}\n\n${baseReport.reconhecimento}`
            : baseReport.reconhecimento,
          dinamica: camadas.dinamica
            ? `${camadas.dinamica}\n\n${baseReport.dinamica}`
            : baseReport.dinamica,
          sombra: camadas.sombra
            ? `${camadas.sombra}\n\n${baseReport.sombra}`
            : baseReport.sombra,
          vidaReal: camadas.vidaReal || baseReport.vidaReal,
          essenciaImagem: camadas.essenciaImagem
            ? `${baseReport.essenciaImagem}\n\n${camadas.essenciaImagem}`
            : baseReport.essenciaImagem,
          leituraFinal: camadas.leituraFinal
            ? `${baseReport.leituraFinal}\n\n${camadas.leituraFinal}`
            : baseReport.leituraFinal,
        };
      }

      return enrichReportWithSignals({
        report: baseReport,
        questions,
        answers,
        result,
      });
    },
    [activeBackendReading, answers, baseReport, questions, result],
  );
  const archetypeVisual = result ? archetypeImages[result.nomeComposto] : null;
  const estruturaInternaTabs = report
    ? [
        {
          number: "01",
          theme: "gold",
          eyebrow: "Reconhecimento",
          label: "Reconhecimento",
          title: "O que sua leitura \ncomeça a mostrar",
          description:
            "Esta seção mostra os padrões que influenciam como você ocupa o mundo e é percebida.",
          content: report.reconhecimento,
          image: "/images/panels/reconhecimento.png",
        },
        {
          number: "02",
          theme: "purple",
          eyebrow: "Base interna",
          label: "Base interna",
          title: "A base que organiza\nsua imagem",
          description:
            "Aqui começa a leitura da força interna \nque aparece nos seus desejos, escolhas e expressão.",
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
            "Esta seção mostra como sua psique reage, \nsente, protege e se movimenta diante do mundo.",
          content: report.dinamica,
          image: "/images/panels/dinamica-psiquica.png",
        },
        {
          number: "04",
          theme: "gold",
          eyebrow: "Vida Real",
          label: "Vida real",
          title: "Como isso aparece \nno dia a dia",
          description:
            "Aqui a leitura simbólica vira comportamento, decisão e pequenos sinais observáveis na rotina.",
          content: report.vidaReal,
          image: "/images/panels/leitura-final.png",
        },
        {
          number: "05",
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
          title: "Seu caminho de \namadurecimento",
          description:
            "Aqui começa o movimento onde sua \nimagem deixa de compensar e fica mais coerente.",
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
          eyebrow: "Direção de imagem",
          label: "Direção de imagem",
          title: "Como sua estética \nfunciona melhor",
          description:
            "Sua estética ideal nasce quando sua \nimagem expressa sua energia com mais naturalidade.",
          content: report.essenciaImagem,
          image: "/images/panels/essencia-imagem.png",
        },
        {
          number: "09",
          theme: "silver",
          eyebrow: "Paleta",
          label: "Paleta",
          title: "Cores que \nfortalecem sua imagem",
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
            "Sua beleza funciona melhor quando \nreforça o que você quer comunicar.",
          content: report.beleza,
          image: "/images/panels/beleza.png",
        },
        {
          number: "13",
          theme: "gold",
          eyebrow: "Como você chega",
          label: "Como você chega",
          title: "A forma como sua \nenergia ocupa o espaço",
          description:
            "Sua imagem ganha força quando corpo, \nescolha e energia apontam para a mesma direção.",
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
            "Alguns elementos estéticos rompem sua coerência visual e deixam sua imagem menos clara.",
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
          title: "A síntese \nda sua imagem",
          description:
            "Sua fórmula estética organiza visualmente \na força principal da sua leitura.",
          content: report.formula,
          image: "/images/panels/formula.png",
        },
        {
          number: "16",
          theme: "red",
          eyebrow: "Leitura Final",
          label: "Leitura final",
          title: "Sua imagem começa \na ficar mais clara",
          description:
            "A etapa final mostra onde imagem, \nidentidade e escolhas começam a se alinhar.",
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
      title: "Base da leitura",
      text: "Reconhecimento, base interna, dinâmica e percepção.",
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
      title: "Imagem na prática",
      text: "Direção visual, beleza, cores, corpo e presença.",
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
  const previousResultLayer =
    activeResultLayerIndex > 0
      ? activeResultLayerState.tabs[activeResultLayerIndex - 1]
      : null;
  const previousFlowLabel = previousResultLayer
    ? "Etapa anterior"
    : previousResultCore
      ? "Núcleo anterior"
      : null;
  const isLastResultLayerOfLastCore =
    activeResultCore === "sintese" && !hasNextResultLayer;
  const resultFlowLabel = hasNextResultLayer
    ? "Próxima etapa"
    : nextResultCore
      ? "Avançar para o próximo núcleo"
      : "Concluir minha leitura";
  const resultFlowText = hasNextResultLayer
    ? "Continue pelas etapas deste núcleo antes de avançar."
    : nextResultCore
      ? `Este núcleo foi atravessado. Agora você pode seguir para ${nextResultCore.title}.`
      : resultReadingCompleted
        ? "Sua primeira leitura foi concluída. O Dossiê ORI é a próxima etapa para ver como essa força aparece no corpo, nas cores, no cabelo, na beleza e na presença."
        : "Você chegou à última etapa da sua primeira leitura.";

  const scrollToReadingNavigation = () => {
    window.setTimeout(() => {
      readingNavigationRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 80);
  };

  const scrollToCurrentLayer = (layerNumber) => {
    window.setTimeout(() => {
      readingLayerRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });

      document
        .querySelector(`[data-layer-tab="${layerNumber}"]`)
        ?.scrollIntoView({
          behavior: "smooth",
          inline: "center",
          block: "nearest",
        });
    }, 100);
  };

  const scrollToCoreTab = (coreId) => {
    window.setTimeout(() => {
      document
        .querySelector(`[data-core-tab="${coreId}"]`)
        ?.scrollIntoView({
          behavior: "smooth",
          inline: "center",
          block: "nearest",
        });
    }, 120);
  };

  const handleSelectResultCore = (coreId) => {
    setActiveResultCore(coreId);
    scrollToReadingNavigation();
    scrollToCoreTab(coreId);
  };

  const handleResultFlowNext = () => {
    if (!activeResultLayerState) return;

    if (hasNextResultLayer) {
      const nextLayer =
        activeResultLayerState.tabs[activeResultLayerIndex + 1]?.number;

      if (nextLayer) {
        activeResultLayerState.setActiveNumber(nextLayer);
        scrollToCurrentLayer(nextLayer);
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

      scrollToReadingNavigation();
      scrollToCoreTab(nextResultCore.id);
      return;
    }

    if (isLastResultLayerOfLastCore) {
      setResultReadingCompleted(true);
      window.setTimeout(() => {
        feedbackRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 100);
    }
  };

  const handleSaveReadingFeedback = async (event) => {
    event.preventDefault();

    if (!feedbackResponse || feedbackSaving || !result) return;

    setFeedbackSaving(true);
    setFeedbackMessage("");

    try {
      await saveProduto1Feedback({
        context: FEEDBACK_CONTEXT,
        response: feedbackResponse,
        comment: feedbackComment.trim() || null,
        resultado: result.nomeComposto,
        payload: {
          page: "produto-1-leitura",
          completedAt: new Date().toISOString(),
        },
      });

      setFeedbackSubmitted(true);
      setFeedbackMessage("Obrigada. Seu retorno foi registrado.");

      window.setTimeout(() => {
        nextStepRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 180);
    } catch (error) {
      console.log("Erro ao salvar feedback da leitura:", error);
      setFeedbackSubmitted(true);
      setFeedbackMessage(
        "Seu retorno não sincronizou agora, mas você pode seguir para a próxima etapa.",
      );

      window.setTimeout(() => {
        nextStepRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 180);
    } finally {
      setFeedbackSaving(false);
    }
  };

  const handleResultFlowPrevious = () => {
    if (!activeResultLayerState) return;

    if (previousResultLayer) {
      activeResultLayerState.setActiveNumber(previousResultLayer.number);
      scrollToCurrentLayer(previousResultLayer.number);
      return;
    }

    if (previousResultCore) {
      setActiveResultCore(previousResultCore.id);

      const previousLayerState = resultCoreLayerState[previousResultCore.id];
      const lastLayer =
        previousLayerState?.tabs?.[previousLayerState.tabs.length - 1]?.number;

      if (lastLayer) {
        previousLayerState.setActiveNumber(lastLayer);
      }

      scrollToReadingNavigation();
      scrollToCoreTab(previousResultCore.id);
    }
  };

  if (!isReadingRoute) {
    return (
      <div className="max-w-6xl mx-auto">
        <QuizHero
          onPrimaryAction={
            hasLoadedStorage && !result && !catalogUnavailable
              ? () => navigate("/produto-1/leitura")
              : undefined
          }
        />

        {catalogUnavailable ? <CatalogUnavailableState /> : null}

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
            <Eyebrow line className="mb-4">Leitura já pronta</Eyebrow>

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
              Sua primeira leitura já está salva no Átrio ORI. Você pode acessar
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

        {catalogUnavailable ? (
          <CatalogUnavailableState />
        ) : !hasLoadedStorage ? (
          <ReadingBootState reduceMotion={reduceMotion} />
        ) : null}

        {hasLoadedStorage && (isLoadingResult || isLoadingPreview) && (
          <LoadingDossie
            loadingStep={loadingStep}
            loadingRef={loadingRef}
            reduceMotion={reduceMotion}
          />
        )}

        {hasLoadedStorage && showQuiz && !result && !isLoadingPreview && (
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

        {hasLoadedStorage && result && !isLoadingPreview && (
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

              <SyncNotice message={syncNotice} />

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

                  <section ref={readingNavigationRef} className="relative z-10 scroll-mt-8 pb-3">
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
                              onClick={() => handleSelectResultCore(item.id)}
                              data-core-tab={item.id}
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
                        ref={readingLayerRef}
                        id="nucleo-estrutura-interna"
                        className="relative z-10 scroll-mt-8 overflow-hidden pt-3"
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
                        ref={readingLayerRef}
                        id="nucleo-sombra-vinculos"
                        className="relative z-10 scroll-mt-8 overflow-hidden pt-3"
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
                        ref={readingLayerRef}
                        id="nucleo-imagem-presenca"
                        className="relative z-10 scroll-mt-8 overflow-hidden pt-3"
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
                        ref={readingLayerRef}
                        id="nucleo-sintese-final"
                        className="relative z-10 scroll-mt-8 overflow-hidden pt-3"
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
                      {previousFlowLabel && (
                        <button
                          type="button"
                          onClick={handleResultFlowPrevious}
                          className="rounded-full px-5 py-2.5 text-sm md:py-3"
                          style={{
                            background: "rgba(255,255,255,0.026)",
                            border: "1px solid rgba(242,185,104,0.10)",
                            color: "rgba(255,245,235,0.68)",
                          }}
                        >
                          {previousFlowLabel}
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

                  <section
                    className="mt-3 flex flex-col gap-3 rounded-[18px] p-3 md:mt-4 md:flex-row md:items-center md:justify-between md:gap-5 md:rounded-[22px] md:p-4"
                    style={{
                      background:
                        "linear-gradient(135deg, rgba(242,185,104,0.070), rgba(255,255,255,0.012))",
                      border: "1px solid rgba(242,185,104,0.12)",
                      boxShadow:
                        "0 0 30px rgba(242,185,104,0.035), inset 0 0 24px rgba(255,255,255,0.010)",
                    }}
                  >
                    <div className="min-w-0">
                      <p
                        className="mb-1.5 text-[9px] uppercase tracking-[0.22em] md:mb-2 md:tracking-[0.28em]"
                        style={{ color: "var(--gold-soft)" }}
                      >
                        Relatório digital
                      </p>
                      <h3
                        className="ori-type-revelation text-xl md:text-2xl"
                        style={{
                          color: "var(--gold-primary)",
                          fontWeight: 620,
                          letterSpacing: "-0.045em",
                        }}
                      >
                        Sua leitura completa em formato de consulta.
                      </h3>
                      <p
                        className="ori-mobile-preview-3 mt-1.5 text-[13px] leading-relaxed md:text-sm"
                        style={{ color: "rgba(255,245,235,0.62)" }}
                      >
                        Acesse o documento do Código das Deusas com os capítulos
                        organizados para reler, salvar e acompanhar sua jornada
                        depois da revelação.
                      </p>
                    </div>

                    <Link
                      to="/produto-1/relatorio"
                      className="ori-button-secondary inline-flex w-full shrink-0 justify-center rounded-full px-5 py-2.5 text-sm md:w-auto md:py-3"
                      style={{
                        background: "rgba(242,185,104,0.10)",
                        border: "1px solid rgba(242,185,104,0.18)",
                        color: "var(--gold-primary)",
                      }}
                    >
                      Abrir relatório digital
                    </Link>
                  </section>

                  {resultReadingCompleted && !feedbackSubmitted && (
                    <form
                      ref={feedbackRef}
                      onSubmit={handleSaveReadingFeedback}
                      className="mt-3 scroll-mt-8 rounded-[18px] p-3 md:mt-4 md:rounded-[22px] md:p-4"
                      style={{
                        background:
                          "linear-gradient(135deg, rgba(255,255,255,0.026), rgba(242,185,104,0.030))",
                        border: "1px solid rgba(242,185,104,0.11)",
                      }}
                    >
                      <div className="mb-3">
                        <p
                          className="mb-1.5 text-[9px] uppercase tracking-[0.22em] md:tracking-[0.28em]"
                          style={{ color: "var(--gold-soft)" }}
                        >
                          Pausa da leitura
                        </p>
                        <h3
                          className="ori-type-revelation text-xl md:text-2xl"
                          style={{
                            color: "var(--gold-primary)",
                            fontWeight: 620,
                            letterSpacing: "-0.045em",
                          }}
                        >
                          Antes de seguir, me conta uma coisa.
                        </h3>
                        <p
                          className="ori-mobile-preview-3 mt-1.5 text-[13px] leading-relaxed md:text-sm"
                          style={{ color: "rgba(255,245,235,0.58)" }}
                        >
                          Como essa leitura chegou em você? Sua resposta ajuda o
                          ORI a conduzir o próximo passo com mais cuidado.
                        </p>
                      </div>

                      <div className="mb-3 grid gap-2">
                        {FEEDBACK_OPTIONS.map((option) => {
                          const isSelected = feedbackResponse === option.id;

                          return (
                            <button
                              key={option.id}
                              type="button"
                              onClick={() => {
                                setFeedbackResponse(option.id);
                                setFeedbackMessage("");
                              }}
                              aria-pressed={isSelected}
                              className="group relative flex min-h-[46px] items-start gap-2.5 overflow-hidden rounded-[15px] border px-3 py-2.5 text-left transition duration-300 hover:-translate-y-0.5"
                              style={{
                                background: isSelected
                                  ? "linear-gradient(135deg, rgba(242,185,104,0.125), rgba(210,135,70,0.050))"
                                  : "linear-gradient(135deg, rgba(255,255,255,0.024), rgba(255,255,255,0.008))",
                                borderColor: isSelected
                                  ? "rgba(242,185,104,0.34)"
                                  : "rgba(242,185,104,0.10)",
                                color: isSelected
                                  ? "rgba(247,234,216,0.96)"
                                  : "rgba(255,245,235,0.72)",
                                boxShadow: isSelected
                                  ? "0 0 28px rgba(242,185,104,0.10), inset 0 0 18px rgba(242,185,104,0.030)"
                                  : "inset 0 0 14px rgba(255,255,255,0.008)",
                              }}
                            >
                              <span
                                className="absolute inset-x-4 top-0 h-px"
                                style={{
                                  background: isSelected
                                    ? "linear-gradient(90deg, transparent, rgba(242,185,104,0.42), transparent)"
                                    : "linear-gradient(90deg, transparent, rgba(255,255,255,0.10), transparent)",
                                }}
                              />
                              <span
                                className="mt-0.5 grid h-[18px] w-[18px] shrink-0 place-items-center rounded-full border transition"
                                style={{
                                  borderColor: isSelected
                                    ? "rgba(242,185,104,0.76)"
                                    : "rgba(255,245,235,0.20)",
                                  boxShadow: isSelected
                                    ? "0 0 14px rgba(242,185,104,0.24)"
                                    : "none",
                                }}
                              >
                                <span
                                  className="h-1.5 w-1.5 rounded-full transition"
                                  style={{
                                    background: isSelected
                                      ? "rgba(242,185,104,0.95)"
                                      : "transparent",
                                  }}
                                />
                              </span>
                              <span className="min-w-0">
                                <span
                                  className="ori-type-reading-soft block text-sm"
                                  style={{
                                    color: isSelected
                                      ? "var(--gold-soft)"
                                      : "rgba(255,245,235,0.74)",
                                    fontWeight: 560,
                                  }}
                                >
                                  {option.label}
                                </span>
                                <span
                                  className="ori-type-reading-soft mt-0.5 block text-xs leading-relaxed"
                                  style={{ color: "rgba(255,245,235,0.48)" }}
                                >
                                  {option.text}
                                </span>
                              </span>
                            </button>
                          );
                        })}
                      </div>

                      <textarea
                        value={feedbackComment}
                        onChange={(event) => setFeedbackComment(event.target.value)}
                        rows={3}
                        placeholder="Quer me contar onde tocou, confundiu ou ficou distante?"
                        className="ori-type-reading-soft mb-3 w-full resize-none rounded-[16px] px-3 py-3 text-sm outline-none"
                        style={{
                          background: "rgba(5,2,2,0.34)",
                          border: "1px solid rgba(242,185,104,0.10)",
                          color: "rgba(255,245,235,0.76)",
                        }}
                      />

                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <p
                          className="ori-type-reading-soft text-xs"
                          style={{ color: "rgba(255,245,235,0.46)" }}
                        >
                          Não é uma avaliação. É só uma forma de seguir com mais
                          cuidado.
                        </p>
                        <button
                          type="submit"
                          disabled={!feedbackResponse || feedbackSaving}
                          className="ori-journey-action inline-flex justify-center rounded-full px-5 py-2.5 text-sm disabled:cursor-not-allowed disabled:opacity-55"
                          style={{
                            background:
                              "linear-gradient(90deg, var(--copper-primary), var(--gold-primary))",
                            color: "#090506",
                            fontWeight: 700,
                          }}
                        >
                          {feedbackSaving ? "Salvando..." : "Enviar e continuar"}
                        </button>
                      </div>

                      {feedbackMessage && (
                        <p
                          className="ori-type-reading-soft mt-2 text-xs"
                          style={{ color: "var(--gold-soft)" }}
                        >
                          {feedbackMessage}
                        </p>
                      )}
                    </form>
                  )}

                  {resultReadingCompleted && feedbackSubmitted && (
                    <div ref={nextStepRef} className="mt-8 scroll-mt-8">
                      {feedbackMessage && (
                        <div
                          className="mx-auto mb-8 w-fit max-w-full rounded-full px-5 py-2.5 text-center text-xs md:text-sm"
                          style={{
                            background: "rgba(242,185,104,0.08)",
                            border: "1px solid rgba(242,185,104,0.14)",
                            color: "var(--gold-soft)",
                          }}
                        >
                          {feedbackMessage}
                        </div>
                      )}
                      <NextStepCard />
                    </div>
                  )}
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
