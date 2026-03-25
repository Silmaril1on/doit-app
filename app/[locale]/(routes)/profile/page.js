"use client";

import { selectCurrentUser } from "@/app/[locale]/lib/features/userSlice";
import { useSelector } from "react-redux";

const ProfilePage = () => {
  const user = useSelector(selectCurrentUser);

  return (
    <main className="min-h-screen bg-black px-4 py-10 text-white">
      <section className="mx-auto max-w-3xl rounded-lg border border-teal-500/20 bg-stone-900 p-6">
        <p className="secondary text-sm uppercase tracking-[0.22em] text-teal-300/75">
          My Profile
        </p>
        <h1 className="primary mt-3 text-5xl uppercase leading-none text-teal-500">
          Profile
        </h1>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg border border-teal-500/15 bg-black/50 p-4">
            <p className="secondary text-xs uppercase tracking-[0.2em] text-chino/60">
              Display Name
            </p>
            <p className="secondary mt-2 text-lg text-white">
              {user?.display_name || "-"}
            </p>
          </div>

          <div className="rounded-lg border border-teal-500/15 bg-black/50 p-4">
            <p className="secondary text-xs uppercase tracking-[0.2em] text-chino/60">
              Email
            </p>
            <p className="secondary mt-2 text-lg text-white">
              {user?.email || "-"}
            </p>
          </div>
        </div>
      </section>
    </main>
  );
};

export default ProfilePage;
