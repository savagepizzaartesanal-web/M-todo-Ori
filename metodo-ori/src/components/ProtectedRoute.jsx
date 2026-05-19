import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

import { supabase } from "../lib/supabaseClient";

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
        className="w-full max-w-xl rounded-[34px] p-8 md:p-10 text-center"
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
          className="uppercase tracking-[0.45em] text-[10px] md:text-xs mb-5"
          style={{ color: "var(--gold-soft)" }}
        >
          Validando acesso
        </p>

        <h1
          className="text-3xl md:text-4xl font-semibold"
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
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);

  useEffect(() => {
    let isMounted = true;

    async function loadSession() {
      try {
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          console.log("Erro ao validar sessão:", error);
        }

        if (!isMounted) return;

        setSession(data?.session || null);
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

  return children;
}

export default ProtectedRoute;
