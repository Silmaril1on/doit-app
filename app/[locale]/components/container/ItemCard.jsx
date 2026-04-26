"use client";
import React from "react";
import BorderSvg from "../elements/BorderSvg";

const ItemCard = ({ children, className, bg }) => {
  const bgClass = bg ?? "bg-primary/10";

  return (
    <div
      className={`rounded-lg p-3 ${bgClass} backdrop-blur-lg relative overflow-hidden ${className}`}
    >
      <BorderSvg strokeWidth={0.6} />
      <div
        className={`absolute left-0 top-0 w-[40%] h-[30%] rounded-full bg-primary blur-[70px] -z-1`}
      />
      {children}
    </div>
  );
};

export default ItemCard;
