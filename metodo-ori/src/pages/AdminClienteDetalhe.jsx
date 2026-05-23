import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { supabase } from "../lib/supabaseClient";

function AdminClienteDetalhe() {
  const { id } = useParams();

  const [cliente, setCliente] = useState(null);
  const [observacoes, setObservacoes] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [perfilAberto, setPerfilAberto] = useState(false);

  const fetchCliente = useCallback(async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("clientes")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) {
      console.log("Erro ao buscar cliente:", error);
    }

    setCliente(data || null);
    setObservacoes(data?.observacoes_admin || "");
    setLoading(false);
  }, [id]);

  useEffect(() => {
    Promise.resolve().then(fetchCliente);
  }, [fetchCliente]);

  const updateCliente = async (updates) => {
    if (!cliente) return;

    setSaving(true);

    const { error } = await supabase
      .from("clientes")
      .update(updates)
      .eq("id", cliente.id);

    if (error) {
      console.log("Erro ao atualizar cliente:", error);
    }

    await fetchCliente();
    setSaving(false);
  };

  const handleSalvarObservacoes = () => {
    updateCliente({
      observacoes_admin: observacoes,
    });
  };

  const formatDate = (date) => {
    if (!date) return "Sem data";

    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }).format(new Date(date));
  };

  const formatShortDate = (date) => {
    if (!date) return "";

    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(new Date(`${date}T00:00:00`));
  };

  const parseOnboardingProfile = (profile) => {
    if (!profile) return {};
    if (typeof profile !== "string") return profile;

    try {
      return JSON.parse(profile);
    } catch (error) {
      console.log("Erro ao interpretar perfil de entrada:", error);
      return {};
    }
  };

  if (loading) {
    return (
      <div
        className="ori-main-frame ori-card-protagonist rounded-[34px] md:rounded-[42px] p-8 md:p-10 cinematic-card"
        style={{
          background:
            "linear-gradient(135deg, rgba(18,9,10,0.88), rgba(5,2,2,0.96))",
          border: "1px solid rgba(242,185,104,0.14)",
          boxShadow:
            "0 0 90px rgba(242,185,104,0.055), inset 0 0 80px rgba(255,255,255,0.018)",
        }}
      >
        <p
          className="ori-type-system text-[10px] md:text-xs mb-5"
          style={{ color: "var(--gold-soft)" }}
        >
          Ficha da Cliente
        </p>

        <h1
          className="ori-type-hero text-4xl md:text-5xl font-semibold"
          style={{
            color: "var(--gold-primary)",
            letterSpacing: "-0.05em",
          }}
        >
          Carregando cliente...
        </h1>
      </div>
    );
  }

  if (!cliente) {
    return (
      <div className="ori-atmosphere ori-atmosphere-method relative overflow-hidden max-w-7xl">
        <Link
          to="/admin/clientes"
          className="ori-button-secondary inline-block mb-8 rounded-full px-5 py-2.5 text-sm"
          style={{ color: "var(--gold-primary)" }}
        >
          ← Voltar para clientes
        </Link>

        <div
          className="ori-card-teaser rounded-[30px] p-8 cinematic-card"
          data-state="sealed"
          style={{
            background:
              "linear-gradient(180deg, rgba(18,9,10,0.72), rgba(7,3,4,0.88))",
            border: "1px solid rgba(242,185,104,0.10)",
          }}
        >
          <p style={{ color: "var(--text-soft)" }}>Cliente não encontrada.</p>
        </div>
      </div>
    );
  }

  const produtoAtual = cliente.produto_3_liberado
    ? "Código Final"
    : cliente.produto_2_liberado
      ? "Dossiê ORI"
      : cliente.resultado
        ? "Produto 1 concluído"
        : "Lead / Produto 1";

  const etapaAtual =
    cliente.status_jornada ||
    (cliente.resultado ? "Produto 1 concluído" : "Cadastro recebido");

  const timeline = [
    {
      label: "Cadastro recebido",
      description: "Cliente entrou no Portal ORI.",
      done: true,
    },
    {
      label: "Código das Deusas",
      description: cliente.resultado
        ? `Resultado revelado: ${cliente.resultado}`
        : "Aguardando conclusão da primeira leitura.",
      done: Boolean(cliente.resultado),
    },
    {
      label: "Dossiê ORI",
      description: cliente.produto_2_liberado
        ? "Produto 2 liberado para acesso."
        : "Aguardando liberação do Produto 2.",
      done: Boolean(cliente.produto_2_liberado),
    },
    {
      label: "Código Final",
      description: cliente.produto_3_liberado
        ? "Produto 3 liberado para acesso."
        : "Código Final ainda pendente.",
      done: Boolean(cliente.produto_3_liberado),
    },
    {
      label: "Jornada finalizada",
      description:
        cliente.status_jornada === "Finalizado"
          ? "Cliente marcada como finalizada."
          : "Aprovação final pendente.",
      done: cliente.status_jornada === "Finalizado",
    },
  ];

  const chips = [
    cliente.admin ? "Admin" : "Cliente",
    produtoAtual,
    cliente.resultado || "Sem resultado",
    etapaAtual,
  ];
  const onboardingProfile = parseOnboardingProfile(cliente.perfil_onboarding);
  const onboardingItems = [
    ["Nome completo", onboardingProfile.fullName || cliente.nome],
    ["Como gosta de ser chamada", onboardingProfile.preferredName],
    ["Data de nascimento", formatShortDate(onboardingProfile.birthDate)],
    ["Estado/Cidade onde mora", onboardingProfile.residenceLocation],
    ["Momento atual", onboardingProfile.journeyStage],
    ["O que mais pesa", onboardingProfile.mainPain],
    ["Descrição livre", onboardingProfile.mainPainCustom],
    ["Desejo principal", onboardingProfile.mainDesire],
    ["Autodeclaração racial", onboardingProfile.racialIdentity],
    ["Perfil criado em", formatDate(onboardingProfile.completedAt)],
  ].filter(([, value]) => Boolean(String(value || "").trim()));
  const onboardingCompleted = Boolean(cliente.perfil_onboarding_concluido);
  const onboardingSummary = onboardingCompleted
    ? `${onboardingItems.length} respostas registradas`
    : "Perfil ainda não preenchido";

  return (
    <div className="ori-atmosphere ori-atmosphere-method relative overflow-hidden max-w-7xl">
      <Link
        to="/admin/clientes"
        className="ori-button-secondary inline-block mb-7 rounded-full px-5 py-2.5 text-sm"
        style={{ color: "var(--gold-primary)" }}
      >
        ← Voltar para clientes
      </Link>

      <section
        className="ori-main-frame ori-hero-panel relative overflow-hidden rounded-[34px] md:rounded-[42px] p-7 md:p-9 xl:p-10 mb-8 cinematic-card"
        style={{
          background:
            "radial-gradient(circle at top right, rgba(242,185,104,0.12), transparent 34%), linear-gradient(135deg, rgba(18,9,10,0.88), rgba(5,2,2,0.96))",
          border: "1px solid rgba(242,185,104,0.14)",
          boxShadow:
            "0 0 90px rgba(242,185,104,0.055), inset 0 0 80px rgba(255,255,255,0.018)",
          backdropFilter: "blur(18px)",
          WebkitBackdropFilter: "blur(18px)",
        }}
      >
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.028]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(242,185,104,0.22) 1px, transparent 1px), linear-gradient(90deg, rgba(242,185,104,0.10) 1px, transparent 1px)",
            backgroundSize: "72px 72px",
          }}
        />

        <div className="relative z-10">
          <div className="inline-flex items-center gap-4 mb-4">
            <div
              className="w-8 h-px"
              style={{
                background:
                  "linear-gradient(90deg, var(--gold-primary), transparent)",
              }}
            />

            <p
              className="ori-type-system text-[10px] md:text-xs"
              style={{ color: "var(--gold-soft)" }}
            >
              Ficha da Cliente
            </p>
          </div>

          <h1
            className="ori-type-hero text-4xl md:text-5xl xl:text-[64px] mb-5"
            style={{
              color: "var(--gold-primary)",
              fontWeight: 600,
              letterSpacing: "-0.075em",
              textShadow: "0 0 42px rgba(242,185,104,0.12)",
            }}
          >
            {cliente.nome || "Cliente sem nome"}
          </h1>

          <p
            className="ori-type-reading-soft text-base md:text-lg mb-6"
            style={{ color: "var(--text-soft)" }}
          >
            {cliente.email}
            {cliente.whatsapp ? (
              <>
                <br />
                {cliente.whatsapp}
              </>
            ) : null}
          </p>

          <div className="flex flex-wrap gap-2.5">
            {chips.map((item) => (
              <span
                key={item}
                className="ori-chip px-4 py-2 text-xs"
                data-state={item === "Admin" ? "revealed" : "active"}
                style={{
                  background: "rgba(255,255,255,0.028)",
                  border: "1px solid rgba(242,185,104,0.10)",
                  color: "rgba(255,245,235,0.70)",
                  backdropFilter: "blur(10px)",
                  WebkitBackdropFilter: "blur(10px)",
                }}
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      </section>

      <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        {[
          ["Resultado", cliente.resultado || "Sem resultado"],
          ["Produto atual", produtoAtual],
          ["Status", etapaAtual],
          ["Cadastro", formatDate(cliente.created_at)],
        ].map(([label, value]) => (
          <div
            key={label}
            className="ori-card-secondary relative overflow-hidden rounded-[24px] p-5 cinematic-card"
            style={{
              background:
                "linear-gradient(180deg, rgba(18,9,10,0.72), rgba(7,3,4,0.88))",
              border: "1px solid rgba(242,185,104,0.10)",
              boxShadow: "inset 0 0 34px rgba(255,255,255,0.012)",
            }}
          >
            <p
              className="ori-type-system text-[9px] mb-3"
              style={{ color: "var(--gold-soft)" }}
            >
              {label}
            </p>

            <h2
              className="ori-type-revelation text-xl md:text-2xl"
              style={{
                color: "var(--gold-primary)",
                fontWeight: 600,
                letterSpacing: "-0.045em",
              }}
            >
              {value}
            </h2>
          </div>
        ))}
      </div>

      <section
        className="ori-main-frame ori-card-secondary relative overflow-hidden rounded-[30px] mb-8 cinematic-card"
        style={{
          background:
            "linear-gradient(180deg, rgba(18,9,10,0.72), rgba(7,3,4,0.88))",
          border: "1px solid rgba(242,185,104,0.10)",
          backdropFilter: "blur(14px)",
          WebkitBackdropFilter: "blur(14px)",
        }}
      >
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.024]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(242,185,104,0.18) 1px, transparent 1px), linear-gradient(90deg, rgba(242,185,104,0.08) 1px, transparent 1px)",
            backgroundSize: "58px 58px",
          }}
        />

        <div className="relative z-10">
          <button
            type="button"
            onClick={() => setPerfilAberto((current) => !current)}
            className="w-full text-left p-6 md:p-7"
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
              <div>
                <div className="inline-flex items-center gap-4 mb-4">
                  <div
                    className="w-8 h-px"
                    style={{
                      background:
                        "linear-gradient(90deg, var(--gold-primary), transparent)",
                    }}
                  />

                  <p
                    className="ori-type-system text-[10px] md:text-xs"
                    style={{ color: "var(--gold-soft)" }}
                  >
                    Perfil de Entrada ORI
                  </p>
                </div>

                <h2
                  className="ori-type-revelation text-2xl md:text-3xl mb-2"
                  style={{
                    color: "var(--gold-primary)",
                    fontWeight: 620,
                    letterSpacing: "-0.05em",
                  }}
                >
                  Respostas do perfil inicial
                </h2>

                <p
                  className="ori-type-reading-soft text-sm md:text-base"
                  style={{ color: "rgba(255,245,235,0.62)" }}
                >
                  {onboardingSummary}
                </p>
              </div>

              <div
                className="ori-pill inline-flex w-fit items-center justify-center px-5 py-2.5 text-xs uppercase tracking-[0.18em]"
                data-state={onboardingCompleted ? "revealed" : "sealed"}
                style={{
                  background: onboardingCompleted
                    ? "rgba(242,185,104,0.085)"
                    : "rgba(255,255,255,0.026)",
                  border: onboardingCompleted
                    ? "1px solid rgba(242,185,104,0.16)"
                    : "1px solid rgba(255,255,255,0.08)",
                  color: onboardingCompleted
                    ? "var(--gold-primary)"
                    : "rgba(255,245,235,0.54)",
                }}
              >
                {perfilAberto ? "Ocultar respostas" : "Ver respostas"}
              </div>
            </div>
          </button>

          {perfilAberto && (
            <div className="px-7 md:px-8 pb-7 md:pb-8">
              {onboardingItems.length > 0 ? (
                <div className="grid md:grid-cols-2 gap-3">
                  {onboardingItems.map(([label, value]) => (
                    <div
                      key={label}
                      className="ori-card-secondary rounded-[22px] p-4"
                      style={{
                        background: "rgba(255,255,255,0.024)",
                        border: "1px solid rgba(242,185,104,0.08)",
                        boxShadow: "inset 0 0 18px rgba(255,255,255,0.006)",
                      }}
                    >
                      <p
                        className="ori-type-system text-[8px] mb-2"
                        style={{ color: "rgba(242,185,104,0.72)" }}
                      >
                        {label}
                      </p>

                      <p
                        className="ori-type-reading-soft text-sm"
                        style={{ color: "rgba(255,245,235,0.74)" }}
                      >
                        {value}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm" style={{ color: "var(--text-soft)" }}>
                  Perfil de entrada ainda não preenchido por esta cliente.
                </p>
              )}

              {!onboardingCompleted && onboardingItems.length > 0 && (
                <p
                  className="mt-4 text-xs leading-relaxed"
                  style={{ color: "rgba(255,245,235,0.48)" }}
                >
                  Existem dados salvos, mas o perfil ainda não foi marcado como
                  concluído.
                </p>
              )}
            </div>
          )}
        </div>
      </section>

      <div className="grid xl:grid-cols-[1.1fr_0.9fr] gap-8 mb-8">
        <div
          className="ori-card-secondary relative overflow-hidden rounded-[30px] p-6 md:p-7 cinematic-card"
          style={{
            background:
              "linear-gradient(180deg, rgba(18,9,10,0.72), rgba(7,3,4,0.88))",
            border: "1px solid rgba(242,185,104,0.10)",
            backdropFilter: "blur(14px)",
            WebkitBackdropFilter: "blur(14px)",
          }}
        >
          <div
            className="absolute inset-0 pointer-events-none opacity-[0.026]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(242,185,104,0.18) 1px, transparent 1px), linear-gradient(90deg, rgba(242,185,104,0.08) 1px, transparent 1px)",
              backgroundSize: "58px 58px",
            }}
          />

          <div className="relative z-10">
            <div className="inline-flex items-center gap-4 mb-7">
              <div
                className="w-8 h-px"
                style={{
                  background:
                    "linear-gradient(90deg, var(--gold-primary), transparent)",
                }}
              />

              <p
                className="ori-type-system text-[10px] md:text-xs"
                style={{ color: "var(--gold-soft)" }}
              >
                Timeline da Jornada
              </p>
            </div>

            <div className="space-y-5">
              {timeline.map((item, index) => (
                <div key={item.label} className="flex gap-5">
                  <div className="flex flex-col items-center">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-sm"
                      style={{
                        background: item.done
                          ? "var(--gold-primary)"
                          : "rgba(255,255,255,0.035)",
                        color: item.done ? "#090506" : "var(--text-muted)",
                        border: item.done
                          ? "none"
                          : "1px solid rgba(255,255,255,0.07)",
                        boxShadow: item.done
                          ? "0 0 26px rgba(242,185,104,0.14)"
                          : "none",
                      }}
                    >
                      {index + 1}
                    </div>

                    {index < timeline.length - 1 && (
                      <div
                        className="w-px h-10 mt-2"
                        style={{
                          background: item.done
                            ? "linear-gradient(180deg, rgba(242,185,104,0.42), transparent)"
                            : "linear-gradient(180deg, rgba(255,255,255,0.08), transparent)",
                        }}
                      />
                    )}
                  </div>

                  <div className="pt-1">
                    <h3
                      className="ori-type-revelation text-lg md:text-xl mb-2"
                      style={{
                        color: item.done
                          ? "var(--gold-primary)"
                          : "rgba(255,245,235,0.72)",
                        fontWeight: 600,
                        letterSpacing: "-0.035em",
                      }}
                    >
                      {item.label}
                    </h3>

                    <p
                      className="ori-type-reading-soft text-sm"
                      style={{ color: "var(--text-soft)" }}
                    >
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div
          className="ori-card-secondary relative overflow-hidden rounded-[30px] p-6 md:p-7 cinematic-card"
          style={{
            background:
              "linear-gradient(180deg, rgba(18,9,10,0.72), rgba(7,3,4,0.88))",
            border: "1px solid rgba(242,185,104,0.10)",
            backdropFilter: "blur(14px)",
            WebkitBackdropFilter: "blur(14px)",
          }}
        >
          <div className="inline-flex items-center gap-4 mb-7">
            <div
              className="w-8 h-px"
              style={{
                background:
                  "linear-gradient(90deg, var(--gold-primary), transparent)",
              }}
            />

            <p
              className="ori-type-system text-[10px] md:text-xs"
              style={{ color: "var(--gold-soft)" }}
            >
              Ações da Jornada
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <button
              disabled={saving}
              onClick={() =>
                updateCliente({
                  produto_2_liberado: !cliente.produto_2_liberado,
                  status_jornada: !cliente.produto_2_liberado
                    ? "Produto 2 liberado"
                    : cliente.resultado
                      ? "Produto 1 concluído"
                      : "Cadastro recebido",
                })
              }
              className="ori-button-secondary px-6 py-4 rounded-full font-medium disabled:opacity-60"
              style={{
                background: cliente.produto_2_liberado
                  ? "rgba(120,255,160,0.10)"
                  : "rgba(242,185,104,0.08)",
                border: cliente.produto_2_liberado
                  ? "1px solid rgba(120,255,160,0.16)"
                  : "1px solid rgba(242,185,104,0.14)",
                color: cliente.produto_2_liberado
                  ? "#9BE7AE"
                  : "var(--gold-primary)",
              }}
            >
              {cliente.produto_2_liberado
                ? "Dossiê ORI liberado"
                : "Liberar Dossiê ORI"}
            </button>

            <button
              disabled={saving}
              onClick={() =>
                updateCliente({
                  produto_3_liberado: !cliente.produto_3_liberado,
                  status_jornada: !cliente.produto_3_liberado
                    ? "Produto 3 liberado"
                    : cliente.produto_2_liberado
                      ? "Produto 2 liberado"
                      : cliente.resultado
                        ? "Produto 1 concluído"
                        : "Cadastro recebido",
                })
              }
              className="ori-button-secondary px-6 py-4 rounded-full font-medium disabled:opacity-60"
              style={{
                background: cliente.produto_3_liberado
                  ? "rgba(120,255,160,0.10)"
                  : "rgba(255,255,255,0.035)",
                border: cliente.produto_3_liberado
                  ? "1px solid rgba(120,255,160,0.16)"
                  : "1px solid rgba(255,255,255,0.07)",
                color: cliente.produto_3_liberado
                  ? "#9BE7AE"
                  : "rgba(255,245,235,0.66)",
              }}
            >
              {cliente.produto_3_liberado
                ? "Código Final liberado"
                : "Liberar Código Final"}
            </button>

            <button
              disabled={saving}
              onClick={() =>
                updateCliente({
                  status_jornada: "Dossiê enviado",
                })
              }
              className="ori-button-secondary px-6 py-4 rounded-full font-medium disabled:opacity-60"
              style={{
                background: "rgba(183,140,255,0.08)",
                border: "1px solid rgba(183,140,255,0.16)",
                color: "#d9bdff",
              }}
            >
              Marcar Dossiê enviado
            </button>

            <button
              disabled={saving}
              onClick={() =>
                updateCliente({
                  status_jornada: "Finalizado",
                })
              }
              className="ori-button-secondary px-6 py-4 rounded-full font-medium disabled:opacity-60"
              style={{
                background: "rgba(242,185,104,0.08)",
                border: "1px solid rgba(242,185,104,0.14)",
                color: "var(--gold-primary)",
              }}
            >
              Marcar como finalizado
            </button>

            <button
              disabled={saving}
              onClick={() =>
                updateCliente({
                  admin: !cliente.admin,
                })
              }
              className="ori-button-secondary px-6 py-4 rounded-full font-medium disabled:opacity-60"
              style={{
                background: cliente.admin
                  ? "rgba(183,140,255,0.12)"
                  : "rgba(255,255,255,0.035)",
                border: cliente.admin
                  ? "1px solid rgba(183,140,255,0.18)"
                  : "1px solid rgba(255,255,255,0.07)",
                color: cliente.admin ? "#d9bdff" : "rgba(255,245,235,0.66)",
              }}
            >
              {cliente.admin ? "Remover admin" : "Tornar admin"}
            </button>
          </div>
        </div>
      </div>

      <div
        className="ori-card-secondary relative overflow-hidden rounded-[30px] p-6 md:p-7 cinematic-card"
        style={{
          background:
            "linear-gradient(180deg, rgba(18,9,10,0.72), rgba(7,3,4,0.88))",
          border: "1px solid rgba(242,185,104,0.10)",
          backdropFilter: "blur(14px)",
          WebkitBackdropFilter: "blur(14px)",
        }}
      >
        <div className="inline-flex items-center gap-4 mb-6">
          <div
            className="w-8 h-px"
            style={{
              background:
                "linear-gradient(90deg, var(--gold-primary), transparent)",
            }}
          />

          <p
            className="ori-type-system text-[10px] md:text-xs"
            style={{ color: "var(--gold-soft)" }}
          >
            Observações Internas
          </p>
        </div>

        <textarea
          value={observacoes}
          onChange={(event) => setObservacoes(event.target.value)}
          placeholder="Escreva observações privadas sobre esta cliente, ajustes, próximas entregas, preferências ou pontos de atenção..."
          className="w-full min-h-[220px] rounded-[26px] p-6 outline-none resize-y"
          style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(242,185,104,0.12)",
            color: "var(--text-primary)",
            lineHeight: 1.8,
          }}
        />

        <button
          disabled={saving}
          onClick={handleSalvarObservacoes}
          className="ori-journey-action mt-6 px-8 py-4 rounded-full font-medium disabled:opacity-60"
          style={{
            background: "var(--gold-primary)",
            color: "#090506",
            boxShadow: "0 0 50px rgba(242,185,104,0.14)",
          }}
        >
          {saving ? "Salvando..." : "Salvar observações"}
        </button>
      </div>
    </div>
  );
}

export default AdminClienteDetalhe;
