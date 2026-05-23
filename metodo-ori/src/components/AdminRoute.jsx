import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

import { supabase } from "../lib/supabaseClient";

function AdminRoute({ children }) {
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  async function checkAdmin() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("clientes")
      .select("admin")
      .eq("user_id", user.id)
      .maybeSingle();

    if (error) {
      console.log(error);
    }

    setIsAdmin(Boolean(data?.admin));
    setLoading(false);
  }

  useEffect(() => {
    Promise.resolve().then(checkAdmin);
  }, []);

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center px-4"
        style={{ color: "var(--text-primary)" }}
        role="status"
        aria-live="polite"
      >
        <div
          className="ori-card-secondary w-full max-w-md rounded-[28px] p-7 text-center"
          style={{
            background:
              "linear-gradient(135deg, rgba(18,9,10,0.82), rgba(5,2,2,0.94))",
            border: "1px solid rgba(242,185,104,0.12)",
          }}
        >
          <p
            className="ori-type-system mb-3 text-[10px]"
            style={{ color: "var(--gold-soft)" }}
          >
            Painel ORI
          </p>
          <p
            className="ori-type-reading-soft text-sm"
            style={{ color: "rgba(255,245,235,0.68)" }}
          >
            Verificando seu acesso administrativo...
          </p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/portal" replace />;
  }

  return children;
}

export default AdminRoute;
