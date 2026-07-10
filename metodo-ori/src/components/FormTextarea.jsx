import OriField from "./ui/OriField";

function FormTextarea({ placeholder, value, onChange }) {
  return (
    <OriField
      as="textarea"
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className="w-auto"
      variant="solid"
    />
  );
}

export default FormTextarea;
