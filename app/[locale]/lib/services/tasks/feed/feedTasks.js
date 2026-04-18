"use server";
import { cookies } from "next/headers";
import { supabaseAdmin } from "@/app/[locale]/lib/supabase/supabaseServer";
import { batchGetTaskLikesStatus } from "./taskLikes";
import { batchGetTaskReviewCounts } from "./taskReviews";

async function getCallerId() {
  const cookieStore = await cookies();
  return cookieStore.get("doit-user-id")?.value ?? null;
}

export async function getFriendsFeedTasks({ offset = 0, limit = 20 } = {}) {
  const userId = await getCallerId();
  if (!userId) throw new Error("Unauthorized");

  // 1. Get accepted friend IDs (either side of the friendship)
  const { data: friendships, error: fError } = await supabaseAdmin
    .from("friendships")
    .select("requester_id, addressee_id")
    .eq("status", "accepted")
    .or(`requester_id.eq.${userId},addressee_id.eq.${userId}`);

  if (fError) throw new Error(fError.message);
  if (!friendships?.length) return { tasks: [], total: 0 };

  const friendIds = friendships.map((f) =>
    f.requester_id === userId ? f.addressee_id : f.requester_id,
  );

  // 2. Fetch public todo/completed tasks from friends with pagination
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
    .in("status", ["todo", "completed"])
    .eq("is_public", true)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (tError) throw new Error(tError.message);
  if (!tasks?.length) return { tasks: [], total: count ?? 0 };

  // 3. Enrich with owner display_name + image_url
  const uniqueUserIds = [...new Set(tasks.map((t) => t.user_id))];
  const { data: users, error: uError } = await supabaseAdmin
    .from("users")
    .select("id, display_name, image_url")
    .in("id", uniqueUserIds);

  if (uError) throw new Error(uError.message);

  const userMap = Object.fromEntries((users ?? []).map((u) => [u.id, u]));

  // 4. Enrich with like counts + review counts in parallel (single extra round-trip each)
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
