import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import Produto2ReviewPanel from "../components/Produto2ReviewPanel";
import { questions } from "../data/questions";
import {
  createAdminClienteEvento,
  generateAdminAiMessage,
  getAdminCliente,
  updateAdminCliente,
} from "../services/api";
import {
  getAdminClientApproach,
  getAdminClientMemory,
  getAdminClientNextBestAction,
  getAdminClientPriority,
} from "../utils/adminClientPriority";
import {
  FEEDBACK_LABELS,
  getFeedbackBridge,
} from "../utils/feedbackInsights";

function AdminClienteDetalhe() {
  const { id } = useParams();

  const [cliente, setCliente] = useState(null);
  const [observacoes, setObservacoes] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [perfilAberto, setPerfilAberto] = useState(false);
  const [leituraAberta, setLeituraAberta] = useState(false);
  const [oraculoAberto, setOraculoAberto] = useState(false);
  const [produto1Respostas, setProduto1Respostas] = useState(null);
  const [produto1Feedback, setProduto1Feedback] = useState(null);
  const [oraculoCarta, setOraculoCarta] = useState(null);
  const [eventosAdmin, setEventosAdmin] = useState([]);
  const [copiedApproach, setCopiedApproach] = useState(false);
  const [aiApproach, setAiApproach] = useState(null);
  const [generatingAi, setGeneratingAi] = useState(false);
  const [aiNotice, setAiNotice] = useState("");
  const [historyOpen, setHistoryOpen] = useState(false);

  const fetchCliente = useCallback(async () => {
    setLoading(true);

    try {
      const data = await getAdminCliente(id);
      const clienteData = data.cliente || null;

      setCliente(clienteData);
      setObservacoes(clienteData?.observacoes_admin || "");
      setProduto1Respostas(data.produto1_respostas || null);
      setProduto1Feedback(data.produto1_feedback || null);
      setOraculoCarta(data.oraculo_carta || null);
      setEventosAdmin(data.eventos_admin || []);
      setAiApproach(null);
      setAiNotice("");
    } catch (error) {
      console.log("Erro ao buscar cliente:", error);
      setCliente(null);
      setProduto1Respostas(null);
      setProduto1Feedback(null);
      setOraculoCarta(null);
      setEventosAdmin([]);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    Promise.resolve().then(fetchCliente);
  }, [fetchCliente]);

  const registerAdminEvent = async (eventType, label, details = {}) => {
    if (!cliente?.id) return;

    try {
      const event = await createAdminClienteEvento(cliente.id, {
        event_type: eventType,
        label,
        details,
      });
      setEventosAdmin((current) => [event, ...current].slice(0, 30));
    } catch (error) {
      console.log("Histórico administrativo indisponível:", error);
    }
  };

  const updateCliente = async (updates, eventLabel = "Ficha atualizada") => {
    if (!cliente) return;

    setSaving(true);

    try {
      await updateAdminCliente(cliente.id, updates);
      await registerAdminEvent("cliente_atualizada", eventLabel, { updates });
    } catch (error) {
      console.log("Erro ao atualizar cliente:", error);
    }

    await fetchCliente();
    setSaving(false);
  };

  const handleSalvarObservacoes = () => {
    updateCliente({
      observacoes_admin: observacoes,
    }, "Observações internas atualizadas");
  };

  const formatDate = (date) => {
    if (!date) return "Sem data";

    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }).format(new Date(date));
  };

  const formatShortDate = (date) => {
    if (!date) return "";

    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(new Date(`${date}T00:00:00`));
  };

  const formatDateTime = (date) => {
    if (!date) return "Sem data";

    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(date));
  };

  const parseOnboardingProfile = (profile) => {
    if (!profile) return {};
    if (typeof profile !== "string") return profile;

    try {
      return JSON.parse(profile);
    } catch (error) {
      console.log("Erro ao interpretar perfil de entrada:", error);
      return {};
    }
  };

  if (loading) {
    return (
      <div
        className="ori-main-frame ori-card-protagonist rounded-[34px] md:rounded-[42px] p-8 md:p-10 cinematic-card"
        style={{
          background:
            "linear-gradient(135deg, rgba(18,9,10,0.88), rgba(5,2,2,0.96))",
          border: "1px solid rgba(242,185,104,0.14)",
          boxShadow:
            "0 0 90px rgba(242,185,104,0.055), inset 0 0 80px rgba(255,255,255,0.018)",
        }}
      >
        <p
          className="ori-type-system text-[10px] md:text-xs mb-5"
          style={{ color: "var(--gold-soft)" }}
        >
          Ficha da cliente
        </p>

        <h1
          className="ori-type-hero text-4xl md:text-5xl font-semibold"
          style={{
            color: "var(--gold-primary)",
            letterSpacing: "-0.05em",
          }}
        >
          Carregando cliente...
        </h1>
      </div>
    );
  }

  if (!cliente) {
    return (
      <div className="ori-atmosphere ori-atmosphere-method relative overflow-hidden max-w-7xl">
        <Link
          to="/admin/clientes"
          className="ori-button-secondary inline-block mb-8 rounded-full px-5 py-2.5 text-sm"
          style={{ color: "var(--gold-primary)" }}
        >
          ← Voltar para clientes
        </Link>

        <div
          className="ori-card-teaser rounded-[30px] p-8 cinematic-card"
          data-state="sealed"
          style={{
            background:
              "linear-gradient(180deg, rgba(18,9,10,0.72), rgba(7,3,4,0.88))",
            border: "1px solid rgba(242,185,104,0.10)",
          }}
        >
          <p style={{ color: "var(--text-soft)" }}>Cliente não encontrada.</p>
        </div>
      </div>
    );
  }

  const etapaAtual =
    cliente.status_jornada ||
    (cliente.resultado ? "Produto 1 concluído" : "Cadastro recebido");

  const timeline = [
    {
      label: "Cadastro recebido",
      description: "Cliente entrou no Portal ORI.",
      done: true,
    },
    {
      label: "Código das Deusas",
      description: cliente.resultado
        ? `Primeira leitura pronta: ${cliente.resultado}`
        : "Aguardando conclusão da primeira leitura.",
      done: Boolean(cliente.resultado),
    },
    {
      label: "Dossiê ORI",
      description: cliente.produto_2_liberado
        ? "Dossiê ORI liberado para a cliente."
        : "Aguardando liberação do Produto 2.",
      done: Boolean(cliente.produto_2_liberado),
    },
    {
      label: "Código Final",
      description: cliente.produto_3_liberado
        ? "Código Final liberado para a cliente."
        : "Código Final ainda pendente.",
      done: Boolean(cliente.produto_3_liberado),
    },
    {
      label: "Jornada finalizada",
      description:
        cliente.status_jornada === "Finalizado"
          ? "Cliente marcada como finalizada."
          : "Fechamento ainda pendente.",
      done: cliente.status_jornada === "Finalizado",
    },
  ];

  const chips = [
    cliente.admin ? "Admin" : null,
    cliente.resultado || "Sem resultado",
  ].filter(Boolean);
  const onboardingProfile = parseOnboardingProfile(cliente.perfil_onboarding);
  const onboardingItems = [
    ["Nome completo", onboardingProfile.fullName || cliente.nome],
    ["Como gosta de ser chamada", onboardingProfile.preferredName],
    ["Data de nascimento", formatShortDate(onboardingProfile.birthDate)],
    ["Estado/Cidade onde mora", onboardingProfile.residenceLocation],
    ["WhatsApp", onboardingProfile.whatsapp],
    ["Momento atual", onboardingProfile.journeyStage],
    ["O que mais pesa", onboardingProfile.mainPain],
    ["Descrição livre", onboardingProfile.mainPainCustom],
    ["Desejo principal", onboardingProfile.mainDesire],
    ["Autodeclaração racial", onboardingProfile.racialIdentity],
    ["Perfil criado em", formatDate(onboardingProfile.completedAt)],
  ].filter(([, value]) => Boolean(String(value || "").trim()));
  const onboardingCompleted = Boolean(cliente.perfil_onboarding_concluido);
  const onboardingSummary = onboardingCompleted
    ? `${onboardingItems.length} respostas registradas`
    : "Perfil ainda não preenchido";
  const produto1Answers = produto1Respostas?.answers || {};
  const produto1AnsweredCount =
    produto1Respostas?.answered_count || Object.keys(produto1Answers).length;
  const produto1TotalQuestions =
    produto1Respostas?.total_questions || questions.length;
  const produto1Progress = Math.round(
    (produto1AnsweredCount / produto1TotalQuestions) * 100,
  );
  const produto1Result =
    produto1Respostas?.result?.nomeComposto || cliente.resultado || null;
  const produto1AnswerItems = questions
    .filter((question) => produto1Answers[String(question.id)])
    .map((question) => ({
      id: question.id,
      bloco: question.bloco,
      text: question.pergunta,
      value: produto1Answers[String(question.id)],
    }));
  const oraculoPayload = oraculoCarta?.payload || {};
  const oraculoCardTitle =
    oraculoCarta?.card_title || oraculoPayload.cardTitle || "Sem carta registrada";
  const oraculoRevealLabel =
    oraculoCarta?.reveal_label || oraculoPayload.revealLabel || "Oráculo";
  const oraculoMessage =
    oraculoCarta?.message || oraculoPayload.message || "A cliente ainda não tirou uma carta.";
  const oraculoDate = oraculoCarta?.date_key
    ? formatShortDate(oraculoCarta.date_key)
    : "Nenhuma carta";
  const feedbackLabel = produto1Feedback
    ? FEEDBACK_LABELS[produto1Feedback.response] || produto1Feedback.response
    : "Ainda não respondeu";
  const lastContactEvent = eventosAdmin.find((event) =>
    ["mensagem_copiada", "whatsapp_aberto"].includes(event.event_type),
  );
  const lastAdminContact = lastContactEvent?.created_at
    ? formatDateTime(lastContactEvent.created_at)
    : "Sem registro";
  const feedbackBridge = getFeedbackBridge(produto1Feedback, cliente);
  const priority = getAdminClientPriority({
    cliente,
    resposta: produto1Respostas,
    feedback: produto1Feedback,
    oraculoCarta,
    onboardingProfile,
  });
  const nextAction = getAdminClientNextBestAction({
    cliente,
    resposta: produto1Respostas,
    feedback: produto1Feedback,
    oraculoCarta,
    onboardingProfile,
  });
  const memory = getAdminClientMemory({
    cliente,
    resposta: produto1Respostas,
    feedback: produto1Feedback,
    onboardingProfile,
    priority,
  });
  const contactWhatsapp = onboardingProfile.whatsapp || cliente.whatsapp || "";
  const approach = getAdminClientApproach({
    cliente,
    feedbackBridge: produto1Feedback ? feedbackBridge : null,
    onboardingProfile,
    priority,
  });
  const activeApproach = aiApproach || approach;
  const whatsappDigits = String(contactWhatsapp).replace(/\D/g, "");
  const whatsappUrl = whatsappDigits
    ? `https://wa.me/55${whatsappDigits.replace(/^55/, "")}?text=${encodeURIComponent(
        activeApproach.text,
      )}`
    : "";
  const copyApproach = async () => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(activeApproach.text);
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = activeApproach.text;
        textArea.setAttribute("readonly", "");
        textArea.style.position = "fixed";
        textArea.style.opacity = "0";
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
      }
      setCopiedApproach(true);
      await registerAdminEvent("mensagem_copiada", "Mensagem sugerida copiada");
      window.setTimeout(() => setCopiedApproach(false), 1800);
    } catch (error) {
      console.log("Não consegui copiar a abordagem:", error);
    }
  };
  const handleWhatsappOpen = () => {
    registerAdminEvent("whatsapp_aberto", "WhatsApp aberto pela ficha");
  };
  const handleGenerateAiApproach = async () => {
    setGeneratingAi(true);
    setAiNotice("");

    try {
      const data = await generateAdminAiMessage(cliente.id, {
        next_action_label: nextAction.label,
        next_action_reason: nextAction.reason,
        next_action_instruction: nextAction.action,
        message_goal: nextAction.messageGoal,
        fallback_title: approach.title,
        fallback_text: approach.text,
      });

      setAiApproach({
        title: data.title,
        text: data.text,
        generated: data.generated,
      });
      setAiNotice(
        data.generated
          ? "Mensagem gerada com IA. Revise antes de enviar."
          : data.warning || "A mensagem base foi mantida.",
      );
    } catch (error) {
      console.log("Erro ao gerar mensagem com IA:", error);
      setAiNotice(
        error?.userMessage ||
          "Não conseguimos gerar com IA agora. A mensagem base foi mantida.",
      );
    } finally {
      setGeneratingAi(false);
    }
  };
  return (
    <div className="ori-atmosphere ori-atmosphere-method relative overflow-hidden max-w-7xl">
      <Link
        to="/admin/clientes"
        className="ori-button-secondary inline-block mb-7 rounded-full px-5 py-2.5 text-sm"
        style={{ color: "var(--gold-primary)" }}
      >
        ← Voltar para clientes
      </Link>

      <section
        className="ori-main-frame ori-hero-panel relative overflow-hidden rounded-[34px] md:rounded-[42px] p-7 md:p-9 xl:p-10 mb-8 cinematic-card"
        style={{
          background:
            "radial-gradient(circle at top right, rgba(242,185,104,0.12), transparent 34%), linear-gradient(135deg, rgba(18,9,10,0.88), rgba(5,2,2,0.96))",
          border: "1px solid rgba(242,185,104,0.14)",
          boxShadow:
            "0 0 90px rgba(242,185,104,0.055), inset 0 0 80px rgba(255,255,255,0.018)",
          backdropFilter: "blur(18px)",
          WebkitBackdropFilter: "blur(18px)",
        }}
      >
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.028]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(242,185,104,0.22) 1px, transparent 1px), linear-gradient(90deg, rgba(242,185,104,0.10) 1px, transparent 1px)",
            backgroundSize: "72px 72px",
          }}
        />

        <div className="relative z-10">
          <div className="inline-flex items-center gap-4 mb-4">
            <div
              className="w-8 h-px"
              style={{
                background:
                  "linear-gradient(90deg, var(--gold-primary), transparent)",
              }}
            />

            <p
              className="ori-type-system text-[10px] md:text-xs"
              style={{ color: "var(--gold-soft)" }}
            >
              Ficha da cliente
            </p>
          </div>

          <h1
            className="ori-type-hero text-4xl md:text-5xl xl:text-[64px] mb-5"
            style={{
              color: "var(--gold-primary)",
              fontWeight: 600,
              letterSpacing: "-0.075em",
              textShadow: "0 0 42px rgba(242,185,104,0.12)",
            }}
          >
            {cliente.nome || "Cliente sem nome"}
          </h1>

          <p
            className="ori-type-reading-soft text-base md:text-lg mb-6"
            style={{ color: "var(--text-soft)" }}
          >
            {cliente.email}
            {contactWhatsapp ? (
              <>
                <br />
                {contactWhatsapp}
              </>
            ) : null}
          </p>

          <div className="flex flex-wrap gap-2.5">
            {chips.map((item) => (
              <span
                key={item}
                className="ori-chip px-4 py-2 text-xs"
                data-state={item === "Admin" ? "revealed" : "active"}
                style={{
                  background: "rgba(255,255,255,0.028)",
                  border: "1px solid rgba(242,185,104,0.10)",
                  color: "rgba(255,245,235,0.70)",
                  backdropFilter: "blur(10px)",
                  WebkitBackdropFilter: "blur(10px)",
                }}
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4 mb-8">
        {[
          ["Etapa atual", etapaAtual],
          ["Resposta pós-leitura", feedbackLabel],
          ["WhatsApp", contactWhatsapp || "Não informado"],
          ["Último contato", lastAdminContact],
        ].map(([label, value]) => (
          <div
            key={label}
            className="ori-card-secondary relative overflow-hidden rounded-[24px] p-5 cinematic-card"
            style={{
              background:
                "linear-gradient(180deg, rgba(18,9,10,0.72), rgba(7,3,4,0.88))",
              border: "1px solid rgba(242,185,104,0.10)",
              boxShadow: "inset 0 0 34px rgba(255,255,255,0.012)",
            }}
          >
            <p
              className="ori-type-system text-[9px] mb-3"
              style={{ color: "var(--gold-soft)" }}
            >
              {label}
            </p>

            <h2
              className="ori-type-revelation text-xl md:text-2xl"
              style={{
                color: "var(--gold-primary)",
                fontWeight: 600,
                letterSpacing: "-0.045em",
              }}
            >
              {value}
            </h2>
          </div>
        ))}
      </div>

      <Produto2ReviewPanel clienteId={cliente.id} />

      <section
        className="ori-main-frame ori-card-secondary relative overflow-hidden rounded-[30px] p-5 md:p-7 mb-8 cinematic-card"
        style={{
          background:
            "linear-gradient(180deg, rgba(18,9,10,0.74), rgba(7,3,4,0.9))",
          border: "1px solid rgba(242,185,104,0.10)",
          backdropFilter: "blur(14px)",
          WebkitBackdropFilter: "blur(14px)",
        }}
      >
        <div className="grid gap-4 xl:grid-cols-[1.15fr_1fr]">
          <div
            className="ori-card-secondary rounded-[22px] p-4 md:p-5"
            style={{
              background: "rgba(242,185,104,0.055)",
              border: "1px solid rgba(242,185,104,0.13)",
            }}
          >
            <p
              className="ori-type-system text-[9px] mb-3"
              style={{ color: "var(--gold-soft)" }}
            >
              {memory.title}
            </p>

            <p
              className="ori-type-reading-soft text-sm leading-relaxed"
              style={{ color: "rgba(255,245,235,0.74)" }}
            >
              {memory.summary}
            </p>
            {memory.signals.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {memory.signals.map((signal) => (
                  <span
                    key={signal}
                    className="ori-chip px-3 py-1.5 text-[11px]"
                    style={{
                      background: "rgba(255,255,255,0.026)",
                      border: "1px solid rgba(242,185,104,0.08)",
                      color: "rgba(255,245,235,0.62)",
                    }}
                  >
                    {signal}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div
            className="ori-card-secondary rounded-[22px] p-4 md:p-5"
            style={{
              background: "rgba(242,185,104,0.045)",
              border: "1px solid rgba(242,185,104,0.11)",
            }}
          >
            <p
              className="ori-type-system text-[9px] mb-3"
              style={{ color: "var(--gold-soft)" }}
            >
              Próximo passo recomendado
            </p>

            <h2
              className="ori-type-revelation text-2xl mb-2"
              style={{ color: "var(--gold-primary)", fontWeight: 620 }}
            >
              {nextAction.label}
            </h2>

            <p
              className="ori-type-reading-soft text-sm leading-relaxed"
              style={{ color: "rgba(255,245,235,0.68)" }}
            >
              {nextAction.action}
            </p>
          </div>

          <div
            className="ori-card-secondary rounded-[22px] p-4 md:p-5 xl:col-span-2"
            style={{
              background: "rgba(255,255,255,0.024)",
              border: "1px solid rgba(242,185,104,0.09)",
            }}
          >
            <div className="mb-3 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div>
                <p
                  className="ori-type-system text-[9px] mb-2"
                  style={{ color: "var(--gold-soft)" }}
                >
                  Mensagem sugerida
                </p>
                <h3
                  className="ori-type-revelation text-xl"
                  style={{ color: "var(--gold-primary)", fontWeight: 600 }}
                >
                  {activeApproach.title}
                </h3>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={handleGenerateAiApproach}
                  disabled={generatingAi}
                  className="ori-button-secondary rounded-full px-4 py-2 text-xs"
                  style={{
                    background: aiApproach?.generated
                      ? "rgba(183,140,255,0.10)"
                      : "rgba(242,185,104,0.08)",
                    border: aiApproach?.generated
                      ? "1px solid rgba(183,140,255,0.20)"
                      : "1px solid rgba(242,185,104,0.14)",
                    color: aiApproach?.generated
                      ? "rgba(222,205,255,0.92)"
                      : "var(--gold-primary)",
                    opacity: generatingAi ? 0.72 : 1,
                  }}
                >
                  {generatingAi ? "Gerando..." : "Gerar com IA"}
                </button>
                <button
                  type="button"
                  onClick={copyApproach}
                  className="ori-button-secondary rounded-full px-4 py-2 text-xs"
                  style={{
                    background: "rgba(242,185,104,0.08)",
                    border: "1px solid rgba(242,185,104,0.14)",
                    color: "var(--gold-primary)",
                  }}
                >
                  {copiedApproach ? "Copiado" : "Copiar mensagem"}
                </button>
                {whatsappUrl && (
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noreferrer"
                    onClick={handleWhatsappOpen}
                    className="ori-button-secondary rounded-full px-4 py-2 text-xs"
                    style={{
                      background: "rgba(120,255,160,0.08)",
                      border: "1px solid rgba(120,255,160,0.14)",
                      color: "#9BE7AE",
                    }}
                  >
                    Abrir WhatsApp
                  </a>
                )}
              </div>
            </div>

            {aiNotice && (
              <p
                className="ori-type-reading-soft mb-3 rounded-[14px] px-3 py-2 text-xs"
                style={{
                  background: aiApproach?.generated
                    ? "rgba(183,140,255,0.07)"
                    : "rgba(242,185,104,0.05)",
                  border: aiApproach?.generated
                    ? "1px solid rgba(183,140,255,0.12)"
                    : "1px solid rgba(242,185,104,0.09)",
                  color: aiApproach?.generated
                    ? "rgba(222,205,255,0.78)"
                    : "rgba(255,245,235,0.62)",
                }}
              >
                {aiNotice}
              </p>
            )}

            <p
              className="ori-type-reading-soft rounded-[16px] p-4 text-sm leading-relaxed"
              style={{
                background: "rgba(5,2,2,0.28)",
                border: "1px solid rgba(242,185,104,0.08)",
                color: "rgba(255,245,235,0.72)",
              }}
            >
              {activeApproach.text}
            </p>
          </div>

        </div>
      </section>

      {produto1Feedback && (
        <section
          className="ori-main-frame ori-card-secondary relative overflow-hidden rounded-[30px] p-5 md:p-7 mb-8 cinematic-card"
          style={{
            background:
              "linear-gradient(180deg, rgba(18,9,10,0.74), rgba(7,3,4,0.9))",
            border: "1px solid rgba(242,185,104,0.10)",
            backdropFilter: "blur(14px)",
            WebkitBackdropFilter: "blur(14px)",
          }}
        >
          <p
            className="ori-type-system text-[10px] mb-3"
            style={{ color: "var(--gold-soft)" }}
          >
            Resposta pós-leitura
          </p>
          <h2
            className="ori-type-revelation text-2xl md:text-3xl mb-4"
            style={{ color: "var(--gold-primary)", fontWeight: 620 }}
          >
            Retorno da cliente sobre a leitura
          </h2>

          <div className="grid gap-3 md:grid-cols-[0.7fr_1.3fr]">
            <div
              className="rounded-[22px] p-4"
              style={{
                background: "rgba(242,185,104,0.045)",
                border: "1px solid rgba(242,185,104,0.11)",
              }}
            >
              <p
                className="ori-type-system text-[8px] mb-2"
                style={{ color: "rgba(242,185,104,0.72)" }}
              >
                Resposta rápida
              </p>
              <p
                className="ori-type-revelation text-xl"
                style={{ color: "var(--gold-primary)", fontWeight: 600 }}
              >
                {feedbackLabel}
              </p>
            </div>

            <div
              className="rounded-[22px] p-4"
              style={{
                background: "rgba(255,255,255,0.024)",
                border: "1px solid rgba(242,185,104,0.08)",
              }}
            >
              <p
                className="ori-type-system text-[8px] mb-2"
                style={{ color: "rgba(242,185,104,0.72)" }}
              >
                Comentário aberto
              </p>
              <p
                className="ori-type-reading-soft text-sm leading-relaxed"
                style={{ color: "rgba(255,245,235,0.74)" }}
              >
                {produto1Feedback.comment || "A cliente não escreveu comentário aberto."}
              </p>
            </div>
          </div>
        </section>
      )}

      <section
        className="ori-main-frame ori-card-secondary relative overflow-hidden rounded-[30px] mb-8 cinematic-card"
        style={{
          background:
            "linear-gradient(180deg, rgba(18,9,10,0.72), rgba(7,3,4,0.88))",
          border: "1px solid rgba(242,185,104,0.10)",
          backdropFilter: "blur(14px)",
          WebkitBackdropFilter: "blur(14px)",
        }}
      >
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.024]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(242,185,104,0.18) 1px, transparent 1px), linear-gradient(90deg, rgba(242,185,104,0.08) 1px, transparent 1px)",
            backgroundSize: "58px 58px",
          }}
        />

        <div className="relative z-10">
          <button
            type="button"
            onClick={() => setPerfilAberto((current) => !current)}
            className="w-full text-left p-6 md:p-7"
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
              <div>
                <div className="inline-flex items-center gap-4 mb-4">
                  <div
                    className="w-8 h-px"
                    style={{
                      background:
                        "linear-gradient(90deg, var(--gold-primary), transparent)",
                    }}
                  />

                  <p
                    className="ori-type-system text-[10px] md:text-xs"
                    style={{ color: "var(--gold-soft)" }}
                  >
                    Perfil de Entrada ORI
                  </p>
                </div>

                <h2
                  className="ori-type-revelation text-2xl md:text-3xl mb-2"
                  style={{
                    color: "var(--gold-primary)",
                    fontWeight: 620,
                    letterSpacing: "-0.05em",
                  }}
                >
                  Respostas do perfil inicial
                </h2>

                <p
                  className="ori-type-reading-soft text-sm md:text-base"
                  style={{ color: "rgba(255,245,235,0.62)" }}
                >
                  {onboardingSummary}
                </p>
              </div>

              <div
                className="ori-pill inline-flex w-fit items-center justify-center px-5 py-2.5 text-xs uppercase tracking-[0.18em]"
                data-state={onboardingCompleted ? "revealed" : "sealed"}
                style={{
                  background: onboardingCompleted
                    ? "rgba(242,185,104,0.085)"
                    : "rgba(255,255,255,0.026)",
                  border: onboardingCompleted
                    ? "1px solid rgba(242,185,104,0.16)"
                    : "1px solid rgba(255,255,255,0.08)",
                  color: onboardingCompleted
                    ? "var(--gold-primary)"
                    : "rgba(255,245,235,0.54)",
                }}
              >
                {perfilAberto ? "Ocultar respostas" : "Ver respostas"}
              </div>
            </div>
          </button>

          {perfilAberto && (
            <div className="px-7 md:px-8 pb-7 md:pb-8">
              {onboardingItems.length > 0 ? (
                <div className="grid md:grid-cols-2 gap-3">
                  {onboardingItems.map(([label, value]) => (
                    <div
                      key={label}
                      className="ori-card-secondary rounded-[22px] p-4"
                      style={{
                        background: "rgba(255,255,255,0.024)",
                        border: "1px solid rgba(242,185,104,0.08)",
                        boxShadow: "inset 0 0 18px rgba(255,255,255,0.006)",
                      }}
                    >
                      <p
                        className="ori-type-system text-[8px] mb-2"
                        style={{ color: "rgba(242,185,104,0.72)" }}
                      >
                        {label}
                      </p>

                      <p
                        className="ori-type-reading-soft text-sm"
                        style={{ color: "rgba(255,245,235,0.74)" }}
                      >
                        {value}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm" style={{ color: "var(--text-soft)" }}>
                  Perfil de entrada ainda não preenchido por esta cliente.
                </p>
              )}

              {!onboardingCompleted && onboardingItems.length > 0 && (
                <p
                  className="mt-4 text-xs leading-relaxed"
                  style={{ color: "rgba(255,245,235,0.48)" }}
                >
                  Existem dados salvos, mas o perfil ainda não foi marcado como
                  concluído.
                </p>
              )}
            </div>
          )}
        </div>
      </section>

      <section
        className="ori-main-frame ori-card-secondary relative overflow-hidden rounded-[30px] mb-8 cinematic-card"
        style={{
          background:
            "linear-gradient(180deg, rgba(18,9,10,0.72), rgba(7,3,4,0.88))",
          border: "1px solid rgba(242,185,104,0.10)",
          backdropFilter: "blur(14px)",
          WebkitBackdropFilter: "blur(14px)",
        }}
      >
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.024]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(242,185,104,0.18) 1px, transparent 1px), linear-gradient(90deg, rgba(242,185,104,0.08) 1px, transparent 1px)",
            backgroundSize: "58px 58px",
          }}
        />

        <div className="relative z-10">
          <button
            type="button"
            onClick={() => setLeituraAberta((current) => !current)}
            className="w-full text-left p-6 md:p-7"
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
              <div>
                <div className="inline-flex items-center gap-4 mb-4">
                  <div
                    className="w-8 h-px"
                    style={{
                      background:
                        "linear-gradient(90deg, var(--gold-primary), transparent)",
                    }}
                  />

                  <p
                    className="ori-type-system text-[10px] md:text-xs"
                    style={{ color: "var(--gold-soft)" }}
                  >
                    Produto 1 · Código das Deusas
                  </p>
                </div>

                <h2
                  className="ori-type-revelation text-2xl md:text-3xl mb-2"
                  style={{
                    color: "var(--gold-primary)",
                    fontWeight: 620,
                    letterSpacing: "-0.05em",
                  }}
                >
                  Respostas da leitura arquetípica
                </h2>

                <p
                  className="ori-type-reading-soft text-sm md:text-base"
                  style={{ color: "rgba(255,245,235,0.62)" }}
                >
                  {produto1Respostas
                    ? `${produto1AnsweredCount} de ${produto1TotalQuestions} sinais respondidos`
                    : "Nenhuma resposta registrada ainda"}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span
                  className="ori-pill inline-flex w-fit items-center justify-center px-5 py-2.5 text-xs uppercase tracking-[0.18em]"
                  data-state={produto1Respostas?.is_complete ? "done" : "next"}
                  style={{
                    background: produto1Respostas?.is_complete
                      ? "rgba(120,255,160,0.10)"
                      : "rgba(242,185,104,0.075)",
                    border: produto1Respostas?.is_complete
                      ? "1px solid rgba(120,255,160,0.16)"
                      : "1px solid rgba(242,185,104,0.14)",
                    color: produto1Respostas?.is_complete
                      ? "#9BE7AE"
                      : "var(--gold-primary)",
                  }}
                >
                  {produto1Progress}%
                </span>

                <span
                  className="ori-pill inline-flex w-fit items-center justify-center px-5 py-2.5 text-xs uppercase tracking-[0.18em]"
                  data-state={produto1Respostas ? "revealed" : "sealed"}
                  style={{
                    background: produto1Respostas
                      ? "rgba(242,185,104,0.085)"
                      : "rgba(255,255,255,0.026)",
                    border: produto1Respostas
                      ? "1px solid rgba(242,185,104,0.16)"
                      : "1px solid rgba(255,255,255,0.08)",
                    color: produto1Respostas
                      ? "var(--gold-primary)"
                      : "rgba(255,245,235,0.54)",
                  }}
                >
                  {leituraAberta ? "Ocultar sinais" : "Ver sinais"}
                </span>
              </div>
            </div>
          </button>

          {produto1Respostas && (
            <div className="px-7 md:px-8 pb-4">
              <div
                className="h-1 rounded-full overflow-hidden"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(242,185,104,0.07)",
                }}
              >
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${produto1Progress}%`,
                    background:
                      "linear-gradient(90deg, rgba(210,135,70,0.62), rgba(242,185,104,0.95))",
                    boxShadow: "0 0 18px rgba(242,185,104,0.18)",
                  }}
                />
              </div>

              {produto1Result && (
                <p
                  className="ori-type-reading-soft mt-4 text-sm md:text-base"
                  style={{ color: "rgba(255,245,235,0.72)" }}
                >
                  Resultado atual:{" "}
                  <span style={{ color: "var(--gold-primary)" }}>
                    {produto1Result}
                  </span>
                </p>
              )}
            </div>
          )}

          {leituraAberta && (
            <div className="px-7 md:px-8 pb-7 md:pb-8">
              {produto1AnswerItems.length > 0 ? (
                <div className="grid md:grid-cols-2 gap-3">
                  {produto1AnswerItems.map((item) => (
                    <div
                      key={item.id}
                      className="ori-card-secondary rounded-[22px] p-4"
                      style={{
                        background: "rgba(255,255,255,0.024)",
                        border: "1px solid rgba(242,185,104,0.08)",
                        boxShadow: "inset 0 0 18px rgba(255,255,255,0.006)",
                      }}
                    >
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div>
                          <p
                            className="ori-type-system text-[8px] mb-2"
                            style={{ color: "rgba(242,185,104,0.72)" }}
                          >
                            {String(item.id).padStart(2, "0")} · {item.bloco}
                          </p>

                          <p
                            className="ori-type-reading-soft text-sm"
                            style={{ color: "rgba(255,245,235,0.74)" }}
                          >
                            {item.text}
                          </p>
                        </div>

                        <span
                          className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm"
                          style={{
                            background: "rgba(242,185,104,0.10)",
                            border: "1px solid rgba(242,185,104,0.16)",
                            color: "var(--gold-primary)",
                          }}
                        >
                          {item.value}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm" style={{ color: "var(--text-soft)" }}>
                  Nenhuma resposta do Produto 1 foi registrada para esta
                  cliente.
                </p>
              )}
            </div>
          )}
        </div>
      </section>

      <section
        className="ori-main-frame ori-card-secondary relative overflow-hidden rounded-[30px] mb-8 cinematic-card"
        style={{
          background:
            "linear-gradient(180deg, rgba(18,9,10,0.72), rgba(7,3,4,0.88))",
          border: "1px solid rgba(242,185,104,0.10)",
          backdropFilter: "blur(14px)",
          WebkitBackdropFilter: "blur(14px)",
        }}
      >
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.024]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(242,185,104,0.18) 1px, transparent 1px), linear-gradient(90deg, rgba(242,185,104,0.08) 1px, transparent 1px)",
            backgroundSize: "58px 58px",
          }}
        />

        <div className="relative z-10">
          <button
            type="button"
            onClick={() => setOraculoAberto((current) => !current)}
            className="w-full p-6 text-left md:p-7"
          >
            <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
            <div>
              <div className="inline-flex items-center gap-4 mb-4">
                <div
                  className="w-8 h-px"
                  style={{
                    background:
                      "linear-gradient(90deg, var(--gold-primary), transparent)",
                  }}
                />

                <p
                  className="ori-type-system text-[10px] md:text-xs"
                  style={{ color: "var(--gold-soft)" }}
                >
                  Oráculo
                </p>
              </div>

              <h2
                className="ori-type-revelation text-2xl md:text-3xl mb-2"
                style={{
                  color: "var(--gold-primary)",
                  fontWeight: 620,
                  letterSpacing: "-0.05em",
                }}
              >
                Última carta da cliente
              </h2>

              <p
                className="ori-type-reading-soft text-sm md:text-base"
                style={{ color: "rgba(255,245,235,0.62)" }}
              >
                {oraculoCarta
                  ? `Carta tirada em ${oraculoDate}`
                  : "Nenhuma carta diária registrada ainda"}
              </p>
            </div>

              <span
                className="ori-pill inline-flex w-fit items-center justify-center px-5 py-2.5 text-xs uppercase tracking-[0.18em]"
                data-state={oraculoCarta ? "revealed" : "sealed"}
                style={{
                  background: oraculoCarta
                    ? "rgba(242,185,104,0.085)"
                    : "rgba(255,255,255,0.026)",
                  border: oraculoCarta
                    ? "1px solid rgba(242,185,104,0.16)"
                    : "1px solid rgba(255,255,255,0.08)",
                  color: oraculoCarta
                    ? "var(--gold-primary)"
                    : "rgba(255,245,235,0.54)",
                }}
              >
                {oraculoAberto
                  ? "Ocultar carta"
                  : oraculoCarta
                    ? "Ver carta"
                    : "Sem carta"}
              </span>
            </div>
          </button>

          {oraculoAberto && (
            <div className="grid gap-3 px-6 pb-6 md:grid-cols-[0.7fr_1.3fr] md:px-7 md:pb-7">
            <div
              className="ori-card-secondary rounded-[22px] p-4"
              style={{
                background: "rgba(255,255,255,0.024)",
                border: "1px solid rgba(242,185,104,0.08)",
                boxShadow: "inset 0 0 18px rgba(255,255,255,0.006)",
              }}
            >
              <p
                className="ori-type-system text-[8px] mb-2"
                style={{ color: "rgba(242,185,104,0.72)" }}
              >
                {oraculoRevealLabel}
              </p>

              <h3
                className="ori-type-revelation text-xl"
                style={{
                  color: oraculoCarta
                    ? "var(--gold-primary)"
                    : "rgba(255,245,235,0.58)",
                  fontWeight: 600,
                  letterSpacing: "-0.04em",
                }}
              >
                {oraculoCardTitle}
              </h3>
            </div>

            <div
              className="ori-card-secondary rounded-[22px] p-4"
              style={{
                background: "rgba(255,255,255,0.024)",
                border: "1px solid rgba(242,185,104,0.08)",
                boxShadow: "inset 0 0 18px rgba(255,255,255,0.006)",
              }}
            >
              <p
                className="ori-type-system text-[8px] mb-2"
                style={{ color: "rgba(242,185,104,0.72)" }}
              >
                Mensagem registrada
              </p>

              <p
                className="ori-type-reading-soft text-sm leading-relaxed"
                style={{ color: "rgba(255,245,235,0.74)" }}
              >
                {oraculoMessage}
              </p>
            </div>
            </div>
          )}
        </div>
      </section>

      <div className="grid xl:grid-cols-[1.1fr_0.9fr] gap-8 mb-8">
        <div
          className="ori-card-secondary relative overflow-hidden rounded-[30px] p-6 md:p-7 cinematic-card"
          style={{
            background:
              "linear-gradient(180deg, rgba(18,9,10,0.72), rgba(7,3,4,0.88))",
            border: "1px solid rgba(242,185,104,0.10)",
            backdropFilter: "blur(14px)",
            WebkitBackdropFilter: "blur(14px)",
          }}
        >
          <div
            className="absolute inset-0 pointer-events-none opacity-[0.026]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(242,185,104,0.18) 1px, transparent 1px), linear-gradient(90deg, rgba(242,185,104,0.08) 1px, transparent 1px)",
              backgroundSize: "58px 58px",
            }}
          />

          <div className="relative z-10">
            <div className="inline-flex items-center gap-4 mb-7">
              <div
                className="w-8 h-px"
                style={{
                  background:
                    "linear-gradient(90deg, var(--gold-primary), transparent)",
                }}
              />

              <p
                className="ori-type-system text-[10px] md:text-xs"
                style={{ color: "var(--gold-soft)" }}
              >
                Timeline da Jornada
              </p>
            </div>

            <div className="space-y-5">
              {timeline.map((item, index) => (
                <div key={item.label} className="flex gap-5">
                  <div className="flex flex-col items-center">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-sm"
                      style={{
                        background: item.done
                          ? "var(--gold-primary)"
                          : "rgba(255,255,255,0.035)",
                        color: item.done ? "#090506" : "var(--text-muted)",
                        border: item.done
                          ? "none"
                          : "1px solid rgba(255,255,255,0.07)",
                        boxShadow: item.done
                          ? "0 0 26px rgba(242,185,104,0.14)"
                          : "none",
                      }}
                    >
                      {index + 1}
                    </div>

                    {index < timeline.length - 1 && (
                      <div
                        className="w-px h-10 mt-2"
                        style={{
                          background: item.done
                            ? "linear-gradient(180deg, rgba(242,185,104,0.42), transparent)"
                            : "linear-gradient(180deg, rgba(255,255,255,0.08), transparent)",
                        }}
                      />
                    )}
                  </div>

                  <div className="pt-1">
                    <h3
                      className="ori-type-revelation text-lg md:text-xl mb-2"
                      style={{
                        color: item.done
                          ? "var(--gold-primary)"
                          : "rgba(255,245,235,0.72)",
                        fontWeight: 600,
                        letterSpacing: "-0.035em",
                      }}
                    >
                      {item.label}
                    </h3>

                    <p
                      className="ori-type-reading-soft text-sm"
                      style={{ color: "var(--text-soft)" }}
                    >
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div
          className="ori-card-secondary relative overflow-hidden rounded-[30px] p-6 md:p-7 cinematic-card"
          style={{
            background:
              "linear-gradient(180deg, rgba(18,9,10,0.72), rgba(7,3,4,0.88))",
            border: "1px solid rgba(242,185,104,0.10)",
            backdropFilter: "blur(14px)",
            WebkitBackdropFilter: "blur(14px)",
          }}
        >
          <div className="inline-flex items-center gap-4 mb-7">
            <div
              className="w-8 h-px"
              style={{
                background:
                  "linear-gradient(90deg, var(--gold-primary), transparent)",
              }}
            />

            <p
              className="ori-type-system text-[10px] md:text-xs"
              style={{ color: "var(--gold-soft)" }}
            >
              Ações da Jornada
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <button
              disabled={saving}
              onClick={() =>
                updateCliente({
                  produto_2_liberado: !cliente.produto_2_liberado,
                  status_jornada: !cliente.produto_2_liberado
                    ? "Produto 2 liberado"
                    : cliente.resultado
                      ? "Produto 1 concluído"
                      : "Cadastro recebido",
                }, cliente.produto_2_liberado
                  ? "Acesso ao Dossiê ORI removido"
                  : "Dossiê ORI liberado")
              }
              className="ori-button-secondary px-6 py-4 rounded-full font-medium disabled:opacity-60"
              style={{
                background: cliente.produto_2_liberado
                  ? "rgba(120,255,160,0.10)"
                  : "rgba(242,185,104,0.08)",
                border: cliente.produto_2_liberado
                  ? "1px solid rgba(120,255,160,0.16)"
                  : "1px solid rgba(242,185,104,0.14)",
                color: cliente.produto_2_liberado
                  ? "#9BE7AE"
                  : "var(--gold-primary)",
              }}
            >
              {cliente.produto_2_liberado
                ? "Dossiê ORI liberado"
                : "Liberar Dossiê ORI"}
            </button>

            <button
              disabled={saving}
              onClick={() =>
                updateCliente({
                  produto_3_liberado: !cliente.produto_3_liberado,
                  status_jornada: !cliente.produto_3_liberado
                    ? "Produto 3 liberado"
                    : cliente.produto_2_liberado
                      ? "Produto 2 liberado"
                      : cliente.resultado
                        ? "Produto 1 concluído"
                        : "Cadastro recebido",
                }, cliente.produto_3_liberado
                  ? "Acesso ao Código Final removido"
                  : "Código Final liberado")
              }
              className="ori-button-secondary px-6 py-4 rounded-full font-medium disabled:opacity-60"
              style={{
                background: cliente.produto_3_liberado
                  ? "rgba(120,255,160,0.10)"
                  : "rgba(255,255,255,0.035)",
                border: cliente.produto_3_liberado
                  ? "1px solid rgba(120,255,160,0.16)"
                  : "1px solid rgba(255,255,255,0.07)",
                color: cliente.produto_3_liberado
                  ? "#9BE7AE"
                  : "rgba(255,245,235,0.66)",
              }}
            >
              {cliente.produto_3_liberado
                ? "Código Final liberado"
                : "Liberar Código Final"}
            </button>

            <button
              disabled={saving}
              onClick={() =>
                updateCliente({
                  status_jornada: "Dossiê enviado",
                }, "Dossiê marcado como enviado")
              }
              className="ori-button-secondary px-6 py-4 rounded-full font-medium disabled:opacity-60"
              style={{
                background: "rgba(183,140,255,0.08)",
                border: "1px solid rgba(183,140,255,0.16)",
                color: "#d9bdff",
              }}
            >
              Marcar Dossiê enviado
            </button>

            <button
              disabled={saving}
              onClick={() =>
                updateCliente({
                  status_jornada: "Finalizado",
                }, "Jornada marcada como finalizada")
              }
              className="ori-button-secondary px-6 py-4 rounded-full font-medium disabled:opacity-60"
              style={{
                background: "rgba(242,185,104,0.08)",
                border: "1px solid rgba(242,185,104,0.14)",
                color: "var(--gold-primary)",
              }}
            >
              Marcar como finalizado
            </button>

          </div>
        </div>
      </div>

      <section
        className="ori-card-secondary relative mb-8 overflow-hidden rounded-[30px] p-6 md:p-7 cinematic-card"
        style={{
          background:
            "linear-gradient(180deg, rgba(18,9,10,0.72), rgba(7,3,4,0.88))",
          border: "1px solid rgba(242,185,104,0.10)",
          backdropFilter: "blur(14px)",
          WebkitBackdropFilter: "blur(14px)",
        }}
      >
        <button
          type="button"
          onClick={() => setHistoryOpen((current) => !current)}
          className="flex w-full items-center justify-between gap-4 text-left"
        >
          <span className="inline-flex items-center gap-4">
            <span
              className="h-px w-8"
              style={{
                background:
                  "linear-gradient(90deg, var(--gold-primary), transparent)",
              }}
            />
            <span
              className="ori-type-system text-[10px] md:text-xs"
              style={{ color: "var(--gold-soft)" }}
            >
              Histórico administrativo
            </span>
          </span>
          <span
            className="ori-type-system text-[9px]"
            style={{ color: "rgba(242,185,104,0.68)" }}
          >
            {historyOpen
              ? "Ocultar"
              : `${eventosAdmin.length} ${eventosAdmin.length === 1 ? "registro" : "registros"}`}
          </span>
        </button>

        {historyOpen && eventosAdmin.length > 0 ? (
          <div className="mt-6 grid gap-2.5">
            {eventosAdmin.map((event) => (
              <div
                key={event.id}
                className="grid gap-1 rounded-[18px] px-4 py-3 md:grid-cols-[1fr_auto] md:items-center md:gap-4"
                style={{
                  background: "rgba(255,255,255,0.022)",
                  border: "1px solid rgba(242,185,104,0.08)",
                }}
              >
                <p
                  className="ori-type-reading-soft text-sm"
                  style={{ color: "rgba(255,245,235,0.72)" }}
                >
                  {event.label}
                </p>
                <p
                  className="ori-type-system text-[9px]"
                  style={{ color: "rgba(242,185,104,0.62)" }}
                >
                  {formatDateTime(event.created_at)}
                </p>
              </div>
            ))}
          </div>
        ) : historyOpen ? (
          <p
            className="ori-type-reading-soft mt-6 text-sm"
            style={{ color: "rgba(255,245,235,0.56)" }}
          >
            Nenhuma ação administrativa registrada ainda.
          </p>
        ) : null}
      </section>

      <div
        className="ori-card-secondary relative overflow-hidden rounded-[30px] p-6 md:p-7 cinematic-card"
        style={{
          background:
            "linear-gradient(180deg, rgba(18,9,10,0.72), rgba(7,3,4,0.88))",
          border: "1px solid rgba(242,185,104,0.10)",
          backdropFilter: "blur(14px)",
          WebkitBackdropFilter: "blur(14px)",
        }}
      >
        <div className="inline-flex items-center gap-4 mb-6">
          <div
            className="w-8 h-px"
            style={{
              background:
                "linear-gradient(90deg, var(--gold-primary), transparent)",
            }}
          />

          <p
            className="ori-type-system text-[10px] md:text-xs"
            style={{ color: "var(--gold-soft)" }}
          >
            Observações Internas
          </p>
        </div>

        <textarea
          value={observacoes}
          onChange={(event) => setObservacoes(event.target.value)}
          placeholder="Escreva observações privadas sobre esta cliente, ajustes, próximas entregas, preferências ou pontos de atenção..."
          className="w-full min-h-[220px] rounded-[26px] p-6 outline-none resize-y"
          style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(242,185,104,0.12)",
            color: "var(--text-primary)",
            lineHeight: 1.8,
          }}
        />

        <button
          disabled={saving}
          onClick={handleSalvarObservacoes}
          className="ori-journey-action mt-6 px-8 py-4 rounded-full font-medium disabled:opacity-60"
          style={{
            background: "var(--gold-primary)",
            color: "#090506",
            boxShadow: "0 0 50px rgba(242,185,104,0.14)",
          }}
        >
          {saving ? "Salvando..." : "Salvar observações"}
        </button>
      </div>
    </div>
  );
}

export default AdminClienteDetalhe;
