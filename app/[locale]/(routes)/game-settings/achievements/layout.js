import React, { Suspense } from "react";

const SlotSkeleton = () => (
  <div className="rounded-xl border border-primary/10 bg-black/20 p-4 animate-pulse h-40" />
);

const MyAchievementsLayout = ({
  badgesSlug,
  levelBadgesSlug,
  locationStatSlug,
}) => {
  return (
    <div className=" page-wrapper space-y-4">
      <Suspense fallback={<SlotSkeleton />}>{badgesSlug}</Suspense>
      <Suspense fallback={<SlotSkeleton />}>{locationStatSlug}</Suspense>
      <Suspense fallback={<SlotSkeleton />}>{levelBadgesSlug}</Suspense>
    </div>
  );
};

export default MyAchievementsLayout;
