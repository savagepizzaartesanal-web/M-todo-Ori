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
        className="min-h-screen flex items-center justify-center"
        style={{ color: "var(--text-soft)" }}
      >
        Verificando acesso...
      </div>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/portal" replace />;
  }

  return children;
}

export default AdminRoute;
