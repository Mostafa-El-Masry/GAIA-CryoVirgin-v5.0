"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { addViewSeconds } from "../lib/socialStore";
import { EditableTitle } from "./EditableTitle";
import { TagEditor } from "./TagEditor";
import { RelatedMedia } from "./RelatedMedia";
import { PeopleEditor } from "./PeopleEditor";
import { MediaMeta } from "./MediaMeta";

export function ImagePreviewModal({
  src,
  title,
  mediaId,
  onClose,
  onNext,
  onPrev,
}: {
  src: string;
  title?: string;
  mediaId: string;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
}) {
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      addViewSeconds(mediaId, 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [mediaId]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") onNext();
      if (e.key === "ArrowLeft") onPrev();
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onNext, onPrev, onClose]);

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex flex-col">
      <div className="flex justify-between p-4 items-center text-white">
        <EditableTitle mediaId={mediaId} initialTitle={title} />
        <button onClick={onClose}>✕</button>
      </div>

      <div
        className="flex-1 flex items-center justify-center touch-pan-x"
        onTouchStart={(e) => setTouchStartX(e.touches[0].clientX)}
        onTouchEnd={(e) => {
          if (touchStartX !== null) {
            const dx = e.changedTouches[0].clientX - touchStartX;
            if (dx > 50) onPrev();
            if (dx < -50) onNext();
          }
          setTouchStartX(null);
        }}
      >
        <button
          onClick={onPrev}
          className="absolute left-4 text-white text-3xl"
        >
          ‹
        </button>

        <Image
          src={src}
          alt={title || "Preview image"}
          width={800}
          height={600}
          className="max-h-full max-w-full object-contain"
        />

        <button
          onClick={onNext}
          className="absolute right-4 text-white text-3xl"
        >
          ›
        </button>
      </div>

      <MediaMeta mediaId={mediaId} />

      <div className="border-t border-white/10 p-4">
        <TagEditor mediaId={mediaId} />
        <PeopleEditor mediaId={mediaId} />
        <RelatedMedia mediaId={mediaId} />
      </div>
    </div>
  );
}
