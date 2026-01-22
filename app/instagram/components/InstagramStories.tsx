"use client";

import React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

interface Story {
  id: string;
  username: string;
  avatar: string;
}

const mockStories: Story[] = [
  { id: '1', username: 'your_story', avatar: 'https://via.placeholder.com/150/0000FF/FFFFFF?text=YOU' },
  { id: '2', username: 'friend_a', avatar: 'https://via.placeholder.com/150/FF00FF/FFFFFF?text=FA' },
  { id: '3', username: 'friend_b', avatar: 'https://via.placeholder.com/150/FFFF00/000000?text=FB' },
  { id: '4', username: 'friend_c', avatar: 'https://via.placeholder.com/150/00FFFF/000000?text=FC' },
  { id: '5', username: 'friend_d', avatar: 'https://via.placeholder.com/150/800080/FFFFFF?text=FD' },
];

const InstagramStories: React.FC = () => {
  const router = useRouter();

  const handleStoryClick = (story: Story) => {
    alert(`Viewing story from ${story.username}`);
    // In a real app, this would navigate to a story viewer
    // router.push(`/instagram/stories/${story.id}`);
  };

  return (
    <div className="flex space-x-4 p-4 border-b border-gray-800 bg-black overflow-x-auto scrollbar-hide">
      {mockStories.map((story) => (
        <div key={story.id} className="flex flex-col items-center cursor-pointer" onClick={() => handleStoryClick(story)}>
          <div className="w-16 h-16 rounded-full p-[2px] bg-gradient-to-tr from-yellow-400 to-fuchsia-600">
            <Image
              src={story.avatar}
              alt={`${story.username}'s story`}
              width={64}
              height={64}
              className="rounded-full border-2 border-black object-cover"
            />
          </div>
          <span className="text-xs text-white mt-1">{story.username.length > 8 ? story.username.substring(0, 7) + '...' : story.username}</span>
        </div>
      ))}
    </div>
  );
};

export default InstagramStories;