import OriButton from "./ui/OriButton";

function PrimaryButton({ children, className = "", style, ...props }) {
  return (
    <OriButton
      size="lg"
      className={`hover:scale-105 ${className}`}
      style={{ boxShadow: "none", ...style }}
      {...props}
    >
      {children}
    </OriButton>
  );
}

export default PrimaryButton;
