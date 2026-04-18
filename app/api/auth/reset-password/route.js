import { NextResponse } from "next/server";
import { Resend } from "resend";
import { createSupabaseAdminClient } from "@/app/[locale]/lib/supabase/supabaseServer";

const resend = new Resend(process.env.RESEND_API_KEY);
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export async function POST(request) {
  try {
    const { email } = await request.json();

    if (!email || !EMAIL_REGEX.test(email)) {
      return NextResponse.json(
        { error: "A valid email is required." },
        { status: 400 },
      );
    }

    const projectUrl = (
      process.env.PROJECT_URL || "http://localhost:3000"
    ).replace(/\/+$/, "");
    const admin = createSupabaseAdminClient();

    const { data: linkData, error: linkError } =
      await admin.auth.admin.generateLink({
        type: "recovery",
        email,
        options: {
          redirectTo: `${projectUrl}/reset-password/update-password`,
        },
      });

    if (!linkError && linkData?.properties?.action_link) {
      await resend.emails.send({
        from: "DoIt App <noreply@updates.listory.us>",
        to: email,
        subject: "Reset your DoIt password",
        html: `
          <div style="font-family:sans-serif;max-width:540px;margin:0 auto;background:#000;padding:40px 32px;border-radius:12px;border:1px solid rgba(20,184,166,0.2)">
            <h1 style="color:#14b8a6;font-size:30px;font-weight:800;letter-spacing:0.06em;text-transform:uppercase;margin:0 0 8px">Password Reset</h1>
            <p style="color:#d4c5a9;font-size:15px;line-height:1.7;margin:0 0 28px">
              We received a request to reset the password for your <strong style="color:#fff">DoIt</strong> account.<br/>
              Click the button below - this link expires in <strong style="color:#14b8a6">1 hour</strong>.
            </p>
            <a href="${linkData.properties.action_link}"
               style="display:inline-block;background:#14b8a6;color:#000;font-size:14px;font-weight:800;letter-spacing:0.08em;text-transform:uppercase;padding:14px 32px;border-radius:4px;text-decoration:none">
              Reset Password
            </a>
            <p style="color:#6b7280;font-size:12px;margin-top:36px;line-height:1.6">
              If you did not request this, you can safely ignore this email.<br/>
              Your password will not change.
            </p>
            <div style="margin-top:32px;padding-top:20px;border-top:1px solid rgba(255,255,255,0.06)">
              <p style="color:#374151;font-size:11px;margin:0">DoIt App � Task Management</p>
            </div>
          </div>
        `,
      });
    }

    // Always return 200 to prevent email enumeration
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to send reset email. Please try again." },
      { status: 500 },
    );
  }
}
