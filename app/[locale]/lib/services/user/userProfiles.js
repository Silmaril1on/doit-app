"use server";
import { supabaseAdmin } from "@/app/[locale]/lib/supabase/supabaseServer";

const ALLOWED_UPDATE_FIELDS = [
  "display_name",
  "first_name",
  "last_name",
  "date",
  "sex",
  "phone_number",
  "address",
  "zip",
  "city",
  "country",
];

export async function getAllUsers() {
  const { data, error } = await supabaseAdmin
    .from("users")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data;
}

export async function getUserById(userId) {
  if (!userId) throw new Error("userId is required");

  const { data, error } = await supabaseAdmin
    .from("users")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function updateUser(userId, updates) {
  if (!userId) throw new Error("userId is required");

  const filteredUpdates = Object.fromEntries(
    Object.entries(updates).filter(([key]) =>
      ALLOWED_UPDATE_FIELDS.includes(key),
    ),
  );

  if (Object.keys(filteredUpdates).length === 0) {
    throw new Error("No valid fields to update");
  }

  const { data, error } = await supabaseAdmin
    .from("users")
    .update(filteredUpdates)
    .eq("id", userId)
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function getUserByDisplayName(displayName) {
  if (!displayName) throw new Error("displayName is required");

  const { data, error } = await supabaseAdmin
    .from("users")
    .select("*")
    .eq("display_name", displayName)
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function searchUsersByDisplayName(query) {
  if (!query || query.trim().length < 2) return [];

  const { data, error } = await supabaseAdmin
    .from("users")
    .select("id, display_name, first_name, last_name, email, image_url")
    .ilike("display_name", `%${query.trim()}%`)
    .limit(5);

  if (error) throw new Error(error.message);
  return data ?? [];
}
