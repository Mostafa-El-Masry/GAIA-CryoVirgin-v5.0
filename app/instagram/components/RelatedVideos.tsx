"use client";

import Image from "next/image";
import type { MediaItem } from "../mediaTypes";
import { getR2Url, getR2PreviewUrl } from "../r2";

export function RelatedVideos({
  videos,
  onSelect,
}: {
  videos: MediaItem[];
  onSelect: (video: MediaItem) => void;
}) {
  const getThumbnailUrl = (video: MediaItem): string => {
    // Use first thumbnail if available
    if (video.thumbnails && video.thumbnails.length > 0) {
      const thumb = video.thumbnails[0];
      if (thumb.localPath) return thumb.localPath;
      if (thumb.r2Key) return getR2PreviewUrl(thumb.r2Key);
    }
    // Fallback to video poster or placeholder
    if (video.localPath) return video.localPath;
    if (video.r2Path) return getR2Url(video.r2Path);
    return "/placeholder-gallery-image.png";
  };

  return (
    <div className="mt-4 border-t border-white/10 pt-4">
      <p className="text-xs text-white/60 mb-2">Related</p>

      <div className="flex gap-3 overflow-x-auto">
        {videos.map((v) => (
          <div
            key={v.id}
            onClick={() => onSelect(v)}
            className="w-56 shrink-0 cursor-pointer"
          >
            <div className="aspect-video bg-black rounded-md overflow-hidden relative">
              <Image
                src={getThumbnailUrl(v)}
                alt={v.title}
                fill
                className="object-cover"
                unoptimized
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                <span className="text-white text-2xl">▶</span>
              </div>
            </div>
            <p className="text-xs text-white mt-1 truncate">{v.title}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
