import { useMemo, useRef, useState } from "react";

import { calculateResult } from "../services/calculateResult";
import { useProduto1Catalog } from "../hooks/useProduto1Catalog";

import ResultHero from "../components/ResultHero";
import NextStepCard from "../components/NextStepCard";
import ReportSection from "../components/ReportSection";
import { OriBadge, OriButton, OriCard } from "../components/ui";

function QuizProduto1() {
  const {
    catalog: produto1Catalog,
    questions,
    reports,
    loading: catalogLoading,
  } = useProduto1Catalog();
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const quizRef = useRef(null);

  const groupedQuestions = useMemo(
    () =>
      questions.reduce((groups, question) => {
        if (!groups[question.bloco]) {
          groups[question.bloco] = [];
        }

        groups[question.bloco].push(question);

        return groups;
      }, {}),
    [questions],
  );

  const handleAnswer = (questionId, value) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: value,
    }));
  };

  const handleCalculate = () => {
    const resultado = calculateResult(questions, answers, produto1Catalog);

    setResult(resultado);

    window.scrollTo({
      top: document.body.scrollHeight,
      behavior: "smooth",
    });
  };

  const handleScrollToQuiz = () => {
    quizRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const report = result ? reports[result.nomeComposto] : null;

  if (catalogLoading && !questions.length) {
    return (
      <div className="max-w-6xl">
        <p className="ori-type-reading-soft text-sm" style={{ color: "var(--text-soft)" }}>
          Abrindo sua leitura...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl">
      <section
        className="ori-hero-panel relative overflow-hidden rounded-[24px] md:rounded-[40px] mb-8 md:mb-16 min-h-[390px] md:min-h-[520px]"
        style={{
          background:
            "radial-gradient(circle at 78% 18%, rgba(242,185,104,0.13), transparent 32%), linear-gradient(135deg, rgba(18,9,10,0.62), rgba(5,2,2,0.82))",
          border: "1px solid rgba(242,185,104,0.13)",
          boxShadow:
            "0 0 76px rgba(242,185,104,0.04), inset 0 0 46px rgba(255,255,255,0.012)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
        }}
      >
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.026]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(242,185,104,0.16) 1px, transparent 1px), linear-gradient(90deg, rgba(242,185,104,0.07) 1px, transparent 1px)",
            backgroundSize: "68px 68px",
          }}
        />

        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "linear-gradient(90deg, rgba(5,2,2,0.92) 0%, rgba(5,2,2,0.78) 52%, rgba(5,2,2,0.24) 100%)",
          }}
        />

        <div className="relative z-10 grid min-h-[390px] md:min-h-[520px] lg:grid-cols-[0.95fr_0.72fr]">
          <div className="flex min-h-[390px] flex-col justify-center p-4 pt-7 md:min-h-[520px] md:p-8 xl:p-10">
            <p
              className="ori-type-system text-[10px] md:text-xs mb-5"
              style={{ color: "var(--gold-soft)" }}
            >
              Código das Deusas
            </p>

            <h1
              className="ori-type-hero text-[34px] md:text-6xl font-semibold mb-3 md:mb-6 max-w-4xl"
              style={{
                color: "var(--gold-primary)",
                letterSpacing: "-0.065em",
                textShadow: "0 0 34px rgba(242,185,104,0.12)",
              }}
            >
              Leitura Arquetípica de Imagem
            </h1>

            <p
              className="ori-type-reading text-[15px] md:text-xl max-w-3xl mb-4 md:mb-5"
              style={{ color: "var(--text-primary)" }}
            >
              Sua imagem não começa na aparência. Ela começa nos padrões que
              moldam sua presença.
            </p>

            <div
              className="hidden max-w-2xl pr-2 mb-6 md:block"
            >
              <p
                className="ori-type-reading-soft text-sm md:text-base"
                style={{ color: "rgba(255,245,235,0.70)" }}
              >
                Nesta primeira etapa, o ORI identifica sua composição
                arquetípica inicial: a força principal, a força secundária e o
                arquétipo composto que organiza sua forma de desejar, se
                proteger, se posicionar e ser percebida.
              </p>
            </div>

            <div className="hidden flex-wrap gap-2.5 mb-7 sm:flex">
              {[
                "Leitura inicial",
                "Composição arquetípica",
                "Imagem simbólica",
                "Presença",
              ].map((item) => (
                <OriBadge
                  key={item}
                  tone="muted"
                  size="md"
                  className="ori-chip px-4 py-2 text-xs"
                  data-state="revealed"
                  style={{
                    background: "rgba(255,255,255,0.025)",
                    border: "1px solid rgba(242,185,104,0.10)",
                    color: "rgba(255,245,235,0.66)",
                  }}
                >
                  {item}
                </OriBadge>
              ))}
            </div>

            <OriButton
              type="button"
              onClick={handleScrollToQuiz}
              variant="primary"
              className="w-fit px-6 py-3 md:px-8 md:py-4"
              style={{
                background: "var(--gold-primary)",
                color: "#090506",
                boxShadow: "0 0 42px rgba(242,185,104,0.18)",
              }}
            >
              Começar minha leitura
            </OriButton>

            <div
              className="mt-6 grid gap-2.5 rounded-[20px] p-3.5 sm:hidden"
              style={{
                background:
                  "linear-gradient(180deg, rgba(255,255,255,0.034), rgba(255,255,255,0.010))",
                border: "1px solid rgba(242,185,104,0.10)",
                boxShadow: "inset 0 0 22px rgba(255,255,255,0.010)",
              }}
            >
              <p
                className="ori-type-system text-[8px]"
                style={{ color: "var(--gold-soft)" }}
              >
                O que será revelado
              </p>

              <div className="grid grid-cols-3 gap-2">
                {["Presença", "Essência", "Direção"].map((item) => (
                  <OriBadge
                    key={item}
                    tone="muted"
                    size="sm"
                    className="rounded-full px-2 py-2 text-center text-[11px]"
                    style={{
                      background: "rgba(255,255,255,0.024)",
                      border: "1px solid rgba(242,185,104,0.08)",
                      color: "rgba(255,245,235,0.72)",
                    }}
                  >
                    {item}
                  </OriBadge>
                ))}
              </div>
            </div>
          </div>

          <div className="relative hidden lg:flex min-h-[520px] items-end p-8">
            <OriCard
              variant="secondary"
              padding="none"
              radius="lg"
              className="ori-card-secondary w-full rounded-[28px] p-5"
              style={{
                background: "rgba(5,2,2,0.36)",
                border: "1px solid rgba(242,185,104,0.10)",
                backdropFilter: "blur(10px)",
                WebkitBackdropFilter: "blur(10px)",
              }}
            >
              <p
                className="ori-type-system text-[8px] mb-3"
                style={{ color: "var(--gold-soft)" }}
              >
                Escala de leitura
              </p>
              <p
                className="ori-type-reading-soft text-sm"
                style={{ color: "rgba(255,245,235,0.66)" }}
              >
                1 = nada a ver comigo · 5 = totalmente eu
              </p>
            </OriCard>
          </div>
        </div>
      </section>

      <div ref={quizRef} className="flex flex-col gap-20 scroll-mt-8">
        {Object.entries(groupedQuestions).map(([bloco, blocoQuestions]) => (
          <section key={bloco}>
            <div className="mb-8">
              <p
                className="ori-type-system text-xs mb-4"
                style={{ color: "var(--gold-soft)" }}
              >
                Bloco de leitura
              </p>

              <h2
                className="ori-type-revelation text-4xl font-semibold"
                style={{ color: "var(--gold-primary)" }}
              >
                {bloco}
              </h2>
            </div>

            <div className="flex flex-col gap-8">
              {blocoQuestions.map((question) => (
                <OriCard
                  variant="secondary"
                  padding="none"
                  radius="xl"
                  key={question.id}
                  className="ori-card-secondary relative overflow-hidden p-8 rounded-[36px]"
                  style={{
                    background:
                      "linear-gradient(180deg, rgba(18,9,10,0.96), rgba(8,4,5,1))",
                    border: "1px solid var(--border-primary)",
                    boxShadow: "0 0 60px rgba(242,185,104,0.04)",
                  }}
                >
                  <div
                    className="absolute top-0 left-0 w-full h-px"
                    style={{
                      background:
                        "linear-gradient(to right, transparent, rgba(242,185,104,0.4), transparent)",
                    }}
                  />

                  <p
                    className="ori-type-system text-xs mb-5"
                    style={{ color: "var(--gold-muted)" }}
                  >
                    Pergunta {question.id}
                  </p>

                  <h3
                    className="ori-type-reading text-2xl mb-10"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {question.pergunta}
                  </h3>

                  <div className="flex items-center gap-4 flex-wrap">
                    {[1, 2, 3, 4, 5].map((value) => {
                      const active = answers[question.id] === value;

                      return (
                        <button
                          key={value}
                          type="button"
                          aria-pressed={active}
                          onClick={() => handleAnswer(question.id, value)}
                          className="w-14 h-14 rounded-full transition-all duration-300 hover:scale-105"
                          style={{
                            background: active
                              ? "var(--gold-primary)"
                              : "#1b1213",
                            color: active ? "#090506" : "var(--text-primary)",
                            border: active
                              ? "none"
                              : "1px solid var(--border-primary)",
                            boxShadow: active
                              ? "0 0 35px rgba(242,185,104,0.22)"
                              : "none",
                          }}
                        >
                          {value}
                        </button>
                      );
                    })}
                  </div>
                </OriCard>
              ))}
            </div>
          </section>
        ))}
      </div>

      <OriButton
        type="button"
        onClick={handleCalculate}
        variant="primary"
        className="mt-20 px-12 py-5"
        style={{
          background: "var(--gold-primary)",
          color: "#090506",
          boxShadow: "0 0 50px rgba(242,185,104,0.18)",
        }}
      >
        Revelar Resultado
      </OriButton>

      {result && (
        <div className="mt-24">
          <ResultHero
            nome={result.nomeComposto}
            principal={result.principal}
            secundario={result.secundario}
          />

          {report ? (
            <div className="flex flex-col gap-10">
              <ReportSection
                eyebrow="Reconhecimento"
                title="O que existe por trás da sua presença"
                content={report.reconhecimento}
              />

              <ReportSection
                eyebrow="Essência"
                title="O centro da sua presença"
                content={report.essencia}
              />

              <ReportSection
                eyebrow="Dinâmica Psíquica"
                title="Como sua energia funciona"
                content={report.dinamica}
              />

              {report.vidaReal && (
                <ReportSection
                  eyebrow="Vida Real"
                  title="Como isso aparece no dia a dia"
                  content={report.vidaReal}
                />
              )}

              <ReportSection
                eyebrow="Como você é percebida"
                title="O efeito da sua imagem no outro"
                content={report.percebida}
              />

              <ReportSection
                eyebrow="Sombra"
                title="O que tende a desequilibrar sua essência"
                content={report.sombra}
              />

              <ReportSection
                eyebrow="Padrão Relacional"
                title="Como você se vincula"
                content={report.padraoRelacional}
              />

              <ReportSection
                eyebrow="Caminho de Individuação"
                title="A maturação da sua imagem interna"
                content={report.caminho}
              />

              <ReportSection
                eyebrow="Essência de Imagem"
                title="Como sua psique se traduz visualmente"
                content={report.essenciaImagem}
              />

              <ReportSection
                eyebrow="Leitura Final"
                title="Quando sua imagem começa a revelar sua essência"
                content={report.leituraFinal}
              />

              <NextStepCard />
            </div>
          ) : (
            <OriCard
              variant="secondary"
              padding="none"
              radius="xl"
              className="ori-card-secondary rounded-[40px] p-10"
              style={{
                background:
                  "linear-gradient(180deg, rgba(18,9,10,0.98), rgba(7,3,4,1))",
                border: "1px solid var(--border-primary)",
              }}
            >
              <p style={{ color: "var(--text-soft)" }}>
                Relatório completo ainda não cadastrado para este resultado.
              </p>
            </OriCard>
          )}
        </div>
      )}
    </div>
  );
}

export default QuizProduto1;
