"use client";
import { motion } from "framer-motion";
import { useSelector } from "react-redux";
import { selectXp } from "@/app/[locale]/lib/features/xpSlice";
import { XP_PER_LEVEL } from "@/app/[locale]/lib/services/xp/xpConfig";

const LevelProgressBar = () => {
  const { level, currentXp } = useSelector(selectXp);
  const pct = Math.min((currentXp / XP_PER_LEVEL) * 100, 100);

  return (
    <div className="flex items-center gap-2 flex-1 min-w-0 absolute w-full -top-3">
      <span
        className={`text-[10px] font-bold text-primary secondary shrink-0 leading-none`}
      >
        Lv.{level}
      </span>
      <div
        className={`relative flex-1 h-3 rounded-full border overflow-hidden bg-primary/10 border-primary/20`}
      >
        <motion.div
          key={level}
          className={`absolute inset-y-0 left-0 rounded-full bg-linear-to-r from-primary/60 to-primary`}
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

export default LevelProgressBar;
