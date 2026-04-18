import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createSupabaseAdminClient } from "@/app/[locale]/lib/supabase/supabaseServer";

const BUCKET = "task_image_gallery";
const MAX_SIZE_BYTES = 2 * 1024 * 1024; // 2 MB

async function getUserId() {
  const cookieStore = await cookies();
  return cookieStore.get("doit-user-id")?.value ?? null;
}

// GET /api/user/task/gallery?objectiveId=...
export async function GET(request) {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const objectiveId = request.nextUrl.searchParams.get("objectiveId");
    if (!objectiveId) {
      return NextResponse.json(
        { error: "objectiveId is required" },
        { status: 400 },
      );
    }

    const supabase = createSupabaseAdminClient();
    const { data: objective, error: fetchError } = await supabase
      .from("objectives")
      .select("id, task_gallery")
      .eq("id", objectiveId)
      .or(`user_id.eq.${userId},is_public.eq.true`)
      .maybeSingle();

    if (fetchError) throw new Error(fetchError.message);
    if (!objective) {
      return NextResponse.json(
        { error: "Objective not found" },
        { status: 404 },
      );
    }

    const gallery = Array.isArray(objective.task_gallery)
      ? objective.task_gallery
          .filter((item) => item && typeof item === "object")
          .sort((a, b) => Number(a.subtask_id) - Number(b.subtask_id))
      : [];

    return NextResponse.json({ gallery }, { status: 200 });
  } catch (err) {
    return NextResponse.json(
      { error: err.message || "Failed to fetch gallery" },
      { status: 500 },
    );
  }
}

// POST /api/user/task/gallery
// Body: FormData { file, objectiveId, subtaskId }
export async function POST(request) {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file");
    const objectiveId = formData.get("objectiveId");
    const subtaskId = formData.get("subtaskId");

    if (!file || typeof file === "string") {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }
    if (!objectiveId) {
      return NextResponse.json(
        { error: "objectiveId is required" },
        { status: 400 },
      );
    }
    if (!subtaskId) {
      return NextResponse.json(
        { error: "subtaskId is required" },
        { status: 400 },
      );
    }
    if (file.size > MAX_SIZE_BYTES) {
      return NextResponse.json(
        { error: "File too large (max 2 MB)" },
        { status: 400 },
      );
    }

    const supabase = createSupabaseAdminClient();

    // Verify ownership and completed status
    const { data: objective, error: fetchError } = await supabase
      .from("objectives")
      .select("id, task_gallery, status")
      .eq("id", objectiveId)
      .eq("user_id", userId)
      .single();

    if (fetchError || !objective) {
      return NextResponse.json(
        { error: "Objective not found" },
        { status: 404 },
      );
    }
    if (objective.status !== "completed") {
      return NextResponse.json(
        { error: "Only completed tasks can have gallery images" },
        { status: 400 },
      );
    }

    // Storage path: {userId}/{objectiveId}/subtask_{id}.jpg
    const filePath = `${userId}/${objectiveId}/subtask_${subtaskId}.jpg`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(filePath, buffer, { contentType: "image/jpeg", upsert: true });

    if (uploadError) throw new Error(uploadError.message);

    const { data: urlData } = supabase.storage
      .from(BUCKET)
      .getPublicUrl(filePath);

    const imageUrl = `${urlData.publicUrl}?t=${Date.now()}`;

    // Merge into existing gallery — replace entry for same subtask id if present
    const current = Array.isArray(objective.task_gallery)
      ? objective.task_gallery
      : [];
    const gallery = [
      ...current.filter(
        (item) => String(item.subtask_id) !== String(subtaskId),
      ),
      {
        subtask_id: Number(subtaskId),
        image_url: imageUrl,
      },
    ].sort((a, b) => a.subtask_id - b.subtask_id);

    const { error: updateError } = await supabase
      .from("objectives")
      .update({ task_gallery: gallery })
      .eq("id", objectiveId)
      .eq("user_id", userId);

    if (updateError) throw new Error(updateError.message);

    return NextResponse.json({ gallery });
  } catch (err) {
    return NextResponse.json(
      { error: err.message || "Upload failed" },
      { status: 500 },
    );
  }
}

// DELETE /api/user/task/gallery
// Body: JSON { objectiveId, subtaskId }
export async function DELETE(request) {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { objectiveId, subtaskId } = await request.json();

    if (!objectiveId) {
      return NextResponse.json(
        { error: "objectiveId is required" },
        { status: 400 },
      );
    }
    if (!subtaskId) {
      return NextResponse.json(
        { error: "subtaskId is required" },
        { status: 400 },
      );
    }

    const supabase = createSupabaseAdminClient();

    const { data: objective, error: fetchError } = await supabase
      .from("objectives")
      .select("id, task_gallery")
      .eq("id", objectiveId)
      .eq("user_id", userId)
      .single();

    if (fetchError || !objective) {
      return NextResponse.json(
        { error: "Objective not found" },
        { status: 404 },
      );
    }

    const filePath = `${userId}/${objectiveId}/subtask_${subtaskId}.jpg`;
    await supabase.storage.from(BUCKET).remove([filePath]);

    const gallery = Array.isArray(objective.task_gallery)
      ? objective.task_gallery.filter(
          (item) => String(item.subtask_id) !== String(subtaskId),
        )
      : [];

    const { error: updateError } = await supabase
      .from("objectives")
      .update({ task_gallery: gallery })
      .eq("id", objectiveId)
      .eq("user_id", userId);

    if (updateError) throw new Error(updateError.message);

    return NextResponse.json({ gallery });
  } catch (err) {
    return NextResponse.json(
      { error: err.message || "Delete failed" },
      { status: 500 },
    );
  }
}
