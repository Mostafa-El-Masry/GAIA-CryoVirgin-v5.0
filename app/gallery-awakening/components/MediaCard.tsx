"use client";

import { useRef, useCallback, useState } from "react";
import { getR2Url, getR2PreviewUrl } from "../r2";
import { ImagePreviewModal } from "./ImagePreviewModal";
import { VideoModal } from "./VideoModal";

function getMediaUrl(item: any): string {
  // If it's already a full URL, use it
  if (
    item.src &&
    (item.src.startsWith("http://") || item.src.startsWith("https://"))
  ) {
    return item.src;
  }

  // Handle R2 paths
  if (item.r2Path) {
    return getR2Url(item.r2Path);
  }

  // Handle local paths for videos
  if (item.localPath && item.type === "video") {
    // Assuming local videos are in /public/videos and localPath is the filename
    return `/videos/${item.localPath.replace(/^\//, "")}`;
  }

  // Handle other local paths
  if (item.localPath) {
    return item.localPath;
  }

  // Fallback
  return "/placeholder-gallery-image.png";
}

export function MediaCard({ item, allItems, index }: any) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isHovering, setIsHovering] = useState(false);
  const [activeItem, setActiveItem] = useState<{ item: any; index: number } | null>(null);

  const mediaUrl = getMediaUrl(item);
  const posterUrl =
    item.type === "video" && item.thumbnails && item.thumbnails.length > 0
      ? getR2PreviewUrl(item.thumbnails[0].r2Key)
      : undefined;

  const onEnter = useCallback(() => {
    setIsHovering(true);
  }, []);

  const onLeave = useCallback(() => {
    setIsHovering(false);
  }, []);

  const handleClose = () => {
    setActiveItem(null);
  };

  const handleNext = () => {
    if (!activeItem) return;
    const nextIndex = (activeItem.index + 1) % allItems.length;
    setActiveItem({ item: allItems[nextIndex], index: nextIndex });
  };

  const handlePrev = () => {
    if (!activeItem) return;
    const prevIndex = (activeItem.index - 1 + allItems.length) % allItems.length;
    setActiveItem({ item: allItems[prevIndex], index: prevIndex });
  };

  return (
    <>
      <div
        onMouseEnter={onEnter}
        onMouseLeave={onLeave}
        onClick={() => setActiveItem({ item, index })}
        className="relative rounded-lg overflow-hidden bg-black/40 group cursor-pointer"
      >
        {item.type === "video" ? (
          <>
            <video
              ref={videoRef}
              src={mediaUrl}
              poster={posterUrl}
              muted
              playsInline
              preload="metadata"
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
            {isHovering && item.thumbnails && (
              <div className="absolute inset-0 grid grid-cols-3 grid-rows-2 gap-px">
                {item.thumbnails.map((thumb: any) => (
                  <img
                    key={thumb.r2Key}
                    src={getR2PreviewUrl(thumb.r2Key)}
                    className="w-full h-full object-cover"
                    alt="video thumbnail"
                  />
                ))}
              </div>
            )}
          </>
        ) : (
          <img
            src={mediaUrl}
            alt={item.title || "Gallery image"}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        )}
      </div>
      {activeItem && activeItem.item.type === "image" && (
        <ImagePreviewModal
          src={getMediaUrl(activeItem.item)}
          title={activeItem.item.title}
          mediaId={activeItem.item.id}
          onClose={handleClose}
          onNext={handleNext}
          onPrev={handlePrev}
        />
      )}
      {activeItem && activeItem.item.type === "video" && (
        <VideoModal
          video={activeItem.item}
          onClose={handleClose}
          onNext={handleNext}
          onPrev={handlePrev}
        />
      )}
    </>
  );
}
