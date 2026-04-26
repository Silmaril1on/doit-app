"use client";
import { useEffect, useState } from "react";
import {
  CATEGORY_ACHIEVEMENT_TIERS,
  resolveCurrentLevel,
} from "@/app/[locale]/lib/local-bd/categoryTypesData";
import BadgeGrid from "../components/BadgeGrid";

const BadgesSlot = ({ categories, allProgress, unseenCategoryIds = [] }) => {
  const [activeCategory, setActiveCategory] = useState(categories[0]);
  const [unseenSet] = useState(() => new Set(unseenCategoryIds));

  // Mark all as seen in DB on first visit — fire and forget
  useEffect(() => {
    if (unseenSet.size === 0) return;
    fetch("/api/achievement-badges", { method: "PATCH" }).catch(() => {});
  }, [unseenSet]);

  const progressMap = new Map(allProgress.map((p) => [p.category_id, p]));
  const activeProgress = progressMap.get(activeCategory.id);
  const completedCount = activeProgress?.completed_count ?? 0;
  const acquiredAt = activeProgress?.created_at
    ? new Date(activeProgress.created_at).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : null;
  const currentLevel = resolveCurrentLevel(activeCategory.id, completedCount);
  const tiers = CATEGORY_ACHIEVEMENT_TIERS[activeCategory.id] ?? [];

  return (
    <BadgeGrid
      title="Badges"
      tiersData={tiers}
      currentProgress={currentLevel}
      type="category"
      categories={categories}
      activeCategoryId={activeCategory.id}
      onCategoryChange={setActiveCategory}
      unseenCategoryIds={Array.from(unseenSet)}
      latestAcquiredAt={acquiredAt}
      showNewTag={true}
    />
  );
};

export default BadgesSlot;
