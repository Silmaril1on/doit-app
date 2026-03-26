"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import React, { useState } from "react";
import ActionButton from "../../components/buttons/ActionButton";
import { FaHouseDamage, FaUser } from "react-icons/fa";
import { MdHeartBroken } from "react-icons/md";
import ArrowUpDown from "../../components/elements/ArrowUpDown";
import UserProfile from "../../components/UserProfile";

const FloatingNavigation = () => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <motion.div
      initial={false}
      animate={{ bottom: isOpen ? 12 : -50 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="fixed left-1/2 z-20 flex w-[95%] -translate-x-1/2 rounded-full border border-teal-500/20 bg-teal-700/20 p-2 shadow-[2px_2px_10px_rgba(0,0,0,0.3)] backdrop-blur-xl lg:hidden"
    >
      <EdgeButton
        isOpen={isOpen}
        onClick={() => setIsOpen((current) => !current)}
      />
      <div className="relative w-full center space-x-4">
        <Link href="/objectives">
          <ActionButton icon={<FaHouseDamage />} />
        </Link>
        <Link href="/active-quests">
          <ActionButton icon={<FaUser />} />
        </Link>
        <Link href="/achievements">
          <ActionButton icon={<MdHeartBroken />} />
        </Link>
      </div>
      <UserProfile />
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
      className={`absolute cursor-pointer -top-3 left-1/2 flex -translate-x-1/2 flex-col items-center justify-center`}
    >
      <span
        className={`flex h-3 w-20 items-center justify-center rounded-t-full bg-teal-500/40 text-white  duration-300 hover:bg-teal-700/80`}
      >
        <ArrowUpDown isOpen={isOpen} size={10} className="text-white" />
      </span>
    </button>
  );
};

export default FloatingNavigation;
