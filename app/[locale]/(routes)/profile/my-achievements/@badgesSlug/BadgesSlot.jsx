"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import ItemCard from "@/app/[locale]/components/container/ItemCard";
import Button from "@/app/[locale]/components/buttons/Button";
import { CATEGORY_ACHIEVEMENT_TIERS } from "@/app/[locale]/lib/local-bd/categoryTypesData";
import { formatDate, timeAgo } from "@/app/[locale]/lib/utils/utils";

const BadgesSlot = ({ categories, allProgress, unseenCategoryIds = [] }) => {
  const [activeCategory, setActiveCategory] = useState(categories[0]);
  const [unseenSet] = useState(() => new Set(unseenCategoryIds));

  // Mark all as seen in DB on first visit — fire and forget
  useEffect(() => {
    if (unseenSet.size === 0) return;
    fetch("/api/achievement-badges", { method: "PATCH" }).catch(() => {});
  }, []);

  const progressMap = new Map(allProgress.map((p) => [p.category_id, p]));
  const activeProgress = progressMap.get(activeCategory.id);
  const currentLevel = activeProgress?.current_level ?? 0;
  const completedCount = activeProgress?.completed_count ?? 0;
  const acquiredAt = activeProgress?.created_at
    ? new Date(activeProgress.created_at).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : null;
  const tiers = CATEGORY_ACHIEVEMENT_TIERS[activeCategory.id] ?? [];

  return (
    <ItemCard className="space-y-2">
      {/* Top row: title left, count chip right */}
      <div className="flex items-center justify-between gap-2">
        <div className="*:leading-none mb-2">
          <h1 className="text-cream/90 text-3xl font-bold">Badges</h1>
          <div className="flex items-center text-chino secondary text-xs">
            {completedCount > 0 && (
              <h1>
                <b className="text-teal-400">{completedCount}</b>{" "}
                <span>
                  Quest
                  {completedCount !== 1 ? "s" : ""} done
                </span>{" "}
                -
              </h1>
            )}
            <p className="pl-1">You badge progress</p>
          </div>
        </div>
      </div>
      <div></div>

      {/* Category navigation tabs */}
      <div className="flex gap-1.5 flex-wrap mb-3">
        {categories.map((cat) => {
          const isActive = cat.id === activeCategory.id;
          const hasUnseen = unseenSet.has(cat.id);
          return (
            <div key={cat.id} className="relative ">
              <Button
                variant={isActive ? "fill" : "outline"}
                text={cat.label}
                onClick={() => setActiveCategory(cat)}
                className="text-[10px] px-2.5 py-1 rounded-full font-semibold secondary"
              />
              {hasUnseen && (
                <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-rose-500" />
              )}
            </div>
          );
        })}
      </div>

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
              className={`flex flex-col items-center gap-4 rounded-xl border p-4 text-center relative ${
                earned
                  ? "border-teal-500/40 bg-teal-500/10"
                  : "opacity-50 border-teal-500/20 bg-black/40"
              }`}
            >
              {/* New Badge tag — only on the most recently earned tier */}
              {earned &&
                tier.level === currentLevel &&
                unseenSet.has(activeCategory.id) && (
                  <span className="absolute top-2 right-2 bg-rose-600 text-cream text-[9px] font-bold secondary px-2 py-0.5 rounded-md shadow-lg shadow-rose-900/40 whitespace-nowrap">
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

              <div>
                <p className=" font-semibold text-cream leading-tight">
                  {tier.title}
                </p>

                <p className="text-[10px] secondary text-chino/60 leading-tight">
                  {earned
                    ? `Unlocked at ${tier.required_count} objectives`
                    : `Complete ${tier.required_count} objectives to unlock this badge`}
                </p>
                <div className="h-4 ">
                  {earned && tier.level === currentLevel && acquiredAt && (
                    <p className="text-[10px] secondary text-teal-400/70 leading-tight mt-0.5">
                      {timeAgo(acquiredAt)}
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </ItemCard>
  );
};

export default BadgesSlot;
