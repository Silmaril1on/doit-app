import {
  getPendingFriendRequests,
  getFriends,
} from "@/app/[locale]/lib/services/user/friendships";
import Friendship from "./Friendship";

export const dynamic = "force-dynamic";

const ProfileFriendshipPage = async () => {
  const [requests, friends] = await Promise.all([
    getPendingFriendRequests().catch(() => []),
    getFriends().catch(() => []),
  ]);

  return <Friendship requests={requests} friends={friends} />;
};

export default ProfileFriendshipPage;
