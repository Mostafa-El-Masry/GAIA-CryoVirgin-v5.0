"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { getHealthNow, getKuwaitDayKeyFromIso } from "../lib/clock";
import { getTrainingEntries, saveTrainingEntries } from "../lib/trainingStore";
import type { TrainingEntry } from "../lib/types";

const KUWAIT_TZ = "Asia/Kuwait";
const AGGREGATE_ROUTINE = "aggregate";
const AGGREGATE_EXERCISE = "aggregate";

const weekdayFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: KUWAIT_TZ,
  weekday: "long",
});
const dateFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: KUWAIT_TZ,
  month: "short",
  day: "numeric",
});

type DaySummary = {
  key: string;
  label: string;
  dateLabel: string;
};

type Draft = {
  planned: string;
  actual: string;
};

function dayKeyToUtcDate(dayKey: string): Date {
  const [year, month, day] = dayKey.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

function shiftDayKey(dayKey: string, deltaDays: number): string {
  const date = dayKeyToUtcDate(dayKey);
  date.setUTCDate(date.getUTCDate() + deltaDays);
  return getKuwaitDayKeyFromIso(date.toISOString());
}

function buildWeekDays(startDayKey: string): DaySummary[] {
  const days: DaySummary[] = [];
  for (let i = 0; i < 7; i += 1) {
    const key = shiftDayKey(startDayKey, i);
    const date = dayKeyToUtcDate(key);
    days.push({
      key,
      label: weekdayFormatter.format(date),
      dateLabel: dateFormatter.format(date),
    });
  }
  return days;
}

function parseDraft(value: string): number | null {
  const num = Number.parseFloat(value || "0");
  if (!Number.isFinite(num) || num < 0) return null;
  return num;
}

export default function TrainingCalendarPage() {
  const [weekOffset, setWeekOffset] = useState(0);
  const [entries, setEntries] = useState<TrainingEntry[]>([]);
  const [drafts, setDrafts] = useState<Record<string, Draft>>({});

  const todayKey = useMemo(() => getHealthNow().dayKey, []);
  const weekStartKey = useMemo(
    () => shiftDayKey(todayKey, weekOffset * 7),
    [todayKey, weekOffset],
  );
  const weekDays = useMemo(() => buildWeekDays(weekStartKey), [weekStartKey]);

  useEffect(() => {
    setEntries(getTrainingEntries());
  }, []);

  const aggregateByDay = useMemo(() => {
    const map = new Map<string, { planned: number; actual: number }>();
    for (const entry of entries) {
      if (
        entry.routineId === AGGREGATE_ROUTINE &&
        entry.exerciseId === AGGREGATE_EXERCISE
      ) {
        map.set(entry.day, {
          planned: entry.plannedValue,
          actual: entry.actualValue,
        });
      }
    }
    return map;
  }, [entries]);

  useEffect(() => {
    const next: Record<string, Draft> = {};
    for (const day of weekDays) {
      const saved = aggregateByDay.get(day.key);
      next[day.key] = {
        planned: saved?.planned ? String(saved.planned) : "",
        actual: saved?.actual ? String(saved.actual) : "",
      };
    }
    setDrafts(next);
  }, [weekDays, aggregateByDay]);

  const weekSummary = useMemo(() => {
    let planned = 0;
    let actual = 0;
    for (const day of weekDays) {
      const saved = aggregateByDay.get(day.key);
      if (!saved) continue;
      planned += saved.planned;
      actual += saved.actual;
    }
    const completion =
      planned > 0 ? Math.round((actual / planned) * 100) : null;
    return { planned, actual, completion };
  }, [weekDays, aggregateByDay]);

  const weekRangeLabel =
    weekDays.length > 0
      ? `${weekDays[0].dateLabel} - ${weekDays[weekDays.length - 1].dateLabel}`
      : "";

  const handleSaveDay = (dayKey: string) => {
    const draft = drafts[dayKey];
    if (!draft) return;
    const planned = parseDraft(draft.planned);
    const actual = parseDraft(draft.actual);
    if (planned == null || actual == null) return;

    const nextEntries = entries.filter(
      (entry) =>
        !(
          entry.day === dayKey &&
          entry.routineId === AGGREGATE_ROUTINE &&
          entry.exerciseId === AGGREGATE_EXERCISE
        ),
    );

    nextEntries.push({
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      day: dayKey,
      routineId: AGGREGATE_ROUTINE,
      exerciseId: AGGREGATE_EXERCISE,
      plannedValue: planned,
      actualValue: actual,
    });

    setEntries(nextEntries);
    saveTrainingEntries(nextEntries);
  };

  return (
    <div className="space-y-8 text-[var(--gaia-text-default)]">
      <section className="health-surface relative overflow-hidden p-5 md:p-7">
        <div className="absolute right-8 top-0 h-36 w-36 rounded-full bg-[var(--gaia-contrast-bg)]/10 blur-3xl" />
        <div className="absolute -left-10 bottom-0 h-24 w-24 rounded-full bg-[var(--gaia-info)]/10 blur-3xl" />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-3">
            <p className="text-[11px] uppercase tracking-[0.28em] text-[var(--gaia-text-muted)]">
              Health Awakening
            </p>
            <h1 className="text-3xl font-semibold tracking-tight text-[var(--gaia-text-strong)] md:text-4xl">
              Training Calendar
            </h1>
            <p className="max-w-2xl text-sm gaia-muted">
              Plan and log weekly training volume. Each day saves an aggregate
              planned vs actual total that feeds the Health core.
            </p>
            <div className="flex flex-wrap items-center gap-2 text-[11px]">
              <span className="gaia-chip inline-flex items-center gap-2 rounded-full px-3 py-1 font-semibold">
                <span className="h-2 w-2 rounded-full bg-[var(--gaia-contrast-bg)] animate-pulse" />
                Local-first tracking
              </span>
              <span className="gaia-chip inline-flex items-center gap-2 rounded-full px-3 py-1 font-semibold">
                Week range: {weekRangeLabel || "Loading"}
              </span>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-[11px]">
            <Link
              href="/health"
              className="inline-flex items-center gap-2 rounded-full border gaia-border bg-[var(--gaia-surface)] px-4 py-2 font-semibold text-[var(--gaia-text-strong)] transition hover:bg-[var(--gaia-surface-soft)]"
            >
              Back to Health
            </Link>
            <Link
              href="/health/food-calendar"
              className="inline-flex items-center gap-2 rounded-full border gaia-border bg-[var(--gaia-surface)] px-4 py-2 font-semibold text-[var(--gaia-text-strong)] transition hover:bg-[var(--gaia-surface-soft)]"
            >
              Food calendar
            </Link>
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--gaia-text-muted)]">
              {weekOffset === 0 ? "This week" : `Week of ${weekRangeLabel}`}
            </p>
            <p className="text-sm gaia-muted">
              {weekRangeLabel ? `${weekRangeLabel}` : "Seven-day training view"}
            </p>
          </div>
          <div className="flex items-center gap-3 text-[11px] text-[var(--gaia-text-default)]">
            <div className="inline-flex rounded-full border gaia-border bg-[var(--gaia-surface-soft)]">
              <button
                type="button"
                className="rounded-l-full px-3 py-1.5 font-semibold transition hover:bg-[var(--gaia-surface)]"
                onClick={() => setWeekOffset(weekOffset - 1)}
              >
                Previous
              </button>
              <button
                type="button"
                className="border-l gaia-border px-3 py-1.5 font-semibold transition hover:bg-[var(--gaia-surface)]"
                onClick={() => setWeekOffset(0)}
                title="Jump to current week"
              >
                Today
              </button>
              <button
                type="button"
                className="rounded-r-full border-l gaia-border px-3 py-1.5 font-semibold transition hover:bg-[var(--gaia-surface)]"
                onClick={() => setWeekOffset(weekOffset + 1)}
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex items-center gap-2">
              <span className="inline-flex h-3 w-3 rounded-full bg-[var(--gaia-contrast-bg)]" />
              Planned training
            </div>
          </div>
        </div>

        <div className="health-surface-soft rounded-2xl border gaia-border p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--gaia-text-muted)]">
                Weekly summary
              </p>
              <p className="text-sm gaia-muted">
                Planned {weekSummary.planned} units, actual {weekSummary.actual}{" "}
                units
              </p>
            </div>
            <div className="rounded-full border gaia-border bg-[var(--gaia-surface)] px-4 py-2 text-xs font-semibold text-[var(--gaia-text-strong)]">
              {weekSummary.completion != null
                ? `${weekSummary.completion}% complete`
                : "No plan yet"}
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
          {weekDays.map((day) => {
            const saved = aggregateByDay.get(day.key);
            const completionLabel =
              saved && saved.planned > 0
                ? `${Math.round((saved.actual / saved.planned) * 100)}%`
                : "--";
            const draft = drafts[day.key] ?? { planned: "", actual: "" };
            const isToday = day.key === todayKey;
            return (
              <div
                key={day.key}
                className={`health-surface-soft space-y-3 p-4 ${
                  isToday ? "ring-1 ring-[var(--gaia-contrast-bg)]/60" : ""
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--gaia-text-muted)]">
                      {day.key}
                    </p>
                    <h2 className="text-lg font-semibold text-[var(--gaia-text-strong)]">
                      {day.label}
                    </h2>
                    <p className="text-[11px] gaia-muted">{day.dateLabel}</p>
                  </div>
                  <div className="text-right space-y-1">
                    <p className="text-[11px] gaia-muted">Completion</p>
                    <p className="text-sm font-semibold text-[var(--gaia-text-strong)]">
                      {completionLabel}
                    </p>
                  </div>
                </div>

                <div className="rounded-xl border gaia-border bg-[var(--gaia-surface)] p-3 space-y-2">
                  <div className="space-y-1">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--gaia-text-muted)]">
                      Planned
                    </p>
                    <input
                      type="number"
                      min={0}
                      value={draft.planned}
                      onChange={(e) =>
                        setDrafts((prev) => ({
                          ...prev,
                          [day.key]: {
                            ...(prev[day.key] ?? { planned: "", actual: "" }),
                            planned: e.target.value,
                          },
                        }))
                      }
                      className="gaia-input gaia-focus w-full rounded-lg px-2 py-2 text-[12px]"
                      placeholder="0"
                    />
                  </div>

                  <div className="space-y-1">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--gaia-text-muted)]">
                      Actual
                    </p>
                    <input
                      type="number"
                      min={0}
                      value={draft.actual}
                      onChange={(e) =>
                        setDrafts((prev) => ({
                          ...prev,
                          [day.key]: {
                            ...(prev[day.key] ?? { planned: "", actual: "" }),
                            actual: e.target.value,
                          },
                        }))
                      }
                      className="gaia-input gaia-focus w-full rounded-lg px-2 py-2 text-[12px]"
                      placeholder="0"
                    />
                  </div>

                  <button
                    type="button"
                    className="health-button w-full px-3 py-2 text-xs font-semibold uppercase tracking-[0.08em]"
                    onClick={() => handleSaveDay(day.key)}
                  >
                    Save training
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
