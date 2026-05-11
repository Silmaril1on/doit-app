import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/app/[locale]/lib/supabase/supabaseServer";
import { requireAdmin } from "@/app/api/_lib/authGuard";

const BUCKET = "badges_gallery";

/**
 * DELETE /api/admin/badges-gallery/delete
 * Body: { url: string }   — public URL of the file to remove
 */
export async function DELETE(request) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;
  try {
    const body = await request.json();
    const url = String(body?.url || "").trim();

    if (!url) {
      return NextResponse.json({ error: "No URL provided" }, { status: 400 });
    }

    // Extract the storage path from the public URL.
    // Supabase public URLs look like:
    // https://<project>.supabase.co/storage/v1/object/public/<bucket>/<path>
    const marker = `/object/public/${BUCKET}/`;
    const idx = url.indexOf(marker);
    if (idx === -1) {
      return NextResponse.json(
        { error: "URL does not point to this bucket" },
        { status: 400 },
      );
    }

    const filePath = url.slice(idx + marker.length);
    const supabase = createSupabaseAdminClient();

    const { error: removeError } = await supabase.storage
      .from(BUCKET)
      .remove([filePath]);

    if (removeError) {
      return NextResponse.json({ error: removeError.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Delete failed" },
      { status: 500 },
    );
  }
}
