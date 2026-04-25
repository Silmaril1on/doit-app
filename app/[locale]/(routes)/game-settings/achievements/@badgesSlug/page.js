import { cookies } from "next/headers";
import { TASK_CATEGORIES } from "@/app/[locale]/lib/local-bd/categoryTypesData";
import { getAllCategoryProgress } from "@/app/[locale]/lib/services/achievement-badges/categoryProgress";
import BadgesSlot from "./BadgesSlot";

const BadgesSlug = async () => {
  const cookieStore = await cookies();
  const userId = cookieStore.get("doit-user-id")?.value ?? null;

  const allProgress = userId
    ? await getAllCategoryProgress(userId).catch(() => [])
    : [];

  const unseenCategoryIds = allProgress
    .filter((p) => p.has_seen === false && p.current_level > 0)
    .map((p) => p.category_id);

  return (
    <BadgesSlot
      categories={TASK_CATEGORIES}
      allProgress={allProgress}
      unseenCategoryIds={unseenCategoryIds}
    />
  );
};

export default BadgesSlug;
