"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { lessonsByTrack, type TrackId } from "../lessonsMap";
import { useAcademyProgress } from "../useAcademyProgress";
import { allPaths } from "./index";
import { PathCard } from "./PathCard";

type TrackSummaryView = {
  id: TrackId;
  title: string;
  href: string;
};

const LAST_VISIT_KEY = "gaia_academy_last_visit_v1";
const ROTATION_ANCHOR_ISO = "2026-01-01";
const ROTATION_MINUTES = [30, 45, 60] as const;
const ROTATION_PATTERNS: TrackId[][] = [
  ["programming", "accounting", "programming"],
  ["accounting", "programming", "accounting"],
];
const FRIDAY_MINUTES = 30;

const TRACKS: TrackSummaryView[] = [
  {
    id: "programming",
    title: "Web Programming - Builder of Worlds",
    href: "/apollo/academy/Paths/programming",
  },
  {
    id: "accounting",
    title: "Accounting - Keeper of Numbers",
    href: "/apollo/academy/Paths/accounting",
  },
  {
    id: "self-repair",
    title: "Self-Repair - Rebuilding Me",
    href: "/apollo/academy/Paths/self-repair",
  },
];

function formatPercent(completed: number, total: number) {
  if (!total) return "0%";
  const pct = Math.round((completed / total) * 100);
  return `${pct}%`;
}

function formatNiceDate(d: Date): string {
  try {
    return d.toLocaleDateString(undefined, {
      weekday: "long",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return d.toISOString().slice(0, 10);
  }
}

function daysBetween(dateA: string, dateB: string): number {
  const a = new Date(`${dateA}T00:00:00`);
  const b = new Date(`${dateB}T00:00:00`);
  const diffMs = b.getTime() - a.getTime();
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}

function startOfDay(date: Date): Date {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function getScheduleForDate(date: Date): { trackId: TrackId; minutes: number } {
  const normalized = startOfDay(date);
  if (normalized.getDay() === 5) {
    return { trackId: "self-repair", minutes: FRIDAY_MINUTES };
  }

  const iso = normalized.toISOString().slice(0, 10);
  const daysSinceAnchor = Math.max(0, daysBetween(ROTATION_ANCHOR_ISO, iso));
  const blockIndex = Math.floor(daysSinceAnchor / 3);
  const dayWithinBlock = daysSinceAnchor % 3;
  const minutes = ROTATION_MINUTES[dayWithinBlock];
  const pattern =
    ROTATION_PATTERNS[blockIndex % ROTATION_PATTERNS.length] ??
    ROTATION_PATTERNS[0];
  const trackId = pattern[dayWithinBlock] ?? "programming";

  return { trackId, minutes };
}

function computePendingSince(
  lastVisitIso: string | null,
  todayIso: string
): { days: number; minutes: number } {
  if (!lastVisitIso || lastVisitIso === todayIso) {
    return { days: 0, minutes: 0 };
  }

  const sessions: { minutes: number }[] = [];
  const cursor = new Date(`${lastVisitIso}T00:00:00`);
  const end = new Date(`${todayIso}T00:00:00`);
  cursor.setDate(cursor.getDate() + 1);

  while (cursor <= end) {
    sessions.push(getScheduleForDate(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }

  const minutes = sessions.reduce((sum, session) => sum + session.minutes, 0);
  return { days: sessions.length, minutes };
}

function formatApproxHours(minutes: number): string {
  if (minutes < 60) return `${minutes} minutes`;
  const hours = minutes / 60;
  const rounded = Math.round(hours * 10) / 10;
  return `${rounded} hour${rounded === 1 ? "" : "s"}`;
}

export default function AcademyPathsHome() {
  const { state, isLessonCompleted } = useAcademyProgress();
  const today = useMemo(() => new Date(), []);
  const todayIso = today.toISOString().slice(0, 10);
  const niceDate = formatNiceDate(today);
  const [lastVisitDate, setLastVisitDate] = useState<string | null>(null);
  const todaySchedule = getScheduleForDate(today);
  const todayTrackId = todaySchedule.trackId;
  const todayMinutes = todaySchedule.minutes;
  const todayLessons = lessonsByTrack[todayTrackId] ?? [];
  const incompleteToday = todayLessons.filter(
    (lesson) => !isLessonCompleted(todayTrackId, lesson.id)
  );
  const suggestedCount = todayMinutes <= 30 ? 1 : todayMinutes <= 45 ? 2 : 3;
  const suggestedLessons = incompleteToday.slice(0, suggestedCount);

  const todayTrackState = state.byTrack[todayTrackId];
  const lastStudyDate = todayTrackState?.lastStudyDate;
  const daysSinceLast =
    lastStudyDate && lastStudyDate !== todayIso
      ? daysBetween(lastStudyDate, todayIso)
      : 0;
  const pending = useMemo(
    () => computePendingSince(lastVisitDate, todayIso),
    [lastVisitDate, todayIso]
  );
  const lastVisitNiceDate = useMemo(
    () =>
      lastVisitDate
        ? formatNiceDate(new Date(`${lastVisitDate}T00:00:00`))
        : null,
    [lastVisitDate]
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const stored = window.localStorage.getItem(LAST_VISIT_KEY);
      if (stored) {
        setLastVisitDate(stored);
      }
      window.localStorage.setItem(LAST_VISIT_KEY, todayIso);
    } catch {
      // ignore storage errors
    }
  }, [todayIso]);

  const trackCards = TRACKS.map((track) => {
    const lessons = lessonsByTrack[track.id] ?? [];
    const total = lessons.length;
    const completed = state.byTrack[track.id]?.completedLessonIds.length ?? 0;
    const percent = formatPercent(completed, total);

    return {
      ...track,
      total,
      completed,
      percent,
    };
  });

  const sorted = [...allPaths].sort((a, b) => a.order - b.order);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-slate-50 to-slate-100 py-6">
      <main className="mx-auto max-w-6xl px-4 sm:px-6 space-y-6">
        {/* Daily study dashboard moved from legacy Academy home */}
        <section className="rounded-3xl border border-slate-200 bg-gradient-to-r from-sky-500 via-indigo-500 to-fuchsia-500 p-4 sm:p-5 shadow-[0_12px_35px_rgba(15,23,42,0.18)] space-y-2 text-white">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/80">
            Apollo Academy · Daily Schedule
          </p>
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-white">
            Welcome back.
          </h1>
          <p className="text-sm text-white/90">
            Today is <span className="font-semibold text-white">{niceDate}</span>.
          </p>

          <div className="mt-3 rounded-xl border border-white/30 bg-white/85 p-3 space-y-2 text-slate-800 shadow-sm backdrop-blur">
            <p className="text-xs text-slate-700">
              Today&apos;s focus:{" "}
              <span className="font-semibold text-slate-900">
                {todayTrackId === "programming"
                  ? "Web Programming"
                  : todayTrackId === "accounting"
                  ? "Accounting"
                  : "Self-Repair"}
              </span>{" "}
              · <span className="font-semibold text-slate-900">{todayMinutes} minutes</span>.
            </p>

            {suggestedLessons.length > 0 ? (
              <div className="space-y-1">
                <p className="text-[11px] text-slate-700">
                  Suggested lesson{suggestedLessons.length > 1 ? "s" : ""} for today:
                </p>
                <ul className="space-y-1 text-xs text-slate-800">
                  {suggestedLessons.map((lesson) => (
                    <li
                      key={lesson.id}
                      className="flex items-baseline justify-between gap-2 rounded-md border border-slate-200 bg-slate-50/90 px-2 py-1"
                    >
                      <span className="font-semibold text-[11px] w-12 text-slate-900">
                        {lesson.code}
                      </span>
                      <span className="flex-1">{lesson.title}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-2 flex flex-wrap gap-2">
                  <Link
                    href={`/apollo/academy/Paths/lesson/${suggestedLessons[0]?.id}`}
                    className="inline-flex items-center rounded-md bg-amber-500 px-3 py-1.5 text-[11px] font-semibold text-white shadow-sm transition hover:bg-amber-600"
                  >
                    Start today&apos;s session →
                  </Link>
                  <Link
                    href={`/apollo/academy/Paths/${todayTrackId}`}
                    className="inline-flex items-center rounded-md border border-slate-300 bg-white px-3 py-1.5 text-[11px] font-semibold text-slate-700"
                  >
                    View path outline
                  </Link>
                </div>
              </div>
            ) : (
              <p className="text-[11px] text-slate-700">
                You&apos;ve completed all planned lessons in this path. You can review, practice, or
                study ahead in another path if you feel like it.
              </p>
            )}

            {daysSinceLast > 1 && (
              <p className="text-[11px] text-slate-700 mt-1">
                You last studied this path{" "}
                <span className="font-semibold text-slate-900">
                  {daysSinceLast} day{daysSinceLast === 1 ? "" : "s"} ago
                </span>
                . Don&apos;t worry — just do what you can today and we&apos;ll catch up slowly.
              </p>
            )}

            {pending.days > 0 && (
              <div className="mt-2 rounded-lg border border-slate-200 bg-white/90 p-2.5 shadow-sm">
                <p className="text-[11px] font-semibold text-slate-900">
                  Catch-up since your last visit
                  {lastVisitNiceDate ? ` on ${lastVisitNiceDate}` : ""}:
                </p>
                <p className="text-[11px] text-slate-700">
                  You have {pending.days} pending day{pending.days === 1 ? "" : "s"} (~
                  {formatApproxHours(pending.minutes)} of study time).
                </p>
              </div>
            )}

            {pending.days === 0 && lastVisitDate && (
              <p className="text-[11px] text-slate-700 mt-1">
                You&apos;re all caught up since your last visit
                {lastVisitNiceDate ? ` on ${lastVisitNiceDate}` : ""}.
              </p>
            )}
          </div>

          <p className="text-[11px] text-white/90 mt-2">
            After you&apos;re done, come back here to see your updated percentage and what&apos;s next.
          </p>
        </section>

        {/* Grid of paths using the same style as the main Academy cards */}
        <section>
          <h3 className="text-center sm:text-left text-sm font-semibold text-slate-900">
            Available paths
          </h3>
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
            {sorted.map((path) => (
              <PathCard key={path.id} path={path} />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
