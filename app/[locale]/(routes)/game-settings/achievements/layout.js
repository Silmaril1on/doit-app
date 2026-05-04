import React from "react";

const MyAchievementsLayout = ({
  badgesSlug,
  levelBadgesSlug,
  locationStatSlug,
}) => {
  return (
    <div className=" page-wrapper space-y-4">
      {badgesSlug}
      {locationStatSlug}
      {levelBadgesSlug}
    </div>
  );
};

export default MyAchievementsLayout;
