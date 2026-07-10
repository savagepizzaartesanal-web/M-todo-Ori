import { cx, mergeStyles } from "./uiUtils";

const variantStyles = {
  primary: {
    background: "var(--ori-action-primary-bg)",
    color: "var(--ori-action-primary-text)",
    border: "1px solid transparent",
    boxShadow: "0 0 40px rgba(242,185,104,0.14)",
  },
  gradient: {
    background: "var(--ori-action-primary-bg-gradient)",
    color: "var(--ori-action-primary-text)",
    border: "1px solid rgba(242,185,104,0.18)",
    boxShadow: "0 0 42px rgba(242,185,104,0.15), inset 0 0 16px rgba(255,255,255,0.18)",
  },
  secondary: {
    background: "var(--ori-action-secondary-bg)",
    border: "1px solid var(--ori-action-secondary-border)",
    color: "var(--ori-action-secondary-text)",
  },
  ghost: {
    background: "transparent",
    border: "1px solid transparent",
    color: "var(--gold-primary)",
  },
  danger: {
    background: "var(--ori-danger-bg)",
    border: "1px solid var(--ori-danger-border)",
    color: "var(--ori-danger-text)",
  },
  success: {
    background: "var(--ori-success-bg)",
    border: "1px solid var(--ori-success-border)",
    color: "var(--ori-success-text)",
  },
  lavender: {
    background: "var(--ori-lavender-bg)",
    border: "1px solid var(--ori-lavender-border)",
    color: "var(--ori-lavender-text)",
  },
  disabled: {
    background: "var(--ori-action-disabled-bg)",
    border: "1px solid var(--ori-border-subtle)",
    color: "var(--ori-action-disabled-text)",
  },
};

const sizeClasses = {
  sm: "px-4 py-2 text-xs",
  md: "px-5 py-2.5 text-sm",
  lg: "px-6 py-3 text-sm md:px-8 md:py-4 md:text-base",
};

function OriButton({
  as: Component = "button",
  variant = "primary",
  size = "md",
  className = "",
  style,
  disabled = false,
  nativeButton,
  type = "button",
  children,
  ...props
}) {
  const disabledVariant = disabled ? "disabled" : variant;
  const shouldUseButtonProps = nativeButton ?? Component === "button";
  const componentProps = {
    className: cx(
      "ori-journey-action inline-flex w-fit items-center justify-center rounded-full font-medium transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-60",
      sizeClasses[size] || sizeClasses.md,
      className,
    ),
    style: mergeStyles(variantStyles[disabledVariant] || variantStyles.primary, style),
    "aria-disabled": disabled || undefined,
    ...props,
  };

  if (shouldUseButtonProps) {
    componentProps.type = type;
    componentProps.disabled = disabled;
  }

  return <Component {...componentProps}>{children}</Component>;
}

export default OriButton;
