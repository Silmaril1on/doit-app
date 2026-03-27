import React from "react";

const colorClassMap = {
  violet: "border-violet-300/40 bg-violet-900/70 text-violet-100",
  pink: "border-pink-300/40 bg-pink-500/20 text-pink-100",
  gold: "border-gold/40 bg-gold/25 text-gold",
  sky: "border-sky-300/40 bg-sky-500/20 text-sky-100",
  blue: "border-blue/40 bg-blue/50 text-blue-100",
  red: "border-crimson/40 bg-crimson/20 text-red-200",
  green: "border-emerald-300/40 bg-emerald-500/20 text-emerald-100",
};

const Tablet = ({ text, className = "", onClick, color = "sky" }) => {
  const Component = onClick ? "button" : "span";
  const colorClass = colorClassMap[color] || colorClassMap.sky;

  return (
    <Component
      type={onClick ? "button" : undefined}
      onClick={onClick}
      className={`secondary inline-flex items-center rounded-full border px-4 py-1 text-[11px] uppercase tracking-[0.14em] transition duration-300 ${colorClass} ${onClick ? "cursor-pointer hover:brightness-110" : ""} ${className}`}
    >
      {text}
    </Component>
  );
};

export default Tablet;
