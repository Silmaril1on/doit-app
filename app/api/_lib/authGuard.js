import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/app/[locale]/lib/supabase/supabaseServer";

/**
 * Verifies that the requester is an authenticated admin.
 * Returns { userId } on success.
 * Returns a NextResponse 401/403 on failure — caller must return it immediately.
 *
 * Usage:
 *   const result = await requireAdmin();
 *   if (result instanceof NextResponse) return result;
 *   const { userId } = result;
 */
export async function requireAdmin() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("doit-user-id")?.value ?? null;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: user, error } = await supabaseAdmin
    .from("users")
    .select("is_admin")
    .eq("id", userId)
    .maybeSingle();

  if (error || !user?.is_admin) {
    return NextResponse.json(
      { error: "Forbidden: admin access required" },
      { status: 403 },
    );
  }

  return { userId };
}

/**
 * Verifies that the requester is authenticated (any role).
 * Returns { userId } on success, NextResponse 401 on failure.
 */
export async function requireAuth() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("doit-user-id")?.value ?? null;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return { userId };
}
