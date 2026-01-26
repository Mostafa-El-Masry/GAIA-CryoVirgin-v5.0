"use client";

import React, { useMemo, useState } from "react";
import { Space_Grotesk } from "next/font/google";
import { mockMediaItems } from "./mockMedia";
import type { MediaItem } from "./mediaTypes";
import { PageTransition } from "./components/PageTransition";
import { useGalleryData } from "./useInstagramData";
import { useGaiaFeatureUnlocks } from "@/app/hooks/useGaiaFeatureUnlocks";
import { hasR2PublicBase } from "./r2";
import { supabase } from "./lib/videoStore";
import { useCurrentPermissions, isCreatorAdmin } from "@/lib/permissions";
import InstagramPost from "./components/InstagramPost";
import "./instagram.css";

const PAGE_SIZE = 20;

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

type FilterOption = "Latest" | "Oldest" | "Most Viewed";

type InstagramContentProps = {
  allowedGalleryMediaCount: number;
};

const InstagramContent: React.FC<InstagramContentProps> = ({
  allowedGalleryMediaCount,
}) => {
  const [isHydrated, setIsHydrated] = React.useState(false);

  React.useEffect(() => {
    setIsHydrated(true);
  }, []);

  const { items } = useGalleryData(mockMediaItems);
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
  const [itemsToShow, setItemsToShow] = useState(20);
  const [page, setPage] = useState<number>(1);
  const [shuffleSeed] = useState(() => Math.random().toString(36).slice(2, 10));
  const [currentVideoId, setCurrentVideoId] = useState<string | null>(null);
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

  const sortedItems = shuffledItems;

  React.useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + window.scrollY >=
        document.body.offsetHeight - 100
      ) {
        setItemsToShow((prev) => Math.min(prev + 20, sortedItems.length));
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [sortedItems.length]);

  const userEmail = null;
  const allowDelete = Boolean((permissions as any).galleryDelete);

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
      <section className="pt-4 max-w-4xl mx-auto px-4">
        {sortedItems.slice(0, itemsToShow).map((item) => (
          <InstagramPost key={item.id} item={item} />
        ))}
      </section>
    </main>
  );
};

const InstagramPage: React.FC = () => {
  const { totalLessonsCompleted, allowedGalleryMediaCount, featureUnlocks } =
    useGaiaFeatureUnlocks();

  return (
    <PageTransition>
      <InstagramContent allowedGalleryMediaCount={allowedGalleryMediaCount} />
    </PageTransition>
  );
};

export default InstagramPage;
