export const XP_PER_LEVEL = 250;

export const BADGE_MILESTONE_COUNT = 5;
export const BADGE_MILESTONE_XP = 50;

export const PRIORITY_XP = {
  low: 20,
  medium: 50,
  high: 130,
};

export const resolveXpState = (totalXp) => {
  const xp = Math.max(0, totalXp ?? 0);
  return {
    total_xp: xp,
    current_level: Math.floor(xp / XP_PER_LEVEL) + 1,
    xp_in_current_level: xp % XP_PER_LEVEL,
  };
};
