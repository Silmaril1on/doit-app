"use client";

import React, { useRef } from "react";
import { IoSearch } from "react-icons/io5";
import { IoMdClose } from "react-icons/io";

/**
 * Reusable controlled search input.
 *
 * Props:
 *   value        {string}            - Controlled value
 *   onChange     {(string) => void}  - Called with the new string on every keystroke
 *   placeholder  {string}            - Input placeholder  (default: "Search…")
 *   className    {string}            - Extra classes applied to the wrapper div
 *   ariaLabel    {string}            - Accessible label (falls back to placeholder)
 */
const SearchBar = ({
  value = "",
  onChange,
  placeholder = "Search…",
  className = "",
  ariaLabel,
}) => {
  const inputRef = useRef(null);

  const handleChange = (e) => onChange?.(e.target.value);

  const handleClear = () => {
    onChange?.("");
    inputRef.current?.focus();
  };

  return (
    <div className={`relative flex items-center ${className}`}>
      <IoSearch
        size={15}
        className="pointer-events-none absolute left-3 text-teal-400/60"
        aria-hidden
      />
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        aria-label={ariaLabel ?? placeholder}
        className="secondary w-full rounded-full border border-teal-500/30 bg-black/40 py-2 pl-9 pr-8 text-sm text-teal-100 outline-none placeholder:text-teal-500/50 duration-300 focus:border-teal-500/60 focus:ring-1 focus:ring-teal-400/30"
      />
      {value && (
        <button
          type="button"
          onClick={handleClear}
          aria-label="Clear search"
          className="absolute right-2.5 cursor-pointer text-teal-400/60 duration-200 hover:text-teal-400"
        >
          <IoMdClose size={14} />
        </button>
      )}
    </div>
  );
};

export default SearchBar;
