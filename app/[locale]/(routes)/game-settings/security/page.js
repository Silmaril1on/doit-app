import { cookies } from "next/headers";
import { getUserById } from "@/app/[locale]/lib/services/user/userProfiles";
import ChangePassword from "./ChangePassword";
import VerifyEmail from "./VerifyEmail";

export const metadata = {
  title: "Security — DoIt",
  description: "Manage your password and account verification.",
};

const SecurityPage = async () => {
  const cookieStore = await cookies();
  const userId = cookieStore.get("doit-user-id")?.value ?? null;
  const user = userId ? await getUserById(userId).catch(() => null) : null;

  return (
    <main className="page-wrapper space-y-5 ">
      <VerifyEmail user={user} />
      <ChangePassword />
    </main>
  );
};

export default SecurityPage;
