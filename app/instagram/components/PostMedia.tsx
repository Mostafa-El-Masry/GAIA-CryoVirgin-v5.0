import React from "react";
import Image from "next/image";
import type { MediaItem } from "../mediaTypes";
import { getR2Url } from "../r2";

interface PostMediaProps {
  item: MediaItem;
}

const PostMedia: React.FC<PostMediaProps> = ({ item }) => {
  const getSrc = () => {
    if (item.r2Path) return getR2Url(item.r2Path);
    if (item.localPath) return item.localPath;
    if (item.src) return item.src;
    return "";
  };

  const src = getSrc();

  if (!src) return null;

  if (item.type === "image") {
    return (
      <div className="cursor-pointer">
        <Image
          src={src}
          alt={item.title || "Instagram post image"}
          width={940}
          height={1200}
          className="post-media"
          unoptimized
        />
      </div>
    );
  }

  if (item.type === "video") {
    if (item.embedUrl || item.embedHtml) {
      return (
        <div
          className="post-media"
          dangerouslySetInnerHTML={{
            __html:
              item.embedHtml || `<iframe src="${item.embedUrl}" allowFullScreen />`,
          }}
        />
      );
    }
    return (
      <video src={src} controls className="post-media" width={940} height={1200} />
    );
  }

  return null;
};

export default PostMedia;
