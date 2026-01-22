"use client";

import React, { useState } from "react";
import { Space_Grotesk } from "next/font/google";
import Image from "next/image";
import InstagramHeader from "../components/InstagramHeader";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

interface Conversation {
  id: string;
  username: string;
  lastMessage: string;
  avatar: string;
}

const mockConversations: Conversation[] = [
  {
    id: "1",
    username: "friend_a",
    lastMessage: "Hey, how are you?",
    avatar: "https://via.placeholder.com/150/FF00FF/FFFFFF?text=FA",
  },
  {
    id: "2",
    username: "friend_b",
    lastMessage: "Did you see that post?",
    avatar: "https://via.placeholder.com/150/FFFF00/000000?text=FB",
  },
  {
    id: "3",
    username: "gaia_user",
    lastMessage: "Thanks for the likes!",
    avatar: "https://via.placeholder.com/150/0000FF/FFFFFF?text=YOU",
  },
];

const MessagesPage: React.FC = () => {
  const [activeConversation, setActiveConversation] =
    useState<Conversation | null>(mockConversations[0]);
  const [newMessage, setNewMessage] = useState("");

  const handleSendMessage = () => {
    if (newMessage.trim() && activeConversation) {
      alert(`Sending message to ${activeConversation.username}: ${newMessage}`);
      setNewMessage("");
      // In a real app, this would send the message to the backend and update the conversation
    }
  };

  return (
    <main className={`relative min-h-screen ${spaceGrotesk.className} gaia-bg`}>
      <InstagramHeader />
      <div className="flex h-[calc(100vh-60px)]">
        {" "}
        {/* Adjust height to account for header */}
        {/* Conversation List */}
        <div className="w-1/3 border-r border-gray-800 p-4">
          <h2 className="text-white text-xl font-semibold mb-4">Messages</h2>
          {mockConversations.map((conv) => (
            <div
              key={conv.id}
              className={`flex items-center p-3 mb-2 rounded-lg cursor-pointer ${
                activeConversation?.id === conv.id
                  ? "bg-gray-700"
                  : "hover:bg-gray-800"
              }`}
              onClick={() => setActiveConversation(conv)}
            >
              <Image
                src={conv.avatar}
                alt={`${conv.username}'s avatar`}
                width={40}
                height={40}
                className="rounded-full mr-3"
              />
              <div>
                <p className="text-white font-semibold">{conv.username}</p>
                <p className="text-gray-400 text-sm truncate">
                  {conv.lastMessage}
                </p>
              </div>
            </div>
          ))}
        </div>
        {/* Chat Window */}
        <div className="flex-grow w-2/3 flex flex-col">
          {activeConversation ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-gray-800 flex items-center">
                <Image
                  src={activeConversation.avatar}
                  alt={`${activeConversation.username}'s avatar`}
                  width={40}
                  height={40}
                  className="rounded-full mr-3"
                />
                <h3 className="text-white font-semibold">
                  {activeConversation.username}
                </h3>
              </div>
              {/* Message Display Area */}
              <div className="flex-grow p-4 overflow-y-auto">
                <p className="text-gray-500 text-center text-sm">
                  Start of conversation with {activeConversation.username}
                </p>
              </div>
              {/* Message Input */}
              <div className="p-4 border-t border-gray-800 flex items-center">
                <input
                  type="text"
                  placeholder="Message..."
                  className="flex-grow bg-gray-800 text-white p-2 rounded-full focus:outline-none"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      handleSendMessage();
                    }
                  }}
                />
                <button
                  onClick={handleSendMessage}
                  className="ml-3 text-blue-500 font-semibold hover:text-blue-400"
                >
                  Send
                </button>
              </div>
            </>
          ) : (
            <div className="flex-grow flex items-center justify-center text-gray-500">
              Select a conversation to start chatting
            </div>
          )}
        </div>
      </div>
    </main>
  );
};

export default MessagesPage;
