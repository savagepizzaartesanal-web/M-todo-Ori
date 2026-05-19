function StatusCard({ status, progresso, onIniciar }) {
  return (
    <div
      className="relative overflow-hidden rounded-[40px] p-10 mb-12"
      style={{
        background:
          "linear-gradient(180deg, rgba(18,9,10,0.98), rgba(7,3,4,1))",

        border: "1px solid var(--border-primary)",

        boxShadow: "0 0 90px rgba(242,185,104,0.06)",
      }}
    >
      <div
        className="absolute top-0 left-0 w-full h-px"
        style={{
          background:
            "linear-gradient(to right, transparent, rgba(242,185,104,0.5), transparent)",
        }}
      />

      <div className="flex items-start justify-between gap-10">
        <div className="max-w-2xl">
          <p
            className="uppercase tracking-[0.4em] text-xs mb-5"
            style={{ color: "var(--gold-soft)" }}
          >
            Ritual de Diagnóstico
          </p>

          <h2
            className="text-5xl leading-none mb-6"
            style={{ color: "var(--gold-primary)" }}
          >
            {status}
          </h2>

          <p
            className="text-xl leading-relaxed"
            style={{ color: "var(--text-soft)" }}
          >
            Sua leitura arquetípica está sendo construída a partir da interseção
            entre presença, imagem, padrões emocionais e identidade simbólica.
          </p>
        </div>

        <div className="relative">
          <div
            className="w-36 h-36 rounded-full flex items-center justify-center"
            style={{
              border: "1px solid var(--border-primary)",
              background:
                "radial-gradient(circle, rgba(242,185,104,0.08), transparent)",
            }}
          >
            <div
              className="w-28 h-28 rounded-full flex items-center justify-center"
              style={{
                border: "1px solid rgba(242,185,104,0.18)",
              }}
            >
              <span
                className="text-3xl font-semibold"
                style={{ color: "var(--gold-primary)" }}
              >
                {progresso}%
              </span>
            </div>
          </div>
        </div>
      </div>

      <div
        className="w-full h-3 rounded-full overflow-hidden mt-12"
        style={{
          background: "#1a0d0e",
        }}
      >
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{
            width: `${progresso}%`,
            background:
              "linear-gradient(to right, var(--gold-muted), var(--gold-primary))",
          }}
        />
      </div>

      <button
        onClick={onIniciar}
        className="mt-10 px-8 py-4 rounded-full font-medium transition-all hover:scale-[1.02]"
        style={{
          background: "var(--gold-primary)",
          color: "#090506",
        }}
      >
        Iniciar Diagnóstico
      </button>
    </div>
  );
}

export default StatusCard;
