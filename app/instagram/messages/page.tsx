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
    avatar:
      "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMzIiIGN5PSIzMiIgcj0iMzIiIGZpbGw9IiNGRjAwRkYiLz4KPHRleHQgeD0iMzIiIHk9IjQwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iOCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkZBPPC90ZXh0Pgo8c3ZnPg==",
  },
  {
    id: "2",
    username: "friend_b",
    lastMessage: "Did you see that post?",
    avatar:
      "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMzIiIGN5PSIzMiIgcj0iMzIiIGZpbGw9IiNGRkZGMDAiLz4KPHRleHQgeD0iMzIiIHk9IjQwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iOCIgZmlsbD0iYmxhY2siIHRleHQtYW5jaG9yPSJtaWRkbGUiPkZCPPC90ZXh0Pgo8c3ZnPg==",
  },
  {
    id: "3",
    username: "gaia_user",
    lastMessage: "Thanks for the likes!",
    avatar:
      "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMzIiIGN5PSIzMiIgcj0iMzIiIGZpbGw9IiMwMDAwRkYiLz4KPHRleHQgeD0iMzIiIHk9IjQwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iOCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiPllPVTwvdGV4dD4KPHN2Zz4=",
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
    }
  };

  return (
    <main className={`relative min-h-screen ${spaceGrotesk.className} gaia-bg`}>
      <InstagramHeader />
      <div className="flex h-[calc(100vh-60px)]">
        {" "}
        {/* Adjust height to account for header */}
        {/* Conversation List */}
        <div className="w-1/3 gaia-border border-r p-4">
          <h2 className="gaia-strong text-xl font-semibold mb-4">Messages</h2>
          {mockConversations.map((conv) => (
            <div
              key={conv.id}
              className={`flex items-center p-3 mb-2 rounded-lg cursor-pointer ${
                activeConversation?.id === conv.id
                  ? "gaia-surface-soft"
                  : "hover:gaia-surface-soft"
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
                <p className="gaia-strong font-semibold">{conv.username}</p>
                <p className="gaia-muted text-sm truncate">
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
              <div className="p-4 gaia-border border-b flex items-center">
                <Image
                  src={activeConversation.avatar}
                  alt={`${activeConversation.username}'s avatar`}
                  width={40}
                  height={40}
                  className="rounded-full mr-3"
                />
                <h3 className="gaia-strong font-semibold">
                  {activeConversation.username}
                </h3>
              </div>
              {/* Message Display Area */}
              <div className="flex-grow p-4 overflow-y-auto">
                <p className="gaia-muted text-center text-sm">
                  Start of conversation with {activeConversation.username}
                </p>
              </div>
              {/* Message Input */}
              <div className="p-4 gaia-border border-t flex items-center">
                <input
                  type="text"
                  placeholder="Message..."
                  className="flex-grow gaia-surface gaia-strong p-2 rounded-full focus:outline-none"
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
                  className="ml-3 gaia-accent font-semibold hover:gaia-accent"
                >
                  Send
                </button>
              </div>
            </>
          ) : (
            <div className="flex-grow flex items-center justify-center gaia-muted">
              Select a conversation to start chatting
            </div>
          )}
        </div>
      </div>
    </main>
  );
};

export default MessagesPage;
