"use client";
import React from "react";
import BorderSvg from "../elements/BorderSvg";
import { useSelector } from "react-redux";
import { selectColorValue } from "../../lib/features/configSlice";
import { THEME } from "../../lib/utils/themeClasses";

const ItemCard = ({ children, className, bg }) => {
  const colorTheme = useSelector(selectColorValue) ?? "teal";
  const t = THEME[colorTheme] ?? THEME.teal;
  const bgClass = bg ?? t.cardBg;

  return (
    <div
      className={`rounded-lg p-3 ${bgClass} backdrop-blur-lg relative overflow-hidden ${className}`}
    >
      <BorderSvg strokeWidth={0.6} />
      <div
        className={`absolute left-0 top-0 w-[40%] h-[30%] rounded-full ${t.cardGlow} blur-[70px] -z-1`}
      />
      {children}
    </div>
  );
};

export default ItemCard;
