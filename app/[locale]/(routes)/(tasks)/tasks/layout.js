import { cookies } from "next/headers";
import { getUserById } from "@/app/[locale]/lib/services/user/userProfiles";
import { getUserXp } from "@/app/[locale]/lib/services/xp/xpProgress";
import TasksPageHeader from "./(componets)/TasksPageHeader";

const TasksLayout = async ({ children }) => {
  const cookieStore = await cookies();
  const userId = cookieStore.get("doit-user-id")?.value ?? null;

  let profile = null;
  let initialXp = null;

  if (userId) {
    try {
      [profile, initialXp] = await Promise.all([
        getUserById(userId),
        getUserXp(userId),
      ]);
    } catch {
      // silently fall through — UI degrades gracefully
    }
  }

  return (
    <main className="bg-black px-3 space-y-2">
      <TasksPageHeader profile={profile} initialXp={initialXp} />
      {children}
    </main>
  );
};

export default TasksLayout;
