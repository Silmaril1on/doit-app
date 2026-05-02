import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createSupabaseAdminClient } from "@/app/[locale]/lib/supabase/supabaseServer";

async function getRequestUserId() {
  const cookieStore = await cookies();
  return cookieStore.get("doit-user-id")?.value ?? null;
}

// GET /api/user/gallery?userId=...&offset=0&limit=15
// Returns all gallery items across all objectives for a given user.
export async function GET(request) {
  try {
    const requestUserId = await getRequestUserId();
    if (!requestUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = request.nextUrl;
    const targetUserId = searchParams.get("userId");
    const offset = Math.max(0, parseInt(searchParams.get("offset") ?? "0", 10));
    const limit = Math.min(
      50,
      Math.max(1, parseInt(searchParams.get("limit") ?? "15", 10)),
    );

    if (!targetUserId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 },
      );
    }

    const supabase = createSupabaseAdminClient();

    // Fetch all objectives for the user that have gallery items
    // Allow viewing own objectives OR public objectives of other users
    const isOwn = requestUserId === targetUserId;

    // ✅ Correct table: "objectives", correct columns: task_title, subtasks
    let query = supabase
      .from("objectives")
      .select("id, task_title, task_gallery, subtasks, update_at")
      .eq("user_id", targetUserId)
      .not("task_gallery", "is", null)
      .order("update_at", { ascending: false })
      .limit(100);

    if (!isOwn) {
      query = query.eq("is_public", true);
    }

    const { data: objectives, error } = await query;
    if (error) throw new Error(error.message);

    // Flatten all gallery items across objectives
    const allItems = (objectives ?? []).flatMap((obj) => {
      const rawGallery = Array.isArray(obj.task_gallery)
        ? obj.task_gallery
        : [];
      const subtasks = Array.isArray(obj.subtasks) ? obj.subtasks : [];

      return rawGallery
        .filter((item) => {
          if (!item || typeof item !== "object" || !item.image_url) {
            return false;
          }
          return true;
        })
        .map((item) => {
          const subtaskId = Number(item.subtask_id);
          const subtask = subtasks.find((st) => {
            if (typeof st !== "object" || st.id == null) return false;
            return Number(st.id) === subtaskId;
          });

          const mapped = {
            image_url: item.image_url,
            subtask_id: item.subtask_id ?? null,
            subtask_label: subtask?.label ?? null,
            subtask_completed: subtask?.completed ?? false,
            objective_id: obj.id,
            objective_title: obj.task_title ?? null,
            updated_at: obj.update_at ?? null,
          };

          return mapped;
        });
    });

    const total = allItems.length;
    const gallery = allItems.slice(offset, offset + limit);

    return NextResponse.json({ gallery, total }, { status: 200 });
  } catch (err) {
    return NextResponse.json(
      { error: err.message || "Failed to fetch user gallery" },
      { status: 500 },
    );
  }
}
