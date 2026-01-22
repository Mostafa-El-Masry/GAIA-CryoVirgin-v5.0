'use client';

import React, { useEffect, useState } from 'react';

interface GuardianTodaySummary {
  date: string;
  totalCheckins: number;
  answered: number;
  skipped: number;
  pending: number;
}

interface HealthSummary {
  date: string;
  totalWaterMl: number;
  totalWalkMinutes: number;
  sleepState: 'unknown' | 'asleep' | 'awake';
}

interface GalleryTodayStatus {
  date: string;
  hasFeature: boolean;
  source: 'manual' | 'auto' | null;
  storedAt: string | null;
}

interface DashboardTodayStripSummary {
  date: string;
  guardian: GuardianTodaySummary;
  health: HealthSummary;
  gallery: GalleryTodayStatus;
}

interface TodayStripApiResponse {
  ok: boolean;
  summary?: DashboardTodayStripSummary;
  error?: string;
}

interface TodayStripProps {
  className?: string;
}

// GAIA Level 3 – Dashboard Pulse
// Version 4.2 · Week 3
//
// TodayStrip
// ----------
// A slim bar that sits near the top of the Dashboard and gives a
// single-glance "today" view of three systems:
//
//   1) Guardian Brain  → how many check-ins are done / left.
//   2) Body            → water, walking, and sleep state.
//   3) Gallery         → whether today has a feature set.
//
// It is read-only and does not change any data. Clicking tiles just
// navigates to the full pages (routes are placeholders that you can
// adjust: /guardian, /health, /gallery-awakening).
//
// It is safe to remove at any time.

const TodayStrip: React.FC<TodayStripProps> = ({ className = '' }) => {
  const [summary, setSummary] = useState<DashboardTodayStripSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/dashboard/today-strip');
        const data = (await res.json()) as TodayStripApiResponse;
        if (!data.ok || !data.summary) {
          throw new Error(data.error || 'Failed to load today strip.');
        }
        if (!cancelled) {
          setSummary(data.summary);
        }
      } catch (err: any) {
        if (!cancelled) {
          setError(err?.message ?? 'Failed to load today strip.');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    run();

    return () => {
      cancelled = true;
    };
  }, []);

  const rootClasses =
    'rounded-xl border bg-black/5 px-3 py-2 shadow-sm flex items-center gap-2 ' +
    'border-zinc-800/70 bg-gradient-to-r from-black/50 via-zinc-900/40 to-black/40 ' +
    'text-[11px]';

  const pillClasses =
    'inline-flex min-w-[0] items-center gap-1 rounded-full border px-2 py-[3px] ' +
    'border-white/10 bg-black/30 hover:bg-black/50 transition-colors';

  if (error && !loading) {
    return (
      <section className={`${rootClasses} ${className}`}>
        <p className="text-[11px] text-red-400">
          {error}
        </p>
      </section>
    );
  }

  return (
    <section className={`${rootClasses} ${className}`}>
      <div className="mr-2 flex flex-col">
        <span className="text-[10px] uppercase tracking-[0.18em] text-zinc-400">
          Today
        </span>
        <span className="text-[10px] text-zinc-500">
          {summary?.date ?? ''}
        </span>
      </div>

      {loading && (
        <p className="text-[11px] text-zinc-400">Loading your brain, body, and gallery…</p>
      )}

      {!loading && summary && (
        <div className="flex flex-wrap items-center gap-2">
          {/* Guardian pill */}
          <a href="/guardian" className={pillClasses}>
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            <span className="font-semibold text-emerald-100">Guardian</span>
            <span className="text-zinc-300">
              {summary.guardian.totalCheckins > 0
                ? `${summary.guardian.answered}/${summary.guardian.totalCheckins} done`
                : 'No check-ins today'}
            </span>
            {summary.guardian.skipped > 0 && (
              <span className="text-zinc-400">
                · {summary.guardian.skipped} skipped
              </span>
            )}
          </a>

          {/* Body pill */}
          <a href="/health" className={pillClasses}>
            <span className="h-1.5 w-1.5 rounded-full bg-sky-400" />
            <span className="font-semibold text-sky-100">Body</span>
            <span className="text-zinc-300">
              {`${(summary.health.totalWaterMl / 1000).toFixed(2)} L`}
            </span>
            <span className="text-zinc-400">
              · {summary.health.totalWalkMinutes} min
            </span>
            <span className="text-zinc-400">
              ·{' '}
              {summary.health.sleepState === 'asleep'
                ? 'Sleeping'
                : summary.health.sleepState === 'awake'
                ? 'Awake'
                : 'Sleep not set'}
            </span>
          </a>

          {/* Gallery pill */}
          <a href="/instagram" className={pillClasses}>
            <span className="h-1.5 w-1.5 rounded-full bg-fuchsia-400" />
            <span className="font-semibold text-fuchsia-100">Gallery</span>
            {summary.gallery.hasFeature ? (
              <span className="text-zinc-300">
                Feature set ({summary.gallery.source === 'manual' ? 'Pinned' : 'Auto'})
              </span>
            ) : (
              <span className="text-zinc-400">
                No feature saved yet
              </span>
            )}
          </a>
        </div>
      )}
    </section>
  );
};

export default TodayStrip;
