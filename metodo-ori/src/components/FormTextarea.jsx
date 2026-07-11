import OriField from "./ui/OriField";

function FormTextarea({ className = "", variant = "solid", ...props }) {
  return (
    <OriField
      as="textarea"
      className={`w-auto ${className}`}
      variant={variant}
      {...props}
    />
  );
}

export default FormTextarea;
