import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getUserById } from "@/app/[locale]/lib/services/user/userProfiles";

async function getUserId() {
  const cookieStore = await cookies();
  return cookieStore.get("doit-user-id")?.value ?? null;
}

export async function GET() {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const profile = await getUserById(userId);
    return NextResponse.json({ profile });
  } catch (err) {
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 },
    );
  }
}
