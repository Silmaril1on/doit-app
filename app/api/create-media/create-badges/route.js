import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/app/[locale]/lib/supabase/supabaseServer";

const MODEL = "seedream-4-0-250828";
const API_URL = `${process.env.BYTEPLUS_BASE_URL}/images/generations`;
const BUCKET = "ai-uploads";

async function uploadBase64Image(base64DataUrl, index) {
  const match = base64DataUrl.match(/^data:(image\/\w+);base64,(.+)$/);
  if (!match) throw new Error(`Invalid image data at index ${index}`);

  const contentType = match[1];
  const ext = contentType.split("/")[1] ?? "jpg";
  const buffer = Buffer.from(match[2], "base64");
  const path = `tmp/${Date.now()}-ref-${index}.${ext}`;

  const { error } = await supabaseAdmin.storage
    .from(BUCKET)
    .upload(path, buffer, { contentType, upsert: false });

  if (error) throw new Error(`Storage upload failed: ${error.message}`);

  const { data } = supabaseAdmin.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { prompt, size = "1:1", watermark = false, images = [] } = body;

    if (!prompt?.trim()) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 },
      );
    }

    // Resolve images: upload base64 to storage to get public URLs
    const resolvedUrls = [];
    for (let i = 0; i < images.length; i++) {
      const img = images[i];
      if (img.startsWith("data:")) {
        const url = await uploadBase64Image(img, i);
        resolvedUrls.push(url);
      } else {
        resolvedUrls.push(img);
      }
    }

    const payload = {
      model: MODEL,
      prompt: prompt.trim(),
      sequential_image_generation: "disabled",
      response_format: "url",
      size,
      stream: false,
      watermark,
    };

    if (resolvedUrls.length === 1) payload.image = resolvedUrls[0];
    else if (resolvedUrls.length > 1) payload.image = resolvedUrls;

    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.BYTEPLUS_API_KEY}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.error?.message ?? `BytePlus error ${response.status}` },
        { status: response.status },
      );
    }

    return NextResponse.json({
      url: data.data?.[0]?.url ?? null,
      usage: data.usage ?? null,
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
