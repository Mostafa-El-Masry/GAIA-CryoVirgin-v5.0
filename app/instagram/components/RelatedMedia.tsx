"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import type { MediaItem } from "../mediaTypes";
import { getR2Url, getR2PreviewUrl } from "../r2";

export function RelatedMedia({ mediaId }: { mediaId: string }) {
  const [items, setItems] = useState<MediaItem[]>([]);

  useEffect(() => {
    // you'll already have tagIds from media fetch
    // simplified for now
  }, [mediaId]);

  const getImageUrl = (item: MediaItem): string => {
    if (item.type === "image") {
      if (item.r2Path) return getR2Url(item.r2Path);
      if (item.localPath) return item.localPath;
      return item.src || "/placeholder-gallery-image.png";
    }
    // For videos, use first thumbnail
    if (item.thumbnails && item.thumbnails.length > 0) {
      const thumb = item.thumbnails[0];
      if (thumb.localPath) return thumb.localPath;
      if (thumb.r2Key) return getR2PreviewUrl(thumb.r2Key);
    }
    return "/placeholder-gallery-image.png";
  };

  return (
    <div className="grid grid-cols-4 gap-2 mt-4">
      {items.map((m) => (
        <Image
          key={m.id}
          src={getImageUrl(m)}
          alt={m.title}
          width={100}
          height={100}
          className="rounded"
          unoptimized
        />
      ))}
    </div>
  );
}
