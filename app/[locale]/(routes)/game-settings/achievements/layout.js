import React from "react";

const MyAchievementsLayout = ({
  badgesSlug,
  countryTasksSlug,
  levelBadgesSlug,
}) => {
  return (
    <div className="  page-wrapper space-y-4">
      {badgesSlug}
      {countryTasksSlug}
      {levelBadgesSlug}
    </div>
  );
};

export default MyAchievementsLayout;
