"use client";
import { LEVEL_TIERS } from "@/app/[locale]/lib/local-bd/levelProgressData";
import BadgeGrid from "../components/BadgeGrid";

const LevelBadges = ({ currentLevel = 0 }) => {
  // Transform LEVEL_TIERS to match expected shape: {level/threshold, title/name, reqCount/threshold}
  const tiersData = LEVEL_TIERS.map((tier) => ({
    threshold: tier.threshold,
    title: tier.name,
    reqCount: tier.threshold,
  }));

  return (
    <BadgeGrid
      title="Level Badges"
      subtitle="Earn badges by reaching level milestones"
      tiersData={tiersData}
      currentProgress={currentLevel}
      type="level"
    />
  );
};

export default LevelBadges;
