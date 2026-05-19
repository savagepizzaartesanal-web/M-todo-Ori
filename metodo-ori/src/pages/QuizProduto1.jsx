import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

import { questions } from "../data/questions";
import { reports } from "../data/reports";
import { calculateResult } from "../services/calculateResult";
import { archetypeImages } from "../data/archetypeImages";
import { supabase } from "../lib/supabaseClient";

import QuizHero from "../components/QuizHero";
import ResultHero from "../components/ResultHero";
import NextStepCard from "../components/NextStepCard";

const LEGACY_STORAGE_KEY = "ori_produto_1_quiz";

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
  "Lendo padrões emocionais...",
  "Interpretando dinâmica arquetípica...",
  "Analisando presença simbólica...",
  "Cruzando forças dominantes...",
  "Traduzindo essência em imagem...",
  "Finalizando sua revelação...",
];

const loadingNotes = [
  "O espelho observa repetições, tensões e sinais de presença.",
  "Cada resposta começa a desenhar uma direção simbólica.",
  "Sua imagem interna está sendo cruzada com os arquétipos ativos.",
  "O ORI procura a composição que mais se repete nas suas escolhas.",
  "A leitura começa a sair do invisível e ganhar linguagem.",
  "Sua revelação está sendo preparada para aparecer com clareza.",
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

function Eyebrow({ children, className = "" }) {
  return (
    <p
      className={`uppercase tracking-[0.42em] text-[9px] md:text-[10px] ${className}`}
      style={{ color: colors.goldSoft }}
    >
      {children}
    </p>
  );
}

function LoadingDossie({ loadingStep, loadingRef, reduceMotion }) {
  const progressWidth = Math.min(
    ((loadingStep + 1) / loadingMessages.length) * 100,
    100,
  );

  const analysisSteps = [
    {
      label: "Presença",
      detail: "primeiros sinais",
    },
    {
      label: "Imagem",
      detail: "forma simbólica",
    },
    {
      label: "Sombra",
      detail: "tensão ativa",
    },
    {
      label: "Essência",
      detail: "núcleo interno",
    },
    {
      label: "Arquétipos",
      detail: "forças dominantes",
    },
    {
      label: "Síntese",
      detail: "código final",
    },
  ];

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
      className="mb-10 rounded-[32px] md:rounded-[44px] p-5 md:p-7 xl:p-8 text-center relative overflow-hidden scroll-mt-8 min-h-[calc(100vh-150px)] flex items-center justify-center"
      style={{
        background:
          "linear-gradient(135deg, rgba(18,9,10,0.88), rgba(5,2,2,0.96))",
        border: "1px solid rgba(242,185,104,0.16)",
        boxShadow:
          "0 0 110px rgba(242,185,104,0.065), inset 0 0 90px rgba(255,255,255,0.018)",
        backdropFilter: "blur(18px)",
        WebkitBackdropFilter: "blur(18px)",
      }}
    >
      <img
        src="/images/heroes/loading-ori.png"
        alt="Processamento ORI"
        className="absolute inset-0 w-full h-full object-cover object-center opacity-75 pointer-events-none select-none"
      />

      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(180deg, rgba(5,2,2,0.48), rgba(5,2,2,0.86)), radial-gradient(circle at center, rgba(242,185,104,0.08), rgba(5,2,2,0.72) 62%, rgba(5,2,2,0.94) 100%)",
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
            "radial-gradient(circle at 50% 42%, rgba(242,185,104,0.24), transparent 26%), radial-gradient(circle at 50% 58%, rgba(183,140,255,0.12), transparent 34%)",
        }}
      />

      <div
        className="absolute inset-0 pointer-events-none opacity-[0.035]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(242,185,104,0.22) 1px, transparent 1px), linear-gradient(90deg, rgba(242,185,104,0.10) 1px, transparent 1px)",
          backgroundSize: "70px 70px",
        }}
      />

      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[0, 1, 2, 3].map((item) => (
          <motion.span
            key={item}
            className="absolute h-px w-[42%]"
            animate={
              reduceMotion
                ? undefined
                : {
                    x: item % 2 === 0 ? ["-10%", "120%"] : ["120%", "-10%"],
                    opacity: [0, 0.42, 0],
                  }
            }
            transition={{
              duration: 5.5 + item * 0.8,
              repeat: Infinity,
              ease: "easeInOut",
              delay: item * 0.35,
            }}
            style={{
              top: `${24 + item * 16}%`,
              left: item % 2 === 0 ? "-20%" : "78%",
              background:
                "linear-gradient(90deg, transparent, rgba(242,185,104,0.32), transparent)",
            }}
          />
        ))}
      </div>

      <div className="absolute left-1/2 top-[42%] -translate-x-1/2 -translate-y-1/2 w-[min(58vw,520px)] h-[min(58vw,520px)] pointer-events-none">
        <motion.div
          className="absolute inset-0 rounded-full"
          animate={reduceMotion ? undefined : { rotate: 360 }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          style={{
            border: "1px solid rgba(242,185,104,0.10)",
            boxShadow: "inset 0 0 70px rgba(242,185,104,0.020)",
          }}
        />

        <motion.div
          className="absolute inset-[12%] rounded-full"
          animate={reduceMotion ? undefined : { rotate: -360 }}
          transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
          style={{
            border: "1px solid rgba(183,140,255,0.12)",
            boxShadow: "inset 0 0 58px rgba(183,140,255,0.018)",
          }}
        />

        <motion.div
          className="absolute inset-[27%] rounded-full"
          animate={
            reduceMotion
              ? undefined
              : {
                  scale: [1, 1.08, 1],
                  opacity: [0.45, 0.78, 0.52],
                }
          }
          transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
          style={{
            background:
              "radial-gradient(circle, rgba(242,185,104,0.24), rgba(242,185,104,0.08) 44%, transparent 68%)",
            border: "1px solid rgba(242,185,104,0.18)",
            boxShadow:
              "0 0 78px rgba(242,185,104,0.22), inset 0 0 44px rgba(255,255,255,0.06)",
          }}
        />

        {analysisSteps.map((step, index) => {
          const angle =
            (index / analysisSteps.length) * Math.PI * 2 - Math.PI / 2;
          const x = 50 + Math.cos(angle) * 43;
          const y = 50 + Math.sin(angle) * 43;
          const active = loadingStep >= index;

          return (
            <motion.div
              key={step.label}
              className="absolute -translate-x-1/2 -translate-y-1/2"
              style={{
                left: `${x}%`,
                top: `${y}%`,
              }}
              animate={
                reduceMotion
                  ? undefined
                  : {
                      scale: active ? [1, 1.12, 1] : 1,
                      opacity: active ? 1 : 0.36,
                    }
              }
              transition={{
                duration: 2,
                repeat: active && !reduceMotion ? Infinity : 0,
                ease: "easeInOut",
              }}
            >
              <span
                className="block w-3 h-3 rounded-full"
                style={{
                  background: active
                    ? "rgba(242,185,104,0.95)"
                    : "rgba(255,255,255,0.18)",
                  border: active
                    ? "1px solid rgba(242,185,104,0.70)"
                    : "1px solid rgba(255,255,255,0.10)",
                  boxShadow: active
                    ? "0 0 26px rgba(242,185,104,0.38)"
                    : "none",
                }}
              />
            </motion.div>
          );
        })}
      </div>

      <div className="relative z-10 w-full max-w-4xl mx-auto pt-8">
        <Eyebrow className="mb-4">Tecnologia ORI em análise</Eyebrow>

        <AnimatePresence mode="wait">
          <motion.h2
            key={loadingMessages[loadingStep]}
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
            className="text-3xl md:text-5xl xl:text-[52px] leading-[0.98] mb-4"
            style={{
              color: colors.gold,
              letterSpacing: "-0.065em",
              textShadow: "0 0 52px rgba(242,185,104,0.22)",
              fontWeight: 680,
            }}
          >
            {loadingMessages[loadingStep]}
          </motion.h2>
        </AnimatePresence>

        <p
          className="text-sm md:text-base max-w-2xl mx-auto leading-relaxed mb-3"
          style={{
            color: colors.soft,
            textShadow: "0 0 26px rgba(0,0,0,0.45)",
          }}
        >
          Seus sinais estão sendo cruzados para revelar os padrões centrais da
          sua presença, imagem, essência e dinâmica arquetípica.
        </p>

        <AnimatePresence mode="wait">
          <motion.p
            key={loadingNotes[loadingStep]}
            initial={reduceMotion ? false : { opacity: 0, y: 8 }}
            animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: -8 }}
            transition={{ duration: 0.34 }}
            className="text-xs md:text-sm max-w-2xl mx-auto leading-relaxed mb-7"
            style={{ color: "rgba(255,245,235,0.58)" }}
          >
            {loadingNotes[loadingStep]}
          </motion.p>
        </AnimatePresence>

        <div
          className="relative overflow-hidden rounded-full h-2 max-w-xl mx-auto mb-5"
          style={{
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(242,185,104,0.10)",
          }}
        >
          <motion.div
            className="absolute top-0 left-0 h-full rounded-full"
            animate={{ width: `${progressWidth}%` }}
            transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
            style={{
              background:
                "linear-gradient(to right, rgba(242,185,104,0.55), rgba(255,213,143,1))",
              boxShadow: "0 0 38px rgba(242,185,104,0.42)",
            }}
          />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 max-w-4xl mx-auto">
          {analysisSteps.map((item, index) => {
            const active = loadingStep >= index;

            return (
              <motion.div
                key={item.label}
                animate={
                  reduceMotion
                    ? undefined
                    : {
                        opacity: active ? 1 : 0.42,
                        y: active ? 0 : 2,
                      }
                }
                className="rounded-[18px] px-3 py-3"
                style={{
                  background: active
                    ? "rgba(242,185,104,0.080)"
                    : "rgba(255,255,255,0.026)",
                  border: active
                    ? "1px solid rgba(242,185,104,0.18)"
                    : "1px solid rgba(242,185,104,0.08)",
                  color: active
                    ? "rgba(255,245,235,0.84)"
                    : "rgba(255,245,235,0.42)",
                  boxShadow: active
                    ? "0 0 22px rgba(242,185,104,0.06)"
                    : "none",
                }}
              >
                <span
                  className="block text-[9px] uppercase tracking-[0.20em] mb-1"
                  style={{ color: active ? colors.goldSoft : colors.muted }}
                >
                  {active ? "Analisado" : "Em espera"}
                </span>
                <span className="block text-xs font-semibold">
                  {item.label}
                </span>
                <span
                  className="block text-[10px] mt-1"
                  style={{ color: "rgba(255,245,235,0.45)" }}
                >
                  {item.detail}
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
      className="relative overflow-hidden rounded-[34px] md:rounded-[46px] p-7 md:p-10 mb-10"
      style={{
        background:
          "radial-gradient(circle at top right, rgba(242,185,104,0.13), transparent 34%), radial-gradient(circle at bottom left, rgba(183,140,255,0.09), transparent 38%), linear-gradient(135deg, rgba(18,9,10,0.76), rgba(5,2,2,0.94))",
        border: "1px solid rgba(242,185,104,0.14)",
        boxShadow:
          "0 0 90px rgba(242,185,104,0.050), inset 0 0 64px rgba(255,255,255,0.012)",
        backdropFilter: "blur(18px)",
        WebkitBackdropFilter: "blur(18px)",
      }}
    >
      <div className="relative z-10 grid lg:grid-cols-[0.82fr_1.18fr] gap-8 items-center">
        <div>
          <Eyebrow className="mb-5">Código das Deusas</Eyebrow>

          <h1
            className="text-4xl md:text-6xl leading-[0.92] mb-6"
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
            className="text-base md:text-lg leading-relaxed max-w-2xl mb-7"
            style={{ color: colors.soft }}
          >
            Responda intuitivamente. Quando você não racionaliza demais as
            questões, a leitura se aproxima com mais precisão dos padrões reais
            da sua psique, da sua presença e da imagem que começa dentro de
            você.
          </p>

          <p
            className="text-sm md:text-base leading-relaxed max-w-2xl mb-7"
            style={{ color: "rgba(255,245,235,0.66)" }}
          >
            Esta primeira etapa não entrega uma consultoria visual completa. Ela
            nomeia a base simbólica que depois será traduzida em corpo, cor,
            cabelo, beleza, presença e armário.
          </p>

          <motion.button
            type="button"
            onClick={onStart}
            whileHover={reduceMotion ? undefined : { scale: 1.025, y: -2 }}
            whileTap={reduceMotion ? undefined : { scale: 0.98 }}
            className="px-8 py-4 rounded-full text-sm md:text-base"
            style={{
              background: colors.gold,
              color: "#090506",
              fontWeight: 700,
              boxShadow:
                "0 0 42px rgba(242,185,104,0.18), inset 0 0 16px rgba(255,255,255,0.18)",
            }}
          >
            {hasProgress ? "Continuar minha leitura" : "Começar minha leitura"}
          </motion.button>
        </div>

        <div
          className="relative overflow-hidden rounded-[30px] p-6 md:p-7"
          style={{
            background:
              "linear-gradient(180deg, rgba(255,255,255,0.032), rgba(255,255,255,0.010))",
            border: "1px solid rgba(242,185,104,0.12)",
            boxShadow: "inset 0 0 40px rgba(255,255,255,0.012)",
          }}
        >
          <Eyebrow className="mb-4">Travessia ORI</Eyebrow>

          <div className="grid gap-4">
            {methodSteps.map((item) => (
              <div
                key={item.title}
                className="rounded-[22px] p-4"
                style={{
                  background: "rgba(255,255,255,0.024)",
                  border: "1px solid rgba(242,185,104,0.08)",
                }}
              >
                <h3
                  className="text-lg mb-1"
                  style={{
                    color: colors.text,
                    fontWeight: 620,
                    letterSpacing: "-0.035em",
                  }}
                >
                  {item.title}
                </h3>

                <p
                  className="text-sm leading-relaxed"
                  style={{ color: colors.soft }}
                >
                  {item.text}
                </p>
              </div>
            ))}
          </div>

          {hasProgress && (
            <div className="mt-6">
              <p className="text-sm mb-2" style={{ color: colors.soft }}>
                Você já revelou {answeredQuestions} de {totalQuestions} sinais.
              </p>

              <div
                className="h-2 rounded-full overflow-hidden"
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

function LayerReveal({ bloco, onContinue, isFinalBlock, reduceMotion }) {
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
      className="relative overflow-hidden rounded-[28px] md:rounded-[36px] px-5 py-6 md:px-8 md:py-7 mb-6 text-center min-h-[calc(100vh-120px)] flex items-center justify-center"
      style={{
        background: `${theme.aura}, linear-gradient(135deg, rgba(18,9,10,0.68), rgba(5,2,2,0.92))`,
        border: "1px solid rgba(242,185,104,0.14)",
        boxShadow:
          "0 0 72px rgba(242,185,104,0.04), inset 0 0 40px rgba(255,255,255,0.01)",
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
      }}
    >
      <video
        className="absolute inset-0 h-full w-full object-cover opacity-30 pointer-events-none"
        src="/videos/quizz/quizz-bg.mp4"
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
      />

      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(180deg, rgba(5,2,2,0.28), rgba(5,2,2,0.48)), radial-gradient(circle at center, rgba(5,2,2,0.04), rgba(5,2,2,0.42) 72%)",
        }}
      />

      <div className="relative z-10 max-w-3xl mx-auto">
        <motion.div
          initial={reduceMotion ? false : { scale: 0.94, opacity: 0 }}
          animate={reduceMotion ? undefined : { scale: 1, opacity: 1 }}
          transition={{ duration: 0.48, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto mb-5 h-14 w-14 rounded-full flex items-center justify-center text-lg"
          style={{
            background: "rgba(5,2,2,0.54)",
            border: `1px solid ${theme.glow}`,
            color: theme.accent,
            boxShadow: `0 0 28px ${theme.glow}, inset 0 0 18px rgba(255,255,255,0.014)`,
            fontWeight: 650,
          }}
        >
          {theme.symbol}
        </motion.div>

        <div
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-5"
          style={{
            background: "rgba(120,255,160,0.06)",
            border: "1px solid rgba(120,255,160,0.12)",
            color: "#9BE7AE",
          }}
        >
          <span>✓</span>
          <span className="text-[11px] uppercase tracking-[0.18em]">
            Camada registrada
          </span>
        </div>

        <Eyebrow className="mb-4">{bloco}</Eyebrow>

        <h2
          className="text-3xl md:text-5xl leading-[0.96] mb-4"
          style={{
            color: colors.gold,
            fontWeight: 680,
            letterSpacing: "-0.07em",
            textShadow: "0 0 36px rgba(242,185,104,0.14)",
          }}
        >
          {reveal.title}
        </h2>

        <p
          className="text-base md:text-lg leading-relaxed max-w-[760px] mx-auto mb-5"
          style={{ color: colors.soft }}
        >
          {reveal.text}
        </p>

        <p
          className="text-sm md:text-base leading-relaxed max-w-[760px] mx-auto mb-6"
          style={{ color: "rgba(255,245,235,0.62)" }}
        >
          {theme.reward} Esta etapa não define sua imagem inteira, mas aproxima
          o método da estrutura que sustenta suas escolhas, seus gestos e a
          forma como sua presença é percebida.
        </p>

        <div className="flex flex-wrap justify-center gap-2 mb-6">
          {[
            `Camada ${String(blockRevealTexts[bloco] ? Object.keys(blockRevealTexts).indexOf(bloco) + 1 : 1).padStart(2, "0")} concluída`,
            "+1 fragmento desbloqueado",
            "Espelho mais nítido",
          ].map((item) => (
            <span
              key={item}
              className="px-4 py-2 rounded-full text-xs"
              style={{
                background: "rgba(242,185,104,0.06)",
                border: "1px solid rgba(242,185,104,0.12)",
                color: "rgba(255,245,235,0.74)",
              }}
            >
              {item}
            </span>
          ))}
        </div>

        <motion.button
          type="button"
          onClick={onContinue}
          whileHover={reduceMotion ? undefined : { scale: 1.025, y: -2 }}
          whileTap={reduceMotion ? undefined : { scale: 0.98 }}
          className="px-7 py-3.5 rounded-full text-sm md:text-base"
          style={{
            background: colors.gold,
            color: "#090506",
            fontWeight: 700,
            boxShadow:
              "0 0 32px rgba(242,185,104,0.14), inset 0 0 12px rgba(255,255,255,0.16)",
          }}
        >
          {isFinalBlock ? "Preparar revelação" : "Continuar leitura"}
        </motion.button>
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
      className="relative overflow-hidden rounded-[32px] md:rounded-[46px] p-4 md:p-6 xl:p-7 mb-7 min-h-[calc(100vh-132px)] flex items-center"
      style={{
        background: `${theme.aura}, radial-gradient(circle at 50% 42%, ${theme.glow}, transparent 32%), linear-gradient(135deg, rgba(18,9,10,0.78), rgba(5,2,2,0.96))`,
        border: "1px solid rgba(242,185,104,0.15)",
        boxShadow: `0 0 96px ${theme.glow}, inset 0 0 70px rgba(255,255,255,0.012)`,
        backdropFilter: "blur(18px)",
        WebkitBackdropFilter: "blur(18px)",
      }}
    >
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.025]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(242,185,104,0.18) 1px, transparent 1px), linear-gradient(90deg, rgba(242,185,104,0.08) 1px, transparent 1px)",
          backgroundSize: "86px 86px",
        }}
      />

      <video
        className="absolute inset-0 h-full w-full object-cover opacity-42 pointer-events-none"
        src="/videos/quizz/quizz-bg.mp4"
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
      />

      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(180deg, rgba(5,2,2,0.38), rgba(5,2,2,0.62)), radial-gradient(circle at center, rgba(5,2,2,0.08), rgba(5,2,2,0.58) 72%)",
        }}
      />

      <div className="relative z-10 w-full max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4 px-1">
          <div>
            <Eyebrow className="mb-2">Câmara de Leitura ORI</Eyebrow>
            <p
              className="uppercase tracking-[0.24em] text-[8px] md:text-[9px]"
              style={{ color: "rgba(255,245,235,0.54)" }}
            >
              Sinal {String(currentQuestion.id).padStart(2, "0")} de{" "}
              {String(totalQuestions).padStart(2, "0")}
              <span
                className="mx-2"
                style={{ color: "rgba(255,245,235,0.20)" }}
              >
                ·
              </span>
              {currentBlock}
              <span
                className="mx-2"
                style={{ color: "rgba(255,245,235,0.20)" }}
              >
                ·
              </span>
              Camada {String(blockIndex + 1).padStart(2, "0")}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div
              className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-full text-[11px]"
              style={{
                background: "rgba(255,255,255,0.026)",
                border: "1px solid rgba(242,185,104,0.10)",
                color: "rgba(255,245,235,0.62)",
              }}
            >
              <span style={{ color: theme.accent }}>◇</span>
              {answeredQuestions} sinais registrados
            </div>

            <div
              className="px-3 py-2 rounded-full text-[11px]"
              style={{
                background: captured ? "rgba(120,255,160,0.075)" : theme.glow,
                border: captured
                  ? "1px solid rgba(120,255,160,0.16)"
                  : `1px solid ${theme.glow}`,
                color: captured ? "#9BE7AE" : theme.accent,
              }}
            >
              {captured ? "Sinal capturado" : `${blockProgress}% da camada`}
            </div>
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
                    y: 18,
                    filter: "blur(10px)",
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
                    y: -14,
                    filter: "blur(8px)",
                  }
            }
            transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
            className="relative overflow-hidden rounded-[34px] md:rounded-[46px] px-5 py-6 md:px-8 md:py-7 xl:px-10 xl:py-8 min-h-[500px] flex flex-col justify-between"
            style={{
              background:
                "radial-gradient(circle at top, rgba(255,255,255,0.052), transparent 38%), linear-gradient(180deg, rgba(255,255,255,0.032), rgba(255,255,255,0.010))",
              border: `1px solid ${theme.glow}`,
              boxShadow: `0 0 64px ${theme.glow}, inset 0 0 54px rgba(255,255,255,0.012)`,
            }}
          >
            <div
              className="absolute inset-[14px] rounded-[26px] md:rounded-[36px] pointer-events-none"
              style={{ border: "1px solid rgba(242,185,104,0.055)" }}
            />

            <div className="relative z-10 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div
                  className="h-12 w-12 rounded-full flex items-center justify-center text-sm shrink-0"
                  style={{
                    background: "rgba(5,2,2,0.54)",
                    border: `1px solid ${theme.glow}`,
                    color: theme.accent,
                    boxShadow: `0 0 28px ${theme.glow}, inset 0 0 18px rgba(255,255,255,0.018)`,
                    fontWeight: 700,
                  }}
                >
                  {theme.symbol}
                </div>

                <div>
                  <p
                    className="uppercase tracking-[0.24em] text-[8px] mb-1"
                    style={{ color: colors.goldSoft }}
                  >
                    {currentBlock}
                  </p>

                  <p
                    className="text-xs md:text-sm"
                    style={{ color: "rgba(255,245,235,0.58)" }}
                  >
                    {blockDescriptions[currentBlock]}
                  </p>
                </div>
              </div>

              <div className="hidden md:flex items-center gap-1.5">
                {progressDots.map((dot) => (
                  <span
                    key={dot.id}
                    className="h-2 w-2 rounded-full"
                    style={{
                      background: dot.answered
                        ? theme.accent
                        : dot.active
                          ? "rgba(255,245,235,0.46)"
                          : "rgba(255,255,255,0.13)",
                      boxShadow: dot.active ? `0 0 18px ${theme.glow}` : "none",
                    }}
                  />
                ))}
              </div>
            </div>

            <div className="relative z-10 text-center max-w-4xl mx-auto py-5 md:py-7">
              <p
                className="uppercase tracking-[0.28em] text-[8px] md:text-[9px] mb-5"
                style={{ color: "rgba(255,245,235,0.45)" }}
              >
                Pergunta {questionIndexInBlock + 1} de{" "}
                {currentBlockQuestions.length}
              </p>

              <h3
                className="text-[30px] md:text-5xl xl:text-[48px] leading-[1.04] max-w-[860px] mx-auto [text-wrap:balance]"
                style={{
                  color: colors.text,
                  fontWeight: 690,
                  letterSpacing: "-0.072em",
                  textShadow: `0 0 42px ${theme.glow}`,
                }}
              >
                {currentQuestion.pergunta}
              </h3>
            </div>

            <div className="relative z-10">
              <div className="max-w-3xl mx-auto mb-5">
                <AnimatePresence mode="wait">
                  <motion.p
                    key={captured ? `captured-${selectedValue}` : "empty"}
                    initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                    animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                    exit={reduceMotion ? undefined : { opacity: 0, y: -8 }}
                    transition={{ duration: 0.24 }}
                    className="text-center text-xs md:text-sm mb-4"
                    style={{ color: captured ? "#9BE7AE" : colors.muted }}
                  >
                    {captured
                      ? "Sinal registrado. O espelho avança para a próxima leitura..."
                      : "Escolha a intensidade que mais se aproxima da sua verdade atual."}
                  </motion.p>
                </AnimatePresence>

                <div className="grid grid-cols-5 gap-2 md:gap-3 relative z-10">
                  {scaleLabels.map((item) => {
                    const active = selectedValue === item.value;

                    return (
                      <motion.button
                        key={item.value}
                        type="button"
                        onClick={() => onAnswer(currentQuestion.id, item.value)}
                        whileHover={
                          reduceMotion ? undefined : { y: -3, scale: 1.015 }
                        }
                        whileTap={reduceMotion ? undefined : { scale: 0.96 }}
                        className="group flex flex-col items-center gap-2 rounded-[18px] px-1 py-2 md:px-2 md:py-3 transition-colors duration-300"
                        style={{
                          background: active
                            ? `radial-gradient(circle at top, ${theme.glow}, transparent 62%), rgba(255,255,255,0.026)`
                            : "rgba(255,255,255,0.008)",
                          border: active
                            ? `1px solid ${theme.accent}`
                            : "1px solid rgba(242,185,104,0.055)",
                          boxShadow: active
                            ? `0 0 30px ${theme.glow}, inset 0 0 18px rgba(255,255,255,0.012)`
                            : "inset 0 0 12px rgba(255,255,255,0.004)",
                        }}
                      >
                        <motion.span
                          className="h-11 w-11 rounded-full flex items-center justify-center text-sm"
                          animate={
                            active && !reduceMotion
                              ? { scale: [1, 1.1, 1] }
                              : { scale: 1 }
                          }
                          transition={{
                            duration: 1.2,
                            repeat: active && !reduceMotion ? Infinity : 0,
                            ease: "easeInOut",
                          }}
                          style={{
                            background: active
                              ? theme.accent
                              : "rgba(242,185,104,0.090)",
                            border: active
                              ? `1px solid ${theme.accent}`
                              : "1px solid rgba(242,185,104,0.16)",
                            color: active ? "#090506" : theme.accent,
                            fontWeight: 800,
                            boxShadow: active
                              ? `0 0 30px ${theme.glow}`
                              : "none",
                          }}
                        >
                          {item.value}
                        </motion.span>

                        <span
                          className="text-[11px] md:text-xs leading-tight"
                          style={{
                            color: active ? theme.accent : colors.text,
                            fontWeight: 700,
                          }}
                        >
                          {item.short}
                        </span>
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              <div
                className="max-w-3xl mx-auto rounded-[24px] px-4 py-3 md:px-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
                style={{
                  background: "rgba(5,2,2,0.30)",
                  border: "1px solid rgba(242,185,104,0.08)",
                }}
              >
                {canGoBack ? (
                  <motion.button
                    type="button"
                    onClick={onBack}
                    whileHover={reduceMotion ? undefined : { x: -2 }}
                    whileTap={reduceMotion ? undefined : { scale: 0.98 }}
                    className="px-4 py-2.5 rounded-full text-xs md:text-sm w-fit"
                    style={{
                      background: "rgba(255,255,255,0.020)",
                      border: "1px solid rgba(242,185,104,0.12)",
                      color: "rgba(255,245,235,0.66)",
                    }}
                  >
                    ← Voltar sinal anterior
                  </motion.button>
                ) : (
                  <span
                    className="hidden md:block text-xs"
                    style={{ color: "rgba(255,245,235,0.28)" }}
                  >
                    Primeiro sinal desta leitura
                  </span>
                )}

                <div className="grid grid-cols-2 gap-4 md:gap-6 flex-1">
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
                        className="relative overflow-hidden h-1.5 rounded-full"
                        style={{ background: "rgba(255,255,255,0.045)" }}
                      >
                        <motion.div
                          className="absolute left-0 top-0 h-full rounded-full"
                          animate={{ width: `${item.value}%` }}
                          transition={{
                            duration: 0.5,
                            ease: [0.22, 1, 0.36, 1],
                          }}
                          style={{
                            background: `linear-gradient(90deg, ${theme.glow}, ${theme.accent})`,
                            boxShadow: `0 0 22px ${theme.glow}`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.section>
  );
}

function ReadingLayerPanel({ layer }) {
  if (!layer) return null;

  const paragraphs = String(layer.content || "")
    .split(/\n+/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
  const [leadParagraph, ...bodyParagraphs] = paragraphs;

  return (
    <motion.article
      key={layer.number}
      initial={{ opacity: 0, y: 16, filter: "blur(8px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      exit={{ opacity: 0, y: -10, filter: "blur(6px)" }}
      transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
      className="relative overflow-hidden rounded-[24px] md:rounded-[30px] min-h-[350px] lg:h-[430px]"
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

      <div className="absolute inset-y-0 right-0 hidden h-full w-[46%] lg:block">
        <img
          src={layer.image}
          alt={layer.eyebrow}
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

      <div className="relative z-10 min-h-[350px] lg:h-[430px]">
        <div className="p-5 md:p-6 xl:p-7 flex min-h-[350px] lg:h-[430px] max-w-full min-h-0 flex-col justify-center lg:max-w-[54%]">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span
              className="w-10 h-10 rounded-full flex items-center justify-center text-xs"
              style={{
                background: "rgba(242,185,104,0.09)",
                border: "1px solid rgba(242,185,104,0.16)",
                color: "var(--gold-primary)",
                boxShadow: "0 0 26px rgba(242,185,104,0.07)",
                fontWeight: 700,
              }}
            >
              {layer.number}
            </span>

            <div>
              <p
                className="uppercase tracking-[0.34em] text-[9px] mb-1"
                style={{ color: "var(--gold-soft)" }}
              >
                {layer.eyebrow}
              </p>
              <p className="text-xs" style={{ color: "rgba(255,245,235,0.48)" }}>
                Camada ativa da leitura
              </p>
            </div>
          </div>

          <h3
            className="text-3xl md:text-4xl xl:text-[44px] leading-[0.98] mb-4 whitespace-pre-line max-w-3xl"
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
            className="text-sm leading-relaxed max-w-2xl mb-4"
            style={{ color: "rgba(255,245,235,0.66)" }}
          >
            {layer.description}
          </p>

          <div
            className="max-w-3xl min-h-0 max-h-[176px] md:max-h-[188px] lg:max-h-[190px] overflow-y-auto pr-2"
            style={{
              scrollbarWidth: "thin",
              scrollbarColor: "rgba(242,185,104,0.22) transparent",
            }}
          >
            {leadParagraph && (
              <div
                className="rounded-[18px] p-4 mb-3"
                style={{
                  background:
                    "linear-gradient(90deg, rgba(242,185,104,0.052), rgba(255,255,255,0.010))",
                  border: "1px solid rgba(242,185,104,0.09)",
                  backdropFilter: "blur(8px)",
                  WebkitBackdropFilter: "blur(8px)",
                }}
              >
                <p
                  className="text-sm md:text-base leading-relaxed"
                  style={{ color: "var(--text-primary)" }}
                >
                  {leadParagraph}
                </p>
              </div>
            )}

            <div className="space-y-3">
            {bodyParagraphs.map((paragraph, index) => (
              <p
                key={`${layer.number}-${index}`}
                className="text-sm leading-[1.72]"
                style={{ color: "rgba(255,245,235,0.70)" }}
              >
                {paragraph}
              </p>
            ))}
            </div>
          </div>
        </div>
      </div>
    </motion.article>
  );
}

function LayerTabNavigation({ tabs, activeNumber, onSelect }) {
  const activeIndex = Math.max(
    tabs.findIndex((item) => item.number === activeNumber),
    0,
  );
  const progress =
    tabs.length > 0 ? Math.round(((activeIndex + 1) / tabs.length) * 100) : 0;

  return (
    <div className="relative z-10 mb-4">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3 mb-3">
        <div>
          <p
            className="uppercase tracking-[0.30em] text-[8px] md:text-[9px] mb-1"
            style={{ color: "var(--gold-soft)" }}
          >
            Trilha ativa
          </p>
          <p className="text-xs" style={{ color: "rgba(255,245,235,0.54)" }}>
            Camada {activeIndex + 1} de {tabs.length}
          </p>
        </div>

        <div className="w-full md:w-56">
          <div className="flex items-center justify-between mb-1.5">
            <span
              className="text-[10px]"
              style={{ color: "rgba(255,245,235,0.45)" }}
            >
              Progresso do núcleo
            </span>
            <span className="text-[10px]" style={{ color: "var(--gold-soft)" }}>
              {progress}%
            </span>
          </div>
          <div
            className="h-1.5 rounded-full overflow-hidden"
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

      <div className="relative grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-2">
        {tabs.map((item, index) => {
          const isActive = activeNumber === item.number;
          const isPast = index < activeIndex;

          return (
            <motion.button
              key={item.number}
              type="button"
              onClick={() => onSelect(item.number)}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="group relative overflow-hidden rounded-[18px] p-3 text-left transition-all duration-300"
              style={{
                background: isActive
                  ? "linear-gradient(180deg, rgba(242,185,104,0.13), rgba(242,185,104,0.04))"
                  : "rgba(255,255,255,0.022)",
                border: isActive
                  ? "1px solid rgba(242,185,104,0.28)"
                  : "1px solid rgba(242,185,104,0.08)",
                boxShadow: isActive
                  ? "0 0 24px rgba(242,185,104,0.075), inset 0 0 18px rgba(242,185,104,0.018)"
                  : "inset 0 0 16px rgba(255,255,255,0.006)",
              }}
            >
              <div className="flex items-center gap-2 mb-2">
                <span
                  className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] shrink-0"
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
                    fontWeight: 700,
                  }}
                >
                  {item.number}
                </span>
                <span
                  className="text-[9px] uppercase tracking-[0.22em]"
                  style={{
                    color: isActive
                      ? "var(--gold-primary)"
                      : "rgba(255,245,235,0.42)",
                  }}
                >
                  {isActive ? "Ativa" : isPast ? "Lida" : "Selada"}
                </span>
              </div>
              <p
                className="text-xs md:text-sm leading-tight"
                style={{
                  color: isActive
                    ? "var(--text-primary)"
                    : "rgba(255,245,235,0.62)",
                  fontWeight: 600,
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
  const reduceMotion = useReducedMotion();
  const location = useLocation();
  const navigate = useNavigate();
  const isReadingRoute =
    location.pathname.includes("/leitura") ||
    location.pathname === "/quiz-produto-1";

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
    if (!isLoadingResult) return;

    let currentStep = 0;

    const interval = setInterval(() => {
      currentStep++;

      if (currentStep < loadingMessages.length) {
        setLoadingStep(currentStep);
      }
    }, 1350);

    return () => clearInterval(interval);
  }, [isLoadingResult]);

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

    setTimeout(() => {
      quizRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 80);
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
    }, 620);
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex <= 0) return;

    setCompletedLayer(null);
    setPendingNextIndex(null);
    setCurrentQuestionIndex((prev) => Math.max(prev - 1, 0));

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

  const report = result ? reports[result.nomeComposto] : null;
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
    estruturaInternaTabs.find((item) => item.number === activeEstruturaInterna) ||
    estruturaInternaTabs[0];
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
            className="mt-8 mb-10 rounded-[30px] md:rounded-[42px] p-6 md:p-8"
            style={{
              background:
                "radial-gradient(circle at top right, rgba(242,185,104,0.10), transparent 34%), linear-gradient(180deg, rgba(18,9,10,0.72), rgba(5,2,2,0.92))",
              border: "1px solid rgba(242,185,104,0.13)",
              boxShadow:
                "0 0 70px rgba(242,185,104,0.035), inset 0 0 44px rgba(255,255,255,0.010)",
            }}
          >
            <Eyebrow className="mb-4">Leitura já revelada</Eyebrow>

            <h2
              className="text-3xl md:text-5xl leading-[0.98] mb-4"
              style={{
                color: colors.gold,
                fontWeight: 680,
                letterSpacing: "-0.065em",
              }}
            >
              Seu Código das Deusas já foi nomeado.
            </h2>

            <p
              className="text-sm md:text-base leading-relaxed max-w-3xl mb-6"
              style={{ color: colors.soft }}
            >
              Sua primeira camada já está salva no Portal ORI. Você pode acessar
              o Espelho ORI para ver a jornada aberta ou refazer a leitura se
              quiser reiniciar seus sinais.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                to="/espelho-ori"
                className="inline-flex justify-center px-7 py-3.5 rounded-full text-sm"
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
                className="inline-flex justify-center px-7 py-3.5 rounded-full text-sm disabled:opacity-60 disabled:cursor-not-allowed"
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
      className="relative min-h-screen overflow-hidden px-4 py-5 md:px-7 md:py-6"
      style={{ color: colors.text }}
    >
      <video
        className="fixed inset-0 -z-30 h-full w-full object-cover opacity-[0.24]"
        src="/videos/quiz/camara-leitura-ori.mp4"
        autoPlay
        loop
        muted
        playsInline
      />

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

        {isLoadingResult && (
          <LoadingDossie
            loadingStep={loadingStep}
            loadingRef={loadingRef}
            reduceMotion={reduceMotion}
          />
        )}

        {showQuiz && !result && (
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
                  reduceMotion={reduceMotion}
                />
              )}

              {hasStarted && !completedLayer && currentQuestion && (
                <QuizQuestionView
                  key={currentQuestion.id}
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

        {result && (
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
                <div className="flex flex-col gap-5 md:gap-6">
                  <section
                    className="relative overflow-hidden rounded-[22px] md:rounded-[26px] mb-4 p-3 md:p-4"
                    style={{
                      background:
                        "linear-gradient(135deg, rgba(18,9,10,0.68), rgba(5,2,2,0.88))",
                      border: "1px solid rgba(242,185,104,0.10)",
                      boxShadow:
                        "0 0 42px rgba(242,185,104,0.03), inset 0 0 24px rgba(255,255,255,0.01)",
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

                    <div className="relative z-10">
                      <p
                        className="uppercase tracking-[0.32em] text-[9px] md:text-[10px] mb-3"
                        style={{ color: "var(--gold-soft)" }}
                      >
                        Navegação da Leitura
                      </p>

                      <div className="grid md:grid-cols-4 gap-2.5">
                        {resultCoreTabs.map((item) => {
                          const isActive = activeResultCore === item.id;

                          return (
                          <button
                            key={item.number}
                            type="button"
                            onClick={() => setActiveResultCore(item.id)}
                            className="text-left rounded-[18px] p-3 transition-all duration-500 hover:-translate-y-0.5"
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
                            <div className="flex items-center gap-3 mb-2">
                              <div
                                className="w-9 h-9 rounded-[13px] flex items-center justify-center shrink-0"
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
                                <span className="text-sm font-medium tracking-[-0.06em]">
                                  {item.number}
                                </span>
                              </div>

                              <div
                                className="h-px flex-1"
                                style={{
                                  background:
                                    "linear-gradient(90deg, rgba(242,185,104,0.28), transparent)",
                                }}
                              />
                            </div>

                            <h3
                              className="text-sm md:text-[15px] mb-1"
                              style={{
                                color: "var(--text-primary)",
                                fontWeight: 600,
                                letterSpacing: "-0.03em",
                              }}
                            >
                              {item.title}
                            </h3>

                            <p
                              className="text-xs leading-relaxed"
                              style={{ color: "rgba(255,245,235,0.60)" }}
                            >
                              {item.text}
                            </p>
                          </button>
                          );
                        })}
                      </div>
                    </div>
                  </section>

                  {activeResultCore === "estrutura" && (
                    <>
                  <section
                    id="nucleo-estrutura-interna"
                    className="relative overflow-hidden rounded-[24px] md:rounded-[30px] p-3 md:p-4"
                    style={{
                      background:
                        "radial-gradient(circle at top right, rgba(242,185,104,0.09), transparent 34%), linear-gradient(180deg, rgba(18,9,10,0.62), rgba(5,2,2,0.86))",
                      border: "1px solid rgba(242,185,104,0.10)",
                      boxShadow:
                        "0 0 48px rgba(242,185,104,0.032), inset 0 0 28px rgba(255,255,255,0.010)",
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
                    className="relative overflow-hidden rounded-[24px] md:rounded-[30px] p-3 md:p-4"
                    style={{
                      background:
                        "radial-gradient(circle at top right, rgba(242,185,104,0.09), transparent 34%), linear-gradient(180deg, rgba(18,9,10,0.62), rgba(5,2,2,0.86))",
                      border: "1px solid rgba(242,185,104,0.10)",
                      boxShadow:
                        "0 0 48px rgba(242,185,104,0.032), inset 0 0 28px rgba(255,255,255,0.010)",
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
                    className="relative overflow-hidden rounded-[24px] md:rounded-[30px] p-3 md:p-4"
                    style={{
                      background:
                        "radial-gradient(circle at top right, rgba(242,185,104,0.09), transparent 34%), linear-gradient(180deg, rgba(18,9,10,0.62), rgba(5,2,2,0.86))",
                      border: "1px solid rgba(242,185,104,0.10)",
                      boxShadow:
                        "0 0 48px rgba(242,185,104,0.032), inset 0 0 28px rgba(255,255,255,0.010)",
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
                    className="relative overflow-hidden rounded-[24px] md:rounded-[30px] p-3 md:p-4"
                    style={{
                      background:
                        "radial-gradient(circle at top right, rgba(242,185,104,0.09), transparent 34%), linear-gradient(180deg, rgba(18,9,10,0.62), rgba(5,2,2,0.86))",
                      border: "1px solid rgba(242,185,104,0.10)",
                      boxShadow:
                        "0 0 48px rgba(242,185,104,0.032), inset 0 0 28px rgba(255,255,255,0.010)",
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
                    className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 rounded-[26px] p-5"
                    style={{
                      background:
                        "linear-gradient(180deg, rgba(18,9,10,0.58), rgba(5,2,2,0.82))",
                      border: "1px solid rgba(242,185,104,0.10)",
                      boxShadow: "inset 0 0 24px rgba(255,255,255,0.010)",
                    }}
                  >
                    <div>
                      <p
                        className="uppercase tracking-[0.28em] text-[9px] mb-2"
                        style={{ color: "var(--gold-soft)" }}
                      >
                        Fluxo da leitura
                      </p>
                      <p
                        className="text-sm md:text-base leading-relaxed"
                        style={{ color: "rgba(255,245,235,0.68)" }}
                      >
                        {resultFlowText}
                      </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                      {previousResultCore && (
                        <button
                          type="button"
                          onClick={() => setActiveResultCore(previousResultCore.id)}
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

                      <button
                        type="button"
                        onClick={handleResultFlowNext}
                        className="px-6 py-3 rounded-full text-sm"
                        style={{
                          background: "var(--gold-primary)",
                          color: "#090506",
                          fontWeight: 700,
                          boxShadow:
                            "0 0 34px rgba(242,185,104,0.14), inset 0 0 14px rgba(255,255,255,0.16)",
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
