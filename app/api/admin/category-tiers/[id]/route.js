import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/app/[locale]/lib/supabase/supabaseServer";
import { requireAdmin } from "@/app/api/_lib/authGuard";

const TABLE = "category_achievement_tiers";

export async function PATCH(request, { params }) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;
  try {
    const resolvedParams = await params;
    const id = Number(resolvedParams?.id);
    if (!id) {
      return NextResponse.json({ error: "Invalid tier id" }, { status: 400 });
    }

    const body = await request.json();
    const updates = {};
    if (body.category_id !== undefined)
      updates.category_id = Number(body.category_id);
    if (body.level !== undefined) updates.level = Number(body.level);
    if (body.required_count !== undefined)
      updates.required_count = Number(body.required_count);
    if (body.title !== undefined)
      updates.title = String(body.title || "").trim();
    if (body.icon !== undefined) updates.icon = body.icon ?? null;

    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase
      .from(TABLE)
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ tier: data });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to update tier" },
      { status: 500 },
    );
  }
}

export async function DELETE(request, { params }) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;
  try {
    const resolvedParams = await params;
    const id = Number(resolvedParams?.id);
    if (!id) {
      return NextResponse.json({ error: "Invalid tier id" }, { status: 400 });
    }

    const supabase = createSupabaseAdminClient();
    const { error } = await supabase.from(TABLE).delete().eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to delete tier" },
      { status: 500 },
    );
  }
}
