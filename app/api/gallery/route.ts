import { NextResponse } from "next/server";
import path from "path";
import { promises as fs } from "fs";
import type { Dirent } from "fs";
import { ListObjectsCommand, S3Client } from "@aws-sdk/client-s3";
import { gallerySupabase } from "@/lib/gallery/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const IMG_EXTS = new Set([
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".gif",
  ".bmp",
  ".avif",
]);
const VID_EXTS = new Set([".mp4", ".webm", ".mov", ".mkv", ".avi"]);
const PREVIEW_EXTS = new Set([".jpg", ".jpeg", ".png", ".webp"]);
type PreviewMap = Map<string, string[]>;

type ManifestItem = {
  id: string;
  type: "image" | "video";
  src: string;
  /**
   * Preview frames for videos (thumbnails, sprite frames, etc.)
   */
  preview?: string[];
  title?: string;
  description?: string;
  tags?: string[];
  embedUrl?: string;
  addedAt: string;
};

type R2Config = {
  endpoint?: string;
  bucket?: string;
  accessKeyId?: string;
  secretAccessKey?: string;
};

function hashId(p: string) {
  let h = 0,
    i = 0;
  while (i < p.length) {
    h = ((h << 5) - h + p.charCodeAt(i++)) | 0;
  }
  return Math.abs(h).toString(36);
}

// ---------- R2 helpers ----------

function hasValidConfig(cfg: R2Config): cfg is Required<R2Config> {
  return Boolean(
    cfg.endpoint && cfg.bucket && cfg.accessKeyId && cfg.secretAccessKey
  );
}

function createR2Client(cfg: Required<R2Config>) {
  return new S3Client({
    region: "auto",
    endpoint: cfg.endpoint,
    credentials: {
      accessKeyId: cfg.accessKeyId,
      secretAccessKey: cfg.secretAccessKey,
    },
  });
}

async function listR2(
  client: S3Client,
  bucket: string
): Promise<{ key: string; lastModified?: Date }[]> {
  try {
    const res = await client.send(
      new ListObjectsCommand({
        Bucket: bucket,
      })
    );
    if (!res.Contents) return [];
    return res.Contents.map((item) => ({
      key: item.Key ?? "",
      lastModified: item.LastModified,
    })).filter((item) => item.key);
  } catch (error) {
    console.error("gallery: failed to list R2 bucket", bucket, error);
    return [];
  }
}

function buildPreviewMap(keys: { key: string }[]) {
  const map = new Map<string, string[]>();
  for (const { key } of keys) {
    const base = path.basename(key).toLowerCase();
    // Expecting e.g. "video_thumb_001.jpg"
    const match = base.match(/^(.*?)(?:_thumb_\d+)?\.[a-z0-9]+$/i);
    if (!match) continue;
    const logical = match[1];
    if (!map.has(logical)) map.set(logical, []);
    map.get(logical)!.push(key);
  }
  // Preserve stable ordering for previews
  map.forEach((list, key) => {
    map.set(
      key,
      list
        .slice()
        .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
    );
  });
  return map;
}

function mergePreviewMaps(base: PreviewMap, extra?: PreviewMap | null): PreviewMap {
  const next = new Map(base);
  if (!extra) return next;

  extra.forEach((list, key) => {
    const existing = next.get(key);
    if (!existing?.length) {
      next.set(key, list);
      return;
    }
    const merged = [...existing];
    list.forEach((entry) => {
      if (!merged.includes(entry)) merged.push(entry);
    });
    next.set(key, merged);
  });

  return next;
}

async function collectFromR2(): Promise<{
  items: ManifestItem[];
  previewMap: PreviewMap;
  error?: string;
} | null> {
  const mediaCfg: R2Config = {
    endpoint: process.env.CLOUDFLARE_R2_S3_ENDPOINT,
    bucket: process.env.CLOUDFLARE_R2_BUCKET,
    accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY,
  };
  const previewCfg: R2Config = {
    endpoint: process.env.CLOUDFLARE_R2_PREVIEWS_S3_ENDPOINT,
    bucket: process.env.CLOUDFLARE_R2_PREVIEWS_BUCKET,
    accessKeyId: process.env.CLOUDFLARE_R2_PREVIEWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.CLOUDFLARE_R2_PREVIEWS_SECRET_ACCESS_KEY,
  };

  if (!hasValidConfig(mediaCfg)) {
    const missing = [
      !process.env.CLOUDFLARE_R2_S3_ENDPOINT && "CLOUDFLARE_R2_S3_ENDPOINT",
      !process.env.CLOUDFLARE_R2_BUCKET && "CLOUDFLARE_R2_BUCKET",
      !process.env.CLOUDFLARE_R2_ACCESS_KEY_ID &&
        "CLOUDFLARE_R2_ACCESS_KEY_ID",
      !process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY &&
        "CLOUDFLARE_R2_SECRET_ACCESS_KEY",
    ]
      .filter(Boolean)
      .join(", ");
    return {
      items: [],
      previewMap: new Map(),
      error: `Cloudflare R2 is not configured. Missing environment variables: ${missing}`,
    };
  }

  const client = createR2Client(mediaCfg);
  const mediaObjects = await listR2(client, mediaCfg.bucket);

  // Build preview map if previews bucket is configured
  let previewMap: Map<string, string[]> | null = null;
  const previewCandidatesFromMedia: { key: string }[] = [];
  mediaObjects.forEach(({ key }) => {
    const ext = path.extname(key).toLowerCase();
    const base = path.basename(key).toLowerCase();
    const isThumb = base.includes("_thumb_");
    if (PREVIEW_EXTS.has(ext) && isThumb) {
      previewCandidatesFromMedia.push({ key });
    }
  });
  if (previewCandidatesFromMedia.length) {
    previewMap = buildPreviewMap(previewCandidatesFromMedia);
  }

  if (hasValidConfig(previewCfg)) {
    const previewClient = createR2Client(previewCfg);
    const previews = await listR2(previewClient, previewCfg.bucket);
    const filtered = previews.filter((obj) =>
      PREVIEW_EXTS.has(path.extname(obj.key).toLowerCase())
    );
    const fromPreviewBucket = buildPreviewMap(filtered);
    // merge: prefer dedicated preview bucket over media bucket candidates
    if (previewMap) {
      fromPreviewBucket.forEach((list, key) => {
        previewMap!.set(key, list);
      });
    } else {
      previewMap = fromPreviewBucket;
    }
  }

  const items: ManifestItem[] = [];

  for (const { key, lastModified } of mediaObjects) {
    const ext = path.extname(key).toLowerCase();
    const base = path.basename(key).toLowerCase();
    const addedAt =
      lastModified instanceof Date
        ? lastModified.toISOString()
        : new Date(0).toISOString();

    // Skip preview assets we already merged
    if (PREVIEW_EXTS.has(ext) && base.includes("_thumb_")) {
      continue;
    }

    if (IMG_EXTS.has(ext)) {
      items.push({
        id: hashId(key),
        type: "image",
        src: key.replace(/^\/+/, ""),
        addedAt,
      });
      continue;
    }

    if (VID_EXTS.has(ext)) {
      const baseName = path.basename(key, ext).toLowerCase();
      const preview =
        previewMap?.get(baseName)?.map((p) => p.replace(/^\/+/, "")) ?? [];
      items.push({
        id: hashId(key),
        type: "video",
        src: key.replace(/^\/+/, ""),
        preview,
        addedAt,
      });
    }
  }

  return { items, previewMap: previewMap ?? new Map<string, string[]>() };
}

// ---------- Local FS fallback ----------

async function statSafe(filePath: string) {
  try {
    return await fs.stat(filePath);
  } catch {
    return null;
  }
}

async function collectMedia(
  rootDir: string,
  prefix: string,
  type: "image" | "video",
  extensions: Set<string>,
  options?: { previewMap?: Map<string, string[]> }
) {
  const items: ManifestItem[] = [];
  const stack: Array<{ dir: string; rel: string }> = [
    { dir: rootDir, rel: prefix },
  ];

  while (stack.length) {
    const { dir, rel } = stack.pop()!;
    let entries: Dirent[] = [];
    try {
      entries = await fs.readdir(dir, { withFileTypes: true });
    } catch {
      continue;
    }

    for (const entry of entries) {
      if (entry.name.startsWith(".")) continue;
      const absolute = path.join(dir, entry.name);
      const relative = path
        .posix.join(rel, entry.name)
        .replace(/\\/g, "/")
        .replace(/^\/+/, "");

      if (entry.isDirectory()) {
        stack.push({ dir: absolute, rel: path.posix.join(rel, entry.name) });
        continue;
      }

      if (!entry.isFile()) continue;

      const ext = path.extname(entry.name).toLowerCase();
      if (!extensions.has(ext)) continue;

      const stats = await statSafe(absolute);
      const addedAt =
        stats?.mtime instanceof Date
          ? stats.mtime.toISOString()
          : new Date(0).toISOString();

      const base = path.basename(relative, ext).toLowerCase();
      const preview =
        type === "video"
          ? options?.previewMap?.get(base)?.map((p) => p.replace(/^\/+/, ""))
          : undefined;

      items.push({
        id: hashId(relative),
        type,
        src: relative,
        ...(preview && preview.length ? { preview } : {}),
        addedAt,
      });
    }
  }

  return items;
}

async function collectLocalPreviews(previewsDir: string, prefix: string) {
  const keys: string[] = [];
  const stack: Array<{ dir: string; rel: string }> = [
    { dir: previewsDir, rel: prefix },
  ];

  while (stack.length) {
    const { dir, rel } = stack.pop()!;
    let entries: Dirent[] = [];
    try {
      entries = await fs.readdir(dir, { withFileTypes: true });
    } catch {
      continue;
    }

    for (const entry of entries) {
      if (entry.name.startsWith(".")) continue;
      const absolute = path.join(dir, entry.name);
      const relative = path
        .posix.join(rel, entry.name)
        .replace(/\\/g, "/")
        .replace(/^\/+/, "");

      if (entry.isDirectory()) {
        stack.push({ dir: absolute, rel: path.posix.join(rel, entry.name) });
        continue;
      }
      if (!entry.isFile()) continue;

      const ext = path.extname(entry.name).toLowerCase();
      if (!PREVIEW_EXTS.has(ext)) continue;

      keys.push(relative);
    }
  }

  return buildPreviewMap(keys.map((key) => ({ key })));
}

async function collectEmbedsFromSupabase(): Promise<ManifestItem[]> {
  try {
    const supabase = gallerySupabase();
    const { data, error } = await supabase
      .from("gallery_embeds")
      .select(
        "id, embed_url, title, description, tags, preview, created_at"
      );

    if (error) {
      console.error("[gallery] failed to load embeds from Supabase", error);
      return [];
    }

    return (data ?? []).map((row: any) => {
      const embedUrl = row?.embed_url || "";
      const addedAt =
        typeof row?.created_at === "string"
          ? row.created_at
          : new Date().toISOString();

      return {
        id: row?.id || hashId(embedUrl || row?.title || addedAt),
        type: "video",
        src: embedUrl || "",
        embedUrl,
        title: row?.title ?? "Embedded video",
        description: row?.description ?? undefined,
        tags: Array.isArray(row?.tags)
          ? row.tags.filter((t: any) => typeof t === "string" && t.trim())
          : undefined,
        preview: row?.preview ? [row.preview] : undefined,
        addedAt,
      };
    });
  } catch (err) {
    console.warn("[gallery] embeds fetch skipped", err);
    return [];
  }
}

export async function GET() {
  const publicDir = path.join(process.cwd(), "public");
  const imageDir = path.join(publicDir, "media", "images");
  const videoDir = path.join(publicDir, "media", "videos");
  const previewDir = path.join(publicDir, "media", "previews");

  const localPreviewMap = await collectLocalPreviews(
    previewDir,
    "media/previews"
  ).catch(() => new Map<string, string[]>());

  // Prefer live R2 listing when configured, but always merge local media so dev/local files still appear.
  const r2Data = await collectFromR2().catch(() => null);

  if (r2Data?.error) {
    return new NextResponse(JSON.stringify({ message: r2Data.error }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
  const r2Items = r2Data?.items ?? [];
  const mergedPreviewMap = mergePreviewMaps(
    localPreviewMap,
    r2Data?.previewMap ?? null
  );

  const [localImages = [], localVideos = [], embeds = []] = await Promise.all([
    collectMedia(imageDir, "media/images", "image", IMG_EXTS).catch(
      () => [] as ManifestItem[]
    ),
    collectMedia(videoDir, "media/videos", "video", VID_EXTS, {
      previewMap: mergedPreviewMap,
    }).catch(() => [] as ManifestItem[]),
    collectEmbedsFromSupabase().catch(() => [] as ManifestItem[]),
  ]);

  const merged = new Map<string, ManifestItem>();
  // Start with R2 items (keeps cloud-only assets), then layer in locals so
  // videos can stream from disk while still borrowing R2 previews.
  r2Items.forEach((item) => merged.set(item.id, item));
  embeds.forEach((item) => merged.set(item.id, item));

  [...localImages, ...localVideos].forEach((item) => {
    const existing = merged.get(item.id);
    if (!existing) {
      merged.set(item.id, item);
      return;
    }

    if (item.type === "video") {
      merged.set(item.id, {
        ...existing,
        ...item,
        preview:
          (item as ManifestItem).preview?.length
            ? item.preview
            : existing.preview,
      });
      return;
    }

    // For images, keep the cloud copy when it already exists; otherwise use local.
    if (existing.type !== "image") {
      merged.set(item.id, item);
    }
  });

  const items = Array.from(merged.values()).sort((a, b) =>
    a.addedAt < b.addedAt ? 1 : -1
  );

  return NextResponse.json({ items });
}
