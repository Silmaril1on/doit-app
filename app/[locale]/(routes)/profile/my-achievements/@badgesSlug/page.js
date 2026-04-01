import React from "react";
import { cookies } from "next/headers";
import {
  TASK_CATEGORIES,
  CATEGORY_ACHIEVEMENT_TIERS,
} from "@/app/[locale]/lib/local-bd/categoryTypesData";
import { getUserEarnedBadges } from "@/app/[locale]/lib/services/achievement-badges/categoryProgress";

const BadgesSlug = async () => {
  const cookieStore = await cookies();
  const userId = cookieStore.get("doit-user-id")?.value ?? null;

  const progressList = userId
    ? await getUserEarnedBadges(userId).catch(() => [])
    : [];

  // Build a quick lookup: categoryId → current_level
  const levelMap = new Map(
    progressList.map((p) => [p.category_id, p.current_level ?? 0]),
  );

  return (
    <div className="space-y-8 p-4">
      {TASK_CATEGORIES.map((category) => {
        const tiers = CATEGORY_ACHIEVEMENT_TIERS[category.id] ?? [];
        const currentLevel = levelMap.get(category.id) ?? 0;

        return (
          <div key={category.id}>
            {/* Category header */}
            <div className="mb-4">
              <h2 className="text-lg font-bold uppercase tracking-widest text-teal-400">
                {category.label}
              </h2>
              <p className="text-xs text-chino/70 secondary">
                {category.description}
              </p>
            </div>

            {/* Badge cards */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6">
              {tiers.map((tier) => {
                const earned = tier.level <= currentLevel;

                return (
                  <div
                    key={tier.level}
                    className={`flex flex-col items-center gap-2 rounded-xl border p-4 text-center transition-opacity duration-300 ${
                      earned
                        ? "opacity-100 border-teal-500/40 bg-teal-500/10"
                        : "opacity-60 border-teal-500/20 bg-black/40"
                    }`}
                  >
                    {/* Badge image placeholder */}
                    <div
                      className={`h-12 w-12 rounded-full border flex items-center justify-center shrink-0 ${
                        earned
                          ? "bg-teal-500 border-teal-400"
                          : "bg-teal-500/20 border-teal-500/40"
                      }`}
                    >
                      <span
                        className={`text-xs font-bold ${
                          earned ? "text-black" : "text-teal-400"
                        }`}
                      >
                        {tier.level}
                      </span>
                    </div>

                    {/* Title */}
                    <p className="text-sm font-semibold text-cream leading-tight">
                      {tier.title}
                    </p>

                    {/* Requirement */}
                    <p className="text-[10px] secondary text-chino/60 leading-tight">
                      {earned
                        ? `Unlocked at ${tier.required_count} objectives`
                        : `Complete ${tier.required_count} objectives to unlock this badge`}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default BadgesSlug;
