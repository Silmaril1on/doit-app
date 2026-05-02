import { notFound } from "next/navigation";
import { getUserByDisplayName } from "@/app/[locale]/lib/services/user/userProfiles";
import { getUserXp } from "@/app/[locale]/lib/services/xp/xpProgress";
import { getFriendsCountByUserId } from "@/app/[locale]/lib/services/user/friendships";
import { getObjectiveStatsByUserId } from "@/app/[locale]/lib/services/tasks/objectives/myObjectives";
import { getAllCategoryProgress } from "@/app/[locale]/lib/services/achievement-badges/categoryProgress";
import MyProfile from "./MyProfile";

export async function generateMetadata({ params }) {
  const { username } = await params;
  const displayName = decodeURIComponent(username);
  return {
    title: `${displayName} — DoIt`,
    description: `View ${displayName}'s profile, achievements, and completed objectives on DoIt.`,
  };
}

const UsersProfilePage = async ({ params }) => {
  const { username } = await params;
  const displayName = decodeURIComponent(username);

  let user;
  try {
    user = await getUserByDisplayName(displayName);
  } catch {
    notFound();
  }

  const [xp, friendsCount, objectiveStats, badgeProgress] = await Promise.all([
    getUserXp(user?.id).catch(() => ({ total_xp: 0, current_level: 1 })),
    getFriendsCountByUserId(user?.id).catch(() => 0),
    getObjectiveStatsByUserId(user?.id).catch(() => ({
      byStatus: {},
      byPriority: {},
      total: 0,
    })),
    getAllCategoryProgress(user?.id).catch(() => []),
  ]);

  return (
    <MyProfile
      user={user}
      xp={xp}
      friendsCount={friendsCount}
      objectiveStats={objectiveStats}
      badgeProgress={badgeProgress}
      tokens={user?.token ?? 0}
    />
  );
};

export default UsersProfilePage;
