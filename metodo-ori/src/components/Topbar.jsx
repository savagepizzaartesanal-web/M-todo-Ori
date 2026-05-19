function Topbar() {
  return (
    <header className="flex items-center justify-between mb-14">
      <div>
        <p
          className="uppercase tracking-[0.3em] text-xs mb-3"
          style={{ color: "var(--gold-soft)" }}
        >
          Área da Cliente
        </p>

        <h2
          className="text-3xl font-semibold"
          style={{ color: "var(--text-primary)" }}
        >
          Bem-vinda, Helena.
        </h2>
      </div>

      <div className="flex items-center gap-4">
        <div
          className="px-5 py-3 rounded-full"
          style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border-primary)",
          }}
        >
          <p className="text-sm" style={{ color: "var(--gold-primary)" }}>
            Plano Premium
          </p>
        </div>

        <button
          className="px-6 py-3 rounded-full font-medium hover:scale-105 transition-all duration-300"
          style={{
            background: "var(--gold-primary)",
            color: "#090506",
          }}
        >
          Novo Diagnóstico
        </button>
      </div>
    </header>
  );
}

export default Topbar;
