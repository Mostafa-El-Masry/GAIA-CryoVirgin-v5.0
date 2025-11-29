
"use client";

import React from "react";

type LessonVideoBlockProps = {
  title: string;
  youtubeId: string;
  durationLabel?: string;
};

export const LessonVideoBlock: React.FC<LessonVideoBlockProps> = ({
  title,
  youtubeId,
  durationLabel,
}) => {
  if (!youtubeId) return null;

  const watchUrl = `https://www.youtube.com/watch?v=${youtubeId}`;
  const embedUrl = `https://www.youtube.com/embed/${youtubeId}`;

  return (
    <section className="mt-4 rounded-2xl border border-white/10 bg-black/30 p-3 sm:p-4 space-y-3">
      <header className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[11px] sm:text-xs font-semibold uppercase tracking-[0.22em] gaia-muted">
            Lesson video
          </p>
          <h3 className="text-sm sm:text-base font-semibold gaia-strong">
            {title}
          </h3>
          {durationLabel && (
            <p className="text-[11px] sm:text-xs gaia-muted">
              Approx. duration: <span className="font-semibold">{durationLabel}</span>
            </p>
          )}
        </div>
        <a
          href={watchUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-1 inline-flex items-center justify-center rounded-full border border-white/20 bg-black/40 px-3 py-1.5 text-[11px] sm:text-xs font-medium gaia-muted hover:bg-white/10"
        >
          Open on YouTube ↗
        </a>
      </header>

      <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-black/40 bg-black">
        <iframe
          src={embedUrl}
          title={title}
          className="h-full w-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>
    </section>
  );
};
