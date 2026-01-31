import { useState, useEffect } from "react";
import { toggleLike, getLikeCount } from "../lib/socialStore";

export function useLike(itemId: string) {
  const [isLiked, setIsLiked] = useState(false);
  const [likes, setLikes] = useState(0);

  useEffect(() => {
    getLikeCount(itemId).then((r) => setLikes(r.count || 0));
  }, [itemId]);

  const handleLikeClick = async () => {
    await toggleLike(itemId);
    setIsLiked(!isLiked);
    const r = await getLikeCount(itemId);
    setLikes(r.count || 0);
  };

  return { isLiked, likes, handleLikeClick };
}
