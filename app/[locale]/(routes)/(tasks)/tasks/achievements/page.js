import { cookies } from "next/headers";
import { getAllAchievements } from "@/app/[locale]/lib/services/tasks/achivements/myAchievements";
import Achievements from "./Achievements";

const AchievementsPage = async () => {
  const cookieStore = await cookies();
  const userId = cookieStore.get("doit-user-id")?.value ?? null;

  let initialData = null;
  if (userId) {
    try {
      initialData = await getAllAchievements(userId, { limit: 20, offset: 0 });
    } catch {
      // silently fall through — client SWR will fetch on mount
    }
  }

  return <Achievements initialData={initialData} userId={userId} />;
};

export default AchievementsPage;
