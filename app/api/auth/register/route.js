import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createSupabaseAdminClient } from "@/app/[locale]/lib/supabase/supabaseServer";

export async function POST(request) {
  try {
    const body = await request.json();
    const displayName = String(body?.username || "").trim();
    const email = String(body?.email || "")
      .trim()
      .toLowerCase();
    const password = String(body?.password || "");

    if (!displayName || !email || !password) {
      return NextResponse.json(
        { error: "Username, email, and password are required" },
        { status: 400 },
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters long" },
        { status: 400 },
      );
    }

    const supabase = createSupabaseAdminClient();
    const { data: createdUser, error: authError } =
      await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          display_name: displayName,
        },
      });

    if (authError || !createdUser?.user?.id) {
      return NextResponse.json(
        { error: authError?.message || "Failed to create auth user" },
        { status: 500 },
      );
    }

    const userId = createdUser.user.id;
    const { error: profileError } = await supabase.from("users").insert({
      id: userId,
      display_name: displayName,
      email,
    });

    if (profileError) {
      await supabase.auth.admin.deleteUser(userId);

      return NextResponse.json(
        { error: profileError.message || "Failed to create user profile" },
        { status: 500 },
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

    if (signInError || !sessionData?.session) {
      await supabase.from("users").delete().eq("id", userId);
      await supabase.auth.admin.deleteUser(userId);

      return NextResponse.json(
        { error: signInError?.message || "Failed to create auth session" },
        { status: 500 },
      );
    }

    const userPayload = {
      id: userId,
      email,
      display_name: displayName,
      first_name: null,
      last_name: null,
      image_url: null,
    };

    const response = NextResponse.json(
      {
        message: "Registration successful",
        user: userPayload,
      },
      { status: 201 },
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

    response.cookies.set("doit-user-id", userId, {
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
        error: error instanceof Error ? error.message : "Registration failed",
      },
      { status: 500 },
    );
  }
}
