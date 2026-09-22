import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const zip = request.nextUrl.searchParams.get("zip")?.trim() || "";

  if (!/^\d{5}$/.test(zip)) {
    return NextResponse.json({ error: "A valid 5-digit US ZIP code is required." }, { status: 400 });
  }

  try {
    const response = await fetch(`https://api.zippopotam.us/us/${zip}`, {
      next: { revalidate: 2592000 },
      signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) {
      return NextResponse.json({ error: "ZIP code not found." }, { status: 404 });
    }

    const data = await response.json();
    const place = data?.places?.[0];
    const latitude = Number(place?.latitude);
    const longitude = Number(place?.longitude);

    if (!place || !Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      return NextResponse.json({ error: "ZIP code could not be located." }, { status: 404 });
    }

    return NextResponse.json({
      zip,
      city: place["place name"] || null,
      state: place.state || null,
      stateCode: place["state abbreviation"] || null,
      latitude,
      longitude,
    }, {
      headers: { "Cache-Control": "public, max-age=86400, s-maxage=2592000" },
    });
  } catch {
    return NextResponse.json({ error: "ZIP lookup is temporarily unavailable." }, { status: 503 });
  }
}
