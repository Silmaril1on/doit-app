import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/app/[locale]/lib/supabase/supabaseServer";

export async function POST(request) {
  try {
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "").trim();

    if (!token) {
      return NextResponse.json(
        { error: "Authentication required." },
        { status: 401 },
      );
    }

    const admin = createSupabaseAdminClient();

    const {
      data: { user },
      error: userError,
    } = await admin.auth.getUser(token);
    if (userError || !user) {
      return NextResponse.json(
        { error: "Invalid or expired session." },
        { status: 401 },
      );
    }

    const { password } = await request.json();
    if (!password || password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters." },
        { status: 400 },
      );
    }

    const { error: updateError } = await admin.auth.admin.updateUserById(
      user.id,
      { password },
    );
    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      null;

    // Audit log - non-blocking
    try {
      await admin.from("user_passwords").insert({
        user_id: user.id,
        user_email: user.email,
        ip_address: ip,
        changed_by: "self",
      });
    } catch {}

    // Security notification - non-blocking
    try {
      await admin.from("notifications").insert({
        user_id: user.id,
        status: "Password Updated",
        message: "Your password has been successfully reset and updated.",
        priority: "low",
        display_name: user.user_metadata?.display_name || user.email || "User",
        has_read: false,
      });
    } catch {}

    return NextResponse.json({
      success: true,
      message: "Password updated successfully.",
    });
  } catch (err) {
    console.error("[update-password] Unhandled error:", err);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 },
    );
  }
}
