import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

import { supabase } from "../lib/supabaseClient";
import { reports } from "../data/reports";
import { MirrorSectionNav } from "../components/espelho/EspelhoInteractions";
import { getCurrentJornada } from "../services/api";
import SyncNotice from "../components/SyncNotice";

const LEGACY_STORAGE_KEY = "ori_produto_1_quiz";
const ONBOARDING_DATA_KEY = "ori_onboarding_data";
const MIRROR_HERO_IMAGE = "/images/heroes/hero-espelho-ori.png";
const ORACLE_PANEL_BACKGROUND =
  "radial-gradient(circle at 88% 12%, rgba(242,185,104,0.09), transparent 34%), radial-gradient(circle at 8% 92%, rgba(183,140,255,0.05), transparent 34%), linear-gradient(90deg, rgba(5,2,2,0.88), rgba(5,2,2,0.68), rgba(5,2,2,0.92)), url('/images/espelho-ori/oraculo/fundo-oraculo-premium.png')";
const SHOW_LEGACY_MIRROR_SECTIONS = false;

const colors = {
  gold: "var(--gold-primary)",
  goldSoft: "#d9a45f",
  title: "#ead8bf",
  titleSoft: "rgba(234,216,191,0.78)",
  headingSection: "#e2ccb0",
  headingActive: "#d6a05f",
  headingReading: "#dcc6b0",
  text: "rgba(247,234,216,0.62)",
  muted: "rgba(247,234,216,0.42)",
  quiet: "rgba(247,234,216,0.34)",
  eyebrow: "rgba(210,135,70,0.86)",
  border: "rgba(242,185,104,0.12)",
  borderSoft: "rgba(242,185,104,0.075)",
};

const fallbackReflection = {
  fraseHero:
    "Sua imagem revela aquilo que sua essência já sabe, mas ainda não aprendeu a expressar por completo.",
  reconhecimento:
    "Sua primeira camada ainda está aguardando revelação. Quando você iniciar o Código das Deusas, o Espelho ORI começará a mostrar os padrões simbólicos que moldam sua presença, sua imagem e a forma como você ocupa o mundo.",
  essencia:
    "O Espelho ORI será preenchido conforme sua jornada avançar. Cada etapa revela uma parte da sua identidade: primeiro a estrutura interna, depois a tradução visual, por fim a síntese completa da sua presença.",
  sombra:
    "Antes da primeira leitura, algumas camadas permanecem ocultas. Isso não é ausência. É potencial ainda não nomeado.",
  essenciaImagem:
    "Sua imagem será construída em etapas, respeitando sua essência, seus códigos visuais e sua forma única de ser percebida.",
  presenca:
    "Sua presença será revelada conforme sua essência começar a ganhar linguagem visual, simbólica e estética.",
};

function getPreview(text = "", maxLength = 360) {
  if (!text) return "";

  const cleanText = String(text).replace(/\n+/g, " ").trim();

  if (cleanText.length <= maxLength) {
    return cleanText;
  }

  const preview = cleanText.slice(0, maxLength).trim();
  const sentenceEnd = Math.max(
    preview.lastIndexOf("."),
    preview.lastIndexOf("!"),
    preview.lastIndexOf("?"),
  );

  if (sentenceEnd > 80) {
    return preview.slice(0, sentenceEnd + 1);
  }

  return `${preview.replace(/[,;:]?$/, "")}.`;
}

function formatSymbolicFormula(text = "") {
  const cleanText = String(text).replace(/\n+/g, " ").trim();

  if (!cleanText) {
    return "INTUIÇÃO • LIBERDADE • MISTÉRIO";
  }

  return cleanText
    .replace(/[.!?]+$/g, "")
    .replace(/\s*(\+|•|\||\/)\s*/g, " • ")
    .replace(/\s{2,}/g, " ")
    .toLocaleUpperCase("pt-BR");
}

function formatArchetypeName(text = "") {
  return String(text)
    .replace(/\n+/g, " ")
    .trim()
    .toLocaleLowerCase("pt-BR")
    .replace(/(^|\s)\p{L}/gu, (letter) => letter.toLocaleUpperCase("pt-BR"));
}

const getQuizStorageKey = (userId) => {
  return userId ? `ori_produto_1_quiz_${userId}` : null;
};

function getLocalResult(storageKey) {
  if (!storageKey) return null;

  try {
    const savedQuiz = localStorage.getItem(storageKey);
    const parsedQuiz = savedQuiz ? JSON.parse(savedQuiz) : null;

    return parsedQuiz?.result || null;
  } catch (error) {
    console.log("Erro ao ler resultado local:", error);
    return null;
  }
}

function Eyebrow({ children, className = "" }) {
  return (
    <p
      className={`ori-type-system ori-label-md mb-4 ${className}`}
      style={{ color: colors.eyebrow }}
    >
      {children}
    </p>
  );
}

function AtrioLineLabel({ children, className = "" }) {
  return (
    <div className={`inline-flex items-center gap-4 ${className}`}>
      <div
        className="w-8 h-px"
        style={{
          background:
            "linear-gradient(90deg, var(--gold-primary), transparent)",
        }}
      />

      <p
        className="ori-type-system ori-label-lg"
        style={{ color: "var(--gold-soft)" }}
      >
        {children}
      </p>
    </div>
  );
}

function parseProfileData(profile) {
  if (!profile) return {};

  if (typeof profile === "string") {
    try {
      return JSON.parse(profile);
    } catch (error) {
      console.log("Erro ao ler perfil onboarding:", error);
      return {};
    }
  }

  if (typeof profile === "object") return profile;

  return {};
}

function formatProfileValue(value) {
  if (Array.isArray(value)) return value.filter(Boolean).join(", ");
  return value || "";
}

function hasProfileValue(value) {
  if (Array.isArray(value)) return value.filter(Boolean).length > 0;
  return Boolean(String(value || "").trim());
}

function mergeProfileData(...profiles) {
  return profiles.reduce((mergedProfile, profile) => {
    Object.entries(profile || {}).forEach(([key, value]) => {
      if (hasProfileValue(value)) {
        mergedProfile[key] = value;
      }
    });

    return mergedProfile;
  }, {});
}

function getLocalOnboardingProfile(user) {
  const userKeys = [user?.id, user?.email].filter(Boolean);
  const storageKeys = [
    ...userKeys.map((userKey) => `${ONBOARDING_DATA_KEY}:${userKey}`),
    ONBOARDING_DATA_KEY,
  ];

  for (const storageKey of storageKeys) {
    try {
      const storedProfile = localStorage.getItem(storageKey);
      if (storedProfile) return parseProfileData(storedProfile);
    } catch (error) {
      console.log("Erro ao ler perfil local do onboarding:", error);
    }
  }

  return {};
}

function MotionSection({
  children,
  className = "",
  style = {},
  reduceMotion,
  ...props
}) {
  void reduceMotion;

  return (
    <section
      className={className}
      style={style}
      {...props}
    >
      {children}
    </section>
  );
}

function MirrorHero() {
  return (
    <section
      className="ori-main-frame ori-hero-panel cinematic-card relative mb-5 min-h-[370px] overflow-hidden rounded-[24px] md:min-h-[520px] md:rounded-[42px]"
      style={{
        backgroundColor: "rgba(5,2,2,0.94)",
        backgroundImage:
          "radial-gradient(circle at 70% 18%, rgba(242,185,104,0.13), transparent 30%), radial-gradient(circle at 14% 84%, rgba(183,140,255,0.045), transparent 32%), linear-gradient(90deg, rgba(5,2,2,0.94), rgba(5,2,2,0.72), rgba(5,2,2,0.92)), url('/images/espelho-ori/oraculo/fundo-oraculo-premium.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        border: "1px solid rgba(242,185,104,0.14)",
        boxShadow:
          "0 0 82px rgba(242,185,104,0.04), inset 0 0 70px rgba(255,255,255,0.012)",
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
      }}
    >
      <img
        src={MIRROR_HERO_IMAGE}
        alt=""
        className="pointer-events-none absolute inset-0 h-full w-full select-none object-cover"
        loading="eager"
        decoding="async"
        style={{ objectPosition: "58% center" }}
      />

      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(90deg, rgba(5,2,2,0.96) 0%, rgba(5,2,2,0.84) 34%, rgba(5,2,2,0.36) 62%, rgba(5,2,2,0.68) 100%), linear-gradient(180deg, rgba(5,2,2,0.08), rgba(5,2,2,0.58))",
        }}
      />

      <div className="relative z-10 grid min-h-[370px] gap-4 px-4 py-7 md:min-h-[520px] md:gap-7 md:px-8 md:py-8 xl:grid-cols-[0.58fr_0.42fr] xl:px-11 xl:py-9">
        <div className="flex max-w-2xl flex-col justify-center">
          <AtrioLineLabel className="mb-3 md:mb-6">Espelho ORI</AtrioLineLabel>

          <h1
            className="ori-type-hero mb-3 max-w-3xl text-[34px] md:mb-6 md:text-[60px] xl:text-[66px]"
            style={{
              color: "var(--gold-primary)",
              fontWeight: 540,
              letterSpacing: "-0.072em",
              textShadow: "0 0 38px rgba(242,185,104,0.10)",
            }}
          >
            Seu Espelho ORI está tomando forma.
          </h1>

          <div
            className="mb-4 h-px max-w-[13rem] md:mb-6 md:max-w-sm"
            style={{
              background:
                "linear-gradient(90deg, rgba(242,185,104,0.40), rgba(242,185,104,0.08), transparent)",
            }}
          />

          <p
            className="ori-type-reading mb-4 max-w-xl text-[15px] md:mb-5 md:text-lg"
            style={{ color: "rgba(255,245,235,0.64)" }}
          >
            Aqui você acompanha o que já foi revelado, o que está em tradução e
            o que ainda permanece selado.
          </p>

          <p
            className="ori-type-reading mb-7 hidden max-w-xl border-l pl-5 text-base md:block md:text-lg"
            style={{
              borderColor: "rgba(242,185,104,0.26)",
              color: colors.gold,
              fontWeight: 420,
              letterSpacing: "-0.018em",
            }}
          >
            Cada camada guarda uma síntese prática da sua jornada: resultado,
            direção, ponto de atenção e próximo movimento.
          </p>

          <div className="flex flex-col gap-2.5 sm:flex-row sm:gap-3">
            <a
              href="#espelho-resultados"
              className="ori-journey-action inline-flex justify-center rounded-full px-6 py-3 text-sm md:px-7 md:py-3.5"
              style={{
                background:
                  "linear-gradient(90deg, var(--copper-primary), var(--gold-primary))",
                color: "#090506",
                fontWeight: 680,
                boxShadow:
                  "0 0 34px rgba(242,185,104,0.16), inset 0 0 14px rgba(255,255,255,0.16)",
              }}
            >
              Ver minha jornada
            </a>

            <Link
              to="/oraculo"
              className="ori-button-secondary inline-flex justify-center px-5 py-2.5 text-xs md:px-7 md:py-3.5 md:text-sm"
              style={{
                background: "rgba(255,255,255,0.020)",
                border: "1px solid rgba(242,185,104,0.16)",
                color: "rgba(255,245,235,0.78)",
                fontWeight: 540,
                backdropFilter: "blur(10px)",
                WebkitBackdropFilter: "blur(10px)",
              }}
            >
              Abrir Oráculo ORI
            </Link>
          </div>
        </div>

        <div className="hidden xl:block" aria-hidden="true" />
      </div>
    </section>
  );
}

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

function EspelhoOri() {
  const prefersReducedMotion = useReducedMotion();
  const mobileMotionOff = useMobileMotionOff();
  const reduceMotion = prefersReducedMotion || mobileMotionOff;

  const [cliente, setCliente] = useState(null);
  const [jornadaApi, setJornadaApi] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeMirrorTab, setActiveMirrorTab] = useState("essencia");
  const [localResult, setLocalResult] = useState(null);
  const [localOnboardingProfile, setLocalOnboardingProfile] = useState({});
  const [expandedMirrorLayer, setExpandedMirrorLayer] = useState(false);
  const [activeMatrixItem, setActiveMatrixItem] = useState("Arquétipo");
  const [activeMatrixLayer, setActiveMatrixLayer] = useState("revelado");
  const [activeJourneyStep, setActiveJourneyStep] = useState("integracao");
  const [expandedResultItems, setExpandedResultItems] = useState({});
  const [syncNotice, setSyncNotice] = useState("");

  useEffect(() => {
    async function loadCliente() {
      setLoading(true);

      const { data: sessionData } = await supabase.auth.getSession();
      const user = sessionData?.session?.user;

      if (!user?.id) {
        setCliente(null);
        setJornadaApi(null);
        setLocalResult(null);
        setLocalOnboardingProfile({});
        setLoading(false);
        return;
      }

      const storageKey = getQuizStorageKey(user.id);
      const revealedLocalResult = getLocalResult(storageKey);
      const storedOnboardingProfile = getLocalOnboardingProfile(user);

      localStorage.removeItem(LEGACY_STORAGE_KEY);
      setLocalResult(revealedLocalResult);
      setLocalOnboardingProfile(storedOnboardingProfile);

      try {
        const jornadaData = await getCurrentJornada();
        setJornadaApi(jornadaData);
        setSyncNotice("");
      } catch (apiError) {
        console.log("API da jornada indisponível no Espelho:", apiError);
        setJornadaApi(null);
        setSyncNotice(
          apiError?.userMessage ||
            "Estamos usando seu reflexo salvo enquanto o ORI termina a sincronização.",
        );
      }

      let { data, error } = await supabase
        .from("clientes")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) {
        console.log("Erro ao buscar cliente:", error);
      }

      if (!data && user.email) {
        const { data: emailData, error: emailError } = await supabase
          .from("clientes")
          .select("*")
          .ilike("email", user.email)
          .maybeSingle();

        if (emailError) {
          console.log("Erro ao buscar cliente por e-mail:", emailError);
        }

        data = emailData || null;
      }

      setCliente(data || null);
      setLoading(false);
    }

    loadCliente();
  }, []);

  const resultadoFinal =
    jornadaApi?.resultado || cliente?.resultado || localResult?.nomeComposto || null;

  const report = resultadoFinal ? reports[resultadoFinal] : null;
  const reflection = report || fallbackReflection;

  const principal =
    cliente?.arquetipo_principal ||
    localResult?.principal ||
    report?.combinacao?.split("+")?.[0]?.trim() ||
    "Arquétipo principal";

  const secundario =
    cliente?.arquetipo_secundario ||
    localResult?.secundario ||
    report?.combinacao?.split("+")?.[1]?.trim() ||
    "Arquétipo secundário";

  const produto2Liberado =
    jornadaApi?.produto_2_liberado ?? cliente?.produto_2_liberado ?? false;
  const produto3Liberado =
    jornadaApi?.produto_3_liberado ?? cliente?.produto_3_liberado ?? false;
  const dossieRevelado = produto2Liberado || produto3Liberado;
  const codigoFinalRevelado = produto3Liberado;

  const hasResult = Boolean(resultadoFinal);
  const onboardingProfile = mergeProfileData(
    localOnboardingProfile,
    parseProfileData(cliente?.perfil_onboarding),
  );
  const profilePain = formatProfileValue(
    onboardingProfile.mainPain === "Quero escrever com minhas palavras"
      ? onboardingProfile.mainPainCustom || onboardingProfile.mainPain
      : onboardingProfile.mainPain || onboardingProfile.mainPainCustom || "",
  );
  const profileObjective = formatProfileValue(onboardingProfile.mainDesire);
  const profileMoment = formatProfileValue(onboardingProfile.journeyStage);

  const mirrorTabs = useMemo(
    () => [
      {
        id: "essencia",
        label: "Essência",
        eyebrow: "Primeira camada",
        title: hasResult
          ? "O que sustenta sua presença"
          : "Sua essência ainda aguarda revelação",
        summary: hasResult
          ? getPreview(reflection.essencia, 210)
          : "A primeira camada do seu Espelho ORI será revelada quando você iniciar o Código das Deusas.",
        fullText: hasResult ? reflection.essencia : fallbackReflection.essencia,
        shows:
          "Mostra a força interna que organiza desejo, proteção, escolha e presença.",
        appears:
          "Aparece na forma como você decide, se preserva, ocupa espaço e sustenta sua imagem.",
        tension:
          "Fortalece quando vira direção. Gera ruído quando tenta caber em expectativas pequenas.",
        aura:
          "radial-gradient(circle at top right, rgba(242,185,104,0.16), transparent 34%), radial-gradient(circle at bottom left, rgba(210,135,70,0.09), transparent 38%)",
      },
      {
        id: "presenca",
        label: "Presença",
        eyebrow: "Segunda camada",
        title: hasResult
          ? "Como sua energia começa a ser percebida"
          : "Sua presença será ativada em camadas",
        summary: hasResult
          ? getPreview(reflection.percebida || reflection.presenca, 210)
          : "O Espelho ORI vai mostrar como sua presença começa a ser lida, sentida e percebida ao longo da jornada.",
        fullText: hasResult
          ? reflection.percebida || reflection.presenca
          : fallbackReflection.presenca,
        shows:
          "Mostra aquilo que chega antes da fala: ritmo, postura, gesto e campo de presença.",
        appears:
          "Aparece no modo como você entra nos espaços, responde ao olhar externo e sustenta sua energia.",
        tension:
          "Fortalece quando corpo e imagem dizem a mesma coisa. Gera ruído quando a presença pede licença demais.",
        aura:
          "radial-gradient(circle at top right, rgba(242,185,104,0.14), transparent 34%), radial-gradient(circle at bottom left, rgba(255,145,88,0.10), transparent 38%)",
      },
      {
        id: "imagem",
        label: "Imagem",
        eyebrow: "Terceira camada",
        title: hasResult
          ? "O que começa a pedir forma"
          : "Sua imagem ainda está em construção",
        summary: hasResult
          ? getPreview(reflection.essenciaImagem, 210)
          : "Sua imagem será construída em etapas. Primeiro a essência é revelada. Depois, ela ganha corpo, cor, cabelo, beleza e presença visual.",
        fullText: hasResult
          ? reflection.essenciaImagem
          : fallbackReflection.essenciaImagem,
        shows:
          "Mostra como a força simbólica começa a pedir cor, textura, forma, beleza e linguagem visual.",
        appears:
          "Aparece nas escolhas que combinam com sua presença e nas escolhas que ainda parecem improvisadas.",
        tension:
          "Fortalece quando vira assinatura. Gera ruído quando vira tendência desconectada de você.",
        aura:
          "radial-gradient(circle at top right, rgba(255,230,190,0.13), transparent 34%), radial-gradient(circle at bottom left, rgba(242,185,104,0.08), transparent 38%)",
      },
      {
        id: "sombra",
        label: "Sombra",
        eyebrow: "Quarta camada",
        title: hasResult
          ? "O ponto que pede consciência"
          : "Sua sombra ainda está oculta",
        summary: hasResult
          ? getPreview(reflection.sombra, 210)
          : "Antes da leitura inicial, alguns padrões ainda permanecem invisíveis. A sombra não é um defeito. É uma camada esperando linguagem.",
        fullText: hasResult ? reflection.sombra : fallbackReflection.sombra,
        shows:
          "Mostra onde uma defesa antiga ainda tenta proteger sua imagem de ser vista por inteiro.",
        appears:
          "Aparece em controle excessivo, apagamento, excesso de adaptação ou escolhas que reduzem sua força.",
        tension:
          "Fortalece quando é integrada. Gera ruído quando governa suas escolhas em silêncio.",
        aura:
          "radial-gradient(circle at top right, rgba(183,140,255,0.14), transparent 34%), radial-gradient(circle at bottom left, rgba(70,40,120,0.11), transparent 38%)",
      },
    ],
    [hasResult, reflection],
  );

  const activeTab = mirrorTabs.find((tab) => tab.id === activeMirrorTab);

  const seasonalColor =
    cliente?.coloracao_sazonal ||
    cliente?.coloracao ||
    cliente?.cartela_sazonal ||
    null;
  const pattonColor =
    cliente?.coloracao_patton ||
    cliente?.cartela_patton ||
    cliente?.patton ||
    null;
  const bodyType =
    cliente?.tipologia_corporal ||
    cliente?.tipo_corporal ||
    cliente?.kibbe ||
    null;
  const hairDiagnosis =
    cliente?.diagnostico_capilar ||
    cliente?.direcao_capilar ||
    cliente?.cabelo ||
    null;
  const imageConnectionIndex =
    cliente?.indice_conexao_imagem ||
    cliente?.indice_conexao ||
    cliente?.conexao_imagem ||
    null;
  const mainPain =
    profilePain ||
    cliente?.principal_dor ||
    cliente?.dor_principal ||
    cliente?.dor_imagem ||
    null;
  const mainObjective =
    profileObjective ||
    cliente?.objetivo_principal ||
    cliente?.objetivo_imagem ||
    cliente?.principal_objetivo ||
    null;
  const currentMoment =
    profileMoment ||
    cliente?.momento_atual ||
    cliente?.estagio_jornada ||
    null;

  const connectionPercent = imageConnectionIndex
    ? Number.parseInt(String(imageConnectionIndex).replace(/\D/g, ""), 10)
    : null;
  const hasConnectionPercent = Number.isFinite(connectionPercent);
  const connectionSafePercent = hasConnectionPercent
    ? Math.min(Math.max(connectionPercent, 0), 100)
    : 0;
  const connectionLabel = imageConnectionIndex
    ? `${imageConnectionIndex}`
    : hasResult
      ? "Conexão em ativação"
      : "Aguardando primeira leitura";
  const centralPainValue =
    mainPain ||
    (hasResult
      ? "A imagem ainda está aprendendo a sustentar a força que já foi nomeada."
      : "A dor central será nomeada quando sua primeira camada abrir.");
  const profileSnapshot = [
    {
      label: "Conexão",
      title: hasConnectionPercent ? connectionLabel : "Presença em formação",
      text: hasConnectionPercent
        ? "O quanto sua imagem já conversa com sua essência."
        : "O primeiro sinal antes da imagem ganhar direção.",
      state: hasConnectionPercent || hasResult ? "revealed" : "next",
    },
    {
      label: "Dor atual",
      title: mainPain || "Ainda não informada",
      text: mainPain
        ? "O ponto que sua imagem quer transformar."
        : "Responda sua entrada ORI para revelar.",
      state: mainPain ? "revealed" : "sealed",
    },
    {
      label: "Objetivo",
      title: mainObjective || "Ainda não informado",
      text: mainObjective
        ? "A direção que guia suas próximas camadas."
        : "Responda sua entrada ORI para revelar.",
      state: mainObjective ? "revealed" : "sealed",
    },
    {
      label: "Momento",
      title: currentMoment || "Em travessia",
      text: currentMoment
        ? "Seu ponto de partida dentro da jornada."
        : "Seu ritmo será revelado na entrada ORI.",
      state: currentMoment ? "revealed" : "next",
    },
  ];

  const matrixItems = [
    {
      label: "Arquétipo",
      caption: "Base simbólica",
      image: "/images/panels/formula.png",
      imagePosition: "center 32%",
      imageHeight: 140,
      value: hasResult ? resultadoFinal : "Aguardando primeira leitura",
      text: hasResult
        ? `${principal} + ${secundario}`
        : "Primeira força ainda selada.",
      impact: hasResult
        ? "Nomeia a base da presença."
        : "Abre o ponto de partida.",
      state: hasResult ? "revealed" : "sealed",
      aura:
        "radial-gradient(circle at top right, rgba(242,185,104,0.17), transparent 36%), radial-gradient(circle at bottom left, rgba(210,135,70,0.10), transparent 38%)",
    },
    {
      label: "Presença",
      caption: "Gestual e percepção",
      image: "/images/panels/presenca.png",
      imagePosition: "center 22%",
      imageHeight: 140,
      value: hasResult ? "Primeira leitura ativa" : "Selada",
      text: hasResult
        ? getPreview(reflection.presenca || reflection.percebida, 92)
        : "Presença ainda em ativação.",
      impact: hasResult
        ? "Mostra o que chega antes da fala."
        : "Revela ritmo e gesto.",
      state: hasResult ? "revealed" : "sealed",
      aura:
        "radial-gradient(circle at top right, rgba(242,185,104,0.14), transparent 36%), radial-gradient(circle at bottom left, rgba(255,145,88,0.10), transparent 38%)",
    },
    {
      label: "Dor central",
      caption: "Ponto de tensão",
      image: "/images/panels/beleza.png",
      imageHeight: 140,
      value: mainPain || "Em consciência",
      text: getPreview(centralPainValue, 96),
      impact: "Transforma ruído em direção.",
      state: mainPain ? "revealed" : "next",
      aura:
        "radial-gradient(circle at top right, rgba(183,140,255,0.14), transparent 36%), radial-gradient(circle at bottom left, rgba(70,40,120,0.10), transparent 38%)",
    },
    {
      label: "Corpo",
      caption: "Forma e proporção",
      image: "/images/panels/modelagem.png",
      imagePosition: "center 8%",
      imageHeight: 140,
      value: bodyType || "Em tradução",
      text: bodyType
        ? "Linhas e proporções em direção."
        : "Forma, caimento e presença física.",
      impact: bodyType
        ? "Sustenta escolha de forma."
        : "Mostra presença e ruído.",
      state: bodyType ? "revealed" : "next",
      aura:
        "radial-gradient(circle at top right, rgba(242,185,104,0.13), transparent 36%), radial-gradient(circle at bottom left, rgba(120,75,42,0.12), transparent 38%)",
    },
    {
      label: "Cor",
      caption: "Sazonal e Patton",
      image: "/images/panels/paleta.png",
      imageHeight: 140,
      value:
        seasonalColor ||
        (pattonColor ? `Patton: ${pattonColor}` : "Em tradução"),
      text: seasonalColor
        ? pattonColor
          ? `${seasonalColor} com leitura Patton ${pattonColor}.`
          : "Contraste e presença cromática."
        : "Sazonal e Patton entram na tradução.",
      impact:
        seasonalColor || pattonColor
          ? "Dá eixo para cor e beleza."
          : "Traduz contraste e temperatura.",
      state: seasonalColor || pattonColor ? "revealed" : "next",
      aura:
        "radial-gradient(circle at top right, rgba(255,230,190,0.13), transparent 36%), radial-gradient(circle at bottom left, rgba(242,185,104,0.08), transparent 38%)",
    },
    {
      label: "Cabelo",
      caption: "Textura e acabamento",
      image: "/images/panels/beleza.png",
      imageHeight: 140,
      value: hairDiagnosis || "Em tradução",
      text: hairDiagnosis
        ? "Cabelo conectado à identidade."
        : "Textura, volume, corte e cor.",
      impact: hairDiagnosis
        ? "Fortalece antes da roupa."
        : "Alinha rosto e assinatura.",
      state: hairDiagnosis ? "revealed" : "next",
      aura:
        "radial-gradient(circle at top right, rgba(183,140,255,0.12), transparent 36%), radial-gradient(circle at bottom left, rgba(242,185,104,0.08), transparent 38%)",
    },
  ];

  const matrixFutureItems = {
    beleza: {
      label: "Beleza",
      caption: "Rosto e acabamento",
      image: "/images/panels/beleza.png",
      imageHeight: 140,
      value: "Em tradução",
      text: "Maquiagem, acabamento e presença do rosto.",
      impact: "Conecta expressão, brilho e refinamento.",
      state: "next",
      aura:
        "radial-gradient(circle at top right, rgba(255,230,190,0.12), transparent 36%), radial-gradient(circle at bottom left, rgba(183,140,255,0.09), transparent 38%)",
    },
    assinaturaVisual: {
      label: "Assinatura visual",
      caption: "Síntese estética",
      image: "/images/panels/formula.png",
      imagePosition: "center 32%",
      imageHeight: 140,
      value: "Em síntese",
      text: "O fio condutor entre essência, imagem e repetição visual.",
      impact: "Transforma direção em reconhecimento.",
      state: "next",
      aura:
        "radial-gradient(circle at top right, rgba(242,185,104,0.15), transparent 36%), radial-gradient(circle at bottom left, rgba(255,230,190,0.08), transparent 38%)",
    },
    armario: {
      label: "Armário",
      caption: "Aplicação real",
      image: "/images/panels/modelagem.png",
      imagePosition: "center 32%",
      imageHeight: 140,
      value: "Próxima aplicação",
      text: "Peças reais, lacunas, excessos e prioridades.",
      impact: "Leva a identidade para a rotina.",
      state: produto3Liberado ? "next" : "sealed",
      aura:
        "radial-gradient(circle at top right, rgba(242,185,104,0.12), transparent 36%), radial-gradient(circle at bottom left, rgba(183,140,255,0.08), transparent 38%)",
    },
    formulas: {
      label: "Fórmulas",
      caption: "Looks e repetição",
      image: "/images/panels/presenca.png",
      imagePosition: "center 22%",
      imageHeight: 140,
      value: "Próxima aplicação",
      text: "Combinações que sustentam presença sem esforço.",
      impact: "Cria consistência visual no cotidiano.",
      state: produto3Liberado ? "next" : "sealed",
      aura:
        "radial-gradient(circle at top right, rgba(242,185,104,0.14), transparent 36%), radial-gradient(circle at bottom left, rgba(255,145,88,0.09), transparent 38%)",
    },
    compras: {
      label: "Compras",
      caption: "Escolhas e prioridade",
      image: "/images/panels/paleta.png",
      imageHeight: 140,
      value: "Próxima aplicação",
      text: "O que entra, o que sai e o que deixa de dispersar.",
      impact: "Evita compra desconectada da identidade.",
      state: produto3Liberado ? "next" : "sealed",
      aura:
        "radial-gradient(circle at top right, rgba(255,230,190,0.12), transparent 36%), radial-gradient(circle at bottom left, rgba(242,185,104,0.08), transparent 38%)",
    },
  };

  const matrixLayers = [
    {
      id: "revelado",
      number: "01",
      eyebrow: "Produto 1",
      title: "Camada revelada",
      text: "",
      items: matrixItems.slice(0, 3),
    },
    {
      id: "traducao",
      number: "02",
      eyebrow: produto2Liberado ? "Produto 2" : "Próxima camada",
      title: "Tradução visual",
      text: "A força revelada começa a ganhar corpo, cor, cabelo, beleza e assinatura.",
      items: [
        ...matrixItems.slice(3),
        matrixFutureItems.beleza,
        matrixFutureItems.assinaturaVisual,
      ],
    },
    {
      id: "aplicacao",
      number: "03",
      eyebrow: produto3Liberado ? "Produto 3" : "Camada final",
      title: "Aplicação",
      text: "A identidade deixa de ser direção e passa a organizar armário, fórmulas e escolhas reais.",
      items: [
        matrixFutureItems.armario,
        matrixFutureItems.formulas,
        matrixFutureItems.compras,
      ],
    },
  ];

  const selectedMatrixLayer =
    matrixLayers.find((layer) => layer.id === activeMatrixLayer) ||
    matrixLayers[0];

  const selectedMatrixItem =
    selectedMatrixLayer.items.find((item) => item.label === activeMatrixItem) ||
    selectedMatrixLayer.items[0];
  const selectedMatrixItemIndex = Math.max(
    selectedMatrixLayer.items.findIndex(
      (item) => item.label === selectedMatrixItem?.label,
    ),
    0,
  );

  const matrixLayerNotes = {
    revelado: "Base simbólica",
    traducao: "Imagem em tradução",
    aplicacao: "Direção aplicada",
  };

  const mirrorSections = [
    { id: "espelho-hero", number: "01", label: "Entrada" },
    { id: "espelho-resultados", number: "02", label: "Camadas" },
    { id: "espelho-proxima", number: "03", label: "Próximo passo" },
  ];

  const revealedNow = hasResult
    ? [
        resultadoFinal,
        `Base: ${principal} + ${secundario}`,
        report?.formula || "Primeira direção simbólica",
      ].filter(Boolean)
    : [
        "A primeira camada ainda está selada.",
        "O Código das Deusas abre a base arquetípica.",
        "O Espelho começa quando sua força ganha nome.",
      ];

  const nextUnlocks = produto3Liberado
    ? [
        "Cápsula visual aplicada ao seu armário real",
        "Lacunas, excessos e prioridades de compra",
        "Fórmulas de look para sustentar sua rotina",
        "Aplicação prática da identidade no cotidiano",
      ]
    : ["Corpo", "Cor", "Cabelo", "Beleza", "Presença", "Assinatura visual"];

  const nextWhyMatters = produto3Liberado
    ? "Porque direção visual só vira mudança real quando entra no armário, nas compras e na rotina."
    : "Porque a força já foi nomeada. Agora ela precisa aparecer no corpo, na cor, no cabelo e na presença.";

  const nextCrossingTitle = produto3Liberado
    ? "O Código Final transforma direção em guarda-roupa real."
    : "O Dossiê ORI transforma força nomeada em linguagem visual.";
  const finalCrossingText = produto3Liberado
    ? "O Espelho ORI já revelou e traduziu sua direção visual. A próxima etapa não repete essa leitura: ela aplica essa identidade ao armário real, às escolhas, às lacunas e às fórmulas de look."
    : "O Espelho ORI já revelou a força que sustenta sua presença. A próxima etapa não repete essa leitura: ela traduz essa força em corpo, cor, cabelo, presença e direção visual.";

  const nextStep = !hasResult
    ? {
        eyebrow: "Primeira revelação",
        title: "Código das Deusas",
        headline: "Antes de ver sua imagem, você precisa nomear sua essência.",
        text: "A primeira camada revela a base arquetípica que sustenta sua presença e abre o Espelho ORI.",
        cta: "Revelar minha primeira camada",
        link: "/produto-1",
        active: true,
      }
    : produto3Liberado
      ? {
          eyebrow: "Aplicação final liberada",
          title: "Código Final",
          headline:
            "Sua direção visual já pode entrar no guarda-roupa real.",
          text: "O Código Final aplica sua identidade ao acervo, à cápsula, às fórmulas de look, às lacunas e às escolhas práticas da sua rotina.",
          cta: "Acessar Código Final",
          link: "/produto-3",
          active: true,
        }
      : produto2Liberado
      ? {
          eyebrow: "Próximo espelho liberado",
          title: "Dossiê ORI",
          headline:
            "Sua essência já foi nomeada. Agora ela pode ganhar imagem.",
          text: "O Dossiê ORI traduz sua leitura em corpo, cabelo, cor, beleza, presença e assinatura visual.",
          cta: "Acessar Dossiê ORI",
          link: "/produto-2",
          active: true,
        }
      : {
          eyebrow: "Próxima camada",
          title: "Dossiê ORI",
          headline:
            "Você já sabe o nome da sua força. Agora falta ver a forma que ela pode ter.",
          text: "O próximo espelho traduz sua identidade em imagem visível: corpo, cabelo, cor, beleza, presença e linguagem estética.",
          cta: "Dossiê ainda selado",
          link: "/portal",
          active: false,
        };

  const journey = [
    {
      number: "01",
      title: "Código das Deusas",
      done: hasResult,
      active: true,
    },
    {
      number: "02",
      title: "Dossiê ORI",
      done: dossieRevelado,
      active: dossieRevelado && !codigoFinalRevelado,
      locked: !dossieRevelado,
    },
    {
      number: "03",
      title: "Código Final",
      done: codigoFinalRevelado,
      active: false,
      locked: !codigoFinalRevelado,
    },
  ];

  const journeySteps = [
    {
      id: "nomeacao",
      number: "01",
      product: "Produto 1",
      title: "Código das Deusas",
      status: hasResult ? "Concluído" : "Comece aqui",
      statusType: hasResult ? "done" : "active",
      short: hasResult
        ? "Sua base simbólica foi revelada."
        : "Aqui começa a leitura da sua essência.",
      panelTitle: hasResult ? "O que você já descobriu" : "O primeiro passo",
      panelText: hasResult
        ? "Sua leitura mostrou quais forças simbólicas estruturam sua imagem e como elas influenciam sua presença."
        : "Antes de traduzir a imagem, a gente precisa entender qual força simbólica sustenta você.",
      receives: [
        {
          title: "Arquétipos",
          targetId: "resultado-arquetipos",
          summary: hasResult
            ? `${principal} e ${secundario} formam a base da sua leitura.`
            : "A primeira leitura vai mostrar quais forças sustentam sua imagem.",
          reflection:
            "Observe onde essa força já aparece naturalmente em você.",
          detailTitle: hasResult
            ? `A base que já foi nomeada: ${principal} + ${secundario}`
            : "A base que já foi nomeada",
          detailText: hasResult ? resultadoFinal : "Camada selada",
        },
        {
          title: "Presença",
          targetId: "resultado-presenca",
          summary:
            "Aqui começa a leitura do modo como sua energia chega antes da fala.",
          reflection:
            "Que parte da sua presença você ainda tenta diminuir?",
          detailTitle: "Como sua presença chega",
          detailText:
            getPreview(report?.presenca || reflection.presenca, 520) ||
            "Sua presença será traduzida conforme sua jornada avançar.",
        },
        {
          title: "Sombra",
          targetId: "resultado-sombra",
          summary:
            "Mostra onde sua força pode virar defesa, excesso ou ruído.",
          reflection:
            "O que você protege tanto que às vezes acaba escondendo?",
          detailTitle: "O ponto que pede consciência",
          detailText:
            getPreview(report?.sombra || reflection.sombra, 520) ||
            "A sombra não é defeito. É uma camada que precisa ser vista para a imagem ficar mais inteira.",
        },
        {
          title: "Fórmula",
          targetId: "resultado-formula",
          summary:
            "Resume a direção simbólica que começa a organizar sua imagem.",
          reflection:
            "Sua imagem está reforçando essa direção ou criando ruído?",
          detailTitle: hasResult
            ? "Sua primeira fórmula de imagem:"
            : "Fórmula em preparação",
          detailText: hasResult
            ? getPreview(report?.formula || report?.essenciaImagem, 520) ||
              "Primeira direção simbólica"
            : "A primeira fórmula da sua imagem aparece depois da leitura arquetípica.",
        },
      ],
      cta: hasResult ? "Ver Código das Deusas" : "Começar Código das Deusas",
      link: "/produto-1",
      active: true,
    },
    {
      id: "integracao",
      number: "02",
      product: "Produto 2",
      title: "Dossiê ORI",
      status: dossieRevelado ? "Concluído" : hasResult ? "Selado" : "Selado",
      statusType: dossieRevelado ? "done" : hasResult ? "active" : "sealed",
      short:
        "Sua essência começa a ganhar forma visual.",
      panelTitle: dossieRevelado ? "O que ganhou forma visual" : "O que vem agora",
      panelText: dossieRevelado
        ? "Seu Dossiê ORI abre as camadas de corpo, cor, cabelo, beleza e presença para consulta."
        : "No Dossiê ORI, vamos traduzir sua essência para a imagem real: corpo, cor, cabelo, beleza, presença e rotina.",
      receives: [
        {
          title: "Corpo",
          targetId: "resultado-corpo",
          summary:
            "A leitura mostra como sua identidade aparece em forma, proporção e presença corporal.",
          reflection:
            "Seu corpo pede leveza, estrutura, presença ou movimento?",
          detailTitle: "Corpo e proporções",
          detailText:
            "Aqui entra a tradução do Dossiê ORI para corpo, linhas, proporções e modelagens que respeitam sua presença real.",
          visualLabel: "Espaço para referência corporal",
        },
        {
          title: "Cores",
          targetId: "resultado-cores",
          summary:
            "Sua paleta mostra quais tons sustentam sua presença com mais coerência.",
          reflection:
            "Quais cores fazem você parecer mais inteira?",
          detailTitle: "Paleta e direção de cor",
          detailText:
            "Quando a cartela da cliente estiver definida, a imagem da paleta entra aqui como referência rápida e visual.",
          visualLabel: "Imagem da paleta da cliente",
        },
        {
          title: "Tecidos",
          targetId: "resultado-tecidos",
          summary:
            "Texturas e caimentos ajudam a imagem a comunicar a energia certa.",
          reflection:
            "Seu tecido aproxima, sustenta, pesa ou apaga sua presença?",
          detailTitle: "Tecidos e texturas",
          detailText:
            "Este espaço recebe referências de tecidos, brilhos, pesos e texturas que conversam com a leitura da cliente.",
          visualLabel: "Referências de tecidos",
        },
        {
          title: "Beleza",
          targetId: "resultado-beleza",
          summary:
            "Cabelo, acabamento e beleza deixam a leitura mais visível no rosto.",
          reflection:
            "Sua beleza está revelando você ou tentando corrigir você?",
          detailTitle: "Cabelo, beleza e acabamento",
          detailText:
            "Aqui entram imagens de cabelo, beleza e acabamento para mostrar de forma simples como a direção visual pode aparecer.",
          visualLabel: "Referências de beleza e cabelo",
        },
      ],
      cta: dossieRevelado ? "Acessar Dossiê ORI" : "Dossiê ainda selado",
      link: dossieRevelado ? "/produto-2" : "/portal",
      active: Boolean(dossieRevelado),
    },
    {
      id: "aplicacao",
      number: "03",
      product: "Produto 3",
      title: "Código Final",
      status: codigoFinalRevelado ? "Concluído" : "Selado",
      statusType: codigoFinalRevelado ? "done" : "sealed",
      short:
        "Sua imagem entra no armário e na vida real.",
      panelTitle: codigoFinalRevelado ? "O que entrou na vida real" : "O que vem depois",
      panelText: codigoFinalRevelado
        ? "Seu Código Final reúne cápsula, looks, compras e rotina para consultar na prática."
        : "No Código Final, você entende como levar sua identidade para o armário, os looks, as compras e a sua cápsula visual.",
      receives: [
        {
          title: "Cápsula",
          targetId: "resultado-capsula",
          summary:
            "Organiza as peças que sustentam sua identidade no armário real.",
          reflection:
            "O que precisa ficar para sua imagem ganhar coerência?",
          detailTitle: "Mapa da cápsula visual",
          detailText:
            "A cápsula final junta paleta, modelagem, tecidos e rotina para transformar direção em escolha prática.",
          visualLabel: "Mapa visual da cápsula",
        },
        {
          title: "Looks",
          targetId: "resultado-looks",
          summary:
            "Mostra fórmulas de composição para vestir sua identidade com menos esforço.",
          reflection:
            "Que combinação já parece sua antes mesmo de explicar?",
          detailTitle: "Fórmulas de looks",
          detailText:
            "Aqui entram combinações, regras simples e fórmulas visuais para facilitar a aplicação no dia a dia.",
          visualLabel: "Fórmulas visuais de looks",
        },
        {
          title: "Compras",
          targetId: "resultado-compras",
          summary:
            "Ajuda a decidir o que entra, o que espera e o que não precisa entrar agora.",
          reflection:
            "Sua próxima compra resolve uma lacuna ou só cria mais ruído?",
          detailTitle: "Prioridades de compra",
          detailText:
            "A estratégia de compra evita excesso e ajuda a cliente a escolher peças que realmente sustentam a imagem.",
          visualLabel: "Prioridades e lacunas",
        },
        {
          title: "Rotina",
          targetId: "resultado-rotina",
          summary:
            "Leva a identidade para escolhas possíveis dentro da vida real.",
          reflection:
            "Como sua imagem pode ficar mais sua sem complicar sua rotina?",
          detailTitle: "Imagem na vida real",
          detailText:
            "Esta camada fecha a jornada mostrando como a identidade pode aparecer no armário, na rotina e nas decisões práticas.",
          visualLabel: "Aplicação na rotina",
        },
      ],
      cta: codigoFinalRevelado ? "Acessar Código Final" : "Código Final ainda selado",
      link: codigoFinalRevelado ? "/produto-3" : "/portal",
      active: Boolean(codigoFinalRevelado),
    },
  ];

  const activeJourney =
    journeySteps.find((step) => step.id === (hasResult ? activeJourneyStep : "nomeacao")) ||
    journeySteps[hasResult ? 1 : 0];

  const journeyDetailGroups = journeySteps.map((step) => ({
    ...step,
    items: step.receives,
  }));

  if (loading) {
    return (
      <main
        className="min-h-screen flex items-center justify-center px-6"
        style={{
          background:
            "radial-gradient(circle at top right, rgba(242,185,104,0.10), transparent 32%), linear-gradient(180deg, #050202, #090304)",
          color: colors.title,
        }}
      >
        <div
          className="relative overflow-hidden rounded-[34px] p-8 md:p-10 max-w-xl w-full"
          style={{
            background:
              "linear-gradient(180deg, rgba(18,9,10,0.82), rgba(5,2,2,0.96))",
            border: `1px solid ${colors.border}`,
            boxShadow: "0 0 90px rgba(242,185,104,0.07)",
            backdropFilter: "blur(18px)",
            WebkitBackdropFilter: "blur(18px)",
          }}
        >
          <Eyebrow>Espelho ORI</Eyebrow>

          <h1
            className="text-4xl md:text-5xl leading-none"
            style={{
              color: colors.title,
              fontWeight: 600,
              letterSpacing: "-0.065em",
            }}
          >
            Preparando seu reflexo...
          </h1>
        </div>
      </main>
    );
  }

  return (
    <main
      className="ori-atmosphere ori-atmosphere-mirror relative min-h-screen overflow-hidden px-4 py-5 md:px-7 md:py-7"
      style={{ color: colors.title }}
    >
      <MirrorSectionNav sections={mirrorSections} colors={colors} />

      <div
        className="fixed inset-0 -z-20"
        style={{
          backgroundImage:
            "linear-gradient(180deg, rgba(5,2,2,0.26), rgba(5,2,2,0.62)), url('/images/backgrounds/master-bg.png')",
          backgroundSize: "cover",
          backgroundPosition: "center center",
          backgroundRepeat: "no-repeat",
          filter: "saturate(0.92) contrast(1.04)",
        }}
      />

      <div
        className="fixed inset-0 -z-20 pointer-events-none"
        style={{
          background:
            "linear-gradient(90deg, rgba(4,3,3,0.78), rgba(8,6,5,0.52) 44%, rgba(4,3,3,0.78))",
        }}
      />

      <div className="relative z-10 w-full max-w-[1240px] mx-auto">
        <SyncNotice message={syncNotice} />

        <header
          className="flex flex-col md:flex-row md:items-center md:justify-between gap-5 mb-5"
        >
          <motion.div
            whileHover={reduceMotion ? undefined : { x: -2 }}
            whileTap={reduceMotion ? undefined : { scale: 0.98 }}
          >
            <Link
              to="/portal"
              className="inline-flex w-fit items-center gap-3 px-5 py-2.5 rounded-full text-sm transition-all"
              style={{
                background: "rgba(255,255,255,0.026)",
                border: `1px solid ${colors.borderSoft}`,
                color: "rgba(255,245,235,0.72)",
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
              }}
            >
              <span style={{ color: colors.gold }}>←</span>
              Voltar ao Portal
            </Link>
          </motion.div>

          <div
            className="flex flex-wrap items-center gap-2 rounded-full px-3 py-2 w-fit"
            style={{
              background: "rgba(255,255,255,0.022)",
              border: `1px solid ${colors.borderSoft}`,
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
            }}
          >
            {journey.map((item, index) => (
              <div key={item.number} className="flex items-center gap-2">
                <motion.div
                  initial={false}
                  animate={
                    item.done
                      ? {
                          boxShadow: [
                            "0 0 0 rgba(120,255,160,0)",
                            "0 0 18px rgba(120,255,160,0.08)",
                            "0 0 0 rgba(120,255,160,0)",
                          ],
                        }
                      : {}
                  }
                  transition={{
                    duration: 2.4,
                    repeat: item.done && !reduceMotion ? Infinity : 0,
                    ease: "easeInOut",
                  }}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px]"
                  style={{
                    background: item.done
                      ? "rgba(120,255,160,0.07)"
                      : item.active
                        ? "rgba(242,185,104,0.06)"
                        : "rgba(255,255,255,0.025)",
                    border: item.done
                      ? "1px solid rgba(120,255,160,0.13)"
                      : item.active
                        ? `1px solid ${colors.border}`
                        : "1px solid rgba(255,255,255,0.055)",
                    color: item.done
                      ? "#9BE7AE"
                      : item.active
                        ? "rgba(242,185,104,0.76)"
                        : "rgba(255,245,235,0.40)",
                  }}
                >
                  <span aria-hidden="true">
                    {item.done ? "✓" : item.locked ? "🔒" : item.number}
                  </span>
                  <span className="hidden sm:inline">{item.title}</span>
                </motion.div>

                {index < journey.length - 1 && (
                  <span
                    className="hidden sm:block w-5 h-px"
                    style={{
                      background:
                        "linear-gradient(90deg, rgba(242,185,104,0.20), transparent)",
                    }}
                  />
                )}
              </div>
            ))}
          </div>
        </header>

        <div id="espelho-hero" className="scroll-mt-6">
          <MirrorHero />
        </div>

        {SHOW_LEGACY_MIRROR_SECTIONS && (
        <MotionSection
          id="espelho-matriz"
          reduceMotion={reduceMotion}
          className="relative overflow-hidden rounded-[28px] md:rounded-[38px] p-4 md:p-6 mb-5"
          style={{
            backgroundColor: "rgba(5,2,2,0.92)",
            backgroundImage: ORACLE_PANEL_BACKGROUND,
            backgroundSize: "cover",
            backgroundPosition: "center",
            border: `1px solid ${colors.border}`,
            boxShadow:
              "0 24px 80px rgba(0,0,0,0.20), inset 0 1px 0 rgba(255,255,255,0.018)",
            backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
          }}
        >
          <div className="relative z-10 grid gap-6 xl:grid-cols-[0.42fr_0.58fr] xl:items-stretch">
            <div>
              <AtrioLineLabel className="mb-4">
                Sua jornada dentro do ORI
              </AtrioLineLabel>

              <h2
                className="mb-4 max-w-xl text-3xl leading-[1.02] md:text-[40px]"
                style={{
                  color: colors.headingSection,
                  fontWeight: 620,
                  letterSpacing: "-0.06em",
                }}
              >
                Primeiro a gente entende sua essência. Depois traduz isso para
                sua imagem.
              </h2>

              <p
                className="max-w-xl text-sm leading-relaxed md:text-base"
                style={{ color: "rgba(255,245,235,0.58)" }}
              >
                Aqui você vê onde está, o que já foi revelado e qual é o
                próximo passo.
              </p>

              <div className="mt-6 grid gap-2.5">
                {journeySteps.map((step) => {
                  const isActive = activeJourney.id === step.id;
                  const isDone = step.statusType === "done";
                  const isSealed = step.statusType === "sealed";

                  return (
                    <button
                      key={step.id}
                      type="button"
                      onClick={() => setActiveJourneyStep(step.id)}
                      className="relative overflow-hidden rounded-[20px] p-4 text-left transition duration-300 hover:-translate-y-0.5"
                      style={{
                        background: isActive
                          ? "linear-gradient(135deg, rgba(242,185,104,0.11), rgba(255,255,255,0.016))"
                          : "linear-gradient(135deg, rgba(255,255,255,0.026), rgba(255,255,255,0.008))",
                        border: isActive
                          ? "1px solid rgba(242,185,104,0.25)"
                          : "1px solid rgba(242,185,104,0.08)",
                        boxShadow: isActive
                          ? "0 0 30px rgba(242,185,104,0.07), inset 0 0 20px rgba(242,185,104,0.014)"
                          : "inset 0 0 16px rgba(255,255,255,0.006)",
                      }}
                    >
                      <div className="mb-3 flex items-center justify-between gap-3">
                        <span
                          className="flex h-8 w-8 items-center justify-center rounded-full text-[10px]"
                          style={{
                            background: isActive
                              ? "rgba(242,185,104,0.14)"
                              : "rgba(255,255,255,0.026)",
                            border: isActive
                              ? "1px solid rgba(242,185,104,0.22)"
                              : "1px solid rgba(242,185,104,0.08)",
                            color: isActive ? colors.gold : colors.muted,
                          }}
                        >
                          {step.number}
                        </span>

                        <span
                          className="rounded-full px-3 py-1 text-[8px] uppercase tracking-[0.16em]"
                          style={{
                            background: isDone
                              ? "rgba(120,255,160,0.075)"
                              : isSealed
                                ? "rgba(255,255,255,0.024)"
                                : "rgba(242,185,104,0.075)",
                            border: isDone
                              ? "1px solid rgba(120,255,160,0.13)"
                              : isSealed
                                ? "1px solid rgba(255,255,255,0.055)"
                                : "1px solid rgba(242,185,104,0.13)",
                            color: isDone
                              ? "#9BE7AE"
                              : isSealed
                                ? "rgba(255,245,235,0.42)"
                                : colors.goldSoft,
                          }}
                        >
                          {step.status}
                        </span>
                      </div>

                      <h3
                        className="mb-2 text-xl leading-tight"
                        style={{
                          color: isActive
                            ? colors.headingActive
                            : "rgba(255,245,235,0.74)",
                          fontWeight: 620,
                          letterSpacing: "-0.045em",
                        }}
                      >
                        {step.title}
                      </h3>
                      <p
                        className="text-sm leading-relaxed"
                        style={{ color: "rgba(255,245,235,0.56)" }}
                      >
                        {step.short}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            <div
              className="relative overflow-hidden rounded-[28px] p-5 md:p-7"
              style={{
                background:
                  "radial-gradient(circle at top right, rgba(242,185,104,0.13), transparent 34%), linear-gradient(180deg, rgba(255,255,255,0.032), rgba(255,255,255,0.010))",
                border: "1px solid rgba(242,185,104,0.12)",
                boxShadow:
                  "0 0 46px rgba(242,185,104,0.035), inset 0 0 34px rgba(255,255,255,0.010)",
              }}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeJourney.id}
                  initial={
                    reduceMotion
                      ? false
                      : { opacity: 0, y: 14, filter: "blur(8px)" }
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
                  transition={{ duration: 0.36, ease: [0.22, 1, 0.36, 1] }}
                >
                  <h3
                    className="mb-4 text-3xl leading-[1.02] md:text-[42px]"
                    style={{
                      color: colors.headingReading,
                      fontWeight: 620,
                      letterSpacing: "-0.065em",
                    }}
                  >
                    {activeJourney.panelTitle}
                  </h3>

                  <p
                    className="mb-5 max-w-2xl text-sm leading-relaxed md:text-base"
                    style={{ color: "rgba(255,245,235,0.68)" }}
                  >
                    {activeJourney.panelText}
                  </p>

                  <div
                    className="mb-5 h-px w-full"
                    style={{
                      background:
                        "linear-gradient(90deg, rgba(242,185,104,0.24), transparent)",
                    }}
                  />

                  <div className="grid gap-2.5 sm:grid-cols-2">
                    {activeJourney.receives.map((item) => (
                      <a
                        key={item.targetId}
                        href={`#${item.targetId}`}
                        className="group relative overflow-hidden rounded-[16px] p-3.5 transition duration-300 hover:-translate-y-0.5"
                        style={{
                          background:
                            "linear-gradient(135deg, rgba(255,255,255,0.030), rgba(255,255,255,0.010))",
                          border: "1px solid rgba(242,185,104,0.10)",
                          boxShadow: "inset 0 0 18px rgba(255,255,255,0.006)",
                        }}
                      >
                        <div
                          className="absolute inset-x-4 top-0 h-px opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                          style={{
                            background:
                              "linear-gradient(90deg, transparent, rgba(242,185,104,0.36), transparent)",
                          }}
                        />
                        <div className="mb-2 flex items-center justify-between gap-3">
                          <span
                            className="text-[9px] uppercase tracking-[0.24em]"
                            style={{ color: colors.goldSoft }}
                          >
                            {item.title}
                          </span>
                          <span
                            className="rounded-full px-2.5 py-1 text-[8px] uppercase tracking-[0.14em]"
                            style={{
                              background: "rgba(242,185,104,0.070)",
                              border: "1px solid rgba(242,185,104,0.12)",
                              color: "rgba(242,185,104,0.78)",
                            }}
                          >
                            Ver
                          </span>
                        </div>
                        <p
                          className="mb-2 text-sm leading-relaxed"
                          style={{ color: "rgba(255,245,235,0.66)" }}
                        >
                          {getPreview(item.summary, 92)}
                        </p>
                        <p
                          className="text-xs leading-relaxed"
                          style={{ color: "rgba(255,245,235,0.44)" }}
                        >
                          {getPreview(item.reflection, 76)}
                        </p>
                      </a>
                    ))}
                  </div>

                  <div className="mt-6">
                    {activeJourney.active ? (
                      <Link
                        to={activeJourney.link}
                        className="inline-flex justify-center rounded-full px-7 py-3 text-sm"
                        style={{
                          background:
                            "linear-gradient(90deg, var(--copper-primary), var(--gold-primary))",
                          color: "#090506",
                          fontWeight: 680,
                          boxShadow:
                            "0 0 34px rgba(242,185,104,0.16), inset 0 0 14px rgba(255,255,255,0.16)",
                        }}
                      >
                        {activeJourney.cta}
                      </Link>
                    ) : (
                      <button
                        type="button"
                        disabled
                        className="inline-flex cursor-not-allowed justify-center rounded-full px-7 py-3 text-sm opacity-75"
                        style={{
                          background: "rgba(255,255,255,0.035)",
                          border: `1px solid ${colors.border}`,
                          color: "rgba(255,245,235,0.56)",
                        }}
                      >
                        {activeJourney.cta}
                      </button>
                    )}
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </MotionSection>
        )}

        <MotionSection
          id="espelho-resultados"
          reduceMotion={reduceMotion}
          className="ori-main-frame relative overflow-hidden rounded-[20px] md:rounded-[32px] p-3.5 md:p-5 mb-5"
          style={{
            backgroundColor: "rgba(5,2,2,0.92)",
            backgroundImage: ORACLE_PANEL_BACKGROUND,
            backgroundSize: "cover",
            backgroundPosition: "center",
            border: `1px solid ${colors.border}`,
            boxShadow:
              "0 24px 80px rgba(0,0,0,0.20), inset 0 1px 0 rgba(255,255,255,0.018)",
            backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
          }}
        >
          <div className="relative z-10">
            <div className="mb-4 md:mb-5 flex flex-col gap-2.5 md:gap-3 md:flex-row md:items-end md:justify-between">
              <div className="max-w-2xl">
                <AtrioLineLabel className="mb-2.5 md:mb-3">
                  Mapa Vivo ORI
                </AtrioLineLabel>

                <h2
                  className="ori-type-revelation text-[23px] md:text-[32px]"
                  style={{
                    color: colors.headingSection,
                    fontWeight: 620,
                    letterSpacing: "-0.055em",
                  }}
                >
                  Consulte sua jornada em camadas.
                </h2>
              </div>

              <p
                className="ori-type-reading-soft hidden max-w-md text-sm md:block"
                style={{ color: "rgba(255,245,235,0.54)" }}
              >
                Aqui você acompanha o que já abriu, o que guia sua jornada e o
                que ainda será revelado.
              </p>
            </div>

            <div className="mb-4 md:mb-5 grid gap-2 md:gap-2.5 md:grid-cols-4">
              {profileSnapshot.map((item) => {
                const isSealed = item.state === "sealed";

                return (
                  <article
                    key={item.label}
                    className={`relative overflow-hidden rounded-[16px] p-3.5 md:rounded-[18px] md:p-4 ${
                      isSealed ? "ori-card-sealed" : "ori-card-secondary"
                    }`}
                    style={{
                      background: isSealed
                        ? "linear-gradient(135deg, rgba(255,255,255,0.018), rgba(255,255,255,0.006))"
                        : "linear-gradient(135deg, rgba(242,185,104,0.060), rgba(255,255,255,0.010))",
                      border: isSealed
                        ? "1px solid rgba(242,185,104,0.070)"
                        : "1px solid rgba(242,185,104,0.095)",
                      opacity: 1,
                    }}
                  >
                    <span
                      className="absolute inset-x-4 top-0 h-px"
                      style={{
                        background: isSealed
                          ? "linear-gradient(90deg, transparent, rgba(255,255,255,0.10), transparent)"
                          : "linear-gradient(90deg, transparent, rgba(242,185,104,0.34), transparent)",
                      }}
                    />
                    <div className="mb-2.5 md:mb-3 flex items-center justify-between gap-3">
                      <span
                        className="ori-type-system"
                        style={{ color: isSealed ? colors.quiet : colors.goldSoft }}
                      >
                        {item.label}
                      </span>
                      {isSealed && (
                        <span
                          className="text-xs"
                          aria-label="Ainda selado"
                          title="Ainda selado"
                        >
                          🔒
                        </span>
                      )}
                    </div>
                    <h3
                      className="ori-type-revelation mb-1.5 md:mb-2 text-base md:text-lg"
                      style={{
                        color: isSealed
                          ? "rgba(255,245,235,0.62)"
                          : colors.headingSection,
                        fontWeight: 620,
                        letterSpacing: "-0.035em",
                      }}
                    >
                      {item.title}
                    </h3>
                    <p
                      className="ori-type-reading-soft hidden text-xs md:block"
                      style={{ color: "rgba(255,245,235,0.48)" }}
                    >
                      {item.text}
                    </p>
                  </article>
                );
              })}
            </div>

            <div className="grid gap-3 md:gap-5">
              {journeyDetailGroups.map((group) => {
                const isLocked =
                  group.statusType === "sealed" ||
                  (group.id === "integracao" && !dossieRevelado) ||
                  (group.id === "aplicacao" && !codigoFinalRevelado);
                const primaryItems =
                  group.id === "nomeacao"
                    ? group.items.filter((item) =>
                        ["resultado-arquetipos", "resultado-formula"].includes(
                          item.targetId,
                        ),
                      )
                    : [];
                const expandableItems =
                  group.id === "nomeacao"
                    ? []
                    : [];

                return (
                  <div
                    key={group.id}
                    className={`ori-mobile-section rounded-[20px] md:rounded-[26px] p-3 md:p-4 ${
                      isLocked ? "ori-card-sealed" : "ori-card-secondary"
                    }`}
                    style={{
                      background: "rgba(5,2,2,0.28)",
                      border: "1px solid rgba(242,185,104,0.075)",
                    }}
                  >
                    <div className="mb-3 md:mb-4 flex flex-col gap-2.5 md:gap-3 md:flex-row md:items-end md:justify-between">
                      <div>
                        <h3
                          className="ori-type-revelation text-xl md:text-[30px]"
                          style={{
                            color: colors.headingReading,
                            fontWeight: 620,
                            letterSpacing: "-0.055em",
                          }}
                        >
                          {group.title}
                        </h3>
                      </div>

                      <span
                        className={`ori-badge w-fit ${
                          isLocked ? "ori-state-sealed" : "ori-state-next"
                        } ori-state-surface`}
                        style={{
                          background: isLocked
                            ? "rgba(255,255,255,0.024)"
                            : "rgba(242,185,104,0.070)",
                          border: isLocked
                            ? "1px solid rgba(255,255,255,0.055)"
                            : "1px solid rgba(242,185,104,0.13)",
                          color: isLocked
                            ? "rgba(255,245,235,0.42)"
                            : colors.goldSoft,
                        }}
                      >
                        {isLocked && (
                          <span className="mr-1.5" aria-hidden="true">
                            🔒
                          </span>
                        )}
                        {group.status}
                      </span>
                    </div>

                    {group.id === "nomeacao" && (
                      <div className="grid gap-3">
                        <div className="grid gap-3 lg:grid-cols-2">
                          {primaryItems.map((item) => (
                            <article
                              key={item.targetId}
                              id={item.targetId}
                              className="ori-card-secondary flex min-h-[220px] scroll-mt-24 flex-col rounded-[20px] p-3.5 md:min-h-[300px] md:rounded-[22px] md:p-5"
                              style={{
                                background:
                                  item.targetId === "resultado-formula"
                                    ? "linear-gradient(135deg, rgba(255,255,255,0.030), rgba(255,255,255,0.010))"
                                    : "linear-gradient(135deg, rgba(255,255,255,0.034), rgba(255,255,255,0.010))",
                                border:
                                  item.targetId === "resultado-formula"
                                    ? "1px solid rgba(242,185,104,0.11)"
                                    : "1px solid rgba(242,185,104,0.10)",
                                boxShadow:
                                  item.targetId === "resultado-formula"
                                    ? "0 0 28px rgba(242,185,104,0.030), inset 0 0 22px rgba(242,185,104,0.010)"
                                    : "0 0 30px rgba(0,0,0,0.16), inset 0 0 20px rgba(255,255,255,0.006)",
                              }}
                            >
                              <AtrioLineLabel className="mb-3">
                                {item.title}
                              </AtrioLineLabel>

                              {item.targetId === "resultado-formula" ? (
                                <div className="flex flex-1 flex-col">
                                  {(() => {
                                    const formulaIsRevealed = hasResult;

                                    return (
                                      <>
                                  <h4
                                    className="ori-type-revelation mb-4 text-xl md:text-2xl"
                                    style={{
                                      color: colors.headingSection,
                                      fontWeight: 620,
                                      letterSpacing: "-0.045em",
                                    }}
                                  >
                                    {item.detailTitle}
                                  </h4>

                                  <div className="flex flex-1 items-center justify-center py-4">
                                    <div className="w-full max-w-[420px] text-center">
                                      <div
                                        className="mx-auto mb-4 h-px w-28"
                                        style={{
                                          background:
                                            "linear-gradient(90deg, transparent, rgba(242,185,104,0.36), transparent)",
                                        }}
                                      />
                                      <p
                                        className={`px-2 leading-tight ${
                                          formulaIsRevealed
                                            ? "text-[11px] uppercase sm:text-[13px] md:text-[15px] xl:text-[16px]"
                                            : "ori-type-reading-soft text-sm normal-case md:text-base"
                                        }`}
                                        style={{
                                          color: formulaIsRevealed
                                            ? "rgba(242,185,104,0.82)"
                                            : "rgba(255,245,235,0.64)",
                                          fontStyle: "normal",
                                          fontWeight: formulaIsRevealed ? 540 : 400,
                                          letterSpacing: formulaIsRevealed
                                            ? "0.14em"
                                            : "0",
                                          textShadow:
                                            "0 0 18px rgba(242,185,104,0.10)",
                                        }}
                                      >
                                        {formulaIsRevealed
                                          ? formatSymbolicFormula(item.detailText)
                                          : item.detailText}
                                      </p>
                                      <div
                                        className="mx-auto mt-4 h-px w-28"
                                        style={{
                                          background:
                                            "linear-gradient(90deg, transparent, rgba(242,185,104,0.22), transparent)",
                                        }}
                                      />
                                    </div>
                                  </div>
                                      </>
                                    );
                                  })()}
                                </div>
                              ) : item.targetId === "resultado-arquetipos" ? (
                                <div className="flex flex-1 flex-col">
                                  <h4
                                    className="ori-type-revelation mb-4 text-xl md:text-2xl"
                                    style={{
                                      color: colors.headingSection,
                                      fontWeight: 620,
                                      letterSpacing: "-0.045em",
                                      lineHeight: 1.12,
                                    }}
                                  >
                                    A base que já foi nomeada:
                                    {hasResult && (
                                      <span
                                        className="ori-type-reading-soft ml-1.5 align-baseline text-xl md:text-2xl"
                                        style={{
                                          color: "rgba(242,185,104,0.82)",
                                          fontWeight: 500,
                                          letterSpacing: "-0.035em",
                                          textShadow: "none",
                                        }}
                                      >
                                        {principal} + {secundario}
                                      </span>
                                    )}
                                  </h4>

                                  <div className="flex flex-1 items-center justify-center py-4">
                                    <div className="w-full max-w-[420px] text-center">
                                      <div
                                        className="mx-auto mb-4 h-px w-28"
                                        style={{
                                          background:
                                            "linear-gradient(90deg, transparent, rgba(242,185,104,0.36), transparent)",
                                        }}
                                      />
                                      <p
                                        className="px-2 text-[24px] leading-none sm:whitespace-nowrap sm:text-[30px] md:text-[36px]"
                                        style={{
                                          color: "rgba(242,185,104,0.82)",
                                          fontStyle: "normal",
                                          fontWeight: 680,
                                          letterSpacing: "-0.018em",
                                          textShadow:
                                            "0 0 24px rgba(242,185,104,0.10)",
                                        }}
                                      >
                                        {formatArchetypeName(item.detailText)}
                                      </p>
                                      <div
                                        className="relative mx-auto mt-4 h-px w-28 overflow-hidden"
                                        style={{
                                          transformOrigin: "center",
                                          background: "transparent",
                                        }}
                                      >
                                        <span
                                          className="absolute inset-0"
                                          style={{
                                            background:
                                              "linear-gradient(90deg, transparent, rgba(242,185,104,0.24), rgba(242,185,104,0.72), rgba(210,135,70,0.36), transparent)",
                                            boxShadow:
                                              "0 0 14px rgba(242,185,104,0.16), 0 0 32px rgba(210,135,70,0.08)",
                                          }}
                                        />
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                <>
                                  <h4
                                    className="ori-type-revelation mb-3 text-xl md:text-2xl"
                                    style={{
                                      color: colors.headingSection,
                                      fontWeight: 620,
                                      letterSpacing: "-0.045em",
                                    }}
                                  >
                                    {item.detailTitle}
                                  </h4>
                                  <p
                                    className="ori-type-reading-soft mb-4 text-sm"
                                    style={{ color: "rgba(255,245,235,0.64)" }}
                                  >
                                    {item.detailText}
                                  </p>
                                </>
                              )}

                              <p
                                className="mt-auto rounded-[16px] px-4 py-3 text-xs leading-relaxed md:text-sm"
                                style={{
                                  background: "rgba(242,185,104,0.040)",
                                  border: "1px solid rgba(242,185,104,0.085)",
                                  color: "rgba(255,245,235,0.56)",
                                }}
                              >
                                {item.reflection}
                              </p>
                            </article>
                          ))}
                        </div>

                        {hasResult && (
                          <div
                            className="ori-card-secondary flex flex-col gap-4 rounded-[20px] p-4 md:flex-row md:items-center md:justify-between md:rounded-[24px] md:p-5"
                            style={{
                              background:
                                "linear-gradient(135deg, rgba(242,185,104,0.065), rgba(255,255,255,0.014))",
                              border: "1px solid rgba(242,185,104,0.12)",
                              boxShadow:
                                "inset 0 0 24px rgba(255,255,255,0.008)",
                            }}
                          >
                            <div>
                              <AtrioLineLabel className="mb-2">
                                Relatório digital
                              </AtrioLineLabel>
                              <h4
                                className="ori-type-revelation text-xl md:text-2xl"
                                style={{
                                  color: colors.headingSection,
                                  fontWeight: 620,
                                  letterSpacing: "-0.045em",
                                }}
                              >
                                Consulte sua leitura completa.
                              </h4>
                              <p
                                className="ori-type-reading-soft mt-1 text-sm"
                                style={{ color: "rgba(255,245,235,0.58)" }}
                              >
                                Abra o relatório do Código das Deusas em formato
                                de leitura contínua.
                              </p>
                            </div>

                            <Link
                              to="/produto-1/relatorio"
                              className="ori-button-secondary inline-flex w-full justify-center rounded-full px-5 py-3 text-sm md:w-auto"
                              style={{
                                background: "rgba(242,185,104,0.10)",
                                border: "1px solid rgba(242,185,104,0.16)",
                                color: colors.gold,
                              }}
                            >
                              Abrir relatório completo
                            </Link>
                          </div>
                        )}

                        <div className="grid gap-2">
                          {expandableItems.map((item) => {
                            const isExpanded = Boolean(
                              expandedResultItems[item.targetId],
                            );

                            return (
                              <article
                                key={item.targetId}
                                id={item.targetId}
                                className="scroll-mt-24 overflow-hidden rounded-[18px]"
                                style={{
                                  background: "rgba(255,255,255,0.020)",
                                  border: "1px solid rgba(242,185,104,0.075)",
                                }}
                              >
                                <button
                                  type="button"
                                  onClick={() =>
                                    setExpandedResultItems((prev) => ({
                                      ...prev,
                                      [item.targetId]: !prev[item.targetId],
                                    }))
                                  }
                                  className="flex w-full items-center justify-between gap-4 p-4 text-left"
                                >
                                  <div>
                                    <AtrioLineLabel className="mb-2">
                                      {item.title}
                                    </AtrioLineLabel>
                                    <h4
                                      className="text-base md:text-lg"
                                      style={{
                                        color: colors.headingSection,
                                        fontWeight: 620,
                                        letterSpacing: "-0.035em",
                                      }}
                                    >
                                      {item.detailTitle}
                                    </h4>
                                  </div>
                                  <span
                                    className="rounded-full px-3 py-1 text-[9px] uppercase tracking-[0.14em]"
                                    style={{
                                      background: "rgba(242,185,104,0.060)",
                                      border: "1px solid rgba(242,185,104,0.10)",
                                      color: colors.goldSoft,
                                    }}
                                  >
                                    {isExpanded ? "Fechar" : "Abrir"}
                                  </span>
                                </button>

                                <AnimatePresence initial={false}>
                                  {isExpanded && (
                                    <motion.div
                                      initial={{ height: 0, opacity: 0 }}
                                      animate={{ height: "auto", opacity: 1 }}
                                      exit={{ height: 0, opacity: 0 }}
                                      transition={{
                                        duration: 0.28,
                                        ease: [0.22, 1, 0.36, 1],
                                      }}
                                      className="overflow-hidden"
                                    >
                                      <div className="px-4 pb-4">
                                        <p
                                          className="mb-3 text-sm leading-relaxed"
                                          style={{
                                            color: "rgba(255,245,235,0.62)",
                                          }}
                                        >
                                          {item.detailText}
                                        </p>
                                        <p
                                          className="text-xs leading-relaxed md:text-sm"
                                          style={{
                                            color: "rgba(255,245,235,0.48)",
                                          }}
                                        >
                                          {item.reflection}
                                        </p>
                                      </div>
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </article>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {group.id === "integracao" && (
                      <>
                        {dossieRevelado ? (
                          <div className="grid gap-3">
                            {group.items.slice(0, 1).map((item) => (
                              <article
                                key={item.targetId}
                                id={item.targetId}
                                className="scroll-mt-24 overflow-hidden rounded-[22px]"
                                style={{
                                  background:
                                    "linear-gradient(135deg, rgba(255,255,255,0.032), rgba(255,255,255,0.010))",
                                  border: "1px solid rgba(242,185,104,0.09)",
                                  boxShadow:
                                    "0 0 30px rgba(0,0,0,0.14), inset 0 0 20px rgba(255,255,255,0.006)",
                                }}
                              >
                                <div className="grid min-h-full md:grid-cols-[1fr_auto]">
                                  <div className="p-4 md:p-5">
                                    <AtrioLineLabel className="mb-3">
                                      {item.title}
                                    </AtrioLineLabel>
                                    <h4
                                      className="mb-3 text-xl leading-tight md:text-2xl"
                                      style={{
                                        color: colors.headingSection,
                                        fontWeight: 620,
                                        letterSpacing: "-0.045em",
                                      }}
                                    >
                                      {item.detailTitle}
                                    </h4>
                                    <p
                                      className="mb-4 text-sm leading-relaxed"
                                      style={{ color: "rgba(255,245,235,0.64)" }}
                                    >
                                      {item.detailText}
                                    </p>
                                    <p
                                      className="rounded-[16px] px-4 py-3 text-xs leading-relaxed md:text-sm"
                                      style={{
                                        background: "rgba(242,185,104,0.040)",
                                        border:
                                          "1px solid rgba(242,185,104,0.085)",
                                        color: "rgba(255,245,235,0.56)",
                                      }}
                                    >
                                      {item.reflection}
                                    </p>
                                  </div>

                                  <div
                                    className="relative min-h-[160px] overflow-hidden border-t p-4 md:w-[210px] md:border-l md:border-t-0"
                                    style={{
                                      borderColor: "rgba(242,185,104,0.08)",
                                      background:
                                        "radial-gradient(circle at 50% 36%, rgba(242,185,104,0.12), transparent 42%), linear-gradient(180deg, rgba(5,2,2,0.24), rgba(5,2,2,0.58))",
                                    }}
                                  >
                                    <div
                                      className="absolute inset-5 rounded-full opacity-50"
                                      style={{
                                        border:
                                          "1px solid rgba(242,185,104,0.12)",
                                        boxShadow:
                                          "inset 0 0 32px rgba(242,185,104,0.025)",
                                      }}
                                    />
                                    <div className="relative z-10 flex h-full min-h-[130px] flex-col items-center justify-center text-center">
                                      <span
                                        className="mb-3 h-8 w-8 rounded-full"
                                        style={{
                                          border:
                                            "1px solid rgba(242,185,104,0.22)",
                                          boxShadow:
                                            "0 0 24px rgba(242,185,104,0.08), inset 0 0 12px rgba(242,185,104,0.06)",
                                        }}
                                      />
                                      <p
                                        className="max-w-[140px] text-[9px] uppercase tracking-[0.18em]"
                                        style={{
                                          color: "rgba(255,245,235,0.50)",
                                        }}
                                      >
                                        {item.visualLabel}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </article>
                            ))}

                            <div className="grid gap-2 sm:grid-cols-3">
                              {group.items.slice(1).map((item) => {
                                const isExpanded = Boolean(
                                  expandedResultItems[item.targetId],
                                );

                                return (
                                  <article
                                    key={item.targetId}
                                    id={item.targetId}
                                    className="scroll-mt-24 overflow-hidden rounded-[18px]"
                                    style={{
                                      background: "rgba(255,255,255,0.020)",
                                      border:
                                        "1px solid rgba(242,185,104,0.075)",
                                    }}
                                  >
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setExpandedResultItems((prev) => ({
                                          ...prev,
                                          [item.targetId]: !prev[item.targetId],
                                        }))
                                      }
                                      className="flex w-full items-start justify-between gap-3 p-4 text-left"
                                    >
                                      <div>
                                        <AtrioLineLabel className="mb-2">
                                          {item.title}
                                        </AtrioLineLabel>
                                        <h4
                                          className="text-sm leading-tight md:text-base"
                                          style={{
                                            color: colors.headingSection,
                                            fontWeight: 600,
                                            letterSpacing: "-0.030em",
                                          }}
                                        >
                                          {item.detailTitle}
                                        </h4>
                                        <p
                                          className="mt-2 text-xs leading-relaxed"
                                          style={{
                                            color: "rgba(255,245,235,0.48)",
                                          }}
                                        >
                                          {item.summary}
                                        </p>
                                      </div>

                                      <span
                                        className="mt-1 shrink-0 rounded-full px-2.5 py-1 text-[9px] uppercase tracking-[0.12em]"
                                        style={{
                                          background: "rgba(242,185,104,0.055)",
                                          border:
                                            "1px solid rgba(242,185,104,0.09)",
                                          color: colors.goldSoft,
                                        }}
                                      >
                                        {isExpanded ? "Fechar" : "Abrir"}
                                      </span>
                                    </button>

                                    <AnimatePresence initial={false}>
                                      {isExpanded && (
                                        <motion.div
                                          initial={{ height: 0, opacity: 0 }}
                                          animate={{
                                            height: "auto",
                                            opacity: 1,
                                          }}
                                          exit={{ height: 0, opacity: 0 }}
                                          transition={{
                                            duration: 0.28,
                                            ease: [0.22, 1, 0.36, 1],
                                          }}
                                          className="overflow-hidden"
                                        >
                                          <div className="px-4 pb-4">
                                            <p
                                              className="text-sm leading-relaxed"
                                              style={{
                                                color:
                                                  "rgba(255,245,235,0.62)",
                                              }}
                                            >
                                              {item.detailText}
                                            </p>
                                          </div>
                                        </motion.div>
                                      )}
                                    </AnimatePresence>
                                  </article>
                                );
                              })}
                            </div>
                          </div>
                        ) : (
                          <div className="grid gap-3 lg:grid-cols-[0.9fr_1.1fr]">
                            <div
                              className="ori-mobile-compact rounded-[22px] p-5"
                              style={{
                                background:
                                  "radial-gradient(circle at top right, rgba(242,185,104,0.12), transparent 34%), linear-gradient(135deg, rgba(255,255,255,0.034), rgba(255,255,255,0.010))",
                                border: "1px solid rgba(242,185,104,0.11)",
                                boxShadow:
                                  "0 0 30px rgba(0,0,0,0.16), inset 0 0 20px rgba(255,255,255,0.006)",
                                opacity: isLocked ? 0.78 : 1,
                              }}
                            >
                              <AtrioLineLabel className="mb-3">
                                Próxima tradução
                              </AtrioLineLabel>
                              <h4
                                className="mb-3 text-2xl leading-tight md:text-[28px]"
                                style={{
                                  color: colors.headingSection,
                                  fontWeight: 620,
                                  letterSpacing: "-0.052em",
                                }}
                              >
                                O Dossiê transforma essência em imagem visível.
                              </h4>
                              <p
                                className="text-sm leading-relaxed md:text-base"
                                style={{ color: "rgba(255,245,235,0.62)" }}
                              >
                                Corpo, cor, cabelo, beleza e presença entram
                                como camadas práticas para mostrar como sua
                                força aparece no mundo.
                              </p>
                            </div>

                            <div className="grid gap-2 sm:grid-cols-2">
                              {group.items.map((item) => (
                                <div
                                  key={item.targetId}
                                  id={item.targetId}
                                    className="ori-mobile-compact-sm scroll-mt-24 rounded-[18px] p-4 transition duration-300 hover:-translate-y-0.5"
                                  style={{
                                    background: "rgba(255,255,255,0.022)",
                                    border:
                                      "1px solid rgba(242,185,104,0.075)",
                                    opacity: isLocked ? 0.72 : 1,
                                  }}
                                >
                                  <div className="mb-2 flex items-center justify-between gap-3">
                                    <AtrioLineLabel>{item.title}</AtrioLineLabel>
                                    <span
                                      className="text-xs"
                                      aria-label="Bloqueado"
                                      title="Bloqueado"
                                    >
                                      🔒
                                    </span>
                                  </div>
                                  <p
                                    className="ori-mobile-preview-3 text-sm leading-relaxed"
                                    style={{ color: "rgba(255,245,235,0.62)" }}
                                  >
                                    {item.summary}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </>
                    )}

                    {group.id === "aplicacao" && (
                      <div
                        className="ori-mobile-compact rounded-[22px] p-5"
                        style={{
                          background: codigoFinalRevelado
                            ? "radial-gradient(circle at top right, rgba(242,185,104,0.10), transparent 34%), linear-gradient(135deg, rgba(255,255,255,0.032), rgba(255,255,255,0.010))"
                            : "linear-gradient(135deg, rgba(255,255,255,0.026), rgba(255,255,255,0.008))",
                          border: codigoFinalRevelado
                            ? "1px solid rgba(242,185,104,0.10)"
                            : "1px solid rgba(242,185,104,0.075)",
                          opacity: isLocked ? 0.68 : 1,
                        }}
                      >
                        <AtrioLineLabel className="mb-3">
                          {codigoFinalRevelado
                            ? "Aplicação liberada"
                            : "Camada futura"}
                        </AtrioLineLabel>

                        <h4
                          className="mb-3 max-w-2xl text-2xl leading-tight md:text-[28px]"
                          style={{
                            color: colors.headingSection,
                            fontWeight: 620,
                            letterSpacing: "-0.052em",
                          }}
                        >
                          {codigoFinalRevelado
                            ? "Sua identidade já pode virar guarda-roupa real."
                            : "O Código Final aplica a leitura no armário, nos looks e na rotina."}
                        </h4>

                        <p
                          className="ori-mobile-preview-3 mb-4 max-w-2xl text-sm leading-relaxed md:text-base"
                          style={{ color: "rgba(255,245,235,0.58)" }}
                        >
                          {codigoFinalRevelado
                            ? "A camada final reúne cápsula, fórmulas de look, prioridades de compra e decisões práticas para sustentar sua presença no cotidiano."
                            : "Essa etapa fica mais adiante. Ela leva a leitura para o armário, os looks, as compras e a rotina real."}
                        </p>

                        <div className="flex flex-wrap gap-2">
                          {group.items.map((item) => (
                            <span
                              key={item.targetId}
                              id={item.targetId}
                              className="scroll-mt-24 rounded-full px-4 py-2 text-xs"
                              style={{
                                background: "rgba(255,255,255,0.024)",
                                border: "1px solid rgba(242,185,104,0.08)",
                                color: "rgba(255,245,235,0.58)",
                              }}
                            >
                              {!codigoFinalRevelado && (
                                <span className="mr-2" aria-hidden="true">
                                  🔒
                                </span>
                              )}
                              {item.title}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </MotionSection>

        {SHOW_LEGACY_MIRROR_SECTIONS && (
          <>
        <MotionSection
          id="espelho-estado"
          reduceMotion={reduceMotion}
          className="relative overflow-hidden rounded-[28px] md:rounded-[38px] p-4 md:p-6 mb-5"
          style={{
            backgroundColor: "rgba(5,2,2,0.92)",
            backgroundImage: ORACLE_PANEL_BACKGROUND,
            backgroundSize: "cover",
            backgroundPosition: "center",
            border: `1px solid ${colors.border}`,
            boxShadow:
              "0 24px 80px rgba(0,0,0,0.20), inset 0 1px 0 rgba(255,255,255,0.018)",
            backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
          }}
        >
          <div className="relative z-10 grid xl:grid-cols-[0.28fr_1.72fr] gap-6 items-center">
            <div>
              <h2
                className="text-2xl md:text-[28px] leading-[1.02] mb-4"
                style={{
                  color: colors.headingSection,
                  fontWeight: 540,
                  letterSpacing: "-0.045em",
                }}
              >
                Onde sua imagem está sendo lida.
              </h2>

              <p
                className="text-sm leading-relaxed"
                style={{ color: colors.muted }}
              >
                Um selo de leitura para observar conexão, tensão e próxima
                direção.
              </p>
            </div>

            <div
              className="grid lg:grid-cols-[0.78fr_1.22fr] gap-4 items-stretch rounded-[34px] p-3"
              style={{
                background: "rgba(5,2,2,0.26)",
                border: "1px solid rgba(242,185,104,0.075)",
              }}
            >
              <div
                className="relative overflow-hidden rounded-[28px] p-5 md:p-6 min-h-[270px] flex flex-col justify-between"
                style={{
                  background:
                    "radial-gradient(circle at top right, rgba(242,185,104,0.16), transparent 34%), radial-gradient(circle at bottom left, rgba(210,135,70,0.09), transparent 38%), linear-gradient(180deg, rgba(5,2,2,0.30), rgba(5,2,2,0.50))",
                  border: "1px solid rgba(242,185,104,0.085)",
                  boxShadow:
                    "inset 0 1px 0 rgba(255,255,255,0.014)",
                }}
              >
                <div
                  className="pointer-events-none absolute inset-y-6 left-0 w-px"
                  style={{
                    background:
                      "linear-gradient(180deg, transparent, rgba(210,135,70,0.48), transparent)",
                  }}
                />

                <div>
                  <div className="mb-7 flex items-center justify-between gap-4">
                    <p
                      className="uppercase tracking-[0.26em] text-[9px]"
                      style={{ color: colors.goldSoft }}
                    >
                      Estado atual
                    </p>

                    <span
                      className="rounded-full px-3 py-1 text-[9px] uppercase tracking-[0.18em]"
                      style={{
                        background: "rgba(210,135,70,0.065)",
                        border: "1px solid rgba(210,135,70,0.14)",
                        color: colors.goldSoft,
                      }}
                    >
                      {hasConnectionPercent
                        ? `${connectionSafePercent}%`
                        : "Ativo"}
                    </span>
                  </div>

                  <h3
                    className="text-3xl md:text-[34px] leading-[1.02] mb-4"
                    style={{
                      color: colors.headingActive,
                      fontWeight: 560,
                      letterSpacing: "-0.058em",
                    }}
                  >
                    {hasConnectionPercent
                      ? connectionLabel
                      : "Presença em formação"}
                  </h3>

                  <p
                    className="text-base leading-relaxed"
                    style={{
                      color: "rgba(247,234,216,0.58)",
                      fontWeight: 430,
                    }}
                  >
                    {hasConnectionPercent
                      ? "Sua imagem já começou a revelar direção."
                      : "Sua imagem já começou a revelar direção."}
                  </p>
                </div>

                <div className="mt-7">
                  <div
                    className="mb-4 h-px w-full"
                    style={{
                      background:
                        "linear-gradient(90deg, rgba(210,135,70,0.34), transparent)",
                    }}
                  />

                  <p
                    className="text-sm leading-relaxed"
                    style={{ color: colors.muted }}
                  >
                    {hasConnectionPercent
                      ? "A próxima leitura traduz essa direção em forma, cor e presença visual."
                      : "O selo se completa quando a próxima leitura trouxer dados de imagem."}
                  </p>
                </div>
              </div>

              <div
                className="relative overflow-hidden rounded-[28px] p-5 md:p-6 min-h-[270px]"
                style={{
                  background:
                    "radial-gradient(circle at top right, rgba(242,185,104,0.16), transparent 34%), radial-gradient(circle at bottom left, rgba(210,135,70,0.09), transparent 38%), linear-gradient(180deg, rgba(5,2,2,0.30), rgba(5,2,2,0.50))",
                  border: "1px solid rgba(242,185,104,0.085)",
                  boxShadow:
                    "inset 0 1px 0 rgba(255,255,255,0.014)",
                }}
              >
                <p
                  className="uppercase tracking-[0.26em] text-[9px] mb-4"
                  style={{ color: colors.goldSoft }}
                >
                  Ponto que pede consciência
                </p>

                <h3
                  className="text-xl md:text-3xl leading-[1.08] mb-4"
                  style={{
                    color: colors.headingReading,
                    fontWeight: 560,
                    letterSpacing: "-0.045em",
                  }}
                >
                  O que hoje pede direção na sua imagem.
                </h3>

                <div
                  className="rounded-[20px] px-4 py-3.5 mb-4"
                  style={{
                    background:
                      "linear-gradient(90deg, rgba(210,135,70,0.055), rgba(255,255,255,0.008))",
                    border: "1px solid rgba(210,135,70,0.10)",
                  }}
                >
                  <p
                    className="text-sm leading-relaxed"
                    style={{
                      color: "rgba(255,245,235,0.68)",
                      fontWeight: 420,
                    }}
                  >
                    {centralPainValue}
                  </p>
                </div>

                <p
                  className="text-sm leading-relaxed"
                  style={{ color: colors.muted }}
                >
                  O método transforma esse ponto em direção: nomeia a força,
                  traduz a imagem e aplica coerência na vida real.
                </p>
              </div>
            </div>
          </div>
        </MotionSection>

        <MotionSection
          id="espelho-matriz"
          reduceMotion={reduceMotion}
          className="relative overflow-hidden rounded-[28px] md:rounded-[38px] p-4 md:p-6 mb-5"
          style={{
            backgroundColor: "rgba(5,2,2,0.92)",
            backgroundImage: ORACLE_PANEL_BACKGROUND,
            backgroundSize: "cover",
            backgroundPosition: "center",
            border: `1px solid ${colors.border}`,
            boxShadow:
              "0 24px 80px rgba(0,0,0,0.20), inset 0 1px 0 rgba(255,255,255,0.018)",
            backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
          }}
        >
          <div className="relative z-10 grid gap-7 items-start xl:grid-cols-[0.32fr_1.68fr] xl:gap-8">
            <div className="flex flex-col xl:sticky xl:top-6 xl:min-h-[620px]">
              <div
                className="relative pl-5"
                style={{
                  borderLeft: "1px solid rgba(242,185,104,0.22)",
                }}
              >
                <p
                  className="mb-5 text-[10px] uppercase tracking-[0.42em]"
                  style={{ color: colors.goldSoft }}
                >
                  Matriz ORI
                </p>
                <h2
                  className="text-3xl md:text-[32px] leading-[0.98] mb-4 max-w-sm"
                  style={{
                    color: colors.headingSection,
                    fontWeight: 600,
                    letterSpacing: "-0.06em",
                  }}
                >
                  Sua matriz de leitura e imagem.
                </h2>

                <p
                  className="text-sm leading-relaxed max-w-xs"
                  style={{ color: colors.muted }}
                >
                  Acompanhe a travessia entre revelação, tradução e aplicação.
                </p>
              </div>

              <div
                className="mt-7 grid gap-3"
                role="tablist"
                aria-label="Camadas da matriz ORI"
              >
                {matrixLayers.map((layer) => {
                  const isActiveLayer = selectedMatrixLayer.id === layer.id;

                  return (
                    <button
                      key={layer.id}
                      type="button"
                      role="tab"
                      aria-selected={isActiveLayer}
                      aria-label={`Ver camada ${layer.title}`}
                      onClick={() => {
                        setActiveMatrixLayer(layer.id);
                        setActiveMatrixItem(layer.items[0]?.label);
                      }}
                      className="group relative min-h-[58px] overflow-hidden rounded-[17px] py-2 pl-12 pr-3 text-left transition-colors duration-300"
                      style={{
                        background: isActiveLayer
                          ? "radial-gradient(circle at top right, rgba(242,185,104,0.16), transparent 40%), linear-gradient(135deg, rgba(242,185,104,0.12), rgba(255,255,255,0.018))"
                          : "linear-gradient(135deg, rgba(255,255,255,0.026), rgba(255,255,255,0.010))",
                        border: isActiveLayer
                          ? "1px solid rgba(242,185,104,0.24)"
                          : "1px solid rgba(242,185,104,0.075)",
                        boxShadow: isActiveLayer
                          ? "0 0 34px rgba(242,185,104,0.060), inset 0 0 24px rgba(242,185,104,0.018)"
                          : "inset 0 0 20px rgba(255,255,255,0.006)",
                      }}
                    >
                      {isActiveLayer && !reduceMotion && (
                        <motion.div
                          className="pointer-events-none absolute inset-y-0 left-0 w-px"
                          animate={{ opacity: [0.35, 1, 0.42] }}
                          transition={{
                            duration: 2.4,
                            repeat: Infinity,
                            ease: "easeInOut",
                          }}
                          style={{
                            background:
                              "linear-gradient(180deg, transparent, rgba(242,185,104,0.88), transparent)",
                          }}
                        />
                      )}
                      <div className="flex h-full items-center gap-2.5">
                        <span
                          className="absolute left-3 top-1/2 z-10 flex h-7 w-7 -translate-y-1/2 shrink-0 items-center justify-center rounded-full text-[9px]"
                          style={{
                            background: isActiveLayer
                              ? "rgba(242,185,104,0.18)"
                              : "rgba(5,2,2,0.68)",
                            border: isActiveLayer
                              ? "1px solid rgba(242,185,104,0.34)"
                              : "1px solid rgba(242,185,104,0.08)",
                            color: isActiveLayer ? colors.gold : colors.muted,
                            boxShadow: isActiveLayer
                              ? "0 0 22px rgba(242,185,104,0.18)"
                              : "none",
                          }}
                        >
                          {layer.number}
                        </span>

                        <div>
                          <p
                            className="text-[13px] leading-tight"
                            style={{
                              color: isActiveLayer
                                ? colors.title
                                : "rgba(255,245,235,0.66)",
                              fontWeight: 580,
                              letterSpacing: "-0.026em",
                            }}
                          >
                            {layer.title}
                          </p>
                          <p
                            className="mt-0.5 text-[10px] leading-snug"
                            style={{ color: "rgba(255,245,235,0.44)" }}
                          >
                            {matrixLayerNotes[layer.id]}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {selectedMatrixLayer.text && (
                <div
                  className="mt-7 rounded-[18px] px-3.5 py-3"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(242,185,104,0.045), rgba(255,255,255,0.010))",
                    border: "1px solid rgba(242,185,104,0.09)",
                  }}
                >
                  <p
                    className="text-xs leading-relaxed"
                    style={{ color: "rgba(255,245,235,0.58)" }}
                  >
                    {selectedMatrixLayer.text}
                  </p>
                </div>
              )}
            </div>

            <div className="min-w-0">
              <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                <div>
                  <h3
                    className="text-2xl md:text-3xl leading-tight"
                    style={{
                      color:
                        selectedMatrixLayer.id === "revelado"
                          ? colors.headingActive
                          : colors.headingReading,
                      fontWeight: 640,
                      letterSpacing: "-0.052em",
                    }}
                  >
                    {selectedMatrixLayer.title}
                  </h3>
                </div>

                {selectedMatrixLayer.text && (
                  <p
                    className="max-w-md text-sm leading-relaxed"
                    style={{ color: colors.muted }}
                  >
                    {selectedMatrixLayer.text}
                  </p>
                )}
              </div>

              <div className="mb-3 min-w-0">
                <div className="mb-3 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
                  <p
                    className="text-xs leading-relaxed md:text-sm"
                    style={{ color: "rgba(255,245,235,0.52)" }}
                  >
                    Escolha uma etapa da camada para ver como ela aparece no seu
                    Espelho.
                  </p>
                  <p
                    className="shrink-0 text-[10px] uppercase tracking-[0.22em]"
                    style={{ color: colors.goldSoft }}
                  >
                    Etapa {selectedMatrixItemIndex + 1} de{" "}
                    {selectedMatrixLayer.items.length}
                  </p>
                </div>

                <div className="relative min-w-0 max-w-full overflow-hidden">
                  <div
                    className="ori-premium-scroll flex w-full max-w-full snap-x flex-nowrap gap-1.5 overflow-x-auto pb-1.5 pr-4 md:gap-2.5 md:pb-2.5 md:pr-6"
                    role="tablist"
                    aria-label={`Itens da camada ${selectedMatrixLayer.title}`}
                    style={{
                      scrollbarWidth: "thin",
                      scrollbarColor: "rgba(242,185,104,0.20) transparent",
                    }}
                  >
                    {selectedMatrixLayer.items.map((item, index) => {
                      const isActive = selectedMatrixItem?.label === item.label;
                      const isRevealed = item.state === "revealed";
                      const isSealed = item.state === "sealed";

                      return (
                        <button
                          key={item.label}
                          type="button"
                          role="tab"
                          aria-selected={isActive}
                          aria-label={`Ver etapa ${index + 1}: ${item.label}`}
                          onClick={() => setActiveMatrixItem(item.label)}
                          className="relative h-[86px] min-w-[168px] max-w-[168px] shrink-0 basis-[168px] snap-start overflow-hidden rounded-[14px] p-2.5 text-left transition-colors duration-300 md:h-[104px] md:min-w-[206px] md:max-w-[206px] md:basis-[206px] md:rounded-[18px] md:p-3.5"
                          style={{
                            background: isActive
                              ? `${item.aura}, linear-gradient(135deg, rgba(242,185,104,0.12), rgba(255,255,255,0.018))`
                              : "linear-gradient(135deg, rgba(255,255,255,0.034), rgba(255,255,255,0.010))",
                            border: isActive
                              ? "1px solid rgba(242,185,104,0.32)"
                              : "1px solid rgba(242,185,104,0.10)",
                            boxShadow: isActive
                              ? "0 0 28px rgba(242,185,104,0.075), inset 0 0 22px rgba(242,185,104,0.014)"
                              : "inset 0 0 14px rgba(255,255,255,0.005)",
                          }}
                        >
                        <div className="mb-2 flex items-center justify-between gap-2 md:mb-3">
                          <span
                            className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[8px] md:h-6 md:w-6 md:text-[9px]"
                            style={{
                              background: isActive
                                ? "rgba(242,185,104,0.13)"
                                : "rgba(255,255,255,0.026)",
                              border: isActive
                                ? "1px solid rgba(242,185,104,0.20)"
                                : "1px solid rgba(242,185,104,0.08)",
                              color: isActive ? colors.gold : colors.muted,
                            }}
                          >
                            {String(index + 1).padStart(2, "0")}
                          </span>

                          <span
                            className="rounded-full px-1.5 py-0.5 text-[7px] uppercase tracking-[0.10em] md:px-2 md:tracking-[0.14em]"
                            style={{
                              background: isRevealed
                                ? "rgba(242,185,104,0.09)"
                                : "rgba(255,255,255,0.028)",
                              border: isRevealed
                                ? "1px solid rgba(242,185,104,0.14)"
                                : "1px solid rgba(255,255,255,0.055)",
                              color: isRevealed
                                ? colors.gold
                                : isSealed
                                  ? "rgba(255,245,235,0.42)"
                                  : "rgba(255,245,235,0.54)",
                            }}
                          >
                            {isRevealed
                              ? "Revelado"
                              : isSealed
                                ? "Selado"
                                : "Em tradução"}
                          </span>
                        </div>

                        <p
                          className="mb-1 text-[13px] leading-tight md:mb-1.5 md:text-[15px]"
                          style={{
                            color: isActive
                              ? colors.headingReading
                              : "rgba(255,245,235,0.70)",
                            fontWeight: isActive ? 640 : 560,
                            letterSpacing: "-0.026em",
                          }}
                        >
                          {item.label}
                        </p>
                        <p
                          className="hidden text-[11px] leading-relaxed sm:[display:-webkit-box]"
                          style={{
                            color: isActive
                              ? "rgba(255,245,235,0.54)"
                              : "rgba(255,245,235,0.42)",
                            overflow: "hidden",
                            WebkitBoxOrient: "vertical",
                            WebkitLineClamp: 2,
                          }}
                        >
                          {item.caption}
                        </p>
                        </button>
                      );
                    })}
                  </div>

                  <div
                    className="pointer-events-none absolute bottom-3 right-0 top-0 w-8"
                    style={{
                      background:
                        "linear-gradient(90deg, transparent, rgba(10,4,5,0.26))",
                    }}
                  />
                </div>
              </div>

              <AnimatePresence mode="wait">
                {selectedMatrixItem && (
                  <motion.div
                    key={`${selectedMatrixLayer.id}-${selectedMatrixItem.label}`}
                    initial={
                      reduceMotion
                        ? false
                        : { opacity: 0, y: 16, filter: "blur(8px)" }
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
                    transition={{ duration: 0.36, ease: [0.22, 1, 0.36, 1] }}
                    className="relative min-h-[auto] overflow-hidden rounded-[28px] p-4 md:min-h-[500px] md:p-5 lg:h-[510px]"
                    style={{
                      background:
                        selectedMatrixItem.state === "revealed"
                          ? `${selectedMatrixItem.aura}, linear-gradient(180deg, rgba(242,185,104,0.066), rgba(255,255,255,0.012))`
                          : `${selectedMatrixItem.aura}, linear-gradient(180deg, rgba(255,255,255,0.028), rgba(255,255,255,0.010))`,
                      border:
                        selectedMatrixItem.state === "revealed"
                          ? "1px solid rgba(242,185,104,0.18)"
                          : `1px solid ${colors.borderSoft}`,
                      boxShadow:
                        "0 0 46px rgba(242,185,104,0.040), inset 0 0 34px rgba(255,255,255,0.010)",
                    }}
                  >
                    <motion.div
                      className="absolute inset-0 pointer-events-none"
                      animate={
                        !reduceMotion
                          ? { opacity: [0.12, 0.24, 0.14] }
                          : undefined
                      }
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                      style={{
                        background:
                          "linear-gradient(120deg, transparent, rgba(242,185,104,0.12), transparent)",
                      }}
                    />

                    <div className="relative z-10 grid h-full gap-5 lg:grid-cols-[0.88fr_1.12fr] lg:gap-7">
                      <div
                        className="relative min-h-[190px] overflow-hidden rounded-[22px] md:min-h-[330px] lg:h-full lg:min-h-0"
                        style={{
                          border: "1px solid rgba(242,185,104,0.18)",
                          boxShadow:
                            "inset 0 0 38px rgba(5,2,2,0.30), 0 18px 48px rgba(0,0,0,0.24)",
                        }}
                      >
                        <img
                          src={selectedMatrixItem.image}
                          alt=""
                          className="absolute inset-0 h-full w-full object-cover"
                          style={{
                            objectPosition: selectedMatrixItem.imagePosition,
                          }}
                          loading="lazy"
                          decoding="async"
                        />
                        <div
                          className="absolute inset-0"
                          style={{
                            background:
                              "linear-gradient(180deg, rgba(5,2,2,0.02), rgba(5,2,2,0.62))",
                          }}
                        />
                        <div
                          className="absolute bottom-4 left-4 right-4 flex items-center justify-between gap-3"
                        >
                          <span
                            className="rounded-full px-3 py-1.5 text-[8px] uppercase tracking-[0.18em]"
                            style={{
                              background: "rgba(5,2,2,0.55)",
                              border: "1px solid rgba(242,185,104,0.14)",
                              color: colors.goldSoft,
                              backdropFilter: "blur(8px)",
                              WebkitBackdropFilter: "blur(8px)",
                            }}
                          >
                            Camada aberta
                          </span>
                          <span
                            className="rounded-full px-3 py-1.5 text-[8px] uppercase tracking-[0.18em]"
                            style={{
                              background: "rgba(5,2,2,0.55)",
                              border: "1px solid rgba(242,185,104,0.14)",
                              color: colors.goldSoft,
                              backdropFilter: "blur(8px)",
                              WebkitBackdropFilter: "blur(8px)",
                            }}
                          >
                            Etapa {selectedMatrixItemIndex + 1} de{" "}
                            {selectedMatrixLayer.items.length}
                          </span>
                        </div>
                      </div>

                      <div className="flex min-h-0 flex-col justify-between gap-4 rounded-[26px] p-1">
                        <div className="shrink-0">
                          <div className="mb-4 flex items-center justify-between gap-4">
                            <p
                              className="text-[9px] uppercase tracking-[0.34em]"
                              style={{ color: colors.goldSoft }}
                            >
                              {selectedMatrixItem.caption}
                            </p>
                            <span
                              className="rounded-full px-3 py-1.5 text-[8px] uppercase tracking-[0.20em]"
                              style={{
                                background:
                                  selectedMatrixItem.state === "revealed"
                                    ? "rgba(242,185,104,0.10)"
                                    : "rgba(255,255,255,0.035)",
                                border:
                                  selectedMatrixItem.state === "revealed"
                                    ? "1px solid rgba(242,185,104,0.16)"
                                    : "1px solid rgba(255,255,255,0.06)",
                                color:
                                  selectedMatrixItem.state === "revealed"
                                    ? colors.gold
                                    : selectedMatrixItem.state === "sealed"
                                      ? "rgba(255,245,235,0.42)"
                                      : "rgba(255,245,235,0.58)",
                              }}
                            >
                              {selectedMatrixItem.state === "revealed"
                                ? "Camada revelada"
                                : selectedMatrixItem.state === "sealed"
                                  ? "Selado"
                                  : "Em tradução"}
                            </span>
                          </div>

                          <h4
                            className="mb-4 text-3xl leading-[0.98] md:text-[38px] xl:text-[42px]"
                            style={{
                              color:
                                selectedMatrixItem.state === "revealed"
                                  ? colors.title
                                  : colors.title,
                              fontWeight: 600,
                              letterSpacing: "-0.065em",
                            }}
                          >
                            {selectedMatrixItem.label}
                          </h4>

                          <div>
                            <div
                              className="relative overflow-hidden rounded-[22px] px-4 py-3.5 md:px-5 md:py-4"
                              style={{
                                background:
                                  selectedMatrixItem.state === "revealed"
                                    ? "linear-gradient(90deg, rgba(242,185,104,0.12), rgba(255,255,255,0.018), rgba(255,255,255,0.010))"
                                    : "linear-gradient(90deg, rgba(255,255,255,0.030), rgba(255,255,255,0.012))",
                                border:
                                  selectedMatrixItem.state === "revealed"
                                    ? "1px solid rgba(242,185,104,0.18)"
                                    : "1px solid rgba(255,255,255,0.052)",
                                boxShadow:
                                  "inset 0 0 26px rgba(255,255,255,0.010)",
                              }}
                            >
                              <div className="flex items-center gap-3">
                                <span
                                  className="h-8 w-px shrink-0"
                                  style={{
                                    background:
                                      "linear-gradient(180deg, transparent, rgba(242,185,104,0.55), transparent)",
                                  }}
                                />
                                <p
                                  className="text-xl leading-tight md:text-2xl"
                                  style={{
                                    color:
                                      selectedMatrixItem.state === "revealed"
                                        ? colors.gold
                                        : colors.text,
                                    fontWeight:
                                      selectedMatrixItem.state === "revealed"
                                        ? 640
                                        : 500,
                                    letterSpacing: "-0.04em",
                                  }}
                                >
                                  {selectedMatrixItem.value}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div
                          className="grid shrink-0 gap-0 border-y py-3.5 md:grid-cols-2"
                          style={{
                            borderColor: "rgba(242,185,104,0.11)",
                          }}
                        >
                          <div
                            className="border-b pb-4 md:border-b-0 md:border-r md:pb-0 md:pr-4"
                            style={{ borderColor: "rgba(242,185,104,0.12)" }}
                          >
                            <p
                              className="mb-2.5 text-[7px] uppercase tracking-[0.24em]"
                              style={{ color: colors.goldSoft }}
                            >
                              O que esta camada revela
                            </p>
                            <p
                              className="text-[13px] leading-relaxed"
                              style={{ color: "rgba(255,245,235,0.66)" }}
                            >
                              {selectedMatrixItem.impact}
                            </p>
                          </div>

                          <div
                            className="hidden pt-4 md:block md:pl-4 md:pt-0"
                          >
                            <p
                              className="mb-2.5 text-[7px] uppercase tracking-[0.24em]"
                              style={{ color: colors.goldSoft }}
                            >
                              Como essa leitura continua
                            </p>
                            <p
                              className="text-[13px] leading-relaxed"
                              style={{ color: "rgba(255,245,235,0.56)" }}
                            >
                              Essa base se aprofunda conforme corpo, cor, cabelo
                              e presença forem integrados ao método.
                            </p>
                          </div>
                        </div>

                        <div
                          className="hidden shrink-0 rounded-[22px] px-4 py-3.5 text-center md:block"
                          style={{
                            background:
                              "linear-gradient(135deg, rgba(242,185,104,0.060), rgba(255,255,255,0.012))",
                            border: "1px solid rgba(242,185,104,0.14)",
                            boxShadow:
                              "inset 0 0 24px rgba(242,185,104,0.010)",
                          }}
                        >
                          <p
                            className="mb-1.5 text-[7px] uppercase tracking-[0.28em]"
                            style={{ color: colors.goldSoft }}
                          >
                            Composição da camada
                          </p>
                          <p
                            className="text-lg leading-tight md:text-xl"
                            style={{
                              color: colors.title,
                              fontWeight: 520,
                              letterSpacing: "-0.04em",
                            }}
                          >
                            {selectedMatrixItem.text}
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </MotionSection>

        <MotionSection
          reduceMotion={reduceMotion}
          className="relative left-1/2 mb-5 h-[48vh] min-h-[340px] w-[100dvw] max-w-[100dvw] -translate-x-1/2 overflow-hidden md:h-[50vh]"
          style={{
            background: "var(--bg-primary)",
          }}
        >
          <img
            src="/images/espelho-ori/oraculo/fundo-oraculo-premium.png"
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
            loading="lazy"
            decoding="async"
            style={{
              filter: "saturate(1.04) contrast(1.06) brightness(1.06)",
              objectPosition: "center center",
            }}
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(90deg, rgba(5,2,2,0.84), rgba(5,2,2,0.50) 47%, rgba(5,2,2,0.62)), linear-gradient(180deg, rgba(5,2,2,0.26), rgba(5,2,2,0.58))",
            }}
          />
          <div
            className="pointer-events-none absolute inset-x-0 top-0 h-24"
            style={{
              background:
                "linear-gradient(180deg, rgba(5,2,2,0.98), rgba(5,2,2,0))",
            }}
          />
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 h-28"
            style={{
              background:
                "linear-gradient(0deg, rgba(5,2,2,0.98), rgba(5,2,2,0))",
            }}
          />
          <div className="relative z-10 mx-auto flex h-full w-full max-w-[1240px] items-center px-6 text-center md:text-left">
            <div className="max-w-[620px] md:ml-8">
              <p
                className="mb-4 text-[8px] uppercase tracking-[0.38em] md:text-[9px]"
                style={{ color: "var(--copper-primary)" }}
              >
                Entre presença e imagem
              </p>

              <h2
                className="text-[26px] leading-[1.12] md:text-[34px] xl:text-[38px]"
                style={{
                  color: colors.title,
                  fontWeight: 520,
                  letterSpacing: "-0.035em",
                  textShadow: "0 16px 48px rgba(0,0,0,0.54)",
                }}
              >
                Sua imagem começa onde sua presença deixa de pedir licença.
              </h2>
            </div>
          </div>
        </MotionSection>


        <MotionSection
          id="espelho-camadas"
          reduceMotion={reduceMotion}
          className="relative overflow-hidden rounded-[24px] md:rounded-[32px] px-4 py-5 md:px-6 md:py-6 mb-5"
          style={{
            backgroundColor: "rgba(5,2,2,0.92)",
            backgroundImage: activeTab?.aura
              ? `${activeTab.aura}, ${ORACLE_PANEL_BACKGROUND}`
              : ORACLE_PANEL_BACKGROUND,
            backgroundSize: "cover",
            backgroundPosition: "center",
            border: "1px solid rgba(242,185,104,0.075)",
            boxShadow:
              "0 24px 80px rgba(0,0,0,0.20), inset 0 1px 0 rgba(255,255,255,0.018)",
            backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
          }}
        >
          <div className="relative z-10">
            <div className="mb-3 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div className="max-w-2xl">
                <h2
                  className="text-xl md:text-[26px] leading-[1.05] mb-2"
                  style={{
                    color: colors.title,
                    fontWeight: 560,
                    letterSpacing: "-0.045em",
                  }}
                >
                  Escolha uma camada para aprofundar.
                </h2>

                <p
                  className="text-xs md:text-sm leading-relaxed max-w-xl"
                  style={{ color: "rgba(255,245,235,0.56)" }}
                >
                  Toque em essência, presença, imagem ou sombra para revelar
                  outro ângulo da sua leitura.
                </p>
              </div>

              <p
                className="hidden text-[10px] uppercase tracking-[0.22em] md:block"
                style={{ color: colors.goldSoft }}
              >
                Toque para alternar
              </p>
            </div>

            <div>
              <div className="grid grid-cols-2 gap-2 md:grid-cols-4 md:gap-3 mb-3">
                {mirrorTabs.map((tab) => {
                  const tabIndex = mirrorTabs.findIndex(
                    (item) => item.id === tab.id,
                  );
                  const isActive = activeMirrorTab === tab.id;

                  return (
                    <motion.button
                      key={tab.id}
                      type="button"
                      onClick={() => {
                        setActiveMirrorTab(tab.id);
                        setExpandedMirrorLayer(false);
                      }}
                      whileHover={reduceMotion ? undefined : { y: -1 }}
                      whileTap={reduceMotion ? undefined : { scale: 0.98 }}
                      className="group relative min-h-[46px] cursor-pointer overflow-hidden rounded-[16px] px-3 py-2 text-left transition-colors duration-300"
                      style={{
                        background: isActive
                          ? "linear-gradient(90deg, rgba(210,135,70,0.13), rgba(255,255,255,0.018))"
                          : "rgba(255,255,255,0.018)",
                        border: isActive
                          ? "1px solid rgba(210,135,70,0.28)"
                          : "1px solid rgba(210,135,70,0.14)",
                        color: isActive ? colors.gold : colors.muted,
                        boxShadow: isActive
                          ? "inset 0 0 18px rgba(210,135,70,0.020)"
                          : "inset 0 1px 0 rgba(255,255,255,0.010)",
                      }}
                    >
                      {isActive && !reduceMotion && (
                        <motion.span
                          className="pointer-events-none absolute inset-y-3 left-0 w-px"
                          animate={{ opacity: [0.35, 1, 0.45] }}
                          transition={{
                            duration: 2.6,
                            repeat: Infinity,
                            ease: "easeInOut",
                          }}
                          style={{
                            background:
                              "linear-gradient(180deg, transparent, rgba(242,185,104,0.86), transparent)",
                          }}
                        />
                      )}
                      <span
                        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                        style={{
                          background:
                            "linear-gradient(90deg, rgba(210,135,70,0.060), transparent)",
                        }}
                      />
                      <span
                        className="relative z-10 mb-0.5 flex items-center justify-between gap-3 uppercase tracking-[0.20em] text-[8px]"
                        style={{
                          color: isActive
                            ? colors.goldSoft
                            : "rgba(255,245,235,0.32)",
                        }}
                      >
                        <span className="flex items-center gap-2">
                          <span>{String(tabIndex + 1).padStart(2, "0")}</span>
                          {isActive && (
                            <span
                              className="tracking-[0.16em]"
                              style={{ color: colors.goldSoft }}
                            >
                              Aberta
                            </span>
                          )}
                        </span>
                        <span
                          className="transition-transform duration-300 group-hover:translate-x-0.5"
                          style={{
                            opacity: isActive ? 1 : 0.46,
                          }}
                        >
                          →
                        </span>
                      </span>

                      <span
                        className="relative z-10 block text-[13px]"
                        style={{
                          color: isActive
                            ? colors.title
                            : "rgba(255,245,235,0.54)",
                          fontWeight: isActive ? 540 : 400,
                        }}
                      >
                        {tab.label}
                      </span>
                    </motion.button>
                  );
                })}
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={activeMirrorTab}
                  initial={
                    reduceMotion
                      ? false
                      : { opacity: 0, y: 12, filter: "blur(8px)" }
                  }
                  animate={
                    reduceMotion
                      ? undefined
                      : { opacity: 1, y: 0, filter: "blur(0px)" }
                  }
                  exit={
                    reduceMotion
                      ? undefined
                      : { opacity: 0, y: -8, filter: "blur(6px)" }
                  }
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  className="relative overflow-hidden rounded-[22px] px-5 py-4 md:px-7 md:py-5"
                  style={{
                    background: activeTab?.aura
                      ? `${activeTab.aura}, linear-gradient(180deg, rgba(5,2,2,0.30), rgba(5,2,2,0.50))`
                      : "linear-gradient(180deg, rgba(5,2,2,0.30), rgba(5,2,2,0.50))",
                    border: "1px solid rgba(242,185,104,0.085)",
                    boxShadow:
                      "inset 0 1px 0 rgba(255,255,255,0.014)",
                  }}
                >
                  <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <Eyebrow>{activeTab?.eyebrow}</Eyebrow>

                    <div
                      className="inline-flex w-fit items-center gap-2 rounded-full px-3 py-1"
                      style={{
                        background: "rgba(242,185,104,0.055)",
                        border: "1px solid rgba(242,185,104,0.11)",
                        color: colors.gold,
                      }}
                    >
                      <span className="text-[10px]">◇</span>
                      <span className="text-[9px] uppercase tracking-[0.18em]">
                        Leitura aberta
                      </span>
                    </div>
                  </div>

                  <h3
                    className="text-2xl md:text-[34px] leading-[1.06] mb-3 max-w-4xl"
                    style={{
                      color: colors.headingReading,
                      fontWeight: 560,
                      letterSpacing: "-0.046em",
                    }}
                  >
                    {activeTab?.title}
                  </h3>

                  <p
                    className="text-base md:text-lg leading-relaxed max-w-5xl mb-4"
                    style={{ color: colors.text }}
                  >
                    {activeTab?.summary}
                  </p>

                  <div className="grid md:grid-cols-3 gap-0 border-y border-[rgba(242,185,104,0.08)]">
                    {[
                      ["O que isso mostra", activeTab?.shows],
                      ["Como isso aparece", activeTab?.appears],
                      ["O que fortalece / gera ruído", activeTab?.tension],
                    ].map(([label, text]) => (
                      <div
                        key={label}
                        className="px-0 py-3 md:px-5 md:first:pl-0 md:last:pr-0"
                        style={{
                          borderRight:
                            label === "O que fortalece / gera ruído"
                              ? "none"
                              : "1px solid rgba(242,185,104,0.075)",
                        }}
                      >
                        <p
                          className="uppercase tracking-[0.22em] text-[8px] mb-2"
                          style={{ color: colors.goldSoft }}
                        >
                          {label}
                        </p>

                        <p
                          className="text-xs md:text-sm leading-relaxed"
                          style={{ color: "rgba(255,245,235,0.66)" }}
                        >
                          {text}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <button
                      type="button"
                      onClick={() =>
                        setExpandedMirrorLayer((current) => !current)
                      }
                      className="inline-flex w-fit items-center gap-2 rounded-full px-4 py-2 text-xs"
                      style={{
                        background: "transparent",
                        border: "1px solid rgba(242,185,104,0.13)",
                        color: colors.goldSoft,
                      }}
                    >
                      {expandedMirrorLayer
                        ? "Recolher leitura"
                        : "Aprofundar leitura"}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        const currentIndex = mirrorTabs.findIndex(
                          (tab) => tab.id === activeMirrorTab,
                        );
                        const nextTab =
                          mirrorTabs[(currentIndex + 1) % mirrorTabs.length];

                        setActiveMirrorTab(nextTab?.id || "essencia");
                        setExpandedMirrorLayer(false);
                      }}
                      className="inline-flex w-fit items-center gap-2 text-sm transition-colors"
                      style={{ color: colors.goldSoft }}
                    >
                      <span>Próxima camada:</span>
                      <span>
                      {mirrorTabs[
                        (mirrorTabs.findIndex(
                          (tab) => tab.id === activeMirrorTab,
                        ) +
                          1) %
                          mirrorTabs.length
                      ]?.label || "Essência"}{" "}
                      →
                      </span>
                    </button>
                  </div>

                  <AnimatePresence initial={false}>
                    {expandedMirrorLayer && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                        className="overflow-hidden"
                      >
                        <div
                          className="mt-5 rounded-[20px] p-5"
                          style={{
                            background: "rgba(5,2,2,0.22)",
                            border: "1px solid rgba(242,185,104,0.07)",
                          }}
                        >
                          <p
                            className="editorial-text text-sm md:text-base leading-relaxed"
                            style={{ color: "rgba(255,245,235,0.70)" }}
                          >
                            {activeTab?.fullText}
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </MotionSection>

          </>
        )}

        <MotionSection
          id="espelho-proxima"
          reduceMotion={reduceMotion}
          className="ori-mobile-section relative overflow-hidden rounded-[24px] md:rounded-[38px] p-4 md:p-8 mb-5"
          style={{
            backgroundColor: "rgba(5,2,2,0.92)",
            backgroundImage: ORACLE_PANEL_BACKGROUND,
            backgroundSize: "cover",
            backgroundPosition: "center",
            border: `1px solid ${colors.border}`,
            boxShadow:
              "0 22px 70px rgba(0,0,0,0.18), inset 0 1px 0 rgba(255,255,255,0.018)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
          }}
        >
          <div className="relative z-10 grid gap-6 md:grid-cols-[0.62fr_0.38fr] md:items-center">
            <div>
              <AtrioLineLabel className="mb-4">
                Próximo passo
              </AtrioLineLabel>

              <h2
                className="mb-4 max-w-3xl text-3xl leading-[1.02] md:text-[42px]"
                style={{
                  color: colors.headingSection,
                  fontWeight: 620,
                  letterSpacing: "-0.065em",
                }}
              >
                Seu próximo passo é o Dossiê ORI.
              </h2>

              <p
                className="ori-mobile-preview-3 max-w-2xl text-base leading-relaxed md:text-lg"
                style={{ color: "rgba(255,245,235,0.66)" }}
              >
                Agora que sua base foi revelada, está na hora de entender como
                ela aparece na prática: no seu corpo, nas suas cores, no cabelo,
                na beleza e na presença.
              </p>
            </div>

            <div className="flex flex-col gap-3 md:items-end">
              {produto2Liberado ? (
                <Link
                  to="/produto-2"
                  className="inline-flex w-full justify-center rounded-full px-8 py-3.5 text-sm md:w-fit"
                  style={{
                    background:
                      "linear-gradient(90deg, var(--copper-primary), var(--gold-primary))",
                    color: "#090506",
                    fontWeight: 680,
                    boxShadow:
                      "0 0 42px rgba(242,185,104,0.15), inset 0 0 16px rgba(255,255,255,0.18)",
                  }}
                >
                  Continuar para o Dossiê ORI
                </Link>
              ) : (
                <button
                  disabled
                  className="inline-flex w-full cursor-not-allowed justify-center rounded-full px-8 py-3.5 text-sm opacity-75 md:w-fit"
                  style={{
                    background: "rgba(255,255,255,0.035)",
                    border: `1px solid ${colors.border}`,
                    color: "rgba(255,245,235,0.56)",
                  }}
                >
                  Dossiê ORI ainda selado
                </button>
              )}

              <Link
                to="/portal"
                className="hidden w-full justify-center rounded-full px-8 py-3.5 text-sm md:inline-flex md:w-fit"
                style={{
                  background: "rgba(255,255,255,0.026)",
                  border: `1px solid ${colors.borderSoft}`,
                  color: "rgba(255,245,235,0.72)",
                }}
              >
                Voltar ao portal
              </Link>
            </div>
          </div>
        </MotionSection>

        {SHOW_LEGACY_MIRROR_SECTIONS && (
        <MotionSection
          id="espelho-proxima"
          reduceMotion={reduceMotion}
          className="relative overflow-hidden rounded-[28px] md:rounded-[38px] p-6 md:p-8 mb-5"
          style={{
            backgroundColor: "rgba(5,2,2,0.92)",
            backgroundImage: ORACLE_PANEL_BACKGROUND,
            backgroundSize: "cover",
            backgroundPosition: "center",
            border: `1px solid ${colors.border}`,
            boxShadow:
              "0 22px 70px rgba(0,0,0,0.18), inset 0 1px 0 rgba(255,255,255,0.018)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
          }}
        >
          <div className="relative z-10 grid gap-6 md:grid-cols-[0.62fr_0.38fr] md:items-center">
            <div>
              <p
                className="mb-4 text-[9px] uppercase tracking-[0.34em]"
                style={{ color: colors.goldSoft }}
              >
                Próximo passo
              </p>

              <h2
                className="mb-4 max-w-3xl text-3xl leading-[1.02] md:text-[42px]"
                style={{
                  color: colors.headingSection,
                  fontWeight: 620,
                  letterSpacing: "-0.065em",
                }}
              >
                Seu próximo passo é o Dossiê ORI.
              </h2>

              <p
                className="max-w-2xl text-base leading-relaxed md:text-lg"
                style={{ color: "rgba(255,245,235,0.66)" }}
              >
                Agora que sua base foi revelada, está na hora de entender como
                ela aparece na prática: no seu corpo, nas suas cores, no cabelo,
                na beleza e na presença.
              </p>
            </div>

            <div className="flex flex-col gap-3 md:items-end">
              {produto2Liberado ? (
                <Link
                  to="/produto-2"
                  className="inline-flex w-full justify-center rounded-full px-8 py-3.5 text-sm md:w-fit"
                  style={{
                    background:
                      "linear-gradient(90deg, var(--copper-primary), var(--gold-primary))",
                    color: "#090506",
                    fontWeight: 680,
                    boxShadow:
                      "0 0 42px rgba(242,185,104,0.15), inset 0 0 16px rgba(255,255,255,0.18)",
                  }}
                >
                  Continuar para o Dossiê ORI
                </Link>
              ) : (
                <button
                  disabled
                  className="inline-flex w-full cursor-not-allowed justify-center rounded-full px-8 py-3.5 text-sm opacity-75 md:w-fit"
                  style={{
                    background: "rgba(255,255,255,0.035)",
                    border: `1px solid ${colors.border}`,
                    color: "rgba(255,245,235,0.56)",
                  }}
                >
                  Dossiê ORI ainda selado
                </button>
              )}

              <Link
                to="/portal"
                className="inline-flex w-full justify-center rounded-full px-8 py-3.5 text-sm md:w-fit"
                style={{
                  background: "rgba(255,255,255,0.026)",
                  border: `1px solid ${colors.borderSoft}`,
                  color: "rgba(255,245,235,0.72)",
                }}
              >
                Voltar ao portal
              </Link>
            </div>
          </div>
        </MotionSection>
        )}

        {SHOW_LEGACY_MIRROR_SECTIONS && (
          <>
        <MotionSection
          id="espelho-proxima"
          reduceMotion={reduceMotion}
          className="relative overflow-hidden rounded-[28px] md:rounded-[34px] p-5 md:p-7 mb-5"
          style={{
            backgroundColor: "rgba(5,2,2,0.92)",
            backgroundImage: ORACLE_PANEL_BACKGROUND,
            backgroundSize: "cover",
            backgroundPosition: "center",
            border: `1px solid ${colors.border}`,
            boxShadow:
              "0 22px 70px rgba(0,0,0,0.18), inset 0 1px 0 rgba(255,255,255,0.018)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
          }}
        >
          <div className="relative z-10 grid gap-7 xl:grid-cols-[0.78fr_1.22fr] xl:items-center">
            <div className="flex h-full flex-col justify-center xl:pr-8">
              <h2
                className="mb-4 max-w-xl text-3xl leading-[1.02] md:text-[36px]"
                style={{
                  color: colors.headingSection,
                  fontWeight: 620,
                  letterSpacing: "-0.058em",
                }}
              >
                {nextCrossingTitle}
              </h2>

              <p
                className="max-w-md text-sm leading-relaxed md:text-base"
                style={{ color: "rgba(255,245,235,0.58)" }}
              >
                O próximo passo não precisa explicar tudo. Ele só precisa
                mostrar por onde continuar.
              </p>
            </div>

            <div
              className="xl:border-l xl:pl-8"
              style={{ borderColor: "rgba(242,185,104,0.10)" }}
            >
              <p
                className="mb-4 text-[9px] uppercase tracking-[0.26em]"
                style={{ color: colors.goldSoft }}
              >
                Por que importa
              </p>

              <p
                className="max-w-3xl text-base leading-relaxed md:text-lg"
                style={{
                  color: "rgba(255,245,235,0.76)",
                  fontWeight: 430,
                  letterSpacing: "-0.018em",
                }}
              >
                {nextWhyMatters}
              </p>

              <div
                className="mt-6 h-px w-full"
                style={{ background: "rgba(242,185,104,0.10)" }}
              />

              <div className="mt-5 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <p
                      className="mb-2 text-[9px] uppercase tracking-[0.22em]"
                      style={{ color: colors.goldSoft }}
                    >
                      Aberto
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {revealedNow.map((item) => (
                        <span
                          key={item}
                          className="rounded-full px-3 py-1.5 text-xs"
                          style={{
                            background: "rgba(242,185,104,0.060)",
                            border: "1px solid rgba(242,185,104,0.12)",
                            color: "rgba(255,245,235,0.72)",
                          }}
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p
                      className="mb-2 text-[9px] uppercase tracking-[0.22em]"
                      style={{ color: colors.goldSoft }}
                    >
                      Selado
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {nextUnlocks.map((item) => (
                        <span
                          key={item}
                          className="rounded-full px-3 py-1.5 text-xs"
                          style={{
                            background: "rgba(255,255,255,0.022)",
                            border: "1px solid rgba(255,255,255,0.055)",
                            color: "rgba(255,245,235,0.50)",
                          }}
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {nextStep.active ? (
                  <Link
                    to={nextStep.link}
                    className="inline-flex shrink-0 justify-center rounded-full px-6 py-3 text-sm"
                    style={{
                      background: colors.gold,
                      color: "#090506",
                      fontWeight: 650,
                      boxShadow:
                        "0 0 34px rgba(242,185,104,0.12), inset 0 0 14px rgba(255,255,255,0.16)",
                    }}
                  >
                    Abrir próxima camada
                  </Link>
                ) : (
                  <button
                    disabled
                    className="inline-flex shrink-0 cursor-not-allowed justify-center rounded-full px-6 py-3 text-sm opacity-75"
                    style={{
                      background: "rgba(255,255,255,0.035)",
                      border: `1px solid ${colors.border}`,
                      color: "rgba(255,245,235,0.56)",
                    }}
                  >
                    Próxima camada selada
                  </button>
                )}
              </div>
            </div>
          </div>
        </MotionSection>

        <MotionSection
          reduceMotion={reduceMotion}
          className="relative overflow-hidden rounded-[30px] md:rounded-[42px] p-6 md:p-8 mb-3 text-center"
          style={{
            backgroundColor: "rgba(5,2,2,0.92)",
            backgroundImage: ORACLE_PANEL_BACKGROUND,
            backgroundSize: "cover",
            backgroundPosition: "center",
            border: `1px solid ${colors.borderSoft}`,
            boxShadow:
              "0 0 60px rgba(242,185,104,0.030), inset 0 0 40px rgba(255,255,255,0.010)",
            backdropFilter: "blur(18px)",
            WebkitBackdropFilter: "blur(18px)",
          }}
        >
          <Eyebrow>Fechamento do Espelho</Eyebrow>

          <h2
            className="text-3xl md:text-[32px] leading-tight max-w-4xl mx-auto mb-5"
            style={{
              color: colors.title,
              fontWeight: 600,
              letterSpacing: "-0.056em",
            }}
          >
            Sua leitura já começou.{" "}
            <span style={{ color: colors.gold }}>
              Agora ela precisa ganhar forma.
            </span>
          </h2>

          <p
            className="text-sm md:text-base leading-relaxed max-w-3xl mx-auto"
            style={{ color: colors.muted }}
          >
            {finalCrossingText}
          </p>

          <div className="mt-7 flex flex-col sm:flex-row items-center justify-center gap-3">
            {nextStep.active ? (
              <Link
                to={nextStep.link}
                className="inline-flex justify-center px-8 py-3.5 rounded-full text-sm"
                style={{
                  background: colors.gold,
                  color: "#090506",
                  fontWeight: 650,
                  boxShadow:
                    "0 0 42px rgba(242,185,104,0.15), inset 0 0 16px rgba(255,255,255,0.18)",
                }}
              >
                Abrir próxima camada
              </Link>
            ) : (
              <button
                disabled
                className="inline-flex justify-center px-8 py-3.5 rounded-full text-sm opacity-75 cursor-not-allowed"
                style={{
                  background: "rgba(255,255,255,0.035)",
                  border: `1px solid ${colors.border}`,
                  color: "rgba(255,245,235,0.56)",
                }}
              >
                Próxima camada selada
              </button>
            )}

            <Link
              to="/portal"
              className="inline-flex justify-center px-8 py-3.5 rounded-full text-sm"
              style={{
                background: "rgba(255,255,255,0.026)",
                border: `1px solid ${colors.borderSoft}`,
                color: "rgba(255,245,235,0.72)",
              }}
            >
              Voltar ao portal
            </Link>
          </div>
        </MotionSection>
          </>
        )}
      </div>
    </main>
  );
}

export default EspelhoOri;
