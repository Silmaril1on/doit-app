import { cookies } from "next/headers";
import { getAllObjectives } from "@/app/[locale]/lib/services/tasks/objectives/myObjectives";
import Objectives from "./Objectives";

export const metadata = {
  title: "Objectives — DoIt",
  description: "Track and manage all your personal objectives.",
};

const ObjectivesPage = async () => {
  const cookieStore = await cookies();
  const userId = cookieStore.get("doit-user-id")?.value ?? null;

  let initialData = null;
  if (userId) {
    try {
      initialData = await getAllObjectives(userId, {
        status: "todo",
        limit: 20,
        offset: 0,
      });
    } catch {
      // silently fall through — client SWR will fetch on mount
    }
  }

  return <Objectives initialData={initialData} userId={userId} />;
};

export default ObjectivesPage;
