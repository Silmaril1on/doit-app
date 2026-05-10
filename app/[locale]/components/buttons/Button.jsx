"use client";
import Link from "next/link";
import React from "react";
import BorderSvg from "../elements/BorderSvg";
import Spinner from "../elements/Spinner";

const sizeClassMap = {
  md: "px-4 py-1 text-sm",
  sm: "px-2.5 py-1 text-[10px]",
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
  loading = false,
  className = "",
  form,
}) => {
  const fillClasses = `bg-primary text-black`;
  const outlineClasses = `bg-primary/20 hover:bg-primary/40 text-cream`;
  const variantClasses = variant === "outline" ? outlineClasses : fillClasses;
  const sizeClasses = sizeClassMap[size] ?? sizeClassMap.md;
  const sharedClassName = `flex relative rounded-sm tracking-[1px] relative items-center justify-center gap-1.5 cursor-pointer transition-colors duration-300 disabled:cursor-not-allowed disabled:opacity-60 ${sizeClasses} ${variantClasses} ${className}`;

  const content = (
    <div className=" center gap-1.5">
      {loading ? (
        <Spinner size={size === "sm" ? 11 : 14} />
      ) : (
        <>
          {icon && <span>{icon}</span>}
          <h1>{text}</h1>
        </>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className={sharedClassName}>
        <BorderSvg strokeWidth={0.8} radius={4} />
        {content}
      </Link>
    );
  }

  return (
    <button
      type={type}
      form={form}
      disabled={disabled || loading}
      className={sharedClassName}
      onClick={onClick}
    >
      <BorderSvg strokeWidth={0.8} radius={4} />
      {content}
    </button>
  );
};

export default Button;
