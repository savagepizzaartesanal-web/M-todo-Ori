import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { supabase } from "../lib/supabaseClient";

const LEGACY_STORAGE_KEY = "ori_produto_1_quiz";

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
        className="relative overflow-hidden rounded-[34px] md:rounded-[42px] p-8 md:p-10 cinematic-card"
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
          className="uppercase tracking-[0.45em] text-[10px] md:text-xs mb-5"
          style={{ color: "var(--gold-soft)" }}
        >
          Carregando Átrio
        </p>

        <h1
          className="text-4xl md:text-5xl font-semibold"
          style={{
            color: "var(--gold-primary)",
            letterSpacing: "-0.05em",
          }}
        >
          Preparando seu Átrio ORI...
        </h1>
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
      color: "gold",
      action: produto1Liberado ? (
        <Link
          to="/produto-1"
          className="inline-flex justify-center px-5 py-3 rounded-full text-sm font-medium transition-all hover:translate-x-1 w-full md:w-fit"
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
      ) : (
        <button
          disabled
          className="inline-flex justify-center px-5 py-3 rounded-full text-sm font-medium w-full md:w-fit opacity-60 cursor-not-allowed"
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
            color: "var(--text-muted)",
          }}
        >
          Aguardando liberação
        </button>
      ),
    },
    {
      number: "02",
      title: "Dossiê ORI",
      description:
        "Integra sua base arquetípica com corpo, rosto, cor, cabelo, beleza, ancestralidade estética, rotina e presença visual.",
      status: produto2Liberado ? "Liberado" : "Próxima camada",
      released: produto2Liberado,
      active: produto2Liberado,
      color: "purple",
      action: (
        <button
          disabled={!produto2Liberado}
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
          {produto2Liberado ? "Acessar Dossiê" : "Camada selada"}
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
      color: "gold",
      action: (
        <button
          disabled={!produto3Liberado}
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
          {produto3Liberado ? "Acessar Código Final" : "Camada selada"}
        </button>
      ),
    },
  ];

  return (
    <div className="relative overflow-hidden">
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
          className="relative overflow-hidden rounded-[34px] md:rounded-[42px] p-7 md:p-8 xl:p-9 mb-10 cinematic-card min-h-[430px] flex items-center"
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
            className="
              absolute
              inset-0
              w-full
              h-full
              object-cover
              object-[78%_center]
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
            <div className="inline-flex items-center gap-4 mb-4">
              <div
                className="w-8 h-px"
                style={{
                  background:
                    "linear-gradient(90deg, var(--gold-primary), transparent)",
                }}
              />

              <p
                className="uppercase tracking-[0.52em] text-[10px] md:text-xs reveal-step"
                style={{
                  color: "var(--gold-soft)",
                  "--delay": "0.05s",
                }}
              >
                Identidade · Imagem · Presença
              </p>
            </div>

            <h1
              className="text-4xl md:text-5xl xl:text-[56px] leading-[0.94] mb-5 reveal-step"
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
              className="max-w-[520px] mb-6 reveal-step"
              style={{
                "--delay": "0.32s",
              }}
            >
              <div
                className="max-h-[176px] overflow-y-auto pr-2 mb-5"
                style={{
                  scrollbarWidth: "thin",
                  scrollbarColor: "rgba(242,185,104,0.24) transparent",
                }}
              >
                <p
                  className="text-base md:text-lg leading-relaxed mb-5"
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
                  className="text-sm md:text-base leading-relaxed mb-5"
                  style={{ color: "var(--text-soft)" }}
                >
                  O Método ORI acontece em três movimentos: primeiro você
                  nomeia sua força, depois traduz essa força em imagem e, por
                  fim, aplica tudo ao seu guarda-roupa real.
                </p>

                <p
                  className="text-sm md:text-base leading-relaxed"
                  style={{ color: "rgba(247,234,216,0.72)" }}
                >
                  Ele organiza o que pode estar fragmentado entre corpo, roupa,
                  cabelo, beleza, presença e armário, para que sua imagem deixe
                  de ser tentativa e comece a virar assinatura.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                {["Nomear", "Integrar", "Aplicar", "Sustentar"].map((item) => (
                  <div
                    key={item}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs"
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
              className="w-24 h-px mb-6"
              style={{
                background:
                  "linear-gradient(to right, var(--gold-primary), transparent)",
              }}
            />

            {resultadoFinal ? (
              <div
                className="reveal-step relative overflow-hidden rounded-[24px] p-5 max-w-[500px]"
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
                      className="uppercase tracking-[0.38em] text-[9px] mb-2"
                      style={{ color: "var(--gold-soft)" }}
                    >
                      Resultado ativo
                    </p>

                    <h2
                      className="text-2xl md:text-3xl leading-tight"
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
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs w-fit"
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
                className="reveal-step rounded-[24px] p-5 max-w-[500px]"
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
                  className="text-sm md:text-base leading-relaxed"
                  style={{ color: "var(--text-soft)" }}
                >
                  Sua primeira etapa ainda está selada. Comece pelo Código das
                  Deusas para revelar sua composição arquetípica inicial e
                  abrir o primeiro espelho da sua jornada.
                </p>

                {produto1Liberado && (
                  <Link
                    to="/produto-1"
                    className="mt-5 inline-flex justify-center px-5 py-3 rounded-full text-sm font-medium transition-all hover:translate-x-1"
                    style={{
                      background: "var(--gold-primary)",
                      color: "#090506",
                      boxShadow:
                        "0 0 34px rgba(242,185,104,0.14), inset 0 0 14px rgba(255,255,255,0.16)",
                    }}
                  >
                    Iniciar Código das Deusas
                  </Link>
                )}
              </div>
            )}
          </div>
        </section>

        <div className="mb-7">
          <div className="inline-flex items-center gap-4 mb-4">
            <div
              className="w-8 h-px"
              style={{
                background:
                  "linear-gradient(90deg, var(--gold-primary), transparent)",
              }}
            />

            <p
              className="uppercase tracking-[0.45em] text-[10px] md:text-xs"
              style={{ color: "var(--gold-soft)" }}
            >
              Jornada ORI
            </p>
          </div>

          <h2
            className="text-3xl md:text-4xl font-semibold"
            style={{
              color: "var(--gold-primary)",
              letterSpacing: "-0.055em",
            }}
          >
            Mapa de tradução da sua imagem
          </h2>
        </div>

        <div className="grid xl:grid-cols-3 gap-6">
          {portalCards.map((card) => {
            const isPurple = card.color === "purple";

            return (
              <div
                key={card.number}
                className="group cinematic-card relative overflow-hidden rounded-[30px] p-7"
                style={{
                  background:
                    "linear-gradient(180deg, rgba(18,9,10,0.70), rgba(7,3,4,0.84))",
                  border: card.active
                    ? isPurple
                      ? "1px solid rgba(183,140,255,0.20)"
                      : "1px solid rgba(242,185,104,0.18)"
                    : "1px solid rgba(255,255,255,0.055)",
                  boxShadow: card.active
                    ? isPurple
                      ? "0 0 70px rgba(183,140,255,0.055), inset 0 0 34px rgba(183,140,255,0.025)"
                      : "0 0 70px rgba(242,185,104,0.045), inset 0 0 34px rgba(242,185,104,0.025)"
                    : "inset 0 0 34px rgba(255,255,255,0.012)",
                  opacity: card.released ? 1 : 0.62,
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
                    background: isPurple
                      ? "rgba(183,140,255,0.42)"
                      : "rgba(242,185,104,0.38)",
                  }}
                />

                <div className="relative z-10">
                  <div className="flex items-center justify-between gap-4 mb-7">
                    <div>
                      <p
                        className="uppercase tracking-[0.35em] text-[9px] mb-2"
                        style={{
                          color: isPurple
                            ? "rgba(217,189,255,0.76)"
                            : "var(--gold-soft)",
                        }}
                      >
                        Portal {card.number}
                      </p>

                      <div
                        className="w-10 h-px"
                        style={{
                          background: isPurple
                            ? "linear-gradient(90deg, rgba(183,140,255,0.8), transparent)"
                            : "linear-gradient(90deg, var(--gold-primary), transparent)",
                        }}
                      />
                    </div>

                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-sm"
                      style={{
                        background: card.active
                          ? isPurple
                            ? "rgba(183,140,255,0.10)"
                            : "rgba(242,185,104,0.10)"
                          : "rgba(255,255,255,0.035)",
                        border: card.active
                          ? isPurple
                            ? "1px solid rgba(183,140,255,0.18)"
                            : "1px solid rgba(242,185,104,0.16)"
                          : "1px solid rgba(255,255,255,0.06)",
                        color: card.active
                          ? isPurple
                            ? "#d9bdff"
                            : "var(--gold-primary)"
                          : "var(--text-muted)",
                      }}
                    >
                      {card.number}
                    </div>
                  </div>

                  <h3
                    className="text-2xl md:text-3xl mb-5 leading-tight"
                    style={{
                      color: card.active
                        ? isPurple
                          ? "#d9bdff"
                          : "var(--gold-primary)"
                        : "rgba(247,234,216,0.82)",
                      fontWeight: 600,
                      letterSpacing: "-0.045em",
                    }}
                  >
                    {card.title}
                  </h3>

                  <p
                    className="text-sm md:text-base leading-relaxed mb-7 min-h-[96px]"
                    style={{ color: "var(--text-soft)" }}
                  >
                    {card.description}
                  </p>

                  <div
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs mb-7"
                    style={{
                      background: card.active
                        ? isPurple
                          ? "rgba(183,140,255,0.08)"
                          : hasResult && card.number === "01"
                            ? "rgba(242,185,104,0.08)"
                            : "rgba(242,185,104,0.08)"
                        : "rgba(255,255,255,0.035)",
                      border: card.active
                        ? isPurple
                          ? "1px solid rgba(183,140,255,0.14)"
                          : hasResult && card.number === "01"
                            ? "1px solid rgba(242,185,104,0.14)"
                            : "1px solid rgba(242,185,104,0.14)"
                        : "1px solid rgba(255,255,255,0.07)",
                      color: card.active
                        ? isPurple
                          ? "#d9bdff"
                          : hasResult && card.number === "01"
                            ? "var(--gold-primary)"
                            : "var(--gold-primary)"
                        : "var(--text-muted)",
                    }}
                  >
                    <span
                      className="w-1.5 h-1.5 rounded-full"
                      style={{
                        background: card.active
                          ? isPurple
                            ? "#d9bdff"
                            : hasResult && card.number === "01"
                              ? "var(--gold-primary)"
                              : "var(--gold-primary)"
                          : "rgba(255,255,255,0.28)",
                      }}
                    />
                    {card.status}
                  </div>

                  <div>{card.action}</div>
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
