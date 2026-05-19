import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { supabase } from "../lib/supabaseClient";

function AdminClientes() {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [busca, setBusca] = useState("");
  const [filtro, setFiltro] = useState("todos");

  useEffect(() => {
    fetchClientes();
  }, []);

  const fetchClientes = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("clientes")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.log("Erro ao buscar clientes:", error);
      setClientes([]);
    } else {
      setClientes(data || []);
    }

    setLoading(false);
  };

  const updateCliente = async (cliente, updates) => {
    setUpdatingId(cliente.id);

    const { error } = await supabase
      .from("clientes")
      .update(updates)
      .eq("id", cliente.id);

    if (error) {
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

  const clientesFiltrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();

    return clientes.filter((cliente) => {
      const matchBusca =
        !termo ||
        cliente.nome?.toLowerCase().includes(termo) ||
        cliente.email?.toLowerCase().includes(termo) ||
        cliente.resultado?.toLowerCase().includes(termo) ||
        cliente.status_jornada?.toLowerCase().includes(termo);

      const matchFiltro =
        filtro === "todos" ||
        (filtro === "leads" && !cliente.resultado) ||
        (filtro === "produto1" && Boolean(cliente.resultado)) ||
        (filtro === "produto2" && Boolean(cliente.produto_2_liberado)) ||
        (filtro === "produto3" && Boolean(cliente.produto_3_liberado)) ||
        (filtro === "admins" && Boolean(cliente.admin));

      return matchBusca && matchFiltro;
    });
  }, [clientes, busca, filtro]);

  const resumo = useMemo(() => {
    return {
      total: clientes.length,
      leads: clientes.filter((cliente) => !cliente.resultado).length,
      produto1: clientes.filter((cliente) => Boolean(cliente.resultado)).length,
      produto2: clientes.filter((cliente) =>
        Boolean(cliente.produto_2_liberado),
      ).length,
      produto3: clientes.filter((cliente) =>
        Boolean(cliente.produto_3_liberado),
      ).length,
    };
  }, [clientes]);

  const filtros = [
    ["todos", "Todos"],
    ["leads", "Leads"],
    ["produto1", "Código das Deusas"],
    ["produto2", "Dossiê ORI"],
    ["produto3", "Código Final"],
    ["admins", "Admins"],
  ];

  if (loading) {
    return (
      <div
        className="relative overflow-hidden rounded-[34px] md:rounded-[42px] p-8 md:p-10 cinematic-card"
        style={{
          background:
            "linear-gradient(135deg, rgba(18,9,10,0.88), rgba(5,2,2,0.96))",
          border: "1px solid rgba(242,185,104,0.14)",
          boxShadow:
            "0 0 90px rgba(242,185,104,0.055), inset 0 0 80px rgba(255,255,255,0.018)",
        }}
      >
        <p
          className="uppercase tracking-[0.45em] text-[10px] md:text-xs mb-5"
          style={{ color: "var(--gold-soft)" }}
        >
          Painel Administrativo
        </p>

        <h1
          className="text-4xl md:text-5xl font-semibold"
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
    <div className="relative overflow-hidden max-w-7xl">
      <div
        className="absolute top-[-220px] right-[-160px] w-[620px] h-[620px] rounded-full blur-3xl opacity-[0.08] pointer-events-none"
        style={{ background: "var(--gold-primary)" }}
      />

      <div className="relative z-10">
        <section
          className="relative overflow-hidden rounded-[34px] md:rounded-[42px] p-7 md:p-9 xl:p-10 mb-8 cinematic-card"
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
                className="uppercase tracking-[0.52em] text-[10px] md:text-xs"
                style={{ color: "var(--gold-soft)" }}
              >
                Painel Administrativo
              </p>
            </div>

            <div className="flex flex-col xl:flex-row xl:items-end xl:justify-between gap-6">
              <div>
                <h1
                  className="text-4xl md:text-5xl xl:text-[64px] leading-[0.94] mb-5"
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
                  className="text-base md:text-lg leading-relaxed max-w-2xl"
                  style={{ color: "var(--text-soft)" }}
                >
                  Gestão de leads, acessos, liberações e jornadas simbólicas do
                  Método ORI.
                </p>
              </div>

              <button
                onClick={fetchClientes}
                className="w-fit px-5 py-3 rounded-full text-sm font-medium transition-all hover:translate-x-1"
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

        <div className="grid md:grid-cols-2 xl:grid-cols-5 gap-4 mb-7">
          {[
            ["Total", resumo.total],
            ["Leads", resumo.leads],
            ["Código das Deusas", resumo.produto1],
            ["Dossiê ORI", resumo.produto2],
            ["Código Final", resumo.produto3],
          ].map(([label, value]) => (
            <div
              key={label}
              className="relative overflow-hidden rounded-[26px] p-5 cinematic-card"
              style={{
                background:
                  "linear-gradient(180deg, rgba(18,9,10,0.72), rgba(7,3,4,0.88))",
                border: "1px solid rgba(242,185,104,0.10)",
                boxShadow: "inset 0 0 34px rgba(255,255,255,0.012)",
              }}
            >
              <p
                className="uppercase tracking-[0.32em] text-[9px] mb-3"
                style={{ color: "var(--gold-soft)" }}
              >
                {label}
              </p>

              <h2
                className="text-3xl md:text-4xl leading-none"
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
          className="relative overflow-hidden rounded-[30px] p-5 md:p-6 mb-7 cinematic-card"
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
                    onClick={() => setFiltro(value)}
                    className="px-4 py-2 rounded-full text-xs transition-all hover:translate-y-[-1px]"
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
            className="rounded-[34px] p-8 cinematic-card"
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

              return (
                <div
                  key={cliente.id}
                  className="group relative overflow-hidden rounded-[30px] p-6 md:p-7 cinematic-card"
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

                  <div className="relative z-10 grid xl:grid-cols-[1fr_auto] gap-7 xl:items-center">
                    <div>
                      <div className="flex flex-wrap items-center gap-3 mb-4">
                        <p
                          className="uppercase tracking-[0.35em] text-[9px]"
                          style={{ color: "var(--gold-soft)" }}
                        >
                          Cliente
                        </p>

                        <span
                          className="px-3 py-1 rounded-full text-[11px]"
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
                            className="px-3 py-1 rounded-full text-[11px]"
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
                        className="text-2xl md:text-3xl mb-2 leading-tight"
                        style={{
                          color: "var(--gold-primary)",
                          fontWeight: 600,
                          letterSpacing: "-0.045em",
                        }}
                      >
                        {cliente.nome || "Cliente sem nome"}
                      </h2>

                      <p
                        className="text-sm md:text-base mb-5"
                        style={{ color: "var(--text-soft)" }}
                      >
                        {cliente.email}
                      </p>

                      <div className="flex flex-wrap gap-2.5">
                        <div
                          className="px-4 py-2 rounded-full text-xs"
                          style={{
                            background: "rgba(242,185,104,0.08)",
                            border: "1px solid rgba(242,185,104,0.14)",
                            color: "var(--gold-primary)",
                          }}
                        >
                          {cliente.resultado || "Sem resultado"}
                        </div>

                        <div
                          className="px-4 py-2 rounded-full text-xs"
                          style={{
                            background: "rgba(255,255,255,0.035)",
                            border: "1px solid rgba(255,255,255,0.07)",
                            color: "rgba(255,245,235,0.68)",
                          }}
                        >
                          {cliente.status_jornada || "Cadastro recebido"}
                        </div>

                        <div
                          className="px-4 py-2 rounded-full text-xs"
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
                      </div>
                    </div>

                    <div className="flex flex-col md:flex-row xl:flex-col gap-3 xl:min-w-[220px]">
                      <Link
                        to={`/admin/clientes/${cliente.id}`}
                        className="inline-flex justify-center px-5 py-3 rounded-full text-sm font-medium transition-all hover:translate-x-1"
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
                        className="inline-flex justify-center px-5 py-3 rounded-full text-sm font-medium transition-all hover:translate-x-1 disabled:opacity-60"
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
                        className="inline-flex justify-center px-5 py-3 rounded-full text-sm font-medium transition-all hover:translate-x-1 disabled:opacity-60"
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
