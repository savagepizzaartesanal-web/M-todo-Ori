import { cx, mergeStyles } from "./uiUtils";

const toneStyles = {
  gold: {
    background: "rgba(242,185,104,0.08)",
    border: "1px solid rgba(242,185,104,0.14)",
    color: "var(--gold-primary)",
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
  muted: {
    background: "var(--ori-muted-bg)",
    border: "1px solid var(--ori-muted-border)",
    color: "var(--ori-muted-text)",
  },
  danger: {
    background: "var(--ori-danger-bg)",
    border: "1px solid var(--ori-danger-border)",
    color: "var(--ori-danger-text)",
  },
  next: {
    background: "rgba(217,164,95,0.10)",
    border: "1px solid rgba(217,164,95,0.18)",
    color: "var(--ori-state-next)",
  },
};

const sizeClasses = {
  xs: "px-2.5 py-1 text-[9px]",
  sm: "px-3 py-1 text-[11px]",
  md: "px-4 py-2 text-xs",
};

function OriBadge({
  as: Component = "span",
  tone = "gold",
  size = "sm",
  className = "",
  style,
  children,
  ...props
}) {
  return (
    <Component
      className={cx(
        "inline-flex w-fit items-center justify-center rounded-full font-medium",
        sizeClasses[size] || sizeClasses.sm,
        className,
      )}
      style={mergeStyles(toneStyles[tone] || toneStyles.gold, style)}
      {...props}
    >
      {children}
    </Component>
  );
}

export default OriBadge;
