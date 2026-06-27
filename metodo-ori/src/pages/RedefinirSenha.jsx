import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

import { supabase } from "../lib/supabaseClient";

function RedefinirSenha() {
  const navigate = useNavigate();

  const [senha, setSenha] = useState("");
  const [confirmacao, setConfirmacao] = useState("");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");
  const [mensagem, setMensagem] = useState("");

  const senhaReady = senha.length >= 6;
  const confirmacaoReady = confirmacao.length > 0 && confirmacao === senha;
  const formReady = senhaReady && confirmacaoReady;

  const getInputStyle = (active) => ({
    background: active ? "rgba(210,135,70,0.055)" : "rgba(255,255,255,0.028)",
    border: active
      ? "1px solid var(--copper-soft)"
      : "1px solid rgba(210,135,70,0.16)",
    color: "var(--text-primary)",
    boxShadow: active
      ? "0 0 26px rgba(210,135,70,0.08), inset 0 0 18px rgba(210,135,70,0.024)"
      : "inset 0 0 14px rgba(255,255,255,0.008)",
    caretColor: "var(--copper-primary)",
  });

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErro("");
    setMensagem("");

    if (senha.length < 6) {
      setErro("Crie uma senha com pelo menos 6 caracteres.");
      return;
    }

    if (senha !== confirmacao) {
      setErro("As senhas precisam ser iguais.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.updateUser({ password: senha });

    setLoading(false);

    if (error) {
      console.log("Erro ao redefinir senha:", error);
      setErro(
        "Não foi possível salvar a nova senha. Abra novamente o link do e-mail ou solicite outro link.",
      );
      return;
    }

    setMensagem("Senha redefinida. Você já pode acessar o Portal ORI.");

    window.setTimeout(() => {
      navigate("/portal", { replace: true });
    }, 1200);
  };

  return (
    <main
      className="min-h-screen relative overflow-hidden flex items-center justify-center px-5 py-8"
      style={{ background: "#050202" }}
    >
      <div className="absolute inset-0">
        <img
          src="/images/backgrounds/master-bg.png"
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-40"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(120deg, rgba(5,2,2,0.96), rgba(5,2,2,0.76), rgba(5,2,2,0.94))",
          }}
        />
      </div>

      <motion.form
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 14, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-[450px] rounded-[30px] p-6 md:p-7 overflow-hidden"
        style={{
          background:
            "radial-gradient(circle at top right, rgba(210,135,70,0.12), transparent 34%), linear-gradient(180deg, rgba(18,9,10,0.74), rgba(5,2,2,0.90))",
          border: "1px solid rgba(210,135,70,0.16)",
          boxShadow:
            "0 0 70px rgba(210,135,70,0.06), inset 0 0 62px rgba(255,255,255,0.012)",
        }}
      >
        <div className="relative z-10">
          <img
            src="/images/logo/logo-ori.png"
            alt="Método ORI"
            className="w-[112px] object-contain mb-5 select-none pointer-events-none"
            style={{ filter: "drop-shadow(0 0 22px rgba(242,185,104,0.14))" }}
          />

          <p
            className="ori-type-system text-[10px] mb-3"
            style={{ color: "var(--gold-soft)" }}
          >
            Redefinição de senha
          </p>

          <h1
            className="ori-type-revelation text-3xl md:text-[40px] mb-3"
            style={{
              color: "var(--gold-primary)",
              fontWeight: 600,
              letterSpacing: "-0.065em",
            }}
          >
            Crie sua nova senha
          </h1>

          <p
            className="ori-type-reading-soft text-sm mb-6"
            style={{ color: "var(--text-soft)" }}
          >
            Escolha uma senha com pelo menos 6 caracteres para voltar ao Portal ORI.
          </p>

          <div className="flex flex-col gap-3.5">
            <div>
              <label
                htmlFor="ori-new-password"
                className="ori-type-system block text-[10px] mb-2"
                style={{ color: "var(--gold-soft)" }}
              >
                Nova senha
              </label>

              <input
                id="ori-new-password"
                type="password"
                autoComplete="new-password"
                value={senha}
                onChange={(event) => setSenha(event.target.value)}
                placeholder="••••••••"
                required
                className="ori-input w-full px-5 py-3.5 rounded-2xl outline-none transition-all duration-500"
                style={getInputStyle(senhaReady)}
              />
            </div>

            <div>
              <label
                htmlFor="ori-confirm-password"
                className="ori-type-system block text-[10px] mb-2"
                style={{ color: "var(--gold-soft)" }}
              >
                Confirmar senha
              </label>

              <input
                id="ori-confirm-password"
                type="password"
                autoComplete="new-password"
                value={confirmacao}
                onChange={(event) => setConfirmacao(event.target.value)}
                placeholder="••••••••"
                required
                className="ori-input w-full px-5 py-3.5 rounded-2xl outline-none transition-all duration-500"
                style={getInputStyle(confirmacaoReady)}
              />
            </div>

            {erro && (
              <motion.div
                role="alert"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl p-3.5 text-sm leading-relaxed"
                style={{
                  background: "rgba(199,106,122,0.08)",
                  border: "1px solid rgba(199,106,122,0.18)",
                  color: "#f1b5bf",
                }}
              >
                {erro}
              </motion.div>
            )}

            {mensagem && (
              <motion.div
                role="status"
                aria-live="polite"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl p-3.5 text-sm leading-relaxed"
                style={{
                  background: "rgba(120,255,160,0.07)",
                  border: "1px solid rgba(120,255,160,0.15)",
                  color: "#9BE7AE",
                }}
              >
                {mensagem}
              </motion.div>
            )}

            <motion.button
              type="submit"
              disabled={loading}
              whileHover={
                loading
                  ? {}
                  : {
                      y: -1,
                      scale: 1.008,
                      boxShadow:
                        "0 0 44px rgba(210,135,70,0.24), inset 0 0 18px rgba(255,255,255,0.18)",
                    }
              }
              whileTap={loading ? {} : { scale: 0.994, y: 0 }}
              className="relative mt-2 px-8 py-4 rounded-full transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
              style={{
                background: formReady
                  ? "linear-gradient(90deg, rgba(210,135,70,0.96), rgba(242,185,104,0.92))"
                  : "linear-gradient(90deg, rgba(210,135,70,0.72), rgba(210,135,70,0.90))",
                color: "#090506",
                fontWeight: 600,
              }}
            >
              {loading ? "Salvando..." : "Salvar nova senha"}
            </motion.button>
          </div>

          <div
            className="mt-5 pt-4"
            style={{ borderTop: "1px solid rgba(242,185,104,0.08)" }}
          >
            <Link
              to="/entrar"
              className="inline-block text-sm transition-all"
              style={{ color: "var(--gold-primary)" }}
            >
              Voltar para o login
            </Link>
          </div>
        </div>
      </motion.form>
    </main>
  );
}

export default RedefinirSenha;
