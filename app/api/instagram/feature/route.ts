import { NextResponse } from "next/server";
import { GET as getFeature, POST as postFeature } from "../../gallery/feature/route";

/**
 * Instagram feature API route - proxies to gallery feature API
 */
export async function GET(request: Request) {
  try {
    return await getFeature(request);
  } catch (error) {
    console.error("[Instagram Feature API] Failed to load feature", error);
    return NextResponse.json(
      {
        ok: false,
        date: null,
        feature: null,
        error: "Failed to load feature",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    return await postFeature(request);
  } catch (error) {
    console.error("[Instagram Feature API] Failed to save feature", error);
    return NextResponse.json(
      { ok: false, error: "Failed to save feature" },
      { status: 500 }
    );
  }
}
