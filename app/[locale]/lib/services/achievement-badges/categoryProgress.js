"use server";

import { supabaseAdmin } from "@/app/[locale]/lib/supabase/supabaseServer";
import { unstable_cache } from "next/cache";
import {
  TASK_CATEGORIES,
  VALID_CATEGORY_IDS,
  CATEGORY_ACHIEVEMENT_TIERS,
  resolveCurrentLevel,
  getTierByLevel,
  badgesCacheTag,
} from "@/app/[locale]/lib/local-bd/categoryTypesData";
import { createNewBadgeNotification } from "@/app/[locale]/lib/services/notifications/notificationsTypes";
import { getUserById } from "@/app/[locale]/lib/services/user/userProfiles";

const PROGRESS_TABLE = "user_category_progress";

// ─── helpers ────────────────────────────────────────────────────────────────

const parseCategoryId = (raw) => {
  const id = Number(raw);
  if (!Number.isInteger(id) || !VALID_CATEGORY_IDS.has(id)) return null;
  return id;
};

// ─── public API ─────────────────────────────────────────────────────────────

/**
 * Returns all category progress rows for the user, enriched with tier metadata.
 * Missing categories (never touched by user) are returned with zeroed defaults.
 */
export async function getAllCategoryProgress(userId) {
  if (!userId) throw new Error("userId is required");

  const { data, error } = await supabaseAdmin
    .from(PROGRESS_TABLE)
    .select("*")
    .eq("user_id", userId);

  if (error) throw new Error(error.message);

  const progressMap = new Map(
    (data ?? []).map((row) => [row.category_id, row]),
  );

  return TASK_CATEGORIES.map((category) => {
    const row = progressMap.get(category.id);
    const completedCount = row?.completed_count ?? 0;
    const currentLevel = row?.current_level ?? 0;
    const nextTier =
      (CATEGORY_ACHIEVEMENT_TIERS[category.id] ?? []).find(
        (t) => t.required_count > completedCount,
      ) ?? null;

    return {
      category_id: category.id,
      category_label: category.label,
      category_icon: category.icon,
      completed_count: completedCount,
      current_level: currentLevel,
      current_tier:
        currentLevel > 0 ? getTierByLevel(category.id, currentLevel) : null,
      next_tier: nextTier,
      last_completed_at: row?.last_completed_at ?? null,
    };
  });
}

/**
 * Called after a task with a known category_id is marked completed.
 * Upserts the progress row, increments completed_count, and updates
 * current_level if a new tier threshold has been crossed.
 *
 * Returns { progress, newTier } where newTier is non-null when a badge
 * was just earned.
 */
export async function recordCategoryCompletion(userId, rawCategoryId) {
  if (!userId) throw new Error("userId is required");

  const categoryId = parseCategoryId(rawCategoryId);
  if (!categoryId) return { progress: null, newTier: null };

  // Fetch existing row (may not exist yet)
  const { data: existing, error: fetchError } = await supabaseAdmin
    .from(PROGRESS_TABLE)
    .select("*")
    .eq("user_id", userId)
    .eq("category_id", categoryId)
    .maybeSingle();

  if (fetchError) throw new Error(fetchError.message);

  const prevCount = existing?.completed_count ?? 0;
  const prevLevel = existing?.current_level ?? 0;
  const newCount = prevCount + 1;
  const newLevel = resolveCurrentLevel(categoryId, newCount);
  const tierEarned =
    newLevel > prevLevel ? getTierByLevel(categoryId, newLevel) : null;

  const now = new Date().toISOString();

  const upsertPayload = {
    user_id: userId,
    category_id: categoryId,
    completed_count: newCount,
    current_level: newLevel,
    last_completed_at: now,
    updated_at: now,
  };

  const { data: upserted, error: upsertError } = await supabaseAdmin
    .from(PROGRESS_TABLE)
    .upsert(upsertPayload, { onConflict: "user_id,category_id" })
    .select("*")
    .single();

  if (upsertError) throw new Error(upsertError.message);

  // Fire badge notification — failure must never break the main flow.
  if (tierEarned) {
    const category = TASK_CATEGORIES.find((c) => c.id === categoryId);
    try {
      const user = await getUserById(userId);
      const displayName = user?.display_name ?? user?.first_name ?? "User";
      await createNewBadgeNotification(
        userId,
        displayName,
        tierEarned.title,
        category?.label ?? "Unknown",
        tierEarned.level,
      );
    } catch {
      // Notification failure must never break badge progress recording.
    }
  }

  return { progress: upserted, newTier: tierEarned };
}

/**
 * SSR-safe, per-user cached version of getAllCategoryProgress.
 * Cache is valid for 30 minutes and is busted immediately whenever
 * the user completes a task (via revalidateTag in myActiveQuests).
 */
export async function getUserEarnedBadges(userId) {
  if (!userId) return Promise.resolve([]);
  return unstable_cache(
    () => getAllCategoryProgress(userId),
    [badgesCacheTag(userId)],
    { revalidate: 1800, tags: [badgesCacheTag(userId)] },
  )();
}

export async function revokeCategoryCompletion(userId, rawCategoryId) {
  if (!userId) throw new Error("userId is required");

  const categoryId = parseCategoryId(rawCategoryId);
  if (!categoryId) return null;

  const { data: existing, error: fetchError } = await supabaseAdmin
    .from(PROGRESS_TABLE)
    .select("*")
    .eq("user_id", userId)
    .eq("category_id", categoryId)
    .maybeSingle();

  if (fetchError) throw new Error(fetchError.message);
  if (!existing || existing.completed_count <= 0) return null;

  const newCount = existing.completed_count - 1;
  const newLevel = resolveCurrentLevel(categoryId, newCount);

  const { data: updated, error: updateError } = await supabaseAdmin
    .from(PROGRESS_TABLE)
    .update({
      completed_count: newCount,
      current_level: newLevel,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", userId)
    .eq("category_id", categoryId)
    .select("*")
    .single();

  if (updateError) throw new Error(updateError.message);
  return updated;
}
