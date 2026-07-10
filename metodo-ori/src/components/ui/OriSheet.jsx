import { cx, mergeStyles } from "./uiUtils";

function OriSheet({
  open,
  onClose,
  title = "Painel ORI",
  id,
  children,
  className = "",
  style,
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60]" role="dialog" aria-modal="true" aria-label={title}>
      <button
        type="button"
        className="absolute inset-0 h-full w-full bg-black/62"
        onClick={onClose}
        aria-label="Fechar"
      />

      <div
        id={id}
        className={cx("absolute bottom-0 left-0 right-0 max-h-[86svh] overflow-hidden rounded-t-[28px] border px-5 pb-5 pt-4", className)}
        style={mergeStyles(
          {
            backgroundColor: "var(--ori-surface-panel-strong)",
            borderColor: "rgba(242,185,104,0.14)",
            boxShadow: "0 -18px 70px rgba(0,0,0,0.54), inset 0 1px 0 rgba(255,255,255,0.04)",
            backdropFilter: "blur(22px)",
            WebkitBackdropFilter: "blur(22px)",
          },
          style,
        )}
      >
        {children}
      </div>
    </div>
  );
}

export default OriSheet;
