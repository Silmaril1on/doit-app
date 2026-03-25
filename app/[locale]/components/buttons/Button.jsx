"use client";
import Link from "next/link";
import React from "react";

const variantClassMap = {
  fill: "bg-teal-500 hover:bg-teal-600 text-black",
  outline:
    "bg-teal-500/20 hover:bg-teal-500/40 border border-teal-500/50 text-white",
};

const Button = ({
  onClick,
  text,
  variant = "fill",
  href,
  type = "button",
  disabled = false,
  className = "",
}) => {
  const variantClasses = variantClassMap[variant] ?? variantClassMap.fill;
  const sharedClassName = `inline-flex items-center justify-center cursor-pointer px-4 py-0.5 rounded-sm font-bold transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-60 ${variantClasses} ${className}`;

  if (href) {
    return (
      <Link href={href} className={sharedClassName}>
        {text}
      </Link>
    );
  }

  return (
    <button
      type={type}
      disabled={disabled}
      className={sharedClassName}
      onClick={onClick}
    >
      {text}
    </button>
  );
};

export default Button;
