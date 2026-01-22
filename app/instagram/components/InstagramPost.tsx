import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link"; // Import Link
import type { MediaItem } from "../mediaTypes";
import {
  RiHeartLine,
  RiHeartFill,
  RiChat3Line,
  RiShareLine,
} from "@hugeicons/react"; // Import RiHeartFill

interface InstagramPostProps {
  item: MediaItem;
}

const InstagramPost: React.FC<InstagramPostProps> = ({ item }) => {
  // Mock user data for now
  const mockUser = {
    id: Math.floor(Math.random() * 100).toString(), // Random user ID for linking
    username: "gaia_user",
    avatar: "https://via.placeholder.com/150/FF0000/FFFFFF?text=GA", // Red placeholder avatar
  };

  const [isLiked, setIsLiked] = useState(false);
  const [likes, setLikes] = useState(Math.floor(Math.random() * 1000) + 10); // Mock initial likes
  const [comments, setComments] = useState<string[]>([]);
  const [newComment, setNewComment] = useState("");

  const handleLikeClick = () => {
    setIsLiked(!isLiked);
    setLikes(isLiked ? likes - 1 : likes + 1);
  };

  const handleAddComment = () => {
    if (newComment.trim()) {
      setComments([...comments, newComment]);
      setNewComment("");
    }
  };

  return (
    <div className="instagram-post">
      {/* Post Header */}
      <div className="post-header">
        <Link href={`/instagram/people/${mockUser.id}`} className="flex items-center">
          <Image
            src={mockUser.avatar}
            alt={`${mockUser.username}'s avatar`}
            width={32}
            height={32}
          />
          <span className="username">
            {mockUser.username}
          </span>
        </Link>
      </div>

      {/* Media */}
      <div className="post-media">
        {item.type === "image" && (
          <img
            src={item.src}
            alt={item.title || "Instagram post image"}
            className="post-media"
          />
        )}
        {item.type === "video" && (
          <video
            src={item.src}
            controls
            className="post-media"
          />
        )}
      </div>

      {/* Actions */}
      <div className="post-actions">
        <div className="flex">
          {isLiked ? (
            <RiHeartFill
              className="text-red-500 text-2xl cursor-pointer"
              onClick={handleLikeClick}
            />
          ) : (
            <RiHeartLine
              className="text-white text-2xl cursor-pointer hover:text-gray-400"
              onClick={handleLikeClick}
            />
          )}
          <RiChat3Line className="text-white text-2xl cursor-pointer hover:text-gray-400" />
          <RiShareLine className="text-white text-2xl cursor-pointer hover:text-gray-400" />
        </div>
        {/* Placeholder for bookmark/save icon */}
        {/* <RiBookmarkLine className="text-white text-2xl cursor-pointer hover:text-gray-400" /> */}
      </div>

      {/* Likes and Caption */}
      <div className="post-likes-caption">
        <p className="post-likes">{likes} likes</p>
        <p className="post-caption">
          <Link href={`/instagram/people/${mockUser.id}`}>
            <span className="username">{mockUser.username}</span>
          </Link>
          {item.title || "No caption provided."}
        </p>
        {item.description && (
          <p className="text-gray-400 text-xs mt-1">{item.description}</p>
        )}

        {/* Display Comments */}
        {comments.length > 0 && (
          <div className="post-comments">
            {comments.map((comment, index) => (
              <p key={index} className="text-white text-xs">
                <Link href={`/instagram/people/${mockUser.id}`}>
                  <span className="username">{mockUser.username}</span>
                </Link>
                {comment}
              </p>
            ))}
          </div>
        )}

        {/* Comment Input */}
        <div className="comment-input-section">
          <input
            type="text"
            placeholder="Add a comment..."
            className="comment-input"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                handleAddComment();
              }
            }}
          />
          <button
            onClick={handleAddComment}
            className="comment-post-button"
          >
            Post
          </button>
        </div>
      </div>
    </div>
  );
};

export default InstagramPost;
