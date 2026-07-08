import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import SyncNotice from "../components/SyncNotice";
import { supabase } from "../lib/supabaseClient";
import {
  getProduto2Dossie,
  saveProduto2Insumos,
  submitProduto2Insumos,
} from "../services/api";
import {
  produto2EmptyInsumos,
  produto2Steps,
} from "../data/produto2Form";

const PRODUTO_2_PHOTOS_BUCKET = "produto-2-fotos";

function cloneInsumos(source = {}) {
  return {
    ...produto2EmptyInsumos,
    ...source,
    dados_base: {
      ...produto2EmptyInsumos.dados_base,
      ...(source.dados_base || {}),
    },
    uploads: { ...produto2EmptyInsumos.uploads, ...(source.uploads || {}) },
    estrutura_corporal: {
      ...produto2EmptyInsumos.estrutura_corporal,
      ...(source.estrutura_corporal || {}),
    },
    coloracao: {
      ...produto2EmptyInsumos.coloracao,
      ...(source.coloracao || {}),
    },
    patton: { ...produto2EmptyInsumos.patton, ...(source.patton || {}) },
    cabelo: { ...produto2EmptyInsumos.cabelo, ...(source.cabelo || {}) },
    essencia: {
      ...produto2EmptyInsumos.essencia,
      ...(source.essencia || {}),
    },
    jornada: {
      ...produto2EmptyInsumos.jornada,
      ...(source.jornada || {}),
    },
    desafio_imagem: {
      ...produto2EmptyInsumos.desafio_imagem,
      ...(source.desafio_imagem || {}),
    },
  };
}

function getPathValue(source, path) {
  return path.split(".").reduce((current, key) => current?.[key], source) || "";
}

function setPathValue(source, path, value) {
  const keys = path.split(".");
  const next = { ...source };
  let current = next;

  keys.forEach((key, index) => {
    if (index === keys.length - 1) {
      current[key] = value;
      return;
    }

    current[key] = { ...(current[key] || {}) };
    current = current[key];
  });

  return next;
}

function safeFileName(name) {
  const parts = String(name || "foto").split(".");
  const extension = parts.length > 1 ? parts.pop().toLowerCase() : "jpg";
  const base = parts
    .join(".")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();

  return `${base || "foto"}.${extension}`;
}

function normalizeUploadedFiles(value) {
  if (Array.isArray(value)) return value;
  if (!value) return [];

  if (typeof value === "string") {
    const text = value.trim();
    return text ? [{ name: "Referência externa", url: text }] : [];
  }

  return [];
}

function FileUploadControl({ value, onChange, uploadScope, onNotice }) {
  const [uploading, setUploading] = useState(false);
  const files = normalizeUploadedFiles(value);
  const photoGuides = [
    {
      title: "Corpo inteiro",
      text: "frente, perfil e costas",
    },
    {
      title: "Rosto",
      text: "sem maquiagem, cabelo preso, com blusa branca e preta",
    },
    {
      title: "Cabelo",
      text: "solto natural, raiz e textura de perto",
    },
    {
      title: "Identidade",
      text: "um look ou peça com a qual você se reconhece",
    },
  ];

  const handleUpload = async (event) => {
    const selectedFiles = Array.from(event.target.files || []);
    event.target.value = "";

    if (!selectedFiles.length) return;

    setUploading(true);

    try {
      const uploaded = [];

      for (const [index, file] of selectedFiles.entries()) {
        const filePath = `${uploadScope}/${file.lastModified || "novo"}-${index}-${safeFileName(file.name)}`;
        const { error } = await supabase.storage
          .from(PRODUTO_2_PHOTOS_BUCKET)
          .upload(filePath, file, {
            cacheControl: "3600",
            contentType: file.type || "application/octet-stream",
            upsert: false,
          });

        if (error) throw error;

        uploaded.push({
          name: file.name,
          path: filePath,
          size: file.size,
          type: file.type,
          uploaded_at: file.lastModified
            ? new Date(file.lastModified).toISOString()
            : "",
        });
      }

      onChange([...files, ...uploaded]);
      onNotice?.(
        "Imagens adicionadas. Salve e continue depois para manter este registro vinculado ao Dossiê.",
      );
    } catch (error) {
      console.log("Erro ao enviar fotos do Produto 2:", error);
      onNotice?.(
        "Não conseguimos enviar as fotos agora. Verifique se o bucket do Produto 2 foi criado no Supabase.",
      );
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = async (fileToRemove) => {
    onChange(files.filter((file) => file.path !== fileToRemove.path));

    if (fileToRemove.path) {
      await supabase.storage
        .from(PRODUTO_2_PHOTOS_BUCKET)
        .remove([fileToRemove.path])
        .catch(() => null);
    }
  };

  return (
    <div
      className="grid gap-3 rounded-[18px] p-4 lg:grid-cols-[1fr_1fr_240px]"
      style={{
        background: "rgba(242,185,104,0.038)",
        border: "1px solid rgba(242,185,104,0.10)",
      }}
    >
      <div className="min-w-0">
        <p
          className="ori-type-system mb-2 text-[10px]"
          style={{ color: "var(--gold-soft)" }}
        >
          O que vamos observar
        </p>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
          {photoGuides.map((guide) => (
            <div
              key={guide.title}
              className="flex gap-3 rounded-[12px] px-3 py-2"
              style={{ background: "rgba(255,255,255,0.022)" }}
            >
              <span
                className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full"
                style={{ background: "var(--gold-primary)" }}
              />
              <div className="min-w-0">
                <p
                  className="text-xs font-medium"
                  style={{ color: "var(--text-primary)" }}
                >
                  {guide.title}
                </p>
                <p
                  className="text-xs leading-relaxed"
                  style={{ color: "rgba(247,234,216,0.62)" }}
                >
                  {guide.text}
                </p>
              </div>
            </div>
          ))}
        </div>

        {files.length ? (
          <div className="mt-3 grid max-h-[132px] gap-2 overflow-auto pr-1">
            {files.map((file) => (
              <div
                key={file.path || file.url || file.name}
                className="flex items-center justify-between gap-3 rounded-[14px] px-3 py-2"
                style={{
                  background: "rgba(255,255,255,0.026)",
                  border: "1px solid rgba(242,185,104,0.08)",
                }}
              >
                <div className="min-w-0">
                  <p className="truncate text-sm" style={{ color: "var(--text-primary)" }}>
                    {file.name}
                  </p>
                  {file.size ? (
                    <p className="text-xs" style={{ color: "rgba(247,234,216,0.52)" }}>
                      {(file.size / 1024 / 1024).toFixed(1)} MB
                    </p>
                  ) : null}
                </div>
                <button
                  type="button"
                  onClick={() => handleRemove(file)}
                  className="rounded-full px-3 py-1 text-xs"
                  style={{
                    background: "rgba(255,255,255,0.035)",
                    color: "rgba(247,234,216,0.72)",
                  }}
                >
                  Remover
                </button>
              </div>
            ))}
          </div>
        ) : null}
      </div>

      <div
        className="h-full rounded-[14px] p-4"
        style={{ background: "rgba(255,255,255,0.022)" }}
      >
        <p
          className="ori-type-system mb-2 text-[10px]"
          style={{ color: "var(--gold-soft)" }}
        >
          Como registrar suas imagens
        </p>
        <p className="text-sm leading-relaxed" style={{ color: "var(--text-primary)" }}>
          Prefira luz natural, sem filtros e com o mínimo de interferência visual.
          Quanto mais real a imagem, mais precisa a leitura.
        </p>
        <p
          className="mt-2 text-xs leading-relaxed"
          style={{ color: "rgba(247,234,216,0.58)" }}
        >
          Para corpo inteiro, use roupa ajustada ao corpo, como legging e top,
          ou biquíni. As fotos não precisam estar bonitas; precisam estar fiéis à
          sua imagem real.
        </p>
      </div>

      <div className="grid h-full gap-2">
        <label
          className="flex h-full min-h-[146px] cursor-pointer flex-col items-center justify-center rounded-[16px] border border-dashed px-5 py-5 text-center transition-all"
          style={{
            background: "rgba(255,255,255,0.026)",
            borderColor: "rgba(242,185,104,0.18)",
            color: "var(--text-soft)",
          }}
        >
          <span
            className="ori-type-revelation text-lg"
            style={{ color: "var(--gold-primary)" }}
          >
            {uploading ? "Enviando imagens..." : "Adicionar imagens da leitura"}
          </span>
          <span className="mt-1 text-xs" style={{ color: "rgba(247,234,216,0.58)" }}>
            JPG, PNG ou WEBP
          </span>
          <span className="mt-3 rounded-full px-3 py-1 text-[11px]" style={{
            background: "rgba(242,185,104,0.10)",
            color: "var(--gold-soft)",
          }}>
            Você pode selecionar várias imagens de uma vez
          </span>
          <input
            type="file"
            accept="image/*"
            multiple
            disabled={uploading}
            onChange={handleUpload}
            className="sr-only"
          />
        </label>
      </div>
    </div>
  );
}

function FieldControl({ field, value, onChange, uploadScope, onNotice }) {
  const sharedClass =
    "w-full rounded-[16px] border px-4 py-3 text-sm outline-none transition-all";
  const sharedStyle = {
    background: "rgba(255,255,255,0.032)",
    borderColor: "rgba(242,185,104,0.12)",
    color: "var(--text-primary)",
  };

  return (
    <div
      className={
        field.type === "radio" ||
        field.type === "textarea" ||
        field.type === "fileUpload"
          ? "block md:col-span-2"
          : "block"
      }
    >
      <span
        className="ori-type-system mb-2 block text-[10px]"
        style={{ color: "rgba(242,185,104,0.72)" }}
      >
        {field.label}
      </span>
      {field.helper ? (
        <p className="mb-2 text-xs" style={{ color: "rgba(247,234,216,0.58)" }}>
          {field.helper}
        </p>
      ) : null}

      {field.referenceImage ? (
        <figure
          className="mb-3 overflow-hidden rounded-[16px]"
          style={{
            background: "rgba(255,255,255,0.94)",
            border: "1px solid rgba(242,185,104,0.12)",
          }}
        >
          <img
            src={field.referenceImage}
            alt={field.label}
            loading="lazy"
            decoding="async"
            className="max-h-[520px] w-full object-contain"
          />
        </figure>
      ) : null}

      {field.type === "fileUpload" ? (
        <FileUploadControl
          value={value}
          onChange={onChange}
          uploadScope={uploadScope}
          onNotice={onNotice}
        />
      ) : field.type === "radio" ? (
        <div
          className={
            field.options.some((option) => option?.image)
              ? "grid gap-3 md:grid-cols-2"
              : "grid gap-2"
          }
        >
          {field.options.map((option) => {
            const optionLabel = typeof option === "string" ? option : option.label;
            const optionImage = typeof option === "string" ? "" : option.image;
            const selected = value === optionLabel;

            return (
              <button
                key={optionLabel}
                type="button"
                onClick={() => onChange(optionLabel)}
                className={
                  optionImage
                    ? "overflow-hidden rounded-[16px] text-left text-sm transition-all"
                    : "rounded-[14px] px-4 py-3 text-left text-sm transition-all"
                }
                style={{
                  background: selected
                    ? "rgba(242,185,104,0.12)"
                    : "rgba(255,255,255,0.026)",
                  border: selected
                    ? "1px solid rgba(242,185,104,0.32)"
                    : "1px solid rgba(242,185,104,0.10)",
                  color: selected ? "var(--gold-primary)" : "var(--text-soft)",
                }}
              >
                {optionImage ? (
                  <span
                    className="block aspect-[16/9] w-full overflow-hidden"
                    style={{ background: "rgba(250,247,242,0.96)" }}
                  >
                    <img
                      src={optionImage}
                      alt={optionLabel}
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-contain"
                    />
                  </span>
                ) : null}
                <span className={optionImage ? "block px-3 py-3" : "block"}>
                  {optionLabel}
                </span>
              </button>
            );
          })}
        </div>
      ) : field.type === "textarea" ? (
        <textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
          rows={4}
          className={`${sharedClass} resize-none`}
          style={sharedStyle}
        />
      ) : (
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={field.placeholder || ""}
          className={sharedClass}
          style={sharedStyle}
        />
      )}
    </div>
  );
}

function StatusBadge({ status }) {
  const labels = {
    aguardando_insumos: "Aguardando envio",
    em_analise: "Em análise",
    publicado: "Publicado",
  };

  return (
    <span
      className="rounded-full px-3 py-1 text-[11px] font-medium"
      style={{
        background: "rgba(183,140,255,0.10)",
        border: "1px solid rgba(183,140,255,0.18)",
        color: "#d9bdff",
      }}
    >
      {labels[status] || status}
    </span>
  );
}

function AnalysisCard({ title, children }) {
  return (
    <article
      className="rounded-[18px] p-4"
      style={{
        background: "linear-gradient(180deg, rgba(255,255,255,0.026), rgba(255,255,255,0.008))",
        border: "1px solid rgba(242,185,104,0.09)",
      }}
    >
      <p
        className="ori-type-system mb-2 text-[10px]"
        style={{ color: "var(--gold-soft)" }}
      >
        {title}
      </p>
      <div className="ori-type-reading-soft text-sm" style={{ color: "var(--text-soft)" }}>
        {children}
      </div>
    </article>
  );
}

function compactJoin(values) {
  return values
    .map((value) => String(value || "").trim())
    .filter(Boolean)
    .join(" · ");
}

function ConnectedDataPanel({ insumos }) {
  const [expanded, setExpanded] = useState(false);
  const nome = getPathValue(insumos, "dados_base.nome");
  const email = getPathValue(insumos, "dados_base.email");
  const whatsapp = getPathValue(insumos, "dados_base.whatsapp");
  const idade = getPathValue(insumos, "dados_base.idade");
  const cidade = getPathValue(insumos, "dados_base.endereco");
  const racial = getPathValue(insumos, "dados_base.autoidentificacao_racial");
  const resultado = getPathValue(insumos, "jornada.resultado_produto_1");
  const principal = getPathValue(insumos, "essencia.deusa_principal");
  const auxiliar = getPathValue(insumos, "essencia.deusa_auxiliar");
  const momento = getPathValue(insumos, "jornada.momento_atual");
  const objetivo = getPathValue(insumos, "jornada.objetivo_principal");
  const perfil = compactJoin([
    idade ? `${idade} anos` : "",
    cidade,
    racial,
  ]);
  const contato = compactJoin([email, whatsapp]);
  const arquetipos = compactJoin([
    resultado,
    principal && auxiliar ? `${principal} + ${auxiliar}` : "",
  ]);
  const jornada = compactJoin([momento, objetivo]);
  const items = [
    { title: nome || "Cliente", text: contato, tag: "Cadastro" },
    { title: "Perfil", text: perfil, tag: "Conferência" },
    { title: "Primeira leitura", text: arquetipos, tag: "Conectado" },
    { title: "Ponto de partida", text: jornada, tag: "Contexto" },
  ].filter((item) => item.title || item.text);
  const summary = [
    nome,
    resultado,
    principal && auxiliar ? `${principal} + ${auxiliar}` : principal || auxiliar,
  ].filter(Boolean);

  if (!items.length) return null;

  return (
    <section
      className="ori-main-frame ori-card-secondary relative mb-4 overflow-hidden rounded-[20px] p-4 md:rounded-[24px]"
      style={{
        background:
          "linear-gradient(180deg, rgba(18,9,10,0.70), rgba(5,2,2,0.90))",
        border: "1px solid rgba(242,185,104,0.10)",
      }}
    >
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p
            className="ori-type-system mb-1 text-[10px]"
            style={{ color: "var(--gold-soft)" }}
          >
            Jornada conectada
          </p>
          <h2
            className="ori-type-revelation text-lg md:text-xl"
            style={{ color: "var(--gold-primary)", fontWeight: 620 }}
          >
            O que já sabemos sobre sua jornada
          </h2>
          <p
            className="ori-type-reading-soft mt-1 max-w-2xl text-xs"
            style={{ color: "rgba(247,234,216,0.58)" }}
          >
            Veio do cadastro e da primeira leitura, então você não precisa responder de novo.
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          {summary.length ? (
            <div className="flex flex-wrap gap-2">
              {summary.map((item) => (
                <span
                  key={item}
                  className="rounded-full px-3 py-1 text-[11px]"
                  style={{
                    background: "rgba(255,255,255,0.030)",
                    border: "1px solid rgba(242,185,104,0.08)",
                    color: "rgba(247,234,216,0.70)",
                  }}
                >
                  {item}
                </span>
              ))}
            </div>
          ) : null}

          <button
            type="button"
            onClick={() => setExpanded((current) => !current)}
            className="w-fit rounded-full px-4 py-2 text-xs font-medium"
            style={{
              background: expanded
                ? "rgba(242,185,104,0.12)"
                : "rgba(255,255,255,0.035)",
              border: "1px solid rgba(242,185,104,0.12)",
              color: expanded ? "var(--gold-primary)" : "var(--text-soft)",
            }}
          >
            {expanded ? "Ocultar detalhes" : "Ver dados conectados"}
          </button>
        </div>
      </div>

      {expanded ? (
        <div className="mt-4 grid gap-2 md:grid-cols-2 xl:grid-cols-4">
          {items.map((item) => (
            <article
              key={item.title}
              className="rounded-[14px] p-3"
              style={{
                background: "rgba(255,255,255,0.026)",
                border: "1px solid rgba(242,185,104,0.08)",
              }}
            >
              <p
                className="ori-type-system mb-1 text-[9px]"
                style={{ color: "rgba(242,185,104,0.72)" }}
              >
                {item.tag}
              </p>
              <p className="text-sm" style={{ color: "var(--text-primary)" }}>
                {item.title}
              </p>
              {item.text ? (
                <p
                  className="mt-1 text-xs leading-relaxed"
                  style={{ color: "rgba(247,234,216,0.62)" }}
                >
                  {item.text}
                </p>
              ) : null}
            </article>
          ))}
        </div>
      ) : null}
    </section>
  );
}

function MissingProfileHint({ insumos }) {
  const missing = [
    !getPathValue(insumos, "dados_base.altura") ? "altura" : "",
    !getPathValue(insumos, "dados_base.peso_aproximado") ? "peso aproximado" : "",
    !getPathValue(insumos, "dados_base.autoidentificacao_racial")
      ? "autoidentificação racial"
      : "",
  ].filter(Boolean);

  const ready = !missing.length;
  const missingText = missing.join(" e ");

  return (
    <div
      className="mb-4 inline-flex max-w-full flex-wrap items-center gap-2 rounded-full px-3 py-2 md:col-span-2"
      style={{
        background: ready ? "rgba(242,185,104,0.07)" : "rgba(183,140,255,0.06)",
        border: ready
          ? "1px solid rgba(242,185,104,0.12)"
          : "1px solid rgba(183,140,255,0.12)",
      }}
    >
      <p
        className="ori-type-system text-[9px]"
        style={{ color: ready ? "var(--gold-soft)" : "rgba(183,140,255,0.80)" }}
      >
        {ready ? "Dados reunidos" : "Dados complementares"}
      </p>
      <p className="text-xs" style={{ color: "var(--text-soft)" }}>
        {ready
          ? "As informações principais desta etapa já foram reunidas."
          : `${missingText} ${missing.length === 1 ? "ajuda" : "ajudam"} a calibrar a leitura corporal com mais precisão.`}
      </p>
    </div>
  );
}

function Produto2() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");
  const [dossie, setDossie] = useState(null);
  const [insumos, setInsumos] = useState(cloneInsumos());
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    let mounted = true;

    async function loadDossie() {
      setLoading(true);
      try {
        const data = await getProduto2Dossie();
        if (!mounted) return;
        setDossie(data);
        setInsumos(cloneInsumos(data?.insumos || {}));
        setNotice("");
      } catch (error) {
        console.log("Erro ao carregar Produto 2:", error);
        if (!mounted) return;
        setNotice(
          error?.userMessage ||
            "Não conseguimos carregar o Dossiê ORI agora. Tente novamente em instantes.",
        );
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadDossie();

    return () => {
      mounted = false;
    };
  }, []);

  const step = produto2Steps[stepIndex];
  const status = dossie?.status || "aguardando_insumos";
  const produtoLiberado = Boolean(dossie?.produto_2_liberado);
  const isSubmitted = status === "em_analise" || status === "publicado";
  const uploadScope = dossie?.cliente_id || "rascunho";
  const visibleFields = step.fields.filter((field) => {
    if (field.path === "dados_base.autoidentificacao_racial") {
      return !getPathValue(insumos, field.path);
    }

    return true;
  });
  const analysis = dossie?.analise_preliminar || {};
  const publishedSections = useMemo(() => {
    const value = dossie?.dossie || {};
    return Object.entries(value).filter(([, content]) =>
      Boolean(
        typeof content === "string"
          ? content.trim()
          : JSON.stringify(content || {}).replace(/[{}"]/g, "").trim(),
      ),
    );
  }, [dossie]);

  const handleChange = (path, value) => {
    setInsumos((current) => setPathValue(current, path, value));
  };

  const handleSave = async () => {
    setSaving(true);
    setNotice("");

    try {
      const data = await saveProduto2Insumos(insumos);
      setDossie(data);
      setNotice("Rascunho do Dossiê salvo.");
    } catch (error) {
      console.log("Erro ao salvar dados do Produto 2:", error);
      setNotice(error?.userMessage || "Não conseguimos salvar o rascunho agora.");
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async () => {
    setSaving(true);
    setNotice("");

    try {
      const data = await submitProduto2Insumos(insumos);
      setDossie(data);
      setNotice("Informações enviadas. A análise preliminar já foi gerada para revisão.");
    } catch (error) {
      console.log("Erro ao enviar Produto 2:", error);
      setNotice(error?.userMessage || "Não conseguimos enviar o Dossiê agora.");
    } finally {
      setSaving(false);
    }
  };

  const renderHeroCard = () => {
    if (loading) {
      return {
        title: "Carregando Dossiê ORI...",
        text: "Estamos buscando suas informações para continuar a leitura.",
        locked: false,
      };
    }

    if (!produtoLiberado) {
      return {
        title: "Dossiê ORI ainda não liberado",
        text: "Esta etapa abre quando sua próxima leitura estiver disponível. Enquanto isso, sua primeira leitura segue como base da jornada.",
        locked: true,
      };
    }

    if (status === "publicado") {
      return {
        title: "Dossiê ORI publicado",
        text: "Sua leitura visual já está disponível.",
        locked: false,
      };
    }

    if (status === "em_analise") {
      return {
        title: "Dossiê ORI em análise",
        text: "Sua etapa foi concluída. A leitura visual final agora pode ser construída com mais precisão.",
        locked: false,
      };
    }

    return {
      title: "Dossiê ORI liberado",
      text: "Esta etapa está aberta para reunir os registros que vão orientar seu Dossiê.",
      locked: false,
    };
  };

  const heroCard = renderHeroCard();

  return (
    <div className="ori-atmosphere ori-atmosphere-dossie relative max-w-[1320px] overflow-hidden">
      <SyncNotice message={notice} label="Produto 2" />

      <section
        className="ori-main-frame ori-hero-panel cinematic-card relative mb-5 flex min-h-[360px] items-center overflow-hidden rounded-[24px] p-4 pt-7 md:min-h-[clamp(460px,calc(100vh-120px),580px)] md:rounded-[36px] md:p-7"
        style={{
          background:
            "linear-gradient(135deg, rgba(18,9,10,0.88), rgba(5,2,2,0.96))",
          border: "1px solid rgba(242,185,104,0.14)",
          boxShadow:
            "0 0 90px rgba(242,185,104,0.055), inset 0 0 80px rgba(255,255,255,0.018)",
        }}
      >
        <img
          src="/images/heroes/dossie-ori.png"
          alt="Dossiê ORI"
          loading="eager"
          decoding="async"
          className="pointer-events-none absolute inset-0 h-full w-full select-none object-cover object-[76%_center] opacity-95 md:object-[82%_center]"
        />

        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "linear-gradient(90deg, rgba(5,2,2,0.98) 0%, rgba(5,2,2,0.92) 31%, rgba(5,2,2,0.62) 50%, rgba(5,2,2,0.18) 73%, rgba(5,2,2,0.04) 100%)",
          }}
        />

        <div className="relative z-10 max-w-[560px]">
          <div className="mb-3 inline-flex items-center gap-3">
            <div
              className="h-px w-7"
              style={{
                background:
                  "linear-gradient(90deg, var(--gold-primary), transparent)",
              }}
            />
            <p className="ori-type-system" style={{ color: "var(--gold-soft)" }}>
              Integração
            </p>
          </div>

          <h1
            className="ori-type-hero mb-3 text-[38px] md:text-5xl xl:text-[50px]"
            style={{
              color: "var(--gold-primary)",
              fontWeight: 600,
              letterSpacing: "-0.075em",
            }}
          >
            Dossiê ORI
          </h1>

          <p
            className="ori-type-reading mb-4 max-w-[500px] text-sm"
            style={{ color: "var(--text-primary)" }}
          >
            Agora vamos observar como sua primeira leitura aparece no corpo,
            no rosto, nas cores, no cabelo, na beleza e na rotina real.
          </p>

          <div
            className="ori-card-teaser relative mb-4 max-w-[540px] overflow-hidden rounded-[18px] p-4 md:rounded-[20px]"
            data-state={heroCard.locked ? "sealed" : "active"}
            style={{
              background:
                "linear-gradient(90deg, rgba(242,185,104,0.075), rgba(255,255,255,0.016))",
              border: "1px solid rgba(242,185,104,0.14)",
              backdropFilter: "blur(12px)",
            }}
          >
            <div className="relative z-10">
              <div className="mb-3 flex items-center gap-3">
                <StatusBadge status={status} />
                {heroCard.locked ? (
                  <span style={{ color: "rgba(242,185,104,0.58)" }}>não liberado</span>
                ) : null}
              </div>

              <h2
                className="ori-type-revelation mb-2 text-lg md:text-xl"
                style={{
                  color: "var(--gold-primary)",
                  fontWeight: 600,
                  letterSpacing: "-0.045em",
                }}
              >
                {heroCard.title}
              </h2>

              <p
                className="ori-type-reading-soft max-w-[500px] text-sm"
                style={{ color: "var(--text-soft)" }}
              >
                {heroCard.text}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              to="/portal"
              className="inline-flex justify-center rounded-full px-5 py-2.5 text-sm font-medium"
              style={{
                background: "var(--gold-primary)",
                color: "#090506",
                boxShadow: "0 0 40px rgba(242,185,104,0.14)",
              }}
            >
              Voltar ao portal
            </Link>
            <Link
              to="/produto-1"
              className="inline-flex justify-center rounded-full px-5 py-2.5 text-sm font-medium"
              style={{
                background: "rgba(255,255,255,0.035)",
                border: "1px solid rgba(242,185,104,0.12)",
                color: "var(--text-soft)",
              }}
            >
              Rever primeira leitura
            </Link>
          </div>
        </div>
      </section>

      {!loading && produtoLiberado ? <ConnectedDataPanel insumos={insumos} /> : null}

      {!loading && produtoLiberado && !isSubmitted ? (
        <section
          className="ori-main-frame ori-card-secondary relative overflow-hidden rounded-[24px] p-4 md:rounded-[30px] md:p-6"
          style={{
            background:
              "linear-gradient(180deg, rgba(18,9,10,0.70), rgba(5,2,2,0.90))",
            border: "1px solid rgba(242,185,104,0.10)",
          }}
        >
          <div className="mb-5">
            <div>
              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div
                  className="inline-flex w-fit items-center gap-3 rounded-full px-3 py-2"
                  style={{
                    background: "rgba(255,255,255,0.026)",
                    border: "1px solid rgba(242,185,104,0.08)",
                  }}
                >
                  <p
                    className="ori-type-system text-[9px]"
                    style={{ color: "var(--gold-soft)" }}
                  >
                    Etapa {String(stepIndex + 1).padStart(2, "0")} de{" "}
                    {String(produto2Steps.length).padStart(2, "0")}
                  </p>
                </div>

                <div className="flex gap-1.5">
                  {produto2Steps.map((item, index) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setStepIndex(index)}
                      aria-label={`Ir para ${item.title}`}
                      className="h-2.5 w-2.5 rounded-full transition-all"
                      style={{
                        background:
                          index === stepIndex
                            ? "var(--gold-primary)"
                            : "rgba(247,234,216,0.20)",
                        boxShadow:
                          index === stepIndex
                            ? "0 0 18px rgba(242,185,104,0.28)"
                            : "none",
                      }}
                    />
                  ))}
                </div>
              </div>

              <div className="mb-4">
                <p
                  className="ori-type-system mb-2 text-[10px]"
                  style={{ color: "var(--gold-soft)" }}
                >
                  {step.eyebrow}
                </p>
                <h2
                  className="ori-type-revelation mb-2 text-2xl"
                  style={{ color: "var(--gold-primary)", fontWeight: 620 }}
                >
                  {step.title}
                </h2>
                <p
                  className="ori-type-reading-soft max-w-2xl text-sm"
                  style={{ color: "var(--text-soft)" }}
                >
                  {step.description}
                </p>
              </div>

              {step.id === "base" ? <MissingProfileHint insumos={insumos} /> : null}

              <div className="grid gap-3 md:grid-cols-2">
                {visibleFields.map((field) => (
                  <FieldControl
                    key={field.path}
                    field={field}
                    value={getPathValue(insumos, field.path)}
                    onChange={(value) => handleChange(field.path, value)}
                    uploadScope={uploadScope}
                    onNotice={setNotice}
                  />
                ))}
                {!visibleFields.length ? (
                  <p
                    className="ori-type-reading-soft text-sm md:col-span-2"
                    style={{ color: "var(--text-soft)" }}
                  >
                    Esta etapa já foi preenchida com dados da sua jornada.
                  </p>
                ) : null}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 border-t border-white/10 pt-5 sm:flex-row sm:justify-between">
            <div className="flex gap-2">
              <button
                type="button"
                disabled={stepIndex === 0}
                onClick={() => setStepIndex((current) => Math.max(current - 1, 0))}
                className="rounded-full px-5 py-2.5 text-sm disabled:cursor-not-allowed disabled:opacity-40"
                style={{
                  background: "rgba(255,255,255,0.035)",
                  color: "var(--text-soft)",
                }}
              >
                Voltar
              </button>
              <button
                type="button"
                disabled={stepIndex === produto2Steps.length - 1}
                onClick={() =>
                  setStepIndex((current) =>
                    Math.min(current + 1, produto2Steps.length - 1),
                  )
                }
                className="rounded-full px-5 py-2.5 text-sm disabled:cursor-not-allowed disabled:opacity-40"
                style={{
                  background: "rgba(255,255,255,0.035)",
                  color: "var(--text-soft)",
                }}
              >
                Próxima etapa
              </button>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <button
                type="button"
                disabled={saving}
                onClick={handleSave}
                className="rounded-full px-5 py-2.5 text-sm font-medium disabled:opacity-60"
                style={{
                  background: "rgba(183,140,255,0.10)",
                  border: "1px solid rgba(183,140,255,0.18)",
                  color: "#d9bdff",
                }}
              >
                {saving ? "Salvando..." : "Salvar e continuar depois"}
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={handleSubmit}
                className="rounded-full px-5 py-2.5 text-sm font-medium disabled:opacity-60"
                style={{
                  background: "var(--gold-primary)",
                  color: "#090506",
                }}
              >
                {saving ? "Enviando..." : "Concluir e enviar para análise"}
              </button>
            </div>
          </div>
        </section>
      ) : null}

      {!loading && produtoLiberado && status === "em_analise" ? (
        <section
          className="ori-main-frame ori-card-secondary mt-5 rounded-[24px] p-4 md:rounded-[30px] md:p-6"
          style={{
            background:
              "linear-gradient(180deg, rgba(18,9,10,0.70), rgba(5,2,2,0.90))",
            border: "1px solid rgba(242,185,104,0.10)",
          }}
        >
          <div className="mb-5">
            <p className="ori-type-system mb-2 text-[10px]" style={{ color: "var(--gold-soft)" }}>
              Análise preliminar
            </p>
            <h2 className="ori-type-revelation text-2xl" style={{ color: "var(--gold-primary)" }}>
              O sistema já organizou os primeiros sinais.
            </h2>
          </div>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            <AnalysisCard title="Kibbe">
              <p>{analysis.kibbe?.sugestao || "Aguardando cálculo"}</p>
              <p className="mt-2 text-xs opacity-70">
                {JSON.stringify(analysis.kibbe?.pontuacoes || {})}
              </p>
            </AnalysisCard>
            <AnalysisCard title="Coloração">
              <p>{analysis.coloracao?.sugestao_cartela_sazonal || "Aguardando cálculo"}</p>
              <p className="mt-2 text-xs opacity-70">
                Profundidade {analysis.coloracao?.saldo_profundidade_contraste ?? "-"} ·
                Temperatura {analysis.coloracao?.saldo_temperatura ?? "-"} · Intensidade{" "}
                {analysis.coloracao?.saldo_intensidade ?? "-"}
              </p>
            </AnalysisCard>
            <AnalysisCard title="Patton">
              <p>{analysis.patton?.sugestao || "Não aplicado"}</p>
              <p className="mt-2 text-xs opacity-70">
                {analysis.patton?.aplicavel ? "Aplicável" : "Não aplicável"}
              </p>
            </AnalysisCard>
            <AnalysisCard title="Cabelo">
              <p>{analysis.cabelo?.perfil_curvatura_densidade || "Aguardando cálculo"}</p>
              <p className="mt-2 text-xs opacity-70">
                {analysis.cabelo?.necessidade_tratamento}
              </p>
            </AnalysisCard>
            <AnalysisCard title="Arquétipos">
              <p>{analysis.arquetipos?.composto || "Herdado da primeira leitura"}</p>
              <p className="mt-2 text-xs opacity-70">
                {analysis.arquetipos?.dominante} + {analysis.arquetipos?.auxiliar}
              </p>
            </AnalysisCard>
          </div>
        </section>
      ) : null}

      {!loading && produtoLiberado && status === "publicado" ? (
        <section
          className="ori-main-frame ori-card-secondary mt-5 rounded-[24px] p-4 md:rounded-[30px] md:p-6"
          style={{
            background:
              "linear-gradient(180deg, rgba(18,9,10,0.70), rgba(5,2,2,0.90))",
            border: "1px solid rgba(242,185,104,0.10)",
          }}
        >
          <div className="mb-5">
            <p className="ori-type-system mb-2 text-[10px]" style={{ color: "var(--gold-soft)" }}>
              Entrega publicada
            </p>
            <h2 className="ori-type-revelation text-2xl" style={{ color: "var(--gold-primary)" }}>
              Seu Dossiê ORI
            </h2>
          </div>

          <div className="grid gap-3">
            {publishedSections.length ? (
              publishedSections.map(([key, content]) => (
                <AnalysisCard key={key} title={key.replaceAll("_", " ")}>
                  {typeof content === "string" ? (
                    <p className="whitespace-pre-line">{content}</p>
                  ) : (
                    <pre className="whitespace-pre-wrap text-xs">
                      {JSON.stringify(content, null, 2)}
                    </pre>
                  )}
                </AnalysisCard>
              ))
            ) : (
              <p className="ori-type-reading-soft text-sm" style={{ color: "var(--text-soft)" }}>
                O Dossiê foi publicado, mas ainda não há blocos preenchidos.
              </p>
            )}
          </div>
        </section>
      ) : null}
    </div>
  );
}

export default Produto2;
