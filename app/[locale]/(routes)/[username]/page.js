import { notFound } from "next/navigation";
import { getUserByDisplayName } from "@/app/[locale]/lib/services/user/userProfiles";
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

  return <UserHomePage user={user} />;
};

export default UsersProfilePage;
