import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import type { MediaItem } from "../mediaTypes";
import { HugeiconsIcon } from "@hugeicons/react";
import { FavouriteIcon, Share01Icon } from "@hugeicons/core-free-icons";
import { toggleLike, getLikeCount } from "../lib/socialStore";

interface InstagramPostProps {
  item: MediaItem;
}

const InstagramPost: React.FC<InstagramPostProps> = ({ item }) => {
  const [mockUser] = useState(() => ({
    id: Math.floor(Math.random() * 100).toString(),
    username: "",
    avatar: "",
  }));

  const [isLiked, setIsLiked] = useState(false);
  const [likes, setLikes] = useState(0);

  useEffect(() => {
    getLikeCount(item.id).then((r) => setLikes(r.count || 0));
  }, [item.id]);

  const handleLikeClick = async () => {
    await toggleLike(item.id);
    setIsLiked(!isLiked);
    const r = await getLikeCount(item.id);
    setLikes(r.count || 0);
  };

  return (
    <div className="instagram-post">
      <div className="post-header">
        <Link
          href={`/instagram/people/${mockUser.id}`}
          className="flex items-center"
        >
          {mockUser.avatar ? (
            <Image
              src={mockUser.avatar}
              alt={`${mockUser.username}'s avatar`}
              width={32}
              height={32}
            />
          ) : null}
          <span className="username">{mockUser.username}</span>
        </Link>
      </div>

      <div className="post-media">
        {item.type === "image" && item.src && (
          <Image
            src={item.src}
            alt={item.title || "Instagram post image"}
            width={940}
            height={1200}
            className="post-media"
          />
        )}
        {item.type === "video" && item.src && (
          <video
            src={item.src}
            controls
            className="post-media"
            width={940}
            height={1200}
          />
        )}
      </div>

      <div className="post-actions">
        <div className="flex">
          {isLiked ? (
            <HugeiconsIcon
              icon={FavouriteIcon}
              className="text-red-500 text-2xl cursor-pointer"
              onClick={handleLikeClick}
            />
          ) : (
            <HugeiconsIcon
              icon={FavouriteIcon}
              className="text-white text-2xl cursor-pointer hover:text-gray-400"
              onClick={handleLikeClick}
            />
          )}
          <HugeiconsIcon
            icon={Share01Icon}
            className="text-white text-2xl cursor-pointer hover:text-gray-400"
          />
        </div>
      </div>

      <div className="post-likes-caption">
        {likes > 0 && <p className="post-likes">{likes} likes</p>}
        <p className="post-caption">
          <Link href={`/instagram/people/${mockUser.id}`}>
            <span className="username">{mockUser.username}</span>
          </Link>
          {item.title || "No caption provided."}
        </p>
        {item.description && item.description !== "External embed" && (
          <p className="text-gray-400 text-xs mt-1">{item.description}</p>
        )}
      </div>
    </div>
  );
};

export default InstagramPost;
