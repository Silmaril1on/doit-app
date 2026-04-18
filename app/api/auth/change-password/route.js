import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createSupabaseAdminClient } from "@/app/[locale]/lib/supabase/supabaseServer";
import { cookies } from "next/headers";

const MAX_PASSWORD_RECORDS = 3;

export async function POST(request) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("doit-user-id")?.value ?? null;

    if (!userId) {
      return NextResponse.json(
        { error: "Authentication required." },
        { status: 401 },
      );
    }

    const { currentPassword, newPassword } = await request.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: "Current password and new password are required." },
        { status: 400 },
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: "New password must be at least 6 characters." },
        { status: 400 },
      );
    }

    const admin = createSupabaseAdminClient();

    // Fetch the user's email via admin
    const {
      data: { user },
      error: fetchError,
    } = await admin.auth.admin.getUserById(userId);

    if (fetchError || !user?.email) {
      return NextResponse.json(
        { error: "Could not retrieve user account." },
        { status: 404 },
      );
    }

    // Verify current password by attempting a sign-in
    const authClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      },
    );

    const { error: signInError } = await authClient.auth.signInWithPassword({
      email: user.email,
      password: currentPassword,
    });

    if (signInError) {
      return NextResponse.json(
        { error: "Current password is incorrect." },
        { status: 400 },
      );
    }

    // Update password via admin
    const { error: updateError } = await admin.auth.admin.updateUserById(
      userId,
      { password: newPassword },
    );

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      null;

    // Enforce max 3 records: delete oldest to make room before inserting
    try {
      const { data: existing } = await admin
        .from("user_passwords")
        .select("id, created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: true });

      if (existing && existing.length >= MAX_PASSWORD_RECORDS) {
        const toDelete = existing.slice(
          0,
          existing.length - MAX_PASSWORD_RECORDS + 1,
        );
        const idsToDelete = toDelete.map((r) => r.id);
        await admin.from("user_passwords").delete().in("id", idsToDelete);
      }

      await admin.from("user_passwords").insert({
        user_id: userId,
        user_email: user.email,
        ip_address: ip,
        changed_by: "change",
      });
    } catch {}

    // Security notification — non-blocking
    try {
      await admin.from("notifications").insert({
        user_id: userId,
        status: "Password Updated",
        message: "Your password has been successfully changed.",
        priority: "low",
        display_name: user.user_metadata?.display_name || user.email || "User",
        has_read: false,
      });
    } catch {}

    return NextResponse.json({
      success: true,
      message: "Password changed successfully.",
    });
  } catch (err) {
    console.error("[change-password] Unhandled error:", err);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 },
    );
  }
}
