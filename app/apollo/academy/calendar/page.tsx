"use client";

import Link from "next/link";
import { useMemo } from "react";
import type { TrackId } from "../lessonsMap";
import { useAcademyProgress } from "../useAcademyProgress";

const DAY_HEADERS: { label: string; jsDay: number }[] = [
  { label: "SUN", jsDay: 0 },
  { label: "MON", jsDay: 1 },
  { label: "TUE", jsDay: 2 },
  { label: "WED", jsDay: 3 },
  { label: "THU", jsDay: 4 },
  { label: "FRI", jsDay: 5 },
  { label: "SAT", jsDay: 6 },
];

const SCHEDULE_START_ISO = "2025-12-01";
const BASE_MINUTES_PER_STUDY_DAY = 30;
const TRACK_CYCLE: TrackId[] = ["programming", "accounting", "self-repair"];

const TRACK_STYLES: Record<
  TrackId,
  { bg: string; dot: string; label: string }
> = {
  programming: {
    bg: "#e8e9fa",
    dot: "#5b5fdd",
    label: "Web Programming",
  },
  accounting: { bg: "#ffe9d9", dot: "#f27f0c", label: "Accounting" },
  "self-repair": { bg: "#e4f3ea", dot: "#4f9f7b", label: "Self-Repair" },
};

type DayCell = {
  date: Date;
  dayNum: number;
  schedule: { trackId: TrackId; minutes: number };
  iso: string;
};

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

function monthsSinceScheduleStart(date: Date): number {
  const start = createDateFromIso(SCHEDULE_START_ISO);
  const startTotalMonths = start.getFullYear() * 12 + start.getMonth();
  const dateTotalMonths = date.getFullYear() * 12 + date.getMonth();
  const diff = dateTotalMonths - startTotalMonths;
  return diff < 0 ? 0 : diff;
}

function computeDaysPerWeekForWeek(weekStart: Date): number {
  const months = monthsSinceScheduleStart(weekStart);
  const daysPerWeek = 1 + months;
  if (daysPerWeek < 1) return 1;
  if (daysPerWeek > 7) return 7;
  return daysPerWeek;
}

function getWeekStart(date: Date): Date {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  const day = copy.getDay();
  const offsetToMonday = (day + 6) % 7;
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
  if (trackId === "self-repair") {
    return [5, 1, 3, 2, 4, 0, 6];
  }
  return [1, 2, 3, 4, 0, 6, 5];
}

function getScheduleForDate(
  date: Date
): { trackId: TrackId; minutes: number } {
  const scheduleStart = createDateFromIso(SCHEDULE_START_ISO);
  scheduleStart.setHours(0, 0, 0, 0);

  const target = new Date(date);
  target.setHours(0, 0, 0, 0);

  if (target < scheduleStart) {
    return { trackId: "programming", minutes: 0 };
  }

  const weekStart = getWeekStart(target);
  const weekIndexSinceStart = weeksBetween(SCHEDULE_START_ISO, weekStart);
  const trackId =
    TRACK_CYCLE[weekIndexSinceStart % TRACK_CYCLE.length] ?? "programming";

  const daysPerWeek = computeDaysPerWeekForWeek(weekStart);

  const candidateDays: { iso: string; dayOfWeek: number }[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    d.setHours(0, 0, 0, 0);
    candidateDays.push({ iso: isoFromDate(d), dayOfWeek: d.getDay() });
  }

  const preferredOrder = preferredDayOrderForTrack(trackId);
  const studyIsos: string[] = [];
  for (const dayOfWeek of preferredOrder) {
    if (studyIsos.length >= daysPerWeek) break;
    const candidate = candidateDays.find((c) => c.dayOfWeek === dayOfWeek);
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

function trackLabel(trackId: TrackId): string {
  if (trackId === "programming") return "Web Programming";
  if (trackId === "accounting") return "Accounting";
  return "Self-Repair";
}

export default function AcademyMonthlyCalendarPage() {
  const { state } = useAcademyProgress();
  const today = useMemo(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return now;
  }, []);

  const isoToday = isoFromDate(today);

  const year = today.getFullYear();
  const month = today.getMonth(); // 0-based
  const monthStart = new Date(year, month, 1);
  const nextMonthStart = new Date(year, month + 1, 1);
  const daysInMonth = Math.round(
    (Number(nextMonthStart) - Number(monthStart)) / (1000 * 60 * 60 * 24)
  );

  const firstJsDay = monthStart.getDay(); // 0 Sun ... 6 Sat
  const leadEmpty = DAY_HEADERS.findIndex((h) => h.jsDay === firstJsDay);

  const dayCells: DayCell[] = [];
  for (let i = 0; i < daysInMonth; i++) {
    const d = new Date(year, month, i + 1);
    d.setHours(0, 0, 0, 0);
    const schedule = getScheduleForDate(d);
    const iso = isoFromDate(d);
    dayCells.push({
      date: d,
      dayNum: i + 1,
      schedule,
      iso,
    });
  }

  const paddedCells: (DayCell | null)[] = [
    ...Array(Math.max(0, leadEmpty)).fill(null),
    ...dayCells,
  ];
  while (paddedCells.length % 7 !== 0) {
    paddedCells.push(null);
  }

  const monthName = today.toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });

  // Allocate completed credits from study history to the earliest pending study days.
  const historyCountByTrack: Record<TrackId, number> = {
    programming:
      state.byTrack.programming?.studyHistory?.filter((d) => d <= isoToday)
        .length ?? 0,
    accounting:
      state.byTrack.accounting?.studyHistory?.filter((d) => d <= isoToday)
        .length ?? 0,
    "self-repair":
      state.byTrack["self-repair"]?.studyHistory?.filter((d) => d <= isoToday)
        .length ?? 0,
  };

  const studyDaysByTrack: Record<TrackId, string[]> = {
    programming: [],
    accounting: [],
    "self-repair": [],
  };

  for (const cell of dayCells) {
    if (cell.schedule.minutes <= 0) continue;
    if (cell.iso > isoToday) continue;
    studyDaysByTrack[cell.schedule.trackId].push(cell.iso);
  }

  const completedByTrack: Record<TrackId, Set<string>> = {
    programming: new Set(),
    accounting: new Set(),
    "self-repair": new Set(),
  };

  (Object.keys(studyDaysByTrack) as TrackId[]).forEach((trackId) => {
    const ordered = studyDaysByTrack[trackId].slice().sort();
    let credits = historyCountByTrack[trackId] ?? 0;
    for (const iso of ordered) {
      if (credits <= 0) break;
      completedByTrack[trackId].add(iso);
      credits -= 1;
    }
  });

  const infoRows = [
    { color: TRACK_STYLES.programming.bg, label: "Web Programming" },
    { color: TRACK_STYLES.accounting.bg, label: "Accounting" },
    { color: TRACK_STYLES["self-repair"].bg, label: "Self-Repair" },
    { color: "#f3f4f6", label: "Rest day" },
    { color: "#fde68a", label: "Backlog pending" },
    { color: "#d9f99d", label: "Completed" },
  ];

  return (
    <div className="min-h-screen bg-[#f7f3ec] py-10">
      <main className="mx-auto w-full max-w-[1200px] xl:max-w-none px-4 sm:px-6 space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">
              Monthly Plan
            </p>
            <h1 className="mt-1 text-3xl sm:text-4xl font-semibold text-slate-900">
              {monthName}
            </h1>
            <p className="text-sm text-slate-600">
              Study cadence by day, with your rotated tracks.
            </p>
          </div>
          <Link
            href="/apollo/academy"
            className="text-xs font-semibold text-slate-700 underline underline-offset-4"
          >
            Back to Academy →
          </Link>
        </div>

        <section className="grid gap-6 lg:grid-cols-[1fr,260px]">
          <div className="rounded-3xl border border-slate-200 bg-white shadow-[0_10px_30px_rgba(15,23,42,0.08)] p-4 sm:p-6">
            <div className="grid grid-cols-7 gap-2 text-center text-[11px] font-semibold text-slate-500 mb-3">
              {DAY_HEADERS.map((h) => (
                <div key={h.label} className="tracking-wide">
                  {h.label}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-2 text-xs">
              {paddedCells.map((cell, idx) => {
                if (!cell) {
                  return (
                    <div
                      key={`empty-${idx}`}
                      className="h-20 rounded-2xl border border-dashed border-slate-100 bg-slate-50"
                    />
                  );
                }

                const isToday =
                  cell.date.getFullYear() === today.getFullYear() &&
                  cell.date.getMonth() === today.getMonth() &&
                  cell.date.getDate() === today.getDate();

                const study = cell.schedule.minutes > 0;
                const style = study ? TRACK_STYLES[cell.schedule.trackId] : null;

                const isDone = completedByTrack[cell.schedule.trackId]?.has(
                  cell.iso
                );
                const isBacklog = study && cell.iso < isoToday && !isDone;

                const baseBg = study
                  ? style?.bg ?? "#f7f7f7"
                  : "#f9fafb";
                const statusBg = isDone
                  ? "#d9f99d"
                  : isBacklog
                  ? "#fde68a"
                  : baseBg;
                const statusBorder = isDone
                  ? "#84cc16"
                  : isBacklog
                  ? "#f59e0b"
                  : style?.dot ?? "#e5e7eb";

                return (
                  <div
                    key={cell.dayNum}
                    className="h-32 rounded-2xl border shadow-[0_8px_18px_rgba(15,23,42,0.06)] p-3 flex flex-col justify-between"
                    style={{
                      backgroundColor: statusBg,
                      borderColor: statusBorder,
                    }}
                  >
                    <div className="flex items-center justify-between text-[11px] font-semibold text-slate-800">
                      <span>{cell.dayNum}</span>
                      {isToday && (
                        <span className="rounded-full bg-slate-900 text-white px-2 py-0.5 text-[9px]">
                          Today
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-slate-700 leading-tight space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-slate-600">
                          {cell.date.toLocaleDateString(undefined, {
                            weekday: "short",
                          })}
                        </span>
                        {study ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-white/70 px-2 py-0.5 text-[9px] font-semibold text-slate-700">
                            <span
                              className="h-2 w-2 rounded-full"
                              style={{ backgroundColor: style?.dot }}
                            />
                            {cell.schedule.minutes} min
                          </span>
                        ) : (
                          <span className="text-[9px] font-medium text-slate-500">
                            Rest
                          </span>
                        )}
                      </div>
                      {study && (
                        <p className="text-[10px] font-semibold text-slate-800">
                          {trackLabel(cell.schedule.trackId)}
                        </p>
                      )}
                      {isDone && (
                        <p className="text-[10px] font-semibold text-lime-700">
                          Completed
                        </p>
                      )}
                      {isBacklog && (
                        <p className="text-[10px] font-semibold text-amber-700">
                          Backlog pending
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <aside className="rounded-3xl border border-slate-200 bg-white shadow-[0_10px_30px_rgba(15,23,42,0.08)] p-5 space-y-4">
            <h2 className="text-sm font-semibold text-slate-900">
              Track legend
            </h2>
            <div className="space-y-2 text-xs text-slate-700">
              {infoRows.map((row) => (
                <div key={row.label} className="flex items-center gap-2">
                  <span
                    className="h-3 w-5 rounded-full border border-white shadow-sm"
                    style={{ backgroundColor: row.color }}
                  />
                  <span>{row.label}</span>
                </div>
              ))}
            </div>
            <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4 text-xs text-slate-700 space-y-2">
              <p className="font-semibold text-slate-900">How it works</p>
              <p>
                The calendar mirrors your stepped schedule: 30 minutes on study
                days, cycling Programming → Accounting → Self-Repair each week,
                with a rest-day mix that grows monthly.
              </p>
              <p className="text-slate-500">
                Starts Dec 1, 2025. Study cards stay pastel and light to keep
                focus clear.
              </p>
            </div>
          </aside>
        </section>
      </main>
    </div>
  );
}
