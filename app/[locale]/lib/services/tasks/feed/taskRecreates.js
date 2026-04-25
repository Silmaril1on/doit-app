"use server";
import { cookies } from "next/headers";
import { supabaseAdmin } from "@/app/[locale]/lib/supabase/supabaseServer";

const TABLE = "task_recreates";

async function getCallerId() {
  const cookieStore = await cookies();
  return cookieStore.get("doit-user-id")?.value ?? null;
}

export async function batchGetTaskRecreateCounts(taskIds) {
  if (!taskIds?.length) return {};

  const userId = await getCallerId();

  const { data, error } = await supabaseAdmin
    .from(TABLE)
    .select("task_id, user_id")
    .in("task_id", taskIds);

  if (error) throw new Error(error.message);

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
        recreate_count: byTask[id]?.count ?? 0,
        has_recreated: userId
          ? (byTask[id]?.userIds.includes(userId) ?? false)
          : false,
      },
    ]),
  );
}

/**
 * Insert a recreation record linking the recreating user to the original task.
 * Silently ignores duplicates (unique constraint on user_id + task_id).
 */
export async function insertTaskRecreate(
  userId,
  taskId,
  taskOwnerId,
  newTaskId,
) {
  if (!userId || !taskId || !taskOwnerId) return;

  await supabaseAdmin.from(TABLE).upsert(
    {
      user_id: userId,
      task_id: taskId,
      task_owner_id: taskOwnerId,
      new_task_id: newTaskId ?? null,
    },
    { onConflict: "user_id,task_id", ignoreDuplicates: true },
  );
}
