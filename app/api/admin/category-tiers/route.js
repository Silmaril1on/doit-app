import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/app/[locale]/lib/supabase/supabaseServer";

const TABLE = "category_achievement_tiers";

export async function GET(request) {
  try {
    const categoryId = request.nextUrl.searchParams.get("categoryId");
    const supabase = createSupabaseAdminClient();

    let query = supabase
      .from(TABLE)
      .select("*")
      .order("category_id", { ascending: true })
      .order("required_count", { ascending: true });

    if (categoryId) {
      query = query.eq("category_id", Number(categoryId));
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ tiers: data ?? [] });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to fetch tiers" },
      { status: 500 },
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const categoryId = Number(body?.category_id);
    const level = Number(body?.level);
    const requiredCount = Number(body?.required_count);
    const title = String(body?.title || "").trim();

    if (!categoryId || !level || !title) {
      return NextResponse.json(
        { error: "category_id, level, and title are required" },
        { status: 400 },
      );
    }

    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase
      .from(TABLE)
      .insert({
        category_id: categoryId,
        level,
        required_count: requiredCount || 0,
        title,
        icon: body?.icon ?? null,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ tier: data }, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to create tier" },
      { status: 500 },
    );
  }
}
