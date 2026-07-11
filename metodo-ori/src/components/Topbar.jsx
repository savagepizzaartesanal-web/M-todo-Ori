import { OriButton } from "./ui";

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

        <OriButton
          type="button"
          className="px-6 py-3 font-medium hover:scale-105"
        >
          Novo Diagnóstico
        </OriButton>
      </div>
    </header>
  );
}

export default Topbar;
