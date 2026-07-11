import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import SyncNotice from "../components/SyncNotice";
import { OriBadge, OriButton, OriCard } from "../components/ui";
import { archetypeImages } from "../data/archetypeImages";
import { archetypeThemes } from "../data/archetypeThemes";
import { getReportVisualGuide } from "../data/reportVisualGuides";
import {
  downloadProduto1ReportPdf,
  getProduto1Report,
} from "../services/api";

const reportCoverImages = {
  "Amante Nutridora": "/images/report-covers/amante-nutridora-mobile.png",
  "Autônoma Absoluta": "/images/report-covers/autonoma-absoluta-mobile.png",
  "Cuidadora Estratégica": "/images/report-covers/cuidadora-estrategica-mobile.png",
  "Guardiã Sensível": "/images/report-covers/guardia-sensivel-mobile.png",
  "Matriarca Soberana": "/images/report-covers/matriarca-soberana-mobile.png",
  "Musa Enigmática": "/images/report-covers/musa-enigmática-mobile.png",
  "Protetora Selvagem": "/images/report-covers/protetora-selvagem-mobile.png",
  "Rainha Magnética": "/images/report-covers/rainha-magnetica-mobile.png",
  "Rainha Oculta": "/images/report-covers/rainha-oculta-mobile.png",
  "Sedutora Estratégica": "/images/report-covers/sedutora-estrategica-mobile.png",
  "Selvagem Intuitiva": "/images/report-covers/selvagem-intuitiva-mobile.png",
  "Selvagem Magnética": "/images/report-covers/selvagem-magnética-mobile.png",
  "Soberana Estratégica": "/images/report-covers/soberana-estrategica-mobile.png",
  "Soberana Indomável": "/images/report-covers/sobera-indomavel-mobile.png",
  "Visionária Sutil": "/images/report-covers/visionaria-sutil-mobile.png",
};

function getVisualImages(guide, sectionId) {
  const sectionImages = guide?.images?.[sectionId];

  if (Array.isArray(sectionImages)) {
    return sectionImages;
  }

  if (typeof sectionImages === "string") {
    return [sectionImages];
  }

  return [];
}

function ReportSectionVisual({ sectionId, guide }) {
  if (!guide) {
    return null;
  }

  const sectionImages = getVisualImages(guide, sectionId);

  if (sectionId === "paleta") {
    return (
      <div className="mt-6 grid gap-3 md:grid-cols-3">
        {guide.palette.map((color) => (
          <div
            key={color.name}
            className="overflow-hidden rounded-[20px]"
            style={{
              background: "rgba(255,255,255,0.024)",
              border: "1px solid rgba(242,185,104,0.08)",
            }}
          >
            <div
              className="h-24"
              style={{
                background: color.hex,
                boxShadow: "inset 0 0 34px rgba(255,255,255,0.08)",
              }}
            />
            <div className="p-4">
              <p
                className="ori-type-reading text-sm"
                style={{ color: "var(--text-primary)" }}
              >
                {color.name}
              </p>
              <p
                className="ori-type-system mt-2 text-[8px]"
                style={{ color: "rgba(255,245,235,0.52)" }}
              >
                {color.role}
              </p>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (sectionId === "tecidos") {
    return (
      <div className="mt-6 grid gap-3 md:grid-cols-3">
        {guide.fabrics.map((fabric, index) => (
          <div
            key={fabric.name}
            className="rounded-[22px] p-3"
            style={{
              background: "rgba(255,255,255,0.024)",
              border: "1px solid rgba(242,185,104,0.08)",
            }}
          >
            <div
              className="h-24 rounded-[18px] md:h-28"
              style={{
                background: sectionImages[index]
                  ? `linear-gradient(180deg, rgba(7,3,4,0.02), rgba(7,3,4,0.16)), url(${sectionImages[index]})`
                  : fabric.texture,
                backgroundPosition: "center",
                backgroundSize: "cover",
                border: "1px solid rgba(255,255,255,0.10)",
              }}
            />
            <p
              className="ori-type-reading mt-3 text-sm"
              style={{ color: "var(--text-primary)" }}
            >
              {fabric.name}
            </p>
            <p
              className="ori-type-reading-soft mt-1 text-xs leading-relaxed"
              style={{ color: "rgba(255,245,235,0.58)" }}
            >
              {fabric.note}
            </p>
          </div>
        ))}
      </div>
    );
  }

  const visualMap = {
    modelagem: {
      label: "Primeiras pistas de forma",
      items: guide.silhouettes,
      background:
        "radial-gradient(circle at 24% 22%, rgba(242,185,104,0.16), transparent 32%), linear-gradient(135deg, rgba(44,25,17,0.82), rgba(10,5,5,0.94))",
    },
    beleza: {
      label: "Primeiras pistas de beleza",
      items: guide.beauty,
      background:
        "radial-gradient(circle at 28% 24%, rgba(255,221,186,0.14), transparent 34%), linear-gradient(135deg, rgba(32,17,20,0.82), rgba(8,4,5,0.94))",
    },
    presenca: {
      label: "Primeiras pistas de imagem",
      items: guide.presence,
      background:
        "radial-gradient(circle at 28% 24%, rgba(242,185,104,0.12), transparent 34%), linear-gradient(135deg, rgba(18,18,12,0.82), rgba(6,4,3,0.94))",
    },
    evitar: {
      label: "Ruídos visuais a observar",
      items: guide.breaks,
      background:
        "radial-gradient(circle at 28% 24%, rgba(255,118,84,0.12), transparent 34%), linear-gradient(135deg, rgba(31,10,10,0.82), rgba(6,3,3,0.94))",
    },
  };

  const visual = visualMap[sectionId];

  if (!visual) {
    return null;
  }

  return (
    <div
      className="mt-6 rounded-[24px] p-4 md:p-5"
      style={{
        background: visual.background,
        border: "1px solid rgba(242,185,104,0.09)",
      }}
    >
      <p className="ori-type-system text-[9px]" style={{ color: "var(--gold-soft)" }}>
        {visual.label}
      </p>
      <div className="mt-4 grid gap-2 md:grid-cols-3">
        {visual.items.map((item, index) => (
          <div
            key={item}
            className="rounded-[18px] p-4"
            style={{
              background:
                sectionId === "evitar"
                  ? "rgba(255,118,84,0.045)"
                  : "rgba(255,255,255,0.034)",
              border:
                sectionId === "evitar"
                  ? "1px solid rgba(255,118,84,0.12)"
                  : "1px solid rgba(242,185,104,0.08)",
            }}
          >
            <div
              className="mb-3 h-20 rounded-[14px] md:h-24"
              style={{
                background: sectionImages[index]
                  ? `linear-gradient(180deg, rgba(7,3,4,0.04), rgba(7,3,4,0.18)), url(${sectionImages[index]})`
                  : "radial-gradient(circle at 30% 18%, rgba(242,185,104,0.16), transparent 30%), linear-gradient(135deg, rgba(255,255,255,0.055), rgba(255,255,255,0.018))",
                backgroundPosition: "center",
                backgroundSize: "cover",
                border:
                  sectionId === "evitar"
                    ? "1px solid rgba(255,118,84,0.12)"
                    : "1px solid rgba(242,185,104,0.08)",
              }}
            />
            <p
              className="ori-type-system text-[8px]"
              style={{ color: "rgba(255,245,235,0.42)" }}
            >
              {String(index + 1).padStart(2, "0")}
            </p>
            <p
              className="ori-type-reading-soft mt-2 text-sm leading-relaxed"
              style={{ color: "rgba(255,245,235,0.72)" }}
            >
              {item}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function Produto1Relatorio() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
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
  const visualGuide = report ? getReportVisualGuide(report.resultado) : null;
  const archetypeImage = report ? archetypeImages[report.resultado]?.image : "";
  const reportCoverImage = report ? reportCoverImages[report.resultado] : "";
  const theme = report ? archetypeThemes[report.resultado] : null;

  async function handleDownloadPdf() {
    setDownloadingPdf(true);
    setSyncNotice(
      "Estamos preparando seu relatório em PDF. Nesta fase de protótipo, o arquivo pode levar alguns instantes para ficar pronto. Mantenha esta página aberta até o download começar.",
    );

    try {
      const { blob, filename } = await downloadProduto1ReportPdf();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      setSyncNotice("");
    } catch (error) {
      console.log("Erro ao baixar PDF do Produto 1:", error);
      setSyncNotice(
        error?.userMessage ||
          "Não conseguimos baixar o PDF agora. Tente novamente em alguns instantes.",
      );
    } finally {
      setDownloadingPdf(false);
    }
  }

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

        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <OriButton
            as={Link}
            to="/produto-1/leitura"
            variant="secondary"
            className="px-5 py-2.5 text-sm"
            style={{ color: "var(--gold-primary)" }}
          >
            ← Voltar para leitura
          </OriButton>

          <OriButton
            type="button"
            onClick={handleDownloadPdf}
            disabled={downloadingPdf}
            variant="primary"
            className="px-5 py-2.5 text-sm"
          >
            {downloadingPdf ? "Preparando PDF..." : "Baixar PDF"}
          </OriButton>
        </div>

        {downloadingPdf && (
          <div
            className="mb-5 rounded-[22px] px-5 py-4 text-sm leading-relaxed"
            style={{
              background:
                "linear-gradient(90deg, rgba(242,185,104,0.075), rgba(255,255,255,0.016))",
              border: "1px solid rgba(242,185,104,0.14)",
              color: "rgba(255,245,235,0.76)",
            }}
          >
            Estamos preparando seu relatório em PDF. Nesta fase de protótipo, o
            arquivo pode levar alguns instantes para ficar pronto. Mantenha esta
            página aberta até o download começar.
          </div>
        )}

        <section
          className="ori-main-frame ori-hero-panel relative overflow-hidden rounded-[28px] p-0 md:rounded-[46px]"
          style={{
            background:
              theme?.gradient ||
              "radial-gradient(circle at 82% 10%, rgba(242,185,104,0.15), transparent 34%), linear-gradient(135deg, rgba(18,9,10,0.90), rgba(5,2,2,0.97))",
            border: `1px solid ${theme?.border || "rgba(242,185,104,0.14)"}`,
            boxShadow:
              `0 0 90px ${theme?.glow || "rgba(242,185,104,0.055)"}, inset 0 0 80px rgba(255,255,255,0.018)`,
          }}
        >
          {archetypeImage && (
            <img
              src={archetypeImage}
              alt=""
              className="absolute inset-0 h-full w-full object-cover object-center opacity-90"
              loading="eager"
              decoding="async"
            />
          )}

          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "linear-gradient(90deg, rgba(5,2,2,0.98) 0%, rgba(5,2,2,0.94) 25%, rgba(5,2,2,0.78) 44%, rgba(5,2,2,0.38) 66%, rgba(5,2,2,0.08) 100%)",
            }}
          />

          <div className="relative z-10 grid gap-6 p-6 md:min-h-[430px] md:grid-cols-[0.95fr_0.75fr] md:p-10 xl:min-h-[450px] xl:p-12">
            <div className="flex flex-col justify-center">
              <div>
                <div className="ori-label-line mb-4">
                  <p
                    className="ori-type-system text-[10px]"
                    style={{ color: "var(--gold-soft)" }}
                  >
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
                  {report.subtitle || "Sua primeira leitura de imagem no ORI."}
                </p>
              </div>

              <div className="mt-5 flex flex-wrap gap-3">
                {[report.combinacao, report.formula, report.email]
                  .filter(Boolean)
                  .map((item) => (
                    <OriBadge
                      key={item}
                      tone="gold"
                      size="md"
                      className="ori-chip px-5 py-2.5 text-[13px]"
                      style={{
                        background: "rgba(242,185,104,0.060)",
                        border: "1px solid rgba(242,185,104,0.18)",
                        color: "rgba(255,245,235,0.82)",
                      }}
                    >
                      {item}
                    </OriBadge>
                  ))}
              </div>
            </div>

            {(reportCoverImage || archetypeImage) && (
              <div
                className="min-h-[360px] rounded-[24px] md:hidden"
                style={{
                  backgroundImage: `linear-gradient(180deg, rgba(7,3,4,0.03), rgba(7,3,4,0.30)), url(${reportCoverImage || archetypeImage})`,
                  backgroundPosition: "center top",
                  backgroundSize: "cover",
                  border: "1px solid rgba(242,185,104,0.12)",
                }}
              />
            )}
          </div>
        </section>

        {perfilItems.length > 0 && (
          <section className="mt-5 grid gap-3 md:grid-cols-3">
            {perfilItems.map(([label, value]) => (
              <OriCard
                key={label}
                variant="secondary"
                padding="none"
                radius="md"
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
              </OriCard>
            ))}
          </section>
        )}

        {report.highlights?.length > 0 && (
          <section className="mt-5 grid gap-3 md:grid-cols-2">
            {report.highlights.map((item) => (
              <OriCard
                key={item.label}
                variant="secondary"
                padding="none"
                radius="md"
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
              </OriCard>
            ))}
          </section>
        )}

        <section className="mt-6 grid gap-4">
          {report.sections?.map((section) => (
            <OriCard
              as="article"
              key={section.id}
              variant="secondary"
              padding="none"
              radius="lg"
              className="ori-main-frame ori-card-secondary rounded-[26px] p-5 md:rounded-[32px] md:p-7"
              style={{
                background:
                  "linear-gradient(180deg, rgba(18,9,10,0.76), rgba(7,3,4,0.92))",
                border: "1px solid rgba(242,185,104,0.10)",
              }}
            >
              <div className="mb-4 flex items-center gap-4">
                <OriBadge
                  tone="gold"
                  size="md"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full text-xs"
                  style={{
                    background: "rgba(242,185,104,0.10)",
                    border: "1px solid rgba(242,185,104,0.16)",
                    color: "var(--gold-primary)",
                  }}
                >
                  {section.label}
                </OriBadge>
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

              <ReportSectionVisual sectionId={section.id} guide={visualGuide} />
            </OriCard>
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
