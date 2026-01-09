"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
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

  // Keep lightbox in-flow so it scrolls with the page (do not lock body overflow)

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

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  if (!current) return null;

  const displayTitle = formatMediaTitle(current.title);
  const normalizedLocal = current.localPath
    ? `/${current.localPath.replace(/^\/+/, "")}`
    : "";
  const src = current.r2Path
    ? getR2Url(current.r2Path)
    : normalizedLocal || "/placeholder-gallery-image.png";

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState<number | null>(null);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const onTime = () => setCurrentTime(v.currentTime || 0);
    const onDur = () => setDuration(v.duration || null);
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    v.addEventListener("timeupdate", onTime);
    v.addEventListener("loadedmetadata", onDur);
    v.addEventListener("play", onPlay);
    v.addEventListener("pause", onPause);
    return () => {
      v.removeEventListener("timeupdate", onTime);
      v.removeEventListener("loadedmetadata", onDur);
      v.removeEventListener("play", onPlay);
      v.removeEventListener("pause", onPause);
    };
  }, [current?.id]);

  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      v.play();
      setPlaying(true);
    } else {
      v.pause();
      setPlaying(false);
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const v = videoRef.current;
    if (!v || !duration) return;
    const rect = (e.target as HTMLDivElement).getBoundingClientRect();
    const x = e.clientX - rect.left;
    const frac = Math.max(0, Math.min(1, x / rect.width));
    v.currentTime = frac * duration;
    setCurrentTime(v.currentTime || 0);
  };

  const requestFull = async () => {
    try {
      const el = document.fullscreenElement
        ? document.exitFullscreen()
        : (videoRef.current?.parentElement ?? null)?.requestFullscreen();
      await el;
    } catch {
      // ignore
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm overflow-y-auto"
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
        className="m-0 flex max-h-[100vh] max-w-[90vw] flex-col items-center justify-center gap-3 text-center px-2 py-8"
        onClick={(e) => e.stopPropagation()}
      >
        {current.type === "image" ? (
          <div className="mx-auto w-full max-w-[65vh] rounded-xl bg-white p-6 shadow-lg">
            <img
              src={src}
              alt={displayTitle}
              className={`mx-auto max-h-[75vh] max-w-full rounded object-contain transform transition duration-200 ${
                entered ? "scale-100 opacity-100" : "scale-95 opacity-0"
              }`}
            />
          </div>
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
            <div className="mx-auto w-full max-w-[90vw]">
              <div
                className={`relative mx-auto max-h-[75vh] max-w-full rounded-xl bg-black`}
              >
                <video
                  ref={videoRef}
                  src={src}
                  className={`w-full max-h-[75vh] rounded-xl bg-black object-contain transform transition duration-200 ${
                    entered ? "scale-100 opacity-100" : "scale-95 opacity-0"
                  }`}
                  controls={false}
                  playsInline
                  preload="metadata"
                  poster={poster}
                />

                {/* Play overlay */}
                {!playing && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      togglePlay();
                    }}
                    className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-30 flex h-20 w-20 items-center justify-center rounded-full bg-black/60 text-white shadow-lg"
                    aria-label="Play video"
                  >
                    <svg viewBox="0 0 24 24" className="h-10 w-10 fill-current">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </button>
                )}

                {/* Bottom controls */}
                <div className="absolute left-0 right-0 bottom-0 z-40 w-full p-3">
                  <div
                    className="mx-auto h-2 w-full cursor-pointer rounded bg-white/30"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSeek(e as any);
                    }}
                    aria-hidden
                  >
                    <div
                      className="h-2 rounded bg-sky-500"
                      style={{
                        width: duration
                          ? `${(currentTime / duration) * 100}%`
                          : "0%",
                      }}
                    />
                  </div>
                  <div className="mt-2 flex items-center justify-between text-sm text-white">
                    <div>{displayTitle}</div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          togglePlay();
                        }}
                        className="rounded bg-white/10 px-2 py-1 text-white"
                      >
                        {playing ? "Pause" : "Play"}
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          requestFull();
                        }}
                        className="rounded bg-white/10 px-2 py-1 text-white"
                      >
                        Full
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
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
