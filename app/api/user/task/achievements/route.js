import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  getAllAchievements,
  updateAchievement,
} from "@/app/[locale]/lib/services/tasks/achivements/myAchievements";
import { batchGetTaskLikesStatus } from "@/app/[locale]/lib/services/tasks/feed/taskLikes";
import { batchGetTaskReviewCounts } from "@/app/[locale]/lib/services/tasks/feed/taskReviews";

async function getUserId() {
  const cookieStore = await cookies();
  return cookieStore.get("doit-user-id")?.value ?? null;
}

function getAchievementId(request) {
  const sp = request.nextUrl.searchParams;
  return (
    sp.get("id") || sp.get("achievementId") || sp.get("achievement_id") || null
  );
}

export async function GET(request) {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const limit = Number(request.nextUrl.searchParams.get("limit") ?? 20);
    const offset = Number(request.nextUrl.searchParams.get("offset") ?? 0);
    const { achievements, total } = await getAllAchievements(userId, {
      limit,
      offset,
    });

    // Enrich with like and review counts in a single extra round-trip each
    const taskIds = achievements.map((a) => a.id);
    const [likesStatus, reviewsStatus] = await Promise.all([
      batchGetTaskLikesStatus(taskIds),
      batchGetTaskReviewCounts(taskIds),
    ]);

    const enriched = achievements.map((a) => ({
      ...a,
      like_count: likesStatus[a.id]?.like_count ?? 0,
      is_liked: likesStatus[a.id]?.is_liked ?? false,
      review_count: reviewsStatus[a.id]?.review_count ?? 0,
      is_reviewed: reviewsStatus[a.id]?.is_reviewed ?? false,
    }));

    return NextResponse.json(
      { achievements: enriched, total },
      { status: 200 },
    );
  } catch (err) {
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 },
    );
  }
}

export async function PATCH(request) {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const achievementId = getAchievementId(request);
    if (!achievementId) {
      return NextResponse.json(
        { error: "achievementId is required" },
        { status: 400 },
      );
    }

    const payload = await request.json();
    const achievement = await updateAchievement(userId, achievementId, payload);
    return NextResponse.json({ achievement }, { status: 200 });
  } catch (err) {
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 },
    );
  }
}
