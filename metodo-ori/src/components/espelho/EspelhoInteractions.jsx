import { useEffect } from "react";
import {
  AnimatePresence,
  motion,
  useMotionTemplate,
  useMotionValue,
  useSpring,
} from "framer-motion";

export function AmbientMirrorField({ reduceMotion, intensity = "warm" }) {
  const pointerX = useMotionValue(50);
  const pointerY = useMotionValue(28);
  const smoothX = useSpring(pointerX, { stiffness: 70, damping: 24, mass: 0.4 });
  const smoothY = useSpring(pointerY, { stiffness: 70, damping: 24, mass: 0.4 });
  const glow = useMotionTemplate`radial-gradient(circle at ${smoothX}% ${smoothY}%, rgba(242,185,104,0.18), transparent 24%), radial-gradient(circle at ${smoothY}% ${smoothX}%, rgba(183,140,255,0.11), transparent 28%)`;

  useEffect(() => {
    if (reduceMotion) return undefined;

    function handlePointerMove(event) {
      pointerX.set((event.clientX / window.innerWidth) * 100);
      pointerY.set((event.clientY / window.innerHeight) * 100);
    }

    window.addEventListener("pointermove", handlePointerMove, { passive: true });

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
    };
  }, [pointerX, pointerY, reduceMotion]);

  return (
    <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden">
      <motion.div
        className="absolute inset-0"
        style={{
          background: reduceMotion
            ? "radial-gradient(circle at 50% 24%, rgba(242,185,104,0.10), transparent 30%)"
            : glow,
          opacity: intensity === "deep" ? 0.85 : 0.72,
        }}
      />

      {[0, 1, 2].map((item) => (
        <motion.div
          key={item}
          className="absolute rounded-full"
          initial={false}
          animate={
            reduceMotion
              ? undefined
              : {
                  x: item === 0 ? [0, 18, -10, 0] : item === 1 ? [0, -16, 10, 0] : [0, 10, 22, 0],
                  y: item === 0 ? [0, -16, 8, 0] : item === 1 ? [0, 14, -10, 0] : [0, -8, 18, 0],
                  opacity: [0.14, 0.34, 0.18],
                  scale: [1, 1.08, 0.98, 1],
                }
          }
          transition={{
            duration: 8 + item * 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          style={{
            width: item === 0 ? 280 : item === 1 ? 210 : 160,
            height: item === 0 ? 280 : item === 1 ? 210 : 160,
            top: item === 0 ? "12%" : item === 1 ? "62%" : "36%",
            left: item === 0 ? "68%" : item === 1 ? "6%" : "42%",
            border: "1px solid rgba(242,185,104,0.09)",
            boxShadow:
              "inset 0 0 56px rgba(242,185,104,0.028), 0 0 46px rgba(183,140,255,0.026)",
          }}
        />
      ))}
    </div>
  );
}

export function MirrorSectionNav({ sections = [], colors }) {
  function handleJump(id) {
    document.getElementById(id)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  return (
    <nav
      aria-label="Navegação do Espelho ORI"
      className="hidden xl:flex fixed right-4 top-1/2 z-30 -translate-y-1/2 flex-col gap-1.5 rounded-full p-1.5"
      style={{
        background: "rgba(5,2,2,0.34)",
        border: `1px solid ${colors.borderSoft}`,
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
      }}
    >
      {sections.map((section, index) => (
        <motion.button
          key={section.id}
          type="button"
          onClick={() => handleJump(section.id)}
          whileHover={{ x: -3, scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          className="group relative flex h-8 w-8 items-center justify-center rounded-full text-[8px]"
          style={{
            background:
              index === 0
                ? "rgba(242,185,104,0.12)"
                : "rgba(255,255,255,0.026)",
            border:
              index === 0
                ? "1px solid rgba(242,185,104,0.18)"
                : "1px solid rgba(255,255,255,0.05)",
            color: index === 0 ? colors.gold : colors.muted,
          }}
        >
          {section.number}
          <span
            className="pointer-events-none absolute right-10 whitespace-nowrap rounded-full px-3 py-1.5 text-[10px] opacity-0 transition-opacity group-hover:opacity-100"
            style={{
              background: "rgba(5,2,2,0.78)",
              border: `1px solid ${colors.borderSoft}`,
              color: colors.title,
            }}
          >
            {section.label}
          </span>
        </motion.button>
      ))}
    </nav>
  );
}

export function MatrixInsightPanel({ item, colors }) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={item?.label || "matrix-empty"}
        initial={{ opacity: 0, y: 14, filter: "blur(8px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        exit={{ opacity: 0, y: -10, filter: "blur(8px)" }}
        transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
        className="mt-4 grid gap-4 rounded-[28px] p-5 md:grid-cols-[0.72fr_1.28fr]"
        style={{
          background:
            "radial-gradient(circle at top left, rgba(242,185,104,0.10), transparent 36%), linear-gradient(180deg, rgba(255,255,255,0.032), rgba(255,255,255,0.012))",
          border: "1px solid rgba(242,185,104,0.12)",
          boxShadow:
            "0 0 38px rgba(242,185,104,0.035), inset 0 0 28px rgba(255,255,255,0.010)",
        }}
      >
        <div>
          <p
            className="mb-2 text-[9px] uppercase tracking-[0.26em]"
            style={{ color: colors.goldSoft }}
          >
            Foco da matriz
          </p>
          <h3
            className="text-2xl leading-tight md:text-3xl"
            style={{
              color: colors.gold,
              fontWeight: 650,
              letterSpacing: "-0.052em",
            }}
          >
            {item?.label}
          </h3>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          {[
            ["Leitura", item?.value],
            ["Sinal", item?.text],
            ["Movimento", item?.impact],
          ].map(([label, text]) => (
            <div
              key={label}
              className="rounded-[20px] p-4"
              style={{
                background: "rgba(5,2,2,0.25)",
                border: `1px solid ${colors.borderSoft}`,
              }}
            >
              <p
                className="mb-2 text-[8px] uppercase tracking-[0.22em]"
                style={{ color: colors.goldSoft }}
              >
                {label}
              </p>
              <p className="text-xs leading-relaxed" style={{ color: colors.text }}>
                {text}
              </p>
            </div>
          ))}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
