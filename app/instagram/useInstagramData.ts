"use client";

import { useEffect, useState } from "react";
import type { MediaItem, VideoThumbnail } from "./mediaTypes";
import { getR2Url } from "./r2";

const CACHE_KEY = "gaia_gallery_v3_3_media_cache";

type DataSource = "none" | "cache" | "r2";

interface CachePayload {
  items: MediaItem[];
  lastUpdated: string;
}

export interface GalleryDataState {
  items: MediaItem[];
  isLoading: boolean;
  source: DataSource;
  lastUpdated: string | null;
  error: string | null;
}

type ManifestItem = {
  id: string;
  type: "image" | "video";
  src: string;
  preview?: string[];
  addedAt?: string;
  title?: string;
  description?: string;
  tags?: string[];
  embedUrl?: string;
};

const normalizeKey = (key: string) => key.replace(/^\/+/, "");
const isLocalKey = (key: string) => normalizeKey(key).startsWith("media/");

/**
 * Convert preview paths to thumbnail objects
 */
const mapPreviewsToThumbnails = (previews: string[] = []) =>
  previews.map((p, idx) => {
    const key = normalizeKey(p);
    const localThumb = isLocalKey(key);
    return {
      index: idx + 1,
      r2Key: localThumb ? undefined : key,
      localPath: localThumb ? `/${key}` : undefined,
    };
  });

/**
 * Simple hash function for deterministic shuffling
 */
const hashString = (value: string): number => {
  let h = 0;
  for (let i = 0; i < value.length; i += 1) {
    h = (h << 5) - h + value.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
};

const mapManifestToMediaItem = (item: ManifestItem): MediaItem => {
  const normalized = item.embedUrl ? item.embedUrl : normalizeKey(item.src);
  const createdAt = item.addedAt || new Date().toISOString();
  const localPath =
    !item.embedUrl && isLocalKey(normalized) ? `/${normalized}` : undefined;
  const title = item.title || normalized.split("/").pop() || item.id;

  // Compute the src URL
  let src: string | undefined;
  if (item.embedUrl) {
    src = item.embedUrl;
  } else if (isLocalKey(normalized)) {
    src = localPath;
  } else {
    src = getR2Url(normalized);
  }

  if (item.type === "image") {
    return {
      id: item.id,
      slug: item.id,
      type: "image",
      title,
      description: item.description || "",
      tags: item.tags ?? [],
      source: isLocalKey(normalized) ? "local_image" : "r2_image",
      src,
      r2Path: isLocalKey(normalized) ? undefined : normalized,
      localPath,
      createdAt,
      updatedAt: createdAt,
    };
  }

  if (item.embedUrl) {
    return {
      id: item.id,
      slug: item.id,
      type: "video",
      title,
      description: item.description || "",
      tags: item.tags ?? [],
      source: "embed",
      src,
      embedUrl: item.embedUrl,
      thumbnails: mapPreviewsToThumbnails(item.preview),
      createdAt,
      updatedAt: createdAt,
    };
  }

  const thumbs = mapPreviewsToThumbnails(item.preview);

  return {
    id: item.id,
    slug: item.id,
    type: "video",
    title,
    description: "",
    tags: [],
    source: isLocalKey(normalized) ? "local_video" : "r2_video",
    src,
    r2Path: isLocalKey(normalized) ? undefined : normalized,
    localPath,
    thumbnails: thumbs,
    desiredThumbnailCount: thumbs.length || undefined,
    createdAt,
    updatedAt: createdAt,
  };
};

/**
 * Pull gallery items from the API (merging Cloudflare R2 + local videos) with a small cache.
 * Caches locally to provide instant loading on repeated visits.
 */
export function useInstagramData(fallbackItems: MediaItem[]): GalleryDataState {
  const [items, setItems] = useState<MediaItem[]>(fallbackItems);
  const [source, setSource] = useState<DataSource>("none");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    // 1) Load from cache (if any).
    if (typeof window !== "undefined") {
      try {
        const raw = window.localStorage.getItem(CACHE_KEY);
        if (raw) {
          const payload = JSON.parse(raw) as CachePayload;
          if (!cancelled && payload.items?.length) {
            setItems(payload.items);
            setSource("cache");
            setLastUpdated(payload.lastUpdated);
          }
        }
      } catch (err) {
        console.warn("[GAIA Gallery] Failed to read cache", err);
      }
    }

    // 2) Pull from API (merges R2 + local).
    async function fetchFromApi() {
      try {
        const res = await fetch("/api/instagram", { cache: "no-store" });
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
        const payload = await res.json();
        const manifest: ManifestItem[] = Array.isArray(payload?.items)
          ? payload.items
          : [];
        const mapped = manifest.map(mapManifestToMediaItem).filter(Boolean);

        if (!cancelled) {
          const nextItems = mapped.length ? mapped : fallbackItems;
          setItems(nextItems);
          setSource(mapped.length ? "r2" : "cache");
          const nowIso = new Date().toISOString();
          setLastUpdated(nowIso);
          setIsLoading(false);
          setError(null);

          if (typeof window !== "undefined" && mapped.length) {
            const payload: CachePayload = {
              items: mapped,
              lastUpdated: nowIso,
            };
            try {
              window.localStorage.setItem(CACHE_KEY, JSON.stringify(payload));
            } catch (err) {
              console.warn("[GAIA Gallery] Failed to write cache", err);
            }
          }
        }
      } catch (err: unknown) {
        console.warn("[GAIA Instagram] Failed to load /api/instagram", err);
        if (!cancelled) {
          setItems(fallbackItems);
          setSource((prevSource) =>
            prevSource === "none" ? "cache" : prevSource,
          );
          setError(err instanceof Error ? err.message : "Unknown error");
          setIsLoading(false);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    fetchFromApi();

    return () => {
      cancelled = true;
    };
  }, [fallbackItems]);

  return {
    items,
    isLoading,
    source,
    lastUpdated,
    error,
  };
}

export { hashString };
