import { cookies } from "next/headers";
import { getUserXp } from "@/app/[locale]/lib/services/xp/xpProgress";
import LevelBadges from "./LevelBadges";

const LevelBadgesSlug = async () => {
  const cookieStore = await cookies();
  const userId = cookieStore.get("doit-user-id")?.value ?? null;

  const { current_level } = userId
    ? await getUserXp(userId).catch(() => ({ current_level: 0 }))
    : { current_level: 0 };

  return <LevelBadges currentLevel={current_level} />;
};

export default LevelBadgesSlug;
