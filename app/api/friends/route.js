import { NextResponse } from "next/server";
import { getFriends } from "@/app/[locale]/lib/services/user/friendships";

export async function GET() {
  try {
    const friends = await getFriends();
    return NextResponse.json({ friends }, { status: 200 });
  } catch (err) {
    const status = err.message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ error: err.message }, { status });
  }
}
