import OriButton from "./ui/OriButton";

function PrimaryButton({ children, onClick, type = "button" }) {
  return (
    <OriButton
      type={type}
      onClick={onClick}
      size="lg"
      className="hover:scale-105"
      style={{ boxShadow: "none" }}
    >
      {children}
    </OriButton>
  );
}

export default PrimaryButton;
