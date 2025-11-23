'use client';

import React, { useRef, useState } from 'react';
import type { MediaItem } from '../mediaTypes';
import { getR2Url } from '../r2';
import { formatMediaTitle } from '../formatMediaTitle';
import { useEffectOnce } from '../useEffectOnce';
import { recordViewDuration } from '../viewTracker';

interface MediaCardProps {
  item: MediaItem;
  onPreview?: (item: MediaItem) => void;
}

const normalizeLocalPath = (p?: string) => {
  if (!p) return '';
  return p.startsWith('http') ? p : `/${p.replace(/^\/+/, '')}`;
};

export const MediaCard: React.FC<MediaCardProps> = ({ item, onPreview }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [imageBroken, setImageBroken] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [playStart, setPlayStart] = useState<number | null>(null);
  const displayTitle = formatMediaTitle(item.title);

  // Ensure videos start muted by default.
  useEffectOnce(() => {
    if (videoRef.current) {
      videoRef.current.volume = 0;
    }
  });

  // Track video watch time in seconds (rounded down to the floor as required).
  React.useEffect(() => {
    const video = videoRef.current;
    if (!video || item.type !== 'video') return;

    const handlePlay = () => setPlayStart(Date.now());
    const handlePauseOrEnd = () => {
      if (playStart) {
        const elapsed = (Date.now() - playStart) / 1000;
        recordViewDuration(item.id, elapsed);
        setPlayStart(null);
      }
    };

    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePauseOrEnd);
    video.addEventListener('ended', handlePauseOrEnd);

    return () => {
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePauseOrEnd);
      video.removeEventListener('ended', handlePauseOrEnd);
      // flush any active session on unmount
      if (playStart) {
        const elapsed = (Date.now() - playStart) / 1000;
        recordViewDuration(item.id, elapsed);
      }
    };
  }, [item.id, item.type, playStart]);

  const videoSrc = item.localPath
    ? normalizeLocalPath(item.localPath)
    : item.r2Path
      ? getR2Url(item.r2Path)
      : '';

  const handleSkip = (seconds: number) => {
    const video = videoRef.current;
    if (!video) return;
    const duration = video.duration || Infinity;
    const next = video.currentTime + seconds;
    video.currentTime = Math.max(0, Math.min(duration, next));
  };

  const handleVolumeStep = (delta: number) => {
    const video = videoRef.current;
    if (!video) return;
    const next = Math.max(0, Math.min(1, video.volume + delta));
    video.volume = next;
  };

  const renderImage = () => {
    const src = item.r2Path && !imageBroken
      ? getR2Url(item.r2Path)
      : item.localPath && !imageBroken
        ? normalizeLocalPath(item.localPath)
        : '/placeholder-gallery-image.png';

    return (
      <div className="relative">
        <img
          src={src}
          alt={displayTitle}
          className="h-auto w-full cursor-pointer rounded-xl transition hover:opacity-90"
          onClick={() => onPreview?.(item)}
          onError={() => setImageBroken(true)}
        />
        {renderDetailsOverlay()}
      </div>
    );
  };

  const renderVideoPreviewStrip = () => {
    if (!item.thumbnails || item.thumbnails.length === 0) {
      return (
        <p className="mt-1 text-[10px] text-base-content/60">
          No preview thumbnails yet. Mark this video to generate more thumbs later.
        </p>
      );
    }

    return (
      <div className="mt-2 flex gap-1 overflow-x-auto pb-1">
        {item.thumbnails.map((thumb) => {
          const thumbSrc = thumb.localPath
            ? normalizeLocalPath(thumb.localPath)
            : thumb.r2Key
              ? getR2Url(thumb.r2Key)
              : '/placeholder-gallery-image.png';
          return (
            <img
              key={thumb.index}
              src={thumbSrc}
              alt={`${displayTitle} preview ${thumb.index}`}
              className="h-10 w-14 flex-none rounded-md border border-base-300 object-cover"
              loading="lazy"
              onError={(e) => {
                e.currentTarget.src = '/placeholder-gallery-image.png';
              }}
            />
          );
        })}
      </div>
    );
  };

  const renderVideoBody = () => {
    if (!videoSrc) {
      return (
        <div className="flex h-40 w-full items-center justify-center rounded-xl border border-dashed border-base-300 text-[11px] text-base-content/60">
          Video path is missing. Check your Gallery metadata or Sync Center.
        </div>
      );
    }

    if (videoError) {
      return (
        <div className="flex h-40 w-full items-center justify-center rounded-xl border border-dashed border-base-300 text-[11px] text-base-content/60">
          GAIA could not load this video. Make sure the file exists and the path is correct.
        </div>
      );
    }

    return (
      <video
        ref={videoRef}
        src={videoSrc}
        className="h-auto w-full rounded-xl"
        controls
        onError={() => setVideoError(true)}
      />
    );
  };

  const renderDetailsOverlay = () => {
    return (
      <div className="pointer-events-none absolute inset-0 flex flex-col justify-end p-2 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
        <div className="flex justify-end">
          <div className="pointer-events-auto rounded-full bg-base-100/90 px-2 py-1 text-base font-semibold text-base-content shadow">
            …
          </div>
        </div>
        <div className="pointer-events-auto mt-2 max-w-full space-y-1 rounded-xl bg-base-100/95 p-3 text-[11px] text-base-content shadow-lg">
          <p className="font-semibold">{displayTitle}</p>
          {item.description &&
            item.description !== 'Gallery image' &&
            item.description !== 'Local video asset' &&
            item.description !== 'Cloudflare R2 video asset' && (
            <p className="text-base-content/70">{item.description}</p>
          )}
          {item.tags?.length ? (
            <p className="text-[10px] text-base-content/60">
              Tags: {item.tags.join(', ')}
            </p>
          ) : null}
        </div>
      </div>
    );
  };

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl bg-transparent p-1 transition duration-200" aria-label={displayTitle}>

      {/* Minimal header removed to keep cards clean. */}

      {item.type === 'image' ? (
        <div className="relative mb-3 overflow-hidden rounded-xl border border-base-300">
          {/* Still simple <img>; later we can switch to Next/Image. */}
          {renderImage()}
        </div>
      ) : (
        <div className="mb-3 space-y-2">
          <div className="relative overflow-hidden rounded-xl border border-base-300">
            <div className="relative">
              {renderVideoBody()}
              <div className="pointer-events-none absolute inset-0 flex items-center justify-between px-2 opacity-0 transition-opacity duration-200 hover:opacity-100">
                <button
                  type="button"
                  className="pointer-events-auto rounded-full bg-base-100/80 px-2 py-1 text-[11px] font-semibold text-base-content shadow"
                  onClick={() => handleSkip(-10)}
                  aria-label="Skip backward 10 seconds"
                >
                  ‹ 10s
                </button>
                <button
                  type="button"
                  className="pointer-events-auto rounded-full bg-base-100/80 px-2 py-1 text-[11px] font-semibold text-base-content shadow"
                  onClick={() => handleSkip(10)}
                  aria-label="Skip forward 10 seconds"
                >
                  10s ›
                </button>
              </div>
              {renderDetailsOverlay()}
            </div>
          </div>
          {/* Video preview strip powered by R2 thumbnails */}
          {renderVideoPreviewStrip()}
        </div>
      )}
    </div>
  );
};
