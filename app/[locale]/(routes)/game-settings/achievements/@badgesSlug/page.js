import { cookies } from "next/headers";
import { TASK_CATEGORIES } from "@/app/[locale]/lib/local-bd/categoryTypesData";
import { getAllCategoryProgress } from "@/app/[locale]/lib/services/achievement-badges/categoryProgress";
import { supabaseAdmin } from "@/app/[locale]/lib/supabase/supabaseServer";
import BadgesSlot from "./BadgesSlot";

const BadgesSlug = async () => {
  const cookieStore = await cookies();
  const userId = cookieStore.get("doit-user-id")?.value ?? null;

  const [allProgress, tiersResult] = await Promise.all([
    userId
      ? getAllCategoryProgress(userId).catch(() => [])
      : Promise.resolve([]),
    supabaseAdmin
      .from("category_achievement_tiers")
      .select("*")
      .order("category_id", { ascending: true })
      .order("required_count", { ascending: true }),
  ]);

  // Group tiers by category_id
  const tiersMap = {};
  for (const tier of tiersResult.data ?? []) {
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
