import React from "react";
import BorderSvg from "../elements/BorderSvg";
import { MdEdit, MdClose, MdHeartBroken, MdMenu } from "react-icons/md";
import { FaTrash, FaHouseDamage, FaUser } from "react-icons/fa";
import { IoMdClose } from "react-icons/io";
import { BsThreeDotsVertical } from "react-icons/bs";
import { RiImageAddFill } from "react-icons/ri";

const VARIANTS = {
  edit: { icon: MdEdit, color: "teal" },
  delete: { icon: FaTrash, color: "red" },
  close: { icon: MdClose, color: "teal" },
  remove: { icon: IoMdClose, color: "teal" },
  home: { icon: FaHouseDamage, color: "teal" },
  profile: { icon: FaUser, color: "teal" },
  achievements: { icon: MdHeartBroken, color: "teal" },
  more: { icon: BsThreeDotsVertical, color: "teal" },
  expand: { icon: BsThreeDotsVertical, color: "teal" },
  menu: { icon: MdMenu, color: "teal" },
  uploadImage: { icon: RiImageAddFill, color: "teal" },
};

const COLOR_CLASSES = {
  teal: "text-teal-400 bg-teal-500/30 hover:bg-teal-500/50",
  red: "text-red-400 bg-red-500/20 hover:bg-red-500/40",
};

const ActionButton = ({
  variant,
  icon,
  onClick,
  ariaLabel,
  className,
  disabled,
  type,
}) => {
  const config = variant ? VARIANTS[variant] : null;
  const Icon = config?.icon ?? null;
  const colorClass = COLOR_CLASSES[config?.color ?? "teal"];

  const borderColor = config?.color ?? "teal";

  return (
    <div className={className}>
      <button
        type={type ?? "button"}
        onClick={onClick}
        disabled={disabled}
        aria-label={
          ariaLabel ?? (variant ? `${variant} button` : "Action button")
        }
        className={`rounded-full relative p-2 cursor-pointer duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${colorClass}`}
      >
        <BorderSvg
          strokeWidth={1}
          radius={50}
          fadeAt={40}
          color={borderColor}
        />
        {icon ?? (Icon && <Icon />)}
      </button>
    </div>
  );
};

export default ActionButton;
