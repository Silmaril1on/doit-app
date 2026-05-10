"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
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

const numberVariants = {
  hidden: { opacity: 0, scale: 0.7, y: 10 },
  show: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
};

const OnCompleteTaskModal = () => {
  const dispatch = useDispatch();
  const { modalType, modalProps } = useSelector(selectModal);
  const pendingLevelUp = useSelector(selectPendingLevelUp);
  const isOpen = modalType === MODAL_TYPE;

  // Track whether XP count has finished so we can start the token count.
  // We use a key derived from isOpen so that when the modal closes+reopens,
  // the MotionCount remounts fresh (no setState-in-effect needed).
  const [xpDone, setXpDone] = useState(false);
  const openKey = isOpen ? "open" : "closed";

  const displayName = modalProps?.displayName || "Player";
  const taskTitle = modalProps?.taskTitle || "your objective";
  const country = modalProps?.country || "";
  const city = modalProps?.city || "";
  const categoryCounts = Array.isArray(modalProps?.categoryCounts)
    ? modalProps.categoryCounts
    : [];
  const xpGained = Number(modalProps?.xpGained ?? 0);
  const tokenReward = Number(modalProps?.tokenReward ?? 0);

  const handleClose = () => {
    if (pendingLevelUp) {
      // Chain into level-up modal instead of fully closing
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
            You have completed your objective
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
                  <div className="text-sm font-semibold text-primary">
                    + {entry.count}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        <motion.div
          variants={itemVariants}
          className="grid gap-3 sm:grid-cols-2"
        >
          {/* XP count — always starts immediately */}
          <motion.div
            variants={numberVariants}
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
          </motion.div>

          {/* Token count — mounts only after XP finishes */}
          <motion.div
            variants={numberVariants}
            className="rounded-md border border-primary/20 bg-black/30 px-3 py-3"
          >
            <p className="secondary text-xs tracking-[0.14em] text-primary/80">
              Tokens gained
            </p>
            <div className="text-2xl text-cream">
              {xpDone && (
                <MotionCount value={tokenReward} prefix="+" sound={true} />
              )}
            </div>
          </motion.div>
        </motion.div>
      </motion.div>
    </GlobalModal>
  );
};

export default OnCompleteTaskModal;
