import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getAllCountryStats } from "@/app/[locale]/lib/services/statistics/country-based/countryStats";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("doit-user-id")?.value ?? null;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const stats = await getAllCountryStats(userId);
    return NextResponse.json({ stats }, { status: 200 });
  } catch (err) {
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 },
    );
  }
}
