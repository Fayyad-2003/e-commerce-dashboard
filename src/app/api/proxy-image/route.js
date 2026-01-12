import { NextResponse } from "next/server";

export async function GET(req) {
  const urlParam = new URL(req.url).searchParams.get("url");

  if (!urlParam) {
    return NextResponse.json({ error: "missing url" }, { status: 400 });
  }

  let targetUrl;
  try {
    targetUrl = new URL(urlParam);
  } catch (e) {
    return NextResponse.json({ error: "invalid url" }, { status: 400 });
  }

  // 1. SECURITY: Define allowed domains (WHITELIST)
  // Add the domains you expect images to be loaded from (e.g., your S3 bucket, Cloudinary, etc.)
  const ALLOWED_DOMAINS = [
    "my-homestyle.com",
    "backend.my-homestyle.co",
    // "via.placeholder.com",
  ];

  // 2. SECURITY: Check if the domain is allowed
  if (!ALLOWED_DOMAINS.includes(targetUrl.hostname)) {
    return NextResponse.json({ error: "Forbidden domain" }, { status: 403 });
  }

  // 3. SECURITY: Only allow http/https protocols (prevents file:// access)
  if (!["http:", "https:"].includes(targetUrl.protocol)) {
    return NextResponse.json({ error: "Invalid protocol" }, { status: 400 });
  }

  try {
    const r = await fetch(targetUrl.toString(), {
      headers: { accept: "image/*" }, // Only ask for images
    });

    if (!r.ok) {
      return NextResponse.json(
        { error: `upstream ${r.status}` },
        { status: r.status }
      );
    }

    const blob = await r.blob();

    // 4. SECURITY: Verify the response is actually an image
    if (!blob.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "Target is not an image" },
        { status: 400 }
      );
    }

    return new NextResponse(blob, {
      headers: {
        "content-type": blob.type || "application/octet-stream",
        "cache-control": "public, max-age=3600",
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch image" },
      { status: 500 }
    );
  }
}
