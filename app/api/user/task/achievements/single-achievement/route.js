import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getAchievementById } from "@/app/[locale]/lib/services/tasks/achivements/myAchievements";

async function getUserId() {
  const cookieStore = await cookies();
  return cookieStore.get("doit-user-id")?.value ?? null;
}

function getAchievementId(request) {
  const sp = request.nextUrl.searchParams;
  return (
    sp.get("id") ||
    sp.get("achievementId") ||
    sp.get("achievement_id") ||
    null
  );
}

export async function GET(request) {
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

    const achievement = await getAchievementById(userId, achievementId);
    return NextResponse.json({ achievement }, { status: 200 });
  } catch (err) {
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 },
    );
  }
}
