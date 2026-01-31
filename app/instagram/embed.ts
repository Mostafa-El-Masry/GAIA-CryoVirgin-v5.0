import type { MediaItem, VideoThumbnail } from "./mediaTypes";

/**
 * Generate a simple hash ID from a string value.
 * Used for creating unique IDs for embedded content.
 */
const hashId = (value: string): string => {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    const char = value.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(36);
};

/**
 * Extract an iframe src value from raw HTML or return the input as-is
 * when it's already a URL.
 */
export function extractEmbedSrc(input: string): string {
  if (!input) return "";
  const match = input.match(/src=["']([^"']+)["']/i);
  if (match?.[1]) return match[1].trim();
  return input.trim();
}

type CreateEmbedOpts = {
  id?: string;
  title?: string;
  description?: string;
  tags?: string[];
  createdAt?: string;
  thumbnail?: string;
  thumbnails?: VideoThumbnail[];
};

/**
 * Build a MediaItem representing an external embedded video.
 *
 * Usage:
 *   const item = createEmbedMediaItem(
 *     '<iframe src="https://www.eporner.com/embed/AuitBwxuaQI/" ...></iframe>',
 *     { title: "Imported clip", tags: ["external"] }
 *   );
 */
export function createEmbedMediaItem(
  input: string,
  opts: CreateEmbedOpts = {},
): MediaItem {
  const raw = extractEmbedSrc(input);
  const src = raw
    ? raw.startsWith("/api/embed/proxy")
      ? raw
      : `/api/embed/proxy?url=${encodeURIComponent(raw)}`
    : "";
  const now = opts.createdAt ?? new Date().toISOString();
  const id = opts.id ?? `embed-${hashId(src)}`;

  let thumbs: VideoThumbnail[] | undefined = opts.thumbnails;
  if (!thumbs && opts.thumbnail) {
    thumbs = [{ index: 1, localPath: opts.thumbnail }];
  }

  return {
    id,
    slug: id,
    type: "video",
    title: opts.title ?? "",
    description: opts.description ?? "",
    tags: opts.tags ?? [],
    source: "embed",
    embedUrl: src,
    thumbnails: thumbs,
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * Convenience helper: add (or replace) an embedded video in a list of media items.
 * The new embed is returned first in the array.
 */
export function addEmbedToItems(
  items: MediaItem[],
  input: string,
  opts: CreateEmbedOpts = {},
): MediaItem[] {
  const embed = createEmbedMediaItem(input, opts);
  const withoutExisting = items.filter((i) => i.id !== embed.id);
  return [embed, ...withoutExisting];
}
