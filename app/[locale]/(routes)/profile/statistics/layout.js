import React from "react";

const StatisticsLayout = ({ questStatsSlug, countryTasksSlug }) => {
  return (
    <div className="p-3 space-y-4">
      {countryTasksSlug}
      {questStatsSlug}
    </div>
  );
};

export default StatisticsLayout;
