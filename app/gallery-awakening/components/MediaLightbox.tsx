"use client";

import React, { useEffect, useMemo, useState } from "react";
import type { MediaItem } from "../mediaTypes";
import { formatMediaTitle } from "../formatMediaTitle";
import { getR2Url, getR2PreviewUrl } from "../r2";
import { recordViewDuration } from "../viewTracker";

interface MediaLightboxProps {
  items: MediaItem[];
  activeId: string;
  onClose: () => void;
  onChange: (id: string) => void;
}

export const MediaLightbox: React.FC<MediaLightboxProps> = ({
  items,
  activeId,
  onClose,
  onChange,
}) => {
  const ordered = useMemo(
    () => items.filter((i) => i.type === "image" || i.type === "video"),
    [items]
  );

  const currentIndex = ordered.findIndex((i) => i.id === activeId);
  const current = currentIndex >= 0 ? ordered[currentIndex] : null;

  const [entered, setEntered] = useState(false);
  const poster =
    current && current.type === "video"
      ? current.thumbnails && current.thumbnails[0]
        ? current.thumbnails[0].r2Key
          ? getR2PreviewUrl(current.thumbnails[0].r2Key)
          : current.thumbnails[0].localPath
          ? `/${current.thumbnails[0].localPath.replace(/^\/+/, "")}`
          : undefined
        : undefined
      : undefined;

  const gotoPrev = () => {
    if (!ordered.length) return;
    const nextIndex = (currentIndex - 1 + ordered.length) % ordered.length;
    onChange(ordered[nextIndex].id);
  };

  const gotoNext = () => {
    if (!ordered.length) return;
    const nextIndex = (currentIndex + 1) % ordered.length;
    onChange(ordered[nextIndex].id);
  };

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setEntered(true), 10);
    return () => {
      clearTimeout(t);
      setEntered(false);
    };
  }, [current?.id]);

  useEffect(() => {
    const start = Date.now();
    return () => {
      const elapsedSec = (Date.now() - start) / 1000;
      if (current?.id) {
        recordViewDuration(current.id, elapsedSec);
      }
    };
  }, [current?.id]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") gotoPrev();
      if (e.key === "ArrowRight") gotoNext();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  if (!current) return null;

  const displayTitle = formatMediaTitle(current.title);
  const normalizedLocal = current.localPath
    ? `/${current.localPath.replace(/^\/+/, "")}`
    : "";
  const src = current.r2Path
    ? getR2Url(current.r2Path)
    : normalizedLocal || "/placeholder-gallery-image.png";

  return (
    <div
      className="fixed inset-0 z-50 flex h-screen w-screen items-center justify-center bg-black/80 px-2 py-2 backdrop-blur-sm"
      onClick={onClose}
      role="presentation"
    >
      <button
        type="button"
        className="absolute right-5 top-5 rounded-full bg-base-100/80 px-3 py-1 text-sm font-semibold text-base-content shadow hover:bg-base-200"
        onClick={onClose}
      >
        Close
      </button>

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          gotoPrev();
        }}
        className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-base-100/80 px-3 py-2 text-base font-semibold text-base-content shadow hover:bg-base-200"
        aria-label="Previous image"
      >
        ←
      </button>

      <figure
        className="m-0 flex max-h-[90vh] max-w-[90vw] flex-col items-center justify-center gap-3 text-center"
        onClick={(e) => e.stopPropagation()}
      >
        {current.type === "image" ? (
          <img
            src={src}
            alt={displayTitle}
            className={`mx-auto max-h-[75vh] max-w-full rounded-xl object-contain transform transition duration-200 ${
              entered ? "scale-100 opacity-100" : "scale-95 opacity-0"
            }`}
          />
        ) : current.type === "video" ? (
          current.embedUrl ? (
            <iframe
              src={current.embedUrl}
              title={displayTitle}
              className="mx-auto h-[60vh] max-w-full rounded-xl"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
              allowFullScreen
            />
          ) : (
            <video
              src={src}
              className={`mx-auto max-h-[75vh] max-w-full rounded-xl bg-black object-contain transform transition duration-200 ${
                entered ? "scale-100 opacity-100" : "scale-95 opacity-0"
              }`}
              controls
              playsInline
              preload="metadata"
              poster={poster}
            />
          )
        ) : null}
        <figcaption className="text-sm text-base-content">
          {displayTitle}
        </figcaption>
      </figure>

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          gotoNext();
        }}
        className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-base-100/80 px-3 py-2 text-base font-semibold text-base-content shadow hover:bg-base-200"
        aria-label="Next image"
      >
        →
      </button>
    </div>
  );
};

export const Lightbox = MediaLightbox;
