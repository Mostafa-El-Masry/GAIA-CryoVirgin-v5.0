"use client";

import { useMemo } from "react";
import {
  useInstagramData as useGalleryData,
  hashString,
} from "../useInstagramData";
import { useLocalStorage } from "./useLocalStorage";
import type { MediaItem } from "../mediaTypes";
import { mockMediaItems } from "../mockMedia";
import { hasR2PublicBase } from "../r2";

export function useInstagramData() {
  const { items } = useGalleryData(mockMediaItems);
  const [localNewItems] = useLocalStorage<MediaItem[]>(
    "gaia_gallery_local_items_v1",
    [],
  );
  const [titleOverrides] = useLocalStorage<Record<string, string>>(
    "gaia_gallery_titles",
    {},
  );
  const [hiddenIds] = useLocalStorage<string[]>("gaia_gallery_hidden", []);
  const [shuffleSeed] = useLocalStorage("gaia_gallery_shuffle_seed", () =>
    Math.random().toString(36).slice(2, 10),
  );

  const mergedItems = useMemo(() => {
    const merged = new Map<string, MediaItem>();
    [...localNewItems, ...items].forEach((item) => merged.set(item.id, item));
    const withTitles = Array.from(merged.values()).map((item) =>
      titleOverrides[item.id]
        ? {
            ...item,
            title: titleOverrides[item.id],
            slug: item.slug,
          }
        : item,
    );
    const withThumbs = withTitles.map((item) => {
      if (item.type !== "video") return item;
      const hasThumbs =
        Array.isArray(item.thumbnails) && item.thumbnails.length > 0;
      if (hasThumbs) return item;
      const safeTitle = (item.title || "Video").replace(/\.[^.]+$/, "").trim();
      const thumbs = Array.from({ length: 6 }).map((_, idx) => ({
        index: idx + 1,
        r2Key: `${safeTitle}_thumb_00${idx + 1}.jpg`,
      }));
      return {
        ...item,
        thumbnails: thumbs,
        needsMoreThumbs: true,
        desiredThumbnailCount: thumbs.length,
      };
    });
    return withThumbs;
  }, [items, localNewItems, titleOverrides]);

  const allItems = useMemo(() => {
    const allowR2 = hasR2PublicBase();
    const visible = mergedItems.filter((item) => {
      if (item.r2Path && !allowR2) return false;
      return true;
    });
    if (!hiddenIds.length) return visible;
    return visible.filter((item) => !hiddenIds.includes(item.id));
  }, [mergedItems, hiddenIds]);

  const shuffledItems = useMemo(() => {
    return [...allItems].sort((a, b) => {
      const aKey = hashString(`${a.id}-${shuffleSeed}`);
      const bKey = hashString(`${b.id}-${shuffleSeed}`);
      return aKey - bKey;
    });
  }, [allItems, shuffleSeed]);

  return {
    items: shuffledItems,
    hiddenIds,
    titleOverrides,
  };
}
