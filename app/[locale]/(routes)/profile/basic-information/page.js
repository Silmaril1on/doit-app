import { unstable_cache } from "next/cache";
import { cookies } from "next/headers";
import { getUserById } from "@/app/[locale]/lib/services/user/userProfiles";
import MyProfile from "./MyProfile";

const getCachedUserProfile = unstable_cache(
  async (userId) => getUserById(userId),
  ["user-profile"],
  { revalidate: 1800, tags: ["user-profile"] },
);

const MyProfilePage = async () => {
  const cookieStore = await cookies();
  const userId = cookieStore.get("doit-user-id")?.value ?? null;

  if (!userId) return null;

  const user = await getCachedUserProfile(userId).catch(() => null);

  return <MyProfile user={user} />;
};

export default MyProfilePage;
