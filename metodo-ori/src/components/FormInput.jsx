import OriField from "./ui/OriField";

function FormInput({ type = "text", className = "", variant = "solid", ...props }) {
  return (
    <OriField
      type={type}
      className={`w-auto ${className}`}
      variant={variant}
      {...props}
    />
  );
}

export default FormInput;
