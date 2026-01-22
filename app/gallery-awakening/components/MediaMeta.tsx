"use client";

import { useEffect, useState } from "react";
import { getMediaTags, getMediaPeople } from "../lib/mediaMetaStore";
import Link from "next/link";

export function MediaMeta({ mediaId }: { mediaId: string }) {
  const [tags, setTags] = useState<any[]>([]);
  const [people, setPeople] = useState<any[]>([]);

  useEffect(() => {
    getMediaTags(mediaId).then((r) =>
      setTags(r.data?.map((t) => t.gallery_tags) || []),
    );
    getMediaPeople(mediaId).then((r) =>
      setPeople(r.data?.map((p) => p.gallery_people) || []),
    );
  }, [mediaId]);

  return (
    <div className="mt-3 space-y-2 text-white text-xs opacity-90">
      {/* ACTORS */}
      {people.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {people.map((p) => (
            <Link
              key={p.id}
              href={`/gallery-awakening/people/${p.id}`}
              className="px-2 py-1 bg-white/10 rounded-full hover:bg-white/20"
            >
              {p.name}
            </Link>
          ))}
        </div>
      )}

      {/* TAGS */}
      {tags.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {tags.map((t) => (
            <span
              key={t.id}
              className="px-2 py-1 border border-white/20 rounded-full"
            >
              #{t.name}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
