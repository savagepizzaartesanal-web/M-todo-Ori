import OriField from "./ui/OriField";

function FormInput({ type = "text", placeholder, value, onChange }) {
  return (
    <OriField
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className="w-auto"
      variant="solid"
    />
  );
}

export default FormInput;
