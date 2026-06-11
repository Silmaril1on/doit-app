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
  grantTokens,
} from "@/app/[locale]/lib/services/xp/xpProgress";
import {
  BADGE_MILESTONE_COUNT,
  BADGE_MILESTONE_XP,
  TOKEN_REWARDS,
} from "@/app/[locale]/lib/services/xp/xpConfig";
import { badgesCacheTag } from "@/app/[locale]/lib/services/achievement-badges/cacheUtils";
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
const normalizeNumber = (value) => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
};
const normalizeCategoryId = (value) => {
  if (value === "" || value == null) return null;
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
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
      if (!label) return null;
      const subtask = { id, label, completed: Boolean(item?.completed) };
      const categoryId = normalizeCategoryId(item?.category_id);
      if (categoryId != null) subtask.category_id = categoryId;
      const lat = normalizeNumber(item?.lat);
      const lng = normalizeNumber(item?.lng);
      if (lat != null && lng != null) {
        subtask.lat = lat;
        subtask.lng = lng;
      }
      return subtask;
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

  // Fetch the current row so we can detect status transitions and read subtasks.
  const { data: existing, error: fetchError } = await supabaseAdmin
    .from(TABLE_NAME)
    .select("status, priority, completed_at, subtasks")
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

  // Badge logic — count completed subtasks by category.
  const wasCompleted = existing.status === "completed";
  const isNowCompleted =
    (updatePayload.status ?? existing.status) === "completed";
  // existing.completed_at being set means this task was previously completed —
  // XP and badge progress have already been awarded for it, so skip them.
  const alreadyRewarded = Boolean(existing.completed_at);

  const hasSubtaskUpdate = "subtasks" in updates;
  const prevSubtasks = normalizeSubtasks(existing.subtasks ?? []);
  const nextSubtasks = hasSubtaskUpdate
    ? (updatePayload.subtasks ?? [])
    : prevSubtasks;

  let badgeResult = null;
  let badgeChanged = false;

  if (hasSubtaskUpdate) {
    const prevById = new Map(prevSubtasks.map((st) => [st.id, st]));
    const nextById = new Map(nextSubtasks.map((st) => [st.id, st]));

    for (const st of nextSubtasks) {
      const prev = prevById.get(st.id);
      if (st.completed && !prev?.completed) {
        const result = await recordCategoryCompletion(userId, st.category_id);
        badgeChanged = true;
        if (result?.newTier) badgeResult = result;
      }
    }

    for (const st of prevSubtasks) {
      const next = nextById.get(st.id);
      if (st.completed && !next?.completed) {
        await revokeCategoryCompletion(userId, st.category_id);
        badgeChanged = true;
      }
    }
  }

  if (badgeChanged) {
    revalidateTag(badgesCacheTag(userId));
  }

  // XP — only awarded on first-ever completion, never revoked.
  let xpUpdate = null;
  let taskXpGained = 0;
  if (!wasCompleted && isNowCompleted && !alreadyRewarded) {
    try {
      const user = await getUserById(userId);
      const displayName = user?.display_name ?? user?.first_name ?? "User";
      xpUpdate = await recordXpGain(
        userId,
        existing.priority ?? "low",
        displayName,
      );
      taskXpGained = xpUpdate?.xpGained ?? 0;
    } catch (xpErr) {
      // XP failure must never break task completion.
      console.error(`[Task] XP gain failed for userId=${userId}:`, xpErr);
    }
  }

  // Tokens for task completion — based on priority
  let tokenReward = 0;
  if (!wasCompleted && isNowCompleted && !alreadyRewarded) {
    try {
      const priority = String(existing.priority ?? "low").toLowerCase();
      const tokenAmount =
        TOKEN_REWARDS.TASK[priority] ?? TOKEN_REWARDS.TASK.low;
      await grantTokens(userId, tokenAmount);
      tokenReward = tokenAmount;
    } catch (tokenErr) {
      console.error(
        `[Task] Token grant failed for userId=${userId}:`,
        tokenErr,
      );
    }
  }

  // Badge milestone: every 5th total badge earns a 50 XP bonus.
  if (
    badgeResult?.newTier &&
    badgeResult.totalBadges % BADGE_MILESTONE_COUNT === 0
  ) {
    try {
      xpUpdate = await recordFixedXpGain(userId, BADGE_MILESTONE_XP);
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

  // Surface the earned badge (if any) so the client modal can display it.
  const acquiredBadge = badgeResult?.newTier ?? null;

  return { quest: data, xpUpdate, tokenReward, taskXpGained, acquiredBadge };
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
