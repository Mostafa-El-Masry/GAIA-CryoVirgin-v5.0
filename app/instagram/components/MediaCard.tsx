"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
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
          src={item.src}
          autoPlay
          loop
          muted
          playsInline
          className="media-card-asset"
        />
      ) : (
        <Image
          src={item.src || "/placeholder-gallery-image.png"}
          alt={item.title}
          width={300}
          height={200}
          className="media-card-asset"
        />
      )}
      <div className="media-card-overlay">
        <h3 className="media-card-title">{item.title}</h3>
      </div>
    </motion.div>
  );
};
