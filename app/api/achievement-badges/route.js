import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  getAllCategoryProgress,
  markAllBadgesSeen,
} from "@/app/[locale]/lib/services/achievement-badges/categoryProgress";

async function getUserId() {
  const cookieStore = await cookies();
  return cookieStore.get("doit-user-id")?.value ?? null;
}

/**
 * GET /api/achievement-badges
 * Returns the authenticated user's category progress enriched with tier data.
 */
export async function GET() {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const progress = await getAllCategoryProgress(userId);
    return NextResponse.json({ progress }, { status: 200 });
  } catch (err) {
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 },
    );
  }
}

/**
 * PATCH /api/achievement-badges
 * Marks all unseen badges as seen for the authenticated user.
 * Called from the client when the My Achievements page first mounts.
 */
export async function PATCH() {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await markAllBadgesSeen(userId);
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (err) {
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 },
    );
  }
}
