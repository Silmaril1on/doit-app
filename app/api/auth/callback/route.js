import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { createSupabaseAdminClient } from "@/app/[locale]/lib/supabase/supabaseServer";

export async function GET(request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const locale = searchParams.get("locale") || "en";
  const errorRedirect = `${origin}/${locale}/login?error=oauth_failed`;

  if (!code) {
    return NextResponse.redirect(errorRedirect);
  }

  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { session },
    error: exchangeError,
  } = await supabase.auth.exchangeCodeForSession(code);

  if (exchangeError || !session) {
    return NextResponse.redirect(errorRedirect);
  }

  const admin = createSupabaseAdminClient();
  const userId = session.user.id;
  const email = session.user.email;
  const googleDisplayName =
    session.user.user_metadata?.full_name ||
    session.user.user_metadata?.name ||
    email?.split("@")[0] ||
    "User";
  const googleAvatar = session.user.user_metadata?.avatar_url || null;

  // Insert new user; if already exists (email/password signup), leave their data intact
  await admin.from("users").upsert(
    {
      id: userId,
      email,
      display_name: googleDisplayName,
      image_url: googleAvatar,
      email_verified: true,
    },
    { onConflict: "id", ignoreDuplicates: true },
  );

  // Fetch the final profile (may have been customised previously)
  const { data: profile } = await admin
    .from("users")
    .select("id, display_name, email, first_name, last_name, image_url")
    .eq("id", userId)
    .maybeSingle();

  const userPayload = {
    id: userId,
    email: profile?.email || email,
    display_name: profile?.display_name || googleDisplayName,
    first_name: profile?.first_name || null,
    last_name: profile?.last_name || null,
    image_url: profile?.image_url || googleAvatar,
  };

  const isProduction = process.env.NODE_ENV === "production";
  const cookieBase = {
    sameSite: "lax",
    secure: isProduction,
    path: "/",
  };

  const response = NextResponse.redirect(`${origin}/${locale}`);

  response.cookies.set("doit-access-token", session.access_token, {
    ...cookieBase,
    httpOnly: true,
    maxAge: session.expires_in ?? 3600,
  });

  response.cookies.set("doit-refresh-token", session.refresh_token, {
    ...cookieBase,
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 30,
  });

  response.cookies.set("doit-user-id", userPayload.id, {
    ...cookieBase,
    maxAge: 60 * 60 * 24 * 30,
  });

  response.cookies.set("doit-user", JSON.stringify(userPayload), {
    ...cookieBase,
    maxAge: 60 * 60 * 24 * 30,
  });

  return response;
}
