import React from "react";
import Link from "next/link";
import type { MediaItem } from "../mediaTypes";
import { HugeiconsIcon } from "@hugeicons/react";
import { FavouriteIcon, Share01Icon } from "@hugeicons/core-free-icons";
import { useLike } from "../hooks/useLike";
import PostMedia from "./PostMedia";

interface InstagramPostProps {
  item: MediaItem;
}

const MOCK_USER = {
  id: "123",
  username: "gaialens",
  avatar: "",
};

const InstagramPost: React.FC<InstagramPostProps> = ({ item }) => {
  const { isLiked, likes, handleLikeClick } = useLike(item.id);

  return (
    <div className="instagram-post">
      <div className="post-header">
        <Link
          href={`/instagram/people/${MOCK_USER.id}`}
          className="flex items-center"
        >
          {MOCK_USER.avatar && (
            <img
              src={MOCK_USER.avatar}
              alt={`${MOCK_USER.username}'s avatar`}
              width={32}
              height={32}
            />
          )}
          <span className="username">{MOCK_USER.username}</span>
        </Link>
      </div>

      <PostMedia item={item} />

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
          <Link href={`/instagram/people/${MOCK_USER.id}`}>
            <span className="username">{MOCK_USER.username}</span>
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
