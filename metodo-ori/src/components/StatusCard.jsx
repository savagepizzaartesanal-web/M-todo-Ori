function StatusCard({ status, progresso, onIniciar }) {
  return (
    <div
      className="ori-card-protagonist relative overflow-hidden rounded-[24px] p-4 mb-6 md:rounded-[40px] md:p-10 md:mb-12"
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

      <div className="flex flex-col items-start justify-between gap-5 md:flex-row md:gap-10">
        <div className="max-w-2xl">
          <p
            className="ori-type-system ori-label-lg mb-3 md:mb-5"
            style={{ color: "var(--gold-soft)" }}
          >
            Leitura em andamento
          </p>

          <h2
            className="ori-type-revelation text-3xl mb-3 md:text-5xl md:mb-6"
            style={{ color: "var(--gold-primary)" }}
          >
            {status}
          </h2>

          <p
            className="ori-mobile-preview-3 ori-type-reading-soft text-sm md:text-xl"
            style={{ color: "var(--text-soft)" }}
          >
            Suas respostas estão organizando uma primeira leitura sobre imagem,
            desejos, padrões emocionais e formas de se proteger.
          </p>
        </div>

        <div className="relative">
          <div
            className="w-24 h-24 rounded-full flex items-center justify-center md:w-36 md:h-36"
            style={{
              border: "1px solid var(--border-primary)",
              background:
                "radial-gradient(circle, rgba(242,185,104,0.08), transparent)",
            }}
          >
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center md:w-28 md:h-28"
              style={{
                border: "1px solid rgba(242,185,104,0.18)",
              }}
            >
              <span
                className="text-2xl font-semibold md:text-3xl"
                style={{ color: "var(--gold-primary)" }}
              >
                {progresso}%
              </span>
            </div>
          </div>
        </div>
      </div>

      <div
        className="ori-progress w-full h-2 mt-6 md:h-3 md:mt-12"
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
        className="ori-journey-action mt-6 px-6 py-3 rounded-full font-medium md:mt-10 md:px-8 md:py-4"
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
