import { NextResponse } from "next/server";
import { Resend } from "resend";
import { cookies } from "next/headers";
import { createSupabaseAdminClient } from "@/app/[locale]/lib/supabase/supabaseServer";

const resend = new Resend(process.env.RESEND_API_KEY);

async function getUserId() {
  const cookieStore = await cookies();
  return cookieStore.get("doit-user-id")?.value ?? null;
}

// GET - returns current user's email + email_verified status
export async function GET() {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const admin = createSupabaseAdminClient();
    const { data, error } = await admin
      .from("users")
      .select("email, email_verified")
      .eq("id", userId)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      email: data.email,
      email_verified: data.email_verified ?? false,
    });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// POST - sends verification email
export async function POST() {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const admin = createSupabaseAdminClient();
    const { data: userData } = await admin
      .from("users")
      .select("email, email_verified")
      .eq("id", userId)
      .single();

    if (!userData?.email) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (userData.email_verified) {
      return NextResponse.json(
        { error: "Email is already verified." },
        { status: 400 },
      );
    }

    const projectUrl = (
      process.env.PROJECT_URL || "http://localhost:3000"
    ).replace(/\/+$/, "");

    const { data: linkData, error: linkError } =
      await admin.auth.admin.generateLink({
        type: "magiclink",
        email: userData.email,
        options: {
          redirectTo: `${projectUrl}/verify-email`,
        },
      });

    if (linkError || !linkData?.properties?.action_link) {
      console.error("[verify-email] generateLink error:", linkError);
      return NextResponse.json(
        { error: "Failed to generate verification link." },
        { status: 500 },
      );
    }

    await resend.emails.send({
      from: "DoIt App <noreply@updates.listory.us>",
      to: userData.email,
      subject: "Verify your DoIt email address",
      html: `
        <div style="font-family:sans-serif;max-width:540px;margin:0 auto;background:#000;padding:40px 32px;border-radius:12px;border:1px solid rgba(20,184,166,0.2)">
          <h1 style="color:#14b8a6;font-size:30px;font-weight:800;letter-spacing:0.06em;text-transform:uppercase;margin:0 0 8px">Verify Email</h1>
          <p style="color:#d4c5a9;font-size:15px;line-height:1.7;margin:0 0 28px">
            Click the button below to verify your <strong style="color:#fff">DoIt</strong> email address.<br/>
            This link expires in <strong style="color:#14b8a6">1 hour</strong>.
          </p>
          <a href="${linkData.properties.action_link}"
             style="display:inline-block;background:#14b8a6;color:#000;font-size:14px;font-weight:800;letter-spacing:0.08em;text-transform:uppercase;padding:14px 32px;border-radius:4px;text-decoration:none">
            Verify Email Address
          </a>
          <p style="color:#6b7280;font-size:12px;margin-top:36px;line-height:1.6">
            If you did not request this, you can safely ignore this email.
          </p>
          <div style="margin-top:32px;padding-top:20px;border-top:1px solid rgba(255,255,255,0.06)">
            <p style="color:#374151;font-size:11px;margin:0">DoIt App - Task Management</p>
          </div>
        </div>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[verify-email] POST error:", err);
    return NextResponse.json(
      { error: "Failed to send verification email." },
      { status: 500 },
    );
  }
}

// PATCH - marks email_verified = true (called from the callback page)
export async function PATCH(request) {
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

    const { error } = await admin
      .from("users")
      .update({ email_verified: true })
      .eq("id", user.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Security notification - non-blocking
    try {
      await admin.from("notifications").insert({
        user_id: user.id,
        status: "Email Verified",
        message: "Your email address has been successfully verified.",
        priority: "low",
        display_name: user.user_metadata?.display_name || user.email || "User",
        has_read: false,
      });
    } catch {}

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[verify-email] PATCH error:", err);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 },
    );
  }
}
