import { useState } from "react";

const themeStyles = {
  gold: {
    glow: "rgba(242,185,104,0.14)",
  },
  purple: {
    glow: "rgba(183,140,255,0.12)",
  },
  cyan: {
    glow: "rgba(88,216,232,0.10)",
  },
  wine: {
    glow: "rgba(199,106,122,0.10)",
  },
  green: {
    glow: "rgba(159,184,117,0.10)",
  },
  red: {
    glow: "rgba(199,106,122,0.10)",
  },
  silver: {
    glow: "rgba(216,208,195,0.09)",
  },
};

const oriGold = {
  accent: "var(--gold-primary)",
  softAccent: "rgba(242,185,104,0.74)",
  mutedAccent: "rgba(242,185,104,0.42)",
  border: "rgba(242,185,104,0.13)",
  glow: "rgba(242,185,104,0.14)",
  title: "rgba(242,185,104,0.96)",

  number: "rgba(226,214,196,0.74)",
  numberBorder: "rgba(242,185,104,0.085)",
  numberBg:
    "linear-gradient(180deg, rgba(255,255,255,0.026), rgba(255,255,255,0.008))",
};

function ReportAccordion({
  number = "01",
  eyebrow,
  title,
  description,
  content,
  image,
  theme = "gold",
  defaultOpen = false,
  visualImage,
  visualTitle,
  visualCaption,
  visualAlt,
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const currentTheme = themeStyles[theme] || themeStyles.gold;

  return (
    <section
      className="
        relative
        overflow-hidden
        rounded-[28px]
        md:rounded-[32px]
        mb-6
        transition-all
        duration-700
        group
        cinematic-card
      "
      style={{
        border: isOpen
          ? "1px solid rgba(242,185,104,0.20)"
          : "1px solid rgba(242,185,104,0.08)",
        boxShadow: isOpen
          ? "0 0 72px rgba(242,185,104,0.12), inset 0 0 52px rgba(255,255,255,0.016)"
          : "0 0 28px rgba(0,0,0,0.34), inset 0 0 32px rgba(255,255,255,0.01)",
        background:
          "linear-gradient(180deg, rgba(8,4,5,0.66), rgba(4,2,2,0.86))",
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
      }}
    >
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="relative w-full text-left overflow-hidden"
        aria-expanded={isOpen}
      >
        <div className="relative min-h-[210px] md:min-h-[228px]">
          {image && (
            <img
              src={image}
              alt={typeof title === "string" ? title.replace(/\n/g, " ") : ""}
              className="
                absolute
                inset-0
                w-full
                h-full
                object-cover
                object-[82%_center]
                scale-100
                transition-all
                duration-700
                group-hover:scale-[1.025]
              "
            />
          )}

          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(90deg, rgba(3,2,2,0.995) 0%, rgba(3,2,2,0.965) 31%, rgba(3,2,2,0.70) 52%, rgba(3,2,2,0.22) 76%, rgba(3,2,2,0.04) 100%)",
            }}
          />

          <div
            className="absolute inset-0 opacity-[0.022]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(242,185,104,0.16) 1px, transparent 1px), linear-gradient(90deg, rgba(242,185,104,0.07) 1px, transparent 1px)",
              backgroundSize: "58px 58px",
            }}
          />

          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `
                radial-gradient(circle at 82% 50%, ${currentTheme.glow}, transparent 34%),
                radial-gradient(circle at 18% 50%, rgba(242,185,104,0.055), transparent 36%)
              `,
            }}
          />

          <div className="relative z-10 h-full px-6 md:px-8 xl:px-10 py-7 flex items-center">
            <div className="flex items-center gap-6 md:gap-7 w-full max-w-[590px]">
              <div className="hidden md:flex items-center gap-4 shrink-0">
                <div
                  className="w-px h-[92px]"
                  style={{
                    background:
                      "linear-gradient(180deg, transparent, rgba(242,185,104,0.44), transparent)",
                    boxShadow: "0 0 14px rgba(242,185,104,0.10)",
                  }}
                />

                <div
                  className="
                    w-[62px]
                    h-[62px]
                    rounded-[22px]
                    flex
                    items-center
                    justify-center
                    shrink-0
                  "
                  style={{
                    background: oriGold.numberBg,
                    border: `1px solid ${oriGold.numberBorder}`,
                    boxShadow: isOpen
                      ? "inset 0 0 22px rgba(242,185,104,0.03), 0 0 28px rgba(242,185,104,0.08)"
                      : "inset 0 0 22px rgba(242,185,104,0.018), 0 0 24px rgba(0,0,0,0.20)",
                    backdropFilter: "blur(10px)",
                    WebkitBackdropFilter: "blur(10px)",
                  }}
                >
                  <span
                    className="block text-[28px] md:text-[30px] leading-none font-medium tracking-[-0.08em]"
                    style={{
                      color: isOpen ? "rgba(242,185,104,0.92)" : oriGold.number,
                      textShadow: "0 0 14px rgba(0,0,0,0.34)",
                    }}
                  >
                    {number}
                  </span>
                </div>
              </div>

              <div className="max-w-[455px]">
                <div className="flex md:hidden items-center gap-3 mb-3">
                  <div
                    className="
                      w-[46px]
                      h-[46px]
                      rounded-[16px]
                      flex
                      items-center
                      justify-center
                      shrink-0
                    "
                    style={{
                      background: oriGold.numberBg,
                      border: `1px solid ${oriGold.numberBorder}`,
                      boxShadow:
                        "inset 0 0 18px rgba(242,185,104,0.018), 0 0 18px rgba(0,0,0,0.20)",
                      backdropFilter: "blur(10px)",
                      WebkitBackdropFilter: "blur(10px)",
                    }}
                  >
                    <span
                      className="text-[20px] leading-none font-medium tracking-[-0.08em]"
                      style={{
                        color: oriGold.number,
                        textShadow: "0 0 12px rgba(0,0,0,0.34)",
                      }}
                    >
                      {number}
                    </span>
                  </div>

                  <div
                    className="h-px flex-1"
                    style={{
                      background:
                        "linear-gradient(90deg, rgba(242,185,104,0.34), transparent)",
                    }}
                  />
                </div>

                {eyebrow && (
                  <div className="mb-4">
                    <span
                      className="
                        inline-flex
                        items-center
                        rounded-full
                        px-3.5
                        py-1.5
                        uppercase
                        text-[8px]
                        md:text-[9px]
                        tracking-[0.28em]
                      "
                      style={{
                        color: oriGold.softAccent,
                        background: "rgba(255,255,255,0.026)",
                        border: "1px solid rgba(242,185,104,0.10)",
                        boxShadow:
                          "inset 0 0 18px rgba(242,185,104,0.018), 0 0 18px rgba(242,185,104,0.025)",
                        backdropFilter: "blur(10px)",
                        WebkitBackdropFilter: "blur(10px)",
                      }}
                    >
                      {eyebrow}
                    </span>
                  </div>
                )}

                <h3
                  className="text-2xl md:text-[31px] leading-[1.05] mb-3 whitespace-pre-line max-w-[430px]"
                  style={{
                    color: oriGold.title,
                    letterSpacing: "-0.052em",
                    fontWeight: 520,
                    textShadow: "0 0 30px rgba(242,185,104,0.10)",
                  }}
                >
                  {title}
                </h3>

                {description && (
                  <p
                    className="text-[13px] md:text-[14px] leading-relaxed max-w-[410px] whitespace-pre-line mb-4"
                    style={{
                      color: "rgba(255,245,235,0.66)",
                      textShadow: "0 0 24px rgba(0,0,0,0.42)",
                    }}
                  >
                    {description}
                  </p>
                )}

                <div className="mb-4">
                  <span
                    className="inline-flex items-center rounded-full px-3 py-1.5 uppercase text-[8px] md:text-[9px] tracking-[0.24em]"
                    style={{
                      color: isOpen
                        ? "rgba(255,245,235,0.74)"
                        : "rgba(242,185,104,0.74)",
                      background: isOpen
                        ? "rgba(255,255,255,0.028)"
                        : "rgba(242,185,104,0.045)",
                      border: isOpen
                        ? "1px solid rgba(255,255,255,0.08)"
                        : "1px solid rgba(242,185,104,0.10)",
                      boxShadow: isOpen
                        ? "0 0 18px rgba(255,255,255,0.03)"
                        : "0 0 18px rgba(242,185,104,0.03)",
                      backdropFilter: "blur(10px)",
                      WebkitBackdropFilter: "blur(10px)",
                    }}
                  >
                    {isOpen ? "Camada ativa" : "Camada disponível"}
                  </span>
                </div>

                <div
                  className="
                    inline-flex
                    items-center
                    gap-2
                    text-[9px]
                    md:text-[10px]
                    uppercase
                    tracking-[0.24em]
                    transition-all
                    duration-500
                    opacity-75
                    group-hover:opacity-100
                    group-hover:gap-3
                  "
                  style={{
                    color: isOpen
                      ? "rgba(255,245,235,0.62)"
                      : "rgba(242,185,104,0.66)",
                    textShadow: isOpen
                      ? "0 0 14px rgba(255,255,255,0.04)"
                      : "0 0 14px rgba(242,185,104,0.08)",
                  }}
                >
                  <span
                    className="
                      w-4
                      h-4
                      rounded-full
                      flex
                      items-center
                      justify-center
                      text-[10px]
                      leading-none
                      transition-all
                      duration-500
                    "
                    style={{
                      background: isOpen
                        ? "rgba(255,255,255,0.026)"
                        : "rgba(242,185,104,0.045)",
                      border: isOpen
                        ? "1px solid rgba(255,255,255,0.055)"
                        : "1px solid rgba(242,185,104,0.085)",
                      color: isOpen
                        ? "rgba(255,245,235,0.58)"
                        : "rgba(242,185,104,0.72)",
                      boxShadow: "0 0 10px rgba(242,185,104,0.025)",
                    }}
                  >
                    {isOpen ? "−" : "+"}
                  </span>

                  <span>{isOpen ? "Fechar seção" : "Abrir seção"}</span>
                </div>
              </div>
            </div>
          </div>

          <div
            className="absolute left-0 top-0 bottom-0 w-px opacity-70"
            style={{
              background:
                "linear-gradient(180deg, transparent, rgba(242,185,104,0.16), transparent)",
            }}
          />

          <div
            className="absolute bottom-0 left-0 right-0 h-px opacity-70"
            style={{
              background:
                "linear-gradient(to right, transparent, rgba(242,185,104,0.13), transparent)",
            }}
          />
        </div>
      </button>

      <div
        className={`grid transition-all duration-700 ease-in-out ${
          isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          <div className="relative px-6 md:px-8 xl:px-10 py-6 md:py-7">
            <div
              className="h-px w-full mb-6"
              style={{
                background:
                  "linear-gradient(to right, transparent, rgba(242,185,104,0.38), transparent)",
              }}
            />

            <div className="mb-5">
              <p
                className="uppercase tracking-[0.28em] text-[9px] md:text-[10px] mb-2"
                style={{ color: "var(--gold-soft)" }}
              >
                Leitura ativada
              </p>

              <div
                className="w-20 h-px"
                style={{
                  background:
                    "linear-gradient(90deg, rgba(242,185,104,0.72), transparent)",
                }}
              />
            </div>

            <p
              className="relative z-10 text-sm md:text-base leading-[1.85] whitespace-pre-line max-w-4xl"
              style={{ color: "rgba(255,245,235,0.80)" }}
            >
              {content}
            </p>

            {visualImage && (
              <div
                className="relative overflow-hidden rounded-[26px] md:rounded-[32px] mt-8"
                style={{
                  background:
                    "linear-gradient(180deg, rgba(18,9,10,0.64), rgba(5,2,2,0.88))",
                  border: "1px solid rgba(242,185,104,0.12)",
                  boxShadow:
                    "0 0 56px rgba(242,185,104,0.045), inset 0 0 36px rgba(255,255,255,0.012)",
                  backdropFilter: "blur(14px)",
                  WebkitBackdropFilter: "blur(14px)",
                }}
              >
                <div
                  className="absolute inset-0 pointer-events-none opacity-[0.026]"
                  style={{
                    backgroundImage:
                      "linear-gradient(rgba(242,185,104,0.18) 1px, transparent 1px), linear-gradient(90deg, rgba(242,185,104,0.08) 1px, transparent 1px)",
                    backgroundSize: "58px 58px",
                  }}
                />

                <div className="relative z-10 p-4 md:p-5">
                  {(visualTitle || visualCaption) && (
                    <div className="mb-4">
                      {visualTitle && (
                        <p
                          className="uppercase tracking-[0.34em] text-[9px] md:text-[10px] mb-2"
                          style={{ color: "var(--gold-soft)" }}
                        >
                          {visualTitle}
                        </p>
                      )}

                      {visualCaption && (
                        <p
                          className="text-sm md:text-base leading-relaxed max-w-3xl"
                          style={{ color: "rgba(255,245,235,0.62)" }}
                        >
                          {visualCaption}
                        </p>
                      )}
                    </div>
                  )}

                  <div
                    className="relative overflow-hidden rounded-[22px] md:rounded-[26px]"
                    style={{
                      border: "1px solid rgba(242,185,104,0.10)",
                      boxShadow:
                        "0 0 42px rgba(0,0,0,0.28), inset 0 0 28px rgba(255,255,255,0.012)",
                    }}
                  >
                    <img
                      src={visualImage}
                      alt={visualAlt || visualTitle || "Referência visual"}
                      className="w-full h-auto object-cover block"
                    />

                    <div
                      className="absolute inset-0 pointer-events-none"
                      style={{
                        background:
                          "linear-gradient(180deg, rgba(255,255,255,0.035), transparent 28%, rgba(0,0,0,0.10))",
                      }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default ReportAccordion;
