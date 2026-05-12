"use client";
import { useCallback } from "react";
import { motion } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import GlobalModal from "./GlobalModal";
import {
  closeModal,
  selectModal,
} from "@/app/[locale]/lib/features/modalSlice";
import BorderSvg from "../elements/BorderSvg";

const DEV_PREVIEW = false;
const DEV_DUMMY = { prevLevel: 4, newLevel: 5 };
// ─────────────────────────────────────────────────────────────────────────────

// Particle dot — positioned randomly around the burst origin
const Particle = ({ angle, dist, color }) => {
  const x = Math.cos(angle) * dist;
  const y = Math.sin(angle) * dist;
  return (
    <motion.div
      className="absolute w-2 h-2 rounded-full"
      style={{
        backgroundColor: color,
        top: "50%",
        left: "50%",
        marginTop: -4,
        marginLeft: -4,
      }}
      initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
      animate={{ x, y, opacity: 0, scale: 0 }}
      transition={{ duration: 0.9, ease: "easeOut" }}
    />
  );
};

const PARTICLE_COLORS = [
  "#fcb913",
  "#f59e0b",
  "#fde047",
  "#fff",
  "#22c55e",
  "#60a5fa",
];
const PARTICLES = Array.from({ length: 20 }, (_, i) => ({
  angle: (i / 20) * Math.PI * 2,
  dist: 60 + Math.random() * 60,
  color: PARTICLE_COLORS[i % PARTICLE_COLORS.length],
}));

const KEYFRAMES = `
  @keyframes lvl-glow {
    0%,100% { text-shadow: 0 0 8px #fcb91380; }
    50% { text-shadow: 0 0 28px #fcb913cc, 0 0 56px #fcb91355; }
  }
  .lvl-glow { animation: lvl-glow 1.8s ease-in-out infinite }
`;

const LevelUpAnimationModal = () => {
  const dispatch = useDispatch();
  const { modalType, modalProps: reduxProps } = useSelector(selectModal);
  const isOpen = DEV_PREVIEW || modalType === "levelUp";
  const modalProps = DEV_PREVIEW ? DEV_DUMMY : reduxProps;
  const newLevel = modalProps?.newLevel;

  const handleDone = useCallback(() => {
    if (DEV_PREVIEW) return;
    dispatch(closeModal());
  }, [dispatch]);

  return (
    <GlobalModal
      isOpen={isOpen}
      onClose={handleDone}
      title="LEVEL UP!"
      maxWidth="max-w-sm"
      footerMode="close"
      submitLabel="close"
    >
      <>
        <style>{KEYFRAMES}</style>

        {/* Particle burst — positioned relative to the card */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
          {PARTICLES.map((p, i) => (
            <Particle key={i} {...p} />
          ))}
        </div>

        <div className="relative z-10 flex flex-col items-center gap-5 py-4">
          {/* Crown */}
          <motion.div
            className="text-5xl relative w-28 h-28 p-2 shadow-2xl rounded-lg center"
            initial={{ scale: 0, rotate: -30 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.15, type: "spring", stiffness: 250 }}
          >
            <div className="bg-black/30 text-primary rounded-md w-full h-full center">
              <span>{newLevel}</span>
            </div>
            <BorderSvg />
          </motion.div>

          {/* LEVEL UP text */}
          <motion.p
            className=" tracking-WIDEST text-2xl text-cream lvl-glow"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.4 }}
          >
            CONGRADULATIONS !
          </motion.p>
          <motion.p
            className="text-md secondary text-center text-cream/80"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.4 }}
          >
            You have reached level {newLevel}. Keep up the great work and
            continue leveling up your productivity!
          </motion.p>

          {/* Cosmetic XP drain bar */}
          <motion.div className="w-full h-2 rounded-full bg-primary/10 border border-primary/20 overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-linear-to-r from-primary to-primary/60"
              initial={{ width: "100%" }}
              animate={{ width: "0%" }}
              transition={{ delay: 0.5, duration: 0.7, ease: "easeOut" }}
            />
          </motion.div>
        </div>
      </>
    </GlobalModal>
  );
};

export default LevelUpAnimationModal;
