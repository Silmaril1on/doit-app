import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getUserXp } from "@/app/[locale]/lib/services/xp/xpProgress";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("doit-user-id")?.value ?? null;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const xp = await getUserXp(userId);
    return NextResponse.json({ xp }, { status: 200 });
  } catch (err) {
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 },
    );
  }
}
