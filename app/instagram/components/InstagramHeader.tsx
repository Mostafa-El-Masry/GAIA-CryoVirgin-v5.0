import React from 'react';
import Link from 'next/link';
import { RiHomeLine, RiSearchLine, RiCompassLine, RiHeartLine, RiMessengerLine } from "@hugeicons/react"; // Assuming these are available or similar

const InstagramHeader: React.FC = () => {
  return (
    <header>
      <div className="max-w-4xl mx-auto flex justify-between items-center">
        <Link href="/instagram" className="text-xl">
          Instagram
        </Link>
        <nav className="flex space-x-4">
          <Link href="/instagram">
            <RiHomeLine size={24} />
          </Link>
          <Link href="/instagram/search">
            <RiSearchLine size={24} />
          </Link>
          <Link href="/instagram/explore">
            <RiCompassLine size={24} />
          </Link>
          <Link href="/instagram/activity">
            <RiHeartLine size={24} />
          </Link>
          <Link href="/instagram/messages">
            <RiMessengerLine size={24} />
          </Link>
          {/* Placeholder for profile pic */}
          <div className="w-6 h-6 rounded-full bg-gray-600"></div>
        </nav>
      </div>
    </header>
  );
};

export default InstagramHeader;