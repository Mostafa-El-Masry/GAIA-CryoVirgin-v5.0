'use client';

import React from 'react';
import type { SyncState, SyncDiff } from '../syncTypes';

interface SyncCenterProps {
  state: SyncState;
}

function statusLabel(status: SyncState['status']): { text: string; className: string } {
  switch (status) {
    case 'up_to_date':
      return {
        text: 'Up to date',
        className: 'bg-primary/10 text-primary border-primary/50'
      };
    case 'needs_attention':
      return {
        text: 'Needs attention',
        className: 'bg-warning/10 text-warning border-warning/50'
      };
    default:
      return {
        text: 'Idle',
        className: 'bg-base-200 text-base-content border-base-300'
      };
  }
}

function kindLabel(diff: SyncDiff): string {
  switch (diff.kind) {
    case 'new_r2_media':
      return 'New in R2';
    case 'missing_r2_media':
      return 'Missing from R2';
    case 'missing_local_video':
      return 'Missing local video';
    default:
      return 'Change';
  }
}

export const SyncCenter: React.FC<SyncCenterProps> = ({ state }) => {
  const s = statusLabel(state.status);

  const lastSynced =
    state.lastSyncedAt != null
      ? new Date(state.lastSyncedAt).toLocaleString()
      : 'Never synced';

  return (
    <section className="space-y-4 rounded-3xl border border-base-300 bg-base-100 p-4 text-base-content shadow-sm">
      <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-base-content/60">
            Gallery Sync Center
          </p>
          <p className="text-sm text-base-content/70">
            See how GAIA compares Cloudflare R2, local videos, and the Supabase metadata.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div
            className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-semibold ${s.className}`}
          >
            <span className="h-2 w-2 rounded-full bg-current" />
            <span>{s.text}</span>
          </div>
          <button
            type="button"
            className="rounded-full border border-base-300 bg-base-200 px-3 py-1 text-[11px] font-medium text-base-content hover:bg-base-300"
            disabled
            title="Sync logic will be wired in a later iteration. For now, this is a design-only control."
          >
            Sync now (coming later)
          </button>
        </div>
      </header>

      <div className="grid gap-3 text-xs text-base-content md:grid-cols-3">
        <div className="space-y-1 rounded-2xl bg-base-200 p-3">
          <p className="font-medium text-base-content">R2 · Images & Thumbnails</p>
          <p className="text-[11px] text-base-content/70">{state.r2CanonicalNote}</p>
        </div>
        <div className="space-y-1 rounded-2xl bg-base-200 p-3">
          <p className="font-medium text-base-content">Local Disk · Videos</p>
          <p className="text-[11px] text-base-content/70">{state.localCanonicalNote}</p>
        </div>
        <div className="space-y-1 rounded-2xl bg-base-200 p-3">
          <p className="font-medium text-base-content">Supabase · Metadata</p>
          <p className="text-[11px] text-base-content/70">{state.metadataCanonicalNote}</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-base-content/70">
        <p>
          <span className="font-semibold text-base-content">Last sync:</span> {lastSynced}
        </p>
        <p>
          <span className="font-semibold text-base-content">Changes detected:</span>{' '}
          {state.diffs.length}
        </p>
      </div>

      <div className="space-y-2 rounded-2xl bg-base-200 p-3">
        {state.diffs.length === 0 ? (
          <p className="text-[11px] text-base-content/70">
            No differences detected between R2, local files, and metadata since the last sync.
          </p>
        ) : (
          <>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-base-content/60">
              Diff summary
            </p>
            <ul className="space-y-2">
              {state.diffs.map((diff) => (
                <li
                  key={diff.id}
                  className="rounded-xl border border-base-300 bg-base-100 px-3 py-2"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs font-medium text-base-content">
                      {diff.label}
                    </span>
                    <span className="rounded-full bg-base-200 px-2 py-0.5 text-[10px] text-base-content">
                      {kindLabel(diff)}
                    </span>
                  </div>
                  <p className="mt-1 text-[11px] text-base-content/70">{diff.detail}</p>
                  {diff.suggestion && (
                    <p className="mt-1 text-[11px] text-primary">
                      → {diff.suggestion}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </section>
  );
};
