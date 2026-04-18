import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createSupabaseAdminClient } from "@/app/[locale]/lib/supabase/supabaseServer";

const TABLE = "task_likes";

async function getUserId() {
  const cookieStore = await cookies();
  return cookieStore.get("doit-user-id")?.value ?? null;
}

async function getLikeCount(supabase, taskId) {
  const { count, error } = await supabase
    .from(TABLE)
    .select("id", { count: "exact", head: true })
    .eq("task_id", taskId);
  if (error) throw new Error(error.message);
  return count ?? 0;
}

// GET /api/user/feed-likes?taskId=...
// Returns { like_count, is_liked } for the calling user
export async function GET(request) {
  try {
    const userId = await getUserId();
    if (!userId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const taskId = request.nextUrl.searchParams.get("taskId");
    if (!taskId)
      return NextResponse.json(
        { error: "taskId is required" },
        { status: 400 },
      );

    const supabase = createSupabaseAdminClient();

    // Run both queries in parallel
    const [{ count, error: cErr }, { data: liked, error: lErr }] =
      await Promise.all([
        supabase
          .from(TABLE)
          .select("id", { count: "exact", head: true })
          .eq("task_id", taskId),
        supabase
          .from(TABLE)
          .select("id")
          .eq("task_id", taskId)
          .eq("user_id", userId)
          .maybeSingle(),
      ]);

    if (cErr) throw new Error(cErr.message);
    if (lErr) throw new Error(lErr.message);

    return NextResponse.json({ like_count: count ?? 0, is_liked: !!liked });
  } catch (err) {
    return NextResponse.json(
      { error: err.message || "Failed to get likes" },
      { status: 500 },
    );
  }
}

// POST /api/user/feed-likes
// Body: { task_id, task_owner_id }
export async function POST(request) {
  try {
    const userId = await getUserId();
    if (!userId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const taskId = String(body?.task_id ?? "").trim();
    const taskOwnerId = String(body?.task_owner_id ?? "").trim();

    if (!taskId)
      return NextResponse.json(
        { error: "task_id is required" },
        { status: 400 },
      );
    if (!taskOwnerId)
      return NextResponse.json(
        { error: "task_owner_id is required" },
        { status: 400 },
      );
    if (userId === taskOwnerId)
      return NextResponse.json(
        { error: "Cannot like your own task" },
        { status: 400 },
      );

    const supabase = createSupabaseAdminClient();

    // Upsert — idempotent, safe against double-clicks / race conditions
    const { error } = await supabase
      .from(TABLE)
      .upsert(
        { user_id: userId, task_id: taskId, task_owner_id: taskOwnerId },
        { onConflict: "user_id,task_id" },
      );
    if (error) throw new Error(error.message);

    const like_count = await getLikeCount(supabase, taskId);
    return NextResponse.json({ liked: true, like_count }, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: err.message || "Failed to like task" },
      { status: 500 },
    );
  }
}

// DELETE /api/user/feed-likes?taskId=...
export async function DELETE(request) {
  try {
    const userId = await getUserId();
    if (!userId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const taskId = request.nextUrl.searchParams.get("taskId");
    if (!taskId)
      return NextResponse.json(
        { error: "taskId is required" },
        { status: 400 },
      );

    const supabase = createSupabaseAdminClient();

    const { error } = await supabase
      .from(TABLE)
      .delete()
      .eq("user_id", userId)
      .eq("task_id", taskId);
    if (error) throw new Error(error.message);

    const like_count = await getLikeCount(supabase, taskId);
    return NextResponse.json({ liked: false, like_count });
  } catch (err) {
    return NextResponse.json(
      { error: err.message || "Failed to unlike task" },
      { status: 500 },
    );
  }
}
