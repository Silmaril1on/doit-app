"use server";

import { supabaseAdmin } from "@/app/[locale]/lib/supabase/supabaseServer";
import { unstable_cache } from "next/cache";

const TABLE = "objectives";
const cacheTag = (userId) => `quest-stats-${userId}`;

async function fetchQuestStats(userId) {
  if (!userId) throw new Error("userId is required");

  const { data, error } = await supabaseAdmin
    .from(TABLE)
    .select("status, priority, task_category")
    .eq("user_id", userId);

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getQuestStats(userId) {
  if (!userId) return [];

  const cached = unstable_cache(
    () => fetchQuestStats(userId),
    [`quest-stats-${userId}`],
    { tags: [cacheTag(userId)], revalidate: 60 },
  );

  return cached();
}
