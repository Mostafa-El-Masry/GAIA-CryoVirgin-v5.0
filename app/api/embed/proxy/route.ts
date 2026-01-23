import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ALLOWED_PROTOCOLS = new Set(["http:", "https:"]);

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const target = url.searchParams.get("url");
    if (!target) {
      return NextResponse.json(
        { ok: false, error: "url is required" },
        { status: 400 },
      );
    }

    const parsed = new URL(target);
    if (!ALLOWED_PROTOCOLS.has(parsed.protocol)) {
      return NextResponse.json(
        { ok: false, error: "Only http/https targets are allowed." },
        { status: 400 },
      );
    }

    const res = await fetch(parsed.toString(), {
      headers: {
        // Some providers require a UA; keep it generic.
        "User-Agent":
          "Mozilla/5.0 (compatible; GAIA-Gallery-Embed/1.0; +https://localhost)",
      },
    });

    const contentType =
      res.headers.get("content-type") || "text/html; charset=utf-8";
    const body = await res.arrayBuffer();

    // Re-serve without frame-ancestor / XFO restrictions.
    return new NextResponse(body, {
      status: res.status,
      headers: {
        "content-type": contentType,
        // Intentionally omit X-Frame-Options / frame-ancestors
        "cache-control": "no-store",
      },
    });
  } catch (err: any) {
    console.error("[embed-proxy] failed", err);

    // Return a fallback HTML page for embed failures
    const fallbackHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Embed Unavailable</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              text-align: center; 
              padding: 50px;
              background: #f5f5f5;
              color: #666;
            }
            .container { max-width: 600px; margin: 0 auto; }
            h1 { color: #333; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Embed Unavailable</h1>
            <p>The requested embed content could not be loaded at this time.</p>
            <p>This may be due to network connectivity issues or the source being temporarily unavailable.</p>
          </div>
        </body>
      </html>
    `;

    return new NextResponse(fallbackHtml, {
      status: 200,
      headers: {
        "content-type": "text/html; charset=utf-8",
        "cache-control": "no-store",
      },
    });
  }
}
