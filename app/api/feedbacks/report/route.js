import { NextResponse } from "next/server";
import { submitFeedback } from "@/app/[locale]/lib/services/feedback/feedbackService";

export async function POST(request) {
  try {
    const formData = await request.formData();
    const title = formData.get("title");
    const content = formData.get("content");
    const imageFile = formData.get("image") ?? null;

    if (!title || !content) {
      return NextResponse.json(
        { error: "title and content are required" },
        { status: 400 },
      );
    }

    await submitFeedback({ type: "report", title, content, imageFile });
    return NextResponse.json({ success: true }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
