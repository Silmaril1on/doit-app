import { NextResponse } from "next/server";

const MODEL = "seedream-4-5-251128";
const API_URL = `${process.env.BYTEPLUS_BASE_URL}/images/generations`;

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

    const payload = {
      model: MODEL,
      prompt: prompt.trim(),
      sequential_image_generation: "disabled",
      response_format: "url",
      size,
      stream: false,
      watermark,
    };

    if (images.length === 1) payload.image = images[0];
    else if (images.length > 1) payload.image = images;

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
