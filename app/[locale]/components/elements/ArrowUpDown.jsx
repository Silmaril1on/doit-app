import React from "react";
import { MdArrowDropUp, MdOutlineArrowDropDown } from "react-icons/md";

const ArrowUpDown = ({
  isOpen = false,
  className = "",
  size = 20,
  openIcon,
  closedIcon,
}) => {
  const openNode = openIcon ?? (
    <MdArrowDropUp size={size} className={className} />
  );
  const closedNode = closedIcon ?? (
    <MdOutlineArrowDropDown size={size} className={className} />
  );

  return isOpen ? openNode : closedNode;
};

export default ArrowUpDown;
