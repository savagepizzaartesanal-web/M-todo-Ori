import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";

import { supabase } from "../lib/supabaseClient";

const ONBOARDING_COMPLETED_KEY = "ori_onboarding_completed";

const getOnboardingCompletedKey = (session) => {
  const userKey = session?.user?.id || session?.user?.email;
  return userKey
    ? `${ONBOARDING_COMPLETED_KEY}:${userKey}`
    : ONBOARDING_COMPLETED_KEY;
};

function AuthLoading() {
  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{
        background: "transparent",
        color: "var(--text-primary)",
      }}
    >
      <div
        className="ori-card-protagonist w-full max-w-xl rounded-[34px] p-8 md:p-10 text-center"
        style={{
          background:
            "linear-gradient(135deg, rgba(18,9,10,0.88), rgba(5,2,2,0.96))",
          border: "1px solid rgba(242,185,104,0.14)",
          boxShadow:
            "0 0 90px rgba(242,185,104,0.055), inset 0 0 80px rgba(255,255,255,0.018)",
          backdropFilter: "blur(18px)",
          WebkitBackdropFilter: "blur(18px)",
        }}
      >
        <p
          className="ori-type-system text-[10px] md:text-xs mb-5"
          style={{ color: "var(--gold-soft)" }}
        >
          Validando acesso
        </p>

        <h1
          className="ori-type-revelation text-3xl md:text-4xl font-semibold"
          style={{
            color: "var(--gold-primary)",
            letterSpacing: "-0.05em",
          }}
        >
          Preparando seu portal ORI...
        </h1>
      </div>
    </div>
  );
}

function ProtectedRoute({ children }) {
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);
  const [cliente, setCliente] = useState(null);

  useEffect(() => {
    let isMounted = true;

    async function loadSession() {
      try {
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          console.log("Erro ao validar sessão:", error);
        }

        if (!isMounted) return;

        const currentSession = data?.session || null;
        setSession(currentSession);

        if (!currentSession?.user?.id) {
          setCliente(null);
          return;
        }

        if (currentSession?.user?.id) {
          const { data: clienteData, error: clienteError } = await supabase
            .from("clientes")
            .select("*")
            .eq("user_id", currentSession.user.id)
            .maybeSingle();

          if (clienteError) {
            console.log("Erro ao buscar perfil do cliente:", clienteError);
          }

          if (isMounted) {
            setCliente(clienteData || null);
          }
        }
      } catch (error) {
        console.log("Erro inesperado ao validar sessão:", error);
        if (isMounted) {
          setSession(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadSession();

    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return <AuthLoading />;
  }

  if (!session) {
    return <Navigate to="/entrar" replace />;
  }

  const onboardingCompleted =
    Boolean(cliente?.perfil_onboarding_concluido) ||
    localStorage.getItem(getOnboardingCompletedKey(session)) === "true";
  const isOnboardingRoute = location.pathname === "/entrada-ori";
  const isOnboardingPreview =
    import.meta.env.DEV &&
    new URLSearchParams(location.search).get("preview") === "profile";
  const isAdmin = Boolean(cliente?.admin);

  if (!isAdmin && !onboardingCompleted && !isOnboardingRoute) {
    return <Navigate to="/entrada-ori" replace state={{ from: location }} />;
  }

  if ((isAdmin || onboardingCompleted) && isOnboardingRoute && !isOnboardingPreview) {
    return <Navigate to="/portal" replace />;
  }

  return children;
}

export default ProtectedRoute;
