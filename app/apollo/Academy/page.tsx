"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { lessonsByTrack, type TrackId } from "./lessonsMap";
import { useAcademyProgress } from "./useAcademyProgress";

type TrackSummaryView = {
  id: TrackId;
  title: string;
  href: string;
};

const LAST_VISIT_KEY = "gaia_academy_last_visit_v1";
const ROTATION_ANCHOR_ISO = "2025-01-01";
const ROTATION_MINUTES = [30, 45, 60] as const;
const ROTATION_PATTERNS: TrackId[][] = [
  ["programming", "accounting", "programming"],
  ["accounting", "programming", "accounting"],
];
const FRIDAY_MINUTES = 30;

const TRACKS: TrackSummaryView[] = [
  {
    id: "programming",
    title: "Web Programming · Builder of Worlds",
    href: "/apollo/academy/programming",
  },
  {
    id: "accounting",
    title: "Accounting · Keeper of Numbers",
    href: "/apollo/academy/accounting",
  },
  {
    id: "self-repair",
    title: "Self-Repair · Rebuilding Me",
    href: "/apollo/academy/self-repair",
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
  const a = new Date(dateA + "T00:00:00");
  const b = new Date(dateB + "T00:00:00");
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
  const cursor = new Date(lastVisitIso + "T00:00:00");
  const end = new Date(todayIso + "T00:00:00");
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

export default function AcademyPage() {
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
  const suggestedCount =
    todayMinutes <= 30 ? 1 : todayMinutes <= 45 ? 2 : 3;
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
        ? formatNiceDate(new Date(lastVisitDate + "T00:00:00"))
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
    const completed =
      state.byTrack[track.id]?.completedLessonIds.length ?? 0;
    const percent = formatPercent(completed, total);

    return {
      ...track,
      total,
      completed,
      percent,
    };
  });

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 space-y-6">
      {/* Daily study dashboard */}
      <section className="rounded-2xl gaia-panel-soft p-4 sm:p-5 shadow-sm border border-white/5 space-y-2">
        <p className="text-xs gaia-muted">Academy · Daily Schedule</p>
        <h1 className="text-xl font-semibold">
          Welcome, Sasa.
        </h1>
        <p className="text-sm gaia-muted">
          Today is <span className="gaia-strong">{niceDate}</span>.
        </p>

        <div className="mt-3 rounded-xl border border-white/10 bg-black/10 p-3 space-y-2">
          <p className="text-xs gaia-muted">
            Today&apos;s focus:{" "}
            <span className="gaia-strong">
              {todayTrackId === "programming"
                ? "Web Programming"
                : todayTrackId === "accounting"
                ? "Accounting"
                : "Self-Repair"}
            </span>{" "}
            ·{" "}
            <span className="gaia-strong">
              {todayMinutes} minutes
            </span>
            .
          </p>

          {suggestedLessons.length > 0 ? (
            <div className="space-y-1">
              <p className="text-[11px] gaia-muted">
                Suggested lesson
                {suggestedLessons.length > 1 ? "s" : ""} for today:
              </p>
              <ul className="space-y-1 text-xs gaia-muted">
                {suggestedLessons.map((lesson) => (
                  <li
                    key={lesson.id}
                    className="flex items-baseline justify-between gap-2 rounded-lg bg-black/20 px-2 py-1"
                  >
                    <span className="gaia-strong text-[11px] w-12">
                      {lesson.code}
                    </span>
                    <span className="flex-1">{lesson.title}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-2">
                <Link
                  href={`/apollo/academy/${todayTrackId}#${suggestedLessons[0]?.id}`}
                  className="inline-flex items-center rounded-lg border border-white/20 px-3 py-1.5 text-[11px] font-semibold gaia-accent hover:border-white/40 hover:bg-white/5 transition"
                >
                  Start today&apos;s session →
                </Link>
              </div>
            </div>
          ) : (
            <p className="text-[11px] gaia-muted">
              You&apos;ve completed all planned lessons in this path.
              You can review, practice, or study ahead in another
              path if you feel like it.
            </p>
          )}

          {daysSinceLast > 1 && (
            <p className="text-[11px] gaia-muted mt-1">
              You last studied this path{" "}
              <span className="gaia-strong">
                {daysSinceLast} day
                {daysSinceLast === 1 ? "" : "s"} ago
              </span>
              . Don&apos;t worry — just do what you can today and
              we&apos;ll catch up slowly.
            </p>
          )}

          {pending.days > 0 && (
            <div className="mt-2 rounded-lg border border-white/10 bg-black/10 p-2.5">
              <p className="text-[11px] font-semibold gaia-strong">
                Catch-up since your last visit
                {lastVisitNiceDate ? ` on ${lastVisitNiceDate}` : ""}:
              </p>
              <p className="text-[11px] gaia-muted">
                You have {pending.days} pending day
                {pending.days === 1 ? "" : "s"} (~
                {formatApproxHours(pending.minutes)} of study time).
              </p>
            </div>
          )}

          {pending.days === 0 && lastVisitDate && (
            <p className="text-[11px] gaia-muted mt-1">
              You&apos;re all caught up since your last visit
              {lastVisitNiceDate ? ` on ${lastVisitNiceDate}` : ""}.
            </p>
          )}
        </div>

        <p className="text-[11px] gaia-muted mt-2">
          After you&apos;re done, you can come back here to see your
          updated percentage and what&apos;s next.
        </p>
      </section>

      {/* Track cards */}
      <section className="space-y-3">
        {trackCards.map((track) => (
          <Link
            key={track.id}
            href={track.href}
            className="group block rounded-2xl gaia-panel-soft p-4 sm:p-5 shadow-sm border border-white/5 hover:border-white/15 hover:shadow-md transition"
          >
            <div className="space-y-2">
              <h2 className="text-sm font-semibold gaia-strong">
                {track.title}
              </h2>

              <div className="mt-2 flex items-baseline justify-between text-xs gaia-muted">
                <span className="font-semibold gaia-strong">
                  {track.percent} complete
                </span>
                <span>
                  {track.completed} / {track.total} lessons
                </span>
              </div>

              <p className="mt-3 text-[11px] font-semibold gaia-accent group-hover:underline">
                Enter path →
              </p>
            </div>
          </Link>
        ))}
      </section>
    </main>
  );
}
