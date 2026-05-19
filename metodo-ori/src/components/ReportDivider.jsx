function ReportDivider({ text = "Matriz ORI" }) {
  return (
    <div className="relative my-8 md:my-10">
      <div
        className="
          relative
          overflow-hidden
          h-[42px]
          md:h-[46px]
          flex
          items-center
          justify-center
          px-6
          max-w-[940px]
          mx-auto
          rounded-full
        "
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(8,4,5,0.72) 18%, rgba(12,6,6,0.88) 50%, rgba(8,4,5,0.72) 82%, transparent)",
          border: "1px solid rgba(242,185,104,0.075)",
          boxShadow:
            "0 0 34px rgba(242,185,104,0.025), inset 0 0 24px rgba(242,185,104,0.018)",
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
        }}
      >
        <div
          className="absolute left-8 top-1/2 h-px w-[30%] -translate-y-1/2 pointer-events-none"
          style={{
            background:
              "linear-gradient(90deg, transparent, rgba(242,185,104,0.42))",
          }}
        />

        <div
          className="absolute right-8 top-1/2 h-px w-[30%] -translate-y-1/2 pointer-events-none"
          style={{
            background:
              "linear-gradient(90deg, rgba(242,185,104,0.42), transparent)",
          }}
        />

        <div
          className="absolute inset-0 pointer-events-none opacity-[0.018]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(242,185,104,0.18) 1px, transparent 1px), linear-gradient(90deg, rgba(242,185,104,0.08) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />

        <p
          className="
            relative
            z-10
            uppercase
            text-[10px]
            md:text-xs
            text-center
            whitespace-nowrap
            px-6
          "
          style={{
            color: "var(--gold-primary)",
            letterSpacing: "0.46em",
            textShadow: "0 0 18px rgba(242,185,104,0.18)",
            background:
              "linear-gradient(90deg, rgba(8,4,5,0.88), rgba(8,4,5,0.96), rgba(8,4,5,0.88))",
          }}
        >
          {text}
        </p>
      </div>
    </div>
  );
}

export default ReportDivider;
