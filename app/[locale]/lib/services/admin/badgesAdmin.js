"use server";
import { supabaseAdmin } from "@/app/[locale]/lib/supabase/supabaseServer";

/**
 * SSR-only service functions for the admin badges CRUD page.
 * Called directly from Server Components (page.js) for initial data hydration.
 * Client-side mutations go through the API routes via SWR.
 */

export async function getAdminCategories() {
  const { data, error } = await supabaseAdmin
    .from("task_categories")
    .select("*")
    .order("id", { ascending: true });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getAdminTiers() {
  const { data, error } = await supabaseAdmin
    .from("category_achievement_tiers")
    .select("*")
    .order("category_id", { ascending: true })
    .order("required_count", { ascending: true });
  if (error) throw new Error(error.message);
  return data ?? [];
}
