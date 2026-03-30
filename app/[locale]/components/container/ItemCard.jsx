import React from "react";

const ItemCard = ({ children, className }) => {
  return (
    <div
      className={`rounded-lg p-3 backdrop-blur-lg bg-black relative overflow-hidden ${className}`}
      style={{
        border: "1.4px solid transparent",
        backgroundImage: `
          linear-gradient(rgba(8, 30, 25, 0.92), rgba(8, 30, 25, 0.92)),
          linear-gradient(135deg, rgba(45,212,191,0.95) 0%, rgba(45,212,191,0.55) 45%, rgba(45,212,191,0.2) 100%)
        `,
        backgroundOrigin: "padding-box, border-box",
        backgroundClip: "padding-box, border-box",
      }}
    >
      <div className="absolute left-0 top-0 w-[40%] h-[30%] rounded-full bg-teal-400 blur-[70px] -z-1" />
      {children}
    </div>
  );
};

export default ItemCard;
