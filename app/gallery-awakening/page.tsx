'use client';

import React, { useMemo, useRef, useState } from 'react';
import { mockMediaItems } from './mockMedia';
import { mockSyncState } from './mockSyncState';
import type { MediaItem } from './mediaTypes';
import { MediaGrid } from './components/MediaGrid';
import { FeatureHero } from './components/FeatureHero';
import { SyncCenter } from './components/SyncCenter';
import { useGalleryData } from './useGalleryData';
import { FilterBar } from './components/FilterBar';
import { MemoryPulse } from './components/MemoryPulse';
import { VersionLog } from './components/VersionLog';
import { useGaiaFeatureUnlocks } from "@/app/hooks/useGaiaFeatureUnlocks";
import { getAutoBoxResult } from './featureLogic';
import { hasR2PublicBase } from './r2';
import { useCurrentPermissions, isCreatorAdmin } from '@/lib/permissions';
import { useAuthSnapshot } from '@/lib/auth-client';

type DataSource = 'none' | 'cache' | 'r2';

const PAGE_SIZE = 24;

type ViewMode = 'image' | 'video';
type SidePanel = 'overview' | 'info' | 'sync' | 'log' | null;

function applyTagFilter(items: MediaItem[], activeTags: string[]): MediaItem[] {
  if (!activeTags.length) return items;
  return items.filter((item) => {
    if (!item.tags || item.tags.length === 0) return false;
    return activeTags.every((tag) => item.tags!.includes(tag));
  });
}

function sourceLabelFrom(source: DataSource): string {
  switch (source) {
    case 'r2':
      return 'Supabase + R2 (live)';
    case 'cache':
      return 'Local cache';
    case 'none':
    default:
      return 'Mock data only';
  }
}

type GalleryAwakeningContentProps = {
  allowedGalleryMediaCount: number;
};

const GalleryAwakeningContent: React.FC<GalleryAwakeningContentProps> = ({
  allowedGalleryMediaCount,
}) => {

  const { items, isLoading, source } = useGalleryData(mockMediaItems);
  const { profile, status } = useAuthSnapshot();
  const permissions = useCurrentPermissions();

  const [localNewItems, setLocalNewItems] = useState<MediaItem[]>([]);
  const [activeTags, setActiveTags] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('image');
  const [page, setPage] = useState<number>(1);
  const [sidePanel, setSidePanel] = useState<SidePanel>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [titleOverrides, setTitleOverrides] = useState<Record<string, string>>(() => {
    if (typeof window === 'undefined') return {};
    try {
      const raw = window.localStorage.getItem('gaia_gallery_titles');
      return raw ? (JSON.parse(raw) as Record<string, string>) : {};
    } catch {
      return {};
    }
  });
  const [hiddenIds, setHiddenIds] = useState<string[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const raw = window.localStorage.getItem('gaia_gallery_hidden');
      return raw ? (JSON.parse(raw) as string[]) : [];
    } catch {
      return [];
    }
  });

  const mergedItems = useMemo(() => {
    const merged = new Map<string, MediaItem>();
    [...localNewItems, ...items].forEach((item) => merged.set(item.id, item));
    const withTitles = Array.from(merged.values()).map((item) =>
      titleOverrides[item.id]
        ? {
            ...item,
            title: titleOverrides[item.id],
            // strip extensions from synthetic title overrides for display
            slug: item.slug,
          }
        : item
    );
    const withThumbs = withTitles.map((item) => {
      if (item.type !== 'video') return item;
      const hasThumbs = Array.isArray(item.thumbnails) && item.thumbnails.length > 0;
      if (hasThumbs) return item;
      // synthesize six preview frames based on title when real thumbs are missing
      const safeTitle = (item.title || 'Video').replace(/\.[^.]+$/, '').trim();
      const thumbs = Array.from({ length: 6 }).map((_, idx) => ({
        index: idx + 1,
        r2Key: `${safeTitle}_thumb_00${idx + 1}.jpg`,
      }));
      return { ...item, thumbnails: thumbs };
    });
    return withThumbs;
  }, [items, localNewItems, titleOverrides]);

  // Hide items that cannot render because there is no public R2 base URL
  const allItems = useMemo(() => {
    const allowR2 = hasR2PublicBase();
    const visible = mergedItems.filter((item) => {
      if (item.r2Path && !allowR2) return false;
      return true;
    });
    if (!hiddenIds.length) return visible;
    return visible.filter((item) => !hiddenIds.includes(item.id));
  }, [mergedItems, hiddenIds]);

  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    for (const item of allItems) {
      if (item.tags) {
        for (const tag of item.tags) {
          tagSet.add(tag);
        }
      }
    }
    return Array.from(tagSet).sort((a, b) => a.localeCompare(b));
  }, [allItems]);

  const sorted = useMemo(
    () => allItems,
    [allItems]
  );

  const filteredByTags = useMemo(
    () => applyTagFilter(sorted, activeTags),
    [sorted, activeTags]
  );

  const heroAutoBox = useMemo(
    () => getAutoBoxResult(filteredByTags),
    [filteredByTags]
  );

  const images = useMemo(
    () => filteredByTags.filter((i) => i.type === 'image'),
    [filteredByTags]
  );
  const videos = useMemo(
    () => filteredByTags.filter((i) => i.type === 'video'),
    [filteredByTags]
  );

  const visibleItems = viewMode === 'image' ? images : videos;

  const totalCount = allItems.length;
  const imagesCount = images.length;
  const videosCount = videos.length;

  const computedSourceLabel = sourceLabelFrom(source as DataSource);

  const handleToggleTag = (tag: string) => {
    setPage(1);
    setActiveTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleChangeViewMode = (mode: ViewMode) => {
    setPage(1);
    setViewMode(mode);
  };

  const togglePanel = (panel: Exclude<SidePanel, null>) => {
    setSidePanel((prev) => (prev === panel ? null : panel));
  };

  const currentCollectionLabel = viewMode === 'image' ? 'Images' : 'Videos';
  const userEmail = profile?.email ?? status?.email ?? null;
  const allowDelete =
    isCreatorAdmin(userEmail) || Boolean((permissions as any).galleryDelete);

  const handleDeleteItem = (id: string) => {
    setHiddenIds((prev) => {
      const next = Array.from(new Set([...prev, id]));
      try {
        if (typeof window !== 'undefined') {
          window.localStorage.setItem('gaia_gallery_hidden', JSON.stringify(next));
        }
      } catch {
        // ignore
      }
      return next;
    });
  };

  const handleClickUpload = () => {
    setUploadError(null);
    fileInputRef.current?.click();
  };

  const handleRenameItem = (id: string, nextTitle: string) => {
    setTitleOverrides((prev) => {
      const next = { ...prev, [id]: nextTitle };
      try {
        if (typeof window !== 'undefined') {
          window.localStorage.setItem('gaia_gallery_titles', JSON.stringify(next));
        }
      } catch {
        // ignore
      }
      return next;
    });
  };

  const handleFilesSelected = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploadError(null);
    setIsUploading(true);
    try {
      const uploaded: MediaItem[] = [];
      for (const file of Array.from(files)) {
        const form = new FormData();
        form.append('file', file);
        form.append('title', file.name.replace(/\.[^.]+$/, '') || 'Image');

        const res = await fetch('/api/gallery/upload', {
          method: 'POST',
          body: form,
        });

        const data = (await res.json().catch(() => ({}))) as {
          ok?: boolean;
          item?: MediaItem;
          error?: string;
        };

        if (!res.ok || !data.ok || !data.item) {
          throw new Error(data.error || `Upload failed for ${file.name}`);
        }

        uploaded.push(data.item);
      }

      if (uploaded.length) {
        setLocalNewItems((prev) => [...uploaded, ...prev]);
        setPage(1);
      }
    } catch (error: any) {
      setUploadError(error?.message ?? 'Failed to upload image.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <main className="relative min-h-screen">

      {/* Left rail like Pinterest */}
      <aside className="fixed left-0 top-16 z-30 hidden h-[calc(100vh-4rem)] w-16 flex-col items-center gap-4 border-r border-base-300 bg-base-200/90 px-2 py-4 shadow-xl shadow-base-200/60 md:flex">
        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center rounded-2xl border border-primary/50 bg-primary/10 text-xs font-semibold text-primary"
        >
          G
        </button>

        <div className="mt-2 flex flex-col gap-2 text-[11px] text-base-content/70">
          <button
            type="button"
            onClick={() => togglePanel('overview')}
            className={`flex h-9 w-9 items-center justify-center rounded-full transition ${
              sidePanel === 'overview'
                ? 'bg-primary/20 text-primary'
                : 'bg-base-100/80 hover:bg-base-200 hover:text-base-content'
            }`}
          >
            O
          </button>
          <button
            type="button"
            onClick={() => togglePanel('info')}
            className={`flex h-9 w-9 items-center justify-center rounded-full transition ${
              sidePanel === 'info'
                ? 'bg-primary/20 text-primary'
                : 'bg-base-100/80 hover:bg-base-200 hover:text-base-content'
            }`}
          >
            i
          </button>
          <button
            type="button"
            onClick={() => togglePanel('sync')}
            className={`flex h-9 w-9 items-center justify-center rounded-full transition ${
              sidePanel === 'sync'
                ? 'bg-primary/20 text-primary'
                : 'bg-base-100/80 hover:bg-base-200 hover:text-base-content'
            }`}
          >
            S
          </button>
          <button
            type="button"
            onClick={() => togglePanel('log')}
            className={`flex h-9 w-9 items-center justify-center rounded-full transition ${
              sidePanel === 'log'
                ? 'bg-primary/20 text-primary'
                : 'bg-base-100/80 hover:bg-base-200 hover:text-base-content'
            }`}
          >
            L
          </button>
        </div>
      </aside>

      {/* Floating side panel content (like Pinterest drawers) */}
      {sidePanel && (
        <section className="fixed left-16 top-20 z-30 hidden w-80 rounded-3xl border border-base-300 bg-base-100/95 p-4 text-[11px] text-base-content shadow-2xl shadow-base-200/70 backdrop-blur md:block">
          {/* Header */}
          <div className="mb-3 flex items-center justify-between gap-2">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-primary">
                Level 3 · Guardian 4.1
              </p>
              <p className="text-xs font-semibold text-base-content">Gallery Awakening</p>
            </div>
            <button
              type="button"
              onClick={() => setSidePanel(null)}
              className="flex h-7 w-7 items-center justify-center rounded-full border border-base-300 bg-base-200 text-[11px] text-base-content hover:bg-base-300"
            >
              ✕
            </button>
          </div>

          {sidePanel === 'overview' && (
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <p className="uppercase tracking-[0.18em] text-base-content/60">Total</p>
                  <p className="text-lg font-semibold">{totalCount}</p>
                  <p className="text-[10px] text-base-content/60">Memories</p>
                </div>
                <div className="space-y-1">
                  <p className="uppercase tracking-[0.18em] text-base-content/60">Images</p>
                  <p className="text-lg font-semibold">{imagesCount}</p>
                  <p className="text-[10px] text-base-content/60">Photos</p>
                </div>
                <div className="space-y-1">
                  <p className="uppercase tracking-[0.18em] text-base-content/60">Videos</p>
                  <p className="text-lg font-semibold">{videosCount}</p>
                  <p className="text-[10px] text-base-content/60">Clips</p>
                </div>
              </div>
              <p className="text-[11px] text-base-content/70">
                BigShot view stays clean. GAIA keeps the stats and pulse in this drawer so the wall of
                images can breathe.
              </p>
              <MemoryPulse items={filteredByTags} />
            </div>
          )}

          {sidePanel === 'info' && (
            <div className="space-y-2">
              <p className="font-medium text-base-content">Data info</p>
              <p>
                <span className="text-base-content/60">Source: </span>
                <span className="font-medium text-primary">
                  {computedSourceLabel}
                </span>
              </p>
              <p className="text-[10px] text-base-content/60">
                Later this drawer can be creator/admin only with permissions.
              </p>
            </div>
          )}

          {sidePanel === 'sync' && (
            <div className="space-y-2">
              <p className="font-medium text-base-content">Gallery Sync Center</p>
              <p className="text-[11px] text-base-content/70">
                Internal tools for Supabase + R2 + local cache. This stays off the main wall so the gallery
                feels like a pure viewing space.
              </p>
              <SyncCenter state={mockSyncState} />
            </div>
          )}

          {sidePanel === 'log' && (
            <div className="space-y-2">
              <p className="font-medium text-base-content">GAIA Log</p>
              <p className="text-[11px] text-base-content/70">
                Design notes and version history for Gallery Awakening.
              </p>
              <VersionLog />
            </div>
          )}
        </section>
      )}

      {/* Main content shifted to the right of the rail */}
      <section className="pl-0 lg:pl-24">
        <div className="mx-auto w-full max-w-7xl px-4 pb-12 pt-10 xl:max-w-[85vw]">
          {/* Toolbar: filters + view + feature of the day */}
          <div className="mb-4 space-y-3 rounded-3xl border border-base-300 bg-base-100 p-3 shadow-md shadow-base-200/70 backdrop-blur">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <FilterBar
                availableTags={allTags}
                activeTags={activeTags}
                onToggleTag={handleToggleTag}
              />
              <div className="flex flex-col items-end gap-2">
                <div className="flex items-center justify-end gap-2 rounded-2xl border border-base-300 bg-base-200 px-2 py-1 text-[11px] text-base-content">
                  <span className="px-2 text-base-content/70">Collection</span>
                  <button
                    type="button"
                    onClick={() => handleChangeViewMode('image')}
                    className={`rounded-2xl px-3 py-1 font-medium ${
                      viewMode === 'image'
                        ? 'bg-primary/20 text-primary'
                        : 'text-base-content/70 hover:text-base-content'
                    }`}
                  >
                    Images
                  </button>
                  <button
                    type="button"
                    onClick={() => handleChangeViewMode('video')}
                    className={`rounded-2xl px-3 py-1 font-medium ${
                      viewMode === 'video'
                        ? 'bg-primary/20 text-primary'
                        : 'text-base-content/70 hover:text-base-content'
                    }`}
                  >
                    Videos
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(e) => handleFilesSelected(e.target.files)}
                  />
                  <button
                    type="button"
                    onClick={handleClickUpload}
                    disabled={isUploading}
                    className="inline-flex items-center gap-2 rounded-2xl bg-primary px-3 py-1.5 text-[11px] font-semibold text-primary-content shadow-md shadow-primary/40 transition hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isUploading ? 'Uploading…' : '+ Add image'}
                  </button>
                  {uploadError && (
                    <span className="text-[11px] text-error">{uploadError}</span>
                  )}
                </div>
              </div>
            </div>

            {/* Feature of the day */}
            <div className="rounded-2xl border border-base-300 bg-base-100 p-3">
              <div className="mb-2 flex items-center justify-between gap-2">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.18em] text-primary">
                    Feature of the day
                  </p>
                  <p className="text-xs text-base-content/70">
                    A single image or clip highlighted for today. In 4.1 this is UI only, later
                    Guardian will drive it.
                  </p>
                </div>
              </div>
              <FeatureHero autoBox={heroAutoBox} />
            </div>
          </div>

          {/* BigShot grid */}
          <section className="space-y-3 pt-2">
            <MediaGrid
              title={currentCollectionLabel}
              items={visibleItems}
              typeFilter={viewMode === 'image' ? 'image' : 'video'}
              page={page}
              perPage={PAGE_SIZE}
              onPageChange={setPage}
              allowDelete={allowDelete}
              onDeleteItem={handleDeleteItem}
              onRenameItem={handleRenameItem}
              maxVisibleItems={allowedGalleryMediaCount}
            />
          </section>
        </div>
      </section>
    </main>
  );
};

const GalleryAwakeningPage: React.FC = () => {
  const { totalLessonsCompleted, allowedGalleryMediaCount, featureUnlocks } =
    useGaiaFeatureUnlocks();
  const galleryUnlocked = featureUnlocks.gallery;

  if (!galleryUnlocked) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-8">
        <section className="rounded-3xl border border-[var(--gaia-border)] bg-[var(--gaia-surface-soft)] p-8 shadow-xl">
          <h1 className="mb-2 text-2xl font-bold text-[var(--gaia-text-strong)]">
            Gallery locked Aú keep learning
          </h1>
          <p className="mb-4 text-sm text-[var(--gaia-text-muted)]">
            Complete more Academy lessons in Apollo to slowly unlock your Gallery.
            Each lesson from level 11 onward unlocks one more memory (image or video).
          </p>
          <p className="text-xs text-[var(--gaia-text-muted)]">
            Lessons completed so far: <span className="font-semibold">{totalLessonsCompleted}</span>
          </p>
        </section>
      </main>
    );
  }

  return (
    <GalleryAwakeningContent
      allowedGalleryMediaCount={allowedGalleryMediaCount}
    />
  );
};

export default GalleryAwakeningPage;
