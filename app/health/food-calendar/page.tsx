/* eslint-disable react/no-unescaped-entities */
"use client";

import { useEffect, useMemo, useState } from "react";
import { SEED_FOOD_ITEMS } from "../lib/foodLibrary";
import { CalendarGrid } from "./components/CalendarGrid";
import { SidebarPanel } from "./components/SidebarPanel";
import { buildWeekPlan, formatCurrency } from "./planLadder";
import {
  WORKOUT_LIBRARY,
  WORKOUT_TAG_LABELS,
  type WorkoutExercise,
} from "../lib/workoutLibrary";
import { supabase } from "../lib/supabaseClient";
export default function FoodCalendarPage() {
  const [weekOffset, setWeekOffset] = useState(0);
  const minWeekOffset = 0; // Do not show weeks before Jan 1, 2026 anchor window
  const [pepsiCounts, setPepsiCounts] = useState<Record<string, number>>({});
  const [selectedMeals, setSelectedMeals] = useState<Record<string, string>>();
  const [selectedExercises, setSelectedExercises] =
    useState<Record<string, string>>();
  const [trainingCounts, setTrainingCounts] = useState<Record<string, number>>(
    {},
  );
  const [storedSelections, setStoredSelections] = useState<
    Record<
      string,
      {
        mealId?: string;
        exerciseId?: string;
        pepsi?: number;
        trainingCount?: number;
      }
    >
  >({});

  const startOfWeek = useMemo(() => {
    const d = new Date(2026, 0, 1); // Jan 1, 2026 anchor
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const baseDate = useMemo(() => {
    const d = new Date(startOfWeek);
    d.setDate(d.getDate() + weekOffset * 7);
    return d;
  }, [startOfWeek, weekOffset]);

  const plan = useMemo(() => buildWeekPlan(baseDate), [baseDate]);
  const weekStartLabel = plan[0]
    ? new Date(`${plan[0].iso}T00:00:00`).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })
    : "";
  const weekEndLabel = plan[6]
    ? new Date(`${plan[6].iso}T00:00:00`).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })
    : "";

  const setWeekOffsetSafe = (next: number) => {
    setWeekOffset(Math.max(minWeekOffset, next));
  };

  const workoutsByTag = useMemo(() => {
    const byTag: Record<string, (typeof WORKOUT_LIBRARY)[number]> = {};
    for (const w of WORKOUT_LIBRARY) {
      if (!byTag[w.tag]) byTag[w.tag] = w;
    }
    return Object.entries(byTag);
  }, []);

  const STORAGE_KEY = "gaia-food-calendar-selections";

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as Record<
        string,
        {
          mealId?: string;
          exerciseId?: string;
          pepsi?: number;
          trainingCount?: number;
        }
      >;
      setStoredSelections(parsed);
      setSelectedMeals(
        Object.fromEntries(
          Object.entries(parsed)
            .filter(([, v]) => v.mealId)
            .map(([k, v]) => [k, v.mealId as string]),
        ),
      );
      setSelectedExercises(
        Object.fromEntries(
          Object.entries(parsed)
            .filter(([, v]) => v.exerciseId)
            .map(([k, v]) => [k, v.exerciseId as string]),
        ),
      );
      setPepsiCounts(
        Object.fromEntries(
          Object.entries(parsed).map(([k, v]) => [k, v.pepsi ?? 0]),
        ),
      );
      setTrainingCounts(
        Object.fromEntries(
          Object.entries(parsed).map(([k, v]) => [k, v.trainingCount ?? 0]),
        ),
      );
    } catch (err) {
      console.warn("Failed to load stored selections", err);
    }
  }, []);

  const persistSelection = (
    iso: string,
    patch: Partial<{
      mealId?: string;
      exerciseId?: string;
      pepsi?: number;
      trainingCount?: number;
    }>,
  ) => {
    setStoredSelections((prev) => {
      const current = prev[iso] ?? {};
      const nextEntry = { ...current, ...patch };
      const nextAll = { ...prev, [iso]: nextEntry };
      if (typeof window !== "undefined") {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextAll));
      }
      if (supabase) {
        supabase
          .from("health_food_calendar")
          .upsert({
            day: iso,
            meal_id: nextEntry.mealId ?? null,
            exercise_id: nextEntry.exerciseId ?? null,
            pepsi_count: nextEntry.pepsi ?? 0,
            training_count: nextEntry.trainingCount ?? 0,
            updated_at: new Date().toISOString(),
          })
          .then((res) => {
            if (res?.error) {
              console.warn("Supabase food calendar upsert failed", res.error);
            }
          });
      }
      return nextAll;
    });
  };

  const handlePepsiChange = (iso: string, next: number) => {
    const clamped = Math.min(5, Math.max(0, next));
    setPepsiCounts((prev) => ({
      ...prev,
      [iso]: clamped,
    }));
    persistSelection(iso, { pepsi: clamped });
  };

  const handleMealChange = (iso: string, mealId: string) => {
    setSelectedMeals((prev) => ({ ...(prev ?? {}), [iso]: mealId }));
    persistSelection(iso, { mealId });
  };

  const handleExerciseChange = (iso: string, exerciseId: string) => {
    setSelectedExercises((prev) => ({ ...(prev ?? {}), [iso]: exerciseId }));
    persistSelection(iso, { exerciseId });
  };

  const handleTrainingCountChange = (iso: string, count: number) => {
    const safeCount = Math.max(0, Math.min(20, count));
    setTrainingCounts((prev) => ({ ...prev, [iso]: safeCount }));
    persistSelection(iso, { trainingCount: safeCount });
  };

  const exerciseOptions: WorkoutExercise[] = useMemo(
    () =>
      WORKOUT_LIBRARY.flatMap((w) => w.exercises).filter(
        (ex, idx, arr) => arr.findIndex((e) => e.id === ex.id) === idx,
      ),
    [],
  );

  return (
    <div className="space-y-8 text-[var(--gaia-text-default)]">
      <div className="space-y-8">
        <section className="health-surface relative overflow-hidden p-5 md:p-7">
          <div className="absolute right-8 top-0 h-36 w-36 rounded-full bg-[var(--gaia-contrast-bg)]/10 blur-3xl" />
          <div className="absolute -left-10 bottom-0 h-24 w-24 rounded-full bg-[var(--gaia-info)]/10 blur-3xl" />
          <div className="relative flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-3">
              <p className="text-[11px] uppercase tracking-[0.28em] text-[var(--gaia-text-muted)]">
                Health Awakening
              </p>
              <h1 className="text-3xl font-semibold tracking-tight text-[var(--gaia-text-strong)] md:text-4xl">
                Food Calendar (beta)
              </h1>
              <p className="max-w-2xl text-sm gaia-muted">
                Seven-day rotation seeded with real meals you already reach for.
                Calories and cost stay visible so you can keep the Health core
                in sync with what you actually eat.
              </p>
              <div className="flex flex-wrap gap-2 text-[11px]">
                <span className="gaia-chip inline-flex items-center gap-2 rounded-full px-3 py-1 font-semibold">
                  <span className="h-2 w-2 rounded-full bg-[var(--gaia-contrast-bg)] animate-pulse" />
                  Local-first draft
                </span>
                <span className="gaia-chip inline-flex items-center gap-2 rounded-full px-3 py-1 font-semibold">
                  Food library: {SEED_FOOD_ITEMS.length} items
                </span>
              </div>
            </div>
            <SidebarPanel
              backHref="/health"
              focusTitle="Hydration + stable calories"
              focusSubtitle="Use this as a starter; swap meals as you log real intake."
            />
          </div>
        </section>

        <section className="space-y-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--gaia-text-muted)]">
                {weekOffset === 0 ? "This week" : `Week of ${weekStartLabel}`}
              </p>
              <p className="text-sm gaia-muted">
                {weekStartLabel && weekEndLabel
                  ? `${weekStartLabel} — ${weekEndLabel}`
                  : "Seven-day rotation"}
              </p>
            </div>
            <div className="flex items-center gap-3 text-[11px] text-[var(--gaia-text-default)]">
              <div className="inline-flex rounded-full border gaia-border bg-[var(--gaia-surface-soft)]">
                <button
                  type="button"
                  className="rounded-l-full px-3 py-1.5 font-semibold transition hover:bg-[var(--gaia-surface)]"
                  onClick={() => setWeekOffsetSafe(weekOffset - 1)}
                  disabled={weekOffset <= minWeekOffset}
                  style={{
                    opacity: weekOffset <= minWeekOffset ? 0.5 : 1,
                    cursor:
                      weekOffset <= minWeekOffset ? "not-allowed" : "pointer",
                  }}
                >
                  Previous
                </button>
                <button
                  type="button"
                  className="border-l gaia-border px-3 py-1.5 font-semibold transition hover:bg-[var(--gaia-surface)]"
                  onClick={() => setWeekOffsetSafe(0)}
                  title="Jump to current week"
                >
                  Today
                </button>
                <button
                  type="button"
                  className="rounded-r-full border-l gaia-border px-3 py-1.5 font-semibold transition hover:bg-[var(--gaia-surface)]"
                  onClick={() => setWeekOffsetSafe(weekOffset + 1)}
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex items-center gap-2">
                <span className="inline-flex h-3 w-3 rounded-full bg-[var(--gaia-contrast-bg)]" />
                Planned meal slot
              </div>
            </div>
          </div>

          <CalendarGrid
            plan={plan}
            pepsiCounts={pepsiCounts}
            onPepsiChange={handlePepsiChange}
            selectedMeals={selectedMeals}
            onMealChange={handleMealChange}
            selectedExercises={selectedExercises}
            onExerciseChange={handleExerciseChange}
            trainingCounts={trainingCounts}
            onTrainingCountChange={handleTrainingCountChange}
            foodOptions={SEED_FOOD_ITEMS}
            exerciseOptions={exerciseOptions}
          />
        </section>

        <section className="health-surface space-y-6 p-5 md:p-7">
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--gaia-text-muted)]">
                    Food library
                  </p>
                  <h2 className="text-xl font-semibold text-[var(--gaia-text-strong)]">
                    Your current meals
                  </h2>
                  <p className="text-sm gaia-muted">
                    These seed meals feed the calendar. Add more later and the
                    rotation adapts.
                  </p>
                </div>
                <div className="rounded-full border gaia-border bg-[var(--gaia-surface-soft)] px-3 py-1 text-[11px] font-semibold text-[var(--gaia-text-default)]">
                  {SEED_FOOD_ITEMS.length} items saved
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                {SEED_FOOD_ITEMS.map((item) => (
                  <div key={item.id} className="health-surface-soft p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-[var(--gaia-text-strong)]">
                          {item.label}
                        </p>
                        {item.nameAr && (
                          <p className="text-[11px] gaia-muted">
                            {item.nameAr}
                          </p>
                        )}
                      </div>
                      <span className="rounded-full border gaia-border bg-[var(--gaia-surface)] px-2 py-0.5 text-[11px] font-semibold text-[var(--gaia-text-default)]">
                        {item.sourceType === "outside"
                          ? "Outside"
                          : item.sourceType === "home"
                            ? "Home"
                            : "Flexible"}
                      </span>
                    </div>
                    <p className="mt-2 text-[12px] gaia-muted">
                      {item.defaultServingDescription}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-[var(--gaia-text-default)]">
                      <span className="inline-flex items-center gap-1 rounded-full border gaia-border bg-[var(--gaia-surface)] px-2 py-0.5 font-semibold">
                        {item.kcal} kcal
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-full border gaia-border bg-[var(--gaia-surface)] px-2 py-0.5 font-semibold">
                        {formatCurrency(item.price, item.currency)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="health-surface-soft space-y-3 p-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--gaia-text-muted)]">
                Training list
              </p>
              <h3 className="text-lg font-semibold text-[var(--gaia-text-strong)]">
                Suggested workouts by type
              </h3>
              <div className="grid gap-2 text-sm text-[var(--gaia-text-default)]">
                {workoutsByTag.map(([tag, w]) => {
                  const sampleMoves = (w.exercises ?? []).slice(0, 2);
                  const tagLabel =
                    WORKOUT_TAG_LABELS[
                      tag as keyof typeof WORKOUT_TAG_LABELS
                    ] ?? tag;
                  return (
                    <div
                      key={tag}
                      className="rounded-xl border gaia-border bg-[var(--gaia-surface)] px-3 py-2"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-semibold text-[var(--gaia-text-strong)]">
                          {tagLabel}
                        </p>
                        <span className="text-[10px] font-semibold text-[var(--gaia-text-muted)]">
                          {w.level}
                        </span>
                      </div>
                      <p className="text-[11px] font-semibold text-[var(--gaia-text-default)]">
                        {w.label}
                      </p>
                      <div className="mt-1 space-y-0.5 text-[11px] gaia-muted">
                        {sampleMoves.map((ex) => (
                          <div key={ex.id}>• {ex.name}</div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
              <p className="text-[11px] gaia-muted">
                Full details live in the Health core. Pair one workout with any
                meal day to balance energy and recovery.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
