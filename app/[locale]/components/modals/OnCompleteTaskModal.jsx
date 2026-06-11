"use client";

import { useEffect, useRef, useState, startTransition } from "react";
import { motion } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import Image from "next/image";
import GlobalModal from "@/app/[locale]/components/modals/GlobalModal";
import {
  openModal,
  closeModal,
  selectModal,
  selectPendingLevelUp,
  clearPendingLevelUp,
} from "@/app/[locale]/lib/features/modalSlice";
import { CountryFlags } from "@/app/[locale]/components/elements/CountryFlags";
import MotionCount from "@/app/[locale]/components/motion/MotionCount";
import { playSound } from "@/app/[locale]/lib/utils/playsound";
import Motion from "../motion/Motion";

// ─── DEV PREVIEW FLAG ────────────────────────────────────────────────────────
// Set to `true` to force the modal open with dummy data while styling.
const DEV_PREVIEW = false;
const DEV_DUMMY = {
  displayName: "Alex",
  taskTitle: "Conquer the Ancient Ruins",
  country: "Japan",
  city: "Kyoto",
  categoryCounts: [
    { label: "Food", count: 3 },
    { label: "Travel", count: 1 },
  ],
  xpGained: 120,
  tokenReward: 45,
  acquiredBadge: {
    title: "Adventurer",
    level: 3,
    icon: null, // swap with a real URL to test the image path
  },
};
// ─────────────────────────────────────────────────────────────────────────────

const MODAL_TYPE = "completeTask";

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.05 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24, scale: 0.97 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
  },
};

const badgeVariants = {
  hidden: { opacity: 0, scale: 0.6, y: 20 },
  show: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1], delay: 0.1 },
  },
};

const OnCompleteTaskModal = () => {
  const dispatch = useDispatch();
  const { modalType, modalProps: reduxProps } = useSelector(selectModal);
  const pendingLevelUp = useSelector(selectPendingLevelUp);

  const isOpen = DEV_PREVIEW || modalType === MODAL_TYPE;
  const modalProps = DEV_PREVIEW ? DEV_DUMMY : reduxProps;

  // openKey resets MotionCount when modal re-opens (GlobalModal unmounts children on close,
  // so useState resets automatically — no cleanup effect needed)
  const openKey = isOpen ? "open" : "closed";
  const [xpDone, setXpDone] = useState(false);
  const [tokenDone, setTokenDone] = useState(false);
  // useRef instead of useState so the effect below only triggers a side-effect
  // without calling setState (avoids React Compiler cascading-render warning)
  const badgeSoundFired = useRef(false);

  // Reset counters when the modal closes so the next open starts fresh
  useEffect(() => {
    if (!isOpen) {
      startTransition(() => {
        setXpDone(false);
        setTokenDone(false);
      });
      badgeSoundFired.current = false;
    }
  }, [isOpen]);

  const displayName = modalProps?.displayName || "Player";
  const taskTitle = modalProps?.taskTitle || "your objective";
  const country = modalProps?.country || "";
  const city = modalProps?.city || "";
  const categoryCounts = Array.isArray(modalProps?.categoryCounts)
    ? modalProps.categoryCounts
    : [];
  const xpGained = Number(modalProps?.xpGained ?? 0);
  const tokenReward = Number(modalProps?.tokenReward ?? 0);
  const acquiredBadge = modalProps?.acquiredBadge ?? null;
  const badgeIcon =
    acquiredBadge?.icon ??
    acquiredBadge?.badge_image ??
    acquiredBadge?.image_url ??
    null;
  const badgeReady = tokenDone || tokenReward <= 0;
  const showBadge = Boolean(acquiredBadge) && badgeReady;

  // Play badge sound once when token count finishes — only mutates a ref, no setState → RC compliant
  useEffect(() => {
    if (!badgeReady || !acquiredBadge || badgeSoundFired.current) return;
    badgeSoundFired.current = true;
    playSound("badge");
  }, [badgeReady, acquiredBadge]);

  const handleClose = () => {
    if (DEV_PREVIEW) return; // prevent closing in dev preview mode
    if (pendingLevelUp) {
      dispatch(clearPendingLevelUp());
      dispatch(
        openModal({
          modalType: "levelUp",
          modalProps: pendingLevelUp,
        }),
      );
    } else {
      dispatch(closeModal());
    }
  };

  return (
    <GlobalModal
      isOpen={isOpen}
      onClose={handleClose}
      title={`CONGRATULATIONS ${displayName}`}
      maxWidth="max-w-2xl"
      footerMode="close"
      submitLabel="Close"
    >
      <motion.div
        className="mt-4 space-y-4"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        <motion.div variants={itemVariants} className="space-y-2">
          <p className="secondary text-sm text-chino/70">
            You have completed your quest
          </p>
          <h2 className="text-2xl text-shadow text-cream">{taskTitle}</h2>
          {(country || city) && (
            <div className="pt-1">
              <CountryFlags data={{ country, city }} title={true} size="sm" />
            </div>
          )}
        </motion.div>

        {categoryCounts.length > 0 && (
          <motion.div variants={itemVariants} className="space-y-2">
            <p className="secondary text-xs uppercase tracking-[0.14em] text-primary/80">
              Category progress Completion
            </p>
            <div className="space-y-2">
              {categoryCounts.map((entry) => (
                <motion.div
                  key={entry.label}
                  variants={itemVariants}
                  className="flex items-center justify-between rounded-md border border-primary/15 bg-black/30 px-3 py-2"
                >
                  <span className=" text-xs text-chino/80 tracking-[0.5px]">
                    {entry.label}
                  </span>
                  <div className="text-sm  text-primary">+ {entry.count}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        <div className="grid grid-cols-2 gap-3">
          {/* XP count — always mounts first */}
          <Motion
            animation="bottom"
            delay={0.5}
            className="rounded-md border border-primary/20 bg-black/30 px-3 py-3"
          >
            <p className="secondary text-xs tracking-[0.14em] text-primary/80">
              XP gained
            </p>
            <div className="text-2xl text-cream">
              <MotionCount
                key={openKey}
                value={xpGained}
                prefix="+"
                sound={true}
                onComplete={() => setXpDone(true)}
              />
            </div>
          </Motion>

          {/* Token count — mounts after XP count finishes */}
          {xpDone && (
            <Motion
              animation="bottom"
              delay={0}
              className="rounded-md border border-primary/20 bg-black/30 px-3 py-3"
            >
              <p className="secondary text-xs tracking-[0.14em] text-primary/80">
                Tokens gained
              </p>
              <div className="text-2xl text-cream">
                <MotionCount
                  key={openKey}
                  value={tokenReward}
                  prefix="+"
                  sound={true}
                  onComplete={() => setTokenDone(true)}
                />
              </div>
            </Motion>
          )}
        </div>

        {/* Badge acquisition — height reserved upfront to prevent layout shift */}
        {acquiredBadge && (
          <div className="min-h-32.5">
            {showBadge && (
              <Motion
                animation="bottom"
                delay={0}
                className="rounded-md border border-primary/20 bg-black/30 px-4 py-4 space-y-3"
              >
                <p className="secondary text-xs uppercase tracking-[0.14em] text-primary/80">
                  New Badge Unlocked!
                </p>
                <div className="flex items-center gap-4">
                  {/* Badge icon */}
                  <motion.div
                    initial={{ scale: 0, rotate: -20 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{
                      delay: 0.2,
                      type: "spring",
                      stiffness: 280,
                      damping: 18,
                    }}
                    className="shrink-0 h-16 w-16 rounded-xl border-2 border-primary/60 bg-black/40 overflow-hidden flex items-center justify-center shadow-lg shadow-primary/20"
                  >
                    {badgeIcon ? (
                      <Image
                        src={badgeIcon}
                        alt={acquiredBadge.title ?? "Badge"}
                        width={64}
                        height={64}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="text-2xl font-black text-primary">
                        {acquiredBadge.level ?? "?"}
                      </span>
                    )}
                  </motion.div>

                  {/* Badge info */}
                  <div className="flex flex-col gap-1">
                    <p className="text-lg text-cream text-shadow">
                      {acquiredBadge.title ?? "Badge"}
                    </p>
                    <p className="secondary text-xs text-primary/70">
                      Level {acquiredBadge.level} badge acquired
                    </p>
                  </div>
                </div>
              </Motion>
            )}
          </div>
        )}
      </motion.div>
    </GlobalModal>
  );
};

export default OnCompleteTaskModal;
