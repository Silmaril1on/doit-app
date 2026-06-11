import { cookies } from "next/headers";
import { unstable_cache } from "next/cache";
import { TASK_CATEGORIES } from "@/app/[locale]/lib/local-bd/categoryTypesData";
import { getAllCategoryProgress } from "@/app/[locale]/lib/services/achievement-badges/categoryProgress";
import { badgesCacheTag } from "@/app/[locale]/lib/services/achievement-badges/cacheUtils";
import { supabaseAdmin } from "@/app/[locale]/lib/supabase/supabaseServer";
import BadgesSlot from "./BadgesSlot";

const getTiers = unstable_cache(
  async () => {
    const result = await supabaseAdmin
      .from("category_achievement_tiers")
      .select("*")
      .order("category_id", { ascending: true })
      .order("required_count", { ascending: true });
    return result.data ?? [];
  },
  ["category-achievement-tiers"],
  { revalidate: 3600, tags: ["achievement-tiers"] },
);

const getUserProgress = (userId) =>
  unstable_cache(
    () => getAllCategoryProgress(userId).catch(() => []),
    [badgesCacheTag(userId)],
    { revalidate: 30, tags: [badgesCacheTag(userId)] },
  )();

const BadgesSlug = async () => {
  const cookieStore = await cookies();
  const userId = cookieStore.get("doit-user-id")?.value ?? null;

  const [allProgress, tiersData] = await Promise.all([
    userId ? getUserProgress(userId) : Promise.resolve([]),
    getTiers(),
  ]);

  // Group tiers by category_id
  const tiersMap = {};
  for (const tier of tiersData) {
    if (!tiersMap[tier.category_id]) tiersMap[tier.category_id] = [];
    tiersMap[tier.category_id].push(tier);
  }

  const unseenCategoryIds = allProgress
    .filter((p) => p.has_seen === false && p.current_level > 0)
    .map((p) => p.category_id);

  return (
    <BadgesSlot
      categories={TASK_CATEGORIES}
      allProgress={allProgress}
      unseenCategoryIds={unseenCategoryIds}
      tiersMap={tiersMap}
    />
  );
};

export default BadgesSlug;
