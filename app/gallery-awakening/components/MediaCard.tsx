"use client";

import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
  useCallback,
} from "react";
import type { MediaItem } from "../mediaTypes";
import { getR2Url, getR2PreviewUrl } from "../r2";

/* ─────────────────────────────────────
   CONFIG
───────────────────────────────────── */

const PREVIEW_INTERVAL = 1200;
const INTERSECTION_THRESHOLD = 0.35;

/* ─────────────────────────────────────
   TYPES
───────────────────────────────────── */

type Props = {
  item: MediaItem;
};

/* ─────────────────────────────────────
   COMPONENT
───────────────────────────────────── */

export function MediaCard({ item }: Props) {
  const isVideo = item.type === "video";
  const isImage = item.type === "image";

  const src = getR2Url(item.r2Path || "");

  const cardRef = useRef<HTMLDivElement | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [previewIndex, setPreviewIndex] = useState(0);

  /* ─────────────────────────────────────
     VIDEO PREVIEW SOURCES (VIDEO ONLY)
  ───────────────────────────────────── */

  const previewSources = useMemo(() => {
    if (!isVideo) return [];
    return (item.thumbnails ?? [])
      .sort((a, b) => a.index - b.index)
      .map((t) => getR2PreviewUrl(t.r2Key || ""))
      .filter(Boolean);
  }, [item, isVideo]);

  const poster = previewSources[previewIndex] ?? previewSources[0] ?? undefined;

  /* ─────────────────────────────────────
     INTERSECTION OBSERVER
  ───────────────────────────────────── */

  useEffect(() => {
    if (!cardRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: INTERSECTION_THRESHOLD },
    );

    observer.observe(cardRef.current);
    return () => observer.disconnect();
  }, []);

  /* ─────────────────────────────────────
     PREVIEW CYCLING (DESKTOP + VIDEO ONLY)
  ───────────────────────────────────── */

  const shouldCycle =
    isVideo && isVisible && isHovered && previewSources.length > 1;

  useEffect(() => {
    if (!shouldCycle) {
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = null;
      setPreviewIndex(0);
      return;
    }

    timerRef.current = setInterval(() => {
      setPreviewIndex((i) => (i + 1) % previewSources.length);
    }, PREVIEW_INTERVAL);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = null;
    };
  }, [shouldCycle, previewSources]);

  /* ─────────────────────────────────────
     HOVER HANDLERS (DESKTOP SAFE)
  ───────────────────────────────────── */

  const onMouseEnter = useCallback(() => {
    if (window.matchMedia("(hover: hover)").matches) {
      setIsHovered(true);
    }
  }, []);

  const onMouseLeave = useCallback(() => {
    setIsHovered(false);
  }, []);

  /* ─────────────────────────────────────
     RENDER
  ───────────────────────────────────── */

  return (
    <div
      ref={cardRef}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className="relative w-full aspect-video rounded-lg overflow-hidden bg-black"
    >
      {/* IMAGE ONLY */}
      {isImage && (
        <img
          src={src}
          alt={item.title}
          loading="lazy"
          className="w-full h-full object-cover"
        />
      )}

      {/* VIDEO ONLY (LAZY HYDRATION) */}
      {isVideo && isVisible && (
        <video
          src={src}
          poster={poster}
          muted
          playsInline
          preload="metadata"
          className="w-full h-full object-cover"
        />
      )}

      {/* TITLE OVERLAY */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3">
        <p className="text-sm text-white truncate">{item.title}</p>
      </div>
    </div>
  );
}
