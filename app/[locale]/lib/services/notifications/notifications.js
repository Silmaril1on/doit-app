import { supabaseAdmin } from "@/app/[locale]/lib/supabase/supabaseServer";

const TABLE_NAME = "notifications";

const PRIORITY = {
  LOW: "low",
  MEDIUM: "medium",
  HIGH: "high",
};

const NOTIFICATION_STATUS = {
  TASK_COMPLETED: "Task Completed",
};

export async function getNotifications(userId, limit = null) {
  if (!userId) throw new Error("userId is required");

  let query = supabaseAdmin
    .from(TABLE_NAME)
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (limit) {
    query = query.limit(limit + 1);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);

  if (limit) {
    const hasMore = data.length > limit;
    return { notifications: hasMore ? data.slice(0, limit) : data, hasMore };
  }
  return { notifications: data ?? [], hasMore: false };
}

/**
 * markAllNotificationsRead
 * Sets has_read = true for all unread notifications belonging to a user.
 */
export async function markAllNotificationsRead(userId) {
  if (!userId) throw new Error("userId is required");

  const { data, error } = await supabaseAdmin
    .from(TABLE_NAME)
    .update({ has_read: true })
    .eq("user_id", userId)
    .eq("has_read", false)
    .select("*");

  if (error) throw new Error(error.message);
  return data ?? [];
}

/**
 * deleteNotification
 * Hard-deletes a single notification by id for a user.
 */
export async function deleteNotification(userId, notificationId) {
  if (!userId) throw new Error("userId is required");
  if (!notificationId) throw new Error("notificationId is required");

  const { data, error } = await supabaseAdmin
    .from(TABLE_NAME)
    .delete()
    .eq("id", notificationId)
    .eq("user_id", userId)
    .select("*")
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data;
}
