import { RiErrorWarningLine } from "react-icons/ri";

const FormField = ({
  value,
  type,
  label,
  placeholder,
  error,
  onChange,
  onBlur,
  id,
}) => {
  return (
    <div>
      <label htmlFor={id} className="block text-sm my-2">
        {label}
      </label>
      <div className="relative">
        <input
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          type={type}
          name={id}
          id={id}
          placeholder={placeholder || ""}
          className={`bg-gray-100 focus:bg-gray-50 p-2 text-sm w-full rounded-sm ${
            error ? "outline outline-red-700" : ""
          }`}
        />
        {error && (
          <RiErrorWarningLine className="absolute h-1/2 w-auto top-1/4 right-2 text-red-700" />
        )}
      </div>
      {error && <p className="text-xs text-red-700 mt-1">{error}</p>}
    </div>
  );
};

export default FormField;
