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
      className="relative overflow-hidden rounded-[44px] p-12"
      style={{
        background:
          "radial-gradient(circle at top right, rgba(242,185,104,0.08), transparent 35%), linear-gradient(180deg, rgba(18,9,10,0.98), rgba(5,2,2,1))",
        border: "1px solid var(--border-primary)",
        boxShadow: "0 0 90px rgba(242,185,104,0.05)",
      }}
    >
      <p
        className="uppercase tracking-[0.45em] text-xs mb-5"
        style={{ color: "var(--gold-soft)" }}
      >
        Acesso Bloqueado
      </p>

      <h1
        className="text-5xl font-semibold mb-5"
        style={{ color: "var(--gold-primary)" }}
      >
        {titulo}
      </h1>

      <p className="text-2xl mb-8" style={{ color: "var(--text-primary)" }}>
        {subtitulo}
      </p>

      <p
        className="text-xl leading-relaxed max-w-4xl mb-10"
        style={{ color: "var(--text-soft)" }}
      >
        {descricao}
      </p>

      <div
        className="p-6 rounded-[28px] mb-10"
        style={{
          background: "rgba(242,185,104,0.05)",
          border: "1px solid rgba(242,185,104,0.12)",
        }}
      >
        <p style={{ color: "var(--text-soft)" }}>{desbloqueio}</p>
      </div>

      <Link
        to={link}
        className="inline-flex px-8 py-4 rounded-full font-medium transition-all hover:scale-[1.03]"
        style={{
          background: "var(--gold-primary)",
          color: "#090506",
        }}
      >
        Voltar para o Produto 1
      </Link>
    </section>
  );
}

export default LockedProductCard;
