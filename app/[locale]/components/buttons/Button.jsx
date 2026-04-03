"use client";
import Link from "next/link";
import React from "react";
import BorderSvg from "../elements/BorderSvg";

const variantClassMap = {
  fill: "bg-teal-500  text-black",
  outline: "bg-teal-500/20 hover:bg-teal-500/40 text-cream",
};

const sizeClassMap = {
  md: "px-4 py-1  text-sm font-bold",
  sm: "px-2.5 py-1  text-[10px] font-semibold secondary",
};

const Button = ({
  onClick,
  text,
  icon,
  variant = "fill",
  size = "md",
  href,
  type = "button",
  disabled = false,
  className = "",
  form,
}) => {
  const variantClasses = variantClassMap[variant] ?? variantClassMap.fill;
  const sizeClasses = sizeClassMap[size] ?? sizeClassMap.md;
  const sharedClassName = `flex rounded-sm relative items-center justify-center gap-1.5 cursor-pointer transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-60 ${sizeClasses} ${variantClasses} ${className}`;

  const content = (
    <div className=" center gap-1.5">
      {icon && <span>{icon}</span>}
      <h1>{text}</h1>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className={sharedClassName}>
        {content}
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
      {content}
    </button>
  );
};

export default Button;
