/**
 * Production-grade caching layer for profile pages.
 *
 * Architecture:
 * - stable cache functions (defined once)
 * - argument-based cache keys
 * - granular TTLs
 * - proper static tags
 * - isolated fallbacks
 * - timing instrumentation
 *
 * IMPORTANT:
 * Use revalidateTag() AFTER mutations:
 *
 * Profile edit:
 *   revalidateTag("profile-user")
 *
 * XP changes:
 *   revalidateTag("profile-xp")
 *
 * Friend add/remove:
 *   revalidateTag("profile-friends")
 *
 * Objective updates:
 *   revalidateTag("profile-stats")
 *
 * Badge unlock:
 *   revalidateTag("profile-badges")
 */

import { unstable_cache } from "next/cache";

import { getUserByDisplayName } from "@/app/[locale]/lib/services/user/userProfiles";
import { getUserXp } from "@/app/[locale]/lib/services/xp/xpProgress";
import { getFriendsCountByUserId } from "@/app/[locale]/lib/services/user/friendships";
import { getObjectiveStatsByUserId } from "@/app/[locale]/lib/services/tasks/objectives/myObjectives";
import { getAllCategoryProgress } from "@/app/[locale]/lib/services/achievement-badges/categoryProgress";

function timed(label, fn) {
  return async (...args) => {
    const start = performance.now();

    try {
      const result = await fn(...args);

      if (process.env.NODE_ENV === "development") {
        const ms = (performance.now() - start).toFixed(1);

        console.log(`[profile] ✓ ${label} ${ms}ms`);
      }

      return result;
    } catch (err) {
      if (process.env.NODE_ENV === "development") {
        const ms = (performance.now() - start).toFixed(1);

        console.error(
          `[profile] ✗ ${label} ${ms}ms — ${err?.message || "unknown error"}`,
        );
      }

      throw err;
    }
  };
}

// ─────────────────────────────────────────────────────────────
// USER PROFILE (1 hour)
// ─────────────────────────────────────────────────────────────

const _getCachedUser = unstable_cache(
  timed("getUserByDisplayName", async (displayName) => {
    return await getUserByDisplayName(displayName);
  }),
  ["profile-user"],
  {
    revalidate: 3600,
    tags: ["profile-user"],
  },
);

export const getCachedUser = async (displayName) => {
  return await _getCachedUser(displayName);
};

// ─────────────────────────────────────────────────────────────
// XP / LEVEL (5 minutes)
// ─────────────────────────────────────────────────────────────

const _getCachedXp = unstable_cache(
  timed("getUserXp", async (userId) => {
    return await getUserXp(userId).catch(() => ({
      total_xp: 0,
      current_level: 1,
    }));
  }),
  ["profile-xp"],
  {
    revalidate: 300,
    tags: ["profile-xp"],
  },
);

export const getCachedXp = async (userId) => {
  return await _getCachedXp(userId);
};

// ─────────────────────────────────────────────────────────────
// FRIENDS COUNT (10 minutes)
// ─────────────────────────────────────────────────────────────

const _getCachedFriendsCount = unstable_cache(
  timed("getFriendsCountByUserId", async (userId) => {
    return await getFriendsCountByUserId(userId).catch(() => 0);
  }),
  ["profile-friends"],
  {
    revalidate: 600,
    tags: ["profile-friends"],
  },
);

export const getCachedFriendsCount = async (userId) => {
  return await _getCachedFriendsCount(userId);
};

// ─────────────────────────────────────────────────────────────
// OBJECTIVE STATS (15 minutes)
// ─────────────────────────────────────────────────────────────

const _getCachedObjectiveStats = unstable_cache(
  timed("getObjectiveStatsByUserId", async (userId) => {
    return await getObjectiveStatsByUserId(userId).catch(() => ({
      byStatus: {},
      byPriority: {},
      total: 0,
    }));
  }),
  ["profile-stats"],
  {
    revalidate: 900,
    tags: ["profile-stats"],
  },
);

export const getCachedObjectiveStats = async (userId) => {
  return await _getCachedObjectiveStats(userId);
};

// ─────────────────────────────────────────────────────────────
// BADGE PROGRESS (30 minutes)
// ─────────────────────────────────────────────────────────────

const _getCachedBadgeProgress = unstable_cache(
  timed("getAllCategoryProgress", async (userId) => {
    return await getAllCategoryProgress(userId).catch(() => []);
  }),
  ["profile-badges"],
  {
    revalidate: 1800,
    tags: ["profile-badges"],
  },
);

export const getCachedBadgeProgress = async (userId) => {
  return await _getCachedBadgeProgress(userId);
};
