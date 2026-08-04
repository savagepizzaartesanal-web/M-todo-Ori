import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

const DEFAULT_THEME = {
  accent: "var(--gold-primary)",
  soft: "var(--gold-soft)",
  glow: "rgba(242,185,104,0.18)",
  aura: "radial-gradient(circle at 12% 10%, rgba(242,185,104,0.12), transparent 32%)",
  symbol: "ORI",
};

function Eyebrow({ children, className = "" }) {
  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <span
        className="h-px w-7"
        style={{ background: "linear-gradient(90deg, var(--gold-primary), transparent)" }}
      />
      <p className="ori-type-system text-[9px] md:text-[10px]" style={{ color: "var(--gold-soft)" }}>
        {children}
      </p>
    </div>
  );
}

export default function OriReadingFrame({
  eyebrow = "Câmara de Leitura ORI",
  signalLabel,
  layerLabel,
  layerTitle,
  layerDescription,
  layerSymbol,
  progress = 0,
  layerProgress = 0,
  progressLabel = "Sinais registrados",
  layerProgressLabel = "desta camada",
  statusLabel,
  dots = [],
  theme = {},
  children,
  footer,
  className = "",
}) {
  const reduceMotion = useReducedMotion();
  const currentTheme = { ...DEFAULT_THEME, ...theme };
  const safeProgress = Math.max(0, Math.min(100, Math.round(progress || 0)));
  const safeLayerProgress = Math.max(0, Math.min(100, Math.round(layerProgress || 0)));

  return (
    <motion.section
      initial={reduceMotion ? false : { opacity: 0, y: 18, filter: "blur(8px)" }}
      animate={reduceMotion ? undefined : { opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
      className={`ori-quiz-mobile-shell relative mb-5 flex min-h-[auto] items-center overflow-hidden rounded-[22px] p-2.5 md:min-h-[620px] md:rounded-[32px] md:p-4 xl:p-5 ${className}`}
      style={{
        background: `${currentTheme.aura}, radial-gradient(circle at 50% 28%, ${currentTheme.glow}, transparent 34%), linear-gradient(135deg, rgba(18,9,10,0.74), rgba(5,2,2,0.94))`,
        border: "1px solid rgba(242,185,104,0.10)",
        boxShadow: `0 0 58px ${currentTheme.glow}, inset 0 0 40px rgba(255,255,255,0.010)`,
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
      }}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(242,185,104,0.14) 1px, transparent 1px), linear-gradient(90deg, rgba(242,185,104,0.06) 1px, transparent 1px)",
          backgroundSize: "86px 86px",
        }}
      />

      <video
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-40"
        autoPlay
        loop
        muted
        playsInline
        preload="none"
      >
        <source src="/videos/quizz/quizz-bg.mp4" type="video/mp4" media="(min-width: 768px)" />
      </video>

      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(5,2,2,0.38), rgba(5,2,2,0.70)), radial-gradient(circle at center, rgba(5,2,2,0.05), rgba(5,2,2,0.66) 72%)",
        }}
      />

      <div className="relative z-10 mx-auto w-full max-w-6xl">
        <div className="ori-quiz-mobile-top mb-2 flex flex-row items-start justify-between gap-2 px-0">
          <div className="min-w-0">
            <Eyebrow className="mb-1">{eyebrow}</Eyebrow>
            <p
              className="text-[7px] uppercase leading-relaxed tracking-[0.16em] md:text-[9px] md:tracking-[0.22em]"
              style={{ color: "rgba(255,245,235,0.50)" }}
            >
              {signalLabel}
              {layerLabel ? (
                <span className="hidden md:inline">
                  <span className="mx-2" style={{ color: "rgba(255,245,235,0.18)" }}>
                    ·
                  </span>
                  {layerLabel}
                </span>
              ) : null}
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            {statusLabel ? (
              <div
                className="hidden items-center gap-2 rounded-full px-2 py-1.5 text-[11px] sm:flex"
                style={{
                  background: "rgba(255,255,255,0.02)",
                  border: "1px solid rgba(242,185,104,0.08)",
                  color: "rgba(255,245,235,0.58)",
                }}
              >
                <span style={{ color: currentTheme.accent }}>◇</span>
                {statusLabel}
              </div>
            ) : null}

            <div
              className="rounded-full px-2 py-1 text-[10px] md:py-1.5 md:text-[11px]"
              style={{
                background:
                  safeLayerProgress >= 100
                    ? `linear-gradient(90deg, ${currentTheme.glow}, rgba(255,255,255,0.014))`
                    : "rgba(255,255,255,0.018)",
                border:
                  safeLayerProgress >= 100
                    ? `1px solid ${currentTheme.glow}`
                    : "1px solid rgba(242,185,104,0.08)",
                color: currentTheme.accent,
                boxShadow: safeLayerProgress >= 100 ? `0 0 12px ${currentTheme.glow}` : "none",
              }}
            >
              {safeLayerProgress}% {layerProgressLabel}
            </div>
          </div>
        </div>

        <div
          className="ori-quiz-mobile-card relative flex min-h-[auto] flex-col overflow-hidden rounded-[18px] px-3 py-3 md:rounded-[28px] md:px-5 md:py-4 xl:px-7 xl:py-5"
          style={{
            background:
              "radial-gradient(circle at top, rgba(255,255,255,0.048), transparent 38%), linear-gradient(180deg, rgba(255,255,255,0.028), rgba(255,255,255,0.008))",
            border: `1px solid ${currentTheme.glow}`,
            boxShadow: `0 0 48px ${currentTheme.glow}, inset 0 0 38px rgba(255,255,255,0.010)`,
          }}
        >
          <div
            className="pointer-events-none absolute inset-[8px] rounded-[18px] md:rounded-[26px]"
            style={{ border: "1px solid rgba(242,185,104,0.035)" }}
          />

          <div className="relative z-10 flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-2.5 md:gap-3">
              <div
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs md:h-10 md:w-10 md:text-sm"
                style={{
                  background: "rgba(5,2,2,0.56)",
                  border: `1px solid ${currentTheme.glow}`,
                  color: currentTheme.accent,
                  boxShadow: `0 0 20px ${currentTheme.glow}, inset 0 0 12px rgba(255,255,255,0.014)`,
                  fontWeight: 700,
                }}
              >
                {layerSymbol || currentTheme.symbol}
              </div>

              <div className="min-w-0">
                <p
                  className="mb-0.5 text-[7px] uppercase tracking-[0.16em] md:mb-1 md:text-[8px] md:tracking-[0.22em]"
                  style={{ color: currentTheme.soft }}
                >
                  {layerTitle}
                </p>
                {layerDescription ? (
                  <p
                    className="ori-mobile-preview hidden text-xs md:block md:text-sm"
                    style={{ color: "rgba(255,245,235,0.54)" }}
                  >
                    {layerDescription}
                  </p>
                ) : null}
              </div>
            </div>

            <div className="hidden items-center gap-1.5 md:flex">
              {dots.map((dot) => (
                <span
                  key={dot.id}
                  className="h-1.5 w-1.5 rounded-full"
                  style={{
                    background: dot.answered
                      ? currentTheme.accent
                      : dot.active
                        ? "rgba(255,245,235,0.42)"
                        : "rgba(255,255,255,0.12)",
                    boxShadow: dot.active ? `0 0 14px ${currentTheme.glow}` : "none",
                  }}
                />
              ))}
            </div>
          </div>

          <div className="relative z-10 my-4 h-1 overflow-hidden rounded-full bg-white/10 md:my-5">
            <motion.div
              className="h-full rounded-full"
              initial={false}
              animate={{ width: `${safeProgress}%` }}
              transition={{ duration: reduceMotion ? 0 : 0.32 }}
              style={{
                background: `linear-gradient(90deg, ${currentTheme.accent}, rgba(255,245,235,0.70))`,
                boxShadow: `0 0 18px ${currentTheme.glow}`,
              }}
            />
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={layerLabel || layerTitle}
              initial={reduceMotion ? false : { opacity: 0, y: 14, filter: "blur(7px)" }}
              animate={reduceMotion ? undefined : { opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={reduceMotion ? undefined : { opacity: 0, y: -12, filter: "blur(5px)" }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              className="relative z-10"
            >
              {children}
            </motion.div>
          </AnimatePresence>

          {footer ? <div className="relative z-10 mt-6 border-t border-white/10 pt-5">{footer}</div> : null}
        </div>

        <p
          className="ori-type-system mt-3 text-center text-[8px] tracking-[0.22em]"
          style={{ color: "rgba(255,245,235,0.34)" }}
        >
          {progressLabel}: {safeProgress}%
        </p>
      </div>
    </motion.section>
  );
}
