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
  variant?: "compact" | "feed";
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
  variant = "compact",
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
  const isCompact = variant === "compact";
  const createdLabel = (() => {
    const raw = item.createdAt;
    if (!raw) return "Today";
    const parsed = new Date(raw);
    if (Number.isNaN(parsed.getTime())) return "Today";
    return parsed.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  })();
  const description =
    item.description &&
    item.description !== "Gallery image" &&
    item.description !== "Local video asset" &&
    item.description !== "Cloudflare R2 video asset"
      ? item.description
      : null;
  const isEmbed = item.type === "video" && Boolean(item.embedUrl);
  const embedSrc = React.useMemo(() => {
    if (!item.embedUrl) return "";
    if (item.embedUrl.startsWith("/api/embed/proxy")) return item.embedUrl;
    return `/api/embed/proxy?url=${encodeURIComponent(item.embedUrl)}`;
  }, [item.embedUrl]);

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
  const useVideoPreview = Boolean(item.needsMoreThumbs && baseVideoSrc);
  const previewPoster = useVideoPreview
    ? undefined
    : previewSources[previewIndex] ||
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
    if (!video || item.type !== "video" || item.embedUrl || !shouldLoadVideo)
      return;

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

  const REACTIONS_KEY = "gaia_gallery_reactions_v1";

  const readReactions = () => {
    if (typeof window === "undefined") return {};
    try {
      const raw = window.localStorage.getItem(REACTIONS_KEY);
      return raw ? (JSON.parse(raw) as Record<string, any>) : {};
    } catch {
      return {};
    }
  };

  const writeReactions = (next: Record<string, any>) => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(REACTIONS_KEY, JSON.stringify(next));
    } catch {
      // ignore
    }
  };

  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);

  React.useEffect(() => {
    const store = readReactions();
    const entry = store[item.id];
    if (entry) {
      setLiked(Boolean(entry.liked));
      setSaved(Boolean(entry.saved));
      return;
    }
    setLiked(false);
    setSaved(Boolean(item.isFavorite));
  }, [item.id, item.isFavorite]);

  const updateReactions = (next: { liked: boolean; saved: boolean }) => {
    const store = readReactions();
    store[item.id] = next;
    writeReactions(store);
  };

  const toggleLike = () => {
    setLiked((prev) => {
      const next = !prev;
      updateReactions({ liked: next, saved });
      return next;
    });
  };

  const toggleSave = () => {
    setSaved((prev) => {
      const next = !prev;
      updateReactions({ liked, saved: next });
      return next;
    });
  };

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
      <div
        className={`group relative w-full overflow-hidden rounded-xl bg-base-100 ${
          isCompact ? "shadow-lg" : "shadow-none"
        }`}
      >
        <img
          src={src}
          alt={displayTitle}
          className="relative z-0 block h-auto w-full cursor-pointer object-contain transition duration-200 hover:scale-[1.01] hover:opacity-95"
          loading="lazy"
          onClick={() => onPreview?.(item)}
          onError={() => setImageBroken(true)}
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/35 via-black/10 to-transparent opacity-0 transition duration-200 group-hover:opacity-100" />

        {isCompact && onRename && (
          <button
            type="button"
            onClick={() => setIsRenaming(true)}
            className="absolute right-3 top-3 z-20 px-3 py-1 text-[10px] font-semibold text-white opacity-0 transition duration-200 group-hover:opacity-100"
          >
            Rename
          </button>
        )}

        {isCompact && (
          <div className="absolute inset-x-0 bottom-0 z-10 flex items-center justify-between gap-2 bg-gradient-to-t from-black/55 to-transparent px-3 py-2 text-[11px] text-white opacity-0 transition duration-200 group-hover:opacity-100">
            <span className="truncate font-semibold drop-shadow">{displayTitle}</span>
            <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold text-white shadow-none">
              ? {viewTimeLabel || "Not watched yet"}
            </span>
          </div>
        )}

        {isCompact && allowDelete && (
          <button
            type="button"
            onClick={onDelete}
            className="absolute left-3 top-3 z-20 px-3 py-1 text-[10px] font-semibold text-white opacity-0 transition duration-200 group-hover:opacity-100"
          >
            Delete
          </button>
        )}
        {isCompact ? renderDetailsOverlay() : null}
        {isCompact ? renderRenameOverlay() : null}
      </div>
    );
  };

  const renderVideoPreviewStrip = () => null;

  const renderVideoBody = () => {
    if (isEmbed && item.embedUrl) {
      return (
        <div className="relative w-full overflow-hidden rounded-xl bg-black aspect-video">
          <iframe
            src={embedSrc || item.embedUrl}
            title={displayTitle}
            className="h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
            allowFullScreen
            loading="lazy"
          />
          {isCompact && allowDelete && (
            <button
              type="button"
              onClick={onDelete}
              className="absolute left-3 top-3 z-10 px-3 py-1 text-[10px] font-semibold text-white opacity-0 transition duration-200 group-hover:opacity-100"
            >
              Delete
            </button>
          )}
          {isCompact && onRename && (
            <button
              type="button"
              onClick={() => setIsRenaming(true)}
              className="absolute right-3 top-3 z-10 px-3 py-1 text-[10px] font-semibold text-white opacity-0 transition duration-200 group-hover:opacity-100"
            >
              Rename
            </button>
          )}
          {isCompact ? renderRenameOverlay() : null}
        </div>
      );
    }

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
        {isCompact && allowDelete && (
          <button
            type="button"
            onClick={onDelete}
            className="absolute left-3 top-3 z-10 px-3 py-1 text-[10px] font-semibold text-white opacity-0 transition duration-200 group-hover:opacity-100"
          >
            Delete
          </button>
        )}
        {isCompact && onRename && (
          <button
            type="button"
            onClick={() => setIsRenaming(true)}
            className="absolute right-3 top-3 z-10 px-3 py-1 text-[10px] font-semibold text-white opacity-0 transition duration-200 group-hover:opacity-100"
          >
            Rename
          </button>
        )}
        {isCompact ? renderRenameOverlay() : null}
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

  const HeartIcon = ({ filled }: { filled: boolean }) => (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-5 w-5"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="1.6"
    >
      <path d="M12 20.6c-4.6-3-7.5-5.7-9-8.3-1.6-2.7-.9-6.3 1.8-8 2.3-1.5 5.4-1 7.2 1.2 1.8-2.2 4.9-2.7 7.2-1.2 2.7 1.7 3.4 5.3 1.8 8-1.5 2.6-4.4 5.3-9 8.3z" />
    </svg>
  );

  const BookmarkIcon = ({ filled }: { filled: boolean }) => (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-5 w-5"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="1.6"
    >
      <path d="M6 4.5h12a1 1 0 0 1 1 1v14.5l-7-4-7 4V5.5a1 1 0 0 1 1-1z" />
    </svg>
  );

  const renderFeedActions = (stacked: boolean) => {
    const base =
      "inline-flex items-center justify-center gap-2 rounded-full border text-[11px] font-semibold transition";
    const likeTone = liked
      ? "border-rose-500/50 bg-rose-500/10 text-rose-500"
      : "border-base-300 bg-base-100 text-base-content/70 hover:bg-base-200";
    const saveTone = saved
      ? "border-amber-500/50 bg-amber-500/10 text-amber-500"
      : "border-base-300 bg-base-100 text-base-content/70 hover:bg-base-200";
    const size = stacked ? "h-11 w-11" : "px-3 py-2";
    const label = stacked ? "sr-only" : "inline";

    return (
      <div className={stacked ? "flex flex-col items-center gap-2" : "flex items-center gap-2"}>
        <button
          type="button"
          onClick={toggleLike}
          aria-pressed={liked}
          className={`${base} ${size} ${likeTone}`}
        >
          <HeartIcon filled={liked} />
          <span className={label}>{liked ? "Liked" : "Like"}</span>
        </button>
        <button
          type="button"
          onClick={toggleSave}
          aria-pressed={saved}
          className={`${base} ${size} ${saveTone}`}
        >
          <BookmarkIcon filled={saved} />
          <span className={label}>{saved ? "Saved" : "Save"}</span>
        </button>
      </div>
    );
  };

  if (isCompact) {
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
                {shouldLoadVideo && !videoError && baseVideoSrc && !isEmbed && (
                  <div className="pointer-events-none absolute inset-0 flex items-center justify-between px-2 opacity-0 transition-opacity duration-200 hover:opacity-100">
                    <button
                      type="button"
                      className="pointer-events-auto rounded-full bg-base-100/80 px-2 py-1 text-[11px] font-semibold text-base-content shadow"
                      onClick={() => handleSkip(-10)}
                      aria-label="Skip backward 10 seconds"
                    >
                      Back 10s
                    </button>
                    <button
                      type="button"
                      className="pointer-events-auto rounded-full bg-base-100/80 px-2 py-1 text-[11px] font-semibold text-base-content shadow"
                      onClick={() => handleSkip(10)}
                      aria-label="Skip forward 10 seconds"
                    >
                      Forward 10s
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
  }

  const headerInitial =
    displayTitle && displayTitle.length > 0
      ? displayTitle.charAt(0).toUpperCase()
      : "G";

  return (
    <article
      className="relative overflow-hidden rounded-3xl border border-base-200 bg-base-100 shadow-sm"
      aria-label={displayTitle}
    >
      <header className="flex flex-wrap items-center justify-between gap-3 px-4 pt-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-black via-zinc-700 to-zinc-500 text-sm font-semibold text-white">
            {headerInitial}
          </div>
          <div>
            <p className="text-sm font-semibold text-base-content">{displayTitle}</p>
            <p className="text-[11px] text-base-content/60">{createdLabel}</p>
          </div>
        </div>
        {(onRename || allowDelete) && (
          <div className="flex items-center gap-2 text-[11px]">
            {onRename && (
              <button
                type="button"
                onClick={() => setIsRenaming(true)}
                className="rounded-full border border-base-300 bg-base-100 px-3 py-1 font-semibold text-base-content/70 hover:bg-base-200"
              >
                Rename
              </button>
            )}
            {allowDelete && (
              <button
                type="button"
                onClick={onDelete}
                className="rounded-full border border-base-300 bg-base-100 px-3 py-1 font-semibold text-base-content/70 hover:bg-base-200"
              >
                Delete
              </button>
            )}
          </div>
        )}
      </header>

      <div className="relative mt-3 px-2 sm:px-4">
        <div className="relative overflow-hidden rounded-2xl bg-base-200">
          {item.type === "image" ? renderImage() : renderVideoBody()}
        </div>
        {item.type === "video" ? (
          <div className="pointer-events-none absolute bottom-6 right-6 hidden md:flex">
            <div className="pointer-events-auto">{renderFeedActions(true)}</div>
          </div>
        ) : null}
      </div>

      <div className="space-y-2 px-4 pb-4 pt-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          {renderFeedActions(false)}
          {item.type === "video" ? (
            <span className="text-[11px] text-base-content/60">
              {viewTimeLabel ? `Watch time ${viewTimeLabel}` : "Not watched yet"}
            </span>
          ) : null}
        </div>

        {description ? (
          <p className="text-sm text-base-content">
            <span className="font-semibold text-base-content">{displayTitle}</span>{" "}
            <span className="text-base-content/80">{description}</span>
          </p>
        ) : (
          <p className="text-sm font-semibold text-base-content">{displayTitle}</p>
        )}

        {item.tags?.length ? (
          <div className="flex flex-wrap gap-2 text-[11px] text-base-content/60">
            {item.tags.slice(0, 6).map((tag) => (
              <span key={tag}>#{tag}</span>
            ))}
          </div>
        ) : null}
      </div>

      {renderRenameOverlay()}
    </article>
  );

};
