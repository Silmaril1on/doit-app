"use client";
import { useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { GiGreatPyramid } from "react-icons/gi";
import {
  selectColorValue,
  setColorValue,
} from "@/app/[locale]/lib/features/configSlice";
import { setToast } from "@/app/[locale]/lib/features/toastSlice";
import SectionHeadline from "@/app/[locale]/components/elements/SectionHeadline";
import { useSound } from "@/app/[locale]/lib/hooks/useSounds";
import Button from "@/app/[locale]/components/buttons/Button";
import ItemCard from "@/app/[locale]/components/container/ItemCard";
import { AnimatePresence, motion } from "framer-motion";

const COLOR_OPTIONS = [
  { value: "teal", label: "Teal", hex: "#2dd4bf" },
  { value: "gold", label: "Gold", hex: "#fcb913" },
  { value: "blue", label: "Blue", hex: "#0957c3" },
  { value: "crimson", label: "Crimson", hex: "#d91a17" },
  { value: "grey", label: "Grey", hex: "#7a8fa0" },
  { value: "violet", label: "Violet", hex: "#9b59ff" },
  { value: "coffee", label: "Coffee", hex: "#d6a461" },
];

/* ── Main Colors component ────────────────────────────────── */
const Colors = () => {
  const dispatch = useDispatch();
  const currentColor = useSelector(selectColorValue) ?? "teal";
  const [saving, setSaving] = useState(false);
  const { playSound } = useSound();
  const barRef = useRef(null);
  const isDragging = useRef(false);

  const activeIndex = Math.max(
    0,
    COLOR_OPTIONS.findIndex((o) => o.value === currentColor),
  );

  const selectByIndex = (idx) => {
    const clamped = Math.max(0, Math.min(idx, COLOR_OPTIONS.length - 1));
    dispatch(setColorValue(COLOR_OPTIONS[clamped].value));
  };

  const indexFromPointer = (e) => {
    if (!barRef.current) return activeIndex;
    const rect = barRef.current.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    return Math.min(
      Math.floor(pct * COLOR_OPTIONS.length),
      COLOR_OPTIONS.length - 1,
    );
  };

  const handlePointerDown = (e) => {
    isDragging.current = true;
    barRef.current?.setPointerCapture(e.pointerId);
    selectByIndex(indexFromPointer(e));
  };

  const handlePointerMove = (e) => {
    if (!isDragging.current) return;
    selectByIndex(indexFromPointer(e));
  };

  const handlePointerUp = () => {
    isDragging.current = false;
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/user/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ color_value: currentColor }),
      });
      if (!res.ok) throw new Error("Failed to save");
      dispatch(setToast({ type: "success", msg: "Design saved!" }));
    } catch {
      dispatch(setToast({ type: "error", msg: "Failed to save design." }));
    } finally {
      setSaving(false);
    }
  };

  const thumbLeft = `${((activeIndex + 0.5) / COLOR_OPTIONS.length) * 100}%`;

  return (
    <div className="space-y-6 flex grow flex-col w-full pb-5">
      <SectionHeadline
        title="Color Theme"
        subtitle="Choose your personal accent color."
      />

      {/* ── Slider ── */}
      <div className="space-y-2 flex flex-col grow">
        <ItemCard className="h-135 ">
          <AnimatePresence mode="wait">
            <motion.div
              className="center flex-col h-full"
              key={currentColor} // remount on every color change
              initial={{ scale: 0.7, rotate: -8, y: -30, opacity: 0 }}
              animate={{
                scale: [0.7, 1.15, 0.95, 1.05, 1],
                rotate: [-8, 6, -4, 2, 0],
                y: [-30, -12, 4, -4, 0],
                opacity: [0, 1, 1, 1, 1],
              }}
              transition={{
                duration: 0.55,
                times: [0, 0.3, 0.55, 0.75, 1],
                ease: "easeOut",
              }}
            >
              <GiGreatPyramid className="text-[200px] text-primary" />
              <h1 className="text-primary text-3xl">Welcome to gyza</h1>
            </motion.div>
          </AnimatePresence>
        </ItemCard>
        <div className="flex items-center gap-2">
          {/* Left arrow */}
          <button
            type="button"
            onClick={() => {
              selectByIndex(activeIndex - 1);
              playSound("color");
            }}
            disabled={activeIndex === 0}
            className="w-8 h-10 flex items-center justify-center text-2xl primary text-cream/70 hover:text-cream disabled:opacity-25 disabled:cursor-not-allowed transition-colors duration-150 shrink-0"
          >
            ‹
          </button>

          {/* Bar */}
          <div
            onClick={() => playSound("color")}
            ref={barRef}
            className="relative flex-1 h-3 rounded-sm cursor-pointer select-none overflow-visible"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
          >
            {/* Segments */}
            <div className="flex h-full rounded-sm overflow-hidden">
              {COLOR_OPTIONS.map((opt) => (
                <div
                  key={opt.value}
                  className="flex-1 transition-opacity duration-200"
                  style={{
                    backgroundColor: opt.hex,
                    opacity: opt.value === currentColor ? 1 : 0.5,
                  }}
                />
              ))}
            </div>

            {/* Thumb */}
            <div
              className="absolute top-1/2 -translate-y-1/2 pointer-events-none transition-[left] duration-150 ease-out"
              style={{ left: thumbLeft }}
            >
              {/* glow halo */}
              <div className="absolute top-1/2 left-0 -translate-x-1/2 -translate-y-1/2 w-5 h-14 bg-white/20 rounded-full blur-md" />
              {/* thumb bar */}
              <div className="relative w-1 h-14 -translate-x-1/2 bg-cream rounded-full shadow-[0_0_10px_3px_rgba(255,255,255,0.6)]" />
            </div>
          </div>

          {/* Right arrow */}
          <button
            type="button"
            onClick={() => {
              selectByIndex(activeIndex + 1);
              playSound("color");
            }}
            disabled={activeIndex === COLOR_OPTIONS.length - 1}
            className="w-8 h-10 flex items-center justify-center text-2xl primary text-cream/70 hover:text-cream disabled:opacity-25 disabled:cursor-not-allowed transition-colors duration-150 shrink-0"
          >
            ›
          </button>
        </div>

        {/* Active label */}
        <p className="text-center primary text-base uppercase tracking-widest text-cream/80">
          {COLOR_OPTIONS[activeIndex].label}
        </p>
      </div>

      {/* ── Save button ── */}
      <div className="flex justify-center pt-2 flex-col items-center space-y-3">
        <Button
          text={saving ? "Saving…" : "Save Design"}
          type="button"
          variant="outline"
          onClick={handleSave}
          disabled={saving}
        />
        <ItemCard className="text-chino secondary">
          <b>NOTE:</b> You can change theme color anytime you want coming back
          here
        </ItemCard>
      </div>
    </div>
  );
};

export default Colors;
