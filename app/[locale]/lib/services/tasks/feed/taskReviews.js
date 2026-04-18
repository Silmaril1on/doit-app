"use server";
import { cookies } from "next/headers";
import { supabaseAdmin } from "@/app/[locale]/lib/supabase/supabaseServer";

const TABLE = "task_reviews";

async function getCallerId() {
  const cookieStore = await cookies();
  return cookieStore.get("doit-user-id")?.value ?? null;
}

/**
 * Single round-trip batch fetch for review counts + whether the caller
 * has already reviewed each task.
 * Returns { [taskId]: { review_count: number, is_reviewed: boolean } }
 */
export async function batchGetTaskReviewCounts(taskIds) {
  if (!taskIds?.length) return {};

  const userId = await getCallerId();

  const { data, error } = await supabaseAdmin
    .from(TABLE)
    .select("task_id, user_id")
    .in("task_id", taskIds);

  if (error) throw new Error(error.message);

  // Group in one O(n) pass
  const byTask = {};
  for (const row of data ?? []) {
    const entry = (byTask[row.task_id] ??= { count: 0, userIds: [] });
    entry.count += 1;
    entry.userIds.push(row.user_id);
  }

  return Object.fromEntries(
    taskIds.map((id) => [
      id,
      {
        review_count: byTask[id]?.count ?? 0,
        is_reviewed: userId
          ? (byTask[id]?.userIds.includes(userId) ?? false)
          : false,
      },
    ]),
  );
}
