"use client";
import { useEffect, useLayoutEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion, useMotionValue, animate } from "framer-motion";
import { setXp } from "@/app/[locale]/lib/features/xpSlice";
import { selectXp } from "@/app/[locale]/lib/features/xpSlice";
import { XP_PER_LEVEL } from "@/app/[locale]/lib/services/xp/xpConfig";
import ItemCard from "@/app/[locale]/components/container/ItemCard";
import AvatarTag from "@/app/[locale]/components/elements/AvatarTag";

const TasksPageHeader = ({ profile, initialXp }) => {
  const dispatch = useDispatch();
  const hasSynced = useRef(false);

  // Hydrate Redux with server XP only once on mount — never overwrite
  // live updates dispatched by ActiveQuests after task completion.
  useEffect(() => {
    if (hasSynced.current || !initialXp) return;
    hasSynced.current = true;
    dispatch(setXp(initialXp));
  }, [dispatch, initialXp]);

  if (!profile) return null;

  return (
    <ItemCard>
      <div className="flex flex-col gap-3">
        <AvatarTag user={profile} size="xl" />
        <LevelBar />
      </div>
    </ItemCard>
  );
};

const LevelBar = () => {
  const { level, currentXp } = useSelector(selectXp);
  const pct = Math.min((currentXp / XP_PER_LEVEL) * 100, 100);
  const width = useMotionValue("0%");
  const prev = useRef({ pct: null, level: null });

  // useLayoutEffect fires synchronously before paint — no visible 1-frame delay
  useLayoutEffect(() => {
    const p = prev.current;
    if (p.pct === null) {
      p.pct = pct;
      p.level = level;
      width.set(`${pct}%`);
      return;
    }

    const levelUp = level > p.level;
    const prevPct = p.pct;
    p.pct = pct;
    p.level = level;

    if (levelUp) {
      // Fill the bar to 100%, then instantly reset and fill to new pct
      animate(width, "100%", { duration: 0.35, ease: "easeIn" }).then(() => {
        width.set("0%");
        animate(width, `${pct}%`, {
          duration: 0.6,
          ease: [0.22, 1, 0.36, 1],
        });
      });
    } else if (prevPct !== pct) {
      animate(width, `${pct}%`, { duration: 0.5, ease: [0.22, 1, 0.36, 1] });
    }
  }, [pct, level, width]);

  return (
    <div className="flex px-1 items-center gap-2 flex-1 w-full">
      <span className="text-[10px] font-bold text-teal-400 secondary shrink-0 leading-none">
        Lv.{level}
      </span>
      <div className="relative flex-1 h-3 rounded-full bg-teal-500/10 border border-teal-500/20 overflow-hidden">
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full bg-linear-to-r from-teal-600 to-teal-400"
          style={{ width }}
        />
      </div>
      <span className="text-[9px] secondary text-cream/40 shrink-0 leading-none">
        {currentXp}/{XP_PER_LEVEL}
      </span>
    </div>
  );
};

export default TasksPageHeader;
