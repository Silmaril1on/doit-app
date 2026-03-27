"use client";
import Link from "next/link";
import React from "react";
import BorderSvg from "../elements/BorderSvg";

const variantClassMap = {
  fill: "bg-teal-500  text-black",
  outline: "bg-teal-500/20 hover:bg-teal-500/40 text-cream",
};

const Button = ({
  onClick,
  text,
  icon,
  variant = "fill",
  href,
  type = "button",
  disabled = false,
  className = "",
  form,
}) => {
  const variantClasses = variantClassMap[variant] ?? variantClassMap.fill;
  const sharedClassName = `flex relative items-center justify-center gap-1.5 cursor-pointer px-4 py-1 rounded-sm font-bold transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-60 ${variantClasses} ${className}`;

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
