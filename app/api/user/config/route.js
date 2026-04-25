import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { supabaseAdmin } from "@/app/[locale]/lib/supabase/supabaseServer";

const TABLE = "user_configs";
const VALID_COLORS = new Set([
  "teal",
  "gold",
  "blue",
  "crimson",
  "grey",
  "violet",
  "coffee",
]);

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
      .from(TABLE)
      .select("color_value")
      .eq("user_id", userId)
      .maybeSingle();

    if (error) throw new Error(error.message);

    return NextResponse.json({ config: data ?? null });
  } catch (err) {
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 },
    );
  }
}

export async function POST(request) {
  try {
    const userId = await getUserId();
    if (!userId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { color_value } = await request.json();

    if (!VALID_COLORS.has(color_value)) {
      return NextResponse.json(
        { error: "Invalid color value" },
        { status: 400 },
      );
    }

    const now = new Date().toISOString();
    const { data, error } = await supabaseAdmin
      .from(TABLE)
      .upsert(
        { user_id: userId, color_value, updated_at: now },
        { onConflict: "user_id" },
      )
      .select("color_value")
      .single();

    if (error) throw new Error(error.message);

    return NextResponse.json({ config: data });
  } catch (err) {
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 },
    );
  }
}
