import { NextResponse } from "next/server";
import {
  getFriends,
  removeFriend,
} from "@/app/[locale]/lib/services/user/friendships";

export async function GET() {
  try {
    const friends = await getFriends();
    return NextResponse.json({ friends }, { status: 200 });
  } catch (err) {
    const status = err.message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ error: err.message }, { status });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const friendshipId = searchParams.get("friendshipId");

    if (!friendshipId) {
      return NextResponse.json(
        { error: "friendshipId is required" },
        { status: 400 },
      );
    }

    await removeFriend(friendshipId);
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    const status = err.message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ error: err.message }, { status });
  }
}
