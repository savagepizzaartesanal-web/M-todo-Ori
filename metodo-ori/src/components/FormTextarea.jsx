function FormTextarea({ placeholder, value, onChange }) {
  return (
    <textarea
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className="p-4 rounded-2xl min-h-35 outline-none"
      style={{
        background: "#1b1213",
        color: "var(--text-primary)",
        border: "1px solid var(--border-primary)",
      }}
    />
  );
}

export default FormTextarea;
