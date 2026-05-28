import { Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";

import { getAdminClientes } from "../services/api";

function AdminDashboard() {
  const [clientes, setClientes] = useState([]);
  const [respostasProduto1, setRespostasProduto1] = useState([]);
  const [cartasOraculo, setCartasOraculo] = useState([]);
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
          const progress = resposta
            ? Math.round(
                ((resposta.answered_count || 0) /
                  (resposta.total_questions || 36)) *
                  100,
              )
            : 0;
          let signal = "Acompanhar entrada";

          if (!cliente.perfil_onboarding_concluido) {
            signal = "Perfil inicial pendente";
          } else if (resposta && !resposta.is_complete) {
            signal = `Quiz em andamento · ${progress}%`;
          } else if (cliente.resultado && !cliente.produto_2_liberado) {
            signal = "Pronta para convite ao Dossiê";
          } else if (cliente.produto_2_liberado && !cliente.produto_3_liberado) {
            signal = "Acompanhar Dossiê";
          } else if (cliente.produto_3_liberado) {
            signal = "Código Final liberado";
          }

          return {
            ...cliente,
            progress,
            signal,
            oraculoDate: oraculo?.date_key || null,
          };
        })
        .slice(0, 5),
    [clientes, oraculoPorUser, respostasPorUser],
  );

  return (
    <div className="ori-atmosphere ori-atmosphere-method relative overflow-hidden max-w-7xl">
      <section
        className="ori-main-frame ori-hero-panel relative overflow-hidden rounded-[24px] md:rounded-[42px] p-4 md:p-9 xl:p-10 mb-5 md:mb-8 cinematic-card"
        style={{
          background:
            "radial-gradient(circle at top right, rgba(242,185,104,0.12), transparent 34%), linear-gradient(135deg, rgba(18,9,10,0.88), rgba(5,2,2,0.96))",
          border: "1px solid rgba(242,185,104,0.14)",
          boxShadow:
            "0 0 90px rgba(242,185,104,0.055), inset 0 0 80px rgba(255,255,255,0.018)",
        }}
      >
        <div className="ori-label-line mb-3 md:mb-5">
          <p
            className="ori-type-system text-[10px] md:text-xs"
            style={{ color: "var(--gold-soft)" }}
          >
            Estúdio ORI
          </p>
        </div>

        <h1
          className="ori-type-hero text-[34px] md:text-7xl font-semibold mb-3 md:mb-6"
          style={{ color: "var(--gold-primary)", letterSpacing: "-0.05em" }}
        >
          Painel Administrativo
        </h1>

        <p
          className="ori-mobile-preview-3 ori-type-reading-soft text-sm md:text-xl max-w-4xl"
          style={{ color: "var(--text-soft)" }}
        >
          Acompanhe clientes, leituras, entregas, aprovações e a evolução da
          jornada ORI.
        </p>
      </section>

      <div className="grid md:grid-cols-2 xl:grid-cols-7 gap-3 md:gap-6 mb-5 md:mb-8">
        {[
          ["Clientes ativos", loading ? "..." : resumo.clientes],
          ["Perfis completos", loading ? "..." : resumo.perfilCompleto],
          ["Leituras concluídas", loading ? "..." : resumo.leituras],
          ["Oráculo hoje", loading ? "..." : resumo.oraculoHoje],
          ["Quiz em andamento", loading ? "..." : resumo.quizEmAndamento],
          ["Dossiês a convidar", loading ? "..." : resumo.dossiesPendentes],
          ["Código Final", loading ? "..." : resumo.final],
        ].map(([label, value]) => (
          <div
            key={label}
            className="ori-card-secondary cinematic-card rounded-[18px] md:rounded-[28px] p-3.5 md:p-7"
            style={{
              background:
                "linear-gradient(180deg, rgba(18,9,10,0.98), rgba(7,3,4,1))",
              border: "1px solid var(--border-primary)",
            }}
          >
            <p
              className="ori-type-system text-[9px] md:text-[10px] mb-2 md:mb-5"
              style={{ color: "var(--gold-soft)" }}
            >
              {label}
            </p>
            <h2
              className="ori-type-revelation text-3xl md:text-5xl font-semibold"
              style={{ color: "var(--gold-primary)" }}
            >
              {value}
            </h2>
          </div>
        ))}
      </div>

      <section
        className="ori-main-frame ori-card-secondary relative overflow-hidden rounded-[26px] p-4 md:p-7 mb-6 md:mb-8"
        style={{
          background:
            "linear-gradient(180deg, rgba(18,9,10,0.72), rgba(7,3,4,0.88))",
          border: "1px solid rgba(242,185,104,0.10)",
        }}
      >
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between mb-5">
          <div>
            <p
              className="ori-type-system text-[10px] mb-2"
              style={{ color: "var(--gold-soft)" }}
            >
              Monitoramento do piloto
            </p>
            <h2
              className="ori-type-revelation text-2xl md:text-3xl"
              style={{ color: "var(--gold-primary)", fontWeight: 620 }}
            >
              Clientes que pedem atenção agora
            </h2>
          </div>

          <Link
            to="/admin/clientes"
            className="ori-button-secondary inline-flex w-fit justify-center rounded-full px-5 py-2.5 text-sm"
            style={{ color: "var(--gold-primary)" }}
          >
            Ver lista completa
          </Link>
        </div>

        <div className="grid gap-3">
          {clientesAtencao.length > 0 ? (
            clientesAtencao.map((cliente) => (
              <Link
                key={cliente.id}
                to={`/admin/clientes/${cliente.id}`}
                className="ori-card-secondary grid gap-3 rounded-[18px] p-4 md:grid-cols-[1fr_auto] md:items-center"
                style={{
                  background: "rgba(255,255,255,0.024)",
                  border: "1px solid rgba(242,185,104,0.08)",
                }}
              >
                <div>
                  <p
                    className="ori-type-revelation text-xl"
                    style={{ color: "var(--gold-primary)", fontWeight: 600 }}
                  >
                    {cliente.nome || "Cliente sem nome"}
                  </p>
                  <p
                    className="ori-type-reading-soft text-sm"
                    style={{ color: "rgba(255,245,235,0.62)" }}
                  >
                    {cliente.email}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2 md:justify-end">
                  <span className="ori-chip px-3 py-1.5 text-xs">
                    {cliente.signal}
                  </span>
                  <span className="ori-chip px-3 py-1.5 text-xs">
                    Oráculo: {cliente.oraculoDate || "sem carta"}
                  </span>
                </div>
              </Link>
            ))
          ) : (
            <div
              className="ori-card-secondary rounded-[18px] p-4"
              style={{
                background: "rgba(255,255,255,0.024)",
                border: "1px solid rgba(242,185,104,0.08)",
              }}
            >
              <p className="ori-type-reading-soft text-sm" style={{ color: "var(--text-soft)" }}>
                Nenhuma cliente registrada ainda.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default AdminDashboard;
