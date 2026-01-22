"use client";

import { useEffect, useState } from "react";
import { toggleLike, getLikeCount, getViewSeconds } from "../lib/socialStore";
import { Heart, Eye } from "lucide-react"; // already common in modern stacks

export function MediaActions({ mediaId }: { mediaId: string }) {
  const [likes, setLikes] = useState(0);
  const [views, setViews] = useState(0);
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    getLikeCount(mediaId).then((r) => setLikes(r.count || 0));
    getViewSeconds(mediaId).then((r) => setViews(r.data?.seconds || 0));
  }, [mediaId]);

  const onLike = async () => {
    await toggleLike(mediaId);
    setLiked(!liked);
    const r = await getLikeCount(mediaId);
    setLikes(r.count || 0);
  };

  return (
    <div className="flex gap-6 items-center text-white">
      <button onClick={onLike} className="flex items-center gap-1">
        <Heart size={20} className={liked ? "fill-red-500 text-red-500" : ""} />
        <span className="text-sm">{likes}</span>
      </button>

      <div className="flex items-center gap-1">
        <Eye size={20} />
        <span className="text-sm">{views}</span>
      </div>
    </div>
  );
}
