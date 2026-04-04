"use client";
import { useRef, useState } from "react";
import { motion } from "framer-motion";

// Visual config per depth (0 = active, 1 = next, 2 = next+1) — right-stacked
const STACK = [
  { x: 0, y: 0, scale: 1, rotate: 0, blur: 0, opacity: 1, z: 30 },
  { x: 38, y: 10, scale: 0.96, rotate: 4, blur: 1, opacity: 0.85, z: 20 },
  { x: 68, y: 20, scale: 0.9, rotate: 8, blur: 3, opacity: 0.5, z: 10 },
];

const SPRING = { type: "spring", stiffness: 320, damping: 32 };

const DRAG_THRESHOLD = 50;

const GalleryCard = ({ item, depth, label }) => {
  const s = STACK[depth];
  if (!s) return null;
  return (
    <motion.div
      className="absolute left-0 w-full rounded-[26px] border border-white/10 bg-black overflow-hidden"
      animate={{
        x: s.x,
        y: s.y,
        scale: s.scale,
        rotate: s.rotate,
        filter: `blur(${s.blur}px)`,
        opacity: s.opacity,
      }}
      transition={SPRING}
      style={{ zIndex: s.z }}
    >
      <img
        src={item.image_url}
        alt={label}
        className="w-full h-auto object-contain"
        draggable={false}
      />
      {depth === 0 && (
        <div className="bg-linear-to-t from-black/70 to-transparent px-4 py-3">
          <p className="secondary text-sm text-cream/90 capitalize">{label}</p>
        </div>
      )}
    </motion.div>
  );
};

const ViewGalleryModal = ({ gallery = [], subtasks = [] }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const dragStartX = useRef(null);

  const labelMap = Object.fromEntries(
    subtasks.map((st) => [
      st.id,
      typeof st === "object" ? st.label : String(st ?? ""),
    ]),
  );

  const getLabel = (item) =>
    subtasks.length === 0
      ? `Photo #${item.subtask_id}`
      : (labelMap[item.subtask_id] ?? `Subtask #${item.subtask_id}`);

  const total = gallery.length;

  const navigate = (dir) => setActiveIndex((p) => (p + dir + total) % total);

  const handlePointerDown = (e) => {
    dragStartX.current = e.clientX;
    e.currentTarget.setPointerCapture?.(e.pointerId);
  };

  const handlePointerUp = (e) => {
    if (dragStartX.current === null) return;
    const delta = e.clientX - dragStartX.current;
    dragStartX.current = null;
    if (Math.abs(delta) > DRAG_THRESHOLD) {
      // drag left → next card (goes behind stack); drag right → previous
      navigate(delta < 0 ? 1 : -1);
    }
  };

  if (!gallery.length) return null;

  return (
    <div className="flex flex-col items-center select-none">
      <p className="secondary text-xs text-chino/60">
        {activeIndex + 1} / {gallery.length}
      </p>

      {/* Card deck — depth 2 rendered first (behind), depth 0 last (on top) */}
      <div
        className="relative w-full max-w-xs cursor-grab active:cursor-grabbing mt-4"
        style={{ minHeight: 260 }}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
      >
        {[...STACK].reverse().map((_, i) => {
          const depth = STACK.length - 1 - i;
          const item = gallery[(activeIndex + depth) % total];
          return (
            <GalleryCard
              key={`${depth}-${item.image_url}`}
              item={item}
              depth={depth}
              label={getLabel(item)}
            />
          );
        })}
      </div>

      {/* Dot navigation */}
      {gallery.length > 1 && (
        <div className="flex items-center justify-center gap-2 mt-10">
          {gallery.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setActiveIndex(i)}
              className={`rounded-full duration-200 cursor-pointer ${
                i === activeIndex
                  ? "w-5 h-2 bg-teal-400"
                  : "w-2 h-2 bg-teal-500/30 hover:bg-teal-500/60"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ViewGalleryModal;
