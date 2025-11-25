"use client";

import React, { useRef, useState } from "react";
import type { MediaItem, VideoThumbnail } from "../mediaTypes";
import { getR2PreviewUrl, getR2Url } from "../r2";
import { formatMediaTitle } from "../formatMediaTitle";
import {
  formatViewDuration,
  onViewStoreChange,
  recordViewDuration,
} from "../viewTracker";
import type { ViewEntry } from "../viewTracker";

interface MediaCardProps {
  item: MediaItem;
  onPreview?: (item: MediaItem) => void;
  allowDelete?: boolean;
  onDelete?: () => void;
  onRename?: (nextTitle: string) => void;
}

const normalizeLocalPath = (p?: string) => {
  if (!p) return "";
  return p.startsWith("http") ? p : `/${p.replace(/^\/+/, "")}`;
};

export const MediaCard: React.FC<MediaCardProps> = ({
  item,
  onPreview,
  allowDelete = false,
  onDelete,
  onRename,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [imageBroken, setImageBroken] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [shouldLoadVideo, setShouldLoadVideo] = useState(false);
  const [isVideoLoading, setIsVideoLoading] = useState(false);
  const [posterLoaded, setPosterLoaded] = useState(false);
  const [playStart, setPlayStart] = useState<number | null>(null);
  const [viewEntry, setViewEntry] = useState<ViewEntry | null>(null);
  const [isRenaming, setIsRenaming] = useState(false);
  const [draftTitle, setDraftTitle] = useState(
    (item.title || "").replace(/\.[^.]+$/, "")
  );
  const [previewIndex, setPreviewIndex] = useState(0);
  const cycleTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const viewTimeLabel = formatViewDuration(viewEntry);
  const displayTitle = formatMediaTitle(item.title);

  const baseVideoSrc = React.useMemo(() => {
    if (item.localPath) {
      return normalizeLocalPath(item.localPath);
    }
    if (item.r2Path) {
      return getR2Url(item.r2Path);
    }
    return "";
  }, [item.localPath, item.r2Path]);

  const videoSrc = shouldLoadVideo ? baseVideoSrc : "";

  const previewSrcForThumb = (thumb?: VideoThumbnail) => {
    if (!thumb) return "";
    if (thumb.localPath) return normalizeLocalPath(thumb.localPath);
    if (thumb.r2Key) return getR2PreviewUrl(thumb.r2Key);
    return "";
  };

  const previewSources = React.useMemo(
    () =>
      (item.thumbnails || [])
        .map(previewSrcForThumb)
        .filter(
          (src) => src && !src.includes("placeholder-gallery-image.png")
        ) as string[],
    [item.thumbnails]
  );

  const primaryImageSrc = React.useMemo(() => {
    if (item.type === "video") {
      const thumb = item.thumbnails?.[0];
      const thumbSrc = previewSrcForThumb(thumb);
      if (thumbSrc) return thumbSrc;
      return "";
    }
    if (item.r2Path) return getR2Url(item.r2Path);
    if (item.localPath) return normalizeLocalPath(item.localPath);
    return "/placeholder-gallery-image.png";
  }, [item.localPath, item.r2Path, item.thumbnails, item.type]);

  const primaryPreviewSrc = React.useMemo(
    () => previewSrcForThumb(item.thumbnails?.[0]),
    [item.thumbnails]
  );
  const previewPoster =
    previewSources[previewIndex] ||
    (primaryPreviewSrc &&
    !primaryPreviewSrc.includes("placeholder-gallery-image.png")
      ? primaryPreviewSrc
      : undefined) ||
    (primaryImageSrc || undefined);

  React.useEffect(() => {
    // Reset player state when switching media items.
    setShouldLoadVideo(false);
    setIsVideoLoading(false);
    setVideoError(false);
      setPlayStart(null);
      setIsRenaming(false);
      setDraftTitle((item.title || "").replace(/\.[^.]+$/, ""));
      setPosterLoaded(false);
      setPreviewIndex(0);
      if (cycleTimer.current) {
        clearInterval(cycleTimer.current);
        cycleTimer.current = null;
      }
    }, [item.id]);

  React.useEffect(() => {
    if (shouldLoadVideo && videoRef.current) {
      videoRef.current.volume = 0;
    }
  }, [shouldLoadVideo]);

  // Track video watch time in seconds (rounded down to the floor as required).
  React.useEffect(() => {
    const video = videoRef.current;
    if (!video || item.type !== "video" || !shouldLoadVideo) return;

    const handlePlay = () => setPlayStart(Date.now());
    const handlePauseOrEnd = () => {
      if (playStart) {
        const elapsed = (Date.now() - playStart) / 1000;
        recordViewDuration(item.id, elapsed);
        setPlayStart(null);
      }
    };

    video.addEventListener("play", handlePlay);
    video.addEventListener("pause", handlePauseOrEnd);
    video.addEventListener("ended", handlePauseOrEnd);

    return () => {
      video.removeEventListener("play", handlePlay);
      video.removeEventListener("pause", handlePauseOrEnd);
      video.removeEventListener("ended", handlePauseOrEnd);
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

  const handleSubmitRename = () => {
    if (!onRename) return setIsRenaming(false);
    const trimmed = draftTitle.replace(/\.[^.]+$/, "").trim();
    const next = trimmed || "Untitled";
    onRename(next);
    setIsRenaming(false);
  };

  const renderRenameOverlay = () => {
    if (!isRenaming) return null;
    return (
      <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/60 p-4 backdrop-blur">
        <div className="w-full max-w-sm space-y-2 rounded-xl border border-white/30 bg-black/70 p-3 shadow-lg">
          <p className="text-xs font-semibold text-white">Rename media</p>
          <input
            value={draftTitle}
            onChange={(e) => setDraftTitle(e.target.value)}
            className="w-full rounded-lg border border-white/40 bg-black/60 px-3 py-2 text-sm text-white outline-none focus:border-primary focus:ring-2 focus:ring-primary/40 placeholder:text-white/70"
            placeholder="New title"
          />
          <div className="flex gap-2 text-xs">
            <button
              type="button"
              onClick={handleSubmitRename}
              className="flex-1 rounded-lg bg-primary px-3 py-1.5 font-semibold text-white hover:bg-primary-focus"
            >
              Save
            </button>
            <button
              type="button"
              onClick={() => setIsRenaming(false)}
              className="flex-1 rounded-lg bg-white/10 px-3 py-1.5 font-semibold text-white hover:bg-white/30"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderImage = () => {
    const src = imageBroken
      ? "/placeholder-gallery-image.png"
      : primaryImageSrc;

    return (
      <div className="group relative w-full overflow-hidden rounded-xl bg-base-100 shadow-lg">
        <img
          src={src}
          alt={displayTitle}
          className="relative z-0 block h-auto w-full cursor-pointer object-contain transition duration-200 hover:scale-[1.01] hover:opacity-95"
          loading="lazy"
          onClick={() => onPreview?.(item)}
          onError={() => setImageBroken(true)}
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/35 via-black/10 to-transparent opacity-0 transition duration-200 group-hover:opacity-100" />

        {onRename && (
          <button
            type="button"
            onClick={() => setIsRenaming(true)}
            className="absolute right-3 top-3 z-20 px-3 py-1 text-[10px] font-semibold text-white opacity-0 transition duration-200 group-hover:opacity-100"
          >
            Rename
          </button>
        )}

        <div className="absolute inset-x-0 bottom-0 z-10 flex items-center justify-between gap-2 bg-gradient-to-t from-black/55 to-transparent px-3 py-2 text-[11px] text-white opacity-0 transition duration-200 group-hover:opacity-100">
          <span className="truncate font-semibold drop-shadow">{displayTitle}</span>
          <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold text-white shadow-none">
            ? {viewTimeLabel || "Not watched yet"}
          </span>
        </div>

        {allowDelete && (
          <button
            type="button"
            onClick={onDelete}
            className="absolute left-3 top-3 z-20 px-3 py-1 text-[10px] font-semibold text-white opacity-0 transition duration-200 group-hover:opacity-100"
          >
            Delete
          </button>
        )}
        {renderDetailsOverlay()}
        {renderRenameOverlay()}
      </div>
    );
  };

  const renderVideoPreviewStrip = () => null;

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
          GAIA could not load this video. Make sure the file exists and the path
          is correct.
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
          className="group relative block w-full overflow-hidden rounded-xl aspect-video"
          onMouseEnter={() => {
            if (previewSources.length > 1 && !cycleTimer.current) {
              cycleTimer.current = setInterval(() => {
                setPreviewIndex((idx) => (idx + 1) % previewSources.length);
              }, 220);
            }
          }}
          onMouseLeave={() => {
            if (cycleTimer.current) {
              clearInterval(cycleTimer.current);
              cycleTimer.current = null;
            }
            setPreviewIndex(0);
          }}
        >
          <div className="relative h-full w-full overflow-hidden rounded-xl bg-base-200">
            {previewPoster ? (
              <>
                <img
                  src={previewPoster}
                  alt={`${displayTitle} preview`}
                  className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
                  loading="lazy"
                  onLoad={() => setPosterLoaded(true)}
                  onError={(e) => {
                    e.currentTarget.src = "/placeholder-gallery-image.png";
                  }}
                />
                {!posterLoaded && (
                  <div className="absolute inset-0 animate-pulse rounded-xl bg-base-300/70" />
                )}
              </>
            ) : baseVideoSrc ? (
              <video
                src={baseVideoSrc}
                className="h-full w-full object-cover"
                preload="metadata"
                muted
                playsInline
                controls={false}
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-[11px] text-base-content/60">
                Preview not available yet.
              </div>
            )}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
          </div>
        </button>
      );
    }

    return (
      <div className="group relative w-full overflow-hidden rounded-xl bg-black aspect-video">
        <video
          ref={videoRef}
          src={videoSrc}
          className="h-full w-full object-contain bg-black"
          controls
          playsInline
          preload="none"
          poster={previewPoster || undefined}
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
        {allowDelete && (
          <button
            type="button"
            onClick={onDelete}
            className="absolute left-3 top-3 z-10 px-3 py-1 text-[10px] font-semibold text-white opacity-0 transition duration-200 group-hover:opacity-100"
          >
            Delete
          </button>
        )}
        {onRename && (
          <button
            type="button"
            onClick={() => setIsRenaming(true)}
            className="absolute right-3 top-3 z-10 px-3 py-1 text-[10px] font-semibold text-white opacity-0 transition duration-200 group-hover:opacity-100"
          >
            Rename
          </button>
        )}
        {renderRenameOverlay()}
      </div>
    );
  };

  const renderDetailsOverlay = () => {
    return (
      <div className="pointer-events-none absolute inset-0">
        <div className="pointer-events-none absolute inset-0 flex flex-col justify-end translate-y-2 p-3 opacity-0 transition-all duration-300 ease-out group-hover:translate-y-0 group-hover:opacity-100">
          <div className="pointer-events-auto mt-2 max-w-full space-y-1 p-1 text-[11px] text-white drop-shadow">
            <p className="font-semibold">{displayTitle}</p>
            {item.description &&
              item.description !== "Gallery image" &&
              item.description !== "Local video asset" &&
              item.description !== "Cloudflare R2 video asset" && (
                <p className="text-white/80">{item.description}</p>
              )}
            {item.tags?.length ? (
              <p className="text-[10px] text-white/70">
                Tags: {item.tags.join(", ")}
              </p>
            ) : null}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div
      className="group relative flex h-full flex-col gap-2 overflow-hidden rounded-2xl bg-base-100/90 p-2 shadow-sm transition duration-200"
      aria-label={displayTitle}
    >
      {item.type === "image" ? (
        <div className="relative overflow-hidden rounded-xl">
          {/* Still simple <img>; later we can switch to Next/Image. */}
          {renderImage()}
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <div className="relative overflow-hidden rounded-xl bg-base-200">
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
        </div>
      )}
    </div>
  );
};
