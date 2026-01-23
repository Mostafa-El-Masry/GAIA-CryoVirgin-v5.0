"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import type { MediaItem } from "../mediaTypes";

export function RelatedMedia({ mediaId }: { mediaId: string }) {
  const [items, setItems] = useState<MediaItem[]>([]);

  useEffect(() => {
    // you'll already have tagIds from media fetch
    // simplified for now
  }, [mediaId]);

  return (
    <div className="grid grid-cols-4 gap-2 mt-4">
      {items.map((m) => (
        <Image
          key={m.id}
          src={m.src || "/placeholder-gallery-image.png"}
          alt={m.title}
          width={100}
          height={100}
          className="rounded"
        />
      ))}
    </div>
  );
}
