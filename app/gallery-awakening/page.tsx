"use client";

import React, { useMemo, useState } from "react";
import { Space_Grotesk } from "next/font/google";
import { mockMediaItems } from "./mockMedia";
import type { MediaItem } from "./mediaTypes";
import { MediaGrid } from "./components/MediaGrid";
import { ActorCard } from "./components/ActorCard";
import { PageTransition } from "./components/PageTransition";
import { useGalleryData } from "./useGalleryData";
import { useGaiaFeatureUnlocks } from "@/app/hooks/useGaiaFeatureUnlocks";
import { hasR2PublicBase } from "./r2";
import { getMostViewed } from "./lib/discoveryStore";
import { supabase } from "./lib/videoStore";
import { getAllTags } from "./lib/tagStore";
import { useCurrentPermissions, isCreatorAdmin } from "@/lib/permissions";
import { useAuthSnapshot } from "@/lib/auth-client";

import { FilterBar } from "./components/FilterBar";
import "./gallery.css";

const PAGE_SIZE = 24;

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

type FilterOption = "Latest" | "Oldest" | "Most Viewed";

type GalleryAwakeningContentProps = {
  allowedGalleryMediaCount: number;
};

const GalleryAwakeningContent: React.FC<GalleryAwakeningContentProps> = ({
  allowedGalleryMediaCount,
}) => {
  const [isHydrated, setIsHydrated] = React.useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterOption>("Latest");

  React.useEffect(() => {
    setIsHydrated(true);
  }, []);

  React.useEffect(() => {
    getMostViewed().then((res) => {
      // Transform Supabase records to MediaItem structure
      const transformed = (res.data || []).map((item) => ({
        id: item.id,
        slug: item.id,
        type: item.type || "image",
        title: item.title || "Untitled",
        description: item.description || "",
        tags: [],
        source:
          item.type === "image"
            ? "r2_image"
            : item.embed_url
              ? "embed"
              : "r2_video",
        r2Path: item.type === "image" ? undefined : item.src, // For videos, src might be r2 path
        localPath: undefined,
        embedUrl: item.embed_url,
        embedHtml: item.embed_html,
        createdAt: item.created_at || new Date().toISOString(),
        updatedAt:
          item.updated_at || item.created_at || new Date().toISOString(),
        src: item.src, // Keep the full URL for getMediaUrl to handle
      }));
      setMostViewed(transformed);
    });
  }, []);

  React.useEffect(() => {
    supabase
      .from("gallery_people")
      .select("*")
      .order("created_at", { ascending: false })
      .then((res) => setActors(res.data || []));
  }, []);
  React.useEffect(() => {
    getAllTags().then((res) => setTags(res.data || []));
  }, []);
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
  const [currentVideoId, setCurrentVideoId] = useState<string | null>(null);
  const [mostViewed, setMostViewed] = useState<any[]>([]);
  const [actors, setActors] = useState<any[]>([]);
  const [tags, setTags] = useState<any[]>([]);
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
  // Persist locally added items so they survive reloads even if Supabase is absent.
  React.useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(
        "gaia_gallery_local_items_v1",
        JSON.stringify(localNewItems),
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
        : item,
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

  const sortedItems = useMemo(() => {
    if (activeFilter === "Latest") {
      return [...allItems].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
    }
    if (activeFilter === "Oldest") {
      return [...allItems].sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      );
    }
    // "Most Viewed" will be handled separately for the main grid for now
    return allItems;
  }, [allItems, activeFilter]);

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

  const videosArray = useMemo(() => {
    return sortedItems.filter((item) => item.type === "video");
  }, [sortedItems]);

  const handleNextVideo = () => {
    if (!currentVideoId) return;
    const currentIndex = videosArray.findIndex(
      (video) => video.id === currentVideoId,
    );
    if (currentIndex < videosArray.length - 1) {
      const nextVideo = videosArray[currentIndex + 1];
      setCurrentVideoId(nextVideo.id);
      // Scroll to the next video card
      const element = document.getElementById(`media-card-${nextVideo.id}`);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  };

  const handlePrevVideo = () => {
    if (!currentVideoId) return;
    const currentIndex = videosArray.findIndex(
      (video) => video.id === currentVideoId,
    );
    if (currentIndex > 0) {
      const prevVideo = videosArray[currentIndex - 1];
      setCurrentVideoId(prevVideo.id);
      // Scroll to the previous video card
      const element = document.getElementById(`media-card-${prevVideo.id}`);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  };

  const handleDeleteItem = (id: string) => {
    setHiddenIds((prev) => {
      const next = Array.from(new Set([...prev, id]));
      try {
        if (typeof window !== "undefined") {
          window.localStorage.setItem(
            "gaia_gallery_hidden",
            JSON.stringify(next),
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
            JSON.stringify(next),
          );
        }
      } catch {
        // ignore
      }
      return next;
    });
  };

  if (!isHydrated) {
    return null;
  }

  return (
    <main className={`relative min-h-screen ${spaceGrotesk.className} gaia-bg`}>
      <section>
        <div className="mx-auto w-full max-w-7xl px-4 pb-12 pt-10 xl:max-w-[85vw]">
          <div className="flex justify-center mb-8">
            <FilterBar
              activeFilter={activeFilter}
              onFilterChange={setActiveFilter}
            />
          </div>
          {/* Most Viewed */}
          {mostViewed.length > 0 && (
            <section className="space-y-3 pt-2 mb-8">
              <h2 className="text-white text-lg">Most Viewed</h2>
              <MediaGrid
                title=""
                items={mostViewed}
                page={1}
                perPage={12}
                onPageChange={() => {}}
                allowDelete={false}
                onDeleteItem={() => {}}
                onRenameItem={() => {}}
                maxVisibleItems={12}
                currentVideoId={currentVideoId}
                onSetCurrentVideo={setCurrentVideoId}
              />
            </section>
          )}

          {/* Actors */}
          {actors.length > 0 && (
            <section className="space-y-3 mb-8">
              <h2 className="text-white text-lg">Actors</h2>
              <div className="flex gap-4 overflow-x-auto py-3 px-1 scrollbar-hide">
                {actors.map((a) => (
                  <ActorCard key={a.id} actor={a} />
                ))}
              </div>
            </section>
          )}
          {/* Tags */}
          {tags.length > 0 && (
            <section className="space-y-3 mb-8">
              <h2 className="text-white text-lg">Tags</h2>
              <div className="flex gap-2 flex-wrap">
                {tags.map((t) => (
                  <a
                    key={t.id}
                    href={`/gallery-awakening?tag=${t.name}`}
                    className="px-3 py-1 text-xs border border-white/30 rounded-full text-white"
                  >
                    #{t.name}
                  </a>
                ))}
              </div>
            </section>
          )}
          {/* BigShot grid */}
          <section className="space-y-3 pt-2">
            <MediaGrid
              title="Feed"
              items={activeFilter === "Most Viewed" ? mostViewed : sortedItems}
              page={page}
              perPage={PAGE_SIZE}
              onPageChange={setPage}
              allowDelete={allowDelete}
              onDeleteItem={handleDeleteItem}
              onRenameItem={handleRenameItem}
              maxVisibleItems={allowedGalleryMediaCount}
              currentVideoId={currentVideoId}
              onSetCurrentVideo={setCurrentVideoId}
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

  return (
    <PageTransition>
      <GalleryAwakeningContent
        allowedGalleryMediaCount={allowedGalleryMediaCount}
      />
    </PageTransition>
  );
};

export default GalleryAwakeningPage;
