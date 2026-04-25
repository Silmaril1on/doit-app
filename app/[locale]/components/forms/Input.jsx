"use client";

import React, { useState } from "react";
import { HiEye, HiEyeOff } from "react-icons/hi";
import { useSelector } from "react-redux";
import { selectColorValue } from "@/app/[locale]/lib/features/configSlice";
import { THEME } from "@/app/[locale]/lib/utils/themeClasses";

const Input = ({ data, value, onChange, disabled = false }) => {
  const {
    id,
    name,
    label,
    type = "text",
    placeholder = "",
    autoComplete,
  } = data;

  const colorTheme = useSelector(selectColorValue) ?? "teal";
  const t = THEME[colorTheme] ?? THEME.teal;

  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";
  const resolvedType = isPassword ? (showPassword ? "text" : "password") : type;

  return (
    <div>
      <label htmlFor={id}>{label}</label>
      <div className={isPassword ? "relative" : undefined}>
        <input
          id={id}
          name={name || id}
          type={resolvedType}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={autoComplete}
          disabled={disabled}
          style={isPassword ? { paddingRight: "2.75rem" } : undefined}
          className={`${t.inputFocusBorder} focus:ring-2 ${t.inputFocusRing}`}
        />
        {isPassword && (
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setShowPassword((prev) => !prev)}
            className={`absolute right-3 top-1/2 -translate-y-1/2 text-white/40 ${t.hoverIconMuted} transition-colors duration-200`}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? (
              <HiEyeOff className="w-4 h-4" />
            ) : (
              <HiEye className="w-4 h-4" />
            )}
          </button>
        )}
      </div>
    </div>
  );
};

export default Input;
