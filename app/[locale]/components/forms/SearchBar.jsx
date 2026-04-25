"use client";

import React, { useRef } from "react";
import { IoSearch } from "react-icons/io5";
import { IoMdClose } from "react-icons/io";
import { useSelector } from "react-redux";
import { selectColorValue } from "@/app/[locale]/lib/features/configSlice";
import { THEME } from "@/app/[locale]/lib/utils/themeClasses";

const SearchBar = ({
  value = "",
  onChange,
  placeholder = "Search…",
  className = "",
  ariaLabel,
}) => {
  const inputRef = useRef(null);
  const colorTheme = useSelector(selectColorValue) ?? "teal";
  const t = THEME[colorTheme] ?? THEME.teal;

  const handleChange = (e) => onChange?.(e.target.value);

  const handleClear = () => {
    onChange?.("");
    inputRef.current?.focus();
  };

  return (
    <div className={`relative flex items-center ${className}`}>
      <IoSearch
        size={15}
        className={`pointer-events-none absolute left-3 ${t.iconMuted}`}
        aria-hidden
      />
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        aria-label={ariaLabel ?? placeholder}
        className={`secondary w-full rounded-full border ${t.borderMed} bg-black/40 py-2 pl-9 pr-8 text-sm text-cream/80 outline-none placeholder:text-cream/40 duration-300 ${t.inputFocusBorder} focus:ring-1 ${t.inputFocusRing}`}
      />
      {value && (
        <button
          type="button"
          onClick={handleClear}
          aria-label="Clear search"
          className={`absolute right-2.5 cursor-pointer ${t.iconMuted} duration-200 ${t.hoverIconMuted}`}
        >
          <IoMdClose size={14} />
        </button>
      )}
    </div>
  );
};

export default SearchBar;
