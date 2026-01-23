"use client";

import type { MediaItem } from "../mediaTypes";

export function RelatedVideos({
  videos,
  onSelect,
}: {
  videos: MediaItem[];
  onSelect: (video: MediaItem) => void;
}) {
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
            <div className="aspect-video bg-black rounded-md flex items-center justify-center">
              ▶
            </div>
            <p className="text-xs text-white mt-1 truncate">{v.title}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
