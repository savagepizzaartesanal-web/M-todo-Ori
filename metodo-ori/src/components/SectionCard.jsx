function SectionCard({ numero, titulo, descricao }) {
  return (
    <div
      className="ori-card-secondary relative overflow-hidden rounded-[22px] p-4 transition-all duration-500 hover:-translate-y-1 md:rounded-[36px] md:p-10"
      style={{
        background:
          "linear-gradient(180deg, rgba(18,9,10,0.96), rgba(10,5,6,0.98))",

        border: "1px solid var(--border-primary)",

        boxShadow: "0 0 60px rgba(242,185,104,0.05)",
      }}
    >
      <div
        className="absolute top-0 left-0 w-full h-px"
        style={{
          background:
            "linear-gradient(to right, transparent, rgba(242,185,104,0.4), transparent)",
        }}
      />

      <p
        className="ori-type-system ori-label-lg mb-3 md:mb-6"
        style={{
          color: "var(--gold-soft)",
        }}
      >
        Capítulo {numero}
      </p>

      <h2
        className="ori-type-revelation text-2xl mb-3 md:text-3xl md:mb-6"
        style={{
          color: "var(--gold-primary)",
        }}
      >
        {titulo}
      </h2>

      <p
        className="ori-mobile-preview-3 ori-type-reading-soft text-sm md:text-lg"
        style={{
          color: "var(--text-soft)",
        }}
      >
        {descricao}
      </p>

      <div className="mt-5 flex items-center gap-3 md:mt-10">
        <div
          className="w-2 h-2 rounded-full"
          style={{
            background: "var(--gold-primary)",
          }}
        />

        <div
          className="w-16 h-px"
          style={{
            background: "var(--border-primary)",
          }}
        />
      </div>
    </div>
  );
}

export default SectionCard;
