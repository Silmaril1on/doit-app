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
import { getUserById } from "@/app/[locale]/lib/services/user/userProfiles";
import { insertFeedEvent } from "@/app/[locale]/lib/services/tasks/feed/feedEvents";

const PROGRESS_TABLE = "user_category_progress";

// ─── helpers ────────────────────────────────────────────────────────────────

const parseCategoryId = (raw) => {
  const id = Number(raw);
  if (!Number.isInteger(id) || !VALID_CATEGORY_IDS.has(id)) return null;
  return id;
};

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
      has_seen: row?.has_seen ?? true,
      current_tier:
        currentLevel > 0 ? getTierByLevel(category.id, currentLevel) : null,
      next_tier: nextTier,
      created_at: row?.created_at ?? null,
    };
  });
}

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
    updated_at: now,
    // Reset has_seen whenever the user earns a new badge level
    ...(tierEarned ? { has_seen: false } : {}),
  };

  const { data: upserted, error: upsertError } = await supabaseAdmin
    .from(PROGRESS_TABLE)
    .upsert(upsertPayload, { onConflict: "user_id,category_id" })
    .select("*")
    .single();

  if (upsertError) throw new Error(upsertError.message);

  // Count total badges across all categories for milestone check.
  let totalBadges = null;
  if (tierEarned) {
    const { data: allProgress } = await supabaseAdmin
      .from(PROGRESS_TABLE)
      .select("current_level")
      .eq("user_id", userId);
    totalBadges = (allProgress ?? []).reduce(
      (sum, r) => sum + (r.current_level ?? 0),
      0,
    );
  }

  // Fire badge notification + feed event — failure must never break the main flow.
  if (tierEarned) {
    const category = TASK_CATEGORIES.find((c) => c.id === categoryId);
    try {
      const user = await getUserById(userId);
      const displayName = user?.display_name ?? user?.first_name ?? "User";
      await supabaseAdmin.from("notifications").insert({
        user_id: userId,
        status: "New Badge",
        message: `You've unlocked the "${tierEarned.title}" badge (Level ${tierEarned.level}) in ${category?.label ?? "Unknown"}! Keep going to reach the next tier. `,
        priority: "low",
        display_name: displayName,
        has_read: false,
      });
    } catch {
      // Notification failure must never break badge progress recording.
    }
    insertFeedEvent(userId, "badge", {
      badge_title: tierEarned.title,
      badge_level: tierEarned.level,
      category_id: categoryId,
      category_label: category?.label ?? "Unknown",
    });
  }

  return { progress: upserted, newTier: tierEarned, totalBadges };
}

export async function getUserEarnedBadges(userId) {
  if (!userId) return Promise.resolve([]);
  return unstable_cache(
    () => getAllCategoryProgress(userId),
    [badgesCacheTag(userId)],
    { revalidate: 1800, tags: [badgesCacheTag(userId)] },
  )();
}

export async function markAllBadgesSeen(userId) {
  if (!userId) throw new Error("userId is required");

  const { error } = await supabaseAdmin
    .from(PROGRESS_TABLE)
    .update({ has_seen: true })
    .eq("user_id", userId)
    .eq("has_seen", false);

  if (error) throw new Error(error.message);
}

export async function getUnseenBadgeCategories(userId) {
  if (!userId) return [];

  const { data, error } = await supabaseAdmin
    .from(PROGRESS_TABLE)
    .select("category_id")
    .eq("user_id", userId)
    .eq("has_seen", false)
    .gt("current_level", 0);

  if (error) return [];
  return (data ?? []).map((r) => r.category_id);
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
