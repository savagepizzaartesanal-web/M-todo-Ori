import { useEffect, useRef } from "react";

import {
  PAYMENT_BLOCKING_MESSAGES,
  PRODUTO1_PAYWALL_COPY,
} from "../content/produto1PaywallCopy";
import { OriButton } from "./ui";

const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "textarea:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
].join(",");

function getFocusableElements(container) {
  return Array.from(container.querySelectorAll(FOCUSABLE_SELECTOR)).filter(
    (element) => {
      if (element.tabIndex < 0) return false;
      if (element.hidden || element.getAttribute("aria-hidden") === "true") {
        return false;
      }
      if (element.getAttribute("aria-disabled") === "true") return false;

      const styles = window.getComputedStyle(element);
      return styles.display !== "none" && styles.visibility !== "hidden";
    },
  );
}

function formatCurrency(amountCents, currency) {
  if (!Number.isInteger(amountCents)) return "Em breve";

  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: currency || "BRL",
  }).format(amountCents / 100);
}

function getBlockingMessage(reason) {
  return (
    PAYMENT_BLOCKING_MESSAGES[reason] || PAYMENT_BLOCKING_MESSAGES.default
  );
}

function Produto1Paywall({
  open,
  product,
  loadingCatalog = false,
  checkoutLoading = false,
  errorMessage = "",
  onClose,
  onCheckout,
}) {
  const dialogRef = useRef(null);
  const previousFocusRef = useRef(null);
  const canCheckout =
    product?.active &&
    Number.isInteger(product?.amount_cents) &&
    product?.eligible &&
    !product?.already_unlocked;
  const priceLabel =
    product?.active && Number.isInteger(product?.amount_cents)
      ? formatCurrency(product.amount_cents, product.currency)
      : "Em breve";
  const disabledReason = product?.already_unlocked
    ? PAYMENT_BLOCKING_MESSAGES.already_unlocked
    : !product?.active || !Number.isInteger(product?.amount_cents)
      ? "A leitura completa será liberada em breve."
      : product?.eligible === false
        ? getBlockingMessage(product.blocking_reason)
        : "";

  useEffect(() => {
    if (!open) return undefined;

    previousFocusRef.current = document.activeElement;
    window.setTimeout(() => dialogRef.current?.focus(), 0);

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose?.();
        return;
      }

      if (event.key !== "Tab") {
        return;
      }

      const dialog = dialogRef.current;
      if (!dialog) return;

      const focusableElements = getFocusableElements(dialog);

      if (!focusableElements.length) {
        event.preventDefault();
        dialog.focus();
        return;
      }

      const firstFocusable = focusableElements[0];
      const lastFocusable = focusableElements[focusableElements.length - 1];
      const activeElement = document.activeElement;

      if (activeElement === dialog || !dialog.contains(activeElement)) {
        event.preventDefault();
        (event.shiftKey ? lastFocusable : firstFocusable).focus();
        return;
      }

      if (!event.shiftKey && activeElement === lastFocusable) {
        event.preventDefault();
        firstFocusable.focus();
        return;
      }

      if (event.shiftKey && activeElement === firstFocusable) {
        event.preventDefault();
        lastFocusable.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
      previousFocusRef.current?.focus?.();
    };
  }, [onClose, open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[90] flex items-end justify-center bg-black/72 px-4 py-5 backdrop-blur-md md:items-center"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose?.();
      }}
    >
      <section
        ref={dialogRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="produto-1-paywall-title"
        className="ori-main-frame relative max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-[26px] p-5 outline-none md:rounded-[34px] md:p-7"
        style={{
          background:
            "radial-gradient(circle at 82% 12%, rgba(242,185,104,0.16), transparent 34%), linear-gradient(135deg, rgba(18,9,10,0.96), rgba(5,2,2,0.99))",
          border: "1px solid rgba(242,185,104,0.16)",
          boxShadow:
            "0 0 90px rgba(242,185,104,0.10), inset 0 0 50px rgba(255,255,255,0.016)",
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
          <div className="mb-4 flex items-start justify-between gap-4">
            <div>
              <p
                className="ori-type-system text-[9px]"
                style={{ color: "var(--gold-soft)" }}
              >
                Código das Deusas · leitura completa
              </p>
              <h2
                id="produto-1-paywall-title"
                className="ori-type-revelation mt-3 text-3xl md:text-4xl"
                style={{
                  color: "var(--gold-primary)",
                  fontWeight: 660,
                  letterSpacing: "-0.055em",
                }}
              >
                {PRODUTO1_PAYWALL_COPY.title}
              </h2>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-lg transition hover:-translate-y-0.5"
              aria-label="Fechar paywall"
              style={{
                background: "rgba(255,255,255,0.030)",
                border: "1px solid rgba(242,185,104,0.12)",
                color: "rgba(255,245,235,0.72)",
              }}
            >
              ×
            </button>
          </div>

          <p
            className="ori-type-reading-soft text-sm leading-relaxed md:text-base"
            style={{ color: "rgba(255,245,235,0.74)" }}
          >
            {PRODUTO1_PAYWALL_COPY.text}
          </p>

          <div
            className="mt-5 rounded-[22px] px-4 py-4"
            style={{
              background:
                "linear-gradient(90deg, rgba(242,185,104,0.075), rgba(255,255,255,0.014))",
              border: "1px solid rgba(242,185,104,0.12)",
            }}
          >
            <p
              className="ori-type-system text-[9px]"
              style={{ color: "var(--gold-soft)" }}
            >
              Investimento
            </p>
            <p
              className="ori-type-revelation mt-2 text-3xl"
              style={{ color: "var(--text-primary)", fontWeight: 640 }}
            >
              {loadingCatalog ? "Consultando..." : priceLabel}
            </p>
            {disabledReason && (
              <p
                className="ori-type-reading-soft mt-2 text-sm"
                style={{ color: "rgba(255,245,235,0.62)" }}
              >
                {disabledReason}
              </p>
            )}
          </div>

          {(errorMessage || loadingCatalog) && (
            <p
              className="ori-type-reading-soft mt-4 text-sm"
              role="status"
              aria-live="polite"
              style={{ color: "var(--gold-soft)" }}
            >
              {loadingCatalog
                ? "Carregando disponibilidade da leitura completa..."
                : errorMessage}
            </p>
          )}

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <OriButton
              type="button"
              variant="primary"
              disabled={!canCheckout || checkoutLoading || loadingCatalog}
              onClick={onCheckout}
              className="justify-center px-6 py-3 text-sm disabled:opacity-55"
              style={{
                background: "var(--gold-primary)",
                color: "#090506",
                fontWeight: 720,
                boxShadow:
                  "0 0 38px rgba(242,185,104,0.18), inset 0 0 16px rgba(255,255,255,0.16)",
              }}
            >
              {checkoutLoading ? "Abrindo Mercado Pago..." : PRODUTO1_PAYWALL_COPY.primaryCta}
            </OriButton>

            <OriButton
              type="button"
              variant="secondary"
              onClick={onClose}
              className="justify-center px-5 py-3 text-sm"
              style={{
                background: "rgba(255,255,255,0.026)",
                border: "1px solid rgba(242,185,104,0.12)",
                color: "rgba(255,245,235,0.72)",
              }}
            >
              {PRODUTO1_PAYWALL_COPY.secondaryCta}
            </OriButton>
          </div>

          <p
            className="ori-type-reading-soft mt-4 text-xs"
            style={{ color: "rgba(255,245,235,0.48)" }}
          >
            {PRODUTO1_PAYWALL_COPY.security}
          </p>
        </div>
      </section>
    </div>
  );
}

export default Produto1Paywall;
