import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { questions } from "../data/questions";
import { getAdminCliente, updateAdminCliente } from "../services/api";
import {
  FEEDBACK_LABELS,
  getFeedbackBridge,
  getFeedbackInsight,
} from "../utils/feedbackInsights";

function AdminClienteDetalhe() {
  const { id } = useParams();

  const [cliente, setCliente] = useState(null);
  const [observacoes, setObservacoes] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [perfilAberto, setPerfilAberto] = useState(false);
  const [leituraAberta, setLeituraAberta] = useState(false);
  const [produto1Respostas, setProduto1Respostas] = useState(null);
  const [produto1Feedback, setProduto1Feedback] = useState(null);
  const [oraculoCarta, setOraculoCarta] = useState(null);

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
    } catch (error) {
      console.log("Erro ao buscar cliente:", error);
      setCliente(null);
      setProduto1Respostas(null);
      setProduto1Feedback(null);
      setOraculoCarta(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    Promise.resolve().then(fetchCliente);
  }, [fetchCliente]);

  const updateCliente = async (updates) => {
    if (!cliente) return;

    setSaving(true);

    try {
      await updateAdminCliente(cliente.id, updates);
    } catch (error) {
      console.log("Erro ao atualizar cliente:", error);
    }

    await fetchCliente();
    setSaving(false);
  };

  const handleSalvarObservacoes = () => {
    updateCliente({
      observacoes_admin: observacoes,
    });
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
          Ficha da Cliente
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

  const produtoAtual = cliente.produto_3_liberado
    ? "Código Final"
    : cliente.produto_2_liberado
      ? "Dossiê ORI"
      : cliente.resultado
        ? "Produto 1 concluído"
        : "Lead / Produto 1";

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
        ? `Resultado revelado: ${cliente.resultado}`
        : "Aguardando conclusão da primeira leitura.",
      done: Boolean(cliente.resultado),
    },
    {
      label: "Dossiê ORI",
      description: cliente.produto_2_liberado
        ? "Produto 2 liberado para acesso."
        : "Aguardando liberação do Produto 2.",
      done: Boolean(cliente.produto_2_liberado),
    },
    {
      label: "Código Final",
      description: cliente.produto_3_liberado
        ? "Produto 3 liberado para acesso."
        : "Código Final ainda pendente.",
      done: Boolean(cliente.produto_3_liberado),
    },
    {
      label: "Jornada finalizada",
      description:
        cliente.status_jornada === "Finalizado"
          ? "Cliente marcada como finalizada."
          : "Aprovação final pendente.",
      done: cliente.status_jornada === "Finalizado",
    },
  ];

  const chips = [
    cliente.admin ? "Admin" : "Cliente",
    produtoAtual,
    cliente.resultado || "Sem resultado",
    etapaAtual,
  ];
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
    : "Sem feedback";
  const feedbackInsight = getFeedbackInsight(produto1Feedback);
  const feedbackBridge = getFeedbackBridge(produto1Feedback, cliente);
  const feedbackDate = produto1Feedback?.updated_at
    ? formatDate(produto1Feedback.updated_at)
    : null;
  const nextAction = (() => {
    if (!onboardingCompleted) {
      return {
        label: "Finalizar perfil inicial",
        description:
          "A cliente ainda precisa completar a Entrada ORI para a jornada ficar bem amarrada.",
        state: "sealed",
      };
    }

    if (produto1Respostas && !produto1Respostas.is_complete) {
      return {
        label: "Acompanhar quiz em andamento",
        description: `${produto1Progress}% da leitura respondida. Vale observar se ela travou em algum ponto.`,
        state: "next",
      };
    }

    if (!cliente.resultado) {
      return {
        label: "Aguardar conclusão do Código",
        description:
          "O Produto 1 ainda não gerou resultado final para esta cliente.",
        state: "active",
      };
    }

    if (!cliente.produto_2_liberado) {
      return {
        label: "Convidar para o Dossiê ORI",
        description:
          "A leitura arquetípica já foi revelada. O próximo movimento é traduzir essa força no corpo, cor, cabelo e presença.",
        state: "revealed",
      };
    }

    if (!cliente.produto_3_liberado) {
      return {
        label: "Acompanhar entrega do Dossiê",
        description:
          "Produto 2 liberado. Observe fotos, formulário e preparação antes de abrir o Código Final.",
        state: "next",
      };
    }

    if (cliente.status_jornada !== "Finalizado") {
      return {
        label: "Encerrar jornada com cuidado",
        description:
          "Código Final liberado. Falta apenas marcar o fechamento quando a entrega estiver concluída.",
        state: "done",
      };
    }

    return {
      label: "Jornada finalizada",
      description:
        "Cliente com percurso completo registrado no painel administrativo.",
      state: "done",
    };
  })();

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
              Ficha da Cliente
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
            {cliente.whatsapp ? (
              <>
                <br />
                {cliente.whatsapp}
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

      <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        {[
          ["Resultado", cliente.resultado || "Sem resultado"],
          ["Produto atual", produtoAtual],
          ["Status", etapaAtual],
          ["Cadastro", formatDate(cliente.created_at)],
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
        <div className="grid gap-4 xl:grid-cols-[1.2fr_0.9fr_0.9fr]">
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
              Próxima ação sugerida
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
              {nextAction.description}
            </p>
          </div>

          <div
            className="ori-card-secondary rounded-[22px] p-4 md:p-5"
            style={{
              background: produto1Feedback
                ? "rgba(242,185,104,0.045)"
                : "rgba(255,255,255,0.024)",
              border: produto1Feedback
                ? "1px solid rgba(242,185,104,0.11)"
                : "1px solid rgba(242,185,104,0.08)",
            }}
          >
            <p
              className="ori-type-system text-[9px] mb-3"
              style={{ color: "var(--gold-soft)" }}
            >
              Feedback Produto 1
            </p>

            <p
              className="ori-type-revelation text-xl mb-2"
              style={{
                color: produto1Feedback
                  ? "var(--gold-primary)"
                  : "rgba(255,245,235,0.58)",
                fontWeight: 600,
              }}
            >
              {feedbackLabel}
            </p>

            <p
              className="ori-type-reading-soft text-xs"
              style={{ color: "rgba(255,245,235,0.56)" }}
            >
              {feedbackDate ? `Atualizado em ${feedbackDate}` : "Aguardando resposta"}
            </p>
            <p
              className="ori-type-system mt-3 text-[8px]"
              style={{ color: "var(--gold-soft)" }}
            >
              {feedbackInsight.label}
            </p>
          </div>

          <div
            className="ori-card-secondary rounded-[22px] p-4 md:p-5"
            style={{
              background: "rgba(255,255,255,0.024)",
              border: "1px solid rgba(242,185,104,0.08)",
            }}
          >
            <p
              className="ori-type-system text-[9px] mb-3"
              style={{ color: "var(--gold-soft)" }}
            >
              Produto 1
            </p>

            <p
              className="ori-type-revelation text-xl mb-3"
              style={{ color: "var(--gold-primary)", fontWeight: 600 }}
            >
              {produto1Result || "Sem resultado final"}
            </p>

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
                }}
              />
            </div>

            <p
              className="ori-type-reading-soft mt-3 text-xs"
              style={{ color: "rgba(255,245,235,0.56)" }}
            >
              {produto1AnsweredCount} de {produto1TotalQuestions} sinais ·{" "}
              {produto1Progress}%
            </p>
          </div>

          <div
            className="ori-card-secondary rounded-[22px] p-4 md:p-5"
            style={{
              background: "rgba(255,255,255,0.024)",
              border: "1px solid rgba(242,185,104,0.08)",
            }}
          >
            <p
              className="ori-type-system text-[9px] mb-3"
              style={{ color: "var(--gold-soft)" }}
            >
              Oráculo
            </p>

            <p
              className="ori-type-revelation text-xl mb-2"
              style={{
                color: oraculoCarta
                  ? "var(--gold-primary)"
                  : "rgba(255,245,235,0.58)",
                fontWeight: 600,
              }}
            >
              {oraculoCardTitle}
            </p>

            <p
              className="ori-type-reading-soft text-xs"
              style={{ color: "rgba(255,245,235,0.56)" }}
            >
              {oraculoCarta ? `Última carta: ${oraculoDate}` : "Sem carta registrada"}
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
            Validação da leitura
          </p>
          <h2
            className="ori-type-revelation text-2xl md:text-3xl mb-4"
            style={{ color: "var(--gold-primary)", fontWeight: 620 }}
          >
            Como a cliente recebeu o Código das Deusas
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
                {produto1Feedback.comment || "A cliente não deixou comentário aberto."}
              </p>
            </div>
          </div>
          <div className="mt-3 grid gap-3 md:grid-cols-[0.8fr_1.2fr]">
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
                Ação sugerida
              </p>
              <p
                className="ori-type-reading-soft text-sm leading-relaxed"
                style={{ color: "rgba(255,245,235,0.74)" }}
              >
                {feedbackInsight.action}
              </p>
            </div>

            <div
              className="rounded-[22px] p-4"
              style={{
                background: "rgba(242,185,104,0.045)",
                border: "1px solid rgba(242,185,104,0.12)",
              }}
            >
              <p
                className="ori-type-system text-[8px] mb-2"
                style={{ color: "rgba(242,185,104,0.72)" }}
              >
                Ponte pronta
              </p>
              <h3
                className="ori-type-revelation mb-2 text-lg"
                style={{ color: "var(--gold-primary)", fontWeight: 600 }}
              >
                {feedbackBridge.title}
              </h3>
              <p
                className="ori-type-reading-soft text-sm leading-relaxed"
                style={{ color: "rgba(255,245,235,0.74)" }}
              >
                {feedbackBridge.text}
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

        <div className="relative z-10 p-6 md:p-7">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-5">
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
              {oraculoCarta ? "Registrada" : "Sem carta"}
            </span>
          </div>

          <div className="mt-5 grid md:grid-cols-[0.7fr_1.3fr] gap-3">
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
                })
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
                })
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
                })
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
                })
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

            <button
              disabled={saving}
              onClick={() =>
                updateCliente({
                  admin: !cliente.admin,
                })
              }
              className="ori-button-secondary px-6 py-4 rounded-full font-medium disabled:opacity-60"
              style={{
                background: cliente.admin
                  ? "rgba(183,140,255,0.12)"
                  : "rgba(255,255,255,0.035)",
                border: cliente.admin
                  ? "1px solid rgba(183,140,255,0.18)"
                  : "1px solid rgba(255,255,255,0.07)",
                color: cliente.admin ? "#d9bdff" : "rgba(255,245,235,0.66)",
              }}
            >
              {cliente.admin ? "Remover admin" : "Tornar admin"}
            </button>
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
