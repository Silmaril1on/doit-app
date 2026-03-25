import React from "react";

const ActionButton = ({ icon, onClick, ariaLabel = "Action button" }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      className="rounded-full p-2 text-teal-400 bg-teal-500/30 cursor-pointer hover:bg-teal-500/50 duration-300"
    >
      {icon}
    </button>
  );
};

export default ActionButton;
