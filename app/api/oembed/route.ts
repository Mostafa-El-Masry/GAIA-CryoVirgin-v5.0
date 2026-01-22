import { NextRequest, NextResponse } from "next/server";

const OEMBED_PROVIDERS = [
  "https://www.youtube.com/oembed",
  "https://vimeo.com/api/oembed.json",
];

export async function POST(req: NextRequest) {
  const { url } = await req.json();

  // Try known oEmbed providers
  for (const provider of OEMBED_PROVIDERS) {
    try {
      const res = await fetch(
        `${provider}?url=${encodeURIComponent(url)}&format=json`,
      );

      if (res.ok) {
        const data = await res.json();
        return NextResponse.json({
          html: data.html,
          provider: provider,
        });
      }
    } catch {}
  }

  // Fallback: iframe wrapper
  return NextResponse.json({
    html: `<iframe src="${url}" style="width:100%;height:100%" allowfullscreen loading="lazy"></iframe>`,
    provider: "generic",
  });
}
