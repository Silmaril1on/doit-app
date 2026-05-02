import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { supabaseAdmin } from "@/app/[locale]/lib/supabase/supabaseServer";

const VALID = new Set(["easy", "medium", "hard"]);

async function getUserId() {
  const cookieStore = await cookies();
  return cookieStore.get("doit-user-id")?.value ?? null;
}

export async function GET() {
  try {
    const userId = await getUserId();
    if (!userId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data, error } = await supabaseAdmin
      .from("users")
      .select("game_difficulty")
      .eq("id", userId)
      .maybeSingle();

    if (error) throw new Error(error.message);
    return NextResponse.json({ difficulty: data?.game_difficulty ?? null });
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
    if (!userId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { difficulty } = await request.json();
    if (!VALID.has(difficulty))
      return NextResponse.json(
        { error: "Invalid difficulty" },
        { status: 400 },
      );

    const { error } = await supabaseAdmin
      .from("users")
      .update({ game_difficulty: difficulty })
      .eq("id", userId);

    if (error) throw new Error(error.message);
    return NextResponse.json({ difficulty });
  } catch (err) {
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 },
    );
  }
}
