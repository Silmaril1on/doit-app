"use client";
import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useDispatch } from "react-redux";
import { setToast } from "@/app/[locale]/lib/features/toastSlice";
import ItemCard from "@/app/[locale]/components/container/ItemCard";
import Button from "@/app/[locale]/components/buttons/Button";
import SectionHeadline from "@/app/[locale]/components/elements/SectionHeadline";
import BorderSvg from "@/app/[locale]/components/elements/BorderSvg";
import { GiSwordsPower, GiCrossedSwords, GiDragonHead } from "react-icons/gi";

const DIFFICULTIES = [
  {
    id: "easy",
    label: "EASY",
    icon: GiSwordsPower,
    accentKey: "teal",
    glow: "shadow-[0_0_25px_rgba(45,212,191,0.25)]",
    textColor: "text-teal-300",
    badgeBorder: "border-teal-400/50",
    bgColor: "bg-teal-500/5",
    activeBg: "bg-teal-500/10",
    description:
      "Perfect for beginners or casual players. Objectives are relaxed, XP penalties are minimal, and you have more time to complete your quests. Focus on building habits without the pressure of hard deadlines.",
    perks: [
      "Generous completion windows",
      "No XP penalty on failed subtasks",
      "Reduced objective complexity",
    ],
  },
  {
    id: "medium",
    label: "MEDIUM",
    icon: GiCrossedSwords,
    accentKey: "gold",
    glow: "shadow-[0_0_25px_rgba(252,185,19,0.25)]",
    textColor: "text-yellow-300",
    badgeBorder: "border-yellow-400/60",
    bgColor: "bg-yellow-500/5",
    activeBg: "bg-yellow-500/10",
    description:
      "The balanced experience. Standard quest timers, moderate XP rewards, and a fair challenge that keeps you engaged without overwhelming you. Recommended for most players.",
    perks: [
      "Standard XP rewards",
      "Balanced quest timers",
      "Moderate challenge scaling",
    ],
  },
  {
    id: "hard",
    label: "HARD",
    icon: GiDragonHead,
    accentKey: "crimson",
    glow: "shadow-[0_0_25px_rgba(217,26,23,0.25)]",
    textColor: "text-red-400",
    badgeBorder: "border-red-400/60",
    bgColor: "bg-red-500/5",
    activeBg: "bg-red-500/10",
    description:
      "For the elite. Strict deadlines, XP bonuses for early completion, but harsh penalties for failure. Every objective counts. Only take on Hard mode if you are truly committed to your goals.",
    perks: [
      "+25% XP bonus on early completion",
      "Strict deadline enforcement",
      "High-risk, high-reward scoring",
    ],
  },
];

export default function DifficultySettingsPage() {
  const dispatch = useDispatch();
  const [current, setCurrent] = useState(null);
  const [selected, setSelected] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/user/difficulty")
      .then((r) => r.json())
      .then((d) => {
        const diff = d.difficulty ?? null;
        setCurrent(diff);
        setSelected(null); // keep closed initially
      })
      .catch(() => {});
  }, []);
  const handleSave = async () => {
    if (!selected || selected === current) return;
    setSaving(true);
    try {
      const res = await fetch("/api/user/difficulty", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ difficulty: selected }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save");
      setCurrent(selected);
      dispatch(
        setToast({
          type: "success",
          msg: `Difficulty set to ${selected.toUpperCase()}`,
        }),
      );
    } catch (err) {
      dispatch(setToast({ type: "error", msg: err.message }));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen px-4 pb-20 pt-17 flex flex-col justify-between bg-black space-y-5">
      <SectionHeadline
        title="Game Difficulty"
        subtitle="Choose how challenging your journey will be."
      />

      <div className="space-y-8">
        {DIFFICULTIES.map((diff, index) => {
          const Icon = diff.icon;
          const isSelected = selected === diff.id;
          const isCurrent = current === diff.id;

          return (
            <motion.div
              key={diff.id}
              initial={{ opacity: 0, scale: 0.92, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{
                delay: index * 0.3,
                duration: 0.45,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="space-y-0"
            >
              {/* Option button */}
              <button
                type="button"
                onClick={() => setSelected(isSelected ? null : diff.id)}
                className={`relative w-full  text-left rounded-xl overflow-hidden transition-all duration-300 border border-transparent ${
                  isSelected
                    ? `${diff.activeBg} ${diff.glow}`
                    : `${diff.bgColor} `
                }`}
              >
                <BorderSvg
                  strokeWidth={1.4}
                  radius={12}
                  color={diff.accentKey}
                />
                <div className="relative z-10 flex flex-col items-center gap-4 px-5 py-4">
                  <div className="relative shrink-0 w-12 h-12 rounded-xl flex items-center justify-center bg-black/40">
                    <BorderSvg
                      strokeWidth={1.2}
                      radius={10}
                      color={diff.accentKey}
                    />
                    <Icon
                      size={26}
                      className={isSelected ? diff.textColor : "text-cream/40"}
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <span
                        className={`font-black tracking-[0.15em] text-lg secondary ${
                          isSelected ? diff.textColor : "text-cream/50"
                        }`}
                      >
                        {diff.label}
                      </span>
                      {isCurrent && (
                        <span
                          className={`secondary text-[80px] uppercase tracking-widest px-2 py-0.5 rounded-full border ${diff.badgeBorder} ${diff.textColor}`}
                        >
                          active
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </button>

              {/* Animated dropdown description */}
              <AnimatePresence initial={false}>
                {isSelected && (
                  <motion.div
                    key="desc"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                    className="overflow-hidden"
                  >
                    <div
                      className={`mx-0.5 mt-5 flex-col rounded-lg px-5 py-4 space-y-3 ${diff.activeBorder} ${diff.activeBg}`}
                    >
                      <p className="secondary text-sm text-cream/70 leading-relaxed">
                        {diff.description}
                      </p>
                      <ul className="space-y-1.5">
                        {diff.perks.map((perk) => (
                          <li
                            key={perk}
                            className={`flex items-center gap-2 secondary text-xs ${diff.textColor}`}
                          >
                            <span className="text-base">◆</span>
                            {perk}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      {/* Save button */}
      <ItemCard className="flex items-center justify-between gap-4">
        <div>
          <p className="text-cream font-semibold">
            {selected
              ? `Selected: ${DIFFICULTIES.find((d) => d.id === selected)?.label}`
              : "No difficulty selected"}
          </p>
          <p className="secondary text-xs text-chino/50 mt-0.5">
            {selected === current
              ? "This is your current difficulty."
              : "Save to apply changes."}
          </p>
        </div>
        <Button
          text={saving ? "Saving..." : "Save"}
          onClick={handleSave}
          disabled={saving || !selected || selected === current}
        />
      </ItemCard>
    </div>
  );
}
