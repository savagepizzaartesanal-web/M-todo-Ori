function FormInput({ type = "text", placeholder, value, onChange }) {
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className="p-4 rounded-2xl outline-none"
      style={{
        background: "#1b1213",
        color: "var(--text-primary)",
        border: "1px solid var(--border-primary)",
      }}
    />
  );
}

export default FormInput;
