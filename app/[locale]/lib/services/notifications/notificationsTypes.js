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
  NEW_BADGE: "New Badge",
  LEVEL_BADGE: "Level Badge Unlocked",
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

export async function createNewBadgeNotification(
  userId,
  displayName,
  tierTitle,
  categoryLabel,
  level,
) {
  if (!userId) throw new Error("userId is required");
  if (!displayName) throw new Error("displayName is required");
  if (!tierTitle) throw new Error("tierTitle is required");
  if (!categoryLabel) throw new Error("categoryLabel is required");

  const { data, error } = await supabaseAdmin
    .from(TABLE_NAME)
    .insert({
      user_id: userId,
      status: STATUS.NEW_BADGE,
      message: `You've unlocked the "${tierTitle}" badge (Level ${level}) in ${categoryLabel}! Keep going to reach the next tier. `,
      priority: PRIORITY.LOW,
      display_name: displayName,
      has_read: false,
    })
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function createLevelBadgeNotification(
  userId,
  displayName,
  badgeName,
  level,
) {
  if (!userId) throw new Error("userId is required");
  if (!displayName) throw new Error("displayName is required");
  if (!badgeName) throw new Error("badgeName is required");
  if (!level) throw new Error("level is required");

  const { data, error } = await supabaseAdmin
    .from(TABLE_NAME)
    .insert({
      user_id: userId,
      status: STATUS.LEVEL_BADGE,
      message: `You've reached Level ${level} and unlocked the ${badgeName} badge! Keep pushing to reach the next milestone.`,
      priority: PRIORITY.MEDIUM,
      display_name: displayName,
      has_read: false,
    })
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return data;
}
