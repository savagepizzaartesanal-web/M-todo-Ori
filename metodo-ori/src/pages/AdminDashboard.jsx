import { Link } from "react-router-dom";

function AdminDashboard() {
  return (
    <div className="relative overflow-hidden max-w-7xl">
      <p
        className="uppercase tracking-[0.55em] text-xs mb-6"
        style={{ color: "var(--gold-soft)" }}
      >
        Estúdio ORI
      </p>

      <h1
        className="text-5xl md:text-7xl font-semibold mb-10"
        style={{ color: "var(--gold-primary)", letterSpacing: "-0.05em" }}
      >
        Painel Administrativo
      </h1>

      <p
        className="text-xl md:text-2xl leading-relaxed max-w-4xl mb-14"
        style={{ color: "var(--text-soft)" }}
      >
        Acompanhe clientes, leituras, entregas, aprovações e a evolução da
        jornada ORI.
      </p>

      <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-6 mb-12">
        {[
          ["Clientes ativos", "0"],
          ["Leituras concluídas", "0"],
          ["Dossiês pendentes", "0"],
          ["Aprovações", "0"],
        ].map(([label, value]) => (
          <div
            key={label}
            className="cinematic-card rounded-[32px] p-8"
            style={{
              background:
                "linear-gradient(180deg, rgba(18,9,10,0.98), rgba(7,3,4,1))",
              border: "1px solid var(--border-primary)",
            }}
          >
            <p
              className="uppercase tracking-[0.35em] text-[10px] mb-5"
              style={{ color: "var(--gold-soft)" }}
            >
              {label}
            </p>
            <h2
              className="text-5xl font-semibold"
              style={{ color: "var(--gold-primary)" }}
            >
              {value}
            </h2>
          </div>
        ))}
      </div>

      <Link
        to="/admin/clientes"
        className="inline-flex px-8 py-4 rounded-full font-medium transition-all hover:scale-[1.03]"
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
