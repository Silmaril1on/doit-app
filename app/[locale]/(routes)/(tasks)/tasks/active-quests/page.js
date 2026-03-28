import { cookies } from "next/headers";
import { getAllActiveQuests } from "@/app/[locale]/lib/services/tasks/active-quests/myActiveQuests";
import ActiveQuests from "./ActiveQuests";

const ActiveQuestsPage = async () => {
  const cookieStore = await cookies();
  const userId = cookieStore.get("doit-user-id")?.value ?? null;

  let initialData = null;
  if (userId) {
    try {
      initialData = await getAllActiveQuests(userId, { limit: 20, offset: 0 });
    } catch {
      // silently fall through — client SWR will fetch on mount
    }
  }

  return <ActiveQuests initialData={initialData} />;
};

export default ActiveQuestsPage;
