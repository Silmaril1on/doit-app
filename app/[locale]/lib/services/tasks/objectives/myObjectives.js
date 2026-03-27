"use server";

import { supabaseAdmin } from "@/app/[locale]/lib/supabase/supabaseServer";

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

const normalizeStatus = (value) => {
  const normalized = normalizeText(value).toLowerCase();
  return ALLOWED_STATUS.has(normalized) ? normalized : "todo";
};

const normalizePriority = (value) => {
  const normalized = normalizeText(value).toLowerCase();
  return ALLOWED_PRIORITY.has(normalized) ? normalized : "medium";
};

const normalizeSubtasks = (value) => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((subtask) => normalizeText(subtask))
    .filter((subtask) => Boolean(subtask));
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

export async function getAllObjectives(userId) {
  if (!userId) throw new Error("userId is required");

  const { data, error } = await supabaseAdmin
    .from(TABLE_NAME)
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data;
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

  const createPayload = {
    task_title: taskTitle,
    task_description: taskDescription,
    task_category: normalizeOptionalText(payload?.task_category),
    subtasks: normalizeSubtasks(payload?.subtasks),
    task_deadline: normalizeOptionalTimestamp(payload?.task_deadline),
    country: normalizeOptionalText(payload?.country),
    city: normalizeOptionalText(payload?.city),
    status,
    priority: normalizePriority(payload?.priority),
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
    updatePayload.task_category = normalizeOptionalText(updates.task_category);
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

  if ("completed_at" in updates) {
    updatePayload.completed_at = updates.completed_at || null;
  }

  if (Object.keys(updatePayload).length === 0) {
    throw new Error("No valid fields to update");
  }

  if (updatePayload.status === "completed" && !updatePayload.completed_at) {
    updatePayload.completed_at = new Date().toISOString();
  }

  if (updatePayload.status && updatePayload.status !== "completed") {
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
