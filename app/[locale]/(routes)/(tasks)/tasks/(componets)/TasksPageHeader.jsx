"use client";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, usePathname } from "next/navigation";
import { motion, useMotionValue, animate } from "framer-motion";
import { setXp } from "@/app/[locale]/lib/features/xpSlice";
import { selectXp } from "@/app/[locale]/lib/features/xpSlice";
import { XP_PER_LEVEL } from "@/app/[locale]/lib/services/xp/xpConfig";
import ItemCard from "@/app/[locale]/components/container/ItemCard";
import AvatarTag from "@/app/[locale]/components/elements/AvatarTag";
import ActionButton from "@/app/[locale]/components/buttons/ActionButton";
import {
  openModal,
  selectModal,
  setPendingLevelUp,
} from "@/app/[locale]/lib/features/modalSlice";

const TasksPageHeader = ({ profile, initialXp }) => {
  const dispatch = useDispatch();
  const hasSynced = useRef(false);
  const params = useParams();
  const pathname = usePathname();
  const locale = typeof params?.locale === "string" ? params.locale : "en";
  // levelReady prevents false-positive level-up on initial hydration
  const [levelReady, setLevelReady] = useState(false);

  useEffect(() => {
    if (hasSynced.current || !initialXp) return;
    hasSynced.current = true;
    dispatch(setXp(initialXp));
    // one rAF ensures the initial level is committed to Redux before LevelBar reads it
    requestAnimationFrame(() => setLevelReady(true));
  }, [dispatch, initialXp]);

  if (!profile) return null;

  const navItems = [
    { variant: "home", text: "Objectives", segment: "/tasks/objectives" },
    {
      variant: "profile",
      text: "Active Quests",
      segment: "/tasks/active-quests",
    },
    {
      variant: "achievements",
      text: "Achievements",
      segment: "/tasks/achievements",
    },
  ];

  return (
    <div className=" space-y-3">
      <ItemCard>
        <div className="flex flex-col gap-3">
          <AvatarTag user={profile} size="xl" />
          <LevelBar levelReady={levelReady} />
        </div>
      </ItemCard>
      <div className="grid grid-cols-3 gap-3">
        {navItems.map(({ variant, text, segment }) => {
          const isActive = pathname.includes(segment);
          return (
            <ActionButton
              key={segment}
              variant={variant}
              text={text}
              href={`/${locale}${segment}`}
              className={isActive ? "" : "opacity-60"}
            />
          );
        })}
      </div>
    </div>
  );
};

const LevelBar = ({ levelReady }) => {
  const dispatch = useDispatch();
  const { level, currentXp } = useSelector(selectXp);
  const { modalType } = useSelector(selectModal);
  const pct = Math.min((currentXp / XP_PER_LEVEL) * 100, 100);
  const width = useMotionValue("0%");
  const prev = useRef({ pct: null, level: null });

  useLayoutEffect(() => {
    const p = prev.current;
    if (p.pct === null) {
      p.pct = pct;
      p.level = level;
      width.set(`${pct}%`);
      return;
    }

    const levelUp = level > p.level;
    const prevLevelSnap = p.level;
    const prevPct = p.pct;
    p.pct = pct;
    p.level = level;

    if (levelUp) {
      if (levelReady) {
        const levelUpPayload = { prevLevel: prevLevelSnap, newLevel: level };
        // If the complete-task modal is currently open, queue the level-up
        // so it fires only after the player closes that modal.
        if (modalType === "completeTask") {
          dispatch(setPendingLevelUp(levelUpPayload));
        } else {
          dispatch(
            openModal({ modalType: "levelUp", modalProps: levelUpPayload }),
          );
        }
      }
      // Animate bar: fill to 100% → reset → fill new pct
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
  }, [pct, level, width, levelReady, dispatch, modalType]);

  return (
    <>
      <div className="flex px-1 items-center gap-2 flex-1 w-full">
        <span className="text-[10px] font-bold text-primary secondary shrink-0 leading-none">
          Lv.{level}
        </span>
        <div className="relative flex-1 h-3 rounded-full bg-primary/10 border border-primary/20 overflow-hidden">
          <motion.div
            className="absolute inset-y-0 left-0 rounded-full bg-linear-to-r from-primary to-primary/60"
            style={{ width }}
          />
        </div>
        <span className="text-[9px] secondary text-cream/40 shrink-0 leading-none">
          {currentXp}/{XP_PER_LEVEL}
        </span>
      </div>
    </>
  );
};

export default TasksPageHeader;
