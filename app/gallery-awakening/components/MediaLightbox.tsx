"use client";

import React, { useEffect, useMemo } from 'react';
import type { MediaItem } from '../mediaTypes';
import { formatMediaTitle } from '../formatMediaTitle';
import { getR2Url } from '../r2';
import { recordViewDuration } from '../viewTracker';

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
    () => items.filter((i) => i.type === 'image'),
    [items]
  );

  const currentIndex = ordered.findIndex((i) => i.id === activeId);
  const current = currentIndex >= 0 ? ordered[currentIndex] : null;

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
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') gotoPrev();
      if (e.key === 'ArrowRight') gotoNext();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  if (!current) return null;

  const displayTitle = formatMediaTitle(current.title);
  const normalizedLocal = current.localPath
    ? `/${current.localPath.replace(/^\/+/, '')}`
    : '';
  const src = current.r2Path
    ? getR2Url(current.r2Path)
    : normalizedLocal || '/placeholder-gallery-image.png';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4 py-6 backdrop-blur-sm">
      <button
        type="button"
        className="absolute right-5 top-5 rounded-full bg-base-100/80 px-3 py-1 text-sm font-semibold text-base-content shadow hover:bg-base-200"
        onClick={onClose}
      >
        Close
      </button>

      <button
        type="button"
        onClick={gotoPrev}
        className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-base-100/80 px-3 py-2 text-base font-semibold text-base-content shadow hover:bg-base-200"
        aria-label="Previous image"
      >
        ‹
      </button>

      <figure className="max-h-[90vh] max-w-5xl space-y-3 text-center">
        <img
          src={src}
          alt={displayTitle}
          className="mx-auto max-h-[80vh] max-w-full rounded-xl object-contain"
        />
        <figcaption className="text-sm text-base-content">
          {displayTitle}
        </figcaption>
      </figure>

      <button
        type="button"
        onClick={gotoNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-base-100/80 px-3 py-2 text-base font-semibold text-base-content shadow hover:bg-base-200"
        aria-label="Next image"
      >
        ›
      </button>
    </div>
  );
};

export const Lightbox = MediaLightbox;
