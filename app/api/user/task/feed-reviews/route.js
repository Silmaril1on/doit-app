import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createSupabaseAdminClient } from "@/app/[locale]/lib/supabase/supabaseServer";

const TABLE = "task_reviews";
const MAX_REVIEW_LENGTH = 1000;

async function getUserId() {
  const cookieStore = await cookies();
  return cookieStore.get("doit-user-id")?.value ?? null;
}

// GET /api/user/task/feed-reviews?taskId=...
// Returns reviews with author info, newest first
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

    const { data: reviews, error } = await supabase
      .from(TABLE)
      .select("id, user_id, review, created_at, updated_at")
      .eq("task_id", taskId)
      .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);
    if (!reviews?.length) return NextResponse.json({ reviews: [] });

    // Enrich with author display_name + image_url
    const uniqueUserIds = [...new Set(reviews.map((r) => r.user_id))];
    const { data: users, error: uErr } = await supabase
      .from("users")
      .select("id, display_name, image_url")
      .in("id", uniqueUserIds);

    if (uErr) throw new Error(uErr.message);

    const userMap = Object.fromEntries((users ?? []).map((u) => [u.id, u]));

    return NextResponse.json({
      reviews: reviews.map((r) => ({
        ...r,
        user: userMap[r.user_id] ?? null,
        is_own: r.user_id === userId,
      })),
    });
  } catch (err) {
    return NextResponse.json(
      { error: err.message || "Failed to fetch reviews" },
      { status: 500 },
    );
  }
}

// POST /api/user/task/feed-reviews
// Body: { task_id, task_owner_id, review }
export async function POST(request) {
  try {
    const userId = await getUserId();
    if (!userId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const taskId = String(body?.task_id ?? "").trim();
    const taskOwnerId = String(body?.task_owner_id ?? "").trim();
    const reviewText = String(body?.review ?? "").trim();

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
    if (!reviewText)
      return NextResponse.json(
        { error: "review cannot be empty" },
        { status: 400 },
      );
    if (reviewText.length > MAX_REVIEW_LENGTH)
      return NextResponse.json(
        { error: `review must be ${MAX_REVIEW_LENGTH} characters or fewer` },
        { status: 400 },
      );

    const supabase = createSupabaseAdminClient();
    const now = new Date().toISOString();

    const { data, error } = await supabase
      .from(TABLE)
      .insert({
        user_id: userId,
        task_id: taskId,
        task_owner_id: taskOwnerId,
        review: reviewText,
        created_at: now,
        updated_at: now,
      })
      .select("id, user_id, review, created_at, updated_at")
      .single();

    if (error) throw new Error(error.message);

    // Fetch author info
    const { data: user } = await supabase
      .from("users")
      .select("id, display_name, image_url")
      .eq("id", userId)
      .maybeSingle();

    return NextResponse.json(
      { review: { ...data, user: user ?? null, is_own: true } },
      { status: 201 },
    );
  } catch (err) {
    return NextResponse.json(
      { error: err.message || "Failed to post review" },
      { status: 500 },
    );
  }
}

// PATCH /api/user/task/feed-reviews
// Body: { review_id, review }
export async function PATCH(request) {
  try {
    const userId = await getUserId();
    if (!userId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const reviewId = String(body?.review_id ?? "").trim();
    const reviewText = String(body?.review ?? "").trim();

    if (!reviewId)
      return NextResponse.json(
        { error: "review_id is required" },
        { status: 400 },
      );
    if (!reviewText)
      return NextResponse.json(
        { error: "review cannot be empty" },
        { status: 400 },
      );
    if (reviewText.length > MAX_REVIEW_LENGTH)
      return NextResponse.json(
        { error: `review must be ${MAX_REVIEW_LENGTH} characters or fewer` },
        { status: 400 },
      );

    const supabase = createSupabaseAdminClient();

    const { data, error } = await supabase
      .from(TABLE)
      .update({ review: reviewText, updated_at: new Date().toISOString() })
      .eq("id", reviewId)
      .eq("user_id", userId) // ownership check
      .select("id, user_id, review, created_at, updated_at")
      .maybeSingle();

    if (error) throw new Error(error.message);
    if (!data)
      return NextResponse.json(
        { error: "Review not found or not yours" },
        { status: 404 },
      );

    return NextResponse.json({ review: { ...data, is_own: true } });
  } catch (err) {
    return NextResponse.json(
      { error: err.message || "Failed to update review" },
      { status: 500 },
    );
  }
}

// DELETE /api/user/task/feed-reviews?reviewId=...
export async function DELETE(request) {
  try {
    const userId = await getUserId();
    if (!userId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const reviewId = request.nextUrl.searchParams.get("reviewId");
    if (!reviewId)
      return NextResponse.json(
        { error: "reviewId is required" },
        { status: 400 },
      );

    const supabase = createSupabaseAdminClient();

    const { error } = await supabase
      .from(TABLE)
      .delete()
      .eq("id", reviewId)
      .eq("user_id", userId); // ownership check

    if (error) throw new Error(error.message);

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json(
      { error: err.message || "Failed to delete review" },
      { status: 500 },
    );
  }
}
