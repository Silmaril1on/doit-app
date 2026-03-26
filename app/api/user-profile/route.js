 
  import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createSupabaseAdminClient } from "@/app/[locale]/lib/supabase/supabaseServer";

const PROFILE_FIELDS =
  "last_name, first_name, date, sex, phone_number, address, zip, city, country";

const ALLOWED_FIELDS = [
  "last_name",
  "first_name",
  "date",
  "sex",
  "phone_number",
  "address",
  "zip",
  "city",
  "country",
];

async function getUserId() {
  const cookieStore = await cookies();
  return cookieStore.get("doit-user-id")?.value ?? null;
}

export async function GET() {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase
      .from("users")
      .select(PROFILE_FIELDS)
      .eq("id", userId)
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ profile: data });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function PUT(request) {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const updates = Object.fromEntries(
      Object.entries(body).filter(([key]) => ALLOWED_FIELDS.includes(key)),
    );

    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase
      .from("users")
      .update(updates)
      .eq("id", userId)
      .select(PROFILE_FIELDS)
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ profile: data });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}


