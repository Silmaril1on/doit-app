"use client";
import { motion } from "framer-motion";
import ItemCard from "@/app/[locale]/components/container/ItemCard";
import { LEVEL_TIERS } from "@/app/[locale]/lib/local-bd/levelProgressData";
import SectionHeadline from "@/app/[locale]/components/elements/SectionHeadline";

const LevelBadges = ({ currentLevel = 0 }) => {
  const earnedCount = LEVEL_TIERS.filter(
    (t) => currentLevel >= t.threshold,
  ).length;

  return (
    <ItemCard className="space-y-2">
      <div className="mb-2">
        <SectionHeadline
          title="Level Badges"
          subtitle={`Earn badges by reaching level milestones - ${earnedCount} badge${earnedCount !== 1 ? "s" : ""} acquired`}
        />
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {LEVEL_TIERS.map((tier, index) => {
          const earned = currentLevel >= tier.threshold;
          return (
            <motion.div
              key={tier.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: index * 0.08,
                duration: 0.3,
                ease: [0.22, 1, 0.36, 1],
              }}
              className={`flex flex-col items-center gap-4 rounded-xl border p-4 text-center ${
                earned
                  ? "border-teal-500/40 bg-teal-500/10"
                  : "opacity-50 border-teal-500/20 bg-black/40"
              }`}
            >
              {/* Badge level circle */}
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
                  {tier.threshold}
                </span>
              </div>

              <div>
                <p className="font-semibold text-cream leading-tight">
                  {tier.name}
                </p>
                <p className="text-[10px] secondary text-chino/60 leading-tight">
                  {earned
                    ? `Unlocked at level ${tier.threshold}`
                    : `Reach level ${tier.threshold} to unlock`}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </ItemCard>
  );
};

export default LevelBadges;
