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
    <div className="flex flex-col gap-1 lg:gap-2">
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        name={name || id}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete={autoComplete}
        disabled={disabled}
        // className="border secondary text-xs lg:text-sm border-teal-500/30 px-2 lg:px-3 py-2 text-teal-500 bg-black placeholder:text-teal-500/50 rounded-md outline-none focus:border-teal-500 duration-300 focus:ring-2 focus:ring-teal-400/40 w-full"
      />
    </div>
  );
};

export default Input;
