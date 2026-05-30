import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

import { getAdminClientes, updateAdminCliente } from "../services/api";
import { getAdminClientPriority } from "../utils/adminClientPriority";
import {
  FEEDBACK_LABELS,
  getFeedbackBridge,
  getFeedbackInsight,
} from "../utils/feedbackInsights";

function AdminClientes() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [clientes, setClientes] = useState([]);
  const [respostasProduto1, setRespostasProduto1] = useState([]);
  const [cartasOraculo, setCartasOraculo] = useState([]);
  const [feedbacksProduto1, setFeedbacksProduto1] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [busca, setBusca] = useState("");
  const filtro = searchParams.get("filtro") || "todos";

  const fetchClientes = useCallback(async () => {
    setLoading(true);

    try {
      const data = await getAdminClientes();
      setClientes(data.clientes || []);
      setRespostasProduto1(data.respostas_produto1 || []);
      setCartasOraculo(data.cartas_oraculo || []);
      setFeedbacksProduto1(data.feedbacks_produto1 || []);
    } catch (error) {
      console.log("Erro ao buscar clientes:", error);
      setClientes([]);
      setRespostasProduto1([]);
      setCartasOraculo([]);
      setFeedbacksProduto1([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    Promise.resolve().then(fetchClientes);
  }, [fetchClientes]);

  const handleFiltroChange = (value) => {
    if (value === "todos") {
      setSearchParams({});
      return;
    }

    setSearchParams({ filtro: value });
  };

  const updateCliente = async (cliente, updates) => {
    setUpdatingId(cliente.id);

    try {
      await updateAdminCliente(cliente.id, updates);
    } catch (error) {
      console.log("Erro ao atualizar cliente:", error);
    }

    await fetchClientes();
    setUpdatingId(null);
  };

  const toggleProduto2 = async (cliente) => {
    const novoValor = !cliente.produto_2_liberado;

    await updateCliente(cliente, {
      produto_2_liberado: novoValor,
      status_jornada: novoValor
        ? "Dossiê ORI liberado"
        : cliente.resultado
          ? "Código das Deusas concluído"
          : "Cadastro recebido",
    });
  };

  const toggleProduto3 = async (cliente) => {
    const novoValor = !cliente.produto_3_liberado;

    await updateCliente(cliente, {
      produto_3_liberado: novoValor,
      status_jornada: novoValor
        ? "Código Final liberado"
        : cliente.produto_2_liberado
          ? "Dossiê ORI liberado"
          : cliente.resultado
            ? "Código das Deusas concluído"
            : "Cadastro recebido",
    });
  };

  const formatDate = (date) => {
    if (!date) return "Sem data";

    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(new Date(date));
  };

  const getProdutoAtual = (cliente) => {
    if (cliente.produto_3_liberado) return "Código Final";
    if (cliente.produto_2_liberado) return "Dossiê ORI";
    if (cliente.resultado) return "Código das Deusas concluído";
    return "Lead / Código das Deusas";
  };

  const respostasPorUser = useMemo(
    () =>
      new Map(
        respostasProduto1.map((resposta) => [resposta.user_id, resposta]),
      ),
    [respostasProduto1],
  );

  const oraculoPorUser = useMemo(() => {
    const map = new Map();

    cartasOraculo.forEach((carta) => {
      if (!map.has(carta.user_id)) {
        map.set(carta.user_id, carta);
      }
    });

    return map;
  }, [cartasOraculo]);
  const feedbackPorUser = useMemo(() => {
    const map = new Map();

    feedbacksProduto1.forEach((feedback) => {
      if (!map.has(feedback.user_id)) {
        map.set(feedback.user_id, feedback);
      }
    });

    return map;
  }, [feedbacksProduto1]);

  const getProduto1Progress = (cliente) => {
    const resposta = respostasPorUser.get(cliente.user_id);

    if (!resposta) return null;

    return Math.round(
      ((resposta.answered_count || 0) / (resposta.total_questions || 36)) *
        100,
    );
  };

  const clientesFiltrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();

    return clientes
      .filter((cliente) => {
        const matchBusca =
          !termo ||
          cliente.nome?.toLowerCase().includes(termo) ||
          cliente.email?.toLowerCase().includes(termo) ||
          cliente.resultado?.toLowerCase().includes(termo) ||
          cliente.status_jornada?.toLowerCase().includes(termo);

        const matchFiltro =
          filtro === "todos" ||
          (filtro === "leads" && !cliente.resultado) ||
          (filtro === "andamento" &&
            respostasPorUser.get(cliente.user_id) &&
            !respostasPorUser.get(cliente.user_id)?.is_complete) ||
          (filtro === "produto1" && Boolean(cliente.resultado)) ||
          (filtro === "produto2" && Boolean(cliente.produto_2_liberado)) ||
          (filtro === "produto3" && Boolean(cliente.produto_3_liberado)) ||
          (filtro === "oraculo" && Boolean(oraculoPorUser.get(cliente.user_id))) ||
          (filtro === "atencao" &&
            getAdminClientPriority({
              cliente,
              resposta: respostasPorUser.get(cliente.user_id),
              feedback: feedbackPorUser.get(cliente.user_id),
              oraculoCarta: oraculoPorUser.get(cliente.user_id),
            }).score >= 72) ||
          (filtro === "feedback_vista" &&
            feedbackPorUser.get(cliente.user_id)?.response === "me_senti_vista") ||
          (filtro === "feedback_abstrato" &&
            feedbackPorUser.get(cliente.user_id)?.response ===
              "fez_sentido_mas_abstrato") ||
          (filtro === "feedback_risco" &&
            feedbackPorUser.get(cliente.user_id)?.response ===
              "nao_me_reconheci") ||
          (filtro === "admins" && Boolean(cliente.admin));

        return matchBusca && matchFiltro;
      })
      .sort((a, b) => {
        if (filtro !== "atencao") return 0;

        const priorityA = getAdminClientPriority({
          cliente: a,
          resposta: respostasPorUser.get(a.user_id),
          feedback: feedbackPorUser.get(a.user_id),
          oraculoCarta: oraculoPorUser.get(a.user_id),
        });
        const priorityB = getAdminClientPriority({
          cliente: b,
          resposta: respostasPorUser.get(b.user_id),
          feedback: feedbackPorUser.get(b.user_id),
          oraculoCarta: oraculoPorUser.get(b.user_id),
        });

        return priorityB.score - priorityA.score;
      });
  }, [clientes, busca, feedbackPorUser, filtro, oraculoPorUser, respostasPorUser]);

  const resumo = useMemo(() => {
    return {
      total: clientes.length,
      leads: clientes.filter((cliente) => !cliente.resultado).length,
      andamento: clientes.filter((cliente) => {
        const resposta = respostasPorUser.get(cliente.user_id);
        return resposta && !resposta.is_complete;
      }).length,
      produto1: clientes.filter((cliente) => Boolean(cliente.resultado)).length,
      oraculo: clientes.filter((cliente) =>
        Boolean(oraculoPorUser.get(cliente.user_id)),
      ).length,
      produto2: clientes.filter((cliente) =>
        Boolean(cliente.produto_2_liberado),
      ).length,
      produto3: clientes.filter((cliente) =>
        Boolean(cliente.produto_3_liberado),
      ).length,
      atencao: clientes.filter(
        (cliente) =>
          getAdminClientPriority({
            cliente,
            resposta: respostasPorUser.get(cliente.user_id),
            feedback: feedbackPorUser.get(cliente.user_id),
            oraculoCarta: oraculoPorUser.get(cliente.user_id),
          }).score >= 72,
      ).length,
      feedbacks: feedbacksProduto1.length,
    };
  }, [
    clientes,
    feedbackPorUser,
    feedbacksProduto1.length,
    oraculoPorUser,
    respostasPorUser,
  ]);

  const filtros = [
    ["todos", "Todos"],
    ["leads", "Leads"],
    ["andamento", "Em andamento"],
    ["produto1", "Código das Deusas"],
    ["produto2", "Dossiê ORI"],
    ["produto3", "Código Final"],
    ["oraculo", "Com Oráculo"],
    ["atencao", "Atenção agora"],
    ["feedback_vista", "Alta aderência"],
    ["feedback_abstrato", "Abstrato"],
    ["feedback_risco", "Risco"],
    ["admins", "Admins"],
  ];

  if (loading) {
    return (
      <div
        className="ori-main-frame ori-card-protagonist relative overflow-hidden rounded-[24px] md:rounded-[42px] p-4 md:p-10 cinematic-card"
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
          Painel Administrativo
        </p>

        <h1
          className="ori-type-hero text-4xl md:text-5xl font-semibold"
          style={{
            color: "var(--gold-primary)",
            letterSpacing: "-0.05em",
          }}
        >
          Carregando clientes...
        </h1>
      </div>
    );
  }

  return (
    <div className="ori-atmosphere ori-atmosphere-method relative overflow-hidden max-w-7xl">
      <div
        className="absolute top-[-220px] right-[-160px] w-[620px] h-[620px] rounded-full blur-3xl opacity-[0.08] pointer-events-none"
        style={{ background: "var(--gold-primary)" }}
      />

      <div className="relative z-10">
        <section
          className="ori-main-frame ori-hero-panel relative overflow-hidden rounded-[24px] md:rounded-[42px] p-4 md:p-9 xl:p-10 mb-5 md:mb-8 cinematic-card"
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
            <div className="inline-flex items-center gap-3 md:gap-4 mb-3 md:mb-4">
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
                Painel Administrativo
              </p>
            </div>

            <div className="flex flex-col xl:flex-row xl:items-end xl:justify-between gap-6">
              <div>
                <h1
                  className="ori-type-hero text-[34px] md:text-5xl xl:text-[64px] mb-3 md:mb-5"
                  style={{
                    color: "var(--gold-primary)",
                    fontWeight: 600,
                    letterSpacing: "-0.075em",
                    textShadow: "0 0 42px rgba(242,185,104,0.12)",
                  }}
                >
                  Clientes ORI
                </h1>

                <p
                  className="ori-mobile-preview-3 ori-type-reading-soft text-sm md:text-lg max-w-2xl"
                  style={{ color: "var(--text-soft)" }}
                >
                  Gestão de leads, acessos, liberações e jornadas simbólicas do
                  Método ORI.
                </p>
              </div>

              <button
                onClick={fetchClientes}
                className="ori-button-secondary w-fit px-5 py-3 rounded-full text-sm font-medium"
                style={{
                  background: "rgba(242,185,104,0.08)",
                  border: "1px solid rgba(242,185,104,0.14)",
                  color: "var(--gold-primary)",
                }}
              >
                Atualizar lista
              </button>
            </div>
          </div>
        </section>

        <div className="grid md:grid-cols-2 xl:grid-cols-5 gap-3 md:gap-4 mb-5 md:mb-7">
          {[
            ["Total", resumo.total],
            ["Atenção agora", resumo.atencao],
            ["Código das Deusas", resumo.produto1],
            ["Feedbacks", resumo.feedbacks],
            ["Dossiês", resumo.produto2],
          ].map(([label, value]) => (
            <div
              key={label}
              className="ori-card-secondary relative overflow-hidden rounded-[18px] md:rounded-[24px] p-3.5 md:p-5 cinematic-card"
              style={{
                background:
                  "linear-gradient(180deg, rgba(18,9,10,0.72), rgba(7,3,4,0.88))",
                border: "1px solid rgba(242,185,104,0.10)",
                boxShadow: "inset 0 0 34px rgba(255,255,255,0.012)",
              }}
            >
              <p
                className="ori-type-system text-[9px] mb-2 md:mb-3"
                style={{ color: "var(--gold-soft)" }}
              >
                {label}
              </p>

              <h2
                className="ori-type-revelation text-2xl md:text-4xl"
                style={{
                  color: "var(--gold-primary)",
                  fontWeight: 600,
                  letterSpacing: "-0.05em",
                }}
              >
                {value}
              </h2>
            </div>
          ))}
        </div>

        <div
          className="ori-main-frame ori-card-secondary relative overflow-hidden rounded-[20px] md:rounded-[26px] p-3.5 md:p-5 mb-5 md:mb-7 cinematic-card"
          style={{
            background:
              "linear-gradient(180deg, rgba(18,9,10,0.66), rgba(7,3,4,0.82))",
            border: "1px solid rgba(242,185,104,0.10)",
            backdropFilter: "blur(14px)",
            WebkitBackdropFilter: "blur(14px)",
          }}
        >
          <div className="flex flex-col xl:flex-row gap-4 xl:items-center xl:justify-between">
            <input
              value={busca}
              onChange={(event) => setBusca(event.target.value)}
              placeholder="Buscar por nome, e-mail, resultado ou status..."
              className="w-full xl:max-w-[460px] px-5 py-3.5 rounded-full outline-none text-sm"
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(242,185,104,0.10)",
                color: "var(--text-primary)",
              }}
            />

            <div className="flex flex-wrap gap-2">
              {filtros.map(([value, label]) => {
                const active = filtro === value;

                return (
                  <button
                    key={value}
                    onClick={() => handleFiltroChange(value)}
                    className="ori-tab px-4 py-2 rounded-full text-xs"
                    data-state={active ? "active" : "sealed"}
                    style={{
                      background: active
                        ? "rgba(242,185,104,0.12)"
                        : "rgba(255,255,255,0.026)",
                      border: active
                        ? "1px solid rgba(242,185,104,0.18)"
                        : "1px solid rgba(255,255,255,0.06)",
                      color: active
                        ? "var(--gold-primary)"
                        : "rgba(255,245,235,0.62)",
                    }}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {clientesFiltrados.length === 0 ? (
          <div
            className="ori-card-teaser rounded-[30px] p-8 cinematic-card"
            data-state="sealed"
            style={{
              background:
                "linear-gradient(180deg, rgba(18,9,10,0.72), rgba(7,3,4,0.88))",
              border: "1px solid rgba(242,185,104,0.10)",
            }}
          >
            <p style={{ color: "var(--text-soft)" }}>
              Nenhum cliente encontrado com esse filtro.
            </p>
          </div>
        ) : (
          <div className="grid gap-5">
            {clientesFiltrados.map((cliente) => {
              const produtoAtual = getProdutoAtual(cliente);
              const isUpdating = updatingId === cliente.id;
              const progress = getProduto1Progress(cliente);
              const oraculo = oraculoPorUser.get(cliente.user_id);
              const feedback = feedbackPorUser.get(cliente.user_id);
              const feedbackInsight = getFeedbackInsight(feedback);
              const feedbackBridge = getFeedbackBridge(feedback, cliente);
              const priority = getAdminClientPriority({
                cliente,
                resposta: respostasPorUser.get(cliente.user_id),
                feedback,
                oraculoCarta: oraculo,
              });
              const primaryContact =
                cliente.email || cliente.nome || "Cliente sem contato";

              return (
                <div
                  key={cliente.id}
                  className="ori-card-secondary group relative overflow-hidden rounded-[26px] p-5 md:p-6 cinematic-card"
                  style={{
                    background:
                      "linear-gradient(180deg, rgba(18,9,10,0.72), rgba(7,3,4,0.88))",
                    border: cliente.admin
                      ? "1px solid rgba(183,140,255,0.18)"
                      : "1px solid rgba(242,185,104,0.10)",
                    boxShadow: cliente.admin
                      ? "0 0 70px rgba(183,140,255,0.045), inset 0 0 34px rgba(183,140,255,0.022)"
                      : "0 0 70px rgba(242,185,104,0.035), inset 0 0 34px rgba(255,255,255,0.012)",
                  }}
                >
                  <div
                    className="absolute inset-0 opacity-[0.026] pointer-events-none"
                    style={{
                      backgroundImage:
                        "linear-gradient(rgba(242,185,104,0.18) 1px, transparent 1px), linear-gradient(90deg, rgba(242,185,104,0.08) 1px, transparent 1px)",
                      backgroundSize: "58px 58px",
                    }}
                  />

                  <div
                    className="absolute -top-24 -right-20 w-56 h-56 rounded-full blur-3xl opacity-[0.10] pointer-events-none"
                    style={{
                      background: cliente.admin
                        ? "rgba(183,140,255,0.42)"
                        : "rgba(242,185,104,0.38)",
                    }}
                  />

                  <div className="relative z-10 grid gap-7 xl:grid-cols-[1fr_auto] xl:items-start">
                    <div>
                      <div className="mb-4 flex flex-wrap items-center gap-3">
                        <p
                          className="ori-type-system text-[9px]"
                          style={{ color: "var(--gold-soft)" }}
                        >
                          {priority.label}
                        </p>

                        <span
                          className="ori-pill px-3 py-1 text-[11px]"
                          style={{
                            background: "rgba(255,255,255,0.026)",
                            border: "1px solid rgba(255,255,255,0.06)",
                            color: "rgba(255,245,235,0.58)",
                          }}
                        >
                          {formatDate(cliente.created_at)}
                        </span>

                        {cliente.admin && (
                          <span
                            className="ori-pill px-3 py-1 text-[11px]"
                            data-state="revealed"
                            style={{
                              background: "rgba(183,140,255,0.10)",
                              border: "1px solid rgba(183,140,255,0.16)",
                              color: "#d9bdff",
                            }}
                          >
                            Admin
                          </span>
                        )}
                      </div>

                      <h2
                        className="ori-type-revelation text-2xl md:text-3xl mb-2"
                        style={{
                          color: "var(--gold-primary)",
                          fontWeight: 600,
                          letterSpacing: "-0.045em",
                        }}
                      >
                        {cliente.nome || "Cliente sem nome"}
                      </h2>

                      <p
                        className="ori-type-reading-soft mb-4 text-sm md:text-base"
                        style={{ color: "var(--text-soft)" }}
                      >
                        {primaryContact}
                      </p>

                      <div
                        className="mb-4 rounded-[18px] p-4"
                        style={{
                          background: "rgba(242,185,104,0.045)",
                          border: "1px solid rgba(242,185,104,0.11)",
                        }}
                      >
                        <p
                          className="ori-type-reading-soft text-sm leading-relaxed"
                          style={{ color: "rgba(255,245,235,0.72)" }}
                        >
                          {priority.reason}
                        </p>
                        <p
                          className="ori-type-system mt-2 text-[8px]"
                          style={{ color: "var(--gold-soft)" }}
                        >
                          Próxima ação: {priority.action}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-2.5">
                        <div
                          className="ori-chip px-4 py-2 text-xs"
                          data-state={cliente.resultado ? "revealed" : "sealed"}
                          style={{
                            background: "rgba(242,185,104,0.08)",
                            border: "1px solid rgba(242,185,104,0.14)",
                            color: "var(--gold-primary)",
                          }}
                        >
                          {cliente.resultado || "Sem resultado"}
                        </div>

                        <div
                          className="ori-chip px-4 py-2 text-xs"
                          data-state={cliente.produto_2_liberado ? "done" : "sealed"}
                          style={{
                            background: cliente.produto_2_liberado
                              ? "rgba(120,255,160,0.08)"
                              : "rgba(255,255,255,0.025)",
                            border: cliente.produto_2_liberado
                              ? "1px solid rgba(120,255,160,0.14)"
                              : "1px solid rgba(255,255,255,0.06)",
                            color: cliente.produto_2_liberado
                              ? "#9BE7AE"
                              : "rgba(255,245,235,0.55)",
                          }}
                        >
                          {produtoAtual}
                        </div>

                        <div
                          className="ori-chip px-4 py-2 text-xs"
                          data-state={progress === 100 ? "done" : "active"}
                          style={{
                            background: "rgba(255,255,255,0.025)",
                            border: "1px solid rgba(242,185,104,0.08)",
                            color: "rgba(255,245,235,0.62)",
                          }}
                        >
                          {progress === null ? "Quiz não iniciado" : `Quiz ${progress}%`}
                        </div>

                        <div
                          className="ori-chip px-4 py-2 text-xs"
                          data-state={oraculo ? "revealed" : "sealed"}
                          style={{
                            background: oraculo
                              ? "rgba(183,140,255,0.08)"
                              : "rgba(255,255,255,0.025)",
                            border: oraculo
                              ? "1px solid rgba(183,140,255,0.14)"
                              : "1px solid rgba(255,255,255,0.06)",
                            color: oraculo ? "#d9bdff" : "rgba(255,245,235,0.55)",
                          }}
                        >
                          {oraculo ? `Oráculo ${formatDate(oraculo.date_key)}` : "Sem carta"}
                        </div>

                        <div
                          className="ori-chip px-4 py-2 text-xs"
                          data-state={feedback ? "revealed" : "sealed"}
                          style={{
                            background: feedback
                              ? "rgba(242,185,104,0.08)"
                              : "rgba(255,255,255,0.025)",
                            border: feedback
                              ? "1px solid rgba(242,185,104,0.14)"
                              : "1px solid rgba(255,255,255,0.06)",
                            color: feedback
                              ? "var(--gold-primary)"
                              : "rgba(255,245,235,0.55)",
                          }}
                        >
                          {feedback
                            ? FEEDBACK_LABELS[feedback.response] || feedback.response
                            : "Sem feedback"}
                        </div>
                      </div>

                      {feedback && (
                        <p
                          className="ori-type-reading-soft mt-2 text-xs leading-relaxed"
                          style={{ color: "rgba(255,245,235,0.54)" }}
                        >
                          {feedbackInsight.label} · Ponte: {feedbackBridge.title}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col md:flex-row xl:flex-col gap-3 xl:min-w-[220px]">
                      <Link
                        to={`/admin/clientes/${cliente.id}`}
                        className="ori-button-secondary inline-flex justify-center px-5 py-3 rounded-full text-sm font-medium"
                        style={{
                          background: "rgba(183,140,255,0.08)",
                          border: "1px solid rgba(183,140,255,0.16)",
                          color: "#d9bdff",
                        }}
                      >
                        Abrir ficha
                      </Link>

                      <button
                        disabled={isUpdating}
                        onClick={() => toggleProduto2(cliente)}
                        className="ori-button-secondary inline-flex justify-center px-5 py-3 rounded-full text-sm font-medium disabled:opacity-60"
                        style={{
                          background: cliente.produto_2_liberado
                            ? "rgba(120,255,160,0.10)"
                            : "rgba(242,185,104,0.075)",
                          border: cliente.produto_2_liberado
                            ? "1px solid rgba(120,255,160,0.16)"
                            : "1px solid rgba(242,185,104,0.13)",
                          color: cliente.produto_2_liberado
                            ? "#9BE7AE"
                            : "var(--gold-primary)",
                        }}
                      >
                        {cliente.produto_2_liberado
                          ? "Dossiê liberado"
                          : "Liberar Dossiê"}
                      </button>

                      <button
                        disabled={isUpdating}
                        onClick={() => toggleProduto3(cliente)}
                        className="ori-button-secondary inline-flex justify-center px-5 py-3 rounded-full text-sm font-medium disabled:opacity-60"
                        style={{
                          background: cliente.produto_3_liberado
                            ? "rgba(120,255,160,0.10)"
                            : "rgba(255,255,255,0.03)",
                          border: cliente.produto_3_liberado
                            ? "1px solid rgba(120,255,160,0.16)"
                            : "1px solid rgba(255,255,255,0.07)",
                          color: cliente.produto_3_liberado
                            ? "#9BE7AE"
                            : "rgba(255,245,235,0.64)",
                        }}
                      >
                        {cliente.produto_3_liberado
                          ? "Código liberado"
                          : "Liberar Código"}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminClientes;
