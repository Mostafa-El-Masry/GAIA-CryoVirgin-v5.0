import { NextResponse } from "next/server";
import { gallerySupabase } from "@/lib/gallery/db";
import { createEmbedMediaItem, extractEmbedSrc } from "@/app/instagram/embed";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Body = {
  url?: string;
  embedUrl?: string;
  title?: string;
  description?: string;
  tags?: string[];
  preview?: string;
};

function cleanTags(input: any): string[] | undefined {
  if (!Array.isArray(input)) return undefined;
  const tags = input
    .map((t) => (typeof t === "string" ? t.trim() : ""))
    .filter(Boolean);
  return tags.length ? tags : undefined;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => null)) as Body | null;
    const raw = body?.url || body?.embedUrl || "";
    const embedUrl = extractEmbedSrc(raw);
    if (!embedUrl) {
      return NextResponse.json(
        { ok: false, error: "embedUrl is required" },
        { status: 400 },
      );
    }

    const item = createEmbedMediaItem(embedUrl, {
      title: body?.title,
      description: body?.description,
      tags: cleanTags(body?.tags),
      thumbnail: body?.preview,
    });

    // Best-effort persist to Supabase if configured and table exists
    try {
      const supabase = gallerySupabase();
      const { error } = await supabase.from("gallery_embeds").upsert(
        {
          id: item.id,
          embed_url: item.embedUrl,
          title: item.title,
          description: item.description ?? null,
          tags: item.tags ?? [],
          preview:
            item.thumbnails && item.thumbnails[0]
              ? (item.thumbnails[0].r2Key ??
                item.thumbnails[0].localPath ??
                null)
              : null,
          created_at: item.createdAt,
        },
        { onConflict: "id" },
      );
      if (error) {
        console.error("[gallery] failed to save embed in Supabase", error);
      }
    } catch (err) {
      console.warn("[gallery] Supabase not configured for embeds", err);
    }

    return NextResponse.json({ ok: true, item });
  } catch (err: any) {
    console.error("[gallery] embed POST failed", err);
    return NextResponse.json(
      { ok: false, error: err?.message ?? "Failed to save embed." },
      { status: 500 },
    );
  }
}
