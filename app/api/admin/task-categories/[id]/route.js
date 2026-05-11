import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/app/[locale]/lib/supabase/supabaseServer";
import { requireAdmin } from "@/app/api/_lib/authGuard";

const TABLE = "task_categories";

export async function PATCH(request, { params }) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;
  try {
    const resolvedParams = await params;
    const id = Number(resolvedParams?.id);
    if (!id) {
      return NextResponse.json(
        { error: "Invalid category id" },
        { status: 400 },
      );
    }

    const body = await request.json();
    const updates = {};
    if (body.label !== undefined)
      updates.label = String(body.label || "").trim();
    if (body.description !== undefined)
      updates.description = body.description ?? null;
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

    return NextResponse.json({ category: data });
  } catch (err) {
    return NextResponse.json(
      {
        error: err instanceof Error ? err.message : "Failed to update category",
      },
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
      return NextResponse.json(
        { error: "Invalid category id" },
        { status: 400 },
      );
    }

    const supabase = createSupabaseAdminClient();
    const { error } = await supabase.from(TABLE).delete().eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json(
      {
        error: err instanceof Error ? err.message : "Failed to delete category",
      },
      { status: 500 },
    );
  }
}
