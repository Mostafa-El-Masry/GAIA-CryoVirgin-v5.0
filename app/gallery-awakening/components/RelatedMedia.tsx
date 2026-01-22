"use client";

import { useEffect, useState } from "react";
import { getRelatedMedia } from "../lib/tagStore";

export function RelatedMedia({ mediaId }: { mediaId: string }) {
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    // you’ll already have tagIds from media fetch
    // simplified for now
  }, []);

  return (
    <div className="grid grid-cols-4 gap-2 mt-4">
      {items.map((m) => (
        <img key={m.id} src={m.src} className="rounded" />
      ))}
    </div>
  );
}
