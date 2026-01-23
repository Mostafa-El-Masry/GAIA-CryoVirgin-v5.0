"use client";

import { useEffect, useState } from "react";
import { createTag, assignTag, getTags } from "../lib/tagStore";

export function TagEditor({ mediaId }: { mediaId: string }) {
  const [tags, setTags] = useState<unknown[]>([]);
  const [input, setInput] = useState("");

  useEffect(() => {
    getTags().then((res) => setTags(res.data || []));
  }, []);

  const add = async () => {
    let tag = tags.find((t: unknown) => (t as any).name === input);
    if (!tag) {
      const res = await createTag(input);
      tag = res.data?.[0];
    }
    await assignTag(mediaId, (tag as any).id);
    setInput("");
  };

  return (
    <div className="flex gap-2 flex-wrap">
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Add tag"
        className="bg-black/40 text-white text-xs p-1"
      />
      <button onClick={add} className="text-xs text-white">
        +
      </button>
    </div>
  );
}
