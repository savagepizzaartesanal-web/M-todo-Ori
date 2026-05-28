import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import SyncNotice from "../components/SyncNotice";
import { getProduto1Report } from "../services/api";

function Produto1Relatorio() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [syncNotice, setSyncNotice] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadReport() {
      try {
        const data = await getProduto1Report();

        if (isMounted) {
          setReport(data);
          setSyncNotice("");
        }
      } catch (error) {
        console.log("Erro ao carregar relatório do Produto 1:", error);

        if (isMounted) {
          setSyncNotice(
            error?.userMessage ||
              "Não conseguimos abrir seu relatório agora. Tente novamente em alguns instantes.",
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadReport();

    return () => {
      isMounted = false;
    };
  }, []);

  const perfilItems = report
    ? [
        ["Momento atual", report.perfil?.momento_atual],
        ["O que mais pesa hoje", report.perfil?.dor_atual],
        ["Objetivo principal", report.perfil?.objetivo_principal],
      ].filter(([, value]) => Boolean(value))
    : [];

  if (loading) {
    return (
      <main className="min-h-screen px-4 py-8 md:px-8 md:py-12">
        <div
          className="ori-main-frame mx-auto max-w-5xl rounded-[28px] p-6 text-center md:rounded-[42px] md:p-10"
          style={{
            background:
              "linear-gradient(135deg, rgba(18,9,10,0.88), rgba(5,2,2,0.96))",
            border: "1px solid rgba(242,185,104,0.14)",
          }}
        >
          <p className="ori-type-system text-[10px]" style={{ color: "var(--gold-soft)" }}>
            Relatório ORI
          </p>
          <h1
            className="ori-type-revelation mt-4 text-3xl md:text-5xl"
            style={{ color: "var(--gold-primary)", fontWeight: 620 }}
          >
            Preparando sua leitura...
          </h1>
        </div>
      </main>
    );
  }

  if (!report) {
    return (
      <main className="min-h-screen px-4 py-8 md:px-8 md:py-12">
        <div className="mx-auto max-w-5xl">
          <SyncNotice message={syncNotice} />
          <div
            className="ori-main-frame rounded-[28px] p-6 md:rounded-[42px] md:p-10"
            style={{
              background:
                "linear-gradient(135deg, rgba(18,9,10,0.88), rgba(5,2,2,0.96))",
              border: "1px solid rgba(242,185,104,0.14)",
            }}
          >
            <p className="ori-type-system text-[10px]" style={{ color: "var(--gold-soft)" }}>
              Relatório indisponível
            </p>
            <h1
              className="ori-type-revelation mt-4 text-3xl md:text-5xl"
              style={{ color: "var(--gold-primary)", fontWeight: 620 }}
            >
              Sua leitura ainda não está pronta para relatório.
            </h1>
            <Link
              to="/produto-1/leitura"
              className="ori-button-secondary mt-6 inline-flex rounded-full px-5 py-3 text-sm"
              style={{ color: "var(--gold-primary)" }}
            >
              Voltar para a leitura
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-4 py-8 md:px-8 md:py-12">
      <div className="ori-atmosphere ori-atmosphere-method mx-auto max-w-6xl">
        <SyncNotice message={syncNotice} />

        <Link
          to="/produto-1/leitura"
          className="ori-button-secondary mb-5 inline-flex rounded-full px-5 py-2.5 text-sm"
          style={{ color: "var(--gold-primary)" }}
        >
          ← Voltar para leitura
        </Link>

        <section
          className="ori-main-frame ori-hero-panel relative overflow-hidden rounded-[28px] p-6 md:rounded-[46px] md:p-10 xl:p-12"
          style={{
            background:
              "radial-gradient(circle at 82% 10%, rgba(242,185,104,0.15), transparent 34%), linear-gradient(135deg, rgba(18,9,10,0.90), rgba(5,2,2,0.97))",
            border: "1px solid rgba(242,185,104,0.14)",
            boxShadow:
              "0 0 90px rgba(242,185,104,0.055), inset 0 0 80px rgba(255,255,255,0.018)",
          }}
        >
          <div className="ori-label-line mb-4">
            <p className="ori-type-system text-[10px]" style={{ color: "var(--gold-soft)" }}>
              Relatório digital · Código das Deusas
            </p>
          </div>

          <h1
            className="ori-type-hero max-w-4xl text-[38px] md:text-7xl"
            style={{
              color: "var(--gold-primary)",
              fontWeight: 620,
              letterSpacing: "-0.075em",
            }}
          >
            {report.resultado}
          </h1>

          <p
            className="ori-type-reading mt-4 max-w-3xl text-base md:text-xl"
            style={{ color: "var(--text-primary)" }}
          >
            {report.subtitle || "Sua primeira cartografia simbólica de imagem."}
          </p>

          <div className="mt-6 flex flex-wrap gap-2.5">
            {[report.combinacao, report.formula, report.email]
              .filter(Boolean)
              .map((item) => (
                <span
                  key={item}
                  className="ori-chip px-4 py-2 text-xs"
                  style={{
                    background: "rgba(255,255,255,0.028)",
                    border: "1px solid rgba(242,185,104,0.10)",
                    color: "rgba(255,245,235,0.70)",
                  }}
                >
                  {item}
                </span>
              ))}
          </div>
        </section>

        {perfilItems.length > 0 && (
          <section className="mt-5 grid gap-3 md:grid-cols-3">
            {perfilItems.map(([label, value]) => (
              <div
                key={label}
                className="ori-card-secondary rounded-[22px] p-4 md:p-5"
                style={{
                  background: "rgba(255,255,255,0.024)",
                  border: "1px solid rgba(242,185,104,0.08)",
                }}
              >
                <p className="ori-type-system text-[9px]" style={{ color: "var(--gold-soft)" }}>
                  {label}
                </p>
                <p
                  className="ori-type-reading-soft mt-2 text-sm leading-relaxed"
                  style={{ color: "rgba(255,245,235,0.74)" }}
                >
                  {value}
                </p>
              </div>
            ))}
          </section>
        )}

        {report.highlights?.length > 0 && (
          <section className="mt-5 grid gap-3 md:grid-cols-2">
            {report.highlights.map((item) => (
              <div
                key={item.label}
                className="ori-card-secondary rounded-[24px] p-5"
                style={{
                  background: "rgba(242,185,104,0.045)",
                  border: "1px solid rgba(242,185,104,0.11)",
                }}
              >
                <p className="ori-type-system text-[9px]" style={{ color: "var(--gold-soft)" }}>
                  {item.label}
                </p>
                <p
                  className="ori-type-reading-soft mt-3 text-sm leading-relaxed md:text-base"
                  style={{ color: "rgba(255,245,235,0.76)" }}
                >
                  {item.text}
                </p>
              </div>
            ))}
          </section>
        )}

        <section className="mt-6 grid gap-4">
          {report.sections?.map((section) => (
            <article
              key={section.id}
              className="ori-main-frame ori-card-secondary rounded-[26px] p-5 md:rounded-[32px] md:p-7"
              style={{
                background:
                  "linear-gradient(180deg, rgba(18,9,10,0.76), rgba(7,3,4,0.92))",
                border: "1px solid rgba(242,185,104,0.10)",
              }}
            >
              <div className="mb-4 flex items-center gap-4">
                <span
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full text-xs"
                  style={{
                    background: "rgba(242,185,104,0.10)",
                    border: "1px solid rgba(242,185,104,0.16)",
                    color: "var(--gold-primary)",
                  }}
                >
                  {section.label}
                </span>
                <h2
                  className="ori-type-revelation text-2xl md:text-3xl"
                  style={{ color: "var(--gold-primary)", fontWeight: 620 }}
                >
                  {section.title}
                </h2>
              </div>

              <div className="space-y-4">
                {section.text.split("\n\n").map((paragraph) => (
                  <p
                    key={paragraph}
                    className="ori-type-reading-soft text-sm leading-[1.85] md:text-base"
                    style={{ color: "rgba(255,245,235,0.74)" }}
                  >
                    {paragraph}
                  </p>
                ))}
              </div>
            </article>
          ))}
        </section>

        {report.next_step && (
          <section
            className="ori-main-frame mt-6 rounded-[28px] p-5 md:p-7"
            style={{
              background:
                "linear-gradient(135deg, rgba(242,185,104,0.10), rgba(18,9,10,0.88))",
              border: "1px solid rgba(242,185,104,0.14)",
            }}
          >
            <p className="ori-type-system text-[10px]" style={{ color: "var(--gold-soft)" }}>
              Próximo passo
            </p>
            <p
              className="ori-type-reading mt-3 max-w-4xl text-base leading-relaxed md:text-lg"
              style={{ color: "var(--text-primary)" }}
            >
              {report.next_step}
            </p>
          </section>
        )}
      </div>
    </main>
  );
}

export default Produto1Relatorio;
