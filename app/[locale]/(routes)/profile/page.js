"use client";

import { selectCurrentUser } from "@/app/[locale]/lib/features/userSlice";
import { useSelector } from "react-redux";
import Button from "@/app/[locale]/components/buttons/Button";
import { useParams } from "next/navigation";

const ProfilePage = () => {
  const user = useSelector(selectCurrentUser);
  const params = useParams();
  const locale = typeof params?.locale === "string" ? params.locale : "en";

  return (
    <main className="min-h-screen bg-black px-3 py-6 sm:px-4 sm:py-10 text-white">
      <section className="mx-auto max-w-3xl rounded-lg border border-teal-500/20 bg-stone-900 p-4 sm:p-6">
        <p className="secondary text-xs sm:text-sm uppercase tracking-[0.22em] text-teal-300/75">
          My Profile
        </p>
        <h1 className="primary mt-2 text-3xl sm:text-5xl uppercase leading-none text-teal-500">
          Profile
        </h1>

        <div className="mt-6 sm:mt-8 grid gap-3 sm:gap-4 sm:grid-cols-2">
          <div className="rounded-lg border border-teal-500/15 bg-black/50 p-4">
            <p className="secondary text-xs uppercase tracking-[0.2em] text-chino/60">
              Display Name
            </p>
            <p className="secondary mt-2 text-base sm:text-lg text-white">
              {user?.display_name || "-"}
            </p>
          </div>

          <div className="rounded-lg border border-teal-500/15 bg-black/50 p-4">
            <p className="secondary text-xs uppercase tracking-[0.2em] text-chino/60">
              Email
            </p>
            <p className="secondary mt-2 text-base sm:text-lg text-white break-all">
              {user?.email || "-"}
            </p>
          </div>
        </div>

        <div className="mt-5 flex flex-col sm:flex-row gap-3">
          <Button
            text="Basic Information"
            href={`/${locale}/profile/basic-information`}
            className="w-full sm:w-auto py-2.5"
          />
          <Button
            text="Security"
            variant="outline"
            href={`/${locale}/profile/security`}
            className="w-full sm:w-auto py-2.5"
          />
        </div>
      </section>
    </main>
  );
};

export default ProfilePage;

