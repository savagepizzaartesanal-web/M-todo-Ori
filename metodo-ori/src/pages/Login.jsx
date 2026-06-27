import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

import { supabase } from "../lib/supabaseClient";

function Login() {
  const navigate = useNavigate();

  const [modo, setModo] = useState("login");
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState("");
  const [erro, setErro] = useState("");
  const [mensagem, setMensagem] = useState("");

  const isCadastro = modo === "cadastro";
  const nomeReady = nome.trim().length > 1;
  const emailReady = email.trim().includes("@") && email.trim().includes(".");
  const senhaReady = senha.length >= 6;
  const formReady = isCadastro
    ? nomeReady && emailReady && senhaReady
    : emailReady && senha.length > 0;

  const chips = useMemo(
    () => ["Leitura arquetípica", "Imagem simbólica", "Presença estética"],
    [],
  );

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

  const getToggleButtonStyle = (active) => ({
    background: active ? "rgba(210,135,70,0.13)" : "rgba(255,255,255,0.015)",
    border: active
      ? "1px solid var(--copper-soft)"
      : "1px solid rgba(210,135,70,0.10)",
    color: active ? "var(--copper-primary)" : "rgba(255,245,235,0.60)",
    boxShadow: active
      ? "0 0 18px rgba(210,135,70,0.10), inset 0 0 16px rgba(210,135,70,0.025)"
      : "inset 0 0 10px rgba(255,255,255,0.006)",
  });

  const resetFeedback = () => {
    setErro("");
    setMensagem("");
  };

  const resetPasswordRecovery = () => {
    setRecoveryEmail("");
    setResetLoading(false);
  };

  const handleLogin = async (event) => {
    event.preventDefault();

    resetFeedback();
    setLoading(true);

    const emailLimpo = email.trim().toLowerCase();

    const { error } = await supabase.auth.signInWithPassword({
      email: emailLimpo,
      password: senha,
    });

    setLoading(false);

    if (error) {
      console.log("Erro no login:", error);

      const message = error.message?.toLowerCase() || "";

      if (message.includes("email not confirmed")) {
        setErro(
          "Seu e-mail ainda não foi confirmado. Verifique sua caixa de entrada ou fale com a equipe ORI.",
        );
        return;
      }

      if (message.includes("invalid login credentials")) {
        setErro("E-mail ou senha incorretos. Verifique seus dados de acesso.");
        return;
      }

      setErro(
        "Não foi possível acessar agora. Verifique sua conexão e tente novamente em instantes.",
      );
      return;
    }

    navigate("/portal");
  };

  const handleCadastro = async (event) => {
    event.preventDefault();

    resetFeedback();

    const nomeLimpo = nome.trim();
    const emailLimpo = email.trim().toLowerCase();

    if (!nomeLimpo) {
      setErro("Informe seu nome para criar o acesso.");
      return;
    }

    if (!emailLimpo) {
      setErro("Informe seu e-mail para criar o acesso.");
      return;
    }

    if (senha.length < 6) {
      setErro("Crie uma senha com pelo menos 6 caracteres.");
      return;
    }

    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email: emailLimpo,
      password: senha,
      options: {
        data: {
          nome: nomeLimpo,
        },
      },
    });

    if (error) {
      console.log("Erro no cadastro:", error);

      setLoading(false);

      const message = error.message?.toLowerCase() || "";

      if (
        message.includes("already") ||
        message.includes("registered") ||
        message.includes("user already")
      ) {
        setErro("Este e-mail já possui cadastro. Tente entrar no portal.");
        return;
      }

      if (message.includes("database")) {
        setErro(
          "Seu acesso foi criado, mas ainda não conseguimos preparar o perfil da jornada. Tente entrar novamente em instantes ou fale com a equipe ORI.",
        );
        return;
      }

      if (message.includes("password")) {
        setErro("A senha precisa ter pelo menos 6 caracteres.");
        return;
      }

      if (message.includes("email")) {
        setErro(
          "Verifique se o e-mail foi digitado corretamente e tente novamente.",
        );
        return;
      }

      setErro(
        "Não foi possível criar seu acesso agora. Tente novamente em instantes.",
      );
      return;
    }

    const userId = data?.user?.id;
    const userEmail = data?.user?.email || emailLimpo;

    if (!userId) {
      setLoading(false);
      setMensagem(
        "Cadastro criado. Agora tente entrar com seu e-mail e senha.",
      );
      setModo("login");
      return;
    }

    const { error: clienteError } = await supabase.from("clientes").upsert(
      {
        user_id: userId,
        nome: nomeLimpo,
        email: userEmail,
        admin: false,
        produto_1_liberado: true,
        produto_2_liberado: false,
        produto_3_liberado: false,
        status_jornada: "Produto 1",
      },
      {
        onConflict: "email",
      },
    );

    if (clienteError) {
      console.log("Erro ao registrar lead/cliente:", clienteError);

      setLoading(false);

      setErro(
        "Seu acesso foi criado, mas o perfil da jornada ainda não ficou pronto. Tente entrar novamente em instantes ou fale com a equipe ORI.",
      );
      return;
    }

    setLoading(false);

    if (data?.session) {
      navigate("/portal");
      return;
    }

    setMensagem("Cadastro criado. Agora tente entrar com seu e-mail e senha.");
    setModo("login");
  };

  const handlePasswordRecovery = async () => {
    resetFeedback();

    const emailLimpo = email.trim().toLowerCase();

    if (!emailLimpo) {
      setErro("Informe seu e-mail para receber o link de redefinição.");
      return;
    }

    setRecoveryEmail(emailLimpo);
  };

  const sendPasswordRecovery = async () => {
    resetFeedback();

    if (!recoveryEmail) {
      setErro("Confirme o e-mail antes de enviar o link de redefinição.");
      return;
    }

    setResetLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(recoveryEmail, {
      redirectTo: `${window.location.origin}/redefinir-senha`,
    });

    setResetLoading(false);

    if (error) {
      console.log("Erro ao enviar recuperação de senha:", error);
      setErro(
        "Não foi possível enviar o link agora. Verifique o e-mail e tente novamente.",
      );
      return;
    }

    setMensagem(
      "Enviamos um link para seu e-mail. Abra a mensagem e crie uma nova senha.",
    );
    setRecoveryEmail("");
  };

  const handleSubmit = isCadastro ? handleCadastro : handleLogin;

  return (
    <div
      className="
        min-h-screen
        lg:h-screen
        relative
        overflow-hidden
        flex
        items-center
        justify-center
        px-5
        py-6
        lg:py-4
      "
      style={{ background: "#050202" }}
    >
      <style>{`
        @keyframes oriPulseGlow {
          0%, 100% { opacity: 0.24; transform: scale(1); }
          50% { opacity: 0.40; transform: scale(1.04); }
        }

        @keyframes oriScannerDrift {
          0% { transform: translateX(-8%); opacity: 0; }
          15% { opacity: 0.10; }
          50% { opacity: 0.14; }
          85% { opacity: 0.08; }
          100% { transform: translateX(14%); opacity: 0; }
        }

        @keyframes oriParticleFloat {
          0%, 100% { transform: translate3d(0, 0, 0); opacity: 0.18; }
          50% { transform: translate3d(0, -10px, 0); opacity: 0.32; }
        }

        .ori-glow-breath {
          animation: oriPulseGlow 7.2s ease-in-out infinite;
        }

        .ori-scanner {
          animation: oriScannerDrift 8.5s ease-in-out infinite;
        }

        .ori-particle {
          animation: oriParticleFloat 5.8s ease-in-out infinite;
        }

        .ori-input::placeholder {
          color: rgba(255, 245, 235, 0.34);
        }

        .ori-login-bg-video {
          opacity: 0.82;
        }

        .ori-login-bg-overlay {
          background:
            linear-gradient(90deg, rgba(5,2,2,0.97) 0%, rgba(5,2,2,0.92) 16%, rgba(5,2,2,0.78) 30%, rgba(5,2,2,0.52) 52%, rgba(5,2,2,0.80) 100%),
            linear-gradient(180deg, rgba(0,0,0,0.22), rgba(0,0,0,0.62));
        }

        @media (max-width: 767px) {
          .ori-login-bg-video {
            opacity: 0.98;
          }

          .ori-login-bg-overlay {
            background:
              linear-gradient(180deg, rgba(5,2,2,0.22), rgba(5,2,2,0.72)),
              linear-gradient(90deg, rgba(5,2,2,0.66), rgba(5,2,2,0.28) 52%, rgba(5,2,2,0.78));
          }

          .ori-login-card {
            background:
              radial-gradient(circle at top right, rgba(210,135,70,0.10), transparent 34%),
              linear-gradient(180deg, rgba(18,9,10,0.42), rgba(5,2,2,0.58)) !important;
            border-color: rgba(210,135,70,0.13) !important;
            box-shadow:
              0 0 42px rgba(0,0,0,0.20),
              inset 0 0 42px rgba(255,255,255,0.010) !important;
            backdrop-filter: none !important;
            -webkit-backdrop-filter: none !important;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .ori-glow-breath,
          .ori-scanner,
          .ori-particle {
            animation: none;
          }
        }
      `}</style>

      <div className="absolute inset-0">
        <video
          aria-hidden="true"
          className="ori-login-bg-video absolute inset-0 w-full h-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
        >
          <source src="/videos/login/login-bg.mp4" type="video/mp4" />
        </video>

        <div className="ori-login-bg-overlay absolute inset-0" />

        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(circle at 16% 34%, rgba(210,135,70,0.13), transparent 22%), radial-gradient(circle at 84% 72%, rgba(33,6,6,0.25), transparent 32%), radial-gradient(circle at 78% 18%, rgba(183,140,255,0.06), transparent 28%)",
          }}
        />

        <div
          className="absolute inset-0 pointer-events-none opacity-[0.018]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(242,185,104,0.18) 1px, transparent 1px), linear-gradient(90deg, rgba(242,185,104,0.08) 1px, transparent 1px)",
            backgroundSize: "84px 84px",
          }}
        />
      </div>

      <div
        className="absolute left-[6%] top-[10%] w-[340px] h-[340px] rounded-full blur-3xl opacity-[0.11] pointer-events-none ori-glow-breath"
        style={{
          background:
            "radial-gradient(circle, rgba(210,135,70,0.24), rgba(33,6,6,0.25) 42%, transparent 68%)",
        }}
      />

      <div
        className="absolute top-[-260px] right-[-180px] w-[760px] h-[760px] rounded-full blur-3xl opacity-[0.08] pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(210,135,70,0.22), rgba(33,6,6,0.25) 44%, transparent 68%)",
        }}
      />

      <div
        className="absolute bottom-[-280px] left-[-180px] w-[620px] h-[620px] rounded-full blur-3xl opacity-[0.06] pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(183,140,255,0.20), transparent 70%)",
        }}
      />

      <div className="absolute inset-y-0 left-[9%] w-[1px] pointer-events-none ori-scanner">
        <div
          className="h-full w-full"
          style={{
            background:
              "linear-gradient(180deg, transparent 0%, rgba(210,135,70,0.00) 16%, rgba(210,135,70,0.18) 50%, rgba(210,135,70,0.00) 84%, transparent 100%)",
            boxShadow: "0 0 18px rgba(210,135,70,0.18)",
          }}
        />
      </div>

      <div className="absolute left-[12%] top-[34%] w-2 h-2 rounded-full bg-[rgba(242,185,104,0.55)] blur-[1px] pointer-events-none ori-particle" />
      <div
        className="absolute left-[18%] top-[59%] w-1.5 h-1.5 rounded-full bg-[rgba(242,185,104,0.48)] blur-[1px] pointer-events-none ori-particle"
        style={{ animationDelay: "1.2s" }}
      />
      <div
        className="absolute left-[24%] top-[23%] w-1.5 h-1.5 rounded-full bg-[rgba(242,185,104,0.38)] blur-[1px] pointer-events-none ori-particle"
        style={{ animationDelay: "2.1s" }}
      />

      <div
        className="
          relative
          z-10
          w-full
          max-w-6xl
          grid
          lg:grid-cols-[minmax(0,1fr)_450px]
          gap-8
          lg:gap-12
          items-center
        "
      >
        <motion.div
          className="hidden lg:flex min-h-[78vh] items-center"
          initial={false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="w-full max-w-[470px] pl-3 xl:pl-6">
            <motion.div
              className="relative mb-7"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.08, duration: 0.9 }}
            >
              <div
                className="absolute -left-8 -top-8 w-[220px] h-[220px] rounded-full pointer-events-none ori-glow-breath"
                style={{
                  background:
                    "radial-gradient(circle, rgba(242,185,104,0.09), transparent 62%)",
                  filter: "blur(12px)",
                }}
              />

              <img
                src="/images/logo/logo-ori.png"
                alt="Método ORI"
                className="relative z-10 w-[118px] xl:w-[132px] object-contain select-none pointer-events-none"
                style={{
                  filter: "drop-shadow(0 0 20px rgba(242,185,104,0.14))",
                }}
              />
            </motion.div>

            <div className="inline-flex items-center gap-4 mb-4">
              <div
                className="w-8 h-px"
                style={{
                  background:
                    "linear-gradient(90deg, var(--gold-primary), transparent)",
                }}
              />

              <p
                className="ori-type-system text-[10px]"
                style={{ color: "var(--gold-soft)" }}
              >
                Método ORI by Telúrica
              </p>
            </div>

            <h1
              className="ori-type-hero text-[56px] xl:text-[68px] mb-4"
              style={{
                color: "var(--gold-primary)",
                fontWeight: 600,
                letterSpacing: "-0.078em",
                textShadow: "0 0 36px rgba(242,185,104,0.13)",
              }}
            >
              Portal ORI
            </h1>

            <p
              className="ori-type-revelation text-[26px] xl:text-[30px] max-w-[430px] mb-5"
              style={{
                color: "rgba(255,245,235,0.92)",
                letterSpacing: "-0.04em",
                fontWeight: 350,
              }}
            >
              Onde essência, presença e imagem ganham direção
            </p>

            <p
              className="ori-type-reading-soft text-base xl:text-lg max-w-[410px] mb-7"
              style={{ color: "var(--text-soft)" }}
            >
              Acesse o ambiente em que sua leitura simbólica começa a se
              traduzir visualmente.
            </p>

            <div className="flex flex-wrap gap-3 max-w-[430px]">
              {chips.map((item, index) => (
                <motion.span
                  key={item}
                  className="ori-chip px-4 py-2 text-xs cursor-default"
                  data-state="revealed"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + index * 0.08, duration: 0.45 }}
                  whileHover={{
                    y: -1,
                    scale: 1.015,
                  }}
                  style={{
                    background: "rgba(255,255,255,0.022)",
                    border: "1px solid rgba(242,185,104,0.09)",
                    color: "rgba(255,245,235,0.68)",
                    backdropFilter: "blur(10px)",
                    WebkitBackdropFilter: "blur(10px)",
                    boxShadow:
                      "inset 0 0 12px rgba(255,255,255,0.008), 0 0 0 rgba(242,185,104,0)",
                  }}
                >
                  {item}
                </motion.span>
              ))}
            </div>
          </div>
        </motion.div>

        <div className="flex justify-center">
          <motion.form
            onSubmit={handleSubmit}
            aria-describedby={
              erro ? "ori-login-error" : mensagem ? "ori-login-message" : undefined
            }
            initial={false}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{
              delay: 0.12,
              duration: 0.85,
              ease: [0.16, 1, 0.3, 1],
            }}
            whileHover={{
              boxShadow:
                "0 0 84px rgba(242,185,104,0.07), inset 0 0 62px rgba(255,255,255,0.014)",
            }}
            className="
              ori-login-card
              relative
              z-10
              w-full
              max-w-[450px]
              rounded-[30px]
              md:rounded-[36px]
              p-6
              md:p-7
              overflow-hidden
            "
            style={{
              background:
                "radial-gradient(circle at top right, rgba(210,135,70,0.12), transparent 34%), radial-gradient(circle at bottom left, rgba(33,6,6,0.25), transparent 42%), linear-gradient(180deg, rgba(18,9,10,0.66), rgba(5,2,2,0.86))",
              border: "1px solid rgba(210,135,70,0.16)",
              boxShadow:
                "0 0 70px rgba(210,135,70,0.055), inset 0 0 62px rgba(255,255,255,0.012)",
              backdropFilter: "blur(18px)",
              WebkitBackdropFilter: "blur(18px)",
            }}
          >
            <div
              className="absolute inset-0 pointer-events-none opacity-[0.024]"
              style={{
                backgroundImage:
                  "linear-gradient(rgba(210,135,70,0.22) 1px, transparent 1px), linear-gradient(90deg, rgba(210,135,70,0.10) 1px, transparent 1px)",
                backgroundSize: "64px 64px",
              }}
            />

            <div
              className="absolute -top-24 -right-24 w-[280px] h-[280px] rounded-full blur-3xl opacity-[0.10] pointer-events-none"
              style={{ background: "var(--copper-primary)" }}
            />

            <div className="relative z-10">
              <div className="lg:hidden flex flex-col items-center text-center mb-6">
                <img
                  src="/images/logo/logo-ori.png"
                  alt="Método ORI"
                  className="w-[124px] object-contain mb-4 select-none pointer-events-none"
                  style={{
                    filter: "drop-shadow(0 0 22px rgba(242,185,104,0.14))",
                  }}
                />

                <p
                  className="ori-type-system text-[10px] mb-3"
                  style={{ color: "var(--gold-soft)" }}
                >
                  Método ORI by Telúrica
                </p>

                <h1
                  className="ori-type-hero text-[38px] mb-3"
                  style={{
                    color: "var(--gold-primary)",
                    fontWeight: 600,
                    letterSpacing: "-0.065em",
                  }}
                >
                  Portal ORI
                </h1>

                <p
                  className="ori-type-revelation text-base max-w-[290px] mb-3"
                  style={{
                    color: "rgba(255,245,235,0.92)",
                    letterSpacing: "-0.03em",
                    fontWeight: 350,
                  }}
                >
                  Onde essência, presença e imagem ganham direção
                </p>

                <p
                  className="ori-type-reading-soft text-sm max-w-[280px]"
                  style={{ color: "var(--text-soft)" }}
                >
                  Acesse o ambiente em que sua leitura simbólica começa a se
                  traduzir visualmente.
                </p>
              </div>

              <div className="inline-flex items-center gap-4 mb-4">
                <div
                  className="w-8 h-px"
                  style={{
                    background:
                      "linear-gradient(90deg, var(--gold-primary), transparent)",
                  }}
                />

                <p
                  className="ori-type-system text-[10px]"
                  style={{ color: "var(--gold-soft)" }}
                >
                  Portal de Acesso
                </p>
              </div>

              <h2
                className="ori-type-revelation text-3xl md:text-[40px] mb-3"
                style={{
                  color: "var(--gold-primary)",
                  fontWeight: 600,
                  letterSpacing: "-0.065em",
                  textShadow: "0 0 34px rgba(242,185,104,0.12)",
                }}
              >
                {isCadastro ? "Criar acesso ORI" : "Entrar no Átrio ORI"}
              </h2>

              <p
                className="ori-type-reading-soft text-sm mb-5"
                style={{ color: "var(--text-soft)" }}
              >
                {isCadastro
                  ? "Abra sua primeira porta e inicie a leitura da sua presença."
                  : "Acesse sua jornada e continue de onde sua leitura parou."}
              </p>

              <div
                className="grid grid-cols-2 gap-2 p-1.5 rounded-full mb-5"
                style={{
                  background: "rgba(255,255,255,0.024)",
                  border: "1px solid rgba(210,135,70,0.12)",
                }}
              >
                <motion.button
                  type="button"
                  aria-pressed={modo === "login"}
                  onClick={() => {
                    setModo("login");
                    resetFeedback();
                    resetPasswordRecovery();
                  }}
                  whileHover={{
                    y: -1,
                    scale: 1.01,
                    backgroundColor: "rgba(210,135,70,0.10)",
                    boxShadow: "0 0 22px rgba(210,135,70,0.12)",
                  }}
                  whileTap={{ scale: 0.992, y: 0 }}
                  transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                  className="relative rounded-full px-4 py-2.5 text-sm transition-all duration-300 overflow-hidden"
                  style={getToggleButtonStyle(modo === "login")}
                >
                  Entrar
                </motion.button>

                <motion.button
                  type="button"
                  aria-pressed={modo === "cadastro"}
                  onClick={() => {
                    setModo("cadastro");
                    resetFeedback();
                    resetPasswordRecovery();
                  }}
                  whileHover={{
                    y: -1,
                    scale: 1.01,
                    backgroundColor: "rgba(210,135,70,0.10)",
                    boxShadow: "0 0 22px rgba(210,135,70,0.12)",
                  }}
                  whileTap={{ scale: 0.992, y: 0 }}
                  transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                  className="relative rounded-full px-4 py-2.5 text-sm transition-all duration-300 overflow-hidden"
                  style={getToggleButtonStyle(modo === "cadastro")}
                >
                  Criar acesso
                </motion.button>
              </div>

              <div>
                <div className="flex flex-col gap-3.5">
                  {isCadastro && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <label
                        htmlFor="ori-login-name"
                        className="ori-type-system block text-[10px] mb-2"
                        style={{ color: "var(--gold-soft)" }}
                      >
                        Nome
                      </label>

                      <input
                        id="ori-login-name"
                        type="text"
                        autoComplete="name"
                        value={nome}
                        onChange={(event) => setNome(event.target.value)}
                        placeholder="Seu nome"
                        required={isCadastro}
                        className="ori-input w-full px-5 py-3.5 rounded-2xl outline-none transition-all duration-500"
                        style={getInputStyle(nomeReady)}
                      />
                    </motion.div>
                  )}

                  <div>
                    <label
                      htmlFor="ori-login-email"
                      className="ori-type-system block text-[10px] mb-2"
                      style={{ color: "var(--gold-soft)" }}
                    >
                      E-mail
                    </label>

                    <input
                      id="ori-login-email"
                      type="email"
                      autoComplete="email"
                      inputMode="email"
                      value={email}
                      onChange={(event) => {
                        setEmail(event.target.value);
                        resetPasswordRecovery();
                      }}
                      placeholder="seunome@email.com"
                      required
                      className="ori-input w-full px-5 py-3.5 rounded-2xl outline-none transition-all duration-500"
                      style={getInputStyle(emailReady)}
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="ori-login-password"
                      className="ori-type-system block text-[10px] mb-2"
                      style={{ color: "var(--gold-soft)" }}
                    >
                      Senha
                    </label>

                    <input
                      id="ori-login-password"
                      type="password"
                      autoComplete={isCadastro ? "new-password" : "current-password"}
                      value={senha}
                      onChange={(event) => setSenha(event.target.value)}
                      placeholder="••••••••"
                      required
                      className="ori-input w-full px-5 py-3.5 rounded-2xl outline-none transition-all duration-500"
                      style={getInputStyle(
                        isCadastro ? senhaReady : senha.length > 0,
                      )}
                    />

                    {!isCadastro && (
                      <div className="mt-2 flex justify-end">
                        <motion.button
                          type="button"
                          disabled={resetLoading || loading}
                          onClick={handlePasswordRecovery}
                          whileHover={
                            resetLoading || loading ? {} : { x: 2, opacity: 1 }
                          }
                          className="text-xs transition-all disabled:cursor-not-allowed disabled:opacity-60"
                          style={{ color: "var(--gold-primary)" }}
                        >
                          {resetLoading
                            ? "Enviando link..."
                            : "Esqueci minha senha"}
                        </motion.button>
                      </div>
                    )}
                  </div>

                  {recoveryEmail && !isCadastro && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="rounded-2xl p-3.5 text-sm leading-relaxed"
                      style={{
                        background: "rgba(210,135,70,0.06)",
                        border: "1px solid rgba(210,135,70,0.16)",
                        color: "rgba(255,245,235,0.78)",
                      }}
                    >
                      <p className="mb-3">
                        Vamos enviar o link de redefinição para{" "}
                        <span style={{ color: "var(--gold-primary)" }}>
                          {recoveryEmail}
                        </span>
                        .
                      </p>

                      <div className="flex flex-wrap gap-2">
                        <motion.button
                          type="button"
                          disabled={resetLoading}
                          onClick={sendPasswordRecovery}
                          whileHover={resetLoading ? {} : { y: -1 }}
                          className="rounded-full px-4 py-2 text-xs transition-all disabled:cursor-not-allowed disabled:opacity-60"
                          style={{
                            background:
                              "linear-gradient(90deg, rgba(210,135,70,0.96), rgba(242,185,104,0.92))",
                            color: "#090506",
                            fontWeight: 600,
                          }}
                        >
                          {resetLoading
                            ? "Enviando..."
                            : "Confirmar e enviar link"}
                        </motion.button>

                        <button
                          type="button"
                          disabled={resetLoading}
                          onClick={() => setRecoveryEmail("")}
                          className="rounded-full px-4 py-2 text-xs transition-all disabled:cursor-not-allowed disabled:opacity-60"
                          style={{
                            border: "1px solid rgba(242,185,104,0.16)",
                            color: "var(--gold-primary)",
                          }}
                        >
                          Corrigir e-mail
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {erro && (
                    <motion.div
                      id="ori-login-error"
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
                      id="ori-login-message"
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
                            filter: "brightness(1.03)",
                          }
                    }
                    whileTap={loading ? {} : { scale: 0.994, y: 0 }}
                    transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                    className="relative mt-2 px-8 py-4 rounded-full transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed overflow-hidden"
                    style={{
                      background: formReady
                        ? "linear-gradient(90deg, rgba(210,135,70,0.96), rgba(242,185,104,0.92))"
                        : "linear-gradient(90deg, rgba(210,135,70,0.72), rgba(210,135,70,0.90))",
                      color: "#090506",
                      fontWeight: 600,
                      boxShadow: formReady
                        ? "0 0 36px rgba(210,135,70,0.18), inset 0 0 18px rgba(255,255,255,0.18)"
                        : "0 0 22px rgba(210,135,70,0.12), inset 0 0 18px rgba(255,255,255,0.14)",
                    }}
                  >
                    {loading
                      ? isCadastro
                        ? "Criando acesso..."
                        : "Acessando..."
                      : isCadastro
                        ? formReady
                          ? "Abrir minha primeira porta"
                          : "Criar meu acesso ORI"
                        : formReady
                          ? "Abrir meu portal"
                          : "Acessar Portal ORI"}
                  </motion.button>
                </div>

                <div
                  className="mt-5 pt-4"
                  style={{
                    borderTop: "1px solid rgba(242,185,104,0.08)",
                  }}
                >
                  <p
                    className="ori-type-reading-soft text-xs"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {isCadastro
                      ? "Seu cadastro será registrado como lead da jornada ORI."
                      : "Acesso exclusivo para clientes com jornada liberada."}
                  </p>

                  <motion.div whileHover={{ x: 3 }}>
                    <Link
                      to="/"
                      className="inline-block mt-3 text-sm transition-all"
                      style={{ color: "var(--gold-primary)" }}
                    >
                      ← Voltar ao início
                    </Link>
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.form>
        </div>
      </div>
    </div>
  );
}

export default Login;
