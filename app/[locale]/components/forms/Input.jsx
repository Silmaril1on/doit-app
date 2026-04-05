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
    <div>
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
      />
    </div>
  );
};

export default Input;
