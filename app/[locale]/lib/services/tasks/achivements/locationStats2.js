"use server";

import { supabaseAdmin } from "@/app/[locale]/lib/supabase/supabaseServer";
import { unstable_cache } from "next/cache";
import {
  getContinentProgress,
  TOTAL_COUNTRIES,
  TOTAL_CITIES,
  TOTAL_CONTINENTS,
} from "@/app/[locale]/lib/utils/countryUtils";

const CACHE_TTL = 600; // 10 minutes

async function fetchLocationStats(userId) {
  const { data, error } = await supabaseAdmin
    .from("objectives")
    .select("country, city")
    .eq("user_id", userId)
    .eq("status", "completed")
    .not("country", "is", null);

  if (error) throw new Error(error.message);

  const rows = data ?? [];

  const countrySet = new Set();
  const citySet = new Set();

  for (const row of rows) {
    const country = (row.country ?? "").trim();
    const city = (row.city ?? "").trim();
    if (country) countrySet.add(country);
    if (city) citySet.add(city);
  }

  const continentProgress = getContinentProgress([...countrySet]);
  const unlockedCount = continentProgress.filter((c) => c.unlocked).length;

  return {
    countries: {
      visited: countrySet.size,
      total: TOTAL_COUNTRIES,
      list: [...countrySet].sort(),
    },
    cities: {
      visited: citySet.size,
      total: TOTAL_CITIES,
      list: [...citySet].sort(),
    },
    continents: {
      visited: unlockedCount,
      total: TOTAL_CONTINENTS,
      progress: continentProgress,
    },
  };
}

export function getLocationStats(userId) {
  if (!userId) return Promise.resolve(null);

  return unstable_cache(
    () => fetchLocationStats(userId),
    [`location-stats-${userId}`],
    {
      revalidate: CACHE_TTL,
      tags: [`location-stats-${userId}`],
    },
  )();
}

/** Cache tag for live revalidation from PATCH/complete task flows. */
export const locationStatsCacheTag = (userId) => `location-stats-${userId}`;
