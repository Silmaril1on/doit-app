import React from "react";

const Input = ({ data, value, onChange, disabled = false }) => {
  const {
    id,
    name,
    label,
    type = "text",
    placeholder = "",
    autoComplete,
  } = data;

  return (
    <div className="space-y-2">
      <label
        htmlFor={id}
        className="secondary text-xs uppercase font-bold text-cream"
      >
        {label}
      </label>
      <input
        id={id}
        name={name || id}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete={autoComplete}
        disabled={disabled}
        className="border secondary border-teal-500/30 px-3 py-2 text-teal-500 bg-black placeholder:text-teal-500/50 rounded-md outline-none focus:border-teal-500 duration-300 focus:ring-2 focus:ring-teal-400/60 w-full"
      />
    </div>
  );
};

export default Input;
