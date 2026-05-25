import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { reports } from "../data/reports";
import { supabase } from "../lib/supabaseClient";

const ORACLE_HERO_IMAGE = "/images/heroes/hero-oraculo-ori-v2.png";
const LEGACY_STORAGE_KEY = "ori_produto_1_quiz";
const DAILY_CARD_STORAGE_KEY = "ori_espelho_daily_oracle_v1";
const ORACLE_CARD_BACK_IMAGE = "/images/espelho-ori/oraculo/verso-deck.png";
const ORACLE_HERO_BACKGROUND =
  "radial-gradient(circle at 86% 18%, rgba(242,185,104,0.10), transparent 34%), linear-gradient(90deg, rgba(5,2,2,0.92), rgba(5,2,2,0.70), rgba(5,2,2,0.90)), url('/images/espelho-ori/oraculo/fundo-mesa-oraculo.png')";
const ORACLE_CARD_BACKGROUND =
  "radial-gradient(circle at 88% 12%, rgba(242,185,104,0.09), transparent 34%), radial-gradient(circle at 8% 92%, rgba(183,140,255,0.05), transparent 34%), linear-gradient(90deg, rgba(5,2,2,0.88), rgba(5,2,2,0.68), rgba(5,2,2,0.92)), url('/images/espelho-ori/oraculo/fundo-oraculo-premium.png')";
const ORACLE_CARD_BACK_BACKGROUND = `linear-gradient(180deg, rgba(5,2,2,0.02), rgba(5,2,2,0.18)), url('${ORACLE_CARD_BACK_IMAGE}')`;

const colors = {
  gold: "var(--gold-primary)",
  goldSoft: "#d9a45f",
  title: "var(--ori-hero)",
  heading: "#e2ccb0",
  text: "rgba(247,234,216,0.66)",
  muted: "rgba(247,234,216,0.48)",
  quiet: "rgba(247,234,216,0.38)",
  eyebrow: "rgba(210,135,70,0.86)",
  border: "rgba(242,185,104,0.12)",
};

const ORACLE_PRACTICAL_GUIDANCE = {
  essencia: {
    realLife:
      "Hoje, repare onde você está tentando parecer mais simples do que realmente é para evitar perguntas, opiniões ou julgamentos.",
    tip: "Antes de aceitar um convite, responder uma mensagem ou assumir uma tarefa, pergunte: eu quero isso ou só estou evitando desconforto?",
    imageGesture:
      "Escolha uma peça que pareça fiel ao seu estado de hoje, não apenas adequada. Pode ser textura, peso, decote, cor ou um acessório com presença.",
  },
  sombra: {
    realLife:
      "A carta aponta para aquele momento em que você diz que está tudo bem, mas o corpo já ficou tenso e a paciência já acabou.",
    tip: "Não responda no impulso. Escreva primeiro a resposta sincera em uma nota privada, respire e só depois decida o que realmente precisa ser dito.",
    imageGesture:
      "Use algo que te dê contorno: uma terceira peça, um corte mais estruturado ou um detalhe que ajude você a se sentir protegida sem se esconder.",
  },
  imagem: {
    realLife:
      "Hoje, observe se você está se arrumando para se reconhecer melhor ou só para atravessar o dia sem chamar atenção.",
    tip: "Troque uma escolha automática por uma escolha intencional: uma cor, um batom, um cabelo diferente ou um detalhe que diga 'eu estou aqui'.",
    imageGesture:
      "Faça um ajuste visível, mas simples. Uma manga dobrada, um acessório central, um cabelo mais assumido ou uma peça que organize o visual.",
  },
  presenca: {
    realLife:
      "A carta fala de como você entra nos lugares: se chega pedindo licença demais ou se permite ocupar o espaço com naturalidade.",
    tip: "Antes de uma conversa importante, desacelere o corpo. Ombros soltos, pés firmes, voz um pouco mais baixa e uma frase a menos para se justificar.",
    imageGesture:
      "Escolha algo que melhore sua postura: uma gola, um brinco, uma estrutura no ombro ou um sapato que te coloque no próprio eixo.",
  },
  caminho: {
    realLife:
      "Hoje não pede uma grande virada. Pede uma escolha pequena que coloque sua rotina um pouco mais perto da mulher que você quer sustentar.",
    tip: "Escolha uma pendência visual ou prática e resolva só o próximo passo: separar, ajustar, descartar, provar ou anotar.",
    imageGesture:
      "Monte uma combinação simples que você repetiria. O caminho aparece quando algo deixa de ser inspiração e começa a virar rotina.",
  },
  limite: {
    realLife:
      "A carta fala dos 'sins' que você dá para não parecer difícil, mesmo quando por dentro já sabe que aquilo te drena.",
    tip: "Use uma resposta curta hoje: 'não consigo', 'não quero assumir isso agora' ou 'vou pensar e te respondo'. Sem palestra, sem culpa.",
    imageGesture:
      "Vista algo que te deixe menos disponível para o olhar dos outros e mais disponível para você. Contorno também é elegância.",
  },
  corpo: {
    realLife:
      "Hoje, seu corpo pode estar mostrando primeiro aquilo que a mente ainda tenta negociar: cansaço, incômodo, vontade ou recusa.",
    tip: "Antes de escolher roupa, pergunte ao corpo o que ele aguenta hoje. Conforto não precisa ser abandono de presença.",
    imageGesture:
      "Escolha uma peça que acompanhe seu movimento real. Nada que te faça prender a respiração, se encolher ou corrigir postura o tempo todo.",
  },
  desejo: {
    realLife:
      "A carta fala daquela vontade que você adia porque parece vaidade, exagero ou algo que 'não combina com a fase'.",
    tip: "Permita um desejo pequeno sem transformar isso em compra imediata: salve uma referência, teste uma cor, experimente uma forma.",
    imageGesture:
      "Inclua um ponto de prazer no visual. Pode ser brilho baixo, perfume, textura gostosa, unha, boca, cabelo ou uma cor que acende seu olhar.",
  },
  coerencia: {
    realLife:
      "Hoje, observe onde sua imagem, agenda e energia estão contando histórias diferentes. O cansaço muitas vezes nasce dessa fragmentação.",
    tip: "Escolha uma coisa para alinhar: o que você vai vestir, o que vai recusar ou o que vai priorizar. Só uma já muda o dia.",
    imageGesture:
      "Repita algo que funciona em você. Coerência não precisa ser novidade: às vezes é reconhecer uma assinatura e parar de abandoná-la.",
  },
  travessia: {
    realLife:
      "A carta fala de estar entre versões: uma já ficou pequena, mas a próxima ainda não virou hábito. Isso pode parecer confusão, mas é passagem.",
    tip: "Não tente resolver a identidade inteira hoje. Escolha uma coisa antiga para pausar e uma coisa nova para testar sem compromisso.",
    imageGesture:
      "Use uma peça de transição: algo que ainda pareça você, mas abra espaço para uma direção nova. Pequenas mudanças sustentam grandes viradas.",
  },
};

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

function getDailyStorageKey(userKey) {
  return `${DAILY_CARD_STORAGE_KEY}:${userKey || "local"}`;
}

function readDailyOracle(userKey) {
  try {
    const rawData = localStorage.getItem(getDailyStorageKey(userKey));
    return rawData ? JSON.parse(rawData) : null;
  } catch (error) {
    console.log("Erro ao ler carta diaria:", error);
    return null;
  }
}

function saveDailyOracle(userKey, data) {
  try {
    localStorage.setItem(getDailyStorageKey(userKey), JSON.stringify(data));
  } catch (error) {
    console.log("Erro ao salvar carta diaria:", error);
  }
}

function pickRandom(items = []) {
  if (!items.length) return null;
  return items[Math.floor(Math.random() * items.length)];
}

function buildOracleCards({ hasResult, resultadoFinal, principal, secundario }) {
  const resultName = resultadoFinal || "sua força";
  const first = principal || "seu arquétipo principal";
  const second = secundario || "seu arquétipo secundário";

  return [
    {
      id: "essencia",
      code: "I",
      title: "Carta da Essência",
      subtitle: "O que sustenta você",
      revealLabel: "Essência revelada",
      image: "/images/espelho-ori/oraculo/carta-essencia.png",
      messages: hasResult
        ? [
            `${resultName} não é apenas um nome. É uma estrutura pedindo presença, escolha e sustentação.`,
            `Hoje, o Espelho lembra: você não precisa suavizar sua força para que ela seja aceita.`,
            `Sua essência fica mais clara quando você abandona a tentativa de agradar todos os olhares.`,
          ]
        : ["Sua essência ainda está aguardando nome. A primeira leitura abre essa porta."],
      observe:
        "Observe onde você tenta diminuir a própria presença para caber melhor no olhar de fora.",
      avoid: "Evite transformar sua força em explicação demais.",
    },
    {
      id: "sombra",
      code: "II",
      title: "Carta da Sombra",
      subtitle: "O que pede consciência",
      revealLabel: "Sombra revelada",
      image: "/images/espelho-ori/oraculo/carta-sombra.png",
      messages: hasResult
        ? [
            `A sombra da ${resultName} aparece quando a força que protege você começa a limitar sua expansão.`,
            `Hoje, observe onde sua defesa já deixou de proteger e começou a impedir movimento.`,
            "Nem tudo que parece autocontrole é consciência. Às vezes, é medo vestido de força.",
          ]
        : ["A sombra só pode ser lida depois que sua primeira leitura abre o espelho."],
      observe: "Perceba onde proteção virou rigidez.",
      avoid: "Evite chamar de limite aquilo que talvez seja apenas medo antigo.",
    },
    {
      id: "imagem",
      code: "III",
      title: "Carta da Imagem",
      subtitle: "O que quer ganhar forma",
      revealLabel: "Imagem revelada",
      image: "/images/espelho-ori/oraculo/carta-imagem.png",
      messages: hasResult
        ? [
            `Sua imagem não precisa criar uma nova versão de você. Ela precisa traduzir a força ${resultName}.`,
            "A imagem certa não inventa presença. Ela organiza o que já existe em você.",
            "O próximo passo não é parecer melhor. É parecer mais coerente.",
          ]
        : ["Sua imagem ainda está em silêncio. Primeiro a essência é nomeada."],
      observe: "Repare se sua aparência sustenta sua essência ou esconde sua força.",
      avoid: "Evite escolher imagem apenas para resolver expectativa externa.",
    },
    {
      id: "presenca",
      code: "IV",
      title: "Carta da Presença",
      subtitle: "O que chega antes da fala",
      revealLabel: "Presença revelada",
      image: "/images/espelho-ori/oraculo/carta-presenca.png",
      messages: hasResult
        ? [
            `${first} e ${second} já desenham a forma como sua presença chega antes das palavras.`,
            "Hoje, observe o que você comunica antes de se explicar.",
            `A ${resultName} se torna mais forte quando o corpo deixa de pedir licença para existir.`,
          ]
        : ["Sua presença será revelada em camadas, quando sua leitura começar a tomar forma."],
      observe: "Observe seu ritmo, seu olhar e a forma como você entra nos espaços.",
      avoid: "Evite entrar pequena em lugares onde sua presença precisa existir inteira.",
    },
    {
      id: "caminho",
      code: "V",
      title: "Carta do Caminho",
      subtitle: "O próximo movimento",
      revealLabel: "Caminho revelado",
      image: "/images/espelho-ori/oraculo/carta-caminho.png",
      messages: hasResult
        ? [
            `O próximo passo é transformar a força ${resultName} em imagem, escolha e direção visual.`,
            "Você já viu quem é. Agora o próximo espelho pergunta: como essa força aparece no mundo?",
            "A jornada começa quando você decide viver de forma mais coerente com o que foi revelado.",
          ]
        : ["O próximo caminho se abre quando a primeira camada da jornada é concluída."],
      observe: "Procure o próximo gesto coerente, não a resposta final.",
      avoid: "Evite pressa. A travessia precisa de integração.",
    },
    {
      id: "limite",
      code: "VI",
      title: "Carta do Limite",
      subtitle: "O contorno que protege sua presença",
      revealLabel: "Limite revelado",
      image: "/images/espelho-ori/oraculo/carta-limite.png",
      messages: hasResult
        ? [
            `Nem toda imagem que agrada o outro sustenta a ${resultName}.`,
            "Seu limite também é linguagem visual.",
            "O limite não endurece sua imagem. Ele dá contorno para que sua força não se dissolva.",
          ]
        : ["Antes da primeira leitura, seus limites ainda aguardam linguagem."],
      observe: "Veja onde você se adapta para evitar desconforto.",
      avoid: "Evite negociar sua essência para parecer mais fácil de ler.",
    },
    {
      id: "corpo",
      code: "VII",
      title: "Carta do Corpo",
      subtitle: "O que sua presença já sente",
      revealLabel: "Corpo revelado",
      image: "/images/espelho-ori/oraculo/carta-corpo.png",
      messages: hasResult
        ? [
            `Seu corpo já sabe quando uma imagem não sustenta a ${resultName}.`,
            "O corpo não é obstáculo da imagem. É o lugar onde a leitura precisa ganhar verdade.",
            "A forma certa cria acordo entre estrutura, conforto e presença.",
          ]
        : ["Seu corpo entrará na leitura quando a primeira camada abrir caminho."],
      observe: "Escute onde sua roupa acompanha ou interrompe seu movimento.",
      avoid: "Evite corrigir o corpo quando o ajuste precisa estar na imagem.",
    },
    {
      id: "desejo",
      code: "VIII",
      title: "Carta do Desejo",
      subtitle: "O que pede permissão",
      revealLabel: "Desejo revelado",
      image: "/images/espelho-ori/oraculo/carta-desejo.png",
      messages: hasResult
        ? [
            `O que você deseja vestir também revela o que a ${resultName} quer permitir.`,
            "Hoje, não trate seu desejo estético como excesso.",
            "Desejo sem direção vira ruído. Desejo escutado vira assinatura.",
          ]
        : ["Seu desejo visual será lido com mais clareza depois da primeira revelação."],
      observe: "Perceba o que seu olhar procura sem pedir autorização.",
      avoid: "Evite transformar desejo em culpa ou distração.",
    },
    {
      id: "coerencia",
      code: "IX",
      title: "Carta da Coerência",
      subtitle: "O eixo entre essência e escolha",
      revealLabel: "Coerência revelada",
      image: "/images/espelho-ori/oraculo/carta-coerencia.png",
      messages: hasResult
        ? [
            `Coerência não é repetir uma estética. É reconhecer a ${resultName} em cada escolha.`,
            "Sua imagem não precisa ser perfeita. Precisa ser fiel ao que sustenta você.",
            "Sua assinatura nasce quando repetição vira linguagem, não prisão.",
          ]
        : ["A coerência começa quando a primeira força é nomeada."],
      observe: "Procure o ponto comum entre aquilo que você sente, veste e comunica.",
      avoid: "Evite colecionar versões desconectadas de si.",
    },
    {
      id: "travessia",
      code: "X",
      title: "Carta da Travessia",
      subtitle: "O intervalo entre antiga e nova imagem",
      revealLabel: "Travessia revelada",
      image: "/images/espelho-ori/oraculo/carta-travessia.png",
      messages: hasResult
        ? [
            `Entre a imagem antiga e a nova existe uma travessia. A ${resultName} não precisa atravessar com pressa.`,
            "Você já não cabe no antigo, mas ainda está aprendendo a sustentar o novo.",
            "A nova imagem se aproxima quando você para de punir o próprio processo.",
          ]
        : ["Sua travessia começa quando a primeira porta se abre."],
      observe: "Observe o que já não cabe, mesmo antes de saber o que vem depois.",
      avoid: "Evite exigir uma resposta final de uma fase que ainda está abrindo caminho.",
    },
  ];
}

function Eyebrow({ children, className = "" }) {
  return (
    <div className={`ori-label-line ${className}`}>
      <p
        className="ori-type-system ori-label-md"
        style={{ color: colors.eyebrow }}
      >
        {children}
      </p>
    </div>
  );
}

function buildPersonalReflection({
  selectedCard,
  produto2Liberado,
  produto3Liberado,
}) {
  const nextLayer = produto3Liberado
    ? "Código Final"
    : produto2Liberado
      ? "Código Final"
      : "Dossiê ORI";
  const guidance = selectedCard
    ? ORACLE_PRACTICAL_GUIDANCE[selectedCard.id]
    : null;

  if (!selectedCard) {
    return [
      {
        label: "Para hoje",
        title: "A carta ainda não abriu sua mensagem.",
        text: "Quando você revelar a carta, esta área vira uma orientação prática para o seu dia: uma situação para observar, uma dica real e um gesto simples de imagem.",
      },
      {
        label: "Como voltar",
        title: "Uma carta por dia, sem pressa.",
        text: "A proposta é criar um pequeno ritual de retorno: abrir, reconhecer uma pista e levar uma ação possível para a vida real.",
      },
    ];
  }

  return [
    {
      label: "Na vida real",
      title: "Onde isso pode aparecer hoje.",
      text: guidance?.realLife || selectedCard.observe,
    },
    {
      label: "Dica do Oráculo",
      title: "Uma ação pequena e possível.",
      text: guidance?.tip || selectedCard.avoid,
    },
    {
      label: "Gesto de imagem",
      title: `Leve isso para o ${nextLayer}.`,
      text: guidance?.imageGesture || "Escolha uma peça, cor ou detalhe que traduza melhor como você quer atravessar o dia.",
    },
  ];
}

function OraculoOri() {
  const [cliente, setCliente] = useState(null);
  const [localResult, setLocalResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dailyOracle, setDailyOracle] = useState(null);
  const [hasShuffled, setHasShuffled] = useState(false);
  const [isShuffling, setIsShuffling] = useState(false);

  const todayKey = getTodayKey();

  useEffect(() => {
    async function loadCliente() {
      setLoading(true);

      const { data: sessionData } = await supabase.auth.getSession();
      const user = sessionData?.session?.user;

      if (!user?.id) {
        setLoading(false);
        return;
      }

      const storageKey = getQuizStorageKey(user.id);
      const revealedLocalResult = getLocalResult(storageKey);
      localStorage.removeItem(LEGACY_STORAGE_KEY);
      setLocalResult(revealedLocalResult);

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

  const resultadoFinal = cliente?.resultado || localResult?.nomeComposto || null;
  const report = resultadoFinal ? reports[resultadoFinal] : null;
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
  const hasResult = Boolean(resultadoFinal);
  const produto2Liberado = cliente?.produto_2_liberado ?? false;
  const produto3Liberado = cliente?.produto_3_liberado ?? false;
  const userKey =
    cliente?.user_id || cliente?.id || localResult?.nomeComposto || resultadoFinal || "local";

  const oracleCards = useMemo(
    () =>
      buildOracleCards({
        hasResult,
        resultadoFinal,
        principal,
        secundario,
      }),
    [hasResult, principal, resultadoFinal, secundario],
  );

  useEffect(() => {
    if (loading) return undefined;

    let isMounted = true;

    async function syncDailyOracle() {
      await Promise.resolve();

      if (!isMounted) return;

      if (!hasResult) {
        setDailyOracle(null);
        return;
      }

      const storedOracle = readDailyOracle(userKey);
      setDailyOracle(storedOracle?.dateKey === todayKey ? storedOracle : null);
    }

    syncDailyOracle();

    return () => {
      isMounted = false;
    };
  }, [hasResult, loading, todayKey, userKey]);

  const selectedCard = oracleCards.find((card) => card.id === dailyOracle?.cardId) || null;
  const oracleLockedToday = dailyOracle?.dateKey === todayKey && selectedCard;
  const personalReflection = buildPersonalReflection({
    selectedCard,
    produto2Liberado,
    produto3Liberado,
  });

  const handleDrawCard = () => {
    if (!hasResult || oracleLockedToday) return;

    const card = pickRandom(oracleCards);
    if (!card) return;

    const data = {
      dateKey: todayKey,
      cardId: card.id,
      cardTitle: card.title,
      revealLabel: card.revealLabel,
      code: card.code,
      message: pickRandom(card.messages),
      cardOrder: oracleCards.map((item) => item.id),
    };

    saveDailyOracle(userKey, data);
    setDailyOracle(data);
  };

  const handleShuffleCards = () => {
    if (!hasResult || oracleLockedToday || selectedCard) return;

    setIsShuffling(true);
    window.setTimeout(() => {
      setIsShuffling(false);
      setHasShuffled(true);
    }, 860);
  };

  if (loading) {
    return (
      <section className="flex min-h-[70vh] items-center justify-center px-4">
        <div className="ori-card-secondary rounded-[24px] px-6 py-5 text-center">
          <Eyebrow className="mb-2">Oráculo ORI</Eyebrow>
          <p className="text-sm" style={{ color: colors.text }}>
            Abrindo a carta do dia...
          </p>
        </div>
      </section>
    );
  }

  return (
    <main
      className="ori-atmosphere ori-atmosphere-mirror relative min-h-screen overflow-hidden px-3 py-3 md:px-7 md:py-7"
      style={{ color: colors.title }}
    >
      <div
        className="fixed inset-0 -z-20"
        style={{
          backgroundImage:
            "linear-gradient(180deg, rgba(5,2,2,0.32), rgba(5,2,2,0.72)), url('/images/espelho-ori/oraculo/fundo-mesa-oraculo.png')",
          backgroundSize: "cover",
          backgroundPosition: "center center",
          backgroundRepeat: "no-repeat",
          filter: "saturate(0.94) contrast(1.05)",
        }}
      />

      <div
        className="fixed inset-0 -z-10 pointer-events-none"
        style={{
          background:
            "radial-gradient(circle at 18% 16%, rgba(242,185,104,0.075), transparent 30%), radial-gradient(circle at 88% 70%, rgba(183,140,255,0.04), transparent 34%), linear-gradient(90deg, rgba(5,2,2,0.84), rgba(5,2,2,0.22), rgba(5,2,2,0.84))",
        }}
      />

      <div className="mx-auto w-full max-w-[1320px] space-y-4 pb-8 md:space-y-5 md:pb-10">
      <section
        className="ori-mobile-hero relative overflow-hidden rounded-[26px] px-4 py-5 md:rounded-[34px] md:px-8 md:py-8"
        style={{
          backgroundColor: "rgba(5,2,2,0.9)",
          backgroundImage: ORACLE_HERO_BACKGROUND,
          backgroundSize: "cover",
          backgroundPosition: "center",
          border: `1px solid ${colors.border}`,
          boxShadow: "0 28px 90px rgba(0,0,0,0.24)",
        }}
      >
        <div className="relative z-10 max-w-3xl">
          <Eyebrow className="mb-4">Oráculo ORI</Eyebrow>
          <h1
            className="ori-type-hero max-w-2xl text-[36px] leading-[0.94] md:text-6xl"
            style={{
              color: colors.title,
              fontWeight: 640,
              letterSpacing: "-0.074em",
            }}
          >
            Oráculo ORI.
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-relaxed md:text-base" style={{ color: colors.text }}>
            {hasResult
              ? "Uma carta por dia para traduzir a sua leitura em gesto, presença e direção visual."
              : "A carta diária abre depois que sua primeira leitura revela a força que sustenta sua presença."}
          </p>
          <div className="mt-5 flex flex-wrap gap-2.5">
            <Link
              to="/espelho-ori"
              className="ori-button-secondary inline-flex min-h-11 items-center justify-center rounded-full px-5 text-sm"
            >
              Voltar ao Espelho
            </Link>
            {!hasResult && (
              <Link
                to="/produto-1"
                className="inline-flex min-h-11 items-center justify-center rounded-full px-5 text-sm"
                style={{
                  background: "linear-gradient(135deg, #f2b968, #d28746)",
                  color: "#160807",
                  fontWeight: 560,
                }}
              >
                Revelar primeira camada
              </Link>
            )}
          </div>
        </div>

        <img
          src={ORACLE_HERO_IMAGE}
          alt=""
          className="pointer-events-none absolute bottom-0 right-[-26%] block h-[76%] w-[88%] object-cover opacity-45 md:inset-y-0 md:right-0 md:h-full md:w-[54%] md:opacity-80"
          loading="eager"
          decoding="async"
          style={{
            WebkitMaskImage:
              "linear-gradient(90deg, transparent 0%, black 28%, black 100%), linear-gradient(180deg, transparent 0%, black 18%, black 100%)",
            maskImage:
              "linear-gradient(90deg, transparent 0%, black 28%, black 100%), linear-gradient(180deg, transparent 0%, black 18%, black 100%)",
          }}
        />
      </section>

      <section
        className="relative overflow-hidden rounded-[26px] p-4 md:rounded-[34px] md:p-6 lg:p-7"
        style={{
          backgroundColor: "rgba(5,2,2,0.92)",
          backgroundImage: ORACLE_CARD_BACKGROUND,
          backgroundSize: "cover",
          backgroundPosition: "center",
          border: `1px solid ${colors.border}`,
          boxShadow:
            "0 26px 86px rgba(0,0,0,0.24), inset 0 1px 0 rgba(255,255,255,0.018)",
        }}
      >
        <div className="grid gap-5 lg:grid-cols-[1.08fr_0.92fr] lg:items-center">
          <div className="flex flex-col items-center justify-center gap-4 text-center md:py-3 lg:min-h-[500px]">
            <button
              type="button"
              disabled={!hasResult || oracleLockedToday}
              onClick={handleShuffleCards}
              aria-label={selectedCard ? selectedCard.title : "Embaralhar cartas"}
              className="group relative h-[315px] w-[214px] overflow-visible rounded-[32px] disabled:cursor-not-allowed md:h-[430px] md:w-[292px]"
              style={{
                opacity: !hasResult ? 0.46 : 1,
              }}
            >
              {!selectedCard && (
                <>
                  <span
                    className="absolute inset-0 rounded-[32px]"
                    style={{
                      transform: isShuffling
                        ? "translate(32px, 5px) rotate(9deg)"
                        : "translate(15px, 10px) rotate(3.5deg)",
                      backgroundImage: ORACLE_CARD_BACK_BACKGROUND,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                      border: "1px solid rgba(210,135,70,0.22)",
                      boxShadow: "0 22px 48px rgba(0,0,0,0.28)",
                      transition: "transform 0.42s cubic-bezier(0.16, 1, 0.3, 1)",
                    }}
                  />
                  <span
                    className="absolute inset-0 rounded-[32px]"
                    style={{
                      transform: isShuffling
                        ? "translate(-34px, 6px) rotate(-9deg)"
                        : "translate(-13px, 9px) rotate(-3deg)",
                      backgroundImage: ORACLE_CARD_BACK_BACKGROUND,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                      border: "1px solid rgba(210,135,70,0.18)",
                      boxShadow: "0 22px 48px rgba(0,0,0,0.22)",
                      transition: "transform 0.42s cubic-bezier(0.16, 1, 0.3, 1)",
                    }}
                  />
                </>
              )}

              <span
                className="absolute inset-0 overflow-hidden rounded-[32px]"
                style={{
                  background:
                    "radial-gradient(circle at top, rgba(210,135,70,0.18), transparent 34%), linear-gradient(180deg, rgba(74,26,26,0.62), var(--wine-deep) 62%, #050202 100%)",
                  border: "1px solid var(--copper-soft)",
                  boxShadow:
                    "0 24px 64px rgba(0,0,0,0.38), inset 0 0 34px rgba(255,255,255,0.014)",
                }}
              >
                <img
                  src={selectedCard?.image || ORACLE_CARD_BACK_IMAGE}
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover"
                  loading="eager"
                  decoding="async"
                  style={{
                    opacity: selectedCard ? 0.88 : 0.84,
                    filter: "saturate(1.08) contrast(1.08)",
                  }}
                />
                <span
                  className="absolute inset-0"
                  style={{
                    background: selectedCard
                      ? "linear-gradient(180deg, rgba(5,2,2,0.03), rgba(5,2,2,0.38))"
                      : "linear-gradient(180deg, rgba(5,2,2,0.05), rgba(5,2,2,0.52))",
                  }}
                />
                <span
                  className="absolute inset-[12px] rounded-[24px]"
                  style={{ border: "1px solid rgba(210,135,70,0.22)" }}
                />
                {selectedCard && (
                  <span className="relative z-10 flex h-full flex-col justify-end p-5">
                    <span
                      className="mx-auto rounded-full px-3 py-1.5 text-[10px] uppercase tracking-[0.16em]"
                      style={{
                        background: "rgba(5,2,2,0.64)",
                        border: "1px solid var(--copper-soft)",
                        color: colors.goldSoft,
                        backdropFilter: "blur(10px)",
                      }}
                    >
                      {selectedCard.title}
                    </span>
                  </span>
                )}
              </span>
            </button>

            {hasResult && (
              <div className="mt-3 flex flex-col items-center gap-2.5">
                {!oracleLockedToday && !selectedCard && (
                  <button
                    type="button"
                    onClick={handleShuffleCards}
                    className="ori-button-secondary inline-flex min-h-9 items-center justify-center rounded-full px-4 text-xs"
                    style={{
                      background: hasShuffled
                        ? "rgba(242,185,104,0.070)"
                        : "rgba(255,255,255,0.024)",
                      border: "1px solid rgba(242,185,104,0.12)",
                      color: colors.goldSoft,
                    }}
                  >
                    {isShuffling
                      ? "Embaralhando..."
                      : hasShuffled
                        ? "Baralho preparado"
                        : "Embaralhar"}
                  </button>
                )}

                <button
                  type="button"
                  disabled={oracleLockedToday}
                  onClick={handleDrawCard}
                  className="inline-flex min-h-11 items-center justify-center rounded-full px-5 text-sm disabled:opacity-55 md:min-h-12 md:px-6"
                  style={{
                    background: oracleLockedToday
                      ? "rgba(255,255,255,0.026)"
                      : "linear-gradient(135deg, #f2b968, #d28746)",
                    border: oracleLockedToday ? "1px solid rgba(242,185,104,0.11)" : "none",
                    color: oracleLockedToday ? colors.goldSoft : "#160807",
                    fontWeight: 560,
                  }}
                >
                  {oracleLockedToday ? "Carta recolhida até amanhã" : "Tirar carta do dia"}
                </button>
              </div>
            )}
          </div>

          <div
            className="rounded-[22px] px-4 py-5 md:px-5 md:py-5 lg:max-w-[580px]"
            style={{
              background:
                "radial-gradient(circle at 88% 12%, rgba(242,185,104,0.12), transparent 34%), linear-gradient(180deg, rgba(18,9,10,0.56), rgba(5,2,2,0.74))",
              border: "1px solid rgba(242,185,104,0.11)",
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.018)",
            }}
          >
            <Eyebrow className="mb-4">
              {selectedCard ? selectedCard.revealLabel : "Carta do dia"}
            </Eyebrow>
            <h2
              className="text-[28px] leading-[1] md:text-[40px]"
              style={{
                color: selectedCard ? colors.goldSoft : colors.heading,
                fontWeight: 620,
                letterSpacing: "-0.065em",
              }}
            >
              {selectedCard
                ? selectedCard.title
                : hasResult
                  ? "O Espelho ainda não abriu a carta de hoje."
                  : "A carta diária ainda está selada."}
            </h2>
            <p className="mt-2 text-sm" style={{ color: colors.quiet }}>
              {selectedCard
                ? selectedCard.subtitle
                : hasResult
                  ? "Toque no baralho para revelar uma orientação curta e precisa."
                  : "Conclua o Código das Deusas para ativar este ritual."}
            </p>

            <blockquote
              className="mt-4 rounded-[18px] px-4 py-3 text-sm leading-relaxed md:text-base"
              style={{
                background: "rgba(255,255,255,0.024)",
                border: "1px solid rgba(242,185,104,0.075)",
                color: selectedCard ? "rgba(255,245,235,0.72)" : colors.muted,
                fontWeight: 350,
              }}
            >
              {selectedCard
                ? dailyOracle?.message || selectedCard.messages[0]
                : hasResult
                  ? "Uma carta por dia. Um fragmento por vez. A revelação precisa de ritmo."
                  : "A primeira revelação é a chave que abre as próximas camadas."}
            </blockquote>

            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <div className="rounded-[18px] p-3.5" style={{ border: "1px solid rgba(242,185,104,0.08)" }}>
                <Eyebrow className="mb-2">Como observar hoje</Eyebrow>
                <p className="text-sm leading-relaxed" style={{ color: colors.text }}>
                  {selectedCard
                    ? selectedCard.observe
                    : "Quando a carta abrir, ela aponta um gesto simples para acompanhar o dia."}
                </p>
              </div>
              <div className="rounded-[18px] p-3.5" style={{ border: "1px solid rgba(242,185,104,0.08)" }}>
                <Eyebrow className="mb-2">O que evitar hoje</Eyebrow>
                <p className="text-sm leading-relaxed" style={{ color: colors.text }}>
                  {selectedCard
                    ? selectedCard.avoid
                    : "Evite forçar resposta antes da leitura revelar o ponto certo."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        className="relative overflow-hidden rounded-[26px] p-4 md:rounded-[34px] md:p-7"
        style={{
          background:
            "linear-gradient(180deg, rgba(18,9,10,0.60), rgba(5,2,2,0.88))",
          border: `1px solid ${colors.border}`,
          boxShadow:
            "0 24px 78px rgba(0,0,0,0.20), inset 0 1px 0 rgba(255,255,255,0.018)",
        }}
      >
        <div className="mb-5 max-w-3xl">
          <Eyebrow className="mb-3">Reflexão da sua jornada</Eyebrow>
          <h2
            className="text-2xl leading-[1.02] md:text-4xl"
            style={{
              color: colors.heading,
              fontWeight: 610,
              letterSpacing: "-0.06em",
            }}
          >
            O que essa carta pode mover no seu dia.
          </h2>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          {personalReflection.map((item) => (
            <article
              key={item.label}
              className="rounded-[20px] p-4"
              style={{
                background: "rgba(255,255,255,0.022)",
                border: "1px solid rgba(242,185,104,0.085)",
              }}
            >
              <Eyebrow className="mb-2">{item.label}</Eyebrow>
              <h3
                className="text-lg leading-tight"
                style={{
                  color: colors.goldSoft,
                  fontWeight: 560,
                  letterSpacing: "-0.035em",
                }}
              >
                {item.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed" style={{ color: colors.text }}>
                {item.text}
              </p>
            </article>
          ))}
        </div>
      </section>
      </div>
    </main>
  );
}

export default OraculoOri;
