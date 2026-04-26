"use client";

import React, { useRef } from "react";
import { IoSearch } from "react-icons/io5";
import { IoMdClose } from "react-icons/io";

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
        className={`pointer-events-none absolute left-3 text-primary/60`}
        aria-hidden
      />
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        aria-label={ariaLabel ?? placeholder}
        className={`secondary w-full rounded-full border border-primary/30 bg-black/40 py-2 pl-9 pr-8 text-sm text-cream/80 outline-none placeholder:text-cream/40 duration-300 focus:border-primary/60 focus:ring-1 focus:ring-primary/30`}
      />
      {value && (
        <button
          type="button"
          onClick={handleClear}
          aria-label="Clear search"
          className={`absolute right-2.5 cursor-pointer text-primary/60 duration-200 hover:text-primary`}
        >
          <IoMdClose size={14} />
        </button>
      )}
    </div>
  );
};

export default SearchBar;
