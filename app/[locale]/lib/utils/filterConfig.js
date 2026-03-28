// ─── Static configs ───────────────────────────────────────────────────────────

export const PRIORITY_OPTIONS = [
  { label: "Low", value: "low" },
  { label: "Medium", value: "medium" },
  { label: "High", value: "high" },
];

export const EMPTY_FILTERS = { country: [], city: [], priority: [] };

// Fields used when searching through objectives.
// Array fields like `subtasks` are joined before matching — see searchItems().
export const OBJECTIVE_SEARCH_FIELDS = [
  "task_title",
  "task_description",
  "task_category",
  "country",
  "city",
  "priority",
  "status",
  "subtasks",
];

// ─── Filter config builders ───────────────────────────────────────────────────

const uniqueValues = (items, key) =>
  [...new Set(items.map((o) => o[key]).filter(Boolean))];

/**
 * Builds the FilterGroup config array for objectives.
 * Country/city sections are omitted when no data exists for them.
 */
export const buildObjectivesFilterConfig = (objectives = []) => {
  const configs = [];

  const countries = uniqueValues(objectives, "country");
  if (countries.length > 0) {
    configs.push({
      key: "country",
      label: "Country",
      options: countries.map((v) => ({
        label: { flag: { country: v }, text: v },
        value: v,
        count: objectives.filter((o) => o.country === v).length,
      })),
    });
  }

  const cities = uniqueValues(objectives, "city");
  if (cities.length > 0) {
    configs.push({
      key: "city",
      label: "City",
      options: cities.map((v) => ({
        label: { flag: { city: v }, text: v },
        value: v,
        count: objectives.filter((o) => o.city === v).length,
      })),
    });
  }

  configs.push({
    key: "priority",
    label: "Priority",
    options: PRIORITY_OPTIONS.map((opt) => ({
      ...opt,
      count: objectives.filter(
        (o) => (o.priority || "medium") === opt.value,
      ).length,
    })),
  });

  return configs;
};

// ─── Filter / search logic ────────────────────────────────────────────────────

/**
 * Applies multi-key checkbox filters to a list of objectives.
 * An empty array for any key means "no restriction on that key".
 */
export const applyObjectivesFilters = (objectives = [], filters = {}) =>
  objectives.filter((o) => {
    const countryMatch =
      !filters.country?.length || filters.country.includes(o.country);
    const cityMatch =
      !filters.city?.length || filters.city.includes(o.city);
    const priorityMatch =
      !filters.priority?.length ||
      filters.priority.includes(o.priority || "medium");
    return countryMatch && cityMatch && priorityMatch;
  });

/**
 * Generic full-text search. Checks whether any of the given `fields` on each
 * item contain the search `query` (case-insensitive).
 * Array fields (e.g. subtasks) are joined into a single string before matching.
 *
 * @param {object[]} items   - Array of objects to search
 * @param {string}   query   - Search string entered by the user
 * @param {string[]} fields  - Object keys to match against
 * @returns {object[]}       - Filtered subset of `items`
 */
export const searchItems = (items = [], query = "", fields = []) => {
  const q = query.trim().toLowerCase();
  if (!q) return items;
  return items.filter((item) =>
    fields.some((field) => {
      const val = item[field];
      const str = Array.isArray(val)
        ? val.join(" ")
        : String(val ?? "");
      return str.toLowerCase().includes(q);
    }),
  );
};
