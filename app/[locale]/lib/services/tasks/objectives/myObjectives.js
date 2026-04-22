"use server";

import { supabaseAdmin } from "@/app/[locale]/lib/supabase/supabaseServer";
import { VALID_CATEGORY_IDS } from "@/app/[locale]/lib/local-bd/categoryTypesData";

const TABLE_NAME = "objectives";
const ALLOWED_STATUS = new Set(["todo", "in_progress", "completed"]);
const ALLOWED_PRIORITY = new Set(["low", "medium", "high"]);

const normalizeText = (value) => {
  const normalized = String(value ?? "").trim();
  return normalized;
};

const normalizeOptionalText = (value) => {
  const normalized = normalizeText(value);
  return normalized ? normalized : null;
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

const normalizeCategoryId = (value) => {
  if (value === "" || value == null) return null;
  const id = Number(value);
  if (!Number.isInteger(id) || !VALID_CATEGORY_IDS.has(id)) {
    throw new Error(
      `task_category must be one of: ${[...VALID_CATEGORY_IDS].join(", ")}`,
    );
  }
  return id;
};

const normalizeStatus = (value) => {
  const normalized = normalizeText(value).toLowerCase();
  return ALLOWED_STATUS.has(normalized) ? normalized : "todo";
};

const normalizePriority = (value) => {
  const normalized = normalizeText(value).toLowerCase();
  return ALLOWED_PRIORITY.has(normalized) ? normalized : "medium";
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

const normalizeOptionalTimestamp = (value) => {
  const normalized = normalizeText(value);
  if (!normalized) {
    return null;
  }

  const parsedDate = new Date(normalized);
  if (Number.isNaN(parsedDate.getTime())) {
    throw new Error("task_deadline must be a valid date-time");
  }

  return parsedDate.toISOString();
};

export async function getAllObjectives(
  userId,
  { status, limit, offset = 0 } = {},
) {
  if (!userId) throw new Error("userId is required");

  let query = supabaseAdmin
    .from(TABLE_NAME)
    .select("*", { count: "exact" })
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (status) query = query.eq("status", status);
  if (limit != null) query = query.range(offset, offset + limit - 1);

  const { data, count, error } = await query;

  if (error) throw new Error(error.message);
  return { objectives: data ?? [], total: count ?? 0 };
}

export async function getObjectiveById(userId, objectiveId) {
  if (!userId) throw new Error("userId is required");
  if (!objectiveId) throw new Error("objectiveId is required");

  const { data, error } = await supabaseAdmin
    .from(TABLE_NAME)
    .select("*")
    .eq("id", objectiveId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) throw new Error("Objective not found");

  return data;
}

export async function createObjective(userId, payload) {
  if (!userId) throw new Error("userId is required");

  const taskTitle = normalizeText(payload?.task_title);
  const taskDescription = normalizeText(payload?.task_description);
  if (!taskTitle) {
    throw new Error("task_title is required");
  }
  if (!taskDescription) {
    throw new Error("task_description is required");
  }

  const now = new Date().toISOString();
  const status = normalizeStatus(payload?.status);
  const categoryId = normalizeCategoryId(payload?.task_category);

  const createPayload = {
    task_title: taskTitle,
    task_description: taskDescription,
    task_category: categoryId,
    subtasks: normalizeSubtasks(payload?.subtasks),
    task_deadline: normalizeOptionalTimestamp(payload?.task_deadline),
    country: normalizeOptionalText(payload?.country),
    city: normalizeOptionalText(payload?.city),
    status,
    priority: normalizePriority(payload?.priority),
    is_public: normalizeBoolean(payload?.is_public, false),
    user_id: userId,
    update_at: now,
    completed_at: status === "completed" ? now : null,
  };

  const { data, error } = await supabaseAdmin
    .from(TABLE_NAME)
    .insert(createPayload)
    .select("*")
    .single();

  if (error) throw new Error(error.message);

  return data;
}

export async function updateObjective(userId, objectiveId, updates) {
  if (!userId) throw new Error("userId is required");
  if (!objectiveId) throw new Error("objectiveId is required");

  // Fetch the current state so we can detect status transitions and category.
  const { data: existing, error: fetchError } = await supabaseAdmin
    .from(TABLE_NAME)
    .select("status, task_category")
    .eq("id", objectiveId)
    .eq("user_id", userId)
    .maybeSingle();

  if (fetchError) throw new Error(fetchError.message);
  if (!existing) throw new Error("Objective not found");

  const updatePayload = {};

  if ("task_title" in updates) {
    const taskTitle = normalizeText(updates.task_title);
    if (!taskTitle) throw new Error("task_title cannot be empty");
    updatePayload.task_title = taskTitle;
  }

  if ("task_description" in updates) {
    const taskDescription = normalizeText(updates.task_description);
    if (!taskDescription) throw new Error("task_description cannot be empty");
    updatePayload.task_description = taskDescription;
  }

  if ("country" in updates) {
    updatePayload.country = normalizeOptionalText(updates.country);
  }

  if ("task_category" in updates) {
    updatePayload.task_category = normalizeCategoryId(updates.task_category);
  }

  if ("subtasks" in updates) {
    updatePayload.subtasks = normalizeSubtasks(updates.subtasks);
  }

  if ("task_deadline" in updates) {
    updatePayload.task_deadline = normalizeOptionalTimestamp(
      updates.task_deadline,
    );
  }

  if ("city" in updates) {
    updatePayload.city = normalizeOptionalText(updates.city);
  }

  if ("status" in updates) {
    updatePayload.status = normalizeStatus(updates.status);
  }

  if ("priority" in updates) {
    updatePayload.priority = normalizePriority(updates.priority);
  }

  if ("is_public" in updates) {
    updatePayload.is_public = normalizeBoolean(updates.is_public, false);
  }

  if ("completed_at" in updates) {
    updatePayload.completed_at = updates.completed_at || null;
  }

  if (Object.keys(updatePayload).length === 0) {
    throw new Error("No valid fields to update");
  }

  if (updatePayload.status === "completed" && !updatePayload.completed_at) {
    updatePayload.completed_at = new Date().toISOString();
  }

  // When reactivating a previously-completed task, keep completed_at as a historical
  // marker so the XP/badge logic knows this task was already rewarded.
  // Only null it out when a task that was never completed moves to a non-completed state.
  if (
    updatePayload.status &&
    updatePayload.status !== "completed" &&
    existing.status !== "completed"
  ) {
    updatePayload.completed_at = null;
  }

  updatePayload.update_at = new Date().toISOString();

  const { data, error } = await supabaseAdmin
    .from(TABLE_NAME)
    .update(updatePayload)
    .eq("id", objectiveId)
    .eq("user_id", userId)
    .select("*")
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) throw new Error("Objective not found");

  return data;
}

export async function deleteObjective(userId, objectiveId) {
  if (!userId) throw new Error("userId is required");
  if (!objectiveId) throw new Error("objectiveId is required");

  const { data, error } = await supabaseAdmin
    .from(TABLE_NAME)
    .delete()
    .eq("id", objectiveId)
    .eq("user_id", userId)
    .select("*")
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) throw new Error("Objective not found");

  return data;
}

export async function getObjectiveStatsByUserId(userId) {
  if (!userId) return { byStatus: {}, byPriority: {}, total: 0 };

  const { data, error } = await supabaseAdmin
    .from(TABLE_NAME)
    .select("status,priority")
    .eq("user_id", userId);

  if (error) return { byStatus: {}, byPriority: {}, total: 0 };

  const byStatus = { todo: 0, in_progress: 0, completed: 0 };
  const byPriority = { low: 0, medium: 0, high: 0 };
  let total = 0;

  for (const row of data ?? []) {
    total++;
    if (row.status in byStatus) byStatus[row.status]++;
    if (row.priority in byPriority) byPriority[row.priority]++;
  }

  return { byStatus, byPriority, total };
}
