"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import React, { useState } from "react";
import ActionButton from "../../../components/buttons/ActionButton";
import LevelProgressBar from "../../../components/elements/LevelProgressBar";
import ArrowUpDown from "../../../components/elements/ArrowUpDown";
import UserProfile from "./UserProfile";
import NotificationsBadge from "./NotificationsBadge";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "../../../lib/features/userSlice";
import BorderSvg from "@/app/[locale]/components/elements/BorderSvg";
import { selectXp } from "@/app/[locale]/lib/features/xpSlice";
import { XP_PER_LEVEL } from "@/app/[locale]/lib/services/xp/xpConfig";

const FloatingNavigation = () => {
  const [isOpen, setIsOpen] = useState(true);
  const user = useSelector(selectCurrentUser);

  if (!user) {
    return null;
  }

  return (
    <motion.div
      initial={false}
      animate={{ bottom: isOpen ? 10 : -50 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="fixed left-1/2 z-20 flex justify-between w-[95%] -translate-x-1/2 rounded-full border border-teal-500/20 bg-teal-700/20 p-2 shadow-[2px_2px_10px_rgba(0,0,0,1)] lg:hidden"
    >
      {/* Blur lives on its own layer so child popups can use their own backdrop-blur freely */}
      <div className="absolute inset-0 -z-10 rounded-full backdrop-blur-xl pointer-events-none" />
      <EdgeButton
        isOpen={isOpen}
        onClick={() => setIsOpen((current) => !current)}
      />
      {/* <LevelBar /> */}
      <div className="flex gap-2 items-center ">
        <Link href="/tasks/objectives">
          <ActionButton variant="home" />
        </Link>
        <Link href="/tasks/active-quests">
          <ActionButton variant="profile" />
        </Link>
        <Link href="/tasks/achievements">
          <ActionButton variant="achievements" />
        </Link>
      </div>
      <div className="flex items-center gap-2 ">
        <NotificationsBadge />
        <UserProfile />
      </div>
    </motion.div>
  );
};

const EdgeButton = ({ isOpen, onClick }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={
        isOpen ? "Collapse floating navigation" : "Expand floating navigation"
      }
      aria-expanded={isOpen}
      className={`absolute cursor-pointer -top-3 left-10 flex-col items-center justify-center`}
    >
      <span
        className={`flex h-3 w-20 items-center justify-center rounded-t-full bg-teal-700/20 text-white  duration-300 hover:bg-teal-700/80`}
      >
        <ArrowUpDown isOpen={isOpen} size={10} className="text-white" />
      </span>
    </button>
  );
};

const LevelBar = () => {
  const { level, currentXp } = useSelector(selectXp);
  const pct = Math.min((currentXp / XP_PER_LEVEL) * 100, 100);

  return (
    <div className="flex items-center gap-2 flex-1 min-w-0 absolute w-[65%] right-3 -top-4">
      <span className="text-[10px] font-bold text-teal-400 secondary shrink-0 leading-none">
        Lv.{level}
      </span>
      <div className="relative flex-1 h-3 rounded-full bg-teal-500/10 border border-teal-500/20 overflow-hidden">
        <motion.div
          key={level}
          className="absolute inset-y-0 left-0 rounded-full bg-linear-to-r from-teal-600 to-teal-400"
          initial={{ width: "0%" }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
      <span className="text-[9px] secondary text-cream/40 shrink-0 leading-none">
        {currentXp}/{XP_PER_LEVEL}
      </span>
    </div>
  );
};

export default FloatingNavigation;
