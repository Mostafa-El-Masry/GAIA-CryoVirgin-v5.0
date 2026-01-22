import React from "react";
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Home01Icon,
  Search01Icon,
  CompassIcon,
  FavouriteIcon,
  MessengerIcon,
} from "@hugeicons/core-free-icons";

const InstagramHeader: React.FC = () => {
  return (
    <header>
      <div className="max-w-4xl mx-auto flex justify-between items-center">
        <Link href="/instagram" className="text-xl">
          Instagram
        </Link>
        <nav className="flex space-x-4">
          <Link href="/instagram">
            <HugeiconsIcon icon={Home01Icon} size={24} />
          </Link>
          <Link href="/instagram/search">
            <HugeiconsIcon icon={Search01Icon} size={24} />
          </Link>
          <Link href="/instagram/explore">
            <HugeiconsIcon icon={CompassIcon} size={24} />
          </Link>
          <Link href="/instagram/activity">
            <HugeiconsIcon icon={FavouriteIcon} size={24} />
          </Link>
          <Link href="/instagram/messages">
            <HugeiconsIcon icon={MessengerIcon} size={24} />
          </Link>
          {/* Placeholder for profile pic */}
          <div className="w-6 h-6 rounded-full bg-gray-600"></div>
        </nav>
      </div>
    </header>
  );
};

export default InstagramHeader;
