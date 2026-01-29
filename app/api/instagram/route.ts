import { NextResponse } from "next/server";
import { GET as getGallery } from "../gallery/route";

/**
 * Instagram API route - proxies to gallery API
 * This allows Instagram components to use /api/instagram
 * while the actual implementation is in /api/gallery
 */
export async function GET() {
  try {
    // Reuse the gallery GET handler directly
    return await getGallery();
  } catch (error) {
    console.error("[Instagram API] Failed to load gallery data", error);
    return NextResponse.json(
      { items: [], error: "Failed to load gallery data" },
      { status: 500 }
    );
  }
}
