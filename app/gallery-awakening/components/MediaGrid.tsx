'use client';

import React, { useMemo } from 'react';
import type { MediaItem, MediaType } from '../mediaTypes';
import { MediaCard } from './MediaCard';

interface MediaGridProps {
  title: string;
  items: MediaItem[];
  typeFilter: MediaType;
  page?: number;
  perPage?: number;
  onPageChange?: (page: number) => void;
  maxVisibleItems?: number;
  allowDelete?: boolean;
  onDeleteItem?: (id: string) => void;
  onRenameItem?: (id: string, nextTitle: string) => void;
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
}) => {
  const filtered = useMemo(
    () => items.filter((item) => item.type === typeFilter),
    [items, typeFilter]
  );

  if (filtered.length === 0) {
    return null;
  }

  const imageItems = filtered.filter((i) => i.type === 'image');

  const effective =
    typeof maxVisibleItems === "number" && maxVisibleItems >= 0
      ? filtered.slice(0, maxVisibleItems)
      : filtered;

  const totalPages =
    perPage && perPage > 0 ? Math.max(1, Math.ceil(effective.length / perPage)) : 1;
  const currentPage = perPage && perPage > 0 ? Math.min(page ?? 1, totalPages) : 1;
  const start = perPage && perPage > 0 ? (currentPage - 1) * perPage : 0;
  const end = perPage && perPage > 0 ? start + perPage : effective.length;
  const paged = effective.slice(start, end);

  return (
    <section className="space-y-4 rounded-3xl bg-base-100/80 p-4">
      <header className="flex items-baseline justify-between gap-2">
        <h2 className="text-lg font-semibold text-base-content">{title}</h2>
        <p className="text-xs text-base-content/70">
          {filtered.length} {typeFilter === 'image' ? 'images' : 'videos'}
        </p>
      </header>

      <div className="columns-1 gap-4 sm:columns-2 lg:columns-3">
        {paged.map((item) => (
          <div key={item.id} className="mb-4 break-inside-avoid">
            <MediaCard
              item={item}
              allowDelete={allowDelete}
              onDelete={() => onDeleteItem?.(item.id)}
              onRename={(nextTitle) => onRenameItem?.(item.id, nextTitle)}
            />
          </div>
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
                      ? 'border-primary bg-primary/15 text-primary'
                      : 'border-base-300 bg-base-200 text-base-content hover:bg-base-300'
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
