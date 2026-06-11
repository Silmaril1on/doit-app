/**
 * ProfileAnalytics — deferred server component.
 *
 * Rendered inside a <Suspense> boundary in page.jsx so it streams AFTER
 * the profile header appears. Slow DB queries here never block first paint.
 */

import {
  getCachedObjectiveStats,
  getCachedBadgeProgress,
} from "./profileCache";
import { BadgesSection, Stats } from "./ProfileSections";

const ProfileAnalytics = async ({ userId, xp }) => {
  const pageStart = performance.now();

  const [objectiveStats, badgeProgress] = await Promise.all([
    getCachedObjectiveStats(userId),
    getCachedBadgeProgress(userId),
  ]);

  console.log(
    `[profile] analytics total ${(performance.now() - pageStart).toFixed(1)}ms`,
  );

  return (
    <>
      <BadgesSection badgeProgress={badgeProgress} xp={xp} />
      <Stats objectiveStats={objectiveStats} />
    </>
  );
};

export default ProfileAnalytics;
