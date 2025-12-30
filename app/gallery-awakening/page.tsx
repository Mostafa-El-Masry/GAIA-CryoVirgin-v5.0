"use client";

import React, { useMemo, useState } from "react";
import { Space_Grotesk } from "next/font/google";
import { mockMediaItems } from "./mockMedia";
import type { MediaItem } from "./mediaTypes";
import { MediaGrid } from "./components/MediaGrid";
import { useGalleryData } from "./useGalleryData";
import { useGaiaFeatureUnlocks } from "@/app/hooks/useGaiaFeatureUnlocks";
import { hasR2PublicBase } from "./r2";
import { useCurrentPermissions, isCreatorAdmin } from "@/lib/permissions";
import { useAuthSnapshot } from "@/lib/auth-client";

const PAGE_SIZE = 24;

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

type GalleryAwakeningContentProps = {
  allowedGalleryMediaCount: number;
};

const GalleryAwakeningContent: React.FC<GalleryAwakeningContentProps> = ({
  allowedGalleryMediaCount,
}) => {
  const { items } = useGalleryData(mockMediaItems);
  const { profile, status } = useAuthSnapshot();
  const permissions = useCurrentPermissions();

  const [localNewItems, setLocalNewItems] = useState<MediaItem[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const raw = window.localStorage.getItem("gaia_gallery_local_items_v1");
      const parsed = raw ? (JSON.parse(raw) as MediaItem[]) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });
  const [page, setPage] = useState<number>(1);
  const [shuffleSeed] = useState(() => Math.random().toString(36).slice(2, 10));
  const [titleOverrides, setTitleOverrides] = useState<Record<string, string>>(
    () => {
      if (typeof window === "undefined") return {};
      try {
        const raw = window.localStorage.getItem("gaia_gallery_titles");
        return raw ? (JSON.parse(raw) as Record<string, string>) : {};
      } catch {
        return {};
      }
    }
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
  // Persist locally added items so they survive reloads even if Supabase is absent.
  React.useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(
        "gaia_gallery_local_items_v1",
        JSON.stringify(localNewItems)
      );
    } catch {
      // ignore
    }
  }, [localNewItems]);

  const mergedItems = useMemo(() => {
    const merged = new Map<string, MediaItem>();
    [...localNewItems, ...items].forEach((item) => merged.set(item.id, item));
    const withTitles = Array.from(merged.values()).map((item) =>
      titleOverrides[item.id]
        ? {
            ...item,
            title: titleOverrides[item.id],
            // strip extensions from synthetic title overrides for display
            slug: item.slug,
          }
        : item
    );
    const withThumbs = withTitles.map((item) => {
      if (item.type !== "video") return item;
      const hasThumbs =
        Array.isArray(item.thumbnails) && item.thumbnails.length > 0;
      if (hasThumbs) return item;
      // synthesize six preview frames based on title when real thumbs are missing
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

  // Hide items that cannot render because there is no public R2 base URL
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
    return [...allItems].sort((a, b) => {
      const aKey = hash(`${a.id}-${shuffleSeed}`);
      const bKey = hash(`${b.id}-${shuffleSeed}`);
      return aKey - bKey;
    });
  }, [allItems, shuffleSeed]);
  const userEmail = profile?.email ?? status?.email ?? null;
  const allowDelete =
    isCreatorAdmin(userEmail) || Boolean((permissions as any).galleryDelete);

  const handleDeleteItem = (id: string) => {
    setHiddenIds((prev) => {
      const next = Array.from(new Set([...prev, id]));
      try {
        if (typeof window !== "undefined") {
          window.localStorage.setItem(
            "gaia_gallery_hidden",
            JSON.stringify(next)
          );
        }
      } catch {
        // ignore
      }
      return next;
    });
  };

  const handleRenameItem = (id: string, nextTitle: string) => {
    setTitleOverrides((prev) => {
      const next = { ...prev, [id]: nextTitle };
      try {
        if (typeof window !== "undefined") {
          window.localStorage.setItem(
            "gaia_gallery_titles",
            JSON.stringify(next)
          );
        }
      } catch {
        // ignore
      }
      return next;
    });
  };

  return (
    <main className={`relative min-h-screen ${spaceGrotesk.className} gaia-bg`}>
      <section>
        <div className="mx-auto w-full max-w-7xl px-4 pb-12 pt-10 xl:max-w-[85vw]">
          {/* BigShot grid */}
          <section className="space-y-3 pt-2">
            <MediaGrid
              title="Feed"
              items={shuffledItems}
              page={page}
              perPage={PAGE_SIZE}
              onPageChange={setPage}
              allowDelete={allowDelete}
              onDeleteItem={handleDeleteItem}
              onRenameItem={handleRenameItem}
              maxVisibleItems={allowedGalleryMediaCount}
            />
          </section>
        </div>
      </section>
    </main>
  );
};

const GalleryAwakeningPage: React.FC = () => {
  const { totalLessonsCompleted, allowedGalleryMediaCount, featureUnlocks } =
    useGaiaFeatureUnlocks();
  const galleryUnlocked = featureUnlocks.gallery;

  if (!galleryUnlocked) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-8">
        <section className="rounded-3xl border border-[var(--gaia-border)] bg-[var(--gaia-surface-soft)] p-8 shadow-xl">
          <h1 className="mb-2 text-2xl font-bold text-[var(--gaia-text-strong)]">
            Gallery locked Aú keep learning
          </h1>
          <p className="mb-4 text-sm text-[var(--gaia-text-muted)]">
            Complete more Academy lessons in Apollo to slowly unlock your
            Gallery. Each lesson from level 11 onward unlocks one more memory
            (image or video).
          </p>
          <p className="text-xs text-[var(--gaia-text-muted)]">
            Lessons completed so far:{" "}
            <span className="font-semibold">{totalLessonsCompleted}</span>
          </p>
        </section>
      </main>
    );
  }

  return (
    <GalleryAwakeningContent
      allowedGalleryMediaCount={allowedGalleryMediaCount}
    />
  );
};

export default GalleryAwakeningPage;
