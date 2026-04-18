"use server";
import { cookies } from "next/headers";
import { supabaseAdmin } from "@/app/[locale]/lib/supabase/supabaseServer";

const TABLE = "task_likes";

async function getCallerId() {
  const cookieStore = await cookies();
  return cookieStore.get("doit-user-id")?.value ?? null;
}

export async function batchGetTaskLikesStatus(taskIds) {
  if (!taskIds?.length) return {};

  const userId = await getCallerId();

  const { data, error } = await supabaseAdmin
    .from(TABLE)
    .select("task_id, user_id")
    .in("task_id", taskIds);

  if (error) throw new Error(error.message);

  // Group rows by task_id in one pass — O(n)
  const byTask = {};
  for (const row of data ?? []) {
    (byTask[row.task_id] ??= []).push(row.user_id);
  }

  return Object.fromEntries(
    taskIds.map((id) => [
      id,
      {
        like_count: byTask[id]?.length ?? 0,
        is_liked: userId ? (byTask[id]?.includes(userId) ?? false) : false,
      },
    ]),
  );
}
