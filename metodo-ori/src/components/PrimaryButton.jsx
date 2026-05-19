function PrimaryButton({ children, onClick, type = "button" }) {
  return (
    <button
      type={type}
      onClick={onClick}
      className="px-6 py-4 rounded-full w-fit font-medium transition-all hover:scale-105"
      style={{
        background: "var(--gold-primary)",
        color: "#090506",
      }}
    >
      {children}
    </button>
  );
}

export default PrimaryButton;
