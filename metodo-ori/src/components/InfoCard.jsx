function InfoCard({ titulo, valor, descricao }) {
  return (
    <div
      className="ori-card-secondary backdrop-blur-md rounded-[32px] p-8 transition-all duration-300 hover:scale-[1.01]"
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border-primary)",
      }}
    >
      <p
        className="ori-type-system ori-label-md mb-4"
        style={{
          color: "var(--gold-soft)",
        }}
      >
        {titulo}
      </p>

      <h2
        className="ori-type-revelation text-4xl mb-4 font-semibold"
        style={{
          color: "var(--gold-primary)",
        }}
      >
        {valor}
      </h2>

      <p
        className="ori-type-reading-soft"
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
