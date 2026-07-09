function SyncNotice({ message, label = "Atualizando sua jornada" }) {
  if (!message) return null;

  return (
    <div
      className="ori-card-secondary mb-4 rounded-[18px] px-4 py-3 md:mb-5 md:px-5"
      role="status"
      aria-live="polite"
      style={{
        background:
          "linear-gradient(90deg, rgba(242,185,104,0.055), rgba(255,255,255,0.014))",
        border: "1px solid rgba(242,185,104,0.11)",
      }}
    >
      <p
        className="ori-type-system ori-label-sm mb-1"
        style={{ color: "var(--gold-soft)" }}
      >
        {label}
      </p>
      <p
        className="ori-type-reading-soft text-xs leading-relaxed md:text-sm"
        style={{ color: "rgba(255,245,235,0.68)" }}
      >
        {message}
      </p>
    </div>
  );
}

export default SyncNotice;
