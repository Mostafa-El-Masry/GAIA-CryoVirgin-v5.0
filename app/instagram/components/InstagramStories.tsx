"use client";

import React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

interface Story {
  id: string;
  username: string;
  avatar: string;
}

const mockStories: Story[] = [
  {
    id: "1",
    username: "your_story",
    avatar:
      "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMzIiIGN5PSIzMiIgcj0iMzIiIGZpbGw9IiMwMDAwRkYiLz4KPHRleHQgeD0iMzIiIHk9IjQwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iOCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiPllPVTwvdGV4dD4KPHN2Zz4=",
  },
  {
    id: "2",
    username: "friend_a",
    avatar:
      "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMzIiIGN5PSIzMiIgcj0iMzIiIGZpbGw9IiNGRjAwRkYiLz4KPHRleHQgeD0iMzIiIHk9IjQwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iOCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkZBPPC90ZXh0Pgo8c3ZnPg==",
  },
  {
    id: "3",
    username: "friend_b",
    avatar:
      "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMzIiIGN5PSIzMiIgcj0iMzIiIGZpbGw9IiNGRkZGMDAiLz4KPHRleHQgeD0iMzIiIHk9IjQwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iOCIgZmlsbD0iYmxhY2siIHRleHQtYW5jaG9yPSJtaWRkbGUiPkZCPPC90ZXh0Pgo8c3ZnPg==",
  },
  {
    id: "4",
    username: "friend_c",
    avatar:
      "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMzIiIGN5PSIzMiIgcj0iMzIiIGZpbGw9IiMwMEZGRkYiLz4KPHRleHQgeD0iMzIiIHk9IjQwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iOCIgZmlsbD0iYmxhY2siIHRleHQtYW5jaG9yPSJtaWRkbGUiPkZDPPC90ZXh0Pgo8c3ZnPg==",
  },
  {
    id: "5",
    username: "friend_d",
    avatar:
      "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMzIiIGN5PSIzMiIgcj0iMzIiIGZpbGw9IiM4MDAwODAiLz4KPHRleHQgeD0iMzIiIHk9IjQwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iOCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkZEPPC90ZXh0Pgo8c3ZnPg==",
  },
];

const InstagramStories: React.FC = () => {
  const router = useRouter();

  const handleStoryClick = (story: Story) => {
    alert(`Viewing story from ${story.username}`);
  };

  return (
    <div className="flex space-x-4 p-4 border-b gaia-border gaia-surface overflow-x-auto scrollbar-hide">
      {mockStories.map((story) => (
        <div
          key={story.id}
          className="flex flex-col items-center cursor-pointer"
          onClick={() => handleStoryClick(story)}
        >
          <div className="w-16 h-16 rounded-full p-[2px] bg-gradient-to-tr from-yellow-400 to-fuchsia-600">
            <Image
              src={story.avatar}
              alt={`${story.username}'s story`}
              width={64}
              height={64}
              className="rounded-full border-2 gaia-surface object-cover"
            />
          </div>
          <span className="text-xs gaia-strong mt-1">
            {story.username.length > 8
              ? story.username.substring(0, 7) + "..."
              : story.username}
          </span>
        </div>
      ))}
    </div>
  );
};

export default InstagramStories;
