import { useId } from "react";

import { cx, mergeStyles } from "./uiUtils";

const variantStyles = {
  default: {
    background: "var(--ori-input-bg)",
    border: "1px solid var(--ori-input-border)",
    color: "var(--ori-text-primary)",
  },
  solid: {
    background: "var(--ori-input-bg-solid)",
    border: "1px solid var(--ori-border-primary)",
    color: "var(--ori-text-primary)",
  },
};

function OriField({
  as: Component = "input",
  label,
  hint,
  error,
  id,
  className = "",
  style,
  variant = "default",
  children,
  ...props
}) {
  const generatedId = useId();
  const fieldId = id || generatedId;
  const descriptionId = hint || error ? `${fieldId}-description` : undefined;

  const fieldProps = {
    id: fieldId,
    "aria-invalid": error ? "true" : undefined,
    "aria-describedby": descriptionId,
    className: cx(
      "w-full rounded-2xl p-4 outline-none transition-all duration-300 placeholder:text-[var(--ori-input-placeholder)] focus:border-[var(--ori-input-focus-border)] focus:bg-[var(--ori-input-focus-bg)]",
      Component === "textarea" && "min-h-35 resize-y",
      className,
    ),
    style: mergeStyles(variantStyles[variant] || variantStyles.default, style),
    ...props,
  };

  const field =
    Component === "input" ? (
      <Component {...fieldProps} />
    ) : (
      <Component {...fieldProps}>{children}</Component>
    );

  if (!label && !hint && !error) return field;

  return (
    <label className="block" htmlFor={fieldId}>
      {label ? (
        <span className="ori-type-system mb-2 block text-[10px]" style={{ color: "var(--gold-soft)" }}>
          {label}
        </span>
      ) : null}
      {field}
      {hint || error ? (
        <span
          id={descriptionId}
          className="mt-2 block text-xs leading-relaxed"
          style={{ color: error ? "var(--ori-danger-text)" : "var(--ori-text-reading-soft)" }}
        >
          {error || hint}
        </span>
      ) : null}
    </label>
  );
}

export default OriField;
