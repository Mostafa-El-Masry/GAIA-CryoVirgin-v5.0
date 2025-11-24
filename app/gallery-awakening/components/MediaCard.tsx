'use client';

import React, { useRef, useState } from 'react';
import type { MediaItem, VideoThumbnail } from '../mediaTypes';
import { getR2PreviewUrl, getR2Url } from '../r2';
import { formatMediaTitle } from '../formatMediaTitle';
import {
  formatViewDuration,
  onViewStoreChange,
  recordViewDuration,
} from '../viewTracker';
import type { ViewEntry } from '../viewTracker';

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
  const [shouldLoadVideo, setShouldLoadVideo] = useState(false);
  const [isVideoLoading, setIsVideoLoading] = useState(false);
  const [playStart, setPlayStart] = useState<number | null>(null);
  const [viewEntry, setViewEntry] = useState<ViewEntry | null>(null);
  const displayTitle = formatMediaTitle(item.title);

  const baseVideoSrc = React.useMemo(() => {
    if (item.localPath) {
      return normalizeLocalPath(item.localPath);
    }
    if (item.r2Path) {
      return getR2Url(item.r2Path);
    }
    return '';
  }, [item.localPath, item.r2Path]);

  const videoSrc = shouldLoadVideo ? baseVideoSrc : '';

  const previewSrcForThumb = (thumb?: VideoThumbnail) => {
    if (!thumb) return '';
    if (thumb.localPath) return normalizeLocalPath(thumb.localPath);
    if (thumb.r2Key) return getR2PreviewUrl(thumb.r2Key);
    return '';
  };

  const primaryImageSrc = React.useMemo(() => {
    if (item.type === 'video') {
      const thumb = item.thumbnails?.[0];
      const thumbSrc = previewSrcForThumb(thumb);
      if (thumbSrc) return thumbSrc;
      return '/placeholder-gallery-image.png';
    }
    if (item.r2Path) return getR2Url(item.r2Path);
    if (item.localPath) return normalizeLocalPath(item.localPath);
    return '/placeholder-gallery-image.png';
  }, [item.localPath, item.r2Path, item.thumbnails, item.type]);

  const primaryPreviewSrc = React.useMemo(
    () => previewSrcForThumb(item.thumbnails?.[0]),
    [item.thumbnails]
  );

  React.useEffect(() => {
    // Reset player state when switching media items.
    setShouldLoadVideo(false);
    setIsVideoLoading(false);
    setVideoError(false);
    setPlayStart(null);
  }, [item.id]);

  React.useEffect(() => {
    if (shouldLoadVideo && videoRef.current) {
      videoRef.current.volume = 0;
    }
  }, [shouldLoadVideo]);

  // Track video watch time in seconds (rounded down to the floor as required).
  React.useEffect(() => {
    const video = videoRef.current;
    if (!video || item.type !== 'video' || !shouldLoadVideo) return;

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
  }, [item.id, item.type, playStart, shouldLoadVideo]);

  React.useEffect(() => {
    const unsubscribe = onViewStoreChange((store) => {
      setViewEntry(store[item.id] ?? null);
    });
    return unsubscribe;
  }, [item.id]);

  const handleSkip = (seconds: number) => {
    const video = videoRef.current;
    if (!video) return;
    const duration = video.duration || Infinity;
    const next = video.currentTime + seconds;
    video.currentTime = Math.max(0, Math.min(duration, next));
  };

  const renderImage = () => {
    const src = imageBroken ? '/placeholder-gallery-image.png' : primaryImageSrc;

    return (
      <div className="relative w-full overflow-hidden rounded-xl border border-base-300 bg-base-100 shadow-sm aspect-[4/3]">
        <img
          src={src}
          alt={displayTitle}
          className="h-full w-full cursor-pointer object-cover transition hover:scale-[1.01] hover:opacity-90"
          loading="lazy"
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
        <div className="flex items-center gap-2 rounded-xl border border-dashed border-base-300/70 bg-base-100/80 px-3 py-2 text-[11px] text-base-content/70">
          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-base-200 text-[10px] font-semibold text-base-content/70">
            +
          </span>
          <span>No preview thumbnails yet. Mark this video to generate more thumbs later.</span>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-2 overflow-x-auto rounded-xl border border-base-300/80 bg-base-100/90 p-2">
        {item.thumbnails.map((thumb) => {
          const thumbSrc = previewSrcForThumb(thumb) || '/placeholder-gallery-image.png';
          return (
            <div
              key={thumb.index}
              className="relative h-16 w-20 flex-none overflow-hidden rounded-lg bg-base-200 shadow-sm"
            >
              <img
                src={thumbSrc}
                alt={`${displayTitle} preview ${thumb.index}`}
                className="h-full w-full object-cover"
                loading="lazy"
                onError={(e) => {
                  e.currentTarget.src = '/placeholder-gallery-image.png';
                }}
              />
              <div className="absolute left-1 top-1 rounded-full bg-base-100/85 px-2 py-0.5 text-[10px] font-semibold text-base-content shadow">
                #{String(thumb.index).padStart(2, '0')}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderVideoBody = () => {
    if (!baseVideoSrc) {
      return (
        <div className="flex min-h-[160px] w-full items-center justify-center rounded-xl border border-dashed border-base-300 text-[11px] text-base-content/60">
          Video path is missing. Check your Gallery metadata or Sync Center.
        </div>
      );
    }

    if (videoError) {
      return (
        <div className="flex min-h-[160px] w-full items-center justify-center rounded-xl border border-dashed border-base-300 text-[11px] text-base-content/60">
          GAIA could not load this video. Make sure the file exists and the path is correct.
        </div>
      );
    }

    if (!shouldLoadVideo) {
      return (
        <button
          type="button"
          onClick={() => {
            setVideoError(false);
            setIsVideoLoading(true);
            setShouldLoadVideo(true);
          }}
          className="group relative block w-full overflow-hidden rounded-xl"
        >
          <div className="relative w-full overflow-hidden rounded-xl bg-base-200">
            {primaryPreviewSrc ? (
              <img
                src={primaryPreviewSrc}
                alt={`${displayTitle} preview`}
                className="h-auto w-full object-cover transition duration-300 group-hover:scale-[1.02]"
                loading="lazy"
                onError={(e) => {
                  e.currentTarget.src = '/placeholder-gallery-image.png';
                }}
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-[11px] text-base-content/60">
                Preview not available yet.
              </div>
            )}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
          </div>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-2">
            <span className="rounded-full bg-base-100/90 px-4 py-2 text-[12px] font-semibold text-base-content shadow-lg">
              Tap to play (no metadata preloaded)
            </span>
            {primaryPreviewSrc ? (
              <span className="rounded-full bg-base-100/80 px-3 py-1 text-[10px] text-base-content/70 shadow">
                Using R2 preview frames
              </span>
            ) : null}
          </div>
        </button>
      );
    }

    return (
      <div className="relative w-full overflow-hidden rounded-xl bg-black">
        <video
          ref={videoRef}
          src={videoSrc}
          className="h-auto w-full object-cover"
          controls
          playsInline
          preload="none"
          poster={primaryPreviewSrc || undefined}
          onError={() => {
            setVideoError(true);
            setIsVideoLoading(false);
          }}
          onLoadedData={() => setIsVideoLoading(false)}
        />
        {isVideoLoading && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-xl bg-base-100/50 text-[11px] font-semibold text-base-content">
            Loading video…
          </div>
        )}
      </div>
    );
  };

  const renderDetailsOverlay = () => {
    const hasWatchHistory = Boolean(viewEntry && viewEntry.value > 0);
    const viewTimeLabel = formatViewDuration(viewEntry);

    return (
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 rounded-xl bg-gradient-to-t from-base-200/80 via-base-200/20 to-transparent opacity-0 transition-all duration-500 ease-out group-hover:opacity-100" />

        <div className="absolute right-3 top-3 -translate-y-2 opacity-0 transition-all duration-500 ease-out group-hover:translate-y-0 group-hover:opacity-100">
          <div className="pointer-events-auto inline-flex items-center gap-2 rounded-full bg-base-100/95 px-3 py-1 text-[10px] font-semibold text-base-content shadow-lg backdrop-blur">
            <span
              className={`h-2.5 w-2.5 rounded-full ${
                hasWatchHistory ? 'bg-emerald-500' : 'bg-base-300'
              }`}
            />
            <span className="uppercase tracking-wide text-[9px] text-base-content/70">
              View time
            </span>
            <span>{viewTimeLabel}</span>
          </div>
        </div>

        <div className="pointer-events-none absolute inset-0 flex flex-col justify-end translate-y-2 p-3 opacity-0 transition-all duration-500 ease-out group-hover:translate-y-0 group-hover:opacity-100">
          <div className="flex justify-end">
            <div className="pointer-events-auto rounded-full bg-base-100/90 px-2 py-1 text-base font-semibold text-base-content shadow">
              i
            </div>
          </div>
          <div className="pointer-events-auto mt-2 max-w-full space-y-1 rounded-xl bg-base-100/95 p-3 text-[11px] text-base-content shadow-lg backdrop-blur">
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
      </div>
    );
  };


  return (
    <div
      className="group relative flex h-full flex-col gap-2 overflow-hidden rounded-2xl border border-base-300 bg-base-100/90 p-2 shadow-sm transition duration-200"
      aria-label={displayTitle}
    >
      {item.type === 'image' ? (
        <div className="relative overflow-hidden rounded-xl border border-base-300">
          {/* Still simple <img>; later we can switch to Next/Image. */}
          {renderImage()}
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <div className="relative overflow-hidden rounded-xl border border-base-300 bg-base-200">
            <div className="relative">
              {renderVideoBody()}
              {shouldLoadVideo && !videoError && baseVideoSrc && (
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
              )}
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
