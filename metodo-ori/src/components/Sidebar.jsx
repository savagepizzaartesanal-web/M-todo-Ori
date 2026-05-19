import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";

import { supabase } from "../lib/supabaseClient";

const mainLinks = [
  ["Portal Cliente", "/portal"],
  ["Método ORI", "/metodo-ori"],
  ["Código das Deusas", "/produto-1"],
  ["Dossiê ORI", "/produto-2"],
  ["Código Final", "/produto-3"],
  ["Espelho ORI", "/espelho-ori"],
];

const adminLinks = [
  ["Estúdio ORI", "/admin"],
  ["Clientes", "/admin/clientes"],
];

function SectionTitle({ children, variant = "gold" }) {
  const isPurple = variant === "purple";
  const isGreen = variant === "green";

  return (
    <div className="mb-3 px-2">
      <div className="flex items-center gap-3">
        <div
          className="w-6 h-px shrink-0"
          style={{
            background: isGreen
              ? "linear-gradient(90deg, rgba(120,255,160,0.62), transparent)"
              : isPurple
                ? "linear-gradient(90deg, rgba(183,140,255,0.68), transparent)"
                : "linear-gradient(90deg, rgba(242,185,104,0.72), transparent)",
            boxShadow: isGreen
              ? "0 0 12px rgba(120,255,160,0.14)"
              : isPurple
                ? "0 0 12px rgba(183,140,255,0.16)"
                : "0 0 12px rgba(242,185,104,0.16)",
          }}
        />

        <p
          className="uppercase text-[9px]"
          style={{
            color: isGreen
              ? "rgba(120,255,160,0.70)"
              : isPurple
                ? "rgba(183,140,255,0.78)"
                : "rgba(242,185,104,0.72)",
            letterSpacing: "0.28em",
            textShadow: isGreen
              ? "0 0 16px rgba(120,255,160,0.10)"
              : isPurple
                ? "0 0 16px rgba(183,140,255,0.10)"
                : "0 0 16px rgba(242,185,104,0.10)",
          }}
        >
          {children}
        </p>
      </div>
    </div>
  );
}

function Sidebar() {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    async function checkAdmin() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user?.email) return;

      const { data, error } = await supabase
        .from("clientes")
        .select("admin")
        .eq("email", user.email)
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
    navigate("/entrar");
  };

  const renderLink = ([label, path], variant = "gold") => {
    const isPurple = variant === "purple";

    return (
      <NavLink
        key={path}
        to={path}
        className={({ isActive }) =>
          `group relative overflow-hidden rounded-full px-4 py-3 text-[13px] transition-all duration-500 ${
            isActive ? "scale-[1.01]" : "hover:scale-[1.01]"
          }`
        }
        style={({ isActive }) => ({
          transformOrigin: "center",
          color: isActive
            ? isPurple
              ? "#d9bdff"
              : "var(--gold-primary)"
            : isPurple
              ? "rgba(255,255,255,0.74)"
              : "var(--text-soft)",
          background: isActive
            ? isPurple
              ? "linear-gradient(90deg, rgba(183,140,255,0.13), rgba(255,255,255,0.025))"
              : "linear-gradient(90deg, rgba(242,185,104,0.12), rgba(255,255,255,0.025))"
            : "rgba(255,255,255,0.018)",
          border: isActive
            ? isPurple
              ? "1px solid rgba(183,140,255,0.18)"
              : "1px solid rgba(242,185,104,0.18)"
            : "1px solid rgba(255,255,255,0.035)",
          letterSpacing: "0.045em",
          boxShadow: isActive
            ? isPurple
              ? "0 0 42px rgba(183,140,255,0.08), inset 0 0 28px rgba(183,140,255,0.035)"
              : "0 0 42px rgba(242,185,104,0.08), inset 0 0 28px rgba(242,185,104,0.035)"
            : "inset 0 0 24px rgba(255,255,255,0.012)",
        })}
      >
        {({ isActive }) => (
          <>
            <span
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
              style={{
                background: isPurple
                  ? "linear-gradient(90deg, rgba(183,140,255,0.09), transparent)"
                  : "linear-gradient(90deg, rgba(242,185,104,0.09), transparent)",
              }}
            />

            <span
              className="absolute left-3.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full transition-all duration-500"
              style={{
                background: isActive
                  ? isPurple
                    ? "#d9bdff"
                    : "var(--gold-primary)"
                  : "transparent",
                boxShadow: isActive
                  ? isPurple
                    ? "0 0 16px rgba(183,140,255,0.7)"
                    : "0 0 16px rgba(242,185,104,0.7)"
                  : "none",
              }}
            />

            <span className="relative z-10 pl-2.5">{label}</span>
          </>
        )}
      </NavLink>
    );
  };

  return (
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

            <nav className="flex flex-col gap-2">
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

              <nav className="flex flex-col gap-2">
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
              className="relative overflow-hidden rounded-[22px] p-3.5 mb-3"
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
                    className="uppercase tracking-[0.28em] text-[8px] mb-1"
                    style={{ color: "rgba(120,255,160,0.70)" }}
                  >
                    Status
                  </p>

                  <p
                    className="text-sm"
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
              onClick={handleLogout}
              className="group relative overflow-hidden w-full rounded-full px-4 py-2.5 text-[11px] transition-all duration-500 hover:scale-[1.01]"
              style={{
                transformOrigin: "center",
                background: "rgba(255,255,255,0.018)",
                border: "1px solid rgba(242,185,104,0.075)",
                color: "rgba(255,245,235,0.66)",
                letterSpacing: "0.12em",
              }}
            >
              <span
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                style={{
                  background:
                    "linear-gradient(90deg, rgba(242,185,104,0.07), transparent)",
                }}
              />

              <span className="relative z-10 uppercase">Sair do Portal</span>
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
