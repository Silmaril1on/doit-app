import { cookies } from "next/headers";
import { unstable_cache } from "next/cache";
import { getUserXp } from "@/app/[locale]/lib/services/xp/xpProgress";
import LevelBadges from "./LevelBadges";

const getUserLevel = (userId) =>
  unstable_cache(
    () => getUserXp(userId).catch(() => ({ current_level: 0 })),
    [`user-level-${userId}`],
    { revalidate: 30, tags: [`user-xp-${userId}`, "user-xp"] },
  )();

const LevelBadgesSlug = async () => {
  const cookieStore = await cookies();
  const userId = cookieStore.get("doit-user-id")?.value ?? null;

  const { current_level } = userId
    ? await getUserLevel(userId)
    : { current_level: 0 };

  return <LevelBadges currentLevel={current_level} />;
};

export default LevelBadgesSlug;
