import { cookies } from "next/headers";
import {
  TASK_CATEGORIES,
  CATEGORY_ACHIEVEMENT_TIERS,
} from "@/app/[locale]/lib/local-bd/categoryTypesData";
import { getUserEarnedBadges, getUnseenBadgeCategories } from "@/app/[locale]/lib/services/achievement-badges/categoryProgress";
import BadgesSlot from "./BadgesSlot";

const BadgesSlug = async ({ searchParams }) => {
  const cookieStore = await cookies();
  const userId = cookieStore.get("doit-user-id")?.value ?? null;

  // Resolve the active category from the URL (?category=2), default to first
  const params = await searchParams;
  const rawCatId = Number(params?.category);
  const activeCategory =
    TASK_CATEGORIES.find((c) => c.id === rawCatId) ?? TASK_CATEGORIES[0];

  // Fetch cached progress + uncached has_seen status in parallel
  const [progressList, unseenCategoryIds] = await Promise.all([
    userId ? getUserEarnedBadges(userId).catch(() => []) : Promise.resolve([]),
    userId ? getUnseenBadgeCategories(userId).catch(() => []) : Promise.resolve([]),
  ]);

  const levelMap = new Map(
    progressList.map((p) => [p.category_id, p.current_level ?? 0]),
  );
  const countMap = new Map(
    progressList.map((p) => [p.category_id, p.completed_count ?? 0]),
  );

  const tiers = CATEGORY_ACHIEVEMENT_TIERS[activeCategory.id] ?? [];
  const currentLevel = levelMap.get(activeCategory.id) ?? 0;
  const completedCount = countMap.get(activeCategory.id) ?? 0;

  return (
    <BadgesSlot
      categories={TASK_CATEGORIES}
      activeCategory={activeCategory}
      tiers={tiers}
      currentLevel={currentLevel}
      completedCount={completedCount}
      unseenCategoryIds={unseenCategoryIds}
    />
  );
};

export default BadgesSlug;
