import { notFound } from "next/navigation";
import { getUserByDisplayName } from "@/app/[locale]/lib/services/user/userProfiles";
import { getUserXp } from "@/app/[locale]/lib/services/xp/xpProgress";
import { getFriendsCountByUserId } from "@/app/[locale]/lib/services/user/friendships";
import { getObjectiveStatsByUserId } from "@/app/[locale]/lib/services/tasks/objectives/myObjectives";
import UserHomePage from "./UserHomePage";

const UsersProfilePage = async ({ params }) => {
  const { username } = await params;
  const displayName = decodeURIComponent(username);

  let user;
  try {
    user = await getUserByDisplayName(displayName);
  } catch {
    notFound();
  }

  const [xp, friendsCount, objectiveStats] = await Promise.all([
    getUserXp(user?.id).catch(() => ({ total_xp: 0, current_level: 1 })),
    getFriendsCountByUserId(user?.id).catch(() => 0),
    getObjectiveStatsByUserId(user?.id).catch(() => ({
      byStatus: {},
      byPriority: {},
      total: 0,
    })),
  ]);

  return (
    <UserHomePage
      user={user}
      xp={xp}
      friendsCount={friendsCount}
      objectiveStats={objectiveStats}
    />
  );
};

export default UsersProfilePage;
