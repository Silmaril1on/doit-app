"use server";

import { supabaseAdmin } from "@/app/[locale]/lib/supabase/supabaseServer";
import { unstable_cache } from "next/cache";

const TABLE = "objectives";
const cacheTag = (userId) => `country-stats-${userId}`;

// ─── internal fetcher ────────────────────────────────────────────────────────

const PRIORITY_KEYS = ["low", "medium", "high"];

async function fetchCountryStats(userId) {
  if (!userId) throw new Error("userId is required");

  const { data, error } = await supabaseAdmin
    .from(TABLE)
    .select("country, status, priority")
    .eq("user_id", userId)
    .not("country", "is", null)
    .neq("country", "");

  if (error) throw new Error(error.message);

  // Aggregate per country
  const map = new Map();
  for (const row of data ?? []) {
    const country = String(row.country).trim();
    if (!country) continue;
    if (!map.has(country))
      map.set(country, {
        country,
        objectives: 0,
        achievements: 0,
        objectives_priority: { low: 0, medium: 0, high: 0 },
        achievements_priority: { low: 0, medium: 0, high: 0 },
      });
    const entry = map.get(country);
    const priority = PRIORITY_KEYS.includes(row.priority)
      ? row.priority
      : "medium";

    if (row.status === "todo") {
      entry.objectives += 1;
      entry.objectives_priority[priority] += 1;
    } else if (row.status === "completed") {
      entry.achievements += 1;
      entry.achievements_priority[priority] += 1;
    }
  }

  return [...map.values()].sort(
    (a, b) => b.objectives + b.achievements - (a.objectives + a.achievements),
  );
}

// ─── cached — top 6 ──────────────────────────────────────────────────────────

export async function getTopCountryStats(userId) {
  if (!userId) return [];

  const cached = unstable_cache(
    () => fetchCountryStats(userId),
    [`country-stats-top-${userId}`],
    { tags: [cacheTag(userId)], revalidate: 60 },
  );

  const all = await cached();
  return { top: all.slice(0, 6), hasMore: all.length > 6 };
}

// ─── all countries (used by client modal) ────────────────────────────────────

export async function getAllCountryStats(userId) {
  if (!userId) return [];
  return fetchCountryStats(userId);
}
