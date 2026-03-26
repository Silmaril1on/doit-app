"use client";
import Link from "next/link";
import React from "react";
import BorderSvg from "../elements/BorderSvg";

const variantClassMap = {
  fill: "bg-teal-500  text-black",
  outline: "bg-teal-500/20 hover:bg-teal-500/40 text-white",
};

const Button = ({
  onClick,
  text,
  variant = "fill",
  href,
  type = "button",
  disabled = false,
  className = "",
  form,
}) => {
  const variantClasses = variantClassMap[variant] ?? variantClassMap.fill;
  const sharedClassName = `inline-flex relative items-center justify-center cursor-pointer px-4 py-0.5 rounded-sm font-bold transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-60 ${variantClasses} ${className}`;

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
      form={form}
      disabled={disabled}
      className={sharedClassName}
      onClick={onClick}
    >
      <BorderSvg strokeWidth={0.8} radius={4} />
      {text}
    </button>
  );
};

export default Button;
