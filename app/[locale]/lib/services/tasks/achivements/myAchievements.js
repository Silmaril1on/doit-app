"use server";

import { supabaseAdmin } from "@/app/[locale]/lib/supabase/supabaseServer";

const TABLE_NAME = "objectives";
const ALLOWED_STATUS = new Set(["todo", "in_progress", "completed"]);
const ALLOWED_PRIORITY = new Set(["low", "medium", "high"]);

const normalizeText = (value) => String(value ?? "").trim();
const normalizeOptionalText = (value) => {
  const n = normalizeText(value);
  return n || null;
};
const normalizeSubtasks = (value) => {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      if (typeof item === "string") {
        const label = normalizeText(item);
        return label ? { label, completed: false } : null;
      }
      const label = normalizeText(item?.label);
      return label ? { label, completed: Boolean(item?.completed) } : null;
    })
    .filter(Boolean);
};

export async function getAllAchievements(
  userId,
  { limit = 20, offset = 0 } = {},
) {
  if (!userId) throw new Error("userId is required");
  const { data, count, error } = await supabaseAdmin
    .from(TABLE_NAME)
    .select("*", { count: "exact" })
    .eq("user_id", userId)
    .eq("status", "completed")
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);
  if (error) throw new Error(error.message);
  return { achievements: data ?? [], total: count ?? 0 };
}

export async function getAchievementById(userId, achievementId) {
  if (!userId) throw new Error("userId is required");
  if (!achievementId) throw new Error("achievementId is required");
  const { data, error } = await supabaseAdmin
    .from(TABLE_NAME)
    .select("*")
    .eq("id", achievementId)
    .eq("user_id", userId)
    .eq("status", "completed")
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) throw new Error("Achievement not found");
  return data;
}

export async function updateAchievement(userId, achievementId, updates) {
  if (!userId) throw new Error("userId is required");
  if (!achievementId) throw new Error("achievementId is required");

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
  if ("status" in updates) {
    const s = normalizeText(updates.status).toLowerCase();
    updatePayload.status = ALLOWED_STATUS.has(s) ? s : "completed";
  }
  if ("completed_at" in updates)
    updatePayload.completed_at = updates.completed_at || null;

  if (Object.keys(updatePayload).length === 0)
    throw new Error("No valid fields to update");

  if (updatePayload.status === "completed" && !updatePayload.completed_at)
    updatePayload.completed_at = new Date().toISOString();
  if (updatePayload.status && updatePayload.status !== "completed")
    updatePayload.completed_at = null;

  updatePayload.update_at = new Date().toISOString();

  const { data, error } = await supabaseAdmin
    .from(TABLE_NAME)
    .update(updatePayload)
    .eq("id", achievementId)
    .eq("user_id", userId)
    .select("*")
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) throw new Error("Achievement not found");
  return data;
}
