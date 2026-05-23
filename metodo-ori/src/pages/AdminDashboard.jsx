import { Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";

import { supabase } from "../lib/supabaseClient";

function AdminDashboard() {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function fetchResumo() {
      const { data, error } = await supabase
        .from("clientes")
        .select("resultado, produto_2_liberado, produto_3_liberado, status_jornada");

      if (error) {
        console.log("Erro ao carregar resumo administrativo:", error);
      }

      if (isMounted) {
        setClientes(data || []);
        setLoading(false);
      }
    }

    fetchResumo();

    return () => {
      isMounted = false;
    };
  }, []);

  const resumo = useMemo(
    () => ({
      clientes: clientes.length,
      leituras: clientes.filter((cliente) => Boolean(cliente.resultado)).length,
      dossies: clientes.filter(
        (cliente) =>
          Boolean(cliente.produto_2_liberado) &&
          cliente.status_jornada !== "Dossiê enviado",
      ).length,
      final: clientes.filter((cliente) => Boolean(cliente.produto_3_liberado))
        .length,
    }),
    [clientes],
  );

  return (
    <div className="ori-atmosphere ori-atmosphere-method relative overflow-hidden max-w-7xl">
      <section
        className="ori-main-frame ori-hero-panel relative overflow-hidden rounded-[34px] md:rounded-[42px] p-7 md:p-9 xl:p-10 mb-8 cinematic-card"
        style={{
          background:
            "radial-gradient(circle at top right, rgba(242,185,104,0.12), transparent 34%), linear-gradient(135deg, rgba(18,9,10,0.88), rgba(5,2,2,0.96))",
          border: "1px solid rgba(242,185,104,0.14)",
          boxShadow:
            "0 0 90px rgba(242,185,104,0.055), inset 0 0 80px rgba(255,255,255,0.018)",
        }}
      >
        <div className="ori-label-line mb-5">
          <p
            className="ori-type-system text-[10px] md:text-xs"
            style={{ color: "var(--gold-soft)" }}
          >
            Estúdio ORI
          </p>
        </div>

        <h1
          className="ori-type-hero text-5xl md:text-7xl font-semibold mb-6"
          style={{ color: "var(--gold-primary)", letterSpacing: "-0.05em" }}
        >
          Painel Administrativo
        </h1>

        <p
          className="ori-type-reading-soft text-lg md:text-xl max-w-4xl"
          style={{ color: "var(--text-soft)" }}
        >
          Acompanhe clientes, leituras, entregas, aprovações e a evolução da
          jornada ORI.
        </p>
      </section>

      <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-6 mb-12">
        {[
          ["Clientes ativos", loading ? "..." : resumo.clientes],
          ["Leituras concluídas", loading ? "..." : resumo.leituras],
          ["Dossiês pendentes", loading ? "..." : resumo.dossies],
          ["Código Final", loading ? "..." : resumo.final],
        ].map(([label, value]) => (
          <div
            key={label}
            className="ori-card-secondary cinematic-card rounded-[28px] p-6 md:p-7"
            style={{
              background:
                "linear-gradient(180deg, rgba(18,9,10,0.98), rgba(7,3,4,1))",
              border: "1px solid var(--border-primary)",
            }}
          >
            <p
              className="ori-type-system text-[10px] mb-5"
              style={{ color: "var(--gold-soft)" }}
            >
              {label}
            </p>
            <h2
              className="ori-type-revelation text-5xl font-semibold"
              style={{ color: "var(--gold-primary)" }}
            >
              {value}
            </h2>
          </div>
        ))}
      </div>

      <Link
        to="/admin/clientes"
        className="ori-journey-action inline-flex px-8 py-4 rounded-full font-medium"
        style={{
          background: "var(--gold-primary)",
          color: "#090506",
          boxShadow: "0 0 50px rgba(242,185,104,0.18)",
        }}
      >
        Ver clientes
      </Link>
    </div>
  );
}

export default AdminDashboard;
