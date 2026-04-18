"use server";
import { supabaseAdmin } from "@/app/[locale]/lib/supabase/supabaseServer";
import { revalidateTag } from "next/cache";
import {
  recordCategoryCompletion,
  revokeCategoryCompletion,
} from "@/app/[locale]/lib/services/achievement-badges/categoryProgress";
import {
  recordXpGain,
  recordFixedXpGain,
} from "@/app/[locale]/lib/services/xp/xpProgress";
import {
  BADGE_MILESTONE_COUNT,
  BADGE_MILESTONE_XP,
} from "@/app/[locale]/lib/services/xp/xpConfig";
import { badgesCacheTag } from "@/app/[locale]/lib/local-bd/categoryTypesData";
import { getUserById } from "@/app/[locale]/lib/services/user/userProfiles";

const TABLE_NAME = "objectives";
const ALLOWED_STATUS = new Set(["todo", "in_progress", "completed"]);
const ALLOWED_PRIORITY = new Set(["low", "medium", "high"]);

const normalizeText = (value) => String(value ?? "").trim();
const normalizeOptionalText = (value) => {
  const n = normalizeText(value);
  return n || null;
};
const normalizeBoolean = (value, fallback = false) => {
  if (value == null) return fallback;
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value === 1;
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (["true", "1", "yes", "on"].includes(normalized)) return true;
    if (["false", "0", "no", "off", ""].includes(normalized)) return false;
  }
  return Boolean(value);
};
const normalizeSubtasks = (value) => {
  if (!Array.isArray(value)) return [];
  return value
    .map((item, index) => {
      if (typeof item === "string") {
        const label = normalizeText(item);
        return label ? { id: index + 1, label, completed: false } : null;
      }
      const label = normalizeText(item?.label);
      const id =
        typeof item?.id === "number" && item.id > 0 ? item.id : index + 1;
      return label ? { id, label, completed: Boolean(item?.completed) } : null;
    })
    .filter(Boolean);
};

export async function getAllActiveQuests(
  userId,
  { limit = 20, offset = 0 } = {},
) {
  if (!userId) throw new Error("userId is required");
  const { data, count, error } = await supabaseAdmin
    .from(TABLE_NAME)
    .select("*", { count: "exact" })
    .eq("user_id", userId)
    .eq("status", "in_progress")
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);
  if (error) throw new Error(error.message);
  return { quests: data ?? [], total: count ?? 0 };
}

export async function getActiveQuestById(userId, questId) {
  if (!userId) throw new Error("userId is required");
  if (!questId) throw new Error("questId is required");
  const { data, error } = await supabaseAdmin
    .from(TABLE_NAME)
    .select("*")
    .eq("id", questId)
    .eq("user_id", userId)
    .eq("status", "in_progress")
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) throw new Error("Active quest not found");
  return data;
}

export async function updateActiveQuest(userId, questId, updates) {
  if (!userId) throw new Error("userId is required");
  if (!questId) throw new Error("questId is required");

  // Fetch the current row so we can detect status transitions and read category.
  const { data: existing, error: fetchError } = await supabaseAdmin
    .from(TABLE_NAME)
    .select("status, task_category, priority, completed_at")
    .eq("id", questId)
    .eq("user_id", userId)
    .maybeSingle();

  if (fetchError) throw new Error(fetchError.message);
  if (!existing) throw new Error("Active quest not found");

  const updatePayload = {};
  if ("task_title" in updates) {
    const t = normalizeText(updates.task_title);
    if (!t) throw new Error("task_title cannot be empty");
    updatePayload.task_title = t;
  }
  if ("task_description" in updates) {
    const d = normalizeText(updates.task_description);
    if (!d) throw new Error("task_description cannot be empty");
    updatePayload.task_description = d;
  }
  if ("task_category" in updates)
    updatePayload.task_category = normalizeOptionalText(updates.task_category);
  if ("subtasks" in updates)
    updatePayload.subtasks = normalizeSubtasks(updates.subtasks);
  if ("country" in updates)
    updatePayload.country = normalizeOptionalText(updates.country);
  if ("city" in updates)
    updatePayload.city = normalizeOptionalText(updates.city);
  if ("priority" in updates) {
    const p = normalizeText(updates.priority).toLowerCase();
    updatePayload.priority = ALLOWED_PRIORITY.has(p) ? p : "medium";
  }
  if ("is_public" in updates) {
    updatePayload.is_public = normalizeBoolean(updates.is_public, false);
  }
  if ("status" in updates) {
    const s = normalizeText(updates.status).toLowerCase();
    updatePayload.status = ALLOWED_STATUS.has(s) ? s : "in_progress";
  }
  if ("completed_at" in updates)
    updatePayload.completed_at = updates.completed_at || null;
  if (Object.keys(updatePayload).length === 0)
    throw new Error("No valid fields to update");
  if (updatePayload.status === "completed" && !updatePayload.completed_at)
    updatePayload.completed_at = new Date().toISOString();
  // Same as objectives: preserve completed_at when reactivating a previously-completed task.
  if (
    updatePayload.status &&
    updatePayload.status !== "completed" &&
    existing.status !== "completed"
  )
    updatePayload.completed_at = null;
  updatePayload.update_at = new Date().toISOString();

  const { data, error } = await supabaseAdmin
    .from(TABLE_NAME)
    .update(updatePayload)
    .eq("id", questId)
    .eq("user_id", userId)
    .select("*")
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) throw new Error("Active quest not found");

  // Badge logic — detect status transitions using the existing row.
  const categoryId = existing.task_category;
  const wasCompleted = existing.status === "completed";
  const isNowCompleted =
    (updatePayload.status ?? existing.status) === "completed";
  // existing.completed_at being set means this task was previously completed —
  // XP and badge progress have already been awarded for it, so skip them.
  const alreadyRewarded = Boolean(existing.completed_at);

  let badgeResult = null;
  if (!wasCompleted && isNowCompleted && !alreadyRewarded && categoryId) {
    badgeResult = await recordCategoryCompletion(userId, categoryId);
    // Bust the badges page cache so the user sees fresh data immediately.
    revalidateTag(badgesCacheTag(userId));
  } else if (wasCompleted && !isNowCompleted && categoryId) {
    await revokeCategoryCompletion(userId, categoryId);
    revalidateTag(badgesCacheTag(userId));
  }

  // XP — only awarded on first-ever completion, never revoked.
  let xpUpdate = null;
  if (!wasCompleted && isNowCompleted && !alreadyRewarded) {
    try {
      const user = await getUserById(userId);
      const displayName = user?.display_name ?? user?.first_name ?? "User";
      console.log(
        `[Task] Awarding XP for userId=${userId} priority=${existing.priority} displayName=${displayName}`,
      );
      xpUpdate = await recordXpGain(
        userId,
        existing.priority ?? "low",
        displayName,
      );
      console.log(`[Task] XP awarded:`, xpUpdate);
    } catch (xpErr) {
      // XP failure must never break task completion.
      console.error(`[Task] XP gain failed for userId=${userId}:`, xpErr);
    }
  }

  // Badge milestone: every 5th total badge earns a 50 XP bonus.
  if (
    badgeResult?.newTier &&
    badgeResult.totalBadges % BADGE_MILESTONE_COUNT === 0
  ) {
    try {
      console.log(
        `[Task] Badge milestone hit (totalBadges=${badgeResult.totalBadges}), awarding ${BADGE_MILESTONE_XP} bonus XP`,
      );
      xpUpdate = await recordFixedXpGain(userId, BADGE_MILESTONE_XP);
      console.log(`[Task] Bonus XP awarded:`, xpUpdate);
    } catch (bonusErr) {
      // Bonus XP failure must never break task completion.
      console.error(`[Task] Bonus XP failed for userId=${userId}:`, bonusErr);
    }
  }

  // Fire task-completed notification — failure must never break the main flow.
  if (!wasCompleted && isNowCompleted) {
    try {
      const user = await getUserById(userId);
      const displayName = user?.display_name ?? user?.first_name ?? "User";
      await supabaseAdmin.from("notifications").insert({
        user_id: userId,
        status: "Task Completed",
        message: "You have completed your task successfully.",
        priority: "low",
        display_name: displayName,
      });
    } catch {
      // Notification failure must never break task completion.
    }
  }

  return { quest: data, xpUpdate };
}

export async function deleteActiveQuest(userId, questId) {
  if (!userId) throw new Error("userId is required");
  if (!questId) throw new Error("questId is required");
  const { data, error } = await supabaseAdmin
    .from(TABLE_NAME)
    .delete()
    .eq("id", questId)
    .eq("user_id", userId)
    .select("*")
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) throw new Error("Active quest not found");
  return data;
}
