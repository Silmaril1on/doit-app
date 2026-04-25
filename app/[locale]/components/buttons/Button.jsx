"use client";
import Link from "next/link";
import React from "react";
import BorderSvg from "../elements/BorderSvg";
import Spinner from "../elements/Spinner";
import { useSelector } from "react-redux";
import { selectColorValue } from "../../lib/features/configSlice";

const FILL_BY_THEME = {
  teal: "bg-teal-500 text-black",
  gold: "bg-gold text-black",
  blue: "bg-blue text-cream",
  crimson: "bg-crimson text-cream",
  grey: "bg-grey text-black",
  violet: "bg-violet text-cream",
  coffee: "bg-choco text-black",
};

const OUTLINE_BY_THEME = {
  teal: "bg-teal-500/20 hover:bg-teal-500/40 text-cream",
  gold: "bg-gold/20 hover:bg-gold/40 text-cream",
  blue: "bg-blue/20 hover:bg-blue/40 text-cream",
  crimson: "bg-crimson/20 hover:bg-crimson/40 text-cream",
  grey: "bg-grey/20 hover:bg-grey/40 text-cream",
  violet: "bg-violet/20 hover:bg-violet/40 text-cream",
  coffee: "bg-choco/20 hover:bg-choco/40 text-cream",
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
  loading = false,
  className = "",
  form,
}) => {
  const colorTheme = useSelector(selectColorValue) ?? "teal";
  const variantClasses =
    variant === "outline"
      ? (OUTLINE_BY_THEME[colorTheme] ?? OUTLINE_BY_THEME.teal)
      : (FILL_BY_THEME[colorTheme] ?? FILL_BY_THEME.teal);
  const sizeClasses = sizeClassMap[size] ?? sizeClassMap.md;
  const sharedClassName = `flex relative rounded-sm relative items-center justify-center gap-1.5 cursor-pointer transition-colors duration-300 disabled:cursor-not-allowed disabled:opacity-60 ${sizeClasses} ${variantClasses} ${className}`;

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
