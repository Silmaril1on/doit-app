import React from "react";

const Dot = ({ className }) => {
  return (
    <span className={`text-teal-500 text-lg lg:text-xl w-fit ${className}`}>
      •
    </span>
  );
};

export default Dot;
