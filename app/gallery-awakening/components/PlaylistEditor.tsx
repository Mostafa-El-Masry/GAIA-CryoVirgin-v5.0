"use client";

import { useState } from "react";
import { reorderPlaylist } from "../lib/playlistStore";
import { GripVertical } from "lucide-react";

export function PlaylistEditor({
  playlistId,
  videos,
}: {
  playlistId: string;
  videos: any[];
}) {
  const [items, setItems] = useState(videos);

  const move = (from: number, to: number) => {
    const copy = [...items];
    const [m] = copy.splice(from, 1);
    copy.splice(to, 0, m);
    setItems(copy);
  };

  const save = async () => {
    await reorderPlaylist(
      playlistId,
      items.map((v) => v.id),
    );
  };

  return (
    <div className="space-y-2">
      {items.map((v, i) => (
        <div
          key={v.id}
          className="flex items-center gap-3 bg-black/40 p-2 rounded"
        >
          <GripVertical className="text-white/50" />
          <span className="text-white text-sm truncate">{v.title}</span>
          <button disabled={i === 0} onClick={() => move(i, i - 1)}>
            ↑
          </button>
          <button
            disabled={i === items.length - 1}
            onClick={() => move(i, i + 1)}
          >
            ↓
          </button>
        </div>
      ))}

      <button onClick={save} className="text-white text-sm opacity-80">
        Save order
      </button>
    </div>
  );
}
