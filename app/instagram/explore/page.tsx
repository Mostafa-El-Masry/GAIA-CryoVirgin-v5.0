"use client";

import React, { useMemo, useState } from "react";
import { Space_Grotesk } from "next/font/google";
import InstagramHeader from "../components/InstagramHeader";
import { MediaGrid } from "../components/MediaGrid"; // Re-using MediaGrid
import { mockMediaItems } from "../mockMedia";
import type { MediaItem } from "../mediaTypes";
import { useGalleryData } from "../useInstagramData";
import { hasR2PublicBase } from "../r2";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const ExplorePage: React.FC = () => {
  const [isHydrated, setIsHydrated] = React.useState(false);
  const { items } = useGalleryData(mockMediaItems);

  React.useEffect(() => {
    setIsHydrated(true);
  }, []);

  const [titleOverrides, setTitleOverrides] = useState<Record<string, string>>(
    () => {
      if (typeof window === "undefined") return {};
      try {
        const raw = window.localStorage.getItem("gaia_gallery_titles");
        return raw ? (JSON.parse(raw) as Record<string, string>) : {};
      } catch {
        return {};
      }
    },
  );
  const [hiddenIds, setHiddenIds] = useState<string[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const raw = window.localStorage.getItem("gaia_gallery_hidden");
      return raw ? (JSON.parse(raw) as string[]) : [];
    } catch {
      return [];
    }
  });

  const mergedItems = useMemo(() => {
    const merged = new Map<string, MediaItem>();
    items.forEach((item) => merged.set(item.id, item));
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
  }, [items, titleOverrides]);

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
    const hash = (value: string) => {
      let h = 0;
      for (let i = 0; i < value.length; i += 1) {
        h = (h << 5) - h + value.charCodeAt(i);
        h |= 0;
      }
      return Math.abs(h);
    };
    // We want a consistent shuffle for the explore page for now
    const shuffleSeed = "explore_seed";
    return [...allItems].sort((a, b) => {
      const aKey = hash(`${a.id}-${shuffleSeed}`);
      const bKey = hash(`${b.id}-${shuffleSeed}`);
      return aKey - bKey;
    });
  }, [allItems]);

  if (!isHydrated) {
    return null;
  }

  return (
    <main className={`relative min-h-screen ${spaceGrotesk.className} gaia-bg`}>
      <InstagramHeader />
      <div className="max-w-4xl mx-auto py-8 px-4">
        <h1 className="text-white text-2xl font-semibold mb-6">Explore</h1>
        <MediaGrid
          title=""
          items={shuffledItems}
          page={1}
          perPage={24} // Display more items in explore grid
          onPageChange={() => {}}
          allowDelete={false}
          onDeleteItem={() => {}}
          onRenameItem={() => {}}
          maxVisibleItems={-1} // Show all available items
          currentVideoId={null}
          onSetCurrentVideo={() => {}}
        />
      </div>
    </main>
  );
};

export default ExplorePage;
