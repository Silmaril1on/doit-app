"use server";
import { cookies } from "next/headers";
import { supabaseAdmin } from "@/app/[locale]/lib/supabase/supabaseServer";

async function getCallerId() {
  const cookieStore = await cookies();
  return cookieStore.get("doit-user-id")?.value ?? null;
}

export async function submitFeedback({
  type,
  title,
  content,
  imageFile = null,
}) {
  const userId = await getCallerId();

  let imageUrl = null;

  if (imageFile && type === "report") {
    const fileName = `${Date.now()}-${imageFile.name.replace(/[^a-z0-9.\-_]/gi, "_")}`;
    const { error: uploadError } = await supabaseAdmin.storage
      .from("report_images")
      .upload(fileName, imageFile, { upsert: false });

    if (uploadError) throw new Error(uploadError.message);

    const { data: urlData } = supabaseAdmin.storage
      .from("report_images")
      .getPublicUrl(fileName);

    imageUrl = urlData?.publicUrl ?? null;
  }

  const { error } = await supabaseAdmin.from("feedbacks").insert({
    title,
    content,
    user_id: userId ?? null,
    image_url: imageUrl,
    type,
  });

  if (error) throw new Error(error.message);
}
