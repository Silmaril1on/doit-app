import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/app/[locale]/lib/supabase/supabaseServer";
import { requireAdmin } from "@/app/api/_lib/authGuard";

const TABLE = "task_categories";

export async function GET() {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;
  try {
    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase
      .from(TABLE)
      .select("*")
      .order("id", { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ categories: data ?? [] });
  } catch (err) {
    return NextResponse.json(
      {
        error:
          err instanceof Error ? err.message : "Failed to fetch categories",
      },
      { status: 500 },
    );
  }
}

export async function POST(request) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;
  try {
    const body = await request.json();
    const label = String(body?.label || "").trim();

    if (!label) {
      return NextResponse.json({ error: "label is required" }, { status: 400 });
    }

    const supabase = createSupabaseAdminClient();
    const basePayload = {
      label,
      description: body?.description ?? null,
      icon: body?.icon ?? null,
    };

    let { data, error } = await supabase
      .from(TABLE)
      .insert(basePayload)
      .select()
      .single();

    if (
      error &&
      (error.message?.includes('null value in column "id"') ||
        error.message?.includes(
          "duplicate key value violates unique constraint",
        ))
    ) {
      const { data: lastRows, error: lastError } = await supabase
        .from(TABLE)
        .select("id")
        .order("id", { ascending: false })
        .limit(1);

      if (lastError) {
        return NextResponse.json({ error: lastError.message }, { status: 500 });
      }

      const nextId = Number(lastRows?.[0]?.id || 0) + 1;
      ({ data, error } = await supabase
        .from(TABLE)
        .insert({ ...basePayload, id: nextId })
        .select()
        .single());
    }

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ category: data }, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      {
        error: err instanceof Error ? err.message : "Failed to create category",
      },
      { status: 500 },
    );
  }
}
