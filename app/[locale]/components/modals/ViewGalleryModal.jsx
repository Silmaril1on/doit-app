"use client";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import GlobalModal from "@/app/[locale]/components/modals/GlobalModal";
import {
  closeModal,
  selectModal,
} from "@/app/[locale]/lib/features/modalSlice";

// Visual config per depth (0 = active, 1 = next, 2 = next+1) — right-stacked
const STACK = [
  { x: 0, y: 0, scale: 1, rotate: 0, blur: 0, opacity: 1, z: 30 },
  { x: 38, y: 10, scale: 0.96, rotate: 4, blur: 1, opacity: 0.85, z: 20 },
  { x: 68, y: 20, scale: 0.9, rotate: 8, blur: 3, opacity: 0.5, z: 10 },
];

const SPRING = { type: "spring", stiffness: 320, damping: 32 };

const DRAG_THRESHOLD = 50;
const MODAL_TYPE = "viewGallery";

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

const ViewGalleryModal = () => {
  const dispatch = useDispatch();
  const { modalType, modalProps } = useSelector(selectModal);
  const isOpen = modalType === MODAL_TYPE;
  const gallery = Array.isArray(modalProps?.gallery)
    ? modalProps.gallery.filter((item) => item && typeof item === "object")
    : [];
  const subtasks = Array.isArray(modalProps?.subtasks)
    ? modalProps.subtasks
    : [];
  const [activeIndex, setActiveIndex] = useState(0);
  const dragStartX = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setActiveIndex(0);
    }
  }, [isOpen, modalProps?.gallery]);

  const handleClose = () => {
    dispatch(closeModal());
    setActiveIndex(0);
  };

  const labelMap = Object.fromEntries(
    subtasks.map((st) => [
      st.id,
      typeof st === "object" ? st.label : String(st ?? ""),
    ]),
  );

  const getLabel = (item) => {
    const subtaskId = item?.subtask_id;
    if (subtaskId == null) {
      return "Photo";
    }

    return subtasks.length === 0
      ? `Photo #${subtaskId}`
      : (labelMap[subtaskId] ?? `Subtask #${subtaskId}`);
  };

  const total = gallery.length;

  const navigate = (dir) =>
    setActiveIndex((p) => (total > 0 ? (p + dir + total) % total : 0));

  const handlePointerDown = (e) => {
    dragStartX.current = e.clientX;
    e.currentTarget.setPointerCapture?.(e.pointerId);
  };

  const handlePointerUp = (e) => {
    if (dragStartX.current === null) return;
    if (total === 0) {
      dragStartX.current = null;
      return;
    }
    const delta = e.clientX - dragStartX.current;
    dragStartX.current = null;
    if (Math.abs(delta) > DRAG_THRESHOLD) {
      // drag left → next card (goes behind stack); drag right → previous
      navigate(delta < 0 ? 1 : -1);
    }
  };

  return (
    <GlobalModal
      isOpen={isOpen}
      onClose={handleClose}
      title="Gallery"
      maxWidth="max-w-2xl"
      footerMode="none"
      scrollContent={false}
    >
      <div className="flex flex-col items-center select-none">
        <p className="secondary text-xs text-chino/60">
          {activeIndex + 1} / {gallery.length}
        </p>
        {/* Card deck - depth 2 rendered first (behind), depth 0 last (on top) */}
        <div
          className="relative w-full max-w-xs cursor-grab active:cursor-grabbing mt-4"
          style={{ minHeight: 260 }}
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
        >
          {[...STACK].reverse().map((_, i) => {
            const depth = STACK.length - 1 - i;
            const item = gallery[(activeIndex + depth) % total];
            if (!item) {
              return null;
            }

            return (
              <GalleryCard
                key={`${depth}-${item.image_url ?? activeIndex}`}
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
    </GlobalModal>
  );
};

export default ViewGalleryModal;
