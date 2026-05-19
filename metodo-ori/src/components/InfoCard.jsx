function InfoCard({ titulo, valor, descricao }) {
  return (
    <div
      className="backdrop-blur-md rounded-[32px] p-8 transition-all duration-300 hover:scale-[1.01]"
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border-primary)",
      }}
    >
      <p
        className="uppercase tracking-[0.2em] text-xs mb-4"
        style={{
          color: "var(--gold-soft)",
        }}
      >
        {titulo}
      </p>

      <h2
        className="text-4xl mb-4 font-semibold"
        style={{
          color: "var(--gold-primary)",
        }}
      >
        {valor}
      </h2>

      <p
        className="leading-relaxed"
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
