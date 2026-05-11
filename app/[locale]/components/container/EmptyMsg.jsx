import React from "react";
import ItemCard from "./ItemCard";

const EmptyMsg = ({ msg, title, icon }) => {
  return (
    <ItemCard className="center flex-col space-y-2 py-20">
      {icon && <div className="text-4xl">{icon}</div>}
      <h2 className="text-primary text-2xl text-shadow">{title}</h2>
      <p className="text-chino/80 secondary text-sm text-center">{msg}</p>
    </ItemCard>
  );
};

export default EmptyMsg;
