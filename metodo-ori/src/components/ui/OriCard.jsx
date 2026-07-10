import { cx, mergeStyles } from "./uiUtils";

const variantClasses = {
  secondary: "ori-card-secondary",
  protagonist: "ori-card-protagonist",
  teaser: "ori-card-teaser",
  sealed: "ori-card-sealed",
  hero: "ori-hero-panel",
  plain: "",
};

const paddingClasses = {
  none: "",
  compact: "p-3.5 md:p-4",
  card: "p-4 md:p-5",
  panel: "p-5 md:p-7",
  hero: "p-4 pt-7 md:p-8",
};

const radiusClasses = {
  sm: "rounded-[14px]",
  md: "rounded-[18px]",
  lg: "rounded-[24px]",
  xl: "rounded-[30px]",
  hero: "rounded-[24px] md:rounded-[42px]",
};

function OriCard({
  as: Component = "div",
  variant = "secondary",
  padding = "card",
  radius = "lg",
  interactive = false,
  className = "",
  style,
  children,
  ...props
}) {
  return (
    <Component
      className={cx(
        "relative overflow-hidden",
        variantClasses[variant] || variantClasses.secondary,
        paddingClasses[padding] || paddingClasses.card,
        radiusClasses[radius] || radiusClasses.lg,
        interactive && "cinematic-card",
        className,
      )}
      style={mergeStyles(style)}
      {...props}
    >
      {children}
    </Component>
  );
}

export default OriCard;
