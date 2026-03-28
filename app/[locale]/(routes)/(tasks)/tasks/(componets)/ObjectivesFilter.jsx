import FilterGroup from "@/app/[locale]/components/filters/FilterBar";
import { buildObjectivesFilterConfig } from "@/app/[locale]/lib/utils/filterConfig";

// objectives      — full list of objectives (for building option counts)
// filters         — { country: string[], city: string[], priority: string[] }
// onFiltersChange — (key, values) => void
// onReset         — () => void

const ObjectivesFilter = ({ objectives = [], filters, onFiltersChange, onReset }) => {
  const configs = buildObjectivesFilterConfig(objectives);

  return (
    <FilterGroup
      configs={configs}
      values={filters}
      onChange={onFiltersChange}
      onReset={onReset}
    />
  );
};

export default ObjectivesFilter;
