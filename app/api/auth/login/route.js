import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createSupabaseAdminClient } from "@/app/[locale]/lib/supabase/supabaseServer";

export async function POST(request) {
  try {
    const body = await request.json();
    const email = String(body?.email || "")
      .trim()
      .toLowerCase();
    const password = String(body?.password || "");

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 },
      );
    }

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

    const { data: sessionData, error: signInError } =
      await authClient.auth.signInWithPassword({
        email,
        password,
      });

    if (signInError || !sessionData?.session || !sessionData?.user?.id) {
      return NextResponse.json(
        { error: signInError?.message || "Invalid login credentials" },
        { status: 401 },
      );
    }

    const supabase = createSupabaseAdminClient();
    const { data: profile, error: profileError } = await supabase
      .from("users")
      .select("id, display_name, email, first_name, last_name, image_url")
      .eq("id", sessionData.user.id)
      .maybeSingle();

    if (profileError) {
      return NextResponse.json(
        { error: profileError.message || "Failed to load user profile" },
        { status: 500 },
      );
    }

    const userPayload = {
      id: sessionData.user.id,
      email: profile?.email || sessionData.user.email || email,
      display_name:
        profile?.display_name ||
        sessionData.user.user_metadata?.display_name ||
        sessionData.user.email ||
        "User",
      first_name: profile?.first_name || null,
      last_name: profile?.last_name || null,
      image_url: profile?.image_url || null,
    };

    const response = NextResponse.json(
      {
        message: "Login successful",
        user: userPayload,
      },
      { status: 200 },
    );

    response.cookies.set(
      "doit-access-token",
      sessionData.session.access_token,
      {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: sessionData.session.expires_in ?? 3600,
      },
    );

    response.cookies.set(
      "doit-refresh-token",
      sessionData.session.refresh_token,
      {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 60 * 60 * 24 * 30,
      },
    );

    response.cookies.set("doit-user-id", userPayload.id, {
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });

    response.cookies.set("doit-user", JSON.stringify(userPayload), {
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });

    return response;
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Login failed",
      },
      { status: 500 },
    );
  }
}
