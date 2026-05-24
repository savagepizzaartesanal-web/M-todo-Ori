import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { supabase } from "../lib/supabaseClient";

const LEGACY_STORAGE_KEY = "ori_produto_1_quiz";
const ORACLE_PANEL_BACKGROUND =
  "radial-gradient(circle at 88% 12%, rgba(242,185,104,0.09), transparent 34%), radial-gradient(circle at 8% 92%, rgba(183,140,255,0.05), transparent 34%), linear-gradient(90deg, rgba(5,2,2,0.88), rgba(5,2,2,0.68), rgba(5,2,2,0.92)), url('/images/espelho-ori/oraculo/fundo-oraculo-premium.png')";

const getQuizStorageKey = (userId) => {
  return userId ? `ori_produto_1_quiz_${userId}` : null;
};

const readQuizFromStorage = (storageKey) => {
  if (!storageKey) return null;

  try {
    const savedQuiz = localStorage.getItem(storageKey);
    return savedQuiz ? JSON.parse(savedQuiz) : null;
  } catch (error) {
    console.log("Erro ao ler quiz salvo:", error);
    return null;
  }
};

function PortalCliente() {
  const [cliente, setCliente] = useState(null);
  const [loadingCliente, setLoadingCliente] = useState(true);
  const [quizLocal, setQuizLocal] = useState(null);

  useEffect(() => {
    async function loadCliente() {
      setLoadingCliente(true);

      const { data: sessionData } = await supabase.auth.getSession();
      const user = sessionData?.session?.user;

      if (!user?.id) {
        setCliente(null);
        setQuizLocal(null);
        setLoadingCliente(false);
        return;
      }

      const storageKey = getQuizStorageKey(user.id);
      const parsedQuiz = readQuizFromStorage(storageKey);

      setQuizLocal(parsedQuiz);

      /*
        Remove a chave antiga geral para evitar que uma conta nova herde
        resultado de outro usuário no mesmo navegador.
      */
      localStorage.removeItem(LEGACY_STORAGE_KEY);

      const { data, error } = await supabase
        .from("clientes")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) {
        console.log("Erro ao buscar cliente:", error);
      }

      if (data) {
        setCliente(data);
        setLoadingCliente(false);
        return;
      }

      const nomeMetadata = user.user_metadata?.nome || null;
      const emailUsuario = user.email || null;

      if (!emailUsuario) {
        setCliente(null);
        setLoadingCliente(false);
        return;
      }

      const { data: novoCliente, error: novoClienteError } = await supabase
        .from("clientes")
        .upsert(
          {
            user_id: user.id,
            nome: nomeMetadata,
            email: emailUsuario,
            admin: false,
            produto_1_liberado: true,
            produto_2_liberado: false,
            produto_3_liberado: false,
            status_jornada: "Cadastro recebido",
          },
          {
            onConflict: "email",
          },
        )
        .select("*")
        .maybeSingle();

      if (novoClienteError) {
        console.log("Erro ao criar perfil do cliente:", novoClienteError);
        setCliente(null);
        setLoadingCliente(false);
        return;
      }

      setCliente(novoCliente || null);
      setLoadingCliente(false);
    }

    loadCliente();
  }, []);

  const answers = quizLocal?.answers || {};
  const localResult = quizLocal?.result || null;

  const resultadoFinal =
    cliente?.resultado || localResult?.nomeComposto || null;

  const hasAnswers = Object.keys(answers).length > 0;
  const hasResult = Boolean(resultadoFinal);

  const produto1Liberado = cliente?.produto_1_liberado ?? true;
  const produto2Liberado = cliente?.produto_2_liberado ?? false;
  const produto3Liberado = cliente?.produto_3_liberado ?? false;

  const statusProduto1 = hasResult
    ? "Leitura revelada"
    : hasAnswers
      ? "Em andamento"
      : produto1Liberado
        ? "Disponível"
        : "Aguardando liberação";

  const buttonProduto1 = hasResult
    ? "Acessar leitura revelada"
    : hasAnswers
      ? "Continuar leitura"
      : "Iniciar Código das Deusas";

  if (loadingCliente) {
    return (
      <div
        className="ori-main-frame ori-card-protagonist relative overflow-hidden rounded-[34px] md:rounded-[42px] p-8 md:p-10 cinematic-card"
        role="status"
        aria-live="polite"
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
        <p
          className="ori-type-system mb-5"
          style={{ color: "var(--gold-soft)" }}
        >
          Carregando Átrio
        </p>

        <h1
          className="ori-type-hero text-4xl md:text-5xl"
          style={{
            color: "var(--gold-primary)",
            letterSpacing: "-0.05em",
          }}
        >
          Preparando seu Átrio ORI...
        </h1>

        <p
          className="ori-type-reading-soft mt-4 max-w-md text-sm"
          style={{ color: "rgba(255,245,235,0.58)" }}
        >
          Estamos buscando sua leitura e suas próximas camadas.
        </p>
      </div>
    );
  }

  const portalCards = [
    {
      number: "01",
      title: "Código das Deusas",
      description:
        hasResult
          ? "Sua força principal, força secundária e arquétipo composto já foram nomeados. Esta é a base que sustenta as próximas camadas da sua imagem."
          : "A primeira porta nomeia sua força arquetípica, revela sua dinâmica de presença e abre os primeiros códigos simbólicos da sua imagem.",
      status: statusProduto1,
      released: produto1Liberado,
      active: hasResult,
      tone: "copper",
      aura:
        "radial-gradient(circle at top right, rgba(210,135,70,0.34), transparent 38%)",
      action: produto1Liberado && hasResult ? (
        <Link
          to="/produto-1"
          className="inline-flex justify-center px-5 py-3 rounded-full text-sm font-medium w-full md:w-fit"
          style={{
            background: hasResult
              ? "rgba(242,185,104,0.075)"
              : "var(--gold-primary)",
            border: hasResult ? "1px solid rgba(242,185,104,0.14)" : "none",
            color: hasResult ? "var(--text-soft)" : "#090506",
          }}
        >
          {buttonProduto1}
        </Link>
      ) : !produto1Liberado ? (
        <button
          type="button"
          disabled
          aria-label="Produto 1 aguardando liberação"
          className="inline-flex justify-center px-5 py-3 rounded-full text-sm font-medium w-full md:w-fit opacity-60 cursor-not-allowed"
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
            color: "var(--text-muted)",
          }}
        >
          Aguardando liberação
        </button>
      ) : null,
    },
    {
      number: "02",
      title: "Dossiê ORI",
      description:
        "Integra sua base arquetípica com corpo, rosto, cor, cabelo, beleza, ancestralidade estética, rotina e presença visual.",
      status: produto2Liberado ? "Liberado" : "Próxima camada",
      released: produto2Liberado,
      active: produto2Liberado,
      tone: "lavender",
      aura:
        "radial-gradient(circle at top right, rgba(107,90,110,0.36), transparent 38%)",
      action: (
        <button
          type="button"
          disabled={!produto2Liberado}
          aria-label={
            produto2Liberado
              ? "Acessar Dossiê ORI"
              : "Dossiê ORI ainda selado"
          }
          className="inline-flex justify-center px-5 py-3 rounded-full text-sm font-medium w-full md:w-fit transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          style={{
            background: produto2Liberado
              ? "rgba(183,140,255,0.10)"
              : "rgba(255,255,255,0.04)",
            border: produto2Liberado
              ? "1px solid rgba(183,140,255,0.18)"
              : "1px solid rgba(255,255,255,0.08)",
            color: produto2Liberado ? "#d9bdff" : "var(--text-muted)",
          }}
        >
          {produto2Liberado ? "Acessar Dossiê" : "Ainda selada"}
        </button>
      ),
    },
    {
      number: "03",
      title: "Código Final",
      description:
        "Transforma sua direção visual em guarda-roupa real: cápsula, fórmulas de look, prioridades de compra e escolhas com critério.",
      status: produto3Liberado ? "Liberado" : "Aplicação final",
      released: produto3Liberado,
      active: produto3Liberado,
      tone: "wine",
      aura:
        "radial-gradient(circle at top right, rgba(74,26,26,0.42), transparent 40%)",
      action: (
        <button
          type="button"
          disabled={!produto3Liberado}
          aria-label={
            produto3Liberado
              ? "Acessar Código Final"
              : "Código Final ainda selado"
          }
          className="inline-flex justify-center px-5 py-3 rounded-full text-sm font-medium w-full md:w-fit transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          style={{
            background: produto3Liberado
              ? "rgba(242,185,104,0.075)"
              : "rgba(255,255,255,0.04)",
            border: produto3Liberado
              ? "1px solid rgba(242,185,104,0.16)"
              : "1px solid rgba(255,255,255,0.08)",
            color: produto3Liberado
              ? "var(--gold-primary)"
              : "var(--text-muted)",
          }}
        >
          {produto3Liberado ? "Acessar Código Final" : "Ainda selada"}
        </button>
      ),
    },
  ];

  const themeNavigation = [
    {
      title: "Direção",
      text: "O próximo movimento da sua jornada ORI.",
      active: true,
    },
    {
      title: "Essência",
      text: "A força simbólica que sustenta sua presença.",
      active: hasResult,
    },
    {
      title: "Presença",
      text: "O modo como sua imagem chega antes da fala.",
      active: hasResult,
    },
    {
      title: "Sombra",
      text: "O ponto onde tentativa, ruído e desejo se misturam.",
      active: hasResult,
    },
    {
      title: "Imagem",
      text: "A tradução visual da força que já foi nomeada.",
      active: produto2Liberado,
    },
    {
      title: "Corpo",
      text: "Forma, proporção, gesto e sustentação estética.",
      active: produto2Liberado,
    },
    {
      title: "Beleza",
      text: "Cabelo, cor, rosto e acabamento de presença.",
      active: produto2Liberado,
    },
    {
      title: "Guarda-roupa",
      text: "Aplicação real em peças, looks e escolhas.",
      active: produto3Liberado,
    },
  ];

  const quickEntry = hasResult
    ? {
        eyebrow: "Seu espelho inicial já abriu",
        title: "Continue pela camada que pede direção agora.",
        text: `${resultadoFinal} já foi nomeada. O próximo passo é observar onde essa força precisa virar imagem, escolha e presença no cotidiano.`,
        primaryLabel: "Abrir Espelho ORI",
        primaryTo: "/espelho-ori",
        secondaryLabel: "Ver Método ORI",
        secondaryTo: "/metodo-ori",
      }
    : {
        eyebrow: "Primeiro gesto",
        title: "Revele a força que sua imagem tenta sustentar.",
        text: "Antes de pensar em roupa, cor ou cabelo, o ORI começa nomeando a sua base simbólica. Essa leitura abre o mapa das próximas camadas.",
        primaryLabel: "Começar leitura",
        primaryTo: "/produto-1",
        secondaryLabel: "Conhecer método",
        secondaryTo: "/metodo-ori",
      };

  const recommendation = hasResult
    ? {
        label: "Recomendação personalizada",
        title: "Sua próxima leitura deve transformar força em direção.",
        text: "Entre pelo Espelho ORI para ver o ponto de tensão atual, a camada ativa e o que sua imagem precisa sustentar com mais precisão.",
        action: "Ir para o espelho",
        to: "/espelho-ori",
      }
    : {
        label: "Recomendação de entrada",
        title: "Comece pelo Código das Deusas.",
        text: "Ele funciona como a porta de entrada do sistema: primeiro nomeia sua força, depois prepara o Dossiê, o Espelho e a aplicação no guarda-roupa.",
        action: "Iniciar agora",
        to: "/produto-1",
      };

  const showQuickSecondary = recommendation.to !== quickEntry.primaryTo;

  return (
    <div className="ori-atmosphere ori-atmosphere-portal relative overflow-hidden">
      <div
        className="absolute top-[-260px] right-[-160px] w-[680px] h-[680px] rounded-full blur-3xl opacity-[0.08] pointer-events-none"
        style={{ background: "var(--gold-primary)" }}
      />

      <div
        className="absolute bottom-[-260px] left-[-180px] w-[560px] h-[560px] rounded-full blur-3xl opacity-[0.08] pointer-events-none"
        style={{ background: "var(--lavender-shadow)" }}
      />

      <div className="relative z-10 max-w-7xl">
        <section
          className="ori-main-frame ori-hero-panel ori-card-protagonist relative overflow-hidden rounded-[24px] md:rounded-[42px] p-4 pt-7 md:p-8 xl:p-9 mb-5 md:mb-10 cinematic-card min-h-[350px] sm:min-h-[390px] md:min-h-[430px] flex items-center"
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
            src="/images/heroes/atrio-ori.png"
            alt="Átrio ORI"
            loading="eager"
            decoding="async"
            className="
              absolute
              inset-0
              w-full
              h-full
              object-cover
              object-[74%_center]
              md:object-[78%_center]
              opacity-95
              pointer-events-none
              select-none
            "
          />

          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "linear-gradient(90deg, rgba(5,2,2,0.98) 0%, rgba(5,2,2,0.92) 30%, rgba(5,2,2,0.52) 50%, rgba(5,2,2,0.12) 72%, rgba(5,2,2,0.02) 100%)",
            }}
          />

          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(circle at 80% 34%, rgba(242,185,104,0.10), transparent 32%), radial-gradient(circle at 18% 85%, rgba(183,140,255,0.08), transparent 34%)",
            }}
          />

          <div
            className="absolute inset-0 pointer-events-none opacity-[0.028]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(242,185,104,0.22) 1px, transparent 1px), linear-gradient(90deg, rgba(242,185,104,0.10) 1px, transparent 1px)",
              backgroundSize: "72px 72px",
            }}
          />

          <div
            className="absolute inset-0 pointer-events-none opacity-[0.03]"
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

          <div className="relative z-10 max-w-[560px]">
            <div className="ori-label-line mb-3 md:mb-4">
              <p
                className="ori-type-system reveal-step"
                style={{
                  color: "var(--gold-soft)",
                  "--delay": "0.05s",
                }}
              >
                Identidade · Imagem · Presença
              </p>
            </div>

            <h1
              className="ori-type-hero text-[34px] md:text-5xl xl:text-[56px] mb-3 md:mb-5 reveal-step"
              style={{
                color: "var(--gold-primary)",
                fontWeight: 600,
                letterSpacing: "-0.075em",
                textShadow: "0 0 42px rgba(242,185,104,0.12)",
                "--delay": "0.18s",
              }}
            >
              Átrio ORI
            </h1>

            <div
              className="max-w-[520px] mb-4 md:mb-6 reveal-step"
              style={{
                "--delay": "0.32s",
              }}
            >
              <div
                className="max-h-none overflow-visible pr-0 mb-3 md:mb-5 md:max-h-[176px] md:overflow-y-auto md:pr-2"
                style={{
                  scrollbarWidth: "thin",
                  scrollbarColor: "rgba(242,185,104,0.24) transparent",
                }}
              >
                <p
                  className="ori-type-reading text-[15px] md:text-lg mb-0 md:mb-5"
                  style={{
                    color: "var(--text-primary)",
                    textShadow: "0 0 28px rgba(0,0,0,0.45)",
                  }}
                >
                  {cliente?.nome
                    ? `${cliente.nome}, sua jornada de identidade, imagem e presença começa aqui.`
                    : "Sua jornada de identidade, imagem e presença começa aqui."}
                </p>

                <p
                  className="ori-type-reading-soft hidden text-sm md:mb-5 md:block md:text-base"
                  style={{ color: "var(--text-soft)" }}
                >
                  O Método ORI acontece em três movimentos: primeiro você
                  nomeia sua força, depois traduz essa força em imagem e, por
                  fim, aplica tudo ao seu guarda-roupa real.
                </p>

                <p
                  className="ori-type-reading-soft hidden text-sm md:block md:text-base"
                  style={{ color: "rgba(247,234,216,0.72)" }}
                >
                  Ele organiza o que pode estar fragmentado entre corpo, roupa,
                  cabelo, beleza, presença e armário, para que sua imagem deixe
                  de ser tentativa e comece a virar assinatura.
                </p>
              </div>

              <div className="ori-premium-scroll hidden gap-2 overflow-x-auto pb-1 sm:flex md:flex-wrap md:gap-3 md:overflow-visible md:pb-0">
                {["Nomear", "Integrar", "Aplicar", "Sustentar"].map((item) => (
                  <div
                    key={item}
                    className="ori-chip shrink-0"
                    data-state="revealed"
                    style={{
                      background: "rgba(255,255,255,0.028)",
                      border: "1px solid rgba(242,185,104,0.18)",
                      color: "rgba(255,213,143,0.88)",
                      boxShadow:
                        "inset 0 0 14px rgba(255,255,255,0.008), 0 0 18px rgba(242,185,104,0.16)",
                      backdropFilter: "blur(10px)",
                      WebkitBackdropFilter: "blur(10px)",
                    }}
                  >
                    <span
                      className="h-1.5 w-1.5 rounded-full"
                      style={{
                        background: "rgba(255,213,143,0.88)",
                        boxShadow: "0 0 12px rgba(242,185,104,0.28)",
                      }}
                    />
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div
              className="w-16 md:w-24 h-px mb-4 md:mb-6"
              style={{
                background:
                  "linear-gradient(to right, var(--gold-primary), transparent)",
              }}
            />

            {resultadoFinal ? (
              <div
                className="ori-card-secondary reveal-step relative overflow-hidden rounded-[18px] md:rounded-[24px] p-3.5 md:p-5 max-w-[500px]"
                data-state="revealed"
                style={{
                  background:
                    "linear-gradient(90deg, rgba(242,185,104,0.075), rgba(255,255,255,0.016))",
                  border: "1px solid rgba(242,185,104,0.14)",
                  boxShadow:
                    "inset 0 0 30px rgba(242,185,104,0.035), 0 0 42px rgba(242,185,104,0.03)",
                  backdropFilter: "blur(12px)",
                  WebkitBackdropFilter: "blur(12px)",
                  "--delay": "0.46s",
                }}
              >
                <div
                  className="absolute inset-0 opacity-[0.03] pointer-events-none"
                  style={{
                    backgroundImage:
                      "linear-gradient(rgba(242,185,104,0.22) 1px, transparent 1px), linear-gradient(90deg, rgba(242,185,104,0.10) 1px, transparent 1px)",
                    backgroundSize: "42px 42px",
                  }}
                />

                <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-5">
                  <div>
                    <p
                      className="ori-type-system mb-1.5 md:mb-2"
                      style={{ color: "var(--gold-soft)" }}
                    >
                      Resultado ativo
                    </p>

                    <h2
                      className="ori-type-revelation text-[22px] md:text-3xl"
                      style={{
                        color: "var(--gold-primary)",
                        fontWeight: 600,
                        letterSpacing: "-0.045em",
                      }}
                    >
                      {resultadoFinal}
                    </h2>
                  </div>

                  <div
                    className="ori-badge ori-state-done ori-state-surface hidden w-fit sm:inline-flex"
                    style={{
                      background: "rgba(242,185,104,0.08)",
                      border: "1px solid rgba(242,185,104,0.16)",
                      color: "var(--gold-primary)",
                    }}
                  >
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{
                        background: "var(--gold-primary)",
                        boxShadow: "0 0 14px rgba(242,185,104,0.45)",
                      }}
                    />
                    Registrado
                  </div>
                </div>
              </div>
            ) : (
              <div
                className="ori-card-teaser reveal-step rounded-[18px] md:rounded-[24px] p-3.5 md:p-5 max-w-[500px]"
                data-state="sealed"
                style={{
                  background:
                    "linear-gradient(90deg, rgba(242,185,104,0.055), rgba(255,255,255,0.018))",
                  border: "1px solid rgba(242,185,104,0.12)",
                  backdropFilter: "blur(12px)",
                  WebkitBackdropFilter: "blur(12px)",
                  "--delay": "0.46s",
                }}
              >
                <p
                  className="ori-type-reading-soft text-sm md:text-base"
                  style={{ color: "var(--text-soft)" }}
                >
                  <span className="md:hidden">
                    Comece pelo Código das Deusas para abrir o primeiro espelho.
                  </span>
                  <span className="hidden md:inline">
                    Sua primeira etapa ainda está selada. Comece pelo Código das
                    Deusas para revelar sua composição arquetípica inicial e
                    abrir o primeiro espelho da sua jornada.
                  </span>
                </p>

              </div>
            )}
          </div>
        </section>

        <section
          className="ori-mobile-section ori-main-frame ori-card-secondary relative overflow-hidden rounded-[20px] md:rounded-[28px] p-3.5 md:p-5 mb-5 md:mb-8 cinematic-card"
          style={{
            backgroundColor: "rgba(5,2,2,0.92)",
            backgroundImage: ORACLE_PANEL_BACKGROUND,
            backgroundSize: "cover",
            backgroundPosition: "center",
            border: "1px solid rgba(242,185,104,0.12)",
            boxShadow:
              "0 0 58px rgba(242,185,104,0.028), inset 0 0 32px rgba(255,255,255,0.010)",
            backdropFilter: "blur(14px)",
            WebkitBackdropFilter: "blur(14px)",
          }}
        >
          <div
            className="absolute inset-0 pointer-events-none opacity-[0.018]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(242,185,104,0.18) 1px, transparent 1px), linear-gradient(90deg, rgba(242,185,104,0.08) 1px, transparent 1px)",
              backgroundSize: "54px 54px",
            }}
          />

          <div className="relative z-10">
            <div className="grid gap-3 md:gap-4 xl:grid-cols-[1fr_auto] xl:items-center">
            <div>
              <p
                className="ori-type-system mb-2"
                style={{ color: "var(--gold-soft)" }}
              >
                {quickEntry.eyebrow}
              </p>

              <h2
                className="ori-type-revelation text-lg md:text-2xl mb-2"
                style={{
                  color: "var(--gold-primary)",
                  fontWeight: 620,
                  letterSpacing: "-0.045em",
                }}
              >
                {quickEntry.title}
              </h2>

              <p
                className="ori-type-reading-soft max-w-2xl text-xs md:text-sm"
                style={{ color: "var(--text-soft)" }}
              >
                <span className="md:hidden">
                  {`${quickEntry.text.split(".")[0]}.`}
                </span>
                <span className="hidden md:inline">{quickEntry.text}</span>
              </p>
            </div>

              <div className="flex flex-col gap-2 sm:flex-row xl:justify-end">
                <Link
                  to={quickEntry.primaryTo}
              className="ori-journey-action inline-flex min-h-10 w-full items-center justify-center rounded-full px-5 py-2.5 text-center text-sm sm:w-auto md:min-h-11"
                  style={{
                    background:
                      "linear-gradient(90deg, var(--copper-primary), var(--gold-primary))",
                    color: "#090506",
                    fontWeight: 750,
                    boxShadow:
                      "0 0 30px rgba(210,135,70,0.14), inset 0 0 12px rgba(255,255,255,0.14)",
                  }}
                >
                  {quickEntry.primaryLabel}
                </Link>

                {showQuickSecondary && (
                  <Link
                    to={recommendation.to}
                    className="ori-button-secondary inline-flex min-h-9 w-full items-center justify-center px-4 py-2 text-center text-xs sm:w-auto md:min-h-11 md:px-5 md:py-2.5 md:text-sm"
                    style={{
                      background: "rgba(255,255,255,0.024)",
                      border: "1px solid rgba(242,185,104,0.12)",
                      color: "var(--gold-primary)",
                      fontWeight: 620,
                    }}
                  >
                    {recommendation.action}
                  </Link>
                )}
              </div>
            </div>

            <div
              className="mt-3 hidden h-px w-full md:block"
              style={{ background: "rgba(242,185,104,0.08)" }}
            />

            <div className="ori-premium-scroll mt-3 hidden gap-2 overflow-x-auto pb-1 md:flex">
              {themeNavigation.map((theme) => (
                <span
                  key={theme.title}
                  className={`ori-chip shrink-0 ${theme.active ? "ori-state-active ori-state-surface" : "ori-state-sealed ori-state-surface"}`}
                  data-state={theme.active ? "active" : "sealed"}
                  style={{
                    background: theme.active
                      ? "rgba(242,185,104,0.070)"
                      : "rgba(255,255,255,0.020)",
                    border: theme.active
                      ? "1px solid rgba(242,185,104,0.14)"
                      : "1px solid rgba(255,255,255,0.055)",
                    color: theme.active
                      ? "var(--gold-primary)"
                      : "rgba(247,234,216,0.46)",
                  }}
                >
                  {theme.title}
                </span>
              ))}
            </div>
          </div>
        </section>

        <div className="mb-3 md:mb-5">
          <div className="ori-label-line mb-2">
            <p
              className="ori-type-system text-[9px] md:text-[10px]"
              style={{ color: "var(--gold-soft)" }}
            >
              Jornada ativa
            </p>
          </div>

          <h2
              className="ori-type-revelation text-[23px] md:text-4xl"
            style={{
              color: "var(--gold-primary)",
              letterSpacing: "-0.055em",
            }}
          >
            Mapa de tradução da sua imagem
          </h2>
        </div>

        <div className="grid gap-3 md:gap-4 xl:grid-cols-3">
          {portalCards.map((card) => {
            const isLavender = card.tone === "lavender";
            const isWine = card.tone === "wine";
            const activeBorder = isLavender
              ? "1px solid var(--lavender-muted)"
              : isWine
                ? "1px solid rgba(74,26,26,0.72)"
                : "1px solid var(--copper-soft)";
            const activeGlow = isLavender
              ? "0 0 70px rgba(107,90,110,0.075), inset 0 0 34px rgba(107,90,110,0.030)"
              : isWine
                ? "0 0 70px rgba(74,26,26,0.085), inset 0 0 34px rgba(74,26,26,0.035)"
                : "0 0 70px rgba(210,135,70,0.055), inset 0 0 34px rgba(210,135,70,0.030)";
            const accentColor = isLavender
              ? "var(--lavender-muted)"
              : isWine
                ? "var(--wine-muted)"
                : "var(--copper-primary)";
            const accentSoft = isLavender
              ? "rgba(107,90,110,0.16)"
              : isWine
                ? "rgba(74,26,26,0.20)"
                : "rgba(210,135,70,0.14)";

            return (
              <div
                key={card.number}
                className={`group cinematic-card relative overflow-hidden rounded-[18px] md:rounded-[26px] p-3 md:p-5 ${
                  card.released
                    ? card.active
                      ? "ori-card-protagonist"
                      : "ori-card-secondary"
                    : "ori-card-teaser"
                }`}
                data-state={
                  card.active ? "active" : card.released ? "next" : "sealed"
                }
                style={{
                  background:
                    "linear-gradient(180deg, rgba(18,9,10,0.70), rgba(7,3,4,0.84))",
                  border: card.active ? activeBorder : "1px solid rgba(255,255,255,0.055)",
                  boxShadow: card.active
                    ? activeGlow
                    : "inset 0 0 34px rgba(255,255,255,0.012)",
                  opacity: card.active ? 1 : card.released ? 0.86 : 0.58,
                  backdropFilter: "blur(14px)",
                  WebkitBackdropFilter: "blur(14px)",
                }}
              >
                <div
                  className="absolute inset-0 opacity-[0.035] pointer-events-none"
                  style={{
                    backgroundImage:
                      "linear-gradient(rgba(242,185,104,0.18) 1px, transparent 1px), linear-gradient(90deg, rgba(242,185,104,0.08) 1px, transparent 1px)",
                    backgroundSize: "58px 58px",
                  }}
                />

                <div
                  className="absolute -top-24 -right-20 w-56 h-56 rounded-full blur-3xl opacity-[0.12] pointer-events-none"
                  style={{
                    background: card.aura,
                  }}
                />

                {!card.released && (
                  <div
                    className="pointer-events-none absolute bottom-4 right-4 z-20 text-lg leading-none md:bottom-5 md:right-5"
                    style={{
                      color: "rgba(242,185,104,0.58)",
                      textShadow: "0 0 18px rgba(242,185,104,0.10)",
                    }}
                    aria-hidden="true"
                  >
                    🔒
                  </div>
                )}

                <div className="relative z-10 flex min-h-full flex-col">
                  <div className="flex items-center justify-between gap-3 mb-3 md:mb-4">
                    <div>
                      <p
                        className="ori-type-system mb-1.5 md:mb-2"
                        style={{
                          color: isLavender
                            ? "var(--lavender-muted)"
                            : isWine
                              ? "rgba(190,126,105,0.74)"
                              : "var(--copper-primary)",
                        }}
                      >
                        Portal {card.number}
                      </p>

                      <div
                        className="w-8 md:w-10 h-px"
                        style={{
                          background: isLavender
                            ? "linear-gradient(90deg, var(--lavender-muted), transparent)"
                            : isWine
                              ? "linear-gradient(90deg, var(--wine-muted), transparent)"
                              : "linear-gradient(90deg, var(--copper-primary), transparent)",
                        }}
                      />
                    </div>

                    <div
                      className="flex h-8 w-8 items-center justify-center rounded-full text-[11px] md:h-10 md:w-10 md:text-sm"
                      style={{
                        background: card.active
                          ? accentSoft
                          : "rgba(255,255,255,0.035)",
                        border: card.active
                          ? activeBorder
                          : "1px solid rgba(255,255,255,0.06)",
                        color: card.active
                          ? accentColor
                          : "var(--text-muted)",
                      }}
                    >
                      {card.number}
                    </div>
                  </div>

                  <h3
                    className="ori-type-revelation text-lg md:text-2xl mb-2.5 md:mb-3"
                    style={{
                      color: card.active
                        ? isLavender
                          ? "rgba(215,194,220,0.92)"
                          : isWine
                            ? "rgba(230,170,138,0.92)"
                            : "var(--copper-primary)"
                        : "rgba(247,234,216,0.82)",
                      fontWeight: 600,
                      letterSpacing: "-0.045em",
                    }}
                  >
                    {card.title}
                  </h3>

                  <p
                    className="ori-type-reading-soft text-xs md:text-sm mb-3 md:mb-4 md:min-h-[96px]"
                    style={{ color: "var(--text-soft)" }}
                  >
                    <span className="md:hidden">
                      {`${card.description.split(".")[0]}.`}
                    </span>
                    <span className="hidden md:inline">
                      {card.active
                        ? card.description
                        : `${card.description.split(".")[0]}.`}
                    </span>
                  </p>

                  {card.action && (
                    <div className={card.active ? "mt-auto" : "mt-auto opacity-80"}>
                      {card.action}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default PortalCliente;
