"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import type { MediaItem } from "../mediaTypes";
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
  const getImageUrl = (item: MediaItem) => {
    // This is a placeholder. In a real application, you would have a function
    // to get the correct image URL based on the item's source and path.
    return item.src || "https://via.placeholder.com/300";
  };

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
          src={getImageUrl(item)}
          autoPlay
          loop
          muted
          playsInline
          className="media-card-asset"
        />
      ) : (
        <img
          src={getImageUrl(item)}
          alt={item.title}
          className="media-card-asset"
        />
      )}
      <div className="media-card-overlay">
        <h3 className="media-card-title">{item.title}</h3>
      </div>
    </motion.div>
  );
};
