import { Suspense } from "react";
import { notFound } from "next/navigation";
import {
  getCachedUser,
  getCachedXp,
  getCachedFriendsCount,
} from "./profileCache";
import MyProfile from "./MyProfile";
import ProfileAnalytics from "./ProfileAnalytics";
import { AnalyticsSkeleton } from "./ProfileSkeletons";

export async function generateMetadata() {
  return {
    title: `Profile — Listory`,
    description: `View user's profile, achievements, and completed objectives.`,
  };
}

const UsersProfilePage = async ({ params }) => {
  const { username } = await params;
  const displayName = decodeURIComponent(username);

  let user;
  try {
    user = await getCachedUser(displayName);
  } catch {
    notFound();
  }
  if (!user) notFound();

  const [xp, friendsCount] = await Promise.all([
    getCachedXp(user.id),
    getCachedFriendsCount(user.id),
  ]);

  console.log(`[profile] critical path complete — user=${user.id}`);

  return (
    <MyProfile
      user={user}
      xp={xp}
      friendsCount={friendsCount}
      tokens={user?.token ?? 0}
    >
      {/* Analytics streams in after the shell — skeleton prevents layout shift */}
      <Suspense fallback={<AnalyticsSkeleton />}>
        <ProfileAnalytics userId={user.id} xp={xp} />
      </Suspense>
    </MyProfile>
  );
};

export default UsersProfilePage;
