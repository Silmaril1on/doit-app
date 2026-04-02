"use client";
// active users acquired badge is insertd in user_category_progress table. for each each record there is a  state has_seen: false , when user comes to this page it means he already saw the new bad and we update the has_seen: true
import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import ItemCard from "@/app/[locale]/components/container/ItemCard";
import SectionHeadline from "@/app/[locale]/components/elements/SectionHeadline";

const BadgesSlot = ({ categories, activeCategory, tiers, currentLevel, completedCount, unseenCategoryIds = [] }) => {
  // Freeze the unseen set on first mount so it survives tab navigation within the same session.
  // The next full page visit (after PATCH has updated DB) will correctly get an empty array.
  const [unseenSet] = useState(() => new Set(unseenCategoryIds));

  // Mark all as seen in DB on first visit — fire and forget
  useEffect(() => {
    if (unseenSet.size === 0) return;
    fetch("/api/achievement-badges", { method: "PATCH" }).catch(() => {});
  }, []);
  return (
    <ItemCard className="space-y-2">
      {/* Top row: title left, count chip right */}
      <div className="flex items-center justify-between gap-2">
        <h1 className="text-cream/90 text-3xl font-bold">Badges</h1>
        <div className="flex items-center gap-1.5 bg-teal-500/10 border border-teal-500/25 rounded-lg px-3 py-1.5 shrink-0">
          <span className="text-teal-400 text-xl font-bold leading-none">{completedCount}</span>
          <span className="text-[9px] secondary uppercase tracking-widest text-cream/50 font-semibold">
            Quest{completedCount !== 1 ? "s" : ""} done
          </span>
        </div>
      </div>

      {/* Category navigation tabs */}
      <div className="flex gap-1.5 flex-wrap">
        {categories.map((cat) => {
          const isActive = cat.id === activeCategory.id;
          const hasUnseen = unseenSet.has(cat.id);
          return (
            <Link
              key={cat.id}
              href={`?category=${cat.id}`}
              className={`relative px-2.5 py-1 rounded-full text-[10px] font-semibold secondary transition-colors ${
                isActive
                  ? "bg-teal-500 text-black"
                  : "bg-teal-500/10 text-cream/80 border border-teal-500/30 hover:bg-teal-500/20 hover:text-cream"
              }`}
            >
              {cat.label}
              {hasUnseen && (
                <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-rose-500" />
              )}
            </Link>
          );
        })}
      </div>

      {/* Subtitle */}
      <p className="text-xs secondary text-chino pb-1">
        {activeCategory.description}
      </p>

      {/* Badge grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {tiers.map((tier, index) => {
            const earned = tier.level <= currentLevel;
            return (
              <motion.div
                key={`${activeCategory.id}-${tier.level}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: index * 0.08,
                  duration: 0.3,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className={`flex flex-col items-center gap-2 rounded-xl border p-4 text-center relative ${
                  earned
                    ? "border-teal-500/40 bg-teal-500/10"
                    : "opacity-50 border-teal-500/20 bg-black/40"
                }`}
              >
                {/* New Badge tag — only on the most recently earned tier */}
                {earned && tier.level === currentLevel && unseenSet.has(activeCategory.id) && (
                  <span className="absolute -top-2.5 -right-2.5 bg-rose-600 text-cream text-[9px] font-bold secondary px-2 py-0.5 rounded-md shadow-lg shadow-rose-900/40 whitespace-nowrap">
                    New Badge
                  </span>
                )}
                {/* Badge level circle */}
                <div
                  className={`h-12 w-12 rounded-full border flex items-center justify-center shrink-0 ${
                    earned
                      ? "bg-teal-500 border-teal-400"
                      : "bg-teal-500/20 border-teal-500/40"
                  }`}
                >
                  <span
                    className={`text-xs font-bold ${
                      earned ? "text-black" : "text-teal-400"
                    }`}
                  >
                    {tier.level}
                  </span>
                </div>

                {/* Badge title */}
                <p className="text-sm font-semibold text-cream leading-tight">
                  {tier.title}
                </p>

                {/* Unlock requirement */}
                <p className="text-[10px] secondary text-chino/60 leading-tight">
                  {earned
                    ? `Unlocked at ${tier.required_count} objectives`
                    : `Complete ${tier.required_count} objectives to unlock this badge`}
                </p>
              </motion.div>
            );
          })}
      </div>
    </ItemCard>
  );
};

export default BadgesSlot;
