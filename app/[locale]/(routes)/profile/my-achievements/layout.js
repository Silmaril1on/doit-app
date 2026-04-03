import React from "react";

const MyAchievementsLayout = ({
  badgesSlug,
  countryTasksSlug,
  levelBadgesSlug,
}) => {
  return (
    <div className="p-3 space-y-4">
      {badgesSlug}
      {countryTasksSlug}
      {levelBadgesSlug}
    </div>
  );
};

export default MyAchievementsLayout;
