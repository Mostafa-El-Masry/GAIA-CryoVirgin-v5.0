"use client";

import React, { useState } from "react";
import { Space_Grotesk } from "next/font/google";
import { PageTransition } from "./components/PageTransition";
import { useGaiaFeatureUnlocks } from "@/app/hooks/useGaiaFeatureUnlocks";
import InstagramPost from "./components/InstagramPost";
import { useInstagramData } from "./hooks/useInstagramData";
import { useInfiniteScroll } from "./hooks/useInfiniteScroll";
import "./instagram.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const InstagramPage: React.FC = () => {
  const [isHydrated, setIsHydrated] = useState(false);
  const { items } = useInstagramData();
  const [itemsToShow, setItemsToShow] = useState(20);

  useInfiniteScroll(items, setItemsToShow);

  React.useEffect(() => {
    setIsHydrated(true);
  }, []);

  if (!isHydrated) {
    return null;
  }

  return (
    <PageTransition>
      <main
        className={`relative min-h-screen ${spaceGrotesk.className} gaia-bg`}
      >
        <section className="pt-4 max-w-4xl mx-auto px-4">
          {items.slice(0, itemsToShow).map((item) => (
            <InstagramPost key={item.id} item={item} />
          ))}
        </section>
      </main>
    </PageTransition>
  );
};

export default InstagramPage;
