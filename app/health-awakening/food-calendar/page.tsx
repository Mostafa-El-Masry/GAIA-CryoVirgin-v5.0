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
  const [selectedExercises, setSelectedExercises] = useState<
    Record<string, string>
  >();
  const [trainingCounts, setTrainingCounts] = useState<Record<string, number>>(
    {}
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
    const d = new Date(2026, 0, 3); // Jan 3, 2026 is a Saturday
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const baseDate = useMemo(() => {
    const d = new Date(startOfWeek);
    d.setDate(d.getDate() + weekOffset * 7);
    return d;
  }, [startOfWeek, weekOffset]);

  const plan = useMemo(() => buildWeekPlan(baseDate), [baseDate]);
  const shellBg = {
    background:
      "radial-gradient(circle at 18% 15%, color-mix(in srgb, var(--gaia-surface-soft) 92%, transparent) 0%, transparent 38%), radial-gradient(circle at 82% 12%, color-mix(in srgb, var(--gaia-overlay) 22%, transparent) 0%, transparent 48%), linear-gradient(180deg, color-mix(in srgb, var(--gaia-surface) 90%, var(--gaia-surface-soft) 10%), color-mix(in srgb, var(--gaia-surface-soft) 82%, transparent 18%))",
  };

  const glassHeader = {
    background: "color-mix(in srgb, var(--gaia-surface) 82%, transparent)",
    borderColor: "color-mix(in srgb, var(--gaia-border) 68%, transparent)",
    boxShadow:
      "0 24px 70px color-mix(in srgb, var(--gaia-overlay) 24%, transparent)",
  };

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
            .map(([k, v]) => [k, v.mealId as string])
        )
      );
      setSelectedExercises(
        Object.fromEntries(
          Object.entries(parsed)
            .filter(([, v]) => v.exerciseId)
            .map(([k, v]) => [k, v.exerciseId as string])
        )
      );
      setPepsiCounts(
        Object.fromEntries(
          Object.entries(parsed).map(([k, v]) => [k, v.pepsi ?? 0])
        )
      );
      setTrainingCounts(
        Object.fromEntries(
          Object.entries(parsed).map(([k, v]) => [k, v.trainingCount ?? 0])
        )
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
    }>
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
        (ex, idx, arr) => arr.findIndex((e) => e.id === ex.id) === idx
      ),
    []
  );

  return (
    <main className="min-h-screen text-base-content" style={shellBg}>
      <div className="mx-auto w-[90vw] px-4 pb-12 pt-8 md:px-6 space-y-8">
        <header
          className="rounded-3xl border p-5 md:p-7 relative overflow-hidden backdrop-blur-2xl"
          style={glassHeader}
        >
          <div className="absolute right-8 top-0 h-36 w-36 rounded-full bg-white/50 blur-3xl" />
          <div className="absolute -left-10 bottom-0 h-24 w-24 rounded-full bg-[#d8b899]/40 blur-3xl" />
          <div className="relative flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-3">
              <p className="text-[11px] uppercase tracking-[0.28em] text-[#5c3b1d]">
                Health Awakening
              </p>
              <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-[#24170d]">
                Food Calendar (beta)
              </h1>
              <p className="text-sm text-[#3a2b20] max-w-2xl">
                Seven-day rotation seeded with real meals you already reach for.
                Calories and cost stay visible so you can keep the Health core
                in sync with what you actually eat.
              </p>
              <div className="flex flex-wrap gap-2 text-[11px]">
                <span className="inline-flex items-center gap-2 rounded-full border border-white/60 bg-white/70 px-3 py-1 font-semibold text-[#5c3b1d] shadow-[0_10px_26px_rgba(110,78,52,0.14)]">
                  <span className="h-2 w-2 rounded-full bg-[#e67a2e] animate-pulse" />
                  Local-first draft
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-white/60 bg-white/60 px-3 py-1 text-[#3a2b20]">
                  Food library: {SEED_FOOD_ITEMS.length} items
                </span>
              </div>
            </div>
            <SidebarPanel
              backHref="/health-awakening"
              focusTitle="Hydration + stable calories"
              focusSubtitle="Use this as a starter; swap meals as you log real intake."
            />
          </div>
        </header>

        <section className="space-y-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#5c3b1d]">
                {weekOffset === 0 ? "This week" : `Week of ${weekStartLabel}`}
              </p>
              <p className="text-sm text-[#3a2b20]">
                {weekStartLabel && weekEndLabel
                  ? `${weekStartLabel} — ${weekEndLabel}`
                  : "Seven-day rotation"}
              </p>
            </div>
            <div className="flex items-center gap-3 text-[11px] text-[#3a2b20]">
              <div className="inline-flex rounded-full border border-white/60 bg-white/60 shadow-[0_8px_20px_rgba(110,78,52,0.12)]">
                <button
                  type="button"
                  className="px-3 py-1.5 font-semibold hover:bg-white/80 transition rounded-l-full"
                  onClick={() => setWeekOffsetSafe(weekOffset - 1)}
                  disabled={weekOffset <= minWeekOffset}
                  style={{
                    opacity: weekOffset <= minWeekOffset ? 0.5 : 1,
                    cursor: weekOffset <= minWeekOffset ? "not-allowed" : "pointer",
                  }}
                >
                  Previous
                </button>
                <button
                  type="button"
                  className="px-3 py-1.5 font-semibold hover:bg-white/80 transition border-l border-white/60"
                  onClick={() => setWeekOffsetSafe(0)}
                  title="Jump to current week"
                >
                  Today
                </button>
                <button
                  type="button"
                  className="px-3 py-1.5 font-semibold hover:bg-white/80 transition rounded-r-full border-l border-white/60"
                  onClick={() => setWeekOffsetSafe(weekOffset + 1)}
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex items-center gap-2">
                <span className="inline-flex h-3 w-3 rounded-full bg-[#e67a2e]" />
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

        <section className="rounded-3xl border border-white/45 bg-white/65 shadow-[0_22px_60px_rgba(110,78,52,0.2)] p-5 md:p-7 space-y-6 backdrop-blur-2xl">
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#5c3b1d]">
                    Food library
                  </p>
                  <h2 className="text-xl font-semibold text-[#24170d]">
                    Your current meals
                  </h2>
                  <p className="text-sm text-[#3a2b20]">
                    These seed meals feed the calendar. Add more later and the
                    rotation adapts.
                  </p>
                </div>
                <div className="rounded-full bg-white/70 px-3 py-1 text-[11px] font-semibold text-[#3a2b20] border border-white/60 shadow-[0_8px_22px_rgba(110,78,52,0.12)]">
                  {SEED_FOOD_ITEMS.length} items saved
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                {SEED_FOOD_ITEMS.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-2xl border border-white/60 bg-white/60 p-4 shadow-[0_14px_36px_rgba(110,78,52,0.14)] backdrop-blur-xl"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-[#24170d]">
                          {item.label}
                        </p>
                        {item.nameAr && (
                          <p className="text-[11px] text-[#3a2b20]">
                            {item.nameAr}
                          </p>
                        )}
                      </div>
                      <span className="rounded-full bg-white/70 px-2 py-0.5 text-[11px] font-semibold text-[#3a2b20] border border-white/60">
                        {item.sourceType === "outside"
                          ? "Outside"
                          : item.sourceType === "home"
                          ? "Home"
                          : "Flexible"}
                      </span>
                    </div>
                    <p className="mt-2 text-[12px] text-[#3a2b20]">
                      {item.defaultServingDescription}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-[#3a2b20]">
                      <span className="inline-flex items-center gap-1 rounded-full border border-white/60 bg-white/70 px-2 py-0.5 font-semibold">
                        {item.kcal} kcal
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-full border border-white/60 bg-white/70 px-2 py-0.5 font-semibold">
                        {formatCurrency(item.price, item.currency)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-white/60 bg-white/60 p-5 shadow-[0_14px_36px_rgba(110,78,52,0.14)] backdrop-blur-xl space-y-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#5c3b1d]">
                Training list
              </p>
              <h3 className="text-lg font-semibold text-[#24170d]">
                Suggested workouts by type
              </h3>
              <div className="grid gap-2 text-sm text-[#3a2b20]">
                {workoutsByTag.map(([tag, w]) => {
                  const sampleMoves = (w.exercises ?? []).slice(0, 2);
                  const tagLabel =
                    WORKOUT_TAG_LABELS[tag as keyof typeof WORKOUT_TAG_LABELS] ??
                    tag;
                  return (
                    <div
                      key={tag}
                      className="rounded-xl border border-white/60 bg-white/70 px-3 py-2 shadow-[0_8px_20px_rgba(110,78,52,0.12)]"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-semibold text-[#24170d]">
                          {tagLabel}
                        </p>
                        <span className="text-[10px] font-semibold text-[#5c3b1d]">
                          {w.level}
                        </span>
                      </div>
                      <p className="text-[11px] font-semibold text-[#3a2b20]">
                        {w.label}
                      </p>
                      <div className="mt-1 text-[11px] text-[#3a2b20] space-y-0.5">
                        {sampleMoves.map((ex) => (
                          <div key={ex.id}>• {ex.name}</div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
              <p className="text-[11px] text-[#3a2b20]">
                Full details live in the Health core. Pair one workout with any meal day to balance energy and recovery.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
