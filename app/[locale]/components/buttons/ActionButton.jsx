import React from "react";
import BorderSvg from "../elements/BorderSvg";

const ActionButton = ({
  icon,
  onClick,
  ariaLabel = "Action button",
  className,
}) => {
  return (
    <div className={`${className}`}>
      <button
        type="button"
        onClick={onClick}
        aria-label={ariaLabel}
        className="rounded-full relative p-2 text-teal-400 bg-teal-500/30 cursor-pointer hover:bg-teal-500/50 duration-300"
      >
        <BorderSvg strokeWidth={1} radius={50} fadeAt={40} />
        {icon}
      </button>
    </div>
  );
};

export default ActionButton;
