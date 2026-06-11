import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

export async function POST() {
  const cookieStore = cookies();
  const response = NextResponse.json({ success: true });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get: (name) => cookieStore.get(name)?.value,
        set: (name, value, options) => {
          response.cookies.set({ name, value, ...options });
        },
        remove: (name, options) => {
          response.cookies.set({ name, value: "", ...options, maxAge: 0 });
        },
      },
    },
  );

  try {
    await supabase.auth.signOut();
  } catch {
    // ignore sign-out errors; cookies are cleared below
  }

  response.cookies.set("doit-access-token", "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });

  response.cookies.set("doit-refresh-token", "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });

  response.cookies.set("doit-user-id", "", {
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });

  response.cookies.set("doit-user", "", {
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });

  // Clear Supabase auth cookies (sb-*) that prevent auth routes from loading
  for (const { name } of cookieStore.getAll()) {
    if (
      name.startsWith("sb-") ||
      name.startsWith("__Secure-sb-") ||
      name.startsWith("__Host-sb-")
    ) {
      response.cookies.set(name, "", {
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 0,
        expires: new Date(0),
      });
    }
  }

  return response;
}
