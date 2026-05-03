import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/app/[locale]/lib/supabase/supabaseServer";

const BUCKET = "badges_gallery";

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || typeof file === "string") {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const extFromName = file.name?.split(".").pop();
    const extFromType = file.type?.split("/")?.[1];
    const ext = String(extFromName || extFromType || "jpg").toLowerCase();
    const stamp = Date.now();
    const rand = Math.random().toString(36).slice(2, 8);
    const filePath = `badges/${stamp}-${rand}.${ext}`;

    const buffer = Buffer.from(await file.arrayBuffer());
    const supabase = createSupabaseAdminClient();

    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(filePath, buffer, {
        contentType: file.type || "image/jpeg",
        upsert: false,
      });

    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    const { data } = supabase.storage.from(BUCKET).getPublicUrl(filePath);

    return NextResponse.json({ url: data.publicUrl, path: filePath });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Upload failed" },
      { status: 500 },
    );
  }
}
