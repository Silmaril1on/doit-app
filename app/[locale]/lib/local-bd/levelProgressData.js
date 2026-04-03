// Level badge tiers — mirrors the leveling system.
// Each tier is earned once current_level reaches its threshold and stays earned.
// Sorted ascending by threshold.
export const LEVEL_TIERS = [
  { threshold: 5, name: "Bronze", icon: null },
  { threshold: 10, name: "Silver", icon: null },
  { threshold: 15, name: "Gold", icon: null },
  { threshold: 20, name: "Platinum", icon: null },
  { threshold: 25, name: "Diamond", icon: null },
  { threshold: 30, name: "Legend", icon: null },
];

/**
 * Returns all tiers the user has earned based on their current level.
 * e.g. currentLevel = 17 → [Bronze, Silver, Gold]
 */
export function getEarnedTiers(currentLevel) {
  return LEVEL_TIERS.filter((t) => currentLevel >= t.threshold);
}

/**
 * Returns the single highest tier the user has reached, or null if none.
 * e.g. currentLevel = 17 → Gold
 */
export function getHighestTier(currentLevel) {
  return (
    [...LEVEL_TIERS].reverse().find((t) => currentLevel >= t.threshold) ?? null
  );
}

/**
 * Returns the next upcoming tier, or null if the user has reached Legend.
 */
export function getNextTier(currentLevel) {
  return LEVEL_TIERS.find((t) => currentLevel < t.threshold) ?? null;
}
