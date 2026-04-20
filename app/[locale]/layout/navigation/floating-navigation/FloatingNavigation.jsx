"use client";
import { useState } from "react";
import { useParams } from "next/navigation";
import ActionButton from "../../../components/buttons/ActionButton";
import ArrowUpDown from "../../../components/elements/ArrowUpDown";
import UserProfile from "./UserProfile";
import NotificationsBadge from "./NotificationsBadge";
import { motion, AnimatePresence } from "framer-motion";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "../../../lib/features/userSlice";

const FloatingNavigation = () => {
  const [isOpen, setIsOpen] = useState(true);
  const user = useSelector(selectCurrentUser);
  const [open, setOpen] = useState(false);
  const params = useParams();
  const locale = typeof params?.locale === "string" ? params.locale : "en";

  if (!user) {
    return null;
  }

  const handleOpen = () => {
    setOpen((current) => !current);
  };

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
      <div className="flex gap-2 items-center">
        <ActionButton onClick={handleOpen} variant="home" text="Listory" />
        <AnimatePresence>
          {open && (
            <div key="listory" className="absolute -top-25 flex flex-col gap-1">
              <ActionButton
                variant="home"
                href={`/${locale}/tasks/objectives`}
                animation="bottom"
                delay={0}
              />
              <ActionButton
                variant="profile"
                href={`/${locale}/tasks/active-quests`}
                animation="bottom"
                delay={0.08}
              />
              <ActionButton
                variant="achievements"
                href={`/${locale}/tasks/achievements`}
                animation="bottom"
                delay={0.16}
              />
            </div>
          )}
        </AnimatePresence>
        <ActionButton variant="home" text="Feed" href={`/${locale}/feed`} />
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
      className={`absolute cursor-pointer -top-3 right-10 flex-col items-center justify-center`}
    >
      <span
        className={`flex h-3 w-20 items-center justify-center rounded-t-full bg-teal-700/20 text-white  duration-300 hover:bg-teal-700/80`}
      >
        <ArrowUpDown isOpen={isOpen} size={10} className="text-white" />
      </span>
    </button>
  );
};

export default FloatingNavigation;
