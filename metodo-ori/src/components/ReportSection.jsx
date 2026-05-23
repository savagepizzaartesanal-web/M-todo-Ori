function ReportSection({ eyebrow, title, content }) {
  return (
    <section
      className="ori-main-frame cinematic-card relative overflow-hidden rounded-[24px] md:rounded-[44px] p-4 md:p-12 fade-up"
      style={{
        background:
          "radial-gradient(circle at top right, rgba(242,185,104,0.055), transparent 34%), linear-gradient(180deg, rgba(18,9,10,0.98), rgba(7,3,4,1))",
        border: "1px solid var(--border-primary)",
        boxShadow: "0 0 80px rgba(242,185,104,0.045)",
      }}
    >
      <div
        className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100 pointer-events-none"
        style={{
          background:
            "radial-gradient(circle at top left, rgba(242,185,104,0.07), transparent 45%)",
        }}
      />

      <div
        className="absolute top-0 left-0 w-full h-px"
        style={{
          background:
            "linear-gradient(to right, transparent, rgba(242,185,104,0.42), transparent)",
        }}
      />

      <div className="relative z-10">
        <p
          className="uppercase tracking-[0.22em] md:tracking-[0.4em] text-[9px] md:text-xs mb-3 md:mb-6"
          style={{ color: "var(--gold-soft)" }}
        >
          {eyebrow}
        </p>

        <h3
          className="text-2xl md:text-4xl font-semibold mb-4 md:mb-10 leading-tight max-w-4xl"
          style={{
            color: "var(--gold-primary)",
            letterSpacing: "-0.035em",
          }}
        >
          {title}
        </h3>

        <div
          className="w-16 md:w-20 h-px mb-4 md:mb-8"
          style={{
            background:
              "linear-gradient(to right, var(--gold-primary), transparent)",
          }}
        />

        <p
          className="ori-mobile-preview-3 text-sm md:text-xl leading-relaxed md:leading-[1.9] whitespace-pre-line max-w-5xl"
          style={{ color: "var(--text-soft)" }}
        >
          {content}
        </p>
      </div>
    </section>
  );
}

export default ReportSection;
