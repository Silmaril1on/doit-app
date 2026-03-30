"use server";

import { supabaseAdmin } from "@/app/[locale]/lib/supabase/supabaseServer";

const TABLE_NAME = "notifications";

const PRIORITY = Object.freeze({
  LOW: "low",
  MEDIUM: "medium",
  HIGH: "high",
});

const STATUS = Object.freeze({
  TASK_COMPLETED: "Task Completed",
});

export async function createTaskCompletedNotification(userId, displayName) {
  if (!userId) throw new Error("userId is required");
  if (!displayName) throw new Error("displayName is required");

  const { data, error } = await supabaseAdmin
    .from(TABLE_NAME)
    .insert({
      user_id: userId,
      status: STATUS.TASK_COMPLETED,
      message: "You have completed your task successfully.",
      priority: PRIORITY.LOW,
      display_name: displayName,
    })
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return data;
}
