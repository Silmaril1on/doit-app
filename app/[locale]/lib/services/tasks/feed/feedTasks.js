"use server";
import { supabaseAdmin } from "@/app/[locale]/lib/supabase/supabaseServer";
import { batchGetTaskLikesStatus } from "./taskLikes";
import { batchGetTaskReviewCounts } from "./taskReviews";

/**
 * Fetch completed public tasks from a pre-resolved list of friend IDs.
 * Accepts `friendIds` directly so the caller (feedService) doesn't have to
 * re-query the friendships table — eliminating the duplicate DB round-trip.
 */
export async function getFriendsFeedTasks({ friendIds = [], limit = 20 } = {}) {
  if (!friendIds?.length) return { tasks: [], total: 0 };

  const {
    data: tasks,
    count,
    error: tError,
  } = await supabaseAdmin
    .from("objectives")
    .select(
      "id, task_title, task_description, country, city, task_category, status, completed_at, created_at, priority, user_id, subtasks, recreate_count",
      { count: "exact" },
    )
    .in("user_id", friendIds)
    .eq("status", "completed")
    .eq("is_public", true)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (tError) throw new Error(tError.message);
  if (!tasks?.length) return { tasks: [], total: count ?? 0 };

  const uniqueUserIds = [...new Set(tasks.map((t) => t.user_id))];
  const { data: users, error: uError } = await supabaseAdmin
    .from("users")
    .select("id, display_name, image_url")
    .in("id", uniqueUserIds);

  if (uError) throw new Error(uError.message);

  const userMap = Object.fromEntries((users ?? []).map((u) => [u.id, u]));

  const taskIds = tasks.map((t) => t.id);
  const [likesStatus, reviewsStatus] = await Promise.all([
    batchGetTaskLikesStatus(taskIds),
    batchGetTaskReviewCounts(taskIds),
  ]);

  return {
    tasks: tasks.map((t) => ({
      ...t,
      user: userMap[t.user_id] ?? null,
      like_count: likesStatus[t.id]?.like_count ?? 0,
      is_liked: likesStatus[t.id]?.is_liked ?? false,
      review_count: reviewsStatus[t.id]?.review_count ?? 0,
      is_reviewed: reviewsStatus[t.id]?.is_reviewed ?? false,
    })),
    total: count ?? 0,
  };
}
