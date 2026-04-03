"use client";
import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MdClose, MdChevronLeft, MdChevronRight } from "react-icons/md";

const SLIDE_VARIANTS = {
  enter: (dir) => ({ opacity: 0, x: dir * 50 }),
  center: { opacity: 1, x: 0 },
  exit: (dir) => ({ opacity: 0, x: dir * -50 }),
};

const ViewGalleryModal = ({ gallery = [], subtasks = [], onClose }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const overlayRef = useRef(null);

  // Build id→label map from subtasks
  const labelMap = Object.fromEntries(
    subtasks.map((st) => [
      st.id,
      typeof st === "object" ? st.label : String(st ?? ""),
    ]),
  );

  const getLabel = (item) => {
    if (subtasks.length === 0) return `Photo #${item.subtask_id}`;
    return labelMap[item.subtask_id] ?? `Subtask #${item.subtask_id}`;
  };

  const navigate = (dir) => {
    const next = activeIndex + dir;
    if (next < 0 || next >= gallery.length) return;
    setDirection(dir);
    setActiveIndex(next);
  };

  const goTo = (index) => {
    setDirection(index > activeIndex ? 1 : -1);
    setActiveIndex(index);
  };

  const current = gallery[activeIndex];
  if (!current) return null;

  return (
    <motion.div
      ref={overlayRef}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4"
      onPointerDown={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.97 }}
        transition={{ duration: 0.2 }}
        className="w-full max-w-lg"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-3 px-1">
          <p className="secondary text-xs text-chino/60">
            {activeIndex + 1} / {gallery.length}
          </p>
          <button
            type="button"
            onClick={onClose}
            className="text-chino/60 hover:text-cream duration-200 cursor-pointer"
          >
            <MdClose size={20} />
          </button>
        </div>

        {/* Image slider */}
        <div className="relative rounded-2xl overflow-hidden bg-black border border-teal-500/15 aspect-4/3">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.img
              key={current.image_url}
              src={current.image_url}
              alt={getLabel(current)}
              custom={direction}
              variants={SLIDE_VARIANTS}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="absolute inset-0 w-full h-full object-cover"
            />
          </AnimatePresence>

          {/* Prev */}
          {activeIndex > 0 && (
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white rounded-full p-1 duration-200 cursor-pointer"
            >
              <MdChevronLeft size={26} />
            </button>
          )}

          {/* Next */}
          {activeIndex < gallery.length - 1 && (
            <button
              type="button"
              onClick={() => navigate(1)}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white rounded-full p-1 duration-200 cursor-pointer"
            >
              <MdChevronRight size={26} />
            </button>
          )}
        </div>

        {/* Subtask label */}
        <div className="mt-3 text-center px-1">
          <p className="secondary text-sm text-cream/80 capitalize leading-tight">
            {getLabel(current)}
          </p>
        </div>

        {/* Dot navigation */}
        {gallery.length > 1 && (
          <div className="flex items-center justify-center gap-2 mt-3">
            {gallery.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => goTo(i)}
                className={`rounded-full duration-200 cursor-pointer ${
                  i === activeIndex
                    ? "w-5 h-2 bg-teal-400"
                    : "w-2 h-2 bg-teal-500/30 hover:bg-teal-500/60"
                }`}
              />
            ))}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default ViewGalleryModal;
