import { NextResponse } from "next/server";
import { getFriendshipStatus } from "@/app/[locale]/lib/services/user/friendships";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 },
      );
    }

    const result = await getFriendshipStatus(userId);
    return NextResponse.json(result, { status: 200 });
  } catch (err) {
    const status = err.message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ error: err.message }, { status });
  }
}
