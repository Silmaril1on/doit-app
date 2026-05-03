"use client";

import { motion } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import GlobalModal from "@/app/[locale]/components/modals/GlobalModal";
import {
  closeModal,
  selectModal,
} from "@/app/[locale]/lib/features/modalSlice";
import { CountryFlags } from "@/app/[locale]/components/elements/CountryFlags";
import MotionCount from "@/app/[locale]/components/motion/MotionCount";

const MODAL_TYPE = "completeTask";

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.25 } },
};

const OnCompleteTaskModal = () => {
  const dispatch = useDispatch();
  const { modalType, modalProps } = useSelector(selectModal);
  const isOpen = modalType === MODAL_TYPE;

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
    dispatch(closeModal());
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
          <h2 className="text-2xl font-bold text-cream">{taskTitle}</h2>
          {(country || city) && (
            <div className="pt-1">
              <CountryFlags data={{ country, city }} title={true} size="sm" />
            </div>
          )}
        </motion.div>

        {categoryCounts.length > 0 && (
          <motion.div variants={itemVariants} className="space-y-2">
            <p className="secondary text-xs uppercase tracking-[0.14em] text-primary/80">
              Category progress
            </p>
            <div className="space-y-2">
              {categoryCounts.map((entry) => (
                <motion.div
                  key={entry.label}
                  variants={itemVariants}
                  className="flex items-center justify-between rounded-md border border-primary/15 bg-black/30 px-3 py-2"
                >
                  <span className="secondary text-xs text-chino/80">
                    {entry.label}
                  </span>
                  <div className="text-sm font-semibold text-primary">
                    + <MotionCount value={entry.count} />
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
          <div className="rounded-md border border-primary/20 bg-black/30 px-3 py-3">
            <p className="secondary text-xs uppercase tracking-[0.14em] text-primary/80">
              XP gained
            </p>
            <p className="text-2xl font-bold text-cream">
              <MotionCount value={xpGained} prefix="+" />
            </p>
          </div>
          <div className="rounded-md border border-primary/20 bg-black/30 px-3 py-3">
            <p className="secondary text-xs uppercase tracking-[0.14em] text-primary/80">
              Tokens gained
            </p>
            <p className="text-2xl font-bold text-cream">
              <MotionCount value={tokenReward} prefix="+" />
            </p>
          </div>
        </motion.div>
      </motion.div>
    </GlobalModal>
  );
};

export default OnCompleteTaskModal;
