import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { routing } from "./i18n/routing";

const { locales, defaultLocale } = routing;

// Routes that require an authenticated session
const PROTECTED_PREFIXES = [
  "/feed",
  "/game-settings",
  "/tasks",
  "/generate-assets",
  "/qr",
  "/task-manager",
  "/admin-dashboard",
];

// Routes exclusively for admins — validated via DB using the service role client
const ADMIN_PREFIXES = ["/admin-dashboard"];

/**
 * Service-role client for the admin check only.
 * Uses the service-role key (server-only, never exposed to the browser) so it
 * bypasses RLS and reliably reads `users.is_admin`.
 */
function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}

// Routes that logged-in users should not visit
const GUEST_ONLY_PREFIXES = ["/login", "/register"];

// ─── helpers ──────────────────────────────────────────────────────────────

/** Strip the locale prefix: /en/feed → /feed, /de/feed → /feed */
function stripLocale(pathname) {
  for (const locale of locales) {
    if (pathname === `/${locale}` || pathname.startsWith(`/${locale}/`)) {
      return { locale, path: pathname.slice(locale.length + 1) || "/" };
    }
  }
  return { locale: defaultLocale, path: pathname };
}

function matchesAny(path, prefixes) {
  return prefixes.some((p) => path === p || path.startsWith(`${p}/`));
}

/**
 * CSRF: reject mutating API requests whose Origin doesn't match the app.
 * Uses exact origin comparison to prevent subdomain spoofing attacks.
 */
function csrfCheck(request) {
  const { pathname } = request.nextUrl;
  if (!pathname.startsWith("/api/")) return null;

  const method = request.method.toUpperCase();
  if (!["POST", "PUT", "PATCH", "DELETE"].includes(method)) return null;

  // Allow server-to-server requests that carry no Origin (e.g. cron jobs)
  const originHeader = request.headers.get("origin");
  if (!originHeader) return null;

  const appOrigin = request.nextUrl.origin;
  const allowedOrigins = [appOrigin, process.env.PROJECT_URL].filter(Boolean);

  // Exact origin match — prevents https://yourapp.com.evil.com bypass
  const isAllowed = allowedOrigins.some((allowed) => {
    try {
      return new URL(originHeader).origin === new URL(allowed).origin;
    } catch {
      return false;
    }
  });

  if (!isAllowed) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return null;
}

// ─── middleware ────────────────────────────────────────────────────────────

export async function proxy(request) {
  const { pathname } = request.nextUrl;

  // 1. API routes: CSRF guard only — never locale-rewrite them
  if (pathname.startsWith("/api/")) {
    const csrfError = csrfCheck(request);
    return csrfError ?? NextResponse.next();
  }

  // 2. Determine the locale and the path without its locale prefix
  const { locale, path: cleanPath } = stripLocale(pathname);
  const hasLocalePrefix = locales.some(
    (l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`),
  );
  const homePath = locale === defaultLocale ? "/" : `/${locale}`;

  const isProtected = matchesAny(cleanPath, PROTECTED_PREFIXES);
  const isAdminRoute = matchesAny(cleanPath, ADMIN_PREFIXES);
  const isGuestOnly = matchesAny(cleanPath, GUEST_ONLY_PREFIXES);

  // 3. Auth check (Supabase JWT validation) — only for routes that need it
  if (isProtected || isGuestOnly) {
    let supabaseResponse = NextResponse.next({ request });

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) =>
              request.cookies.set(name, value),
            );
            // Rebuild so refreshed tokens are forwarded to the browser
            supabaseResponse = NextResponse.next({ request });
            cookiesToSet.forEach(({ name, value, options }) =>
              supabaseResponse.cookies.set(name, value, options),
            );
          },
        },
      },
    );

    // Validates the JWT with Supabase (more secure than getSession)
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Unauthenticated user trying to access a protected route
    if (isProtected && !user) {
      return NextResponse.redirect(new URL(homePath, request.url));
    }

    // Admin route: validate is_admin via service-role client (bypasses RLS).
    // The doit-user cookie is JS-readable, so it cannot be trusted for authz.
    // This DB query runs ONLY on /admin-dashboard requests.
    if (isAdminRoute && user) {
      const adminClient = createAdminClient();
      const { data: profile } = await adminClient
        .from("users")
        .select("is_admin")
        .eq("id", user.id)
        .single();

      if (!profile?.is_admin) {
        return NextResponse.redirect(new URL(homePath, request.url));
      }
    }

    // Authenticated user trying to access login/register
    if (isGuestOnly && user) {
      return NextResponse.redirect(new URL(homePath, request.url));
    }

    // Auth passed — apply locale rewrite for the default locale if needed
    if (!hasLocalePrefix) {
      const url = request.nextUrl.clone();
      url.pathname = `/${defaultLocale}${pathname === "/" ? "" : pathname}`;
      const rewriteRes = NextResponse.rewrite(url);
      // Forward any refreshed Supabase session cookies
      supabaseResponse.cookies.getAll().forEach((cookie) => {
        rewriteRes.cookies.set(cookie.name, cookie.value, cookie);
      });
      return rewriteRes;
    }

    return supabaseResponse;
  }

  // 4. Public route — rewrite to add the default locale prefix if absent
  //    (localePrefix: "as-needed" omits the default locale from the URL)
  if (!hasLocalePrefix) {
    const url = request.nextUrl.clone();
    url.pathname = `/${defaultLocale}${pathname === "/" ? "" : pathname}`;
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

export const config = {
  // Run on every route except Next.js internals and static assets
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
