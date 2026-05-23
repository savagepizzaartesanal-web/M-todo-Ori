function ImageManual({ paleta, modelagem, tecidos, beleza, presenca, evitar }) {
  return (
    <section
      className="ori-card-protagonist relative overflow-hidden rounded-[44px] p-12"
      style={{
        background: "linear-gradient(180deg, rgba(16,8,9,0.98), rgba(5,2,2,1))",

        border: "1px solid var(--border-primary)",

        boxShadow: "0 0 90px rgba(242,185,104,0.05)",
      }}
    >
      <div
        className="absolute top-0 left-0 w-full h-px"
        style={{
          background:
            "linear-gradient(to right, transparent, rgba(242,185,104,0.5), transparent)",
        }}
      />

      <p
        className="ori-type-system text-xs mb-6"
        style={{ color: "var(--gold-soft)" }}
      >
        Manual de Imagem
      </p>

      <h2
        className="ori-type-revelation text-5xl font-semibold mb-14"
        style={{ color: "var(--gold-primary)" }}
      >
        Sua estética traduz sua essência.
      </h2>

      <div className="grid md:grid-cols-2 gap-10">
        <div>
          <h3
            className="ori-type-revelation text-2xl mb-4"
            style={{ color: "var(--gold-primary)" }}
          >
            Paleta
          </h3>

          <p
            className="ori-type-reading-soft text-lg whitespace-pre-line"
            style={{ color: "var(--text-soft)" }}
          >
            {paleta}
          </p>
        </div>

        <div>
          <h3
            className="ori-type-revelation text-2xl mb-4"
            style={{ color: "var(--gold-primary)" }}
          >
            Modelagem
          </h3>

          <p
            className="ori-type-reading-soft text-lg whitespace-pre-line"
            style={{ color: "var(--text-soft)" }}
          >
            {modelagem}
          </p>
        </div>

        <div>
          <h3
            className="ori-type-revelation text-2xl mb-4"
            style={{ color: "var(--gold-primary)" }}
          >
            Tecidos
          </h3>

          <p
            className="ori-type-reading-soft text-lg whitespace-pre-line"
            style={{ color: "var(--text-soft)" }}
          >
            {tecidos}
          </p>
        </div>

        <div>
          <h3
            className="ori-type-revelation text-2xl mb-4"
            style={{ color: "var(--gold-primary)" }}
          >
            Beleza
          </h3>

          <p
            className="ori-type-reading-soft text-lg whitespace-pre-line"
            style={{ color: "var(--text-soft)" }}
          >
            {beleza}
          </p>
        </div>
      </div>

      <div
        className="ori-card-secondary mt-12 p-8 rounded-[28px]"
        style={{
          background: "rgba(242,185,104,0.04)",
          border: "1px solid rgba(242,185,104,0.12)",
        }}
      >
        <h3 className="ori-type-revelation text-2xl mb-4" style={{ color: "var(--gold-primary)" }}>
          Presença
        </h3>

        <p
          className="ori-type-reading-soft text-lg whitespace-pre-line"
          style={{ color: "var(--text-soft)" }}
        >
          {presenca}
        </p>
      </div>

      <div
        className="ori-card-secondary mt-10 p-8 rounded-[28px]"
        style={{
          background: "rgba(120,20,20,0.12)",
          border: "1px solid rgba(255,120,120,0.1)",
        }}
      >
        <h3 className="ori-type-revelation text-2xl mb-4" style={{ color: "#d18b8b" }}>
          O que quebra sua essência
        </h3>

        <p
          className="ori-type-reading-soft text-lg whitespace-pre-line"
          style={{ color: "var(--text-soft)" }}
        >
          {evitar}
        </p>
      </div>
    </section>
  );
}

export default ImageManual;
