import React from "react";

const StatisticsLayout = ({ questStatsSlug, countryTasksSlug }) => {
  return (
    <div className="page-wrapper space-y-4">
      {countryTasksSlug}
      {questStatsSlug}
    </div>
  );
};

export default StatisticsLayout;
