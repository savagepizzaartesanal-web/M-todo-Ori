function SectionCard({ numero, titulo, descricao }) {
  return (
    <div
      className="relative overflow-hidden rounded-[36px] p-10 transition-all duration-500 hover:-translate-y-1"
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
        className="text-sm uppercase tracking-[0.35em] mb-6"
        style={{
          color: "var(--gold-soft)",
        }}
      >
        Capítulo {numero}
      </p>

      <h2
        className="text-3xl leading-tight mb-6"
        style={{
          color: "var(--gold-primary)",
        }}
      >
        {titulo}
      </h2>

      <p
        className="text-lg leading-relaxed"
        style={{
          color: "var(--text-soft)",
        }}
      >
        {descricao}
      </p>

      <div className="mt-10 flex items-center gap-3">
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
