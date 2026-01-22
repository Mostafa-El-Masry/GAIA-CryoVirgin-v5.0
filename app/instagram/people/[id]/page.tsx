"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Space_Grotesk } from "next/font/google";
import { useRouter } from "next/navigation";
import InstagramHeader from "../../components/InstagramHeader"; // Adjust path as needed

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

interface UserProfilePageProps {
  params: {
    id: string; // The ID of the user
  };
}

const UserProfilePage: React.FC<UserProfilePageProps> = ({ params }) => {
  const { id } = params;
  const router = useRouter();

  // Mock user data - in a real app, you'd fetch this using the 'id'
  const [user, setUser] = useState<{ username: string; avatar: string; bio: string; postCount: number; followers: number; following: number } | null>(null);

  useEffect(() => {
    // Simulate fetching user data
    const fetchUser = async () => {
      // In a real application, you would make an API call here
      // For now, we'll use a mock user
      const mockUserData = {
        username: `user_${id}`,
        avatar: `https://i.pravatar.cc/150?img=${id % 70}`, // Random avatar based on ID
        bio: `This is a mock bio for user ${id}. Exploring the digital world!`,
        postCount: Math.floor(Math.random() * 100),
        followers: Math.floor(Math.random() * 10000),
        following: Math.floor(Math.random() * 500),
      };
      setUser(mockUserData);
    };

    fetchUser();
  }, [id]);

  if (!user) {
    return (
      <main className={`relative min-h-screen ${spaceGrotesk.className} gaia-bg`}>
        <InstagramHeader />
        <div className="flex items-center justify-center min-h-[calc(100vh-60px)] text-white">
          Loading profile...
        </div>
      </main>
    );
  }

  return (
    <main className={`relative min-h-screen ${spaceGrotesk.className} gaia-bg`}>
      <InstagramHeader />
      <div className="max-w-4xl mx-auto py-8 px-4">
        {/* Profile Header */}
        <div className="flex items-center mb-8">
          <Image
            src={user.avatar}
            alt={`${user.username}'s avatar`}
            width={150}
            height={150}
            className="rounded-full mr-8"
          />
          <div>
            <h2 className="text-3xl font-light text-white mb-2">{user.username}</h2>
            <div className="flex space-x-4 text-white text-sm mb-4">
              <p><strong>{user.postCount}</strong> posts</p>
              <p><strong>{user.followers}</strong> followers</p>
              <p><strong>{user.following}</strong> following</p>
            </div>
            <p className="text-white text-sm">{user.bio}</p>
          </div>
        </div>

        {/* User Posts Grid - Placeholder for now */}
        <div className="grid grid-cols-3 gap-1 border-t border-gray-700 pt-8">
          {Array.from({ length: user.postCount > 9 ? 9 : user.postCount }).map((_, index) => (
            <div key={index} className="w-full h-32 bg-gray-800 flex items-center justify-center text-gray-500 text-xs">
              Post {index + 1}
            </div>
          ))}
        </div>
      </div>
    </main>
  );
};

export default UserProfilePage;