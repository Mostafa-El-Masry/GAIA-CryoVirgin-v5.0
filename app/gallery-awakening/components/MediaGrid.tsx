"use client";

import React, { useMemo } from "react";
import type { MediaItem, MediaType } from "../mediaTypes";
import { MediaCard } from "./MediaCard";

interface MediaGridProps {
  title: string;
  items: MediaItem[];
  typeFilter?: MediaType;
  page?: number;
  perPage?: number;
  onPageChange?: (page: number) => void;
  maxVisibleItems?: number;
  allowDelete?: boolean;
  onDeleteItem?: (id: string) => void;
  onRenameItem?: (id: string, nextTitle: string) => void;
  allItems?: MediaItem[];
  onNextVideo?: () => void;
  onPrevVideo?: () => void;
  currentVideoId?: string | null;
  onSetCurrentVideo?: (id: string) => void;
}

export const MediaGrid: React.FC<MediaGridProps> = ({
  title,
  items,
  typeFilter,
  page,
  perPage,
  onPageChange,
  maxVisibleItems,
  allowDelete = false,
  onDeleteItem,
  onRenameItem,
  allItems = [],
  onNextVideo,
  onPrevVideo,
  currentVideoId,
  onSetCurrentVideo,
}) => {
  const filtered = useMemo(() => {
    if (!typeFilter) return items;
    return items.filter((item) => item.type === typeFilter);
  }, [items, typeFilter]);

  if (filtered.length === 0) {
    return null;
  }

  const effective =
    typeof maxVisibleItems === "number" && maxVisibleItems >= 0
      ? filtered.slice(0, maxVisibleItems)
      : filtered;

  const totalPages =
    perPage && perPage > 0
      ? Math.max(1, Math.ceil(effective.length / perPage))
      : 1;
  const currentPage =
    perPage && perPage > 0 ? Math.min(page ?? 1, totalPages) : 1;
  const start = perPage && perPage > 0 ? (currentPage - 1) * perPage : 0;
  const end = perPage && perPage > 0 ? start + perPage : effective.length;
  const paged = effective.slice(start, end);

  return (
    <section className="space-y-5">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-base-content/60">
            Feed
          </p>
          <h2 className="text-2xl font-semibold text-base-content">{title}</h2>
        </div>
        <p className="text-xs text-base-content/70">
          {filtered.length}{" "}
          {typeFilter
            ? typeFilter === "image"
              ? "images"
              : "videos"
            : "items"}
        </p>
      </header>

      <div className="mx-auto flex max-w-3xl flex-col gap-6 lg:max-w-4xl">
        {paged.map((item) => (
          <MediaCard key={item.id} item={item} />
        ))}
      </div>

      {totalPages > 1 && onPageChange && perPage && (
        <div className="flex flex-col items-center justify-center gap-2 text-xs text-base-content/70">
          <span className="text-[11px]">
            Page {currentPage} of {totalPages}
          </span>
          <div className="flex flex-wrap items-center justify-center gap-1">
            {Array.from({ length: totalPages }).map((_, idx) => {
              const pageNum = idx + 1;
              const active = pageNum === currentPage;
              return (
                <button
                  key={pageNum}
                  type="button"
                  onClick={() => onPageChange(pageNum)}
                  className={`min-w-[32px] rounded-full border px-2 py-1 text-[11px] font-semibold transition ${
                    active
                      ? "border-primary bg-primary/15 text-primary"
                      : "border-base-300 bg-base-200 text-base-content hover:bg-base-300"
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
};
