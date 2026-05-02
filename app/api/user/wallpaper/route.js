import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createSupabaseAdminClient } from "@/app/[locale]/lib/supabase/supabaseServer";

const BUCKET = "user_profile_images";
const WALLPAPER_PATH = (userId) => `${userId}/wallpaper.jpg`;

async function getUserId() {
  const cookieStore = await cookies();
  return cookieStore.get("doit-user-id")?.value ?? null;
}

export async function POST(request) {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || typeof file === "string") {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const supabase = createSupabaseAdminClient();
    const filePath = WALLPAPER_PATH(userId);

    await supabase.storage.from(BUCKET).remove([filePath]);

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(filePath, buffer, {
        contentType: "image/jpeg",
        upsert: true,
      });

    if (uploadError) throw new Error(uploadError.message);

    const { data: urlData } = supabase.storage
      .from(BUCKET)
      .getPublicUrl(filePath);

    const imageUrl = `${urlData.publicUrl}?t=${Date.now()}`;

    const { error: updateError } = await supabase
      .from("users")
      .update({ wallpaper_image_url: imageUrl })
      .eq("id", userId);

    if (updateError) throw new Error(updateError.message);

    return NextResponse.json({ imageUrl });
  } catch (err) {
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 },
    );
  }
}

// PATCH — set wallpaper from a catalog URL (no file upload, just update the DB reference)
export async function PATCH(request) {
  try {
    const userId = await getUserId();
    if (!userId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { url } = await request.json();
    if (!url || typeof url !== "string")
      return NextResponse.json({ error: "Invalid url" }, { status: 400 });

    const supabase = createSupabaseAdminClient();
    const { error } = await supabase
      .from("users")
      .update({ wallpaper_image_url: url })
      .eq("id", userId);

    if (error) throw new Error(error.message);

    return NextResponse.json({ imageUrl: url });
  } catch (err) {
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 },
    );
  }
}

  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || typeof file === "string") {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const supabase = createSupabaseAdminClient();
    const filePath = WALLPAPER_PATH(userId);

    await supabase.storage.from(BUCKET).remove([filePath]);

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(filePath, buffer, {
        contentType: "image/jpeg",
        upsert: true,
      });

    if (uploadError) throw new Error(uploadError.message);

    const { data: urlData } = supabase.storage
      .from(BUCKET)
      .getPublicUrl(filePath);

    const imageUrl = `${urlData.publicUrl}?t=${Date.now()}`;

    const { error: updateError } = await supabase
      .from("users")
      .update({ wallpaper_image_url: imageUrl })
      .eq("id", userId);

    if (updateError) throw new Error(updateError.message);

    return NextResponse.json({ imageUrl });
  } catch (err) {
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 },
    );
  }
}
