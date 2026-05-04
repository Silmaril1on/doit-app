import { NextResponse } from "next/server";

export async function GET(request) {
  const { searchParams } = request.nextUrl;
  const lat = searchParams.get("lat");
  const lng = searchParams.get("lng");

  if (!lat || !lng) {
    return NextResponse.json(
      { error: "lat and lng query params are required" },
      { status: 400 },
    );
  }

  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${encodeURIComponent(
        lat,
      )}&lon=${encodeURIComponent(lng)}&format=json`,
      {
        headers: {
          "User-Agent": "DoitApp/1.0 (contact@doit-app.com)",
          "Accept-Language": "en",
        },
        next: { revalidate: 0 },
      },
    );

    if (!res.ok) {
      console.error("❌ Nominatim HTTP error:", res.status);

      return NextResponse.json(
        { error: `Nominatim HTTP error: ${res.status}` },
        { status: 502 },
      );
    }

    const data = await res.json();

    // 🔥 FULL DEBUG (server console only)
    console.log("🌍 RAW NOMINATIM RESPONSE:", JSON.stringify(data, null, 2));

    const address = data.address ?? {};

    const country = address.country ?? "";

    const city =
      address.city ||
      address.town ||
      address.village ||
      address.county ||
      address.state ||
      "";

    console.log("📍 RESOLVED LOCATION:");
    console.log({ country, city });

    console.log("📌 DISPLAY NAME:");
    console.log(data.display_name);

    return NextResponse.json({ country, city });
  } catch (err) {
    console.error("❌ Geocoding exception:", err);

    return NextResponse.json(
      { error: "Geocoding request failed" },
      { status: 500 },
    );
  }
}
