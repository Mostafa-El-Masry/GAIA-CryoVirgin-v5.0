"use client";

import { useEffect, useRef, useState } from "react";
import { loadRelated } from "../lib/videoStore";
import { addViewSeconds } from "../lib/socialStore";
import { RelatedVideos } from "./RelatedVideos";
import { EditableTitle } from "./EditableTitle";
import { DeleteButton } from "./DeleteButton";
import { TagEditor } from "./TagEditor";
import { RelatedMedia } from "./RelatedMedia";
import { PeopleEditor } from "./PeopleEditor";
import { MediaMeta } from "./MediaMeta";
import type { MediaItem } from "../mediaTypes";
import { getR2Url } from "../r2";

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

export function VideoModal({
  video,
  onClose,
  onNext,
  onPrev,
}: {
  video: MediaItem;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const ytRef = useRef<unknown>(null);
  const [related, setRelated] = useState<MediaItem[]>([]);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    loadRelated(video.id).then((r) => setRelated(r.data || []));
  }, [video.id]);

  useEffect(() => {
    // Auth removed - no current user available
    setUserId(null);
  }, []);

  useEffect(() => {
    if (!video?.id) return;

    const interval = setInterval(() => {
      addViewSeconds(video.id, 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [video?.id]);

  useEffect(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
      if (e.key === "ArrowRight") {
        if ((ytRef.current as any)?.seekTo) {
          (ytRef.current as any).seekTo(
            (ytRef.current as any).getCurrentTime() + 10,
            true,
          );
        } else if (videoRef.current) {
          videoRef.current.currentTime += 10;
        }
      }
      if (e.key === "ArrowLeft") {
        if ((ytRef.current as any)?.seekTo) {
          (ytRef.current as any).seekTo(
            (ytRef.current as any).getCurrentTime() - 10,
            true,
          );
        } else if (videoRef.current) {
          videoRef.current.currentTime -= 10;
        }
      }
    };

    window.addEventListener("keydown", handleKeydown);
    return () => window.removeEventListener("keydown", handleKeydown);
  }, [onClose]);

  useEffect(() => {
    if (!video.youtubeId) return;

    if (!window.YT) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      document.body.appendChild(tag);
    }

    window.onYouTubeIframeAPIReady = () => {
      ytRef.current = new window.YT.Player("yt-player", {
        videoId: video.youtubeId,
        playerVars: { autoplay: 1, rel: 0 },
      });
    };
  }, [video.youtubeId]);

  return (
    <div className="fixed inset-0 z-50 bg-black/95 flex flex-col text-white">
      <div className="flex justify-between p-4 items-center">
        <EditableTitle mediaId={video.id} initialTitle={video.title} />

        <div className="flex gap-4 items-center">
          {userId === video.owner_id && (
            <DeleteButton
              mediaId={video.id}
              ownerId={video.owner_id}
              onDeleted={onClose}
            />
          )}
          <button onClick={onPrev}>⟨</button>
          <button onClick={onNext}>⟩</button>
          <button onClick={onClose}>✕</button>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center">
        {video.youtubeId ? (
          <div id="yt-player" className="w-full max-w-5xl aspect-video" />
        ) : video.embedHtml ? (
          <div
            className="w-full max-w-5xl aspect-video"
            dangerouslySetInnerHTML={{ __html: video.embedHtml }}
          />
        ) : (
          <video
            ref={videoRef}
            src={
              video.localPath ||
              (video.r2Path ? getR2Url(video.r2Path) : video.src) ||
              ""
            }
            controls
            autoPlay
            className="w-full max-w-5xl"
          />
        )}
      </div>

      <MediaMeta mediaId={video.id} />

      <div className="max-w-6xl mx-auto w-full px-6 pb-6">
        {" "}
        <TagEditor mediaId={video.id} />
        <PeopleEditor mediaId={video.id} />
        <RelatedMedia mediaId={video.id} />{" "}
        <RelatedVideos
          videos={related}
          onSelect={(v) => window.location.reload()}
        />
      </div>
    </div>
  );
}
