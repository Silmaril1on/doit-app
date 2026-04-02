export const TASK_CATEGORIES = [
  {
    id: 1,
    label: "Exploration",
    description:
      "Uncover hidden streets, ancient landmarks, and the stories carved into every city's walls.",
    icon: "compass",
  },
  {
    id: 2,
    label: "Culinary",
    description:
      "Taste your way through local markets, hidden restaurants, and street food gems.",
    icon: "utensils",
  },
  {
    id: 3,
    label: "Nightlife",
    description:
      "From rooftop bars to basement clubs — find the beat and own every night.",
    icon: "moon",
  },
  {
    id: 4,
    label: "Experiences",
    description:
      "Recreate iconic viral moments and capture the magic of every place through your own lens.",
    icon: "star",
  },
  {
    id: 5,
    label: "Shopping",
    description:
      "Hunt down local designers, vintage finds, and the trends that locals actually wear.",
    icon: "shopping-bag",
  },
];

// Set of valid category IDs for O(1) validation on the server.
export const VALID_CATEGORY_IDS = new Set(TASK_CATEGORIES.map((c) => c.id));

// Achievement tiers per category — mirrors category_achievement_tiers table.
// Sorted ascending by required_count.
export const CATEGORY_ACHIEVEMENT_TIERS = {
  1: [
    { level: 1, title: "Wanderer", required_count: 5 },
    { level: 2, title: "Explorer", required_count: 10 },
    { level: 3, title: "Adventurer", required_count: 20 },
    { level: 4, title: "Pathfinder", required_count: 40 },
    { level: 5, title: "World Seeker", required_count: 75 },
    { level: 6, title: "Legendary Nomad", required_count: 150 },
  ],
  2: [
    { level: 1, title: "Taster", required_count: 5 },
    { level: 2, title: "Foodie", required_count: 10 },
    { level: 3, title: "Flavor Hunter", required_count: 20 },
    { level: 4, title: "Gourmet Explorer", required_count: 40 },
    { level: 5, title: "Master of Taste", required_count: 75 },
    { level: 6, title: "Culinary Legend", required_count: 150 },
  ],
  3: [
    { level: 1, title: "Rookie Raver", required_count: 5 },
    { level: 2, title: "Night Explorer", required_count: 10 },
    { level: 3, title: "Party Seeker", required_count: 20 },
    { level: 4, title: "Night Conqueror", required_count: 40 },
    { level: 5, title: "Afterdark Elite", required_count: 75 },
    { level: 6, title: "Nightlife Legend", required_count: 150 },
  ],
  4: [
    { level: 1, title: "Moments Collector", required_count: 5 },
    { level: 2, title: "Memory Maker", required_count: 10 },
    { level: 3, title: "Experience Seeker", required_count: 20 },
    { level: 4, title: "Life Explorer", required_count: 40 },
    { level: 5, title: "Story Creator", required_count: 75 },
    { level: 6, title: "Legend of Moments", required_count: 150 },
  ],
  5: [
    { level: 1, title: "Browser", required_count: 5 },
    { level: 2, title: "Trend Seeker", required_count: 10 },
    { level: 3, title: "Style Hunter", required_count: 20 },
    { level: 4, title: "Lifestyle Curator", required_count: 40 },
    { level: 5, title: "Trend Authority", required_count: 75 },
    { level: 6, title: "Icon of Taste", required_count: 150 },
  ],
};

/**
 * Given a completed_count, returns the highest achieved level (0 if none).
 * Pure utility — safe to call on client or server.
 */
export function resolveCurrentLevel(categoryId, completedCount) {
  const tiers = CATEGORY_ACHIEVEMENT_TIERS[categoryId] ?? [];
  let level = 0;
  for (const tier of tiers) {
    if (completedCount >= tier.required_count) {
      level = tier.level;
    }
  }
  return level;
}

/**
 * Returns tier metadata for the given level, or null.
 */
export function getTierByLevel(categoryId, level) {
  const tiers = CATEGORY_ACHIEVEMENT_TIERS[categoryId] ?? [];
  return tiers.find((t) => t.level === level) ?? null;
}

// Cache tag scoped to a specific user — safe to import on client or server.
export const badgesCacheTag = (userId) => `user-badges-${userId}`;
