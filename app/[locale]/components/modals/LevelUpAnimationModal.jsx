"use client";
import { useCallback } from "react";
import { motion } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import GlobalModal from "./GlobalModal";
import {
  closeModal,
  selectModal,
} from "@/app/[locale]/lib/features/modalSlice";

// ─── DEV PREVIEW FLAG ────────────────────────────────────────────────────────
// Set to `true` to force the modal open with dummy data while styling.
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

  const prevLevel = modalProps?.prevLevel;
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
      submitLabel="Continue →"
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
            className="text-5xl"
            initial={{ scale: 0, rotate: -30 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.15, type: "spring", stiffness: 250 }}
          >
            👑
          </motion.div>

          {/* LEVEL UP text */}
          <motion.p
            className="secondary font-black tracking-[0.2em] text-2xl text-primary lvl-glow"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.4 }}
          >
            LEVEL UP!
          </motion.p>

          {/* Level progression */}
          <motion.div
            className="flex items-center gap-4"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.35, duration: 0.4 }}
          >
            <span className="secondary text-3xl font-bold text-cream/50">
              Lv.{prevLevel}
            </span>
            <motion.span
              className="text-primary text-xl"
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1.2, repeat: Infinity }}
            >
              ▶▶▶
            </motion.span>
            <span className="secondary text-3xl font-black text-primary drop-shadow-[0_0_12px_rgba(200,168,75,0.7)]">
              Lv.{newLevel}
            </span>
          </motion.div>

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
