"use client";
import { useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  selectColorValue,
  setColorValue,
} from "@/app/[locale]/lib/features/configSlice";
import { setToast } from "@/app/[locale]/lib/features/toastSlice";
import SectionHeadline from "@/app/[locale]/components/elements/SectionHeadline";
import ObjectiveCard from "@/app/[locale]/(routes)/(tasks)/tasks/(componets)/ObjectiveCard";

const COLOR_OPTIONS = [
  { value: "teal", label: "Teal", hex: "#2dd4bf" },
  { value: "gold", label: "Gold", hex: "#fcb913" },
  { value: "blue", label: "Blue", hex: "#0957c3" },
  { value: "crimson", label: "Crimson", hex: "#d91a17" },
  { value: "grey", label: "Grey", hex: "#7a8fa0" },
  { value: "violet", label: "Violet", hex: "#9b59ff" },
  { value: "coffee", label: "Coffee", hex: "#d6a461" },
];

/* Static dummy objective used purely for design preview */
const DEMO_OBJECTIVE = {
  id: "demo-preview",
  task_title: "Summit a Mountain Peak",
  status: "in_progress",
  priority: "high",
  country: "Georgia",
  city: "Kazbegi",
  due_date: "2026-08-01",
  xp_reward: 200,
  user_id: "demo-user",
  like_count: 14,
  is_liked: false,
  review_count: 4,
  recreate_count: 7,
  task_gallery: [],
  subtasks: [
    {
      id: "s1",
      title: "Research the trail route",
      completed: true,
      category_id: 1,
      lat: null,
      lng: null,
    },
    {
      id: "s2",
      title: "Pack all necessary gear",
      completed: false,
      category_id: 1,
      lat: null,
      lng: null,
    },
    {
      id: "s3",
      title: "Book a local guide",
      completed: false,
      category_id: 2,
      lat: null,
      lng: null,
    },
  ],
};

/* ── Main Colors component ────────────────────────────────── */
const Colors = () => {
  const dispatch = useDispatch();
  const currentColor = useSelector(selectColorValue) ?? "teal";
  const [saving, setSaving] = useState(false);

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
    <div className="space-y-6">
      <SectionHeadline
        title="Color Theme"
        subtitle="Choose your personal accent color."
      />

      {/* ── Design Showcase ── */}
      <div className="space-y-1.5">
        <p className="text-[10px] uppercase tracking-widest secondary text-chino/50">
          Component Preview
        </p>
        <ObjectiveCard
          objective={DEMO_OBJECTIVE}
          readOnly
          completedView={false}
          showDirections={false}
        />
      </div>

      {/* ── Slider ── */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          {/* Left arrow */}
          <button
            type="button"
            onClick={() => selectByIndex(activeIndex - 1)}
            disabled={activeIndex === 0}
            className="w-8 h-10 flex items-center justify-center text-2xl primary text-cream/70 hover:text-cream disabled:opacity-25 disabled:cursor-not-allowed transition-colors duration-150 shrink-0"
          >
            ‹
          </button>

          {/* Bar */}
          <div
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
              <div className="relative w-1 h-14 -translate-x-1/2 bg-white rounded-full shadow-[0_0_10px_3px_rgba(255,255,255,0.6)]" />
            </div>
          </div>

          {/* Right arrow */}
          <button
            type="button"
            onClick={() => selectByIndex(activeIndex + 1)}
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
      <div className="flex justify-center pt-2">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="relative px-12 py-3 primary font-bold text-sm uppercase tracking-[0.18em] text-black bg-primary rounded-lg shadow-[0_0_22px_4px_var(--color-primary)] hover:shadow-[0_0_36px_10px_var(--color-primary)] hover:scale-[1.04] active:scale-95 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 disabled:shadow-none"
        >
          {saving ? "Saving…" : "Save Design"}
        </button>
      </div>
    </div>
  );
};

export default Colors;
