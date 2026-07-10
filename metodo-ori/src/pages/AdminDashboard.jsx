import { Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";

import { getAdminClientes } from "../services/api";
import { getAdminClientPriority } from "../utils/adminClientPriority";
import {
  FEEDBACK_LABELS,
  getFeedbackBridge,
  getFeedbackInsight,
} from "../utils/feedbackInsights";
import { OriBadge, OriButton, OriCard } from "../components/ui";

const formatPercent = (value) => `${Math.round(value || 0)}%`;

function AdminDashboard() {
  const [clientes, setClientes] = useState([]);
  const [respostasProduto1, setRespostasProduto1] = useState([]);
  const [cartasOraculo, setCartasOraculo] = useState([]);
  const [feedbacksProduto1, setFeedbacksProduto1] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function fetchResumo() {
      try {
        const data = await getAdminClientes();

        if (isMounted) {
          setClientes(data.clientes || []);
          setRespostasProduto1(data.respostas_produto1 || []);
          setCartasOraculo(data.cartas_oraculo || []);
          setFeedbacksProduto1(data.feedbacks_produto1 || []);
        }
      } catch (error) {
        console.log("Erro ao carregar resumo administrativo:", error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchResumo();

    return () => {
      isMounted = false;
    };
  }, []);

  const todayKey = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
  }).format(new Date());
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
  const clientePorUser = useMemo(
    () => new Map(clientes.map((cliente) => [cliente.user_id, cliente])),
    [clientes],
  );
  const feedbackPorUser = useMemo(() => {
    const map = new Map();

    feedbacksProduto1.forEach((feedback) => {
      if (!map.has(feedback.user_id)) {
        map.set(feedback.user_id, feedback);
      }
    });

    return map;
  }, [feedbacksProduto1]);
  const feedbackResumo = useMemo(() => {
    const counts = feedbacksProduto1.reduce(
      (acc, feedback) => ({
        ...acc,
        [feedback.response]: (acc[feedback.response] || 0) + 1,
      }),
      {},
    );
    const recentes = feedbacksProduto1
      .filter((feedback) => feedback.comment || feedback.response)
      .slice(0, 4);

    return {
      total: feedbacksProduto1.length,
      vista: counts.me_senti_vista || 0,
      abstrato: counts.fez_sentido_mas_abstrato || 0,
      naoReconheci: counts.nao_me_reconheci || 0,
      recentes,
    };
  }, [feedbacksProduto1]);

  const pilotoProduto1 = useMemo(() => {
    const leiturasConcluidas = clientes.filter((cliente) =>
      Boolean(cliente.resultado),
    ).length;
    const feedbacks = feedbacksProduto1.length;
    const taxaFeedback = leiturasConcluidas
      ? (feedbacks / leiturasConcluidas) * 100
      : 0;
    const taxaAderencia = feedbacks
      ? (feedbackResumo.vista / feedbacks) * 100
      : 0;
    const taxaAbstracao = feedbacks
      ? (feedbackResumo.abstrato / feedbacks) * 100
      : 0;
    const taxaRisco = feedbacks
      ? (feedbackResumo.naoReconheci / feedbacks) * 100
      : 0;

    let status = "Coletando sinais";
    let leitura =
      "Ainda precisamos de mais respostas para ler a validação com segurança.";
    let acao = "Priorizar clientes que concluíram a leitura e ainda não deram retorno.";

    if (feedbacks >= 3 && taxaAderencia >= 60 && taxaRisco <= 15) {
      status = "Produto validando bem";
      leitura =
        "A maioria das respostas indica reconhecimento. O Produto 1 está cumprindo a promessa de leitura inicial.";
      acao = "Manter o fluxo e observar onde a cliente pede aprofundamento.";
    } else if (feedbacks >= 3 && taxaAbstracao >= 35) {
      status = "Pedir mais clareza prática";
      leitura =
        "Há sinal de que a leitura toca, mas algumas clientes precisam enxergar melhor a aplicação concreta.";
      acao = "Reforçar exemplos de corpo, cor, cabelo, beleza e rotina antes do convite.";
    } else if (feedbacks >= 3 && taxaRisco >= 25) {
      status = "Revisar narrativa";
      leitura =
        "A taxa de não reconhecimento está alta para um protótipo de leitura simbólica.";
      acao = "Revisar perguntas, resultado e texto de transição antes de escalar.";
    }

    return {
      leiturasConcluidas,
      feedbacks,
      taxaFeedback,
      taxaAderencia,
      taxaAbstracao,
      taxaRisco,
      status,
      leitura,
      acao,
    };
  }, [clientes, feedbackResumo, feedbacksProduto1.length]);

  const resumo = useMemo(() => {
    const perfilCompleto = clientes.filter((cliente) =>
      Boolean(cliente.perfil_onboarding_concluido),
    ).length;
    const leituras = clientes.filter((cliente) => Boolean(cliente.resultado)).length;
    const quizEmAndamento = clientes.filter((cliente) => {
      const resposta = respostasPorUser.get(cliente.user_id);
      return resposta && !resposta.is_complete;
    }).length;
    const oraculoHoje = clientes.filter(
      (cliente) => oraculoPorUser.get(cliente.user_id)?.date_key === todayKey,
    ).length;
    const dossiesPendentes = clientes.filter(
      (cliente) =>
        Boolean(cliente.resultado) && !cliente.produto_2_liberado,
    ).length;

    return {
      clientes: clientes.length,
      perfilCompleto,
      leituras,
      quizEmAndamento,
      oraculoHoje,
      dossiesPendentes,
      final: clientes.filter((cliente) => Boolean(cliente.produto_3_liberado))
        .length,
    };
  }, [clientes, oraculoPorUser, respostasPorUser, todayKey]);

  const clientesAtencao = useMemo(
    () =>
      clientes
        .map((cliente) => {
          const resposta = respostasPorUser.get(cliente.user_id);
          const oraculo = oraculoPorUser.get(cliente.user_id);
          const feedback = feedbackPorUser.get(cliente.user_id);
          const priority = getAdminClientPriority({
            cliente,
            resposta,
            feedback,
            oraculoCarta: oraculo,
          });
          const progress = resposta
            ? Math.round(
                ((resposta.answered_count || 0) /
                  (resposta.total_questions || 36)) *
                  100,
              )
            : 0;
          return {
            ...cliente,
            progress,
            priority,
            oraculoDate: oraculo?.date_key || null,
          };
        })
        .sort((a, b) => b.priority.score - a.priority.score)
        .slice(0, 5),
    [clientes, feedbackPorUser, oraculoPorUser, respostasPorUser],
  );

  return (
    <div className="ori-atmosphere ori-atmosphere-method relative max-w-7xl overflow-hidden">
      <section
        className="ori-main-frame ori-hero-panel relative mb-5 overflow-hidden rounded-[24px] p-4 md:mb-7 md:rounded-[34px] md:p-8 cinematic-card"
        style={{
          background:
            "radial-gradient(circle at top right, rgba(242,185,104,0.12), transparent 34%), linear-gradient(135deg, rgba(18,9,10,0.88), rgba(5,2,2,0.96))",
          border: "1px solid rgba(242,185,104,0.14)",
        }}
      >
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="ori-type-system mb-3 text-[10px]" style={{ color: "var(--gold-soft)" }}>
              Estúdio ORI
            </p>
            <h1
              className="ori-type-hero mb-3 text-[34px] font-semibold md:text-6xl"
              style={{ color: "var(--gold-primary)", letterSpacing: "-0.05em" }}
            >
              Painel Administrativo
            </h1>
            <p
              className="ori-mobile-preview-3 ori-type-reading-soft max-w-3xl text-sm md:text-lg"
              style={{ color: "var(--text-soft)" }}
            >
              Acompanhe a validação do Produto 1 e decida quais clientes pedem
              abordagem agora.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <OriButton
              as={Link}
              to="/admin/clientes?filtro=atencao"
              variant="secondary"
              className="px-5 py-2.5 text-sm"
              style={{ color: "var(--gold-primary)" }}
            >
              Atenção agora
            </OriButton>
            <OriButton
              as={Link}
              to="/admin/clientes"
              variant="secondary"
              className="px-5 py-2.5 text-sm"
              style={{ color: "rgba(255,245,235,0.70)" }}
            >
              Lista completa
            </OriButton>
          </div>
        </div>
      </section>

      <div className="mb-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {[
          ["Clientes", loading ? "..." : resumo.clientes],
          ["Leituras concluídas", loading ? "..." : resumo.leituras],
          ["Feedbacks recebidos", loading ? "..." : pilotoProduto1.feedbacks],
          ["Dossiês a convidar", loading ? "..." : resumo.dossiesPendentes],
        ].map(([label, value]) => (
          <OriCard
            key={label}
            variant="secondary"
            padding="none"
            radius="md"
            className="ori-card-secondary rounded-[18px] p-4 md:rounded-[22px] md:p-5"
            style={{
              background: "linear-gradient(180deg, rgba(18,9,10,0.82), rgba(7,3,4,0.92))",
              border: "1px solid rgba(242,185,104,0.10)",
            }}
          >
            <p className="ori-type-system mb-2 text-[9px]" style={{ color: "var(--gold-soft)" }}>
              {label}
            </p>
            <h2
              className="ori-type-revelation text-3xl font-semibold"
              style={{ color: "var(--gold-primary)" }}
            >
              {value}
            </h2>
          </OriCard>
        ))}
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.08fr_0.92fr]">
        <section
          className="ori-main-frame ori-card-secondary rounded-[26px] p-4 md:p-7"
          style={{
            background:
              "linear-gradient(180deg, rgba(18,9,10,0.72), rgba(7,3,4,0.88))",
            border: "1px solid rgba(242,185,104,0.10)",
          }}
        >
          <p className="ori-type-system mb-2 text-[10px]" style={{ color: "var(--gold-soft)" }}>
            Validação do piloto
          </p>
          <h2
            className="ori-type-revelation mb-3 text-2xl md:text-3xl"
            style={{ color: "var(--gold-primary)", fontWeight: 620 }}
          >
            {pilotoProduto1.status}
          </h2>
          <p
            className="ori-type-reading-soft mb-5 text-sm leading-relaxed md:text-base"
            style={{ color: "rgba(255,245,235,0.68)" }}
          >
            {pilotoProduto1.leitura}
          </p>

          <div className="mb-5 grid gap-3 md:grid-cols-2">
            {[
              ["Taxa de feedback", formatPercent(pilotoProduto1.taxaFeedback)],
              ["Me senti vista", formatPercent(pilotoProduto1.taxaAderencia)],
              ["Ficou abstrato", formatPercent(pilotoProduto1.taxaAbstracao)],
              ["Não reconheci", formatPercent(pilotoProduto1.taxaRisco)],
            ].map(([label, value]) => (
              <div
                key={label}
                className="rounded-[18px] p-4"
                style={{
                  background: "rgba(255,255,255,0.024)",
                  border: "1px solid rgba(242,185,104,0.08)",
                }}
              >
                <p className="ori-type-system mb-2 text-[9px]" style={{ color: "var(--gold-soft)" }}>
                  {label}
                </p>
                <p
                  className="ori-type-revelation text-3xl"
                  style={{ color: "var(--gold-primary)", fontWeight: 620 }}
                >
                  {loading ? "..." : value}
                </p>
              </div>
            ))}
          </div>

          <div
            className="rounded-[18px] p-4"
            style={{
              background: "rgba(242,185,104,0.045)",
              border: "1px solid rgba(242,185,104,0.11)",
            }}
          >
            <p className="ori-type-system mb-2 text-[9px]" style={{ color: "var(--gold-soft)" }}>
              Próxima decisão
            </p>
            <p
              className="ori-type-reading-soft text-sm leading-relaxed"
              style={{ color: "rgba(255,245,235,0.72)" }}
            >
              {pilotoProduto1.acao}
            </p>
          </div>
        </section>

        <section
          className="ori-main-frame ori-card-secondary rounded-[26px] p-4 md:p-7"
          style={{
            background:
              "linear-gradient(180deg, rgba(18,9,10,0.72), rgba(7,3,4,0.88))",
            border: "1px solid rgba(242,185,104,0.10)",
          }}
        >
          <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="ori-type-system mb-2 text-[10px]" style={{ color: "var(--gold-soft)" }}>
                Ação
              </p>
              <h2
                className="ori-type-revelation text-2xl md:text-3xl"
                style={{ color: "var(--gold-primary)", fontWeight: 620 }}
              >
                Atenção agora
              </h2>
            </div>
            <OriButton
              as={Link}
              to="/admin/clientes?filtro=atencao"
              variant="secondary"
              className="w-fit px-5 py-2.5 text-sm"
              style={{ color: "var(--gold-primary)" }}
            >
              Ver todas
            </OriButton>
          </div>

          <div className="grid gap-3">
            {clientesAtencao.length > 0 ? (
              clientesAtencao.map((cliente) => (
                <Link
                  key={cliente.id}
                  to={`/admin/clientes/${cliente.id}`}
                  className="rounded-[18px] p-4"
                  style={{
                    background: "rgba(255,255,255,0.024)",
                    border: "1px solid rgba(242,185,104,0.08)",
                  }}
                >
                  <div className="mb-2 flex flex-col gap-1 md:flex-row md:items-start md:justify-between">
                    <div>
                      <p
                        className="ori-type-revelation text-lg"
                        style={{ color: "var(--gold-primary)", fontWeight: 600 }}
                      >
                        {cliente.nome || "Cliente sem nome"}
                      </p>
                      <p
                        className="ori-type-reading-soft text-xs"
                        style={{ color: "rgba(255,245,235,0.56)" }}
                      >
                        {cliente.email}
                      </p>
                    </div>
                    <OriBadge tone="gold" size="sm" className="ori-chip w-fit px-3 py-1 text-xs">
                      {cliente.priority.label}
                    </OriBadge>
                  </div>
                  <p
                    className="ori-type-reading-soft text-sm leading-relaxed"
                    style={{ color: "rgba(255,245,235,0.68)" }}
                  >
                    {cliente.priority.reason}
                  </p>
                  <p className="ori-type-system mt-2 text-[8px]" style={{ color: "var(--gold-soft)" }}>
                    {cliente.priority.action}
                  </p>
                </Link>
              ))
            ) : (
              <p className="ori-type-reading-soft text-sm" style={{ color: "var(--text-soft)" }}>
                Nenhuma cliente registrada ainda.
              </p>
            )}
          </div>
        </section>
      </div>

      <section
        className="ori-main-frame ori-card-secondary mt-5 rounded-[26px] p-4 md:p-7"
        style={{
          background:
            "linear-gradient(180deg, rgba(18,9,10,0.64), rgba(7,3,4,0.84))",
          border: "1px solid rgba(242,185,104,0.10)",
        }}
      >
        <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="ori-type-system mb-2 text-[10px]" style={{ color: "var(--gold-soft)" }}>
              Feedbacks pós-leitura
            </p>
            <h2
              className="ori-type-revelation text-2xl md:text-3xl"
              style={{ color: "var(--gold-primary)", fontWeight: 620 }}
            >
              Vozes recentes do Produto 1
            </h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {[
              ["Respostas", feedbackResumo.total],
              ["Vista", feedbackResumo.vista],
              ["Abstrato", feedbackResumo.abstrato],
              ["Risco", feedbackResumo.naoReconheci],
            ].map(([label, value]) => (
              <OriBadge key={label} tone={label === "Risco" ? "danger" : "gold"} size="sm" className="ori-chip px-3 py-1.5 text-xs">
                {label}: {loading ? "..." : value}
              </OriBadge>
            ))}
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          {feedbackResumo.recentes.length > 0 ? (
            feedbackResumo.recentes.map((feedback) => {
              const cliente = clientePorUser.get(feedback.user_id);
              const insight = getFeedbackInsight(feedback);
              const bridge = getFeedbackBridge(feedback, cliente);

              return (
                <Link
                  key={feedback.id}
                  to={cliente?.id ? `/admin/clientes/${cliente.id}` : "/admin/clientes"}
                  className="rounded-[18px] p-4"
                  style={{
                    background: "rgba(255,255,255,0.024)",
                    border: "1px solid rgba(242,185,104,0.08)",
                  }}
                >
                  <div className="mb-2 flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
                    <p
                      className="ori-type-revelation text-lg"
                      style={{ color: "var(--gold-primary)", fontWeight: 600 }}
                    >
                      {cliente?.nome || feedback.email || "Cliente"}
                    </p>
                    <OriBadge tone={feedback.response === "nao_me_reconheci" ? "danger" : "gold"} size="sm" className="ori-chip w-fit px-3 py-1 text-xs">
                      {FEEDBACK_LABELS[feedback.response] || feedback.response}
                    </OriBadge>
                  </div>
                  <p className="ori-type-system mb-2 text-[8px]" style={{ color: "var(--gold-soft)" }}>
                    {insight.label} · {insight.action}
                  </p>
                  <p
                    className="ori-type-reading-soft text-sm leading-relaxed"
                    style={{ color: "rgba(255,245,235,0.66)" }}
                  >
                    {feedback.comment || "Sem comentário aberto."}
                  </p>
                  <p
                    className="ori-type-reading-soft mt-2 text-xs leading-relaxed"
                    style={{ color: "rgba(255,245,235,0.52)" }}
                  >
                    Ponte sugerida: {bridge.title}
                  </p>
                </Link>
              );
            })
          ) : (
            <p className="ori-type-reading-soft text-sm" style={{ color: "var(--text-soft)" }}>
              Nenhum feedback registrado ainda.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}

export default AdminDashboard;
