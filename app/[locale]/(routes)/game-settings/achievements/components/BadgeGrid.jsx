"use client";
import { useMemo } from "react";
import { motion } from "framer-motion";
import ItemCard from "@/app/[locale]/components/container/ItemCard";
import Button from "@/app/[locale]/components/buttons/Button";
import SectionHeadline from "@/app/[locale]/components/elements/SectionHeadline";
import { timeAgo } from "@/app/[locale]/lib/utils/utils";
import { CATEGORY_ACHIEVEMENT_TIERS } from "@/app/[locale]/lib/local-bd/categoryTypesData";
import { getEarnedTiers } from "@/app/[locale]/lib/local-bd/levelProgressData";
import Image from "next/image";

const BadgeGrid = ({
  title,
  tiersData = [],
  currentProgress = 0,
  type = "level", // "level" | "category"
  categories = [],
  activeCategoryId,
  onCategoryChange,
  unseenCategoryIds = [],
  latestAcquiredAt,
  showNewTag = false,
}) => {
  // Dynamic subtitle: compute acquired count
  const earnedCount = useMemo(() => {
    if (type === "category") {
      return currentProgress; // Already resolved level
    }
    return getEarnedTiers(currentProgress).length;
  }, [currentProgress, type]);

  const subtitle = `${earnedCount} badge${earnedCount !== 1 ? "s" : ""} acquired`;

  // Active category data for category type
  const activeCategory = categories.find((c) => c.id === activeCategoryId);
  const activeTiers =
    type === "category" && activeCategory
      ? CATEGORY_ACHIEVEMENT_TIERS[activeCategory.id] || []
      : tiersData;

  const unseenSet = new Set(unseenCategoryIds);
  const hasUnseenActive =
    type === "category" && unseenSet.has(activeCategoryId);

  return (
    <ItemCard className="space-y-2">
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div>
          <SectionHeadline title={title} subtitle={subtitle} />
        </div>
      </div>

      {/* Category tabs (conditional) */}
      {categories.length > 0 && (
        <div className="flex gap-1.5 flex-wrap mb-3">
          {categories.map((cat) => {
            const isActive = cat.id === activeCategoryId;
            const hasUnseen = unseenSet.has(cat.id);
            return (
              <div key={cat.id} className="relative">
                <Button
                  variant={isActive ? "fill" : "outline"}
                  size="sm"
                  text={cat.label}
                  onClick={() => onCategoryChange?.(cat)}
                />
                {hasUnseen && (
                  <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-rose-500" />
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Badge grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {activeTiers.map((tier, index) => {
          // Normalize tier data
          const level = tier.level ?? tier.threshold;
          const title = tier.title ?? tier.name;
          const reqCount = tier.required_count ?? tier.threshold;

          const earned =
            type === "category"
              ? level <= currentProgress
              : currentProgress >= level;

          const isLatestEarned = earned && level === currentProgress;
          const showNew = showNewTag && isLatestEarned && hasUnseenActive;

          return (
            <motion.div
              key={`${type}-${level}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: index * 0.08,
                duration: 0.3,
                ease: [0.22, 1, 0.36, 1],
              }}
              className={`flex flex-col items-center gap-4 rounded-xl border p-4 text-center relative ${
                earned
                  ? "border-primary/40 bg-primary/20"
                  : "opacity-50 border-primary/20 bg-black/40"
              }`}
            >
              {/* New Badge tag */}
              {showNew && (
                <span className="absolute top-2 right-2 bg-rose-600 text-cream text-[9px] font-bold secondary px-2 py-0.5 rounded-md shadow-lg shadow-rose-900/40 whitespace-nowrap">
                  New Badge
                </span>
              )}

              {/* Badge icon — image if available, level circle as fallback */}
              {tier.badge_image ? (
                <div
                  className={`h-14 w-14 rounded-lg overflow-hidden shrink-0 ${
                    earned ? "" : "grayscale opacity-60"
                  }`}
                >
                  <Image
                    src={tier.badge_image}
                    alt={title}
                    className="h-full w-full object-cover"
                    width={56}
                    height={56}
                  />
                </div>
              ) : (
                <div
                  className={`h-12 w-12 rounded-full border flex items-center justify-center shrink-0 ${
                    earned
                      ? "bg-primary border-primary"
                      : "bg-primary/20 border-primary/40"
                  }`}
                >
                  <span
                    className={`text-xs font-bold ${
                      earned ? "text-black" : "text-primary/60"
                    }`}
                  >
                    {level}
                  </span>
                </div>
              )}

              <div>
                <p className="font-semibold text-cream leading-tight">
                  {title}
                </p>
                <p className="text-[10px] secondary text-chino/60 leading-tight">
                  {earned
                    ? `Unlocked at ${reqCount} ${type === "level" ? "level" : "objectives"}`
                    : `Complete ${reqCount} ${type === "level" ? "level" : "objectives"} to unlock this badge`}
                </p>
                <div className="h-4">
                  {earned && isLatestEarned && latestAcquiredAt && (
                    <p className="text-[10px] secondary capitalize text-primary leading-tight mt-0.5">
                      {timeAgo(latestAcquiredAt)}
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

export default BadgeGrid;
