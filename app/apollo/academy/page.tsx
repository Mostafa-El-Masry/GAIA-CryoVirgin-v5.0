"use client";

import clsx from "clsx";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { lessonsByTrack, type TrackId } from "./lessonsMap";
import { useAcademyProgress } from "./useAcademyProgress";
import type { AcademyProgressState } from "./useAcademyProgress";

type BacklogTier = "clear" | "light" | "medium" | "heavy";

type BacklogByTrack = {
  days: number;
  totalMinutes: number;
  perTrack: Record<
    TrackId,
    {
      minutes: number;
      tier: BacklogTier;
    }
  >;
};

type PlanSummary = {
  scheduledDays: number;
  completedDays: number;
  backlogDays: number;
};

type PlanSummaryByTrack = {
  total: PlanSummary;
  perTrack: Record<TrackId, PlanSummary>;
};

function computePlanSummary(
  state: AcademyProgressState,
  todayIso: string
): PlanSummaryByTrack {
  const scheduleStart = createDateFromIso(SCHEDULE_START_ISO);
  scheduleStart.setHours(0, 0, 0, 0);

  const end = createDateFromIso(todayIso);
  // We only consider backlog until yesterday; today is handled in the "today" card.
  end.setDate(end.getDate() - 1);
  end.setHours(0, 0, 0, 0);

  const scheduledByTrack: Record<TrackId, number> = {
    programming: 0,
    accounting: 0,
    "self-repair": 0,
  };

  const cursor = new Date(scheduleStart);
  cursor.setHours(0, 0, 0, 0);

  while (cursor <= end) {
    const { trackId, minutes } = getScheduleForDate(cursor);
    if (minutes > 0) {
      scheduledByTrack[trackId] += 1;
    }
    cursor.setDate(cursor.getDate() + 1);
  }

  const completedByTrack: Record<TrackId, number> = {
    programming:
      state.byTrack.programming?.studyHistory?.filter((d) => d <= todayIso)
        .length ?? 0,
    accounting:
      state.byTrack.accounting?.studyHistory?.filter((d) => d <= todayIso)
        .length ?? 0,
    "self-repair":
      state.byTrack["self-repair"]?.studyHistory?.filter((d) => d <= todayIso)
        .length ?? 0,
  };

  const perTrack: Record<TrackId, PlanSummary> = {
    programming: {
      scheduledDays: scheduledByTrack.programming,
      completedDays: completedByTrack.programming,
      backlogDays: Math.max(
        scheduledByTrack.programming - completedByTrack.programming,
        0
      ),
    },
    accounting: {
      scheduledDays: scheduledByTrack.accounting,
      completedDays: completedByTrack.accounting,
      backlogDays: Math.max(
        scheduledByTrack.accounting - completedByTrack.accounting,
        0
      ),
    },
    "self-repair": {
      scheduledDays: scheduledByTrack["self-repair"],
      completedDays: completedByTrack["self-repair"],
      backlogDays: Math.max(
        scheduledByTrack["self-repair"] - completedByTrack["self-repair"],
        0
      ),
    },
  };

  const tracks: TrackId[] = ["programming", "accounting", "self-repair"];

  const totalScheduled = tracks.reduce(
    (sum, t) => sum + perTrack[t].scheduledDays,
    0
  );
  const totalCompleted = tracks.reduce(
    (sum, t) => sum + perTrack[t].completedDays,
    0
  );
  const totalBacklog = tracks.reduce(
    (sum, t) => sum + perTrack[t].backlogDays,
    0
  );

  return {
    total: {
      scheduledDays: totalScheduled,
      completedDays: totalCompleted,
      backlogDays: totalBacklog,
    },
    perTrack,
  };
}


const LAST_VISIT_KEY = "gaia_academy_last_visit_v1";

// New stepped schedule configuration
const SCHEDULE_START_ISO = "2026-01-01";
const BASE_MINUTES_PER_STUDY_DAY = 30;

function createDateFromIso(iso: string): Date {
  const [y, m, d] = iso.split("-").map((x) => parseInt(x, 10));
  return new Date(y, m - 1, d);
}

function isoFromDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
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
    return isoFromDate(d);
  }
}

function monthsSinceScheduleStart(date: Date): number {
  const start = createDateFromIso(SCHEDULE_START_ISO);
  const startTotalMonths = start.getFullYear() * 12 + start.getMonth();
  const dateTotalMonths = date.getFullYear() * 12 + date.getMonth();
  const diff = dateTotalMonths - startTotalMonths;
  return diff < 0 ? 0 : diff;
}

function computeDaysPerWeekForWeek(weekStart: Date): number {
  const months = monthsSinceScheduleStart(weekStart);
  const daysPerWeek = 1 + months; // Jan 2026 = 1, Feb 2026 = 2, ... up to 7
  if (daysPerWeek < 1) return 1;
  if (daysPerWeek > 7) return 7;
  return daysPerWeek;
}

function getWeekStart(date: Date): Date {
  // Week starts on Monday
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  const day = copy.getDay(); // 0 = Sun, 1 = Mon, ... 6 = Sat
  const offsetToMonday = (day + 6) % 7; // Mon -> 0, Sun -> 6
  copy.setDate(copy.getDate() - offsetToMonday);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function weeksBetween(startIso: string, weekStart: Date): number {
  const start = createDateFromIso(startIso);
  start.setHours(0, 0, 0, 0);
  const diffMs = weekStart.getTime() - start.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays <= 0) return 0;
  return Math.floor(diffDays / 7);
}

function preferredDayOrderForTrack(trackId: TrackId): number[] {
  // JS getDay: 0 Sun, 1 Mon, 2 Tue, 3 Wed, 4 Thu, 5 Fri, 6 Sat
  if (trackId === "self-repair") {
    // Self-repair prefers Friday as anchor, then gentle spreads
    return [5, 1, 3, 2, 4, 0, 6];
  }
  // Programming & Accounting prefer the first day of the week (Monday)
  return [1, 2, 3, 4, 0, 6, 5];
}

const TRACK_CYCLE: TrackId[] = ["programming", "accounting", "self-repair"];

function getScheduleForDate(
  date: Date
): { trackId: TrackId; minutes: number } {
  const scheduleStart = createDateFromIso(SCHEDULE_START_ISO);
  scheduleStart.setHours(0, 0, 0, 0);

  const target = new Date(date);
  target.setHours(0, 0, 0, 0);

  // Before the schedule starts, nothing is required
  if (target < scheduleStart) {
    return { trackId: "programming", minutes: 0 };
  }

  const weekStart = getWeekStart(target);
  const weekIndexSinceStart = weeksBetween(SCHEDULE_START_ISO, weekStart);
  const trackId =
    TRACK_CYCLE[weekIndexSinceStart % TRACK_CYCLE.length] ?? "programming";

  const daysPerWeek = computeDaysPerWeekForWeek(weekStart);

  // Build the 7-day window for this week
  const candidateDays: { iso: string; dayOfWeek: number }[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    d.setHours(0, 0, 0, 0);
    candidateDays.push({ iso: isoFromDate(d), dayOfWeek: d.getDay() });
  }

  const preferredOrder = preferredDayOrderForTrack(trackId);
  const studyIsos: string[] = [];
  const startIso = SCHEDULE_START_ISO;

  for (const dayOfWeek of preferredOrder) {
    if (studyIsos.length >= daysPerWeek) break;
    const candidate = candidateDays.find(
      (c) => c.dayOfWeek === dayOfWeek && c.iso >= startIso
    );
    if (!candidate) continue;
    if (!studyIsos.includes(candidate.iso)) {
      studyIsos.push(candidate.iso);
    }
  }

  const todayIso = isoFromDate(target);
  const isStudyDay = studyIsos.includes(todayIso);
  const minutes = isStudyDay ? BASE_MINUTES_PER_STUDY_DAY : 0;

  return { trackId, minutes };
}

function backlogTier(minutes: number): BacklogTier {
  if (minutes === 0) return "clear";
  if (minutes <= 60) return "light";
  if (minutes <= 180) return "medium";
  return "heavy";
}

function computeBacklogByTrack(
  lastVisitIso: string | null,
  todayIso: string
): BacklogByTrack {
  const base: BacklogByTrack = {
    days: 0,
    totalMinutes: 0,
    perTrack: {
      programming: { minutes: 0, tier: "clear" },
      accounting: { minutes: 0, tier: "clear" },
      "self-repair": { minutes: 0, tier: "clear" },
    },
  };

  if (!lastVisitIso || lastVisitIso >= todayIso) {
    return base;
  }

  const start = createDateFromIso(lastVisitIso);
  start.setDate(start.getDate() + 1); // start from the day after last visit
  start.setHours(0, 0, 0, 0);

  const end = createDateFromIso(todayIso);
  end.setDate(end.getDate() - 1); // backlog only until yesterday
  end.setHours(0, 0, 0, 0);

  if (start > end) {
    return base;
  }

  const minutesByTrack: Record<TrackId, number> = {
    programming: 0,
    accounting: 0,
    "self-repair": 0,
  };
  let backlogStudyDays = 0;

  const cursor = new Date(start);
  while (cursor <= end) {
    const { trackId, minutes } = getScheduleForDate(cursor);
    if (minutes > 0) {
      minutesByTrack[trackId] += minutes;
      backlogStudyDays += 1;
    }
    cursor.setDate(cursor.getDate() + 1);
  }

  const totalMinutes =
    minutesByTrack.programming +
    minutesByTrack.accounting +
    minutesByTrack["self-repair"];

  return {
    days: backlogStudyDays,
    totalMinutes,
    perTrack: {
      programming: {
        minutes: minutesByTrack.programming,
        tier: backlogTier(minutesByTrack.programming),
      },
      accounting: {
        minutes: minutesByTrack.accounting,
        tier: backlogTier(minutesByTrack.accounting),
      },
      "self-repair": {
        minutes: minutesByTrack["self-repair"],
        tier: backlogTier(minutesByTrack["self-repair"]),
      },
    },
  };
}

function formatApproxHours(minutes: number): string {
  if (minutes <= 0) return "0 minutes";
  if (minutes < 60) return `${minutes} minutes`;
  const hours = minutes / 60;
  const rounded = Math.round(hours * 10) / 10;
  return `${rounded} hour${rounded === 1 ? "" : "s"}`;
}

function trackLabel(trackId: TrackId): string {
  if (trackId === "programming") return "Web Programming";
  if (trackId === "accounting") return "Accounting";
  return "Self-Repair";
}

function tierLabel(tier: BacklogTier): string {
  switch (tier) {
    case "clear":
      return "no backlog";
    case "light":
      return "light backlog";
    case "medium":
      return "medium backlog";
    case "heavy":
      return "heavy backlog";
    default:
      return tier;
  }
}

export default function AcademyDashboardPage() {
  const { state, isLessonCompleted } = useAcademyProgress();
  const today = useMemo(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return now;
  }, []);
  const todayIso = isoFromDate(today);
  const niceDate = formatNiceDate(today);
  const [lastVisitDate, setLastVisitDate] = useState<string | null>(null);

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

  const todaySchedule = getScheduleForDate(today);
  const todayTrackId = todaySchedule.trackId;
  const todayMinutes = todaySchedule.minutes;
  const isRestDay = todayMinutes === 0;

  const todayLessons = lessonsByTrack[todayTrackId] ?? [];

  const nextLesson = useMemo(() => {
    if (!todayLessons.length) return null;
    const completedCount =
      state.byTrack[todayTrackId]?.completedLessonIds.length ?? 0;
    // Align with calendar/path: next lesson = first incomplete by index
    return todayLessons[completedCount] ?? todayLessons[todayLessons.length - 1];
  }, [state.byTrack, todayLessons, todayTrackId]);

  const backlog = useMemo(
    () => computeBacklogByTrack(lastVisitDate, todayIso),
    [lastVisitDate, todayIso]
  );

const planSummary = useMemo(
  () => computePlanSummary(state, todayIso),
  [state, todayIso]
);

const aheadDaysTotal = Math.max(
  planSummary.total.completedDays - planSummary.total.scheduledDays,
  0
);

  const tracks: TrackId[] = ["programming", "accounting", "self-repair"];
  const trackSummaries = tracks.map((trackId) => {
    const lessons = lessonsByTrack[trackId] ?? [];
    const total = lessons.length;
    const completed =
      state.byTrack[trackId]?.completedLessonIds.length ?? 0;
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
    const lastStudy = state.byTrack[trackId]?.lastStudyDate ?? null;
    const backlogForTrack = backlog.perTrack[trackId];

    return {
      id: trackId,
      total,
      completed,
      percent,
      lastStudy,
      backlogMinutes: backlogForTrack.minutes,
      backlogTier: backlogForTrack.tier,
    };
  });

  const lastVisitNiceDate = useMemo(
    () =>
      lastVisitDate
        ? formatNiceDate(createDateFromIso(lastVisitDate))
        : null,
    [lastVisitDate]
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-slate-50 to-slate-100 py-6">
      <main className="mx-auto max-w-6xl px-4 sm:px-6 space-y-6">
        {/* Header */}
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900">
              Academy dashboard
            </h1>
            <p className="text-sm text-slate-600">
              Today is{" "}
              <span className="font-medium text-slate-900">{niceDate}</span>.
              This is your study control panel with your stepped schedule.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Link
              href="/apollo/academy/calendar"
              className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1 shadow-sm hover:bg-slate-50 transition"
            >
              Monthly calendar →
            </Link>
            <span className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1 shadow-sm">
              <span className="h-2 w-2 rounded-full bg-emerald-500 mr-2" />
              Learning engine online
            </span>
          </div>
        </header>

        {/* Today focus card */}
        <section className="rounded-3xl border border-slate-200 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 px-4 sm:px-6 py-4 sm:py-5 shadow-[0_12px_35px_rgba(15,23,42,0.18)] text-white space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-white/60">
                {isRestDay ? "Rest day in the plan" : "Today&apos;s focus"}
              </p>
              {isRestDay ? (
                <>
                  <p className="mt-1 text-lg sm:text-xl font-semibold">
                    No scheduled study today
                  </p>
                  <p className="mt-1 text-xs sm:text-[13px] text-white/80 max-w-xl">
                    According to your stepped plan (starting Jan 2026), today
                    is a rest day. You won&apos;t accumulate backlog for
                    skipping this day. You can still study{" "}
                    {trackLabel(todayTrackId)} if you feel like it.
                  </p>
                </>
              ) : (
                <>
                  <p className="mt-1 text-lg sm:text-xl font-semibold">
                    {trackLabel(todayTrackId)} ·{" "}
                    <span className="font-bold">{todayMinutes} minutes</span>
                  </p>
                  <p className="mt-1 text-xs sm:text-[13px] text-white/80 max-w-xl">
                    This month your plan uses{" "}
                    <span className="font-semibold">
                      a limited number of study days per week
                    </span>{" "}
                    so you build the habit gently. Only those days count
                    towards backlog.
                  </p>
                </>
              )}
            </div>

            <div className="flex flex-col sm:items-end gap-2">
              {nextLesson ? (
                <>
                  <p className="text-[11px] text-white/70">
                    Next lesson in this path:
                  </p>
                  <Link
                    href={`/apollo/academy/Paths/lesson/${nextLesson.id}`}
                    className="inline-flex items-center justify-center rounded-full bg-white px-4 py-2 text-xs font-semibold text-slate-900 shadow-sm hover:bg-emerald-100 transition"
                  >
                    Continue: {nextLesson.code} · {nextLesson.title}
                  </Link>
                </>
              ) : (
                <p className="text-[11px] text-white/70">
                  You&apos;ve completed all lessons currently defined for this
                  path. You can review or jump to another path.
                </p>
              )}

              <Link
                href="/apollo/academy/Paths"
                className="text-[11px] underline text-white/70 hover:text-white inline-flex items-center justify-end"
              >
                View all paths
              </Link>
            </div>
          </div>
        </section>

        {/* Backlog summary */}
        <section className="rounded-2xl border border-slate-200 bg-white/90 px-4 sm:px-6 py-4 shadow-sm space-y-2">
          <p className="text-xs font-semibold text-slate-900">
            Backlog since your last visit
            {lastVisitNiceDate ? ` on ${lastVisitNiceDate}` : ""}:
          </p>

          {backlog.totalMinutes === 0 ? (
            <>
              <p className="text-xs text-slate-700">
                You&apos;re all caught up with your scheduled study days since
                your last visit. 🎉 Rest days do not create backlog.
              </p>
              <p className="mt-1 text-[11px] text-slate-600">
                Since the plan started, you have completed{" "}
                <span className="font-semibold">
                  {planSummary.total.completedDays} scheduled study day
                  {planSummary.total.completedDays === 1 ? "" : "s"}
                </span>{" "}
                out of{" "}
                <span className="font-semibold">
                  {planSummary.total.scheduledDays} planned study day
                  {planSummary.total.scheduledDays === 1 ? "" : "s"}
                </span>
                .
              </p>
              {aheadDaysTotal > 0 && (
                <p className="mt-1 text-[11px] text-emerald-700">
                  You&apos;re ahead of schedule by {aheadDaysTotal} extra study day
                  {aheadDaysTotal === 1 ? "" : "s"}. Studying on rest days helps pay down any backlog.
                </p>
              )}
            </>
          ) : (
            <>
              <p className="text-xs text-slate-700">
                That&apos;s {backlog.days} pending study day
                {backlog.days === 1 ? "" : "s"} (~{" "}
                {formatApproxHours(backlog.totalMinutes)} total).
              </p>
              <p className="mt-1 text-[11px] text-slate-600">
                Since the plan started, you have completed{" "}
                <span className="font-semibold">
                  {planSummary.total.completedDays} scheduled study day
                  {planSummary.total.completedDays === 1 ? "" : "s"}
                </span>{" "}
                out of{" "}
                <span className="font-semibold">
                  {planSummary.total.scheduledDays} planned study day
                  {planSummary.total.scheduledDays === 1 ? "" : "s"}
                </span>
                .
              </p>
              {aheadDaysTotal > 0 && (
                <p className="mt-1 text-[11px] text-emerald-700">
                  You&apos;re ahead of schedule by {aheadDaysTotal} extra study day
                  {aheadDaysTotal === 1 ? "" : "s"}. Those extra sessions reduce older backlog in your calendar.
                </p>
              )}

              <div className="mt-4 space-y-2">
                {tracks.map((trackId) => {
                  const trackBacklog = backlog.perTrack[trackId];
                  if (!trackBacklog || trackBacklog.minutes === 0) return null;
                  const tier = trackBacklog.tier;
                  const track = trackBacklog;
                  const label =
                    trackId === "programming"
                      ? "Programming"
                      : trackId === "accounting"
                      ? "Accounting"
                      : "Self-repair";

                  return (
                    <div
                      key={trackId}
                      className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2"
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className={clsx(
                            "h-2.5 w-2.5 rounded-full",
                            tier === "light" && "bg-amber-300",
                            tier === "medium" && "bg-amber-400",
                            tier === "heavy" && "bg-amber-500"
                          )}
                        />
                        <div>
                          <p className="text-xs font-medium text-slate-800">
                            {label}
                          </p>
                          <p className="text-[11px] text-slate-600">
                            {tierLabel(tier)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-semibold text-slate-800">
                          {track.minutes} min
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </section>

        {/* Per-path progress */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-900">
              Paths overview
            </h2>
            <Link
              href="/apollo/academy/Paths"
              className="text-xs text-slate-500 hover:text-slate-700 underline"
            >
              Open paths view
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {trackSummaries.map((track) => (
              <div
                key={track.id}
                className="rounded-xl border border-slate-200 bg-white/90 px-3 py-3 shadow-sm space-y-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="text-xs font-semibold text-slate-900">
                      {trackLabel(track.id)}
                    </p>
                    <p className="text-[11px] text-slate-600">
                      {track.completed}/{track.total} lessons completed
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-semibold text-slate-900">
                      {track.percent}%
                    </p>
                    <p className="text-[10px] text-slate-500">
                      path progress
                    </p>
                  </div>
                </div>

                <div className="mt-1 h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-emerald-500 transition-all"
                    style={{ width: `${track.percent}%` }}
                  />
                </div>

                <div className="mt-1 flex items-center justify-between text-[10px] text-slate-600">
                  <span>
                    Last study:{" "}
                    {track.lastStudy
                      ? track.lastStudy
                      : "no study recorded yet"}
                  </span>
                  {track.backlogMinutes > 0 && (
                    <span>
                      Backlog: {track.backlogMinutes} min (
                      {tierLabel(track.backlogTier)})
                    </span>
                  )}
                </div>

                <Link
                  href={`/apollo/academy/Paths/${track.id}`}
                  className="mt-2 inline-flex items-center justify-center rounded-full border border-slate-200 px-3 py-1.5 text-[11px] font-medium text-slate-800 hover:bg-slate-50"
                >
                  Go to path
                </Link>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
