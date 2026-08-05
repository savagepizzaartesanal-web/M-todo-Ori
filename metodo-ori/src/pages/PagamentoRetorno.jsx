import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import SyncNotice from "../components/SyncNotice";
import { OriButton } from "../components/ui";
import {
  getCurrentJornada,
  getPaymentOrderStatus,
  getProduto1Reading,
} from "../services/api";
import { forgetProduto1CheckoutOrder } from "../utils/produto1Cache";

const POLLING_INTERVAL_MS = 3000;
const POLLING_MAX_ATTEMPTS = 20;
const ORDER_ID_PATTERN = /^[a-zA-Z0-9_-]{6,120}$/;

const STATUS_COPY = {
  created: {
    title: "Estamos confirmando seu pagamento",
    text: "A confirmação pode levar alguns instantes. Você pode manter esta página aberta ou verificar novamente.",
    primary: "Verificar novamente",
  },
  pending: {
    title: "Estamos confirmando seu pagamento",
    text: "O Mercado Pago ainda está processando a confirmação. Vamos consultar o backend automaticamente por alguns instantes.",
    primary: "Verificar novamente",
  },
  approved: {
    title: "Pagamento confirmado",
    text: "Sua leitura completa foi liberada pelo backend. Você já pode continuar a partir de Vida real.",
    primary: "Continuar minha leitura",
  },
  rejected: {
    title: "O pagamento não foi concluído",
    text: "A transação não foi aprovada. Você pode tentar novamente quando quiser.",
    primary: "Tentar novamente",
  },
  cancelled: {
    title: "O pagamento não foi concluído",
    text: "A transação foi cancelada antes da confirmação.",
    primary: "Tentar novamente",
  },
  expired: {
    title: "O pagamento expirou",
    text: "Esse checkout não está mais ativo. Gere uma nova tentativa para desbloquear a leitura completa.",
    primary: "Tentar novamente",
  },
  refunded: {
    title: "Pagamento em revisão",
    text: "Esse pagamento aparece como estornado ou em tratativa. Fale com o suporte para conferirmos com cuidado.",
    primary: "Voltar ao portal",
  },
  error: {
    title: "Ainda não conseguimos confirmar",
    text: "Não vamos assumir nenhum status sem confirmação do backend. Tente verificar novamente em alguns instantes.",
    primary: "Verificar novamente",
  },
};

function getStatusCopy(status) {
  return STATUS_COPY[status] || STATUS_COPY.error;
}

function PagamentoRetorno() {
  const location = useLocation();
  const navigate = useNavigate();
  const orderId = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return params.get("order_id") || "";
  }, [location.search]);
  const orderIdValid = ORDER_ID_PATTERN.test(orderId);
  const [statusResponse, setStatusResponse] = useState(null);
  const [loading, setLoading] = useState(orderIdValid);
  const [checking, setChecking] = useState(false);
  const [message, setMessage] = useState(
    orderIdValid
      ? ""
      : "Link de retorno inválido. Volte para sua leitura e tente novamente.",
  );
  const [pollAttempts, setPollAttempts] = useState(0);
  const inFlightRef = useRef(false);
  const status = statusResponse?.status || "error";
  const copy = getStatusCopy(status);
  const pollingDone = pollAttempts >= POLLING_MAX_ATTEMPTS;
  const shouldPoll =
    orderIdValid &&
    ["created", "pending"].includes(status) &&
    !pollingDone &&
    pollAttempts < POLLING_MAX_ATTEMPTS;

  const refreshStatus = useCallback(async ({ silent = false } = {}) => {
    if (!orderIdValid || inFlightRef.current) return null;

    inFlightRef.current = true;
    if (!silent) setChecking(true);
    setMessage("");

    try {
      const data = await getPaymentOrderStatus(orderId);
      setStatusResponse(data);

      if (data.status === "approved") {
        forgetProduto1CheckoutOrder();

        const [jornadaResult, leituraResult] = await Promise.allSettled([
          getCurrentJornada(),
          getProduto1Reading(),
        ]);
        const jornada = jornadaResult.status === "fulfilled" ? jornadaResult.value : null;
        const leitura = leituraResult.status === "fulfilled" ? leituraResult.value : null;

        if (
          jornada?.produto_1_completo_liberado !== true &&
          leitura?.produto_1_completo_liberado !== true
        ) {
          setMessage(
            "O pagamento foi confirmado, mas a liberação ainda está sincronizando. Verifique novamente em alguns instantes.",
          );
        }
      }

      return data;
    } catch (apiError) {
      console.log("Erro ao confirmar pagamento:", apiError);
      setMessage(
        apiError?.userMessage ||
          "Não conseguimos consultar o pagamento agora. Tente novamente em alguns instantes.",
      );
      return null;
    } finally {
      inFlightRef.current = false;
      setLoading(false);
      setChecking(false);
    }
  }, [orderId, orderIdValid]);

  useEffect(() => {
    if (!orderIdValid) {
      return;
    }

    const timeout = window.setTimeout(() => {
      refreshStatus();
    }, 0);

    return () => window.clearTimeout(timeout);
  }, [orderIdValid, refreshStatus]);

  useEffect(() => {
    if (!shouldPoll) return undefined;

    const timeout = window.setTimeout(() => {
      if (document.visibilityState === "hidden") return;

      setPollAttempts((current) => current + 1);
      refreshStatus({ silent: true });
    }, POLLING_INTERVAL_MS);

    return () => window.clearTimeout(timeout);
  }, [pollAttempts, refreshStatus, shouldPoll, status]);

  const handlePrimaryAction = () => {
    if (status === "approved") {
      navigate("/produto-1/leitura?camada=vidaReal");
      return;
    }

    if (["rejected", "cancelled", "expired"].includes(status)) {
      navigate("/produto-1/leitura");
      return;
    }

    if (status === "refunded") {
      navigate("/portal");
      return;
    }

    refreshStatus();
  };

  return (
    <main className="ori-atmosphere min-h-screen px-4 py-8 md:px-8 md:py-12">
      <div className="mx-auto max-w-3xl">
        <SyncNotice message={message} />

        <section
          className="ori-main-frame relative overflow-hidden rounded-[28px] p-6 md:rounded-[42px] md:p-10"
          style={{
            background:
              "radial-gradient(circle at 82% 10%, rgba(242,185,104,0.14), transparent 34%), linear-gradient(135deg, rgba(18,9,10,0.90), rgba(5,2,2,0.97))",
            border: "1px solid rgba(242,185,104,0.14)",
            color: "var(--text-primary)",
          }}
        >
          <p className="ori-type-system text-[10px]" style={{ color: "var(--gold-soft)" }}>
            Pagamento · Código das Deusas
          </p>

          <h1
            className="ori-type-revelation mt-4 text-3xl md:text-5xl"
            style={{ color: "var(--gold-primary)", fontWeight: 650 }}
          >
            {loading ? "Consultando seu pagamento..." : copy.title}
          </h1>

          <p
            className="ori-type-reading-soft mt-4 text-sm leading-relaxed md:text-base"
            style={{ color: "rgba(255,245,235,0.72)" }}
          >
            {loading
              ? "Estamos buscando a confirmação diretamente no backend do ORI."
              : copy.text}
          </p>

          {statusResponse?.order_id && (
            <p
              className="ori-type-system mt-5 text-[9px]"
              style={{ color: "rgba(255,245,235,0.48)" }}
            >
              Pedido verificado no backend
            </p>
          )}

          {pollingDone && ["created", "pending"].includes(status) && (
            <p
              className="ori-type-reading-soft mt-4 text-sm"
              style={{ color: "var(--gold-soft)" }}
            >
              A confirmação ainda não chegou. Você pode verificar manualmente sem
              perder seu lugar na jornada.
            </p>
          )}

          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <OriButton
              type="button"
              variant="primary"
              onClick={handlePrimaryAction}
              disabled={loading || checking || !orderIdValid}
              className="justify-center px-6 py-3 text-sm disabled:opacity-55"
              style={{
                background: "var(--gold-primary)",
                color: "#090506",
                fontWeight: 720,
              }}
            >
              {checking ? "Verificando..." : copy.primary}
            </OriButton>

            <OriButton
              as={Link}
              to="/produto-1/leitura"
              variant="secondary"
              className="justify-center px-5 py-3 text-sm"
              style={{
                background: "rgba(255,255,255,0.026)",
                border: "1px solid rgba(242,185,104,0.12)",
                color: "rgba(255,245,235,0.72)",
              }}
            >
              Voltar para leitura
            </OriButton>
          </div>
        </section>
      </div>
    </main>
  );
}

export default PagamentoRetorno;
