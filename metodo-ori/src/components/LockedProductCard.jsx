import { Link } from "react-router-dom";

function LockedProductCard({
  titulo,
  subtitulo,
  descricao,
  desbloqueio,
  link = "/produto-1",
}) {
  return (
    <section
      className="ori-card-teaser relative overflow-hidden rounded-[22px] p-4 md:rounded-[44px] md:p-12"
      data-state="sealed"
      style={{
        background:
          "radial-gradient(circle at top right, rgba(242,185,104,0.08), transparent 35%), linear-gradient(180deg, rgba(18,9,10,0.98), rgba(5,2,2,1))",
        border: "1px solid var(--border-primary)",
        boxShadow: "0 0 90px rgba(242,185,104,0.05)",
      }}
    >
      <p
        className="ori-type-system text-[9px] md:text-xs mb-3 md:mb-5"
        style={{ color: "var(--gold-soft)" }}
      >
        Acesso ainda não liberado
      </p>

      <h1
        className="ori-type-hero text-3xl md:text-5xl font-semibold mb-3 md:mb-5"
        style={{ color: "var(--gold-primary)" }}
      >
        {titulo}
      </h1>

      <p className="ori-type-revelation text-lg md:text-2xl mb-4 md:mb-8" style={{ color: "var(--text-primary)" }}>
        {subtitulo}
      </p>

      <p
        className="ori-mobile-preview-3 ori-type-reading-soft text-sm md:text-xl max-w-4xl mb-5 md:mb-10"
        style={{ color: "var(--text-soft)" }}
      >
        {descricao}
      </p>

      <div
        className="ori-card-secondary p-3.5 md:p-6 rounded-[18px] md:rounded-[28px] mb-5 md:mb-10"
        style={{
          background: "rgba(242,185,104,0.05)",
          border: "1px solid rgba(242,185,104,0.12)",
        }}
      >
        <p style={{ color: "var(--text-soft)" }}>{desbloqueio}</p>
      </div>

      <Link
        to={link}
        className="ori-journey-action inline-flex justify-center rounded-full px-6 py-3 font-medium md:px-8 md:py-4"
        style={{
          background: "var(--gold-primary)",
          color: "#090506",
        }}
      >
        Voltar para a primeira leitura
      </Link>
    </section>
  );
}

export default LockedProductCard;
