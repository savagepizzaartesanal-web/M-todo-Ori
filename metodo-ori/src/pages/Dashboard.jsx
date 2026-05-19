import { Link } from "react-router-dom";

const STORAGE_KEY = "ori_produto_1_quiz";

function Dashboard() {
  const savedQuiz = localStorage.getItem(STORAGE_KEY);
  const parsedQuiz = savedQuiz ? JSON.parse(savedQuiz) : null;

  const answers = parsedQuiz?.answers || {};
  const result = parsedQuiz?.result || null;

  const hasAnswers = Object.keys(answers).length > 0;
  const hasResult = Boolean(result);

  const portalStatus = hasResult
    ? "Leitura revelada"
    : hasAnswers
      ? "Em andamento"
      : "Disponível";

  const portalButtonText = hasResult
    ? "Leitura Arquetípica Completa"
    : hasAnswers
      ? "Continuar leitura"
      : "Iniciar leitura arquetípica";

  return (
    <div className="relative overflow-hidden">
      <div
        className="absolute top-[-220px] right-[-160px] w-[760px] h-[760px] rounded-full blur-3xl opacity-20 pointer-events-none"
        style={{ background: "var(--gold-primary)" }}
      />

      <div
        className="absolute bottom-[-260px] left-[-180px] w-[620px] h-[620px] rounded-full blur-3xl opacity-20 pointer-events-none"
        style={{ background: "var(--lavender-shadow)" }}
      />

      <div className="max-w-7xl">
        <section
          className="relative overflow-hidden rounded-[40px] md:rounded-[56px] p-8 md:p-14 mb-12 md:mb-16 cinematic-card"
          style={{
            background:
              "radial-gradient(circle at top right, rgba(242,185,104,0.12), transparent 34%), radial-gradient(circle at bottom left, rgba(140,111,145,0.12), transparent 42%), linear-gradient(180deg, rgba(18,9,10,0.98), rgba(5,2,2,1))",
            border: "1px solid var(--border-primary)",
            boxShadow: "0 0 120px rgba(242,185,104,0.08)",
          }}
        >
          <div
            className="absolute inset-0 pointer-events-none opacity-[0.07]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)",
              backgroundSize: "90px 90px",
            }}
          />

          <div className="relative z-10">
            <p
              className="uppercase tracking-[0.55em] text-[10px] md:text-xs mb-6 reveal-step"
              style={{
                color: "var(--gold-soft)",
                "--delay": "0.05s",
              }}
            >
              Espaço de Jornada
            </p>

            <h1
              className="text-5xl md:text-7xl xl:text-8xl leading-[0.9] mb-10 reveal-step"
              style={{
                color: "var(--gold-primary)",
                fontWeight: 600,
                letterSpacing: "-0.06em",
                textShadow: "0 0 70px rgba(242,185,104,0.16)",
                "--delay": "0.18s",
              }}
            >
              Átrio
              <br />
              ORI
            </h1>

            <p
              className="text-2xl md:text-3xl leading-relaxed max-w-4xl mb-10 reveal-step"
              style={{
                color: "var(--text-primary)",
                "--delay": "0.32s",
              }}
            >
              Sua imagem não começa no espelho.
              <br />
              Começa na psique.
            </p>

            <p
              className="text-lg md:text-xl leading-relaxed max-w-3xl mb-12 reveal-step"
              style={{
                color: "var(--text-soft)",
                "--delay": "0.46s",
              }}
            >
              Entre nos portais do Método ORI para revelar sua essência
              arquetípica, traduzir sua presença em imagem e construir uma
              estética profundamente coerente com quem você é.
            </p>

            <Link
              to="/produto-1"
              className="reveal-step inline-flex justify-center px-8 md:px-10 py-5 rounded-full font-medium transition-all hover:scale-[1.03] w-full md:w-fit"
              style={{
                background: "var(--gold-primary)",
                color: "#090506",
                boxShadow: "0 0 60px rgba(242,185,104,0.2)",
                "--delay": "0.62s",
              }}
            >
              {portalButtonText}
            </Link>
          </div>
        </section>

        <div className="mb-8">
          <p
            className="uppercase tracking-[0.45em] text-[10px] md:text-xs mb-4"
            style={{ color: "var(--gold-soft)" }}
          >
            Mapa dos Portais
          </p>

          <h2
            className="text-3xl md:text-5xl font-semibold"
            style={{
              color: "var(--gold-primary)",
              letterSpacing: "-0.04em",
            }}
          >
            Sua jornada de imagem arquetípica
          </h2>
        </div>

        <div className="grid xl:grid-cols-3 gap-8">
          <div
            className="group cinematic-card relative overflow-hidden rounded-[36px] md:rounded-[44px] p-8 md:p-10"
            style={{
              background:
                "radial-gradient(circle at top right, rgba(242,185,104,0.1), transparent 36%), linear-gradient(180deg, rgba(18,9,10,0.98), rgba(7,3,4,1))",
              border: hasResult
                ? "1px solid rgba(120,255,160,0.2)"
                : "1px solid rgba(242,185,104,0.18)",
              boxShadow: hasResult
                ? "0 0 100px rgba(120,255,160,0.06)"
                : "0 0 90px rgba(242,185,104,0.055)",
            }}
          >
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
              style={{
                background:
                  "radial-gradient(circle at top left, rgba(242,185,104,0.08), transparent 46%)",
              }}
            />

            <div
              className="absolute top-0 left-0 w-full h-px"
              style={{
                background:
                  "linear-gradient(to right, transparent, rgba(242,185,104,0.42), transparent)",
              }}
            />

            <div className="relative z-10">
              <div className="flex items-center justify-between gap-4 mb-8">
                <p
                  className="uppercase tracking-[0.35em] text-xs"
                  style={{ color: "var(--gold-soft)" }}
                >
                  Portal 01
                </p>

                <div
                  className="w-3 h-3 rounded-full"
                  style={{
                    background: hasResult
                      ? "#9BE7AE"
                      : hasAnswers
                        ? "var(--gold-primary)"
                        : "rgba(255,255,255,0.22)",
                    boxShadow: hasResult
                      ? "0 0 20px rgba(120,255,160,0.35)"
                      : hasAnswers
                        ? "0 0 20px rgba(242,185,104,0.35)"
                        : "none",
                  }}
                />
              </div>

              <h2
                className="text-3xl md:text-4xl mb-6 leading-tight"
                style={{ color: "var(--gold-primary)", fontWeight: 600 }}
              >
                Código das Deusas
              </h2>

              <p
                className="text-lg leading-relaxed mb-8"
                style={{ color: "var(--text-soft)" }}
              >
                Revelação simbólica da sua essência arquetípica, padrões
                emocionais, magnetismo, sombra e presença.
              </p>

              {hasResult && (
                <div
                  className="rounded-[28px] p-5 mb-8"
                  style={{
                    background: "rgba(242,185,104,0.045)",
                    border: "1px solid rgba(242,185,104,0.12)",
                  }}
                >
                  <p
                    className="uppercase tracking-[0.35em] text-[10px] mb-3"
                    style={{ color: "var(--gold-soft)" }}
                  >
                    Código revelado
                  </p>

                  <p
                    className="text-2xl leading-tight"
                    style={{ color: "var(--gold-primary)", fontWeight: 600 }}
                  >
                    {result.nomeComposto}
                  </p>
                </div>
              )}

              <div className="flex flex-col gap-4 items-start">
                <div
                  className="inline-flex px-5 py-2 rounded-full text-sm"
                  style={{
                    background: hasResult
                      ? "rgba(120,255,160,0.08)"
                      : hasAnswers
                        ? "rgba(242,185,104,0.08)"
                        : "rgba(255,255,255,0.04)",
                    border: hasResult
                      ? "1px solid rgba(120,255,160,0.12)"
                      : hasAnswers
                        ? "1px solid rgba(242,185,104,0.16)"
                        : "1px solid rgba(255,255,255,0.08)",
                    color: hasResult
                      ? "#9BE7AE"
                      : hasAnswers
                        ? "var(--gold-primary)"
                        : "var(--text-soft)",
                  }}
                >
                  {portalStatus}
                </div>

                <Link
                  to="/produto-1"
                  className="inline-flex justify-center px-6 py-3 rounded-full font-medium transition-all hover:scale-[1.03] w-full md:w-fit"
                  style={{
                    background: hasResult
                      ? "rgba(242,185,104,0.08)"
                      : "var(--gold-primary)",
                    border: hasResult
                      ? "1px solid var(--border-primary)"
                      : "none",
                    color: hasResult ? "var(--text-soft)" : "#090506",
                  }}
                >
                  {portalButtonText}
                </Link>
              </div>
            </div>
          </div>

          <div
            className="group cinematic-card relative overflow-hidden rounded-[36px] md:rounded-[44px] p-8 md:p-10 opacity-75"
            style={{
              background:
                "radial-gradient(circle at top right, rgba(140,111,145,0.09), transparent 36%), linear-gradient(180deg, rgba(18,9,10,0.96), rgba(7,3,4,1))",
              border: "1px solid var(--border-primary)",
            }}
          >
            <div className="relative z-10">
              <p
                className="uppercase tracking-[0.35em] text-xs mb-8"
                style={{ color: "var(--gold-soft)" }}
              >
                Portal 02
              </p>

              <h2
                className="text-3xl md:text-4xl mb-6 leading-tight"
                style={{ color: "var(--gold-primary)", fontWeight: 600 }}
              >
                Dossiê Ori
              </h2>

              <p
                className="text-lg leading-relaxed mb-10"
                style={{ color: "var(--text-soft)" }}
              >
                Estrutura facial, imagem, estética, presença visual, cabelo,
                corpo, assinatura e direção estética personalizada.
              </p>

              <div
                className="inline-flex px-5 py-2 rounded-full text-sm"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  color: "var(--text-soft)",
                }}
              >
                Bloqueado
              </div>
            </div>
          </div>

          <div
            className="group cinematic-card relative overflow-hidden rounded-[36px] md:rounded-[44px] p-8 md:p-10 opacity-60"
            style={{
              background:
                "radial-gradient(circle at top right, rgba(242,185,104,0.06), transparent 36%), linear-gradient(180deg, rgba(18,9,10,0.94), rgba(7,3,4,1))",
              border: "1px solid var(--border-primary)",
            }}
          >
            <div className="relative z-10">
              <p
                className="uppercase tracking-[0.35em] text-xs mb-8"
                style={{ color: "var(--gold-soft)" }}
              >
                Portal 03
              </p>

              <h2
                className="text-3xl md:text-4xl mb-6 leading-tight"
                style={{ color: "var(--gold-primary)", fontWeight: 600 }}
              >
                O Código Final
              </h2>

              <p
                className="text-lg leading-relaxed mb-10"
                style={{ color: "var(--text-soft)" }}
              >
                Integração total entre identidade simbólica, presença estética,
                posicionamento e expressão pessoal.
              </p>

              <div
                className="inline-flex px-5 py-2 rounded-full text-sm"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  color: "var(--text-soft)",
                }}
              >
                Bloqueado
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
