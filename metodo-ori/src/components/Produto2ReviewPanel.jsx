import { useCallback, useEffect, useMemo, useState } from "react";

import {
  generateAdminProduto2AiDraft,
  getAdminProduto2,
  publishAdminProduto2,
  unpublishAdminProduto2,
  updateAdminProduto2,
} from "../services/api";
import { OriBadge, OriButton, OriCard, OriField } from "./ui";

const DIAGNOSTIC_FIELDS = [
  ["kibbe", "Estrutura corporal / Kibbe"],
  ["coloracao", "Coloração pessoal"],
  ["patton", "Textura e identidade / Patton"],
  ["ancestralidade", "Ancestralidade e traços"],
  ["cabelo", "Cabelo e textura"],
];

const DRAFT_SECTIONS = [
  ["manifesto", "Manifesto"],
  ["base_identitaria", "Base identitária"],
  ["arquitetura_psicologica", "Arquitetura psicológica"],
  ["dor_real", "Dor real"],
  ["lei_coerencia_estetica", "Lei da coerência estética"],
  ["onde_se_violenta", "Onde se violenta"],
  ["ponto_virada", "Ponto de virada"],
  ["estrutura_corporal", "Estrutura corporal"],
  ["coloracao", "Coloração"],
  ["ancestralidade", "Ancestralidade"],
  ["modelagem", "Modelagem"],
  ["tecidos", "Tecidos"],
  ["beleza", "Beleza"],
  ["cabelo", "Cabelo"],
  ["presenca", "Presença"],
  ["o_que_enfraquece", "O que enfraquece"],
  ["formula_imagem", "Fórmula de imagem"],
  ["mapa_capsula_visual", "Mapa da cápsula visual"],
  ["checklist_guarda_roupa", "Checklist do guarda-roupa"],
  ["fechamento", "Fechamento"],
];

const EMPTY_DIAGNOSTICS = Object.fromEntries(
  DIAGNOSTIC_FIELDS.map(([key]) => [key, ""]),
);

function asEditableDiagnostics(value = {}) {
  return {
    ...EMPTY_DIAGNOSTICS,
    ...Object.fromEntries(
      Object.entries(value).map(([key, item]) => [
        key,
        typeof item === "string" ? item : JSON.stringify(item, null, 2),
      ]),
    ),
  };
}

function cleanDiagnostics(value) {
  return Object.fromEntries(
    Object.entries(value)
      .map(([key, item]) => [key, String(item || "").trim()])
      .filter(([, item]) => item),
  );
}

function formatDateTime(value) {
  if (!value) return "Ainda não registrado";
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

function Produto2ReviewPanel({ clienteId }) {
  const [record, setRecord] = useState(null);
  const [diagnostics, setDiagnostics] = useState(EMPTY_DIAGNOSTICS);
  const [draft, setDraft] = useState({});
  const [activeIndex, setActiveIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [action, setAction] = useState("");
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getAdminProduto2(clienteId);
      setRecord(data);
      setDiagnostics(asEditableDiagnostics(data.diagnosticos));
      setDraft(data.ia_rascunho || data.dossie || {});
    } catch (loadError) {
      setError(
        loadError?.userMessage ||
          "Não foi possível carregar o espaço de revisão do Dossiê.",
      );
    } finally {
      setLoading(false);
    }
  }, [clienteId]);

  useEffect(() => {
    Promise.resolve().then(load);
  }, [load]);

  const confirmedDiagnostics = useMemo(
    () => cleanDiagnostics(diagnostics),
    [diagnostics],
  );
  const completedSections = DRAFT_SECTIONS.filter(
    ([key]) => String(draft[key] || "").trim().length >= 100,
  ).length;
  const diagnosticsReady = Object.keys(confirmedDiagnostics).length > 0;
  const draftReady = completedSections === DRAFT_SECTIONS.length;
  const [activeKey, activeLabel] = DRAFT_SECTIONS[activeIndex];

  const runAction = async (name, task, successMessage) => {
    setAction(name);
    setNotice("");
    setError("");
    try {
      const data = await task();
      setNotice(successMessage);
      return data;
    } catch (actionError) {
      setError(
        actionError?.userMessage ||
          "Não foi possível concluir esta ação agora. Tente novamente.",
      );
      return null;
    } finally {
      setAction("");
    }
  };

  const saveDiagnostics = async () => {
    const data = await runAction(
      "diagnostics",
      () =>
        updateAdminProduto2(clienteId, {
          diagnosticos: confirmedDiagnostics,
          status: "em_analise",
        }),
      "Diagnósticos técnicos salvos.",
    );
    if (data) setRecord(data);
    return Boolean(data);
  };

  const generateDraft = async () => {
    if (!diagnosticsReady) {
      setError("Preencha e salve ao menos um diagnóstico técnico.");
      return;
    }
    if (!(await saveDiagnostics())) return;

    const data = await runAction(
      "generate",
      () => generateAdminProduto2AiDraft(clienteId),
      "Rascunho gerado. Revise todas as seções antes de publicar.",
    );
    if (data) {
      setDraft(data.ia_rascunho || {});
      await load();
    }
  };

  const saveDraft = async () => {
    const data = await runAction(
      "draft",
      () => updateAdminProduto2(clienteId, { ia_rascunho: draft }),
      "Revisão salva como rascunho privado.",
    );
    if (data) setRecord(data);
  };

  const publish = async () => {
    if (!draftReady) {
      setError("Revise e complete as 20 seções antes de publicar.");
      return;
    }
    if (!window.confirm("Publicar esta versão do Dossiê ORI?")) return;

    const data = await runAction(
      "publish",
      () =>
        publishAdminProduto2(clienteId, {
          diagnosticos: confirmedDiagnostics,
          dossie: draft,
        }),
      "Dossiê publicado. O acesso da cliente continua controlado separadamente.",
    );
    if (data) setRecord(data);
  };

  const unpublish = async () => {
    if (!window.confirm("Retirar esta versão da área da cliente?")) return;
    const data = await runAction(
      "unpublish",
      () => unpublishAdminProduto2(clienteId),
      "Dossiê retirado da publicação.",
    );
    if (data) setRecord(data);
  };

  if (loading) {
    return (
      <section className="mb-8 px-1 py-8">
        <p className="ori-type-reading-soft text-sm" style={{ color: "var(--text-soft)" }}>
          Carregando revisão do Dossiê ORI...
        </p>
      </section>
    );
  }

  return (
    <OriCard
      as="section"
      variant="secondary"
      padding="none"
      radius="lg"
      className="ori-card-secondary relative mb-8 overflow-hidden rounded-[30px] p-6 md:p-8 cinematic-card"
      style={{
        background: "linear-gradient(180deg, rgba(18,9,10,0.76), rgba(7,3,4,0.92))",
        border: "1px solid rgba(242,185,104,0.12)",
      }}
    >
      <div className="flex flex-col gap-4 border-b pb-6 md:flex-row md:items-end md:justify-between" style={{ borderColor: "rgba(242,185,104,0.1)" }}>
        <div>
          <p className="ori-type-system mb-3 text-[10px]" style={{ color: "var(--gold-soft)" }}>
            Oficina interna · Produto 2
          </p>
          <h2 className="ori-type-revelation text-2xl font-semibold md:text-3xl" style={{ color: "var(--gold-primary)" }}>
            Revisão do Dossiê ORI
          </h2>
          <p className="ori-type-reading-soft mt-2 max-w-2xl text-sm" style={{ color: "var(--text-soft)" }}>
            Confirme a técnica, gere a base editorial e publique somente depois da revisão humana.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 text-xs">
          <OriBadge tone={record?.status === "publicado" ? "success" : "gold"} size="md" className="px-3 py-2">
            {record?.status === "publicado" ? "Publicado" : "Rascunho privado"}
          </OriBadge>
          <OriBadge tone="muted" size="md" className="px-3 py-2">
            {completedSections}/20 seções
          </OriBadge>
        </div>
      </div>

      {error ? <OriBadge as="p" tone="danger" size="md" className="mt-5 max-w-full rounded-lg px-4 py-3 text-sm">{error}</OriBadge> : null}
      {notice ? <OriBadge as="p" tone="success" size="md" className="mt-5 max-w-full rounded-lg px-4 py-3 text-sm">{notice}</OriBadge> : null}

      <div className="mt-7">
        <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-lg font-semibold" style={{ color: "rgba(255,245,235,0.9)" }}>1. Diagnósticos confirmados</h3>
            <p className="mt-1 text-sm" style={{ color: "var(--text-soft)" }}>Use apenas diagnósticos confirmados. A IA não deve inventar dados.</p>
          </div>
          <OriButton type="button" variant="secondary" disabled={Boolean(action)} onClick={saveDiagnostics} className="px-5 py-3 text-sm">
            {action === "diagnostics" ? "Salvando..." : "Salvar diagnósticos"}
          </OriButton>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {DIAGNOSTIC_FIELDS.map(([key, label]) => (
            <OriField
              key={key}
              as="textarea"
              label={label}
              value={diagnostics[key] || ""}
              onChange={(event) => setDiagnostics((current) => ({ ...current, [key]: event.target.value }))}
              rows={3}
              className="rounded-lg p-4 text-sm"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(242,185,104,0.1)", color: "var(--text-primary)" }}
              placeholder="Registre somente o diagnóstico validado."
            />
          ))}
        </div>
      </div>

      <div className="mt-8 border-t pt-7" style={{ borderColor: "rgba(242,185,104,0.1)" }}>
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-lg font-semibold" style={{ color: "rgba(255,245,235,0.9)" }}>2. Rascunho editorial</h3>
            <p className="mt-1 text-sm" style={{ color: "var(--text-soft)" }}>
              Geração: {formatDateTime(record?.ia_gerado_em)} · Revisão: {formatDateTime(record?.ia_revisado_em)}
            </p>
          </div>
          <OriButton type="button" disabled={Boolean(action) || !diagnosticsReady || record?.status === "publicado"} onClick={generateDraft} className="px-6 py-3 text-sm" style={{ background: "var(--gold-primary)", color: "#090506" }}>
            {action === "generate" || action === "diagnostics" ? "Preparando..." : draftReady ? "Gerar nova versão" : "Gerar com IA"}
          </OriButton>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-[250px_minmax(0,1fr)]">
          <div className="grid content-start gap-2">
            <label className="ori-type-system text-[9px]" style={{ color: "var(--gold-soft)" }} htmlFor="produto2-section">Seção em revisão</label>
            <select id="produto2-section" value={activeIndex} onChange={(event) => setActiveIndex(Number(event.target.value))} className="w-full rounded-lg p-3 text-sm outline-none" style={{ background: "#160d0d", border: "1px solid rgba(242,185,104,0.12)", color: "var(--text-primary)" }}>
              {DRAFT_SECTIONS.map(([key, label], index) => (
                <option key={key} value={index}>{String(index + 1).padStart(2, "0")} · {label}</option>
              ))}
            </select>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <OriButton type="button" variant="secondary" aria-label="Seção anterior" disabled={activeIndex === 0} onClick={() => setActiveIndex((current) => current - 1)} className="w-full rounded-lg px-3 py-3">←</OriButton>
              <OriButton type="button" variant="secondary" aria-label="Próxima seção" disabled={activeIndex === DRAFT_SECTIONS.length - 1} onClick={() => setActiveIndex((current) => current + 1)} className="w-full rounded-lg px-3 py-3">→</OriButton>
            </div>
          </div>

          <label className="grid min-w-0 gap-2" htmlFor="produto2-active-section">
            <span className="flex items-center justify-between gap-3">
              <span className="text-sm font-semibold" style={{ color: "var(--gold-primary)" }}>{activeLabel}</span>
              <span className="text-xs" style={{ color: "var(--text-muted)" }}>{String(draft[activeKey] || "").length} caracteres</span>
            </span>
            <OriField
              id="produto2-active-section"
              as="textarea"
              value={draft[activeKey] || ""}
              onChange={(event) => setDraft((current) => ({ ...current, [activeKey]: event.target.value }))}
              rows={16}
              className="rounded-lg p-5 text-sm leading-7"
              style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(242,185,104,0.1)", color: "var(--text-primary)" }}
              placeholder="Esta seção aparecerá aqui após a geração ou pode ser escrita manualmente."
            />
          </label>
        </div>
      </div>

      <div className="mt-8 flex flex-col gap-4 border-t pt-6 md:flex-row md:items-center md:justify-between" style={{ borderColor: "rgba(242,185,104,0.1)" }}>
        <p className="max-w-xl text-sm" style={{ color: "var(--text-soft)" }}>
          Publicar não libera o Produto 2. O acesso da cliente permanece no controle “Liberar Dossiê ORI”.
        </p>
        <div className="flex flex-wrap gap-3">
          <OriButton type="button" variant="secondary" disabled={Boolean(action) || !Object.keys(draft).length} onClick={saveDraft} className="px-5 py-3 text-sm">
            {action === "draft" ? "Salvando..." : "Salvar revisão"}
          </OriButton>
          {record?.status === "publicado" ? (
            <OriButton type="button" variant="danger" disabled={Boolean(action)} onClick={unpublish} className="px-5 py-3 text-sm">
              {action === "unpublish" ? "Retirando..." : "Despublicar"}
            </OriButton>
          ) : (
            <OriButton type="button" disabled={Boolean(action) || !draftReady} onClick={publish} className="px-6 py-3 text-sm" style={{ background: "var(--gold-primary)", color: "#090506" }}>
              {action === "publish" ? "Publicando..." : "Publicar versão revisada"}
            </OriButton>
          )}
        </div>
      </div>
    </OriCard>
  );
}

export default Produto2ReviewPanel;
