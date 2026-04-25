"use client";
import Button from "@/app/[locale]/components/buttons/Button";
import SectionHeadline from "@/app/[locale]/components/elements/SectionHeadline";
import {
  selectColorValue,
  setColorValue,
} from "@/app/[locale]/lib/features/configSlice";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";

const COLOR_OPTIONS = [
  { value: "teal", label: "Teal", swatch: "bg-teal-500" },
  { value: "gold", label: "Gold", swatch: "bg-gold" },
  { value: "blue", label: "Blue", swatch: "bg-blue" },
  { value: "crimson", label: "Crimson", swatch: "bg-crimson" },
  { value: "grey", label: "Grey", swatch: "bg-grey" },
  { value: "violet", label: "Violet", swatch: "bg-violet" },
  { value: "coffee", label: "Coffee", swatch: "bg-choco" },
];

const Colors = () => {
  const dispatch = useDispatch();
  const currentColor = useSelector(selectColorValue);
  const [selected, setSelected] = useState(currentColor ?? "teal");
  const [saving, setSaving] = useState(false);

  const handleSelect = (value) => {
    setSelected(value);
    // Live preview — updates all Buttons app-wide instantly
    dispatch(setColorValue(value));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/user/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ color_value: selected }),
      });
      if (!res.ok) throw new Error("Failed to save");
      dispatch(setToast({ type: "success", msg: "Design saved!" }));
    } catch {
      dispatch(setToast({ type: "error", msg: "Failed to save design." }));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <SectionHeadline
        title="Color Theme"
        subtitle="Choose your personal accent color — it applies to all buttons."
      />

      {/* Swatches */}
      <div className="flex flex-wrap gap-5">
        {COLOR_OPTIONS.map((opt) => {
          const isActive = selected === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => handleSelect(opt.value)}
              className="flex flex-col items-center gap-1.5 cursor-pointer"
            >
              <div
                className={`w-12 h-12 rounded-xl border-2 transition-all duration-200 ${opt.swatch} ${
                  isActive
                    ? "border-cream scale-110 shadow-lg"
                    : "border-transparent opacity-60 hover:opacity-90 hover:scale-105"
                }`}
              />
              <span
                className={`text-[10px] secondary uppercase tracking-wide ${
                  isActive ? "text-cream font-semibold" : "text-chino/50"
                }`}
              >
                {opt.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Live button preview */}
      <div className="space-y-2">
        <p className="text-[10px] uppercase tracking-widest secondary text-chino/50">
          Preview
        </p>
        <div className="flex flex-wrap gap-3 rounded-xl border border-teal-500/10 bg-black/20 p-4">
          <Button variant="fill" text="Fill Button" />
          <Button variant="outline" text="Outline Button" />
        </div>
      </div>

      <Button
        text="Save Design"
        variant="fill"
        loading={saving}
        onClick={handleSave}
      />
    </div>
  );
};

export default Colors;
