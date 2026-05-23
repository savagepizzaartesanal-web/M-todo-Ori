function InfoCard({ titulo, valor, descricao }) {
  return (
    <div
      className="ori-card-secondary backdrop-blur-md rounded-[20px] p-4 transition-all duration-300 hover:scale-[1.01] md:rounded-[32px] md:p-8"
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border-primary)",
      }}
    >
      <p
        className="ori-type-system ori-label-md mb-2 md:mb-4"
        style={{
          color: "var(--gold-soft)",
        }}
      >
        {titulo}
      </p>

      <h2
        className="ori-type-revelation text-2xl mb-2 font-semibold md:text-4xl md:mb-4"
        style={{
          color: "var(--gold-primary)",
        }}
      >
        {valor}
      </h2>

      <p
        className="ori-mobile-preview ori-type-reading-soft text-sm md:text-base"
        style={{
          color: "var(--text-soft)",
        }}
      >
        {descricao}
      </p>
    </div>
  );
}

export default InfoCard;
