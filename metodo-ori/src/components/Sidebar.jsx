import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";

import { supabase } from "../lib/supabaseClient";

const mainLinks = [
  ["Portal Cliente", "/portal"],
  ["Conheça o Método", "/metodo-ori"],
  ["Código das Deusas", "/produto-1"],
  ["Dossiê ORI", "/produto-2"],
  ["Código Final", "/produto-3"],
  ["Espelho ORI", "/espelho-ori"],
  ["Oráculo", "/oraculo"],
].filter(Boolean);

const adminLinks = [
  ["Estúdio ORI", "/admin"],
  ["Clientes", "/admin/clientes"],
];

function SectionTitle({ children, variant = "gold" }) {
  const isPurple = variant === "purple";
  const isGreen = variant === "green";

  return (
    <div className="mb-3 px-2">
      <p
        className="ori-type-system"
        style={{
          color: isGreen
            ? "rgba(120,255,160,0.58)"
            : isPurple
              ? "rgba(183,140,255,0.66)"
              : "rgba(242,185,104,0.72)",
          letterSpacing: "0.35em",
        }}
      >
        {children}
      </p>
    </div>
  );
}

function Sidebar() {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    async function checkAdmin() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user?.id) return;

      const { data, error } = await supabase
        .from("clientes")
        .select("admin")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) {
        console.log("Erro ao verificar admin:", error);
        return;
      }

      setIsAdmin(Boolean(data?.admin));
    }

    checkAdmin();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setMobileOpen(false);
    navigate("/entrar");
  };

  const renderLink = ([label, path, badge], variant = "gold") => {
    const isPurple = variant === "purple";
    const activeColor = isPurple ? "var(--lavender-muted)" : "var(--copper-primary)";
    const activeBorder = isPurple ? "rgba(107,90,110,0.34)" : "rgba(210,135,70,0.28)";
    const activeBackground = isPurple
      ? "linear-gradient(90deg, rgba(107,90,110,0.16), rgba(107,90,110,0.045) 48%, transparent 100%)"
      : "linear-gradient(90deg, rgba(210,135,70,0.12), rgba(210,135,70,0.035) 48%, transparent 100%)";

    return (
      <NavLink
        key={path}
        to={path}
        onClick={() => setMobileOpen(false)}
        className={({ isActive }) =>
          `ori-sidebar-link ori-type-system group relative overflow-hidden rounded-[14px] px-3.5 py-2.5 text-[12.5px] normal-case transition-all duration-500 ${
            isActive ? "ori-state-active ori-state-surface" : "hover:translate-x-0.5"
          }`
        }
        style={({ isActive }) => ({
          transformOrigin: "center",
          fontSize: "12.5px",
          fontWeight: 500,
          lineHeight: 1.22,
          textTransform: "none",
          color: isActive
            ? activeColor
            : isPurple
              ? "rgba(255,255,255,0.64)"
              : "rgba(215,194,170,0.76)",
          background: isActive
            ? activeBackground
            : "linear-gradient(90deg, rgba(255,255,255,0.018), rgba(255,255,255,0.006))",
          border: isActive ? `1px solid ${activeBorder}` : "1px solid rgba(255,255,255,0.026)",
          letterSpacing: "0.035em",
          boxShadow: isActive
            ? isPurple
              ? "0 0 24px rgba(107,90,110,0.055), inset 0 0 18px rgba(107,90,110,0.020)"
              : "0 0 24px rgba(210,135,70,0.045), inset 0 0 18px rgba(210,135,70,0.018)"
            : "inset 0 0 14px rgba(255,255,255,0.006)",
          backdropFilter: "blur(14px)",
          WebkitBackdropFilter: "blur(14px)",
        })}
      >
        {({ isActive }) => (
          <>
            <span
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
              style={{
                background: isPurple
                  ? "linear-gradient(90deg, rgba(107,90,110,0.10), transparent)"
                  : "linear-gradient(90deg, rgba(210,135,70,0.08), transparent)",
              }}
            />

            <span
              className="absolute left-0 top-2 bottom-2 w-px rounded-full transition-all duration-500"
              style={{
                background: isActive
                  ? `linear-gradient(180deg, transparent, ${activeColor}, transparent)`
                  : "transparent",
                boxShadow: isActive
                  ? isPurple
                    ? "0 0 14px rgba(107,90,110,0.58)"
                    : "0 0 14px rgba(210,135,70,0.55)"
                  : "none",
              }}
            />

            <span className="relative z-10 flex items-center justify-between gap-2 pl-2 tracking-[0.035em] normal-case">
              <span>{label}</span>
              {badge ? (
                <span
                  className="rounded-full px-2 py-1 text-[8px]"
                  style={{
                    background: "rgba(242,185,104,0.075)",
                    border: "1px solid rgba(242,185,104,0.10)",
                    color: "rgba(242,185,104,0.66)",
                    letterSpacing: "0.02em",
                  }}
                >
                  {badge}
                </span>
              ) : null}
            </span>
          </>
        )}
      </NavLink>
    );
  };

  return (
    <>
      <div className="fixed left-2.5 right-2.5 top-2 z-50 flex items-center justify-between gap-2 lg:hidden">
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="ori-button-secondary inline-flex min-h-9 items-center gap-2 rounded-full px-3 py-1.5 text-[12px]"
          style={{
            background: "rgba(5,2,2,0.58)",
            border: "1px solid rgba(242,185,104,0.11)",
            color: "rgba(247,234,216,0.76)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            boxShadow: "0 8px 26px rgba(0,0,0,0.22)",
          }}
          aria-expanded={mobileOpen}
          aria-controls="ori-mobile-menu"
        >
          <span
            className="h-px w-4"
            style={{
              background:
                "linear-gradient(90deg, var(--gold-primary), transparent)",
            }}
          />
          Menu ORI
        </button>

        <span
          className="ori-type-system rounded-full px-2.5 py-1.5 text-[8px]"
          style={{
            background: "rgba(5,2,2,0.42)",
            border: "1px solid rgba(242,185,104,0.075)",
            color: "rgba(242,185,104,0.58)",
            backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
          }}
        >
          Portal
        </span>
      </div>

      {mobileOpen && (
        <div
          className="fixed inset-0 z-[60] lg:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Menu ORI"
        >
          <button
            type="button"
            className="absolute inset-0 h-full w-full bg-black/62"
            onClick={() => setMobileOpen(false)}
            aria-label="Fechar menu"
          />

          <div
            id="ori-mobile-menu"
            className="absolute bottom-0 left-0 right-0 max-h-[86svh] overflow-hidden rounded-t-[28px] border px-5 pb-5 pt-4"
            style={{
              backgroundColor: "rgba(5,2,2,0.94)",
              borderColor: "rgba(242,185,104,0.14)",
              boxShadow:
                "0 -18px 70px rgba(0,0,0,0.54), inset 0 1px 0 rgba(255,255,255,0.04)",
              backdropFilter: "blur(22px)",
              WebkitBackdropFilter: "blur(22px)",
            }}
          >
            <div className="relative z-10">
              <div className="mb-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <img
                    src="/images/logo/logo-ori.png"
                    alt="Método ORI"
                    className="h-12 w-12 object-contain"
                  />
                  <div>
                    <p
                      className="ori-type-system text-[9px]"
                      style={{ color: "rgba(242,185,104,0.78)" }}
                    >
                      Jornada ORI
                    </p>
                    <p
                      className="ori-type-reading-soft text-sm"
                      style={{ color: "rgba(255,245,235,0.70)" }}
                    >
                      Escolha seu próximo passo.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setMobileOpen(false)}
                  className="ori-button-secondary grid h-10 w-10 place-items-center rounded-full text-lg"
                  style={{
                    background: "rgba(255,255,255,0.026)",
                    border: "1px solid rgba(242,185,104,0.12)",
                    color: "rgba(247,234,216,0.78)",
                  }}
                  aria-label="Fechar menu"
                >
                  ×
                </button>
              </div>

              <div className="ori-premium-scroll max-h-[calc(86svh-112px)] overflow-y-auto pr-1">
                <div className="mb-5">
                  <SectionTitle>Jornada ORI</SectionTitle>
                  <nav className="grid gap-2">
                    {mainLinks.map((link) => renderLink(link, "gold"))}
                  </nav>
                </div>

                {isAdmin && (
                  <div
                    className="mb-5 rounded-[18px] px-2.5 py-3"
                    style={{
                      background:
                        "linear-gradient(180deg, rgba(183,140,255,0.045), rgba(255,255,255,0.010))",
                      border: "1px solid rgba(183,140,255,0.085)",
                    }}
                  >
                    <SectionTitle variant="purple">
                      Painel Administrativo
                    </SectionTitle>
                    <nav className="grid gap-2">
                      {adminLinks.map((link) => renderLink(link, "purple"))}
                    </nav>
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleLogout}
                  className="ori-button-secondary ori-type-system w-full rounded-[14px] px-3.5 py-3 text-[12px]"
                  style={{
                    background: "rgba(255,255,255,0.020)",
                    border: "1px solid rgba(120,255,160,0.10)",
                    color: "rgba(120,255,160,0.74)",
                    fontWeight: 500,
                    letterSpacing: "0.035em",
                  }}
                >
                  Sair do portal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <aside
      className="
        hidden
        lg:flex
        fixed
        left-0
        top-0
        z-40
        lg:w-[260px]
        xl:w-[270px]
        h-screen
        px-5
        py-4
        overflow-hidden
        flex-col
      "
      style={{
        background:
          "linear-gradient(180deg, rgba(10,5,6,0.26), rgba(4,2,2,0.14))",
        backdropFilter: "blur(42px) saturate(175%)",
        WebkitBackdropFilter: "blur(42px) saturate(175%)",
        borderRight: "1px solid rgba(242,185,104,0.08)",
        boxShadow:
          "inset 0 0 120px rgba(255,255,255,0.018), inset -18px 0 44px rgba(242,185,104,0.018), 0 0 90px rgba(0,0,0,0.22)",
      }}
    >
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(242,185,104,0.18) 1px, transparent 1px), linear-gradient(90deg, rgba(242,185,104,0.08) 1px, transparent 1px)",
          backgroundSize: "84px 84px",
        }}
      />

      <div
        className="absolute inset-0 pointer-events-none opacity-[0.06]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 18px 18px, rgba(242,185,104,0.45) 1px, transparent 1px)",
          backgroundSize: "42px 42px",
        }}
      />

      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(105deg, rgba(255,255,255,0.055), transparent 24%, transparent 70%, rgba(242,185,104,0.025))",
        }}
      />

      <div
        className="absolute top-[-220px] left-[-160px] w-[540px] h-[540px] rounded-full blur-3xl opacity-[0.13] pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(242,185,104,0.24), transparent 68%)",
        }}
      />

      <div
        className="absolute bottom-[-260px] right-[-180px] w-[440px] h-[440px] rounded-full blur-3xl opacity-[0.1] pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(183,140,255,0.28), transparent 70%)",
        }}
      />

      <div
        className="absolute left-4 top-7 bottom-7 w-px pointer-events-none opacity-80"
        style={{
          background:
            "linear-gradient(180deg, transparent, rgba(242,185,104,0.16), rgba(242,185,104,0.32), rgba(183,140,255,0.22), transparent)",
          boxShadow: "0 0 26px rgba(242,185,104,0.16)",
        }}
      />

      <div
        className="absolute top-0 right-0 w-px h-full pointer-events-none opacity-60"
        style={{
          background:
            "linear-gradient(180deg, transparent, rgba(255,255,255,0.075), transparent)",
        }}
      />

      <div
        className="
          relative
          z-10
          min-h-0
          h-full
          overflow-y-auto
          overflow-x-hidden
          pl-1
          pr-2
          pb-4
        "
        style={{
          direction: "rtl",
          scrollbarWidth: "thin",
          scrollbarColor: "rgba(242,185,104,0.22) transparent",
        }}
      >
        <div style={{ direction: "ltr" }}>
          <div className="mb-5 mt-0 flex justify-center">
            <div className="relative flex items-center justify-center w-full py-2">
              <div
                className="absolute w-[150px] h-[150px] rounded-full pointer-events-none"
                style={{
                  background:
                    "radial-gradient(circle, rgba(242,185,104,0.08), transparent 62%)",
                  filter: "blur(10px)",
                }}
              />

              <div
                className="absolute w-[122px] h-[122px] rounded-full pointer-events-none opacity-35"
                style={{
                  border: "1px solid rgba(242,185,104,0.12)",
                  boxShadow: "inset 0 0 30px rgba(242,185,104,0.035)",
                }}
              />

              <img
                src="/images/logo/logo-ori.png"
                alt="Método ORI"
                className="relative z-10 w-[122px] xl:w-[132px] object-contain select-none pointer-events-none"
                style={{
                  opacity: 0.98,
                  filter: "drop-shadow(0 0 24px rgba(242,185,104,0.16))",
                }}
              />
            </div>
          </div>

          <div className="mb-5 pl-4 pr-1">
            <SectionTitle>Jornada ORI</SectionTitle>

            <nav className="flex flex-col gap-1.5">
              {mainLinks.map((link) => renderLink(link, "gold"))}
            </nav>
          </div>

          {isAdmin && (
            <div className="relative mb-5 pt-5 pl-4 pr-1">
              <div
                className="absolute top-0 left-4 right-0 h-px"
                style={{
                  background:
                    "linear-gradient(90deg, transparent, rgba(242,185,104,0.10), rgba(183,140,255,0.12), transparent)",
                }}
              />

              <SectionTitle variant="purple">
                Painel Administrativo
              </SectionTitle>

              <nav className="flex flex-col gap-1.5">
                {adminLinks.map((link) => renderLink(link, "purple"))}
              </nav>
            </div>
          )}

          <div className="relative pl-4 pr-1 pb-2 pt-5">
            <div
              className="absolute top-0 left-4 right-0 h-px"
              style={{
                background:
                  "linear-gradient(90deg, transparent, rgba(242,185,104,0.10), rgba(120,255,160,0.10), transparent)",
              }}
            />

            <SectionTitle variant="green">Sessão ORI</SectionTitle>

            <div
              className="ori-card-secondary relative overflow-hidden rounded-[22px] p-3.5 mb-3"
              style={{
                background:
                  "linear-gradient(90deg, rgba(120,255,160,0.045), rgba(255,255,255,0.016))",
                border: "1px solid rgba(120,255,160,0.10)",
                boxShadow:
                  "inset 0 0 26px rgba(120,255,160,0.018), 0 0 30px rgba(120,255,160,0.025)",
                backdropFilter: "blur(10px)",
                WebkitBackdropFilter: "blur(10px)",
              }}
            >
              <div
                className="absolute inset-0 pointer-events-none opacity-[0.025]"
                style={{
                  backgroundImage:
                    "linear-gradient(rgba(120,255,160,0.18) 1px, transparent 1px), linear-gradient(90deg, rgba(120,255,160,0.08) 1px, transparent 1px)",
                  backgroundSize: "42px 42px",
                }}
              />

              <div className="relative z-10 flex items-center justify-between gap-3">
                <div>
                  <p
                    className="ori-type-system mb-1"
                    style={{ color: "rgba(120,255,160,0.70)" }}
                  >
                    Status
                  </p>

                  <p
                    className="ori-type-reading-soft text-sm"
                    style={{ color: "rgba(255,245,235,0.72)" }}
                  >
                    Portal conectado
                  </p>
                </div>

                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{
                    background: "#9BE7AE",
                    boxShadow: "0 0 18px rgba(120,255,160,0.55)",
                  }}
                />
              </div>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="ori-button-secondary ori-type-system group relative overflow-hidden w-full rounded-[14px] px-3.5 py-2.5 text-[12px] transition-all duration-500 hover:translate-x-0.5"
              style={{
                transformOrigin: "center",
                background:
                  "linear-gradient(90deg, rgba(255,255,255,0.018), rgba(255,255,255,0.006))",
                border: "1px solid rgba(255,255,255,0.026)",
                color: "rgba(215,194,170,0.68)",
                fontSize: "12px",
                fontWeight: 500,
                letterSpacing: "0.035em",
                lineHeight: 1.22,
                textTransform: "none",
                boxShadow: "inset 0 0 14px rgba(255,255,255,0.006)",
              }}
            >
              <span
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                style={{
                  background:
                    "linear-gradient(90deg, rgba(242,185,104,0.07), transparent)",
                }}
              />

              <span className="relative z-10 normal-case">Sair do Portal</span>
            </button>
          </div>
        </div>
      </div>
      </aside>
    </>
  );
}

export default Sidebar;
