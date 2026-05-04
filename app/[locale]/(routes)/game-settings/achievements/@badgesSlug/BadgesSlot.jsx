"use client";
import { useEffect, useState } from "react";
import BadgeGrid from "../components/BadgeGrid";

// Resolves the highest earned level from a dynamic tiers array.
const resolveLevel = (tiers, completedCount) => {
  let level = 0;
  for (const tier of tiers) {
    if (completedCount >= tier.required_count) level = tier.level;
  }
  return level;
};

const BadgesSlot = ({
  categories,
  allProgress,
  unseenCategoryIds = [],
  tiersMap = {},
}) => {
  const [activeCategory, setActiveCategory] = useState(categories[0]);
  const [unseenSet] = useState(() => new Set(unseenCategoryIds));

  // Mark all as seen in DB on first visit — fire and forget
  useEffect(() => {
    if (unseenSet.size === 0) return;
    fetch("/api/achievement-badges", { method: "PATCH" }).catch(() => {});
  }, [unseenSet]);

  const progressMap = new Map(allProgress.map((p) => [p.category_id, p]));
  const activeProgress = activeCategory
    ? progressMap.get(activeCategory.id)
    : null;
  const completedCount = activeProgress?.completed_count ?? 0;
  const acquiredAt = activeProgress?.created_at
    ? new Date(activeProgress.created_at).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : null;

  const tiers = activeCategory ? (tiersMap[activeCategory.id] ?? []) : [];
  const currentLevel = activeCategory ? resolveLevel(tiers, completedCount) : 0;

  return (
    <BadgeGrid
      title="Badges"
      tiersData={tiers}
      currentProgress={currentLevel}
      completedCount={completedCount}
      type="category"
      categories={categories}
      activeCategoryId={activeCategory?.id}
      onCategoryChange={setActiveCategory}
      unseenCategoryIds={Array.from(unseenSet)}
      latestAcquiredAt={acquiredAt}
      showNewTag={true}
    />
  );
};

export default BadgesSlot;
