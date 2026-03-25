import React from "react";

const ItemCard = ({ children }) => {
  return (
    <div className="h-44 w-84 bg-card-bg rounded-lg p-5 bg-teal-400/10 backdrop-blur-lg relative overflow-hidden">
      <div className="absolute left-0 top-0 w-[40%] h-[30%] rounded-full bg-teal-400 blur-[80px]" />
      {children}
    </div>
  );
};

export default ItemCard;
