"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import type { MediaItem } from "../mediaTypes";
import { getR2Url, getR2PreviewUrl } from "../r2";
import "../instagram.css";

type MediaCardProps = {
  item: MediaItem;
  onClick: () => void;
  isCurrent: boolean;
};

export const MediaCard: React.FC<MediaCardProps> = ({
  item,
  onClick,
  isCurrent,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      layoutId={`media-card-${item.id}`}
      className={`media-card ${isCurrent ? "active" : ""}`}
      onClick={onClick}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      whileHover={{ scale: 1.05 }}
    >
      {item.type === "video" && isHovered ? (
        <video
          src={
            item.localPath ||
            (item.r2Path ? getR2Url(item.r2Path) : item.src) ||
            "/placeholder-gallery-image.png"
          }
          autoPlay
          loop
          muted
          playsInline
          className="media-card-asset"
        />
      ) : item.type === "image" ? (
        <Image
          src={
            item.r2Path
              ? getR2Url(item.r2Path)
              : item.localPath || item.src || "/placeholder-gallery-image.png"
          }
          alt={item.title}
          width={300}
          height={200}
          className="media-card-asset"
          unoptimized
        />
      ) : item.type === "video" && item.thumbnails && item.thumbnails.length > 0 ? (
        // Show first thumbnail for video
        <Image
          src={
            item.thumbnails[0].localPath
              ? item.thumbnails[0].localPath
              : item.thumbnails[0].r2Key
              ? getR2PreviewUrl(item.thumbnails[0].r2Key)
              : "/placeholder-gallery-image.png"
          }
          alt={item.title}
          width={300}
          height={200}
          className="media-card-asset"
          unoptimized
        />
      ) : (
        <Image
          src={item.src || "/placeholder-gallery-image.png"}
          alt={item.title}
          width={300}
          height={200}
          className="media-card-asset"
          unoptimized
        />
      )}
      <div className="media-card-overlay">
        <h3 className="media-card-title">{item.title}</h3>
      </div>
    </motion.div>
  );
};
