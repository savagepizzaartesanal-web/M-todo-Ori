import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

import { supabase } from "../lib/supabaseClient";
import { reports } from "../data/reports";
import { archetypeImages } from "../data/archetypeImages";
import ResultHero from "../components/ResultHero";
import {
  AmbientMirrorField,
  MirrorSectionNav,
} from "../components/espelho/EspelhoInteractions";

const LEGACY_STORAGE_KEY = "ori_produto_1_quiz";
const DAILY_CARD_STORAGE_KEY = "ori_espelho_daily_oracle_v1";
const ORACLE_CARD_BACK_IMAGE = "/images/espelho-ori/oraculo/verso-deck.png";

const colors = {
  gold: "var(--gold-primary)",
  goldSoft: "var(--gold-soft)",
  title: "#f7efe5",
  text: "rgba(255,245,235,0.70)",
  muted: "rgba(255,245,235,0.50)",
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

const sectionVariants = {
  hidden: {
    opacity: 0,
    y: 28,
    filter: "blur(10px)",
  },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      duration: 0.85,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

const softReveal = {
  hidden: {
    opacity: 0,
    y: 16,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

const staggerContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.07,
      delayChildren: 0.06,
    },
  },
};

function getPreview(text = "", maxLength = 360) {
  if (!text) return "";

  const cleanText = String(text).replace(/\n+/g, " ").trim();

  if (cleanText.length <= maxLength) {
    return cleanText;
  }

  return `${cleanText.slice(0, maxLength).trim()}...`;
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

function getTodayKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function shuffleArray(items = []) {
  const copy = [...items];

  for (let index = copy.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[randomIndex]] = [copy[randomIndex], copy[index]];
  }

  return copy;
}

function pickRandom(items = []) {
  if (!items.length) return "";
  return items[Math.floor(Math.random() * items.length)];
}

function getDailyStorageKey(userKey) {
  return `${DAILY_CARD_STORAGE_KEY}:${userKey || "local"}`;
}

function readDailyOracle(userKey) {
  try {
    const rawData = localStorage.getItem(getDailyStorageKey(userKey));
    return rawData ? JSON.parse(rawData) : null;
  } catch (error) {
    console.log("Erro ao ler carta diária:", error);
    return null;
  }
}

function saveDailyOracle(userKey, data) {
  try {
    localStorage.setItem(getDailyStorageKey(userKey), JSON.stringify(data));
  } catch (error) {
    console.log("Erro ao salvar carta diária:", error);
  }
}

function Eyebrow({ children, className = "" }) {
  return (
    <p
      className={`uppercase tracking-[0.42em] text-[9px] mb-4 ${className}`}
      style={{ color: colors.goldSoft }}
    >
      {children}
    </p>
  );
}

function MotionSection({
  children,
  className = "",
  style = {},
  reduceMotion,
  ...props
}) {
  return (
    <motion.section
      className={className}
      style={style}
      {...props}
      variants={reduceMotion ? undefined : sectionVariants}
      initial={reduceMotion ? false : "hidden"}
      whileInView={reduceMotion ? undefined : "visible"}
      viewport={{ once: true, amount: 0.16 }}
    >
      {children}
    </motion.section>
  );
}

function buildOracleCards({
  hasResult,
  resultadoFinal,
  principal,
  secundario,
}) {
  const resultName = resultadoFinal || "sua força";
  const first = principal || "seu arquétipo principal";
  const second = secundario || "seu arquétipo secundário";

  return [
    {
      id: "essencia",
      code: "I",
      hiddenTitle: "Carta I",
      title: "Carta da Essência",
      subtitle: "O que sustenta você",
      revealLabel: "Essência revelada",
      image: "/images/espelho-ori/oraculo/carta-essencia.png",
      aura: "radial-gradient(circle at top, rgba(242,185,104,0.24), transparent 36%), radial-gradient(circle at bottom, rgba(210,135,70,0.12), transparent 38%), linear-gradient(180deg, rgba(46,27,14,0.78), rgba(8,3,4,0.97))",
      messages: hasResult
        ? [
            `${resultName} não é apenas um nome. É uma estrutura começando a pedir presença, escolha e sustentação.`,
            `Hoje, o Espelho lembra: você não precisa suavizar sua força para que ela seja aceita.`,
            `A essência da ${resultName} se fortalece quando você para de negociar o direito de existir inteira.`,
            `Nem toda força precisa ser explicada. Algumas precisam apenas ser sustentadas com calma e presença.`,
            `O que foi revelado em você não é excesso. É matéria-prima da sua imagem futura.`,
            `Sua essência não está pedindo uma versão mais adequada. Está pedindo uma forma mais fiel.`,
            `O nome da sua força já apareceu. Agora observe onde você ainda age como se precisasse escondê-la.`,
            `Hoje, a pergunta é simples: que parte da sua presença você ainda trata como se fosse grande demais?`,
            `A sua força não nasceu para caber em leituras pequenas. Ela nasceu para organizar sua presença.`,
            `O Espelho não revelou um rótulo. Ele revelou uma direção interna.`,
            `Sua essência fica mais clara quando você abandona a tentativa de agradar todos os olhares.`,
            `A ${resultName} amadurece quando presença deixa de ser performance e vira verdade sustentada.`,
            `Você não precisa se tornar outra mulher. Precisa parar de abandonar a mulher que foi nomeada em você.`,
            `O que sustenta você não é aprovação. É coerência entre o que sente, escolhe e comunica.`,
            `Hoje, honre a parte de você que já sabe quem é, mesmo antes de conseguir mostrar isso por completo.`,
          ]
        : [
            "Sua essência ainda está aguardando nome. A primeira leitura abre essa porta.",
            "Antes da forma, existe uma força esperando linguagem.",
            "O primeiro espelho começa quando você permite que sua presença seja lida com profundidade.",
          ],
    },
    {
      id: "sombra",
      code: "II",
      hiddenTitle: "Carta II",
      title: "Carta da Sombra",
      subtitle: "O que pede consciência",
      revealLabel: "Sombra revelada",
      image: "/images/espelho-ori/oraculo/carta-sombra.png",
      aura: "radial-gradient(circle at top, rgba(183,140,255,0.22), transparent 36%), radial-gradient(circle at bottom, rgba(70,40,120,0.16), transparent 38%), linear-gradient(180deg, rgba(24,12,31,0.78), rgba(5,2,8,0.98))",
      messages: hasResult
        ? [
            `A sombra da ${resultName} aparece quando a força que protege você também começa a limitar sua expansão.`,
            `Hoje, observe onde sua defesa já deixou de proteger e começou a impedir movimento.`,
            `Nem tudo que parece autocontrole é consciência. Às vezes, é medo vestido de força.`,
            `Sua sombra não quer te punir. Ela quer mostrar onde sua energia ainda está sendo usada para sobreviver.`,
            `O ponto oculto de hoje: talvez você esteja chamando de limite aquilo que, na verdade, virou armadura.`,
            `A ${resultName} perde brilho quando tenta provar força escondendo vulnerabilidade.`,
            `A sombra pede uma pergunta: o que você evita mostrar porque acredita que isso diminuiria sua presença?`,
            `Algumas defesas foram necessárias um dia. Mas nem todas precisam continuar governando sua imagem.`,
            `Hoje, o Espelho mostra uma tensão: proteger-se demais também pode apagar sua expressão.`,
            `A consciência começa quando você percebe que nem toda reação rápida é intuição. Às vezes, é ferida antiga.`,
            `Sua força amadurece quando a sombra deixa de comandar em silêncio.`,
            `O que você tenta controlar em excesso pode estar revelando exatamente onde sua imagem pede cuidado.`,
            `A sombra não é o oposto da sua beleza. É a camada que precisa ser integrada para sua presença ficar inteira.`,
            `Hoje, não lute contra o que apareceu. Nomeie. O que é nomeado perde parte do poder invisível.`,
            `Existe uma parte sua que quer crescer, mas ainda se protege como se estivesse em ameaça. Olhe para ela com respeito.`,
          ]
        : [
            "Algumas defesas só podem ser vistas depois que sua primeira leitura abre o espelho.",
            "A sombra não é defeito. É uma camada esperando consciência.",
            "Antes de revelar a imagem, o Espelho precisa nomear o que ainda está oculto.",
          ],
    },
    {
      id: "imagem",
      code: "III",
      hiddenTitle: "Carta III",
      title: "Carta da Imagem",
      subtitle: "O que quer ganhar forma",
      revealLabel: "Imagem revelada",
      image: "/images/espelho-ori/oraculo/carta-imagem.png",
      aura: "radial-gradient(circle at top, rgba(255,230,190,0.22), transparent 34%), radial-gradient(circle at bottom, rgba(242,185,104,0.10), transparent 40%), linear-gradient(180deg, rgba(34,23,18,0.78), rgba(5,2,2,0.97))",
      messages: hasResult
        ? [
            `Sua imagem não precisa criar uma nova versão de você. Ela precisa traduzir com mais precisão a força que a leitura já revelou: ${resultName}.`,
            `Hoje, o Espelho pergunta: sua aparência está sustentando sua essência ou escondendo sua força?`,
            `A imagem certa não inventa presença. Ela organiza o que já existe em você.`,
            `O próximo passo não é parecer melhor. É parecer mais coerente.`,
            `Sua imagem começa a se alinhar quando forma, cor e presença deixam de competir entre si.`,
            `A ${resultName} pede uma estética que não reduza sua complexidade a uma tendência.`,
            `Hoje, observe se sua roupa está comunicando verdade ou apenas tentando resolver expectativa externa.`,
            `A imagem não é superfície. É linguagem visível da sua identidade.`,
            `O que você veste pode reforçar sua leitura ou criar ruído no modo como o mundo te percebe.`,
            `A pergunta do dia: que parte da sua imagem ainda não acompanha a força que você sente por dentro?`,
            `Sua presença visual não precisa gritar. Precisa sustentar uma direção clara.`,
            `A imagem amadurece quando deixa de ser tentativa de agradar e vira assinatura.`,
            `Você não precisa escolher entre beleza e profundidade. Sua imagem pode carregar as duas.`,
            `A ${resultName} pede menos improviso visual e mais coerência simbólica.`,
            `Hoje, repare nos detalhes: cor, textura, corte e gesto já estão dizendo algo sobre você.`,
          ]
        : [
            "Sua imagem ainda está em silêncio. Primeiro a essência é nomeada, depois ela ganha forma.",
            "A forma só faz sentido depois que a força é reconhecida.",
            "O Dossiê ORI transforma leitura em direção visual.",
          ],
    },
    {
      id: "presenca",
      code: "IV",
      hiddenTitle: "Carta IV",
      title: "Carta da Presença",
      subtitle: "O que chega antes da fala",
      revealLabel: "Presença revelada",
      image: "/images/espelho-ori/oraculo/carta-presenca.png",
      aura: "radial-gradient(circle at top, rgba(242,185,104,0.26), transparent 36%), radial-gradient(circle at bottom, rgba(255,145,88,0.13), transparent 38%), linear-gradient(180deg, rgba(38,18,11,0.78), rgba(5,2,2,0.97))",
      messages: hasResult
        ? [
            `${first} e ${second} já começam a desenhar a forma como sua presença chega antes das palavras.`,
            `Hoje, observe o que você comunica antes de se explicar.`,
            `Sua presença não está apenas no que você veste. Está no ritmo, no olhar, no gesto e na forma como ocupa espaço.`,
            `A ${resultName} se torna mais forte quando o corpo deixa de pedir licença para existir.`,
            `A presença chega antes da fala. E muitas vezes revela o que a imagem ainda tenta esconder.`,
            `Hoje, o Espelho lembra: postura também é linguagem simbólica.`,
            `Sua energia visual muda quando você se posiciona como alguém que pertence ao próprio lugar.`,
            `Nem toda presença precisa ser intensa. Algumas precisam ser firmes, silenciosas e inegociáveis.`,
            `A pergunta de hoje: o mundo vê sua força ou apenas a versão que você aprendeu a apresentar?`,
            `Sua presença cresce quando você para de entrar nos espaços como se precisasse ser aceita por eles.`,
            `O corpo comunica uma verdade que a mente nem sempre consegue organizar.`,
            `A presença da ${resultName} pede eixo, não rigidez. Profundidade, não excesso.`,
            `Hoje, perceba se você está ocupando espaço com verdade ou se está se ajustando para não causar impacto.`,
            `Sua presença não precisa ser explicada para ser sentida.`,
            `O que chega antes da sua fala merece ser cuidado como parte da sua assinatura.`,
          ]
        : [
            "Sua presença será revelada em camadas, quando sua leitura começar a tomar forma.",
            "A presença é o primeiro sinal do espelho, mesmo antes da imagem estar pronta.",
            "Quando sua essência for nomeada, sua presença começará a ganhar direção.",
          ],
    },
    {
      id: "caminho",
      code: "V",
      hiddenTitle: "Carta V",
      title: "Carta do Caminho",
      subtitle: "O próximo movimento",
      revealLabel: "Caminho revelado",
      image: "/images/espelho-ori/oraculo/carta-caminho.png",
      aura: "radial-gradient(circle at top, rgba(242,185,104,0.20), transparent 36%), radial-gradient(circle at bottom, rgba(183,140,255,0.16), transparent 38%), linear-gradient(180deg, rgba(26,15,20,0.78), rgba(5,2,2,0.97))",
      messages: hasResult
        ? [
            `O próximo passo não é parecer diferente. É transformar a força ${resultName} em imagem, escolha, presença e direção visual.`,
            `Hoje, o caminho pede menos pressa e mais integração.`,
            `Você já viu quem é. Agora o próximo espelho pergunta: como essa força aparece no mundo?`,
            `A jornada não termina na revelação. Ela começa quando você decide viver de forma mais coerente com ela.`,
            `O Dossiê ORI é a ponte entre identidade percebida e imagem visível.`,
            `Hoje, o Espelho aponta para frente: corpo, cor, cabelo, beleza e presença ainda têm algo a revelar.`,
            `O próximo movimento é transformar percepção em direção.`,
            `Sua força já foi nomeada. O caminho agora é impedir que ela continue invisível na sua imagem.`,
            `A próxima camada não vai mudar quem você é. Vai dar forma ao que já começou a aparecer.`,
            `Hoje, não procure uma resposta final. Procure o próximo gesto coerente.`,
            `A ${resultName} pede continuidade. Uma revelação sem integração vira apenas informação bonita.`,
            `O caminho se abre quando você entende que imagem também é escolha de identidade.`,
            `Sua jornada pede travessia, não pressa. Camada por camada, a imagem começa a se organizar.`,
            `O próximo passo é fazer sua presença ser reconhecida antes mesmo de você precisar explicar.`,
            `Hoje, o Espelho não entrega tudo. Ele apenas aponta: ainda existe mais de você para ser visto.`,
          ]
        : [
            "O próximo caminho se abre quando a primeira camada da jornada é concluída.",
            "A jornada começa quando sua essência deixa de ser sensação e vira linguagem.",
            "O próximo espelho só se revela quando a primeira porta é aberta.",
          ],
    },
  ];
}

function EspelhoOri() {
  const reduceMotion = useReducedMotion();

  const [cliente, setCliente] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeMirrorTab, setActiveMirrorTab] = useState("essencia");
  const [activeCard, setActiveCard] = useState(null);
  const [dailyOracle, setDailyOracle] = useState(null);
  const [cardOrder, setCardOrder] = useState([]);
  const [localResult, setLocalResult] = useState(null);
  const [expandedMirrorLayer, setExpandedMirrorLayer] = useState(false);
  const [activeMatrixItem, setActiveMatrixItem] = useState("Arquétipo");
  const [activeMatrixLayer, setActiveMatrixLayer] = useState("revelado");

  const todayKey = getTodayKey();

  useEffect(() => {
    async function loadCliente() {
      setLoading(true);

      const { data: sessionData } = await supabase.auth.getSession();
      const user = sessionData?.session?.user;

      if (!user?.id) {
        setLocalResult(null);
        setLoading(false);
        return;
      }

      const storageKey = getQuizStorageKey(user.id);
      const revealedLocalResult = getLocalResult(storageKey);

      localStorage.removeItem(LEGACY_STORAGE_KEY);
      setLocalResult(revealedLocalResult);

      const { data, error } = await supabase
        .from("clientes")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) {
        console.log("Erro ao buscar cliente:", error);
      }

      setCliente(data || null);
      setLoading(false);
    }

    loadCliente();
  }, []);

  const resultadoFinal =
    cliente?.resultado || localResult?.nomeComposto || null;

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

  const produto2Liberado = cliente?.produto_2_liberado ?? false;
  const produto3Liberado = cliente?.produto_3_liberado ?? false;

  const hasResult = Boolean(resultadoFinal);
  const imageData = resultadoFinal ? archetypeImages[resultadoFinal] : null;

  const userKey =
    cliente?.user_id ||
    cliente?.id ||
    localResult?.nomeComposto ||
    resultadoFinal ||
    "local";

  const oracleCards = useMemo(
    () =>
      buildOracleCards({
        hasResult,
        resultadoFinal,
        principal,
        secundario,
      }),
    [hasResult, resultadoFinal, principal, secundario],
  );

  const defaultCardOrder = useMemo(
    () => oracleCards.map((card) => card.id),
    [oracleCards],
  );

  useEffect(() => {
    if (!oracleCards.length || loading) return;

    let isMounted = true;

    async function syncDailyOracle() {
      await Promise.resolve();

      if (!isMounted) return;

      if (!hasResult) {
        setDailyOracle(null);
        setActiveCard(null);
        setCardOrder(defaultCardOrder);
        return;
      }

      const storedOracle = readDailyOracle(userKey);

      if (storedOracle?.dateKey === todayKey) {
        setDailyOracle(storedOracle);
        setActiveCard(storedOracle.cardId);
        setCardOrder(
          storedOracle.cardOrder?.length
            ? storedOracle.cardOrder
            : defaultCardOrder,
        );
        return;
      }

      setDailyOracle(null);
      setActiveCard(null);
      setCardOrder(shuffleArray(defaultCardOrder));
    }

    syncDailyOracle();

    return () => {
      isMounted = false;
    };
  }, [
    defaultCardOrder,
    hasResult,
    loading,
    oracleCards.length,
    todayKey,
    userKey,
  ]);

  const orderedOracleCards = useMemo(() => {
    const ordered = cardOrder
      .map((id) => oracleCards.find((card) => card.id === id))
      .filter(Boolean);

    return ordered.length ? ordered : oracleCards;
  }, [cardOrder, oracleCards]);

  const selectedCard =
    oracleCards.find((card) => card.id === activeCard) || null;

  const oracleLockedToday = dailyOracle?.dateKey === todayKey;

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
    cliente?.principal_dor ||
    cliente?.dor_principal ||
    cliente?.dor_imagem ||
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

  const matrixItems = [
    {
      label: "Arquétipo",
      caption: "Base simbólica",
      image: "/images/espelho-ori/assinatura-visual.png",
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
      image: "/images/espelho-ori/presenca.png",
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
      image: "/images/espelho-ori/beleza.png",
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
      image: "/images/espelho-ori/corpo.png",
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
      image: "/images/espelho-ori/paleta.png",
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
      image: "/images/espelho-ori/cabelo.png",
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
      image: "/images/espelho-ori/beleza.png",
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
      image: "/images/espelho-ori/assinatura-visual.png",
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
      image: "/images/espelho-ori/assinatura-visual.png",
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
      image: "/images/espelho-ori/presenca.png",
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
      image: "/images/espelho-ori/paleta.png",
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
      title: "Revelado agora",
      text: "A camada que nomeia a base simbólica, a presença e o ponto de tensão inicial.",
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

  const mirrorSections = [
    { id: "espelho-hero", number: "01", label: "Revelação" },
    { id: "espelho-matriz", number: "02", label: "Matriz" },
    { id: "espelho-estado", number: "03", label: "Estado atual" },
    { id: "espelho-camadas", number: "04", label: "Camadas" },
    { id: "espelho-carta", number: "05", label: "Carta diária" },
    { id: "espelho-proxima", number: "06", label: "Próxima travessia" },
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

  const handleDrawCard = (card) => {
    if (!hasResult) return;
    if (oracleLockedToday) return;

    const message = pickRandom(card.messages);
    const shuffledOrder = shuffleArray(defaultCardOrder);

    const data = {
      dateKey: todayKey,
      cardId: card.id,
      cardTitle: card.title,
      revealLabel: card.revealLabel,
      code: card.code,
      message,
      cardOrder: shuffledOrder,
    };

    setActiveCard(card.id);
    setDailyOracle(data);
    saveDailyOracle(userKey, data);

    window.setTimeout(() => {
      setCardOrder(shuffledOrder);
    }, 520);
  };

  const handleDrawFromDeck = () => {
    if (!hasResult || oracleLockedToday || !orderedOracleCards.length) return;
    handleDrawCard(pickRandom(orderedOracleCards));
  };

  const handleShuffleCards = () => {
    if (!hasResult || oracleLockedToday) return;
    setActiveCard(null);
    setDailyOracle(null);
    setCardOrder(shuffleArray(defaultCardOrder));
  };

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
      done: false,
      active: produto2Liberado,
    },
    {
      number: "03",
      title: "Código Final",
      done: false,
      active: produto3Liberado,
    },
  ];

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
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 18 }}
          animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
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
        </motion.div>
      </main>
    );
  }

  return (
    <main
      className="relative min-h-screen overflow-hidden px-4 py-5 md:px-7 md:py-7"
      style={{ color: colors.title }}
    >
      <AmbientMirrorField
        reduceMotion={reduceMotion}
        intensity={selectedCard ? "deep" : "warm"}
      />
      <MirrorSectionNav sections={mirrorSections} colors={colors} />

      <div
        className="fixed inset-0 -z-20"
        style={{
          backgroundImage:
            "linear-gradient(180deg, rgba(0,0,0,0.02), rgba(0,0,0,0.70)), url('/images/backgrounds/master-bg.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      />

      <motion.div
        className="fixed inset-0 -z-10 pointer-events-none"
        animate={
          reduceMotion
            ? undefined
            : {
                opacity: [0.9, 1, 0.92],
              }
        }
        transition={{
          duration: 9,
          repeat: Infinity,
          repeatType: "mirror",
          ease: "easeInOut",
        }}
        style={{
          background:
            "radial-gradient(circle at 42% 18%, rgba(242,185,104,0.10), transparent 30%), radial-gradient(circle at 88% 76%, rgba(183,140,255,0.13), transparent 34%), linear-gradient(90deg, rgba(5,2,2,0.86), rgba(5,2,2,0.18), rgba(5,2,2,0.86))",
        }}
      />

      <div
        className="fixed inset-0 -z-10 pointer-events-none opacity-[0.022]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(242,185,104,0.18) 1px, transparent 1px), linear-gradient(90deg, rgba(242,185,104,0.08) 1px, transparent 1px)",
          backgroundSize: "82px 82px",
        }}
      />

      <div className="relative z-10 w-full max-w-[1240px] mx-auto">
        <motion.header
          initial={reduceMotion ? false : { opacity: 0, y: -12 }}
          animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
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
                  <span>{item.done ? "✓" : item.number}</span>
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
        </motion.header>

        <div id="espelho-hero" className="scroll-mt-6">
          {hasResult ? (
            <ResultHero
              nome={resultadoFinal}
              principal={principal}
              secundario={secundario}
              frase={reflection.fraseHero}
              imagem={imageData?.image}
            />
          ) : (
            <motion.section
            initial={reduceMotion ? false : { opacity: 0, y: 18 }}
            animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="cinematic-card relative overflow-hidden rounded-[28px] md:rounded-[36px] mb-5 min-h-[380px] md:min-h-[420px] xl:min-h-[430px]"
            style={{
              background:
                "linear-gradient(135deg, rgba(18,9,10,0.82), rgba(5,2,2,0.94))",
              border: "1px solid rgba(242,185,104,0.12)",
              boxShadow:
                "0 0 72px rgba(242,185,104,0.04), inset 0 0 52px rgba(255,255,255,0.012)",
              backdropFilter: "blur(14px)",
              WebkitBackdropFilter: "blur(14px)",
            }}
          >
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  "radial-gradient(circle at 74% 28%, rgba(242,185,104,0.12), transparent 26%), radial-gradient(circle at 18% 84%, rgba(183,140,255,0.05), transparent 32%)",
              }}
            />

            <div className="relative z-10 px-6 py-6 md:px-8 md:py-7 xl:px-10 xl:py-8 max-w-[94%] md:max-w-[56%] lg:max-w-[50%] min-h-[380px] md:min-h-[420px] xl:min-h-[430px] flex flex-col justify-center">
              <div
                className="inline-flex w-fit px-4 py-2 rounded-full mb-5"
                style={{
                  background: "rgba(255,255,255,0.022)",
                  border: "1px solid rgba(242,185,104,0.10)",
                  backdropFilter: "blur(8px)",
                  WebkitBackdropFilter: "blur(8px)",
                }}
              >
                <p
                  className="uppercase tracking-[0.34em] text-[9px]"
                  style={{ color: colors.goldSoft }}
                >
                  Espelho ORI
                </p>
              </div>

              <h1
                className="text-[42px] md:text-[54px] xl:text-[64px] font-semibold leading-[0.90] mb-4"
                style={{
                  color: colors.gold,
                  letterSpacing: "-0.075em",
                  textShadow: "0 0 34px rgba(242,185,104,0.12)",
                }}
              >
                Seu Espelho ORI ainda está fechado.
              </h1>

              <p
                className="text-lg md:text-[25px] leading-[1.28] max-w-xl mb-5"
                style={{ color: colors.title }}
              >
                Antes de mostrar como sua imagem aparece, o método precisa
                reconhecer a força que sustenta sua presença.
              </p>

              <p
                className="text-sm md:text-[15px] leading-relaxed max-w-xl mb-6"
                style={{ color: "rgba(255,245,235,0.72)" }}
              >
                Comece pelo Código das Deusas para revelar sua composição
                arquetípica inicial e abrir a primeira camada da sua jornada.
              </p>

              <Link
                to="/produto-1"
                className="inline-flex w-fit justify-center px-7 py-3.5 rounded-full text-sm"
                style={{
                  background: colors.gold,
                  color: "#090506",
                  fontWeight: 650,
                  boxShadow:
                    "0 0 42px rgba(242,185,104,0.15), inset 0 0 16px rgba(255,255,255,0.18)",
                }}
              >
                Revelar minha primeira camada
              </Link>
            </div>
            </motion.section>
          )}
        </div>

        <MotionSection
          id="espelho-matriz"
          reduceMotion={reduceMotion}
          className="relative overflow-hidden rounded-[28px] md:rounded-[38px] p-4 md:p-6 mb-5"
          style={{
            background: selectedMatrixItem?.aura
              ? `${selectedMatrixItem.aura}, linear-gradient(135deg, rgba(18,9,10,0.68), rgba(5,2,2,0.88))`
              : "radial-gradient(circle at top right, rgba(242,185,104,0.10), transparent 34%), radial-gradient(circle at bottom left, rgba(183,140,255,0.08), transparent 36%), linear-gradient(135deg, rgba(18,9,10,0.68), rgba(5,2,2,0.88))",
            border: `1px solid ${colors.border}`,
            boxShadow:
              "0 0 70px rgba(242,185,104,0.038), inset 0 0 46px rgba(255,255,255,0.010)",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
          }}
        >
          <div className="grid gap-8 items-start xl:grid-cols-[0.40fr_1.60fr] xl:gap-11">
            <div className="flex flex-col xl:sticky xl:top-6 xl:min-h-[620px]">
              <Eyebrow>02 · Matriz</Eyebrow>

              <h2
                className="text-3xl md:text-[32px] leading-[0.98] mb-4 max-w-sm"
                style={{
                  color: colors.title,
                  fontWeight: 600,
                  letterSpacing: "-0.06em",
                }}
              >
                Sua matriz de leitura e imagem.
              </h2>

              <p
                className="text-sm md:text-base leading-relaxed max-w-md"
                style={{ color: colors.muted }}
              >
                A matriz acompanha a jornada como um mapa vivo: primeiro revela
                a base, depois traduz a imagem e por fim aplica essa direção na
                vida real.
              </p>

              <div
                className="mt-6 grid gap-2"
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
                      onClick={() => {
                        setActiveMatrixLayer(layer.id);
                        setActiveMatrixItem(layer.items[0]?.label);
                      }}
                      className="group relative h-[88px] overflow-hidden rounded-[22px] p-4 text-left transition-colors duration-300"
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
                      <div className="flex items-start gap-3">
                        <span
                          className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[10px]"
                          style={{
                            background: isActiveLayer
                              ? "rgba(242,185,104,0.15)"
                              : "rgba(255,255,255,0.030)",
                            border: isActiveLayer
                              ? "1px solid rgba(242,185,104,0.22)"
                              : "1px solid rgba(242,185,104,0.09)",
                            color: isActiveLayer ? colors.gold : colors.muted,
                          }}
                        >
                          {layer.number}
                        </span>

                        <div>
                          <p
                            className="mb-1 text-[8px] uppercase tracking-[0.20em]"
                            style={{ color: colors.goldSoft }}
                          >
                            {layer.eyebrow}
                          </p>
                          <p
                            className="text-base leading-tight"
                            style={{
                              color: isActiveLayer
                                ? colors.title
                                : "rgba(255,245,235,0.66)",
                              fontWeight: 620,
                              letterSpacing: "-0.035em",
                            }}
                          >
                            {layer.title}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div
                className="mt-6 rounded-[24px] p-4"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(242,185,104,0.070), rgba(255,255,255,0.014))",
                  border: "1px solid rgba(242,185,104,0.12)",
                }}
              >
                <p
                  className="text-[10px] uppercase tracking-[0.22em] mb-2"
                  style={{ color: colors.goldSoft }}
                >
                  {selectedMatrixLayer.eyebrow}
                </p>
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: colors.text }}
                >
                  {selectedMatrixLayer.text}
                </p>
              </div>
            </div>

            <div className="min-w-0">
              <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                <div>
                  <p
                    className="mb-2 text-[9px] uppercase tracking-[0.26em]"
                    style={{ color: colors.goldSoft }}
                  >
                    Camada {selectedMatrixLayer.number}
                  </p>
                  <h3
                    className="text-2xl md:text-3xl leading-tight"
                    style={{
                      color: colors.title,
                      fontWeight: 640,
                      letterSpacing: "-0.052em",
                    }}
                  >
                    {selectedMatrixLayer.title}
                  </h3>
                </div>

                <p
                  className="max-w-md text-sm leading-relaxed"
                  style={{ color: colors.muted }}
                >
                  {selectedMatrixLayer.text}
                </p>
              </div>

              <div className="mb-4 min-w-0">
                <div className="mb-3 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <p
                    className="text-sm leading-relaxed"
                    style={{ color: "rgba(255,245,235,0.58)" }}
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
                    className="ori-premium-scroll flex w-full max-w-full snap-x flex-nowrap gap-3 overflow-x-auto pb-3 pr-8"
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
                          onClick={() => setActiveMatrixItem(item.label)}
                          className="relative h-[132px] min-w-[260px] max-w-[260px] shrink-0 basis-[260px] snap-start overflow-hidden rounded-[22px] p-4 text-left transition-colors duration-300"
                          style={{
                      background: isActive
                              ? `${item.aura}, linear-gradient(135deg, rgba(242,185,104,0.105), rgba(255,255,255,0.016))`
                              : "linear-gradient(135deg, rgba(255,255,255,0.030), rgba(255,255,255,0.010))",
                            border: isActive
                              ? "1px solid rgba(242,185,104,0.30)"
                              : `1px solid ${colors.borderSoft}`,
                            boxShadow: isActive
                              ? "0 0 34px rgba(242,185,104,0.065), inset 0 0 24px rgba(242,185,104,0.016)"
                              : "inset 0 0 18px rgba(255,255,255,0.006)",
                          }}
                        >
                        <div className="mb-4 flex items-start justify-between gap-3">
                          <span
                            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[10px]"
                            style={{
                              background: isActive
                                ? "rgba(242,185,104,0.16)"
                                : "rgba(255,255,255,0.032)",
                              border: isActive
                                ? "1px solid rgba(242,185,104,0.24)"
                                : "1px solid rgba(242,185,104,0.10)",
                              color: isActive ? colors.gold : colors.muted,
                            }}
                          >
                            {String(index + 1).padStart(2, "0")}
                          </span>

                          <span
                            className="rounded-full px-2.5 py-1 text-[8px] uppercase tracking-[0.16em]"
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
                          className="mb-1 text-base leading-tight"
                          style={{
                            color: isActive
                              ? colors.title
                              : "rgba(255,245,235,0.70)",
                            fontWeight: 640,
                            letterSpacing: "-0.035em",
                          }}
                        >
                          {item.label}
                        </p>
                        <p
                          className="text-xs leading-relaxed"
                          style={{
                            color: "rgba(255,245,235,0.48)",
                            display: "-webkit-box",
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
                    className="relative overflow-hidden rounded-[30px] p-5 md:p-6 lg:h-[460px]"
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

                    <div className="relative z-10 grid h-full gap-6 lg:grid-cols-[0.88fr_1.12fr] lg:gap-8">
                      <div
                        className="relative min-h-[260px] overflow-hidden rounded-[24px] md:min-h-[330px] lg:h-full lg:min-h-0"
                        style={{
                          border: "1px solid rgba(242,185,104,0.12)",
                          boxShadow:
                            "inset 0 0 34px rgba(5,2,2,0.28), 0 18px 44px rgba(0,0,0,0.22)",
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
                            {selectedMatrixLayer.title}
                          </span>
                          <span
                            className="rounded-full px-3 py-1.5 text-[8px] uppercase tracking-[0.18em]"
                            style={{
                              background:
                                selectedMatrixItem.state === "revealed"
                                  ? "rgba(242,185,104,0.13)"
                                  : "rgba(255,255,255,0.045)",
                              border:
                                selectedMatrixItem.state === "revealed"
                                  ? "1px solid rgba(242,185,104,0.22)"
                                  : "1px solid rgba(255,255,255,0.065)",
                              color:
                                selectedMatrixItem.state === "revealed"
                                  ? colors.gold
                                  : selectedMatrixItem.state === "sealed"
                                    ? "rgba(255,245,235,0.46)"
                                    : "rgba(255,245,235,0.58)",
                              backdropFilter: "blur(8px)",
                              WebkitBackdropFilter: "blur(8px)",
                            }}
                          >
                            {selectedMatrixItem.state === "revealed"
                              ? "Revelado"
                              : selectedMatrixItem.state === "sealed"
                                ? "Selado"
                                : "Em tradução"}
                          </span>
                        </div>
                      </div>

                      <div className="flex min-h-0 flex-col gap-4 p-1 md:p-2">
                        <div className="shrink-0">
                          <p
                            className="mb-2 text-[9px] uppercase tracking-[0.26em]"
                            style={{ color: colors.goldSoft }}
                          >
                            {selectedMatrixItem.caption}
                          </p>
                          <h4
                            className="mb-4 text-3xl leading-[0.98] md:text-4xl xl:text-5xl"
                            style={{
                              color:
                                selectedMatrixItem.state === "revealed"
                                  ? colors.gold
                                  : colors.title,
                              fontWeight: 650,
                              letterSpacing: "-0.065em",
                            }}
                          >
                            {selectedMatrixItem.label}
                          </h4>

                          <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-center">
                            <div
                              className="rounded-[22px] px-5 py-4"
                              style={{
                                background:
                                  selectedMatrixItem.state === "revealed"
                                    ? "rgba(242,185,104,0.060)"
                                    : "rgba(255,255,255,0.020)",
                                border:
                                  selectedMatrixItem.state === "revealed"
                                    ? "1px solid rgba(242,185,104,0.11)"
                                    : "1px solid rgba(255,255,255,0.052)",
                              }}
                            >
                              <p
                                className="text-base leading-relaxed md:text-lg"
                                style={{
                                  color:
                                    selectedMatrixItem.state === "revealed"
                                      ? colors.title
                                      : colors.text,
                                  fontWeight:
                                    selectedMatrixItem.state === "revealed"
                                      ? 650
                                      : 500,
                                }}
                              >
                                {selectedMatrixItem.value}
                              </p>
                            </div>

                            <span
                              className="inline-flex w-fit rounded-full px-3 py-2 text-[8px] uppercase tracking-[0.16em]"
                              style={{
                                background:
                                  selectedMatrixItem.state === "revealed"
                                    ? "rgba(242,185,104,0.10)"
                                    : "rgba(255,255,255,0.030)",
                                border:
                                  selectedMatrixItem.state === "revealed"
                                    ? "1px solid rgba(242,185,104,0.16)"
                                    : "1px solid rgba(255,255,255,0.055)",
                                color:
                                  selectedMatrixItem.state === "revealed"
                                    ? colors.gold
                                    : selectedMatrixItem.state === "sealed"
                                      ? "rgba(255,245,235,0.42)"
                                      : "rgba(255,245,235,0.56)",
                              }}
                            >
                              {selectedMatrixItem.state === "revealed"
                                ? "Revelado"
                                : selectedMatrixItem.state === "sealed"
                                  ? "Selado"
                                  : "Em tradução"}
                            </span>
                          </div>
                        </div>

                        <div
                          className="grid shrink-0 gap-3 border-t pt-4 md:grid-cols-[0.90fr_1.10fr]"
                          style={{
                            borderColor: "rgba(242,185,104,0.085)",
                          }}
                        >
                          <div>
                            <p
                              className="mb-2 text-[8px] uppercase tracking-[0.22em]"
                              style={{ color: colors.goldSoft }}
                            >
                              Movimento
                            </p>
                            <p
                              className="text-sm leading-relaxed"
                              style={{ color: "rgba(255,245,235,0.66)" }}
                            >
                              {selectedMatrixItem.impact}
                            </p>
                          </div>

                          <div>
                            <p
                              className="mb-2 text-[8px] uppercase tracking-[0.22em]"
                              style={{ color: colors.goldSoft }}
                            >
                              Continuidade
                            </p>
                            <p
                              className="text-sm leading-relaxed"
                              style={{ color: "rgba(255,245,235,0.56)" }}
                            >
                              Esta área se aprofunda conforme novas camadas do
                              Método ORI forem reveladas.
                            </p>
                          </div>
                        </div>

                        <div
                          className="ori-premium-scroll min-h-0 flex-1 overflow-y-auto pr-2"
                          style={{
                            scrollbarWidth: "thin",
                            scrollbarColor:
                              "rgba(242,185,104,0.28) rgba(5,2,2,0.28)",
                          }}
                        >
                          <p
                            className="text-sm leading-relaxed md:text-base"
                            style={{ color: "rgba(255,245,235,0.64)" }}
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
          id="espelho-estado"
          reduceMotion={reduceMotion}
          className="relative overflow-hidden rounded-[28px] md:rounded-[38px] p-4 md:p-6 mb-5"
          style={{
            background:
              "radial-gradient(circle at 14% 20%, rgba(242,185,104,0.13), transparent 30%), radial-gradient(circle at 88% 18%, rgba(183,140,255,0.10), transparent 34%), linear-gradient(135deg, rgba(18,9,10,0.70), rgba(5,2,2,0.92))",
            border: `1px solid ${colors.border}`,
            boxShadow:
              "0 0 76px rgba(242,185,104,0.042), inset 0 0 48px rgba(255,255,255,0.010)",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
          }}
        >
          <div className="grid xl:grid-cols-[0.28fr_1.72fr] gap-6 items-center">
            <div>
              <Eyebrow>03 · Leitura atual</Eyebrow>

              <h2
                className="text-3xl md:text-[32px] leading-[0.98] mb-4"
                style={{
                  color: colors.title,
                  fontWeight: 620,
                  letterSpacing: "-0.06em",
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
                className="relative overflow-hidden rounded-[28px] p-5 min-h-[270px] flex flex-col items-center justify-center text-center"
                style={{
                  background:
                    "linear-gradient(180deg, rgba(242,185,104,0.060), rgba(255,255,255,0.014))",
                  border: "1px solid rgba(242,185,104,0.13)",
                  boxShadow: "inset 0 0 38px rgba(255,255,255,0.012)",
                }}
              >
                <div className="relative h-[150px] w-[150px] rounded-full flex items-center justify-center mb-5">
                  <motion.div
                    className="absolute inset-[-14px] rounded-full"
                    animate={
                      !reduceMotion
                        ? { rotate: [0, 18, 0], opacity: [0.18, 0.34, 0.20] }
                        : undefined
                    }
                    transition={{
                      duration: 8,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    style={{
                      border: "1px solid rgba(242,185,104,0.12)",
                      boxShadow: "inset 0 0 44px rgba(242,185,104,0.028)",
                    }}
                  />
                  <div
                    className="absolute inset-0 rounded-full"
                    style={{
                      background: hasConnectionPercent
                        ? `conic-gradient(var(--gold-primary) ${connectionSafePercent * 3.6}deg, rgba(255,255,255,0.055) 0deg)`
                        : "conic-gradient(rgba(242,185,104,0.18) 18deg, rgba(255,255,255,0.055) 0deg)",
                      boxShadow: "0 0 42px rgba(242,185,104,0.09)",
                    }}
                  />
                  <div
                    className="absolute inset-[12px] rounded-full"
                    style={{
                      background:
                        "linear-gradient(180deg, rgba(18,9,10,0.96), rgba(5,2,2,0.98))",
                      border: "1px solid rgba(242,185,104,0.11)",
                    }}
                  />
                  <div className="relative">
                    <p
                      className="text-5xl leading-none"
                      style={{
                        color: colors.gold,
                        fontWeight: 650,
                        letterSpacing: "-0.07em",
                      }}
                    >
                      {hasConnectionPercent ? `${connectionSafePercent}%` : "ORI"}
                    </p>
                    <p
                      className="text-[9px] uppercase tracking-[0.2em] mt-2"
                      style={{ color: colors.goldSoft }}
                    >
                      {hasConnectionPercent ? "conexão" : "em leitura"}
                    </p>
                  </div>
                </div>

                <h3
                  className="text-2xl md:text-3xl leading-tight mb-3"
                  style={{
                    color: colors.title,
                    fontWeight: 620,
                    letterSpacing: "-0.055em",
                  }}
                >
                  {connectionLabel}
                </h3>

                <p
                  className="text-sm leading-relaxed max-w-xs"
                  style={{ color: colors.text }}
                >
                  {hasConnectionPercent
                    ? "Sua imagem já tem direção, mas ainda pede tradução visual."
                    : "O selo se completa quando a próxima leitura trouxer dados de imagem."}
                </p>
              </div>

              <div
                className="relative overflow-hidden rounded-[28px] p-5 md:p-6 min-h-[270px]"
                style={{
                  background:
                    "radial-gradient(circle at top right, rgba(183,140,255,0.10), transparent 34%), linear-gradient(180deg, rgba(255,255,255,0.030), rgba(255,255,255,0.010))",
                  border: `1px solid ${colors.borderSoft}`,
                  boxShadow: "inset 0 0 36px rgba(255,255,255,0.010)",
                }}
              >
                <p
                  className="uppercase tracking-[0.26em] text-[9px] mb-4"
                  style={{ color: colors.goldSoft }}
                >
                  Ponto que pede consciência
                </p>

                <h3
                  className="text-2xl md:text-4xl leading-[1.02] mb-4"
                  style={{
                    color: colors.title,
                    fontWeight: 620,
                    letterSpacing: "-0.058em",
                  }}
                >
                  O que hoje pede direção na sua imagem.
                </h3>

                <div
                  className="rounded-[24px] p-5 mb-5"
                  style={{
                    background:
                      "linear-gradient(90deg, rgba(242,185,104,0.082), rgba(255,255,255,0.012))",
                    border: "1px solid rgba(242,185,104,0.12)",
                  }}
                >
                  <p
                    className="text-base md:text-lg leading-relaxed"
                    style={{ color: colors.title, fontWeight: 560 }}
                  >
                    {centralPainValue}
                  </p>
                </div>

                <p
                  className="text-sm leading-relaxed"
                  style={{ color: colors.text }}
                >
                  O método transforma esse ponto em direção: nomeia a força,
                  traduz a imagem e aplica coerência na vida real.
                </p>
              </div>
            </div>
          </div>
        </MotionSection>

        <MotionSection
          id="espelho-camadas"
          reduceMotion={reduceMotion}
          className="relative overflow-hidden rounded-[28px] md:rounded-[38px] p-4 md:p-6 mb-5"
          style={{
            background: activeTab?.aura
              ? `${activeTab.aura}, linear-gradient(135deg, rgba(18,9,10,0.64), rgba(5,2,2,0.86))`
              : "radial-gradient(circle at top right, rgba(242,185,104,0.08), transparent 34%), linear-gradient(135deg, rgba(18,9,10,0.64), rgba(5,2,2,0.86))",
            border: `1px solid ${colors.border}`,
            boxShadow:
              "0 0 64px rgba(242,185,104,0.030), inset 0 0 46px rgba(255,255,255,0.010)",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
          }}
        >
          <div className="relative z-10 grid xl:grid-cols-[0.34fr_1.66fr] gap-7 items-start">
            <div>
              <Eyebrow>04 · Camadas</Eyebrow>

              <h2
                className="text-3xl md:text-[32px] leading-[0.98] mb-4"
                style={{
                  color: colors.title,
                  fontWeight: 600,
                  letterSpacing: "-0.06em",
                }}
              >
                Abra as camadas da sua leitura.
              </h2>

              <p
                className="text-sm md:text-base leading-relaxed max-w-md"
                style={{ color: colors.muted }}
              >
                Uma camada por vez: síntese primeiro, aprofundamento depois.
                O espelho organiza o que já apareceu.
              </p>
            </div>

            <div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
                {mirrorTabs.map((tab) => {
                  const isActive = activeMirrorTab === tab.id;

                  return (
                    <motion.button
                      key={tab.id}
                      type="button"
                      onClick={() => {
                        setActiveMirrorTab(tab.id);
                        setExpandedMirrorLayer(false);
                      }}
                      whileHover={reduceMotion ? undefined : { y: -2 }}
                      whileTap={reduceMotion ? undefined : { scale: 0.98 }}
                      className="relative overflow-hidden rounded-[22px] px-4 py-4 text-left transition-colors duration-300"
                      style={{
                        background: isActive
                          ? `${tab.aura}, rgba(242,185,104,0.11)`
                          : "rgba(255,255,255,0.020)",
                        border: isActive
                          ? "1px solid rgba(242,185,104,0.20)"
                          : `1px solid ${colors.borderSoft}`,
                        color: isActive ? colors.gold : colors.muted,
                        boxShadow: isActive
                          ? "0 0 28px rgba(242,185,104,0.075), inset 0 0 18px rgba(242,185,104,0.022)"
                          : "none",
                      }}
                    >
                      {isActive && !reduceMotion && (
                        <motion.span
                          className="pointer-events-none absolute inset-x-4 bottom-0 h-px"
                          animate={{ opacity: [0.35, 1, 0.45] }}
                          transition={{
                            duration: 2.6,
                            repeat: Infinity,
                            ease: "easeInOut",
                          }}
                          style={{
                            background:
                              "linear-gradient(90deg, transparent, rgba(242,185,104,0.86), transparent)",
                          }}
                        />
                      )}
                      <span
                        className="block uppercase tracking-[0.26em] text-[8px] mb-2"
                        style={{
                          color: isActive
                            ? colors.goldSoft
                            : "rgba(255,245,235,0.32)",
                        }}
                      >
                      Camada
                      </span>

                      <span className="block text-sm">{tab.label}</span>
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
                  className="relative overflow-hidden rounded-[28px] p-6 md:p-7 min-h-[220px]"
                  style={{
                    background: activeTab?.aura
                      ? `${activeTab.aura}, linear-gradient(180deg, rgba(255,255,255,0.024), rgba(255,255,255,0.010))`
                      : "radial-gradient(circle at top right, rgba(242,185,104,0.08), transparent 34%), linear-gradient(180deg, rgba(255,255,255,0.024), rgba(255,255,255,0.010))",
                    border: `1px solid ${colors.border}`,
                    boxShadow:
                      "0 0 48px rgba(242,185,104,0.030), inset 0 0 30px rgba(255,255,255,0.010)",
                  }}
                >
                  <Eyebrow>{activeTab?.eyebrow}</Eyebrow>

                  <div
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-5"
                    style={{
                      background: "rgba(242,185,104,0.07)",
                      border: "1px solid rgba(242,185,104,0.13)",
                      color: colors.gold,
                    }}
                  >
                    <span className="text-[10px]">◇</span>
                    <span className="text-[10px] uppercase tracking-[0.18em]">
                      Leitura aberta
                    </span>
                  </div>

                  <h3
                    className="text-2xl md:text-4xl leading-tight mb-4 max-w-3xl"
                    style={{
                      color: colors.title,
                      fontWeight: 600,
                      letterSpacing: "-0.055em",
                    }}
                  >
                    {activeTab?.title}
                  </h3>

                  <p
                    className="text-sm md:text-base leading-relaxed max-w-3xl mb-6"
                    style={{ color: colors.text }}
                  >
                    {activeTab?.summary}
                  </p>

                  <div className="grid md:grid-cols-3 gap-3">
                    {[
                      ["O que isso mostra", activeTab?.shows],
                      ["Como isso aparece", activeTab?.appears],
                      ["O que fortalece / gera ruído", activeTab?.tension],
                    ].map(([label, text]) => (
                      <div
                        key={label}
                        className="rounded-[22px] p-4"
                        style={{
                          background:
                            "linear-gradient(180deg, rgba(255,255,255,0.034), rgba(255,255,255,0.012))",
                          border: "1px solid rgba(242,185,104,0.10)",
                        }}
                      >
                        <p
                          className="uppercase tracking-[0.22em] text-[8px] mb-3"
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

                  <div
                    className="mt-5 pt-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
                    style={{ borderTop: "1px solid rgba(242,185,104,0.08)" }}
                  >
                    <button
                      type="button"
                      onClick={() =>
                        setExpandedMirrorLayer((current) => !current)
                      }
                      className="inline-flex w-fit items-center gap-2 rounded-full px-4 py-2 text-xs"
                      style={{
                        background: "rgba(255,255,255,0.024)",
                        border: "1px solid rgba(242,185,104,0.10)",
                        color: colors.goldSoft,
                      }}
                    >
                      {expandedMirrorLayer
                        ? "Recolher leitura"
                        : "Aprofundar leitura"}
                    </button>

                    <p
                      className="text-sm"
                      style={{ color: colors.goldSoft }}
                    >
                      Próxima camada sugerida:{" "}
                      {mirrorTabs[
                        (mirrorTabs.findIndex(
                          (tab) => tab.id === activeMirrorTab,
                        ) +
                          1) %
                          mirrorTabs.length
                      ]?.label || "Essência"}
                    </p>
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
                          className="mt-5 rounded-[24px] p-5"
                          style={{
                            background: "rgba(5,2,2,0.32)",
                            border: "1px solid rgba(242,185,104,0.09)",
                          }}
                        >
                          <p
                            className="text-sm md:text-base leading-relaxed"
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

        <MotionSection
          id="espelho-carta"
          reduceMotion={reduceMotion}
          className="relative overflow-hidden rounded-[28px] md:rounded-[38px] p-4 md:p-6 mb-5"
          style={{
            background: selectedCard
              ? `${selectedCard.aura}, radial-gradient(circle at top right, rgba(242,185,104,0.10), transparent 38%), linear-gradient(180deg, rgba(18,9,10,0.76), rgba(5,2,2,0.94))`
              : "radial-gradient(circle at top right, rgba(183,140,255,0.13), transparent 34%), radial-gradient(circle at bottom left, rgba(242,185,104,0.10), transparent 36%), linear-gradient(180deg, rgba(18,9,10,0.76), rgba(5,2,2,0.94))",
            border: `1px solid ${colors.border}`,
            boxShadow:
              "0 0 96px rgba(183,140,255,0.040), 0 0 82px rgba(242,185,104,0.035), inset 0 0 54px rgba(255,255,255,0.012)",
            backdropFilter: "blur(18px)",
            WebkitBackdropFilter: "blur(18px)",
          }}
        >
          <div
            className="absolute inset-0 pointer-events-none opacity-[0.74]"
            style={{
              backgroundImage:
                "linear-gradient(90deg, rgba(5,2,2,0.34), rgba(5,2,2,0.04), rgba(5,2,2,0.30)), url('/images/espelho-ori/oraculo/fundo-mesa-oraculo.png')",
              backgroundSize: "cover",
              backgroundPosition: "center",
              filter: "saturate(1.08) contrast(1.12)",
            }}
          />
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "linear-gradient(180deg, rgba(5,2,2,0.04), rgba(5,2,2,0.30))",
            }}
          />
          <motion.div
            className="absolute right-[6%] top-[6%] w-[340px] h-[340px] rounded-full opacity-20 pointer-events-none"
            animate={
              reduceMotion
                ? undefined
                : {
                    scale: [1, 1.05, 1],
                    opacity: [0.14, 0.25, 0.16],
                  }
            }
            transition={{
              duration: 7,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            style={{
              border: "1px solid rgba(242,185,104,0.14)",
              boxShadow: "inset 0 0 62px rgba(242,185,104,0.035)",
            }}
          />

          <div className="relative z-10 grid xl:grid-cols-[0.26fr_1.74fr] gap-8 items-start">
            <div>
              <Eyebrow>05 · Oráculo</Eyebrow>

              <h2
                className="text-3xl md:text-[32px] leading-[0.98] mb-4"
                style={{
                  color: colors.title,
                  fontWeight: 600,
                  letterSpacing: "-0.06em",
                }}
              >
                Oráculo do Espelho.
              </h2>

              <p
                className="text-sm md:text-base leading-relaxed max-w-md mb-5"
                style={{ color: colors.muted }}
              >
                {!hasResult
                  ? "A carta diária fica selada até a primeira leitura revelar sua composição."
                  : oracleLockedToday
                    ? "A carta de hoje já foi aberta. O baralho se recolhe, e o conselho permanece disponível até amanhã."
                    : "Toque no baralho. O Espelho escolhe uma carta e entrega o conselho do dia."}
              </p>

              {hasResult && !oracleLockedToday && (
                <motion.button
                  type="button"
                  onClick={handleShuffleCards}
                  whileHover={reduceMotion ? undefined : { x: 3 }}
                  whileTap={reduceMotion ? undefined : { scale: 0.97 }}
                  className="mb-5 inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs"
                  style={{
                    background: "rgba(255,255,255,0.028)",
                    border: "1px solid rgba(242,185,104,0.11)",
                    color: colors.goldSoft,
                  }}
                >
                  <span>↻</span>
                  Embaralhar cartas
                </motion.button>
              )}

              <div
                className="hidden xl:block w-28 h-px"
                style={{
                  background:
                    "linear-gradient(to right, var(--gold-primary), transparent)",
                }}
              />
            </div>

            <div className="grid xl:grid-cols-[0.82fr_1.18fr] gap-6 items-stretch">
              <motion.div
                variants={reduceMotion ? undefined : staggerContainer}
                initial={reduceMotion ? false : "hidden"}
                whileInView={reduceMotion ? undefined : "visible"}
                viewport={{ once: true, amount: 0.2 }}
                className="relative flex min-h-[410px] items-center justify-center px-4 py-7"
                style={{
                  perspective: 1400,
                }}
              >
                <div
                  className="pointer-events-none absolute inset-x-[12%] bottom-10 h-24 rounded-full blur-2xl"
                  style={{
                    background:
                      "linear-gradient(90deg, transparent, rgba(242,185,104,0.16), rgba(183,140,255,0.08), transparent)",
                  }}
                />
                <div
                  className="pointer-events-none absolute inset-x-[18%] bottom-16 h-px"
                  style={{
                    background:
                      "linear-gradient(90deg, transparent, rgba(242,185,104,0.34), transparent)",
                  }}
                />
                <div className="relative z-10 flex flex-col items-center gap-5">
                  <div
                    className="relative h-[318px] w-[214px] md:h-[342px] md:w-[230px]"
                    style={{
                      opacity: !hasResult ? 0.42 : 1,
                      isolation: "isolate",
                      perspective: 1400,
                      transformStyle: "preserve-3d",
                    }}
                  >
                    <motion.button
                      type="button"
                      disabled={!hasResult || oracleLockedToday}
                      onClick={handleDrawFromDeck}
                      variants={softReveal}
                      whileHover={
                        reduceMotion || !hasResult || oracleLockedToday
                          ? undefined
                          : { y: -8, scale: 1.02 }
                      }
                      whileTap={
                        reduceMotion || !hasResult || oracleLockedToday
                          ? undefined
                          : { scale: 0.97 }
                      }
                      className="absolute inset-0 cursor-pointer disabled:cursor-not-allowed"
                      style={{
                        transformStyle: "preserve-3d",
                      }}
                    >
                      {orderedOracleCards.slice(0, 5).map((card, index) => {
                        const offset = index - 2;

                        return (
                          <motion.div
                            key={card.id}
                            className="absolute inset-0 overflow-hidden rounded-[30px] p-5"
                            initial={false}
                            animate={{
                              x: offset * 7,
                              y: selectedCard
                                ? Math.abs(offset) * 7 + 18
                                : Math.abs(offset) * 5,
                              rotateZ: offset * 4,
                              scale: selectedCard
                                ? 0.88 - Math.abs(offset) * 0.012
                                : 1 - Math.abs(offset) * 0.018,
                              opacity: selectedCard ? 0.28 : 1,
                              filter: selectedCard
                                ? "blur(2.2px)"
                                : "blur(0px)",
                            }}
                            transition={{
                              duration: selectedCard ? 0.72 : 0.42,
                              ease: [0.22, 1, 0.36, 1],
                            }}
                            style={{
                              zIndex: index + 1,
                              background:
                                "radial-gradient(circle at top, rgba(242,185,104,0.16), transparent 34%), radial-gradient(circle at bottom, rgba(183,140,255,0.10), transparent 40%), linear-gradient(180deg, #24110c 0%, #120607 52%, #050202 100%)",
                              border: "1px solid rgba(242,185,104,0.16)",
                              boxShadow:
                                "0 22px 54px rgba(0,0,0,0.34), inset 0 0 34px rgba(255,255,255,0.012)",
                              transformStyle: "preserve-3d",
                            }}
                          >
                            <img
                              src={ORACLE_CARD_BACK_IMAGE}
                              alt=""
                              className="absolute inset-0 h-full w-full object-cover"
                              loading="lazy"
                              style={{
                                opacity: 0.82,
                                filter: "saturate(1.08) contrast(1.08)",
                              }}
                            />
                            <div
                              className="absolute inset-0"
                              style={{
                                background:
                                  "linear-gradient(180deg, rgba(5,2,2,0.08), rgba(5,2,2,0.42))",
                              }}
                            />
                            <div
                              className="absolute inset-[11px] rounded-[25px]"
                              style={{
                                border: "1px solid rgba(242,185,104,0.12)",
                              }}
                            />

                            <div className="relative z-10 flex h-full flex-col">
                              <div className="flex items-center justify-between">
                                <span
                                  className="text-[8px] uppercase tracking-[0.28em]"
                                  style={{ color: colors.goldSoft }}
                                >
                                  ORI
                                </span>
                              </div>

                              <div className="mt-auto flex flex-col items-center gap-3">
                                <div
                                  className="h-px w-full"
                                  style={{
                                    background:
                                      "linear-gradient(90deg, transparent, rgba(242,185,104,0.28), transparent)",
                                  }}
                                />
                                <span
                                  className="rounded-full px-3 py-1 text-[10px] uppercase tracking-[0.18em]"
                                  style={{
                                    background: "rgba(5,2,2,0.58)",
                                    border: "1px solid rgba(242,185,104,0.16)",
                                    color: "rgba(255,245,235,0.72)",
                                    backdropFilter: "blur(10px)",
                                  }}
                                >
                                  {hasResult ? "Toque para revelar" : "Selada"}
                                </span>
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </motion.button>

                    <AnimatePresence>
                      {selectedCard && (
                        <motion.div
                          key={selectedCard.id}
                          className="pointer-events-none absolute inset-0 z-50 overflow-hidden rounded-[30px] p-5"
                          initial={
                            reduceMotion
                              ? false
                              : {
                                  opacity: 0,
                                  y: 20,
                                  rotateY: -88,
                                  scale: 0.96,
                                }
                          }
                          animate={
                            reduceMotion
                              ? undefined
                              : {
                                  opacity: 1,
                                  y: -24,
                                  rotateY: 0,
                                  scale: 1.06,
                                }
                          }
                          exit={
                            reduceMotion
                              ? undefined
                              : {
                                  opacity: 0,
                                  y: -12,
                                  rotateY: 32,
                                  scale: 0.98,
                                }
                          }
                          transition={{
                            duration: 1.35,
                            ease: [0.22, 1, 0.36, 1],
                          }}
                          style={{
                            transformStyle: "preserve-3d",
                            background: `${selectedCard.aura}, linear-gradient(180deg, #32180e 0%, #19080a 54%, #060203 100%)`,
                            border: "1px solid rgba(242,185,104,0.34)",
                            boxShadow:
                              "0 28px 82px rgba(0,0,0,0.58), 0 0 62px rgba(242,185,104,0.18), inset 0 0 42px rgba(242,185,104,0.050)",
                          }}
                        >
                          <img
                            src={selectedCard.image}
                            alt=""
                            className="absolute inset-0 h-full w-full object-cover"
                            loading="lazy"
                            style={{
                              opacity: 0.82,
                              filter: "saturate(1.08) contrast(1.1)",
                            }}
                          />
                          <div
                            className="absolute inset-0"
                            style={{
                              background:
                                "linear-gradient(180deg, rgba(20,7,4,0.10), rgba(5,2,2,0.50))",
                            }}
                          />
                          <div
                            className="absolute inset-[11px] rounded-[25px]"
                            style={{
                              border: "1px solid rgba(242,185,104,0.22)",
                            }}
                          />
                          {!reduceMotion && (
                            <motion.div
                              className="absolute inset-y-[-18%] w-14 rotate-12"
                              initial={{ x: "-190%", opacity: 0 }}
                              animate={{ x: "520%", opacity: [0, 0.34, 0] }}
                              transition={{
                                duration: 1.25,
                                delay: 0.42,
                                ease: [0.22, 1, 0.36, 1],
                              }}
                              style={{
                                background:
                                  "linear-gradient(90deg, transparent, rgba(255,235,190,0.30), transparent)",
                                filter: "blur(8px)",
                              }}
                            />
                          )}

                          <div className="relative z-10 flex h-full flex-col justify-end gap-5 text-center">
                            <div
                              className="mx-auto rounded-2xl px-4 py-3"
                              style={{
                                background: "rgba(5,2,2,0.48)",
                                border: "1px solid rgba(242,185,104,0.16)",
                                backdropFilter: "blur(10px)",
                              }}
                            >
                              <p
                                className="text-lg leading-tight"
                                style={{
                                  color: colors.gold,
                                  fontWeight: 650,
                                  letterSpacing: "-0.035em",
                                }}
                              >
                                {dailyOracle?.cardTitle || selectedCard.title}
                              </p>
                            </div>

                            <div
                              className="h-px w-full"
                              style={{
                                background:
                                  "linear-gradient(90deg, transparent, rgba(242,185,104,0.34), transparent)",
                              }}
                            />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  <AnimatePresence>
                    {selectedCard && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 6 }}
                        transition={{ duration: 0.35 }}
                        className="relative z-40 whitespace-nowrap rounded-full px-4 py-2 text-[10px] uppercase tracking-[0.18em]"
                        style={{
                          background: "rgba(5,2,2,0.62)",
                          border: "1px solid rgba(242,185,104,0.14)",
                          color: colors.goldSoft,
                          backdropFilter: "blur(12px)",
                        }}
                      >
                        Carta recolhida até amanhã
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={dailyOracle?.message || activeCard || "empty-card"}
                  initial={
                    reduceMotion
                      ? false
                      : {
                          opacity: 0,
                          rotateY: -8,
                          y: 18,
                          filter: "blur(10px)",
                        }
                  }
                  animate={
                    reduceMotion
                      ? undefined
                      : {
                          opacity: 1,
                          rotateY: 0,
                          y: 0,
                          filter: "blur(0px)",
                        }
                  }
                  exit={
                    reduceMotion
                      ? undefined
                      : {
                          opacity: 0,
                          rotateY: 8,
                          y: -12,
                          filter: "blur(8px)",
                        }
                  }
                  transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  className="relative overflow-hidden rounded-[30px] p-4 md:p-6 min-h-[360px] flex flex-col justify-between"
                  style={{
                    transformStyle: "preserve-3d",
                    background: selectedCard
                      ? `${selectedCard.aura}, linear-gradient(180deg, rgba(255,255,255,0.042), rgba(255,255,255,0.012))`
                      : "radial-gradient(circle at center, rgba(242,185,104,0.08), transparent 38%), linear-gradient(180deg, rgba(255,255,255,0.026), rgba(255,255,255,0.010))",
                    border: `1px solid ${
                      activeCard ? "rgba(242,185,104,0.24)" : colors.borderSoft
                    }`,
                    boxShadow: activeCard
                      ? "0 0 74px rgba(242,185,104,0.075), inset 0 0 48px rgba(255,255,255,0.014)"
                      : "0 0 44px rgba(242,185,104,0.030), inset 0 0 34px rgba(255,255,255,0.010)",
                  }}
                >
                  <div className="relative z-10">
                    <Eyebrow>
                      {selectedCard ? "Conselho do oráculo" : "Carta do dia"}
                    </Eyebrow>

                    <h3
                    className="text-3xl md:text-[38px] leading-[0.98] mb-5 max-w-3xl"
                      style={{
                        color: colors.title,
                        fontWeight: 650,
                        letterSpacing: "-0.065em",
                      }}
                    >
                      {selectedCard
                        ? dailyOracle?.cardTitle || selectedCard.title
                        : hasResult
                          ? "O Espelho guardou uma mensagem para hoje."
                          : "A carta diária ainda está selada."}
                    </h3>

                    <AnimatePresence>
                      {selectedCard && (
                        <motion.div
                          initial={{ opacity: 0, y: 8, scale: 0.98 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -6, scale: 0.98 }}
                          transition={{ duration: 0.3 }}
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-5"
                          style={{
                            background: "rgba(120,255,160,0.07)",
                            border: "1px solid rgba(120,255,160,0.14)",
                            color: "#9BE7AE",
                          }}
                        >
                          <span className="text-xs">✓</span>
                          <span className="text-xs">
                            Carta revelada hoje
                          </span>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <p
                    className="text-base md:text-xl leading-relaxed"
                      style={{
                        color: selectedCard ? colors.text : colors.muted,
                      }}
                    >
                      {selectedCard
                        ? dailyOracle?.message || selectedCard.messages[0]
                        : hasResult
                          ? "Toque no baralho fechado. A carta abre uma vez por dia e o conselho aparece aqui."
                          : "Conclua o Código das Deusas para ativar este reflexo diário."}
                    </p>
                  </div>

                  <div
                    className="relative z-10 mt-7 pt-5"
                    style={{ borderTop: "1px solid rgba(242,185,104,0.09)" }}
                  >
                    <p
                      className="text-sm leading-relaxed"
                      style={{ color: "rgba(255,245,235,0.52)" }}
                    >
                      {selectedCard
                        ? "O baralho se recolheu por hoje. O conselho permanece como ponto de orientação."
                        : hasResult
                          ? "Uma carta por dia. Um fragmento por vez. A revelação precisa de ritmo."
                          : "A primeira revelação é a chave que abre as próximas camadas."}
                    </p>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </MotionSection>

        <MotionSection
          id="espelho-proxima"
          reduceMotion={reduceMotion}
          className="relative overflow-hidden rounded-[28px] md:rounded-[38px] p-4 md:p-6 mb-5"
          style={{
            background:
              "radial-gradient(circle at top right, rgba(242,185,104,0.12), transparent 34%), radial-gradient(circle at bottom left, rgba(183,140,255,0.08), transparent 38%), linear-gradient(180deg, rgba(18,9,10,0.70), rgba(5,2,2,0.92))",
            border: `1px solid ${colors.border}`,
            boxShadow:
              "0 0 78px rgba(242,185,104,0.040), inset 0 0 46px rgba(255,255,255,0.012)",
            backdropFilter: "blur(18px)",
            WebkitBackdropFilter: "blur(18px)",
          }}
        >
          <div className="mb-6">
            <Eyebrow>06 · Próxima travessia</Eyebrow>

            <h2
              className="text-3xl md:text-[38px] leading-[1.02] mb-4 max-w-4xl"
              style={{
                color: colors.title,
                fontWeight: 620,
                letterSpacing: "-0.064em",
              }}
            >
              {nextCrossingTitle}
            </h2>

            <p
              className="text-sm md:text-base leading-relaxed max-w-2xl"
              style={{ color: colors.muted }}
            >
              O que já foi aberto, o que ainda permanece selado e qual portal
              pede continuidade agora.
            </p>
          </div>

          <div className="grid xl:grid-cols-[0.9fr_1fr_0.9fr] gap-4">
            <div
              className="relative overflow-hidden rounded-[28px] p-5 md:p-6"
              style={{
                background:
                  "radial-gradient(circle at top left, rgba(242,185,104,0.10), transparent 34%), linear-gradient(180deg, rgba(255,255,255,0.032), rgba(255,255,255,0.010))",
                border: "1px solid rgba(242,185,104,0.12)",
              }}
            >
              <p
                className="uppercase tracking-[0.26em] text-[9px] mb-5"
                style={{ color: colors.goldSoft }}
              >
                O que já foi aberto
              </p>

              <div className="space-y-2.5">
                {revealedNow.map((item) => (
                  <div
                    key={item}
                    className="rounded-[20px] px-4 py-3"
                    style={{
                      background: "rgba(242,185,104,0.050)",
                      border: "1px solid rgba(242,185,104,0.10)",
                    }}
                  >
                    <p
                      className="text-sm md:text-base leading-relaxed"
                      style={{ color: colors.title, fontWeight: 560 }}
                    >
                      {item}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div
              className="relative overflow-hidden rounded-[28px] p-5 md:p-6"
              style={{
                background:
                  "radial-gradient(circle at top right, rgba(183,140,255,0.10), transparent 34%), linear-gradient(180deg, rgba(255,255,255,0.030), rgba(255,255,255,0.010))",
                border: `1px solid ${colors.borderSoft}`,
              }}
            >
              <p
                className="uppercase tracking-[0.26em] text-[9px] mb-5"
                style={{ color: colors.goldSoft }}
              >
                O que ainda está selado
              </p>

              <div className="flex flex-wrap gap-2.5">
                {nextUnlocks.map((item) => (
                  <div
                    key={item}
                    className="rounded-full px-4 py-2"
                    style={{
                      background: "rgba(255,255,255,0.024)",
                      border: "1px solid rgba(255,255,255,0.058)",
                    }}
                  >
                    <p
                      className="text-xs leading-relaxed"
                      style={{ color: colors.text }}
                    >
                      {item}
                    </p>
                  </div>
                ))}
              </div>

            </div>

            <div
              className="relative overflow-hidden rounded-[28px] p-5 md:p-6 flex flex-col justify-between"
              style={{
                background:
                  "linear-gradient(180deg, rgba(242,185,104,0.070), rgba(255,255,255,0.012))",
                border: "1px solid rgba(242,185,104,0.12)",
              }}
            >
              <div>
                <p
                  className="uppercase tracking-[0.26em] text-[9px] mb-5"
                  style={{ color: colors.goldSoft }}
                >
                  Por que importa
                </p>

                <p
                  className="text-base md:text-lg leading-relaxed mb-6"
                  style={{ color: colors.title, fontWeight: 560 }}
                >
                  {nextWhyMatters}
                </p>
              </div>

              {nextStep.active ? (
                <Link
                  to={nextStep.link}
                  className="inline-flex w-fit justify-center px-6 py-3 rounded-full text-sm"
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
                  className="inline-flex w-fit justify-center px-6 py-3 rounded-full text-sm opacity-75 cursor-not-allowed"
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
        </MotionSection>

        <MotionSection
          reduceMotion={reduceMotion}
          className="relative overflow-hidden rounded-[30px] md:rounded-[42px] p-6 md:p-8 mb-3 text-center"
          style={{
            background:
              "radial-gradient(circle at center, rgba(242,185,104,0.08), transparent 38%), linear-gradient(180deg, rgba(18,9,10,0.68), rgba(5,2,2,0.90))",
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
      </div>
    </main>
  );
}

export default EspelhoOri;
