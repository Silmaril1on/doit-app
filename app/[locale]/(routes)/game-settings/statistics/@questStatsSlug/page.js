import { cookies } from "next/headers";
import { getQuestStats } from "@/app/[locale]/lib/services/statistics/quest-stats/questStats";
import QuestStats from "./QuestStats";

const QuestStatsSlug = async () => {
  const cookieStore = await cookies();
  const userId = cookieStore.get("doit-user-id")?.value ?? null;

  const tasks = userId
    ? await getQuestStats(userId).catch(() => [])
    : [];

  return <QuestStats tasks={tasks} />;
};

export default QuestStatsSlug;
