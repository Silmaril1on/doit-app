import React from "react";
import Link from "next/link";
import BorderSvg from "../elements/BorderSvg";
import { MdEdit, MdClose, MdHeartBroken, MdMenu } from "react-icons/md";
import { FaTrash, FaHouseDamage, FaUser, FaUserPlus } from "react-icons/fa";
import { IoMdClose, IoIosSend } from "react-icons/io";
import { BsThreeDotsVertical } from "react-icons/bs";
import { IoQrCode } from "react-icons/io5";
import { RiImageAddFill } from "react-icons/ri";
import Motion from "../motion/Motion";

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
  add: { icon: FaUserPlus, color: "teal" },
  send: { icon: IoIosSend, color: "teal" },
  qr: { icon: IoQrCode, color: "teal" },
};

const COLOR_CLASSES = {
  teal: "text-teal-400 bg-teal-500/30 hover:bg-teal-500/50",
  red: "text-red-400 bg-red-500/20 hover:bg-red-500/40",
  orange: "text-orange-400 bg-orange-500/20 hover:bg-orange-500/30",
  yellow: "text-yellow-400 bg-yellow-500/20 hover:bg-yellow-500/30",
  cyan: "text-cyan-400 bg-cyan-500/20 hover:bg-cyan-500/30",
  sky: "text-sky-400 bg-sky-500/20 hover:bg-sky-500/30",
  violet: "text-violet-400 bg-violet-500/20 hover:bg-violet-500/30",
};

const ActionButton = ({
  variant,
  color,
  icon,
  activeIcon,
  active,
  count,
  text,
  onClick,
  className,
  disabled,
  type,
  href,
  animation,
  delay = 0,
}) => {
  const config = variant ? VARIANTS[variant] : null;
  const Icon = config?.icon ?? null;
  const resolvedColor = color ?? config?.color ?? "teal";
  const colorClass = COLOR_CLASSES[resolvedColor] ?? COLOR_CLASSES.teal;
  const resolvedIcon =
    active && activeIcon ? activeIcon : (icon ?? (Icon && <Icon size={15} />));
  const hasPill = count != null || !!text;
  const radius = hasPill ? 13 : 50;

  const content = (
    <>
      {!hasPill && (
        <BorderSvg
          className="absolute"
          strokeWidth={1}
          radius={radius}
          fadeAt={30}
          color={resolvedColor}
        />
      )}
      {resolvedIcon}
      {count != null && count > 0 && <span>{count}</span>}
      {text && <span>{text}</span>}
    </>
  );

  const baseClass = `rounded-full relative cursor-pointer duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 secondary ${
    hasPill ? "px-2.5 py-1.5 text-xs" : "p-2"
  } ${colorClass}`;

  return (
    <Motion className={className} animation={animation} delay={delay}>
      {href ? (
        disabled ? (
          <span className={baseClass} aria-disabled="true">
            {content}
          </span>
        ) : (
          <Link href={href} className={baseClass} onClick={onClick}>
            {content}
          </Link>
        )
      ) : (
        <button
          type={type ?? "button"}
          onClick={onClick}
          disabled={disabled}
          className={baseClass}
        >
          {content}
        </button>
      )}
    </Motion>
  );
};

export default ActionButton;
