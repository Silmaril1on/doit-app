import React from "react";

const MyAchievementsLayout = ({ badgesSlug, levelBadgesSlug }) => {
  return (
    <div className=" page-wrapper space-y-4">
      {badgesSlug}
      {levelBadgesSlug}
    </div>
  );
};

export default MyAchievementsLayout;
