"use client";

import { useEffect, useState } from "react";
import { getMediaTags, getMediaPeople } from "../lib/mediaMetaStore";
import Link from "next/link";

export function MediaMeta({ mediaId }: { mediaId: string }) {
  const [tags, setTags] = useState<unknown[]>([]);
  const [people, setPeople] = useState<unknown[]>([]);

  useEffect(() => {
    getMediaTags(mediaId).then((r) =>
      setTags(r.data?.map((t: unknown) => (t as any).gallery_tags) || []),
    );
    getMediaPeople(mediaId).then((r) =>
      setPeople(r.data?.map((p: unknown) => (p as any).gallery_people) || []),
    );
  }, [mediaId]);

  return (
    <div className="mt-3 space-y-2 text-white text-xs opacity-90">
      {/* ACTORS */}
      {people.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {people.map((p: unknown) => (
            <Link
              key={(p as any).id}
              href={`/instagram/people/${(p as any).id}`}
              className="px-2 py-1 bg-white/10 rounded-full hover:bg-white/20"
            >
              {(p as any).name}
            </Link>
          ))}
        </div>
      )}

      {/* TAGS */}
      {tags.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {tags.map((t: unknown) => (
            <span
              key={(t as any).id}
              className="px-2 py-1 border border-white/20 rounded-full"
            >
              #{(t as any).name}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
