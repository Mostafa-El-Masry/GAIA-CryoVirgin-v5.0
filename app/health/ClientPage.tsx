"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import TodayView from "./components/TodayView";
import HistoryList from "./components/HistoryList";
import { getHealthNow, chooseSleepDayKey } from "./lib/clock";
import { buildMockHealthHistory } from "./lib/mockData";
import type {
  HealthDaySnapshot,
  SleepSession,
  WaterEntry,
  WaterContainer,
  WalkSession,
  TrainingEntry,
  DailyMood,
} from "./lib/types";
import {
  getStoredSleepSessions,
  saveStoredSleepSessions,
  getActiveSleep,
  setActiveSleep,
  clearActiveSleep,
} from "./lib/sleepStore";
import {
  getWaterContainers,
  saveWaterContainers,
  getWaterEntries,
  saveWaterEntries,
} from "./lib/waterStore";
import {
  getWalkSessions,
  saveWalkSessions,
  getActiveWalk,
  setActiveWalk,
  clearActiveWalk,
} from "./lib/walkStore";
import { getTrainingEntries, saveTrainingEntries } from "./lib/trainingStore";
import { getDailyMoods, saveDailyMoods } from "./lib/moodStore";
import {
  hasSupabaseConfig,
  fetchRemoteHealthAll,
  pushRemoteHealthAll,
} from "./lib/remoteHealth";

function applySleepToHistory(
  base: HealthDaySnapshot[],
  sessions: SleepSession[],
): HealthDaySnapshot[] {
  const byDay = new Map<string, number>();

  for (const session of sessions) {
    const prev = byDay.get(session.day) ?? 0;
    byDay.set(session.day, prev + session.durationMinutes);
  }

  return base.map((day) => {
    const override = byDay.get(day.day);
    if (override == null) return day;
    return {
      ...day,
      sleepMinutes: override,
    };
  });
}

function applyWaterToHistory(
  base: HealthDaySnapshot[],
  entries: WaterEntry[],
): HealthDaySnapshot[] {
  const byDay = new Map<string, number>();

  for (const entry of entries) {
    const prev = byDay.get(entry.day) ?? 0;
    byDay.set(entry.day, prev + entry.totalMl);
  }

  return base.map((day) => {
    const override = byDay.get(day.day);
    if (override == null) return day;
    return {
      ...day,
      waterMl: override,
    };
  });
}

function applyWalkToHistory(
  base: HealthDaySnapshot[],
  sessions: WalkSession[],
): HealthDaySnapshot[] {
  const byDay = new Map<string, number>();

  for (const session of sessions) {
    const prev = byDay.get(session.day) ?? 0;
    byDay.set(session.day, prev + session.durationMinutes);
  }

  return base.map((day) => {
    const override = byDay.get(day.day);
    if (override == null) return day;
    return {
      ...day,
      walkMinutes: override,
    };
  });
}

function applyTrainingToHistory(
  base: HealthDaySnapshot[],
  entries: TrainingEntry[],
): HealthDaySnapshot[] {
  const byDay = new Map<string, { planned: number; actual: number }>();

  for (const entry of entries) {
    const bucket = byDay.get(entry.day) ?? { planned: 0, actual: 0 };
    bucket.planned += entry.plannedValue;
    bucket.actual += entry.actualValue;
    byDay.set(entry.day, bucket);
  }

  return base.map((day) => {
    const bucket = byDay.get(day.day);
    if (!bucket || bucket.planned <= 0) {
      return {
        ...day,
        trainingCompletionPercent: null,
      };
    }
    const pct = Math.max(
      0,
      Math.min(200, (bucket.actual / bucket.planned) * 100),
    );
    return {
      ...day,
      trainingCompletionPercent: pct,
    };
  });
}

function applyMoodToHistory(
  base: HealthDaySnapshot[],
  moods: DailyMood[],
): HealthDaySnapshot[] {
  const byDay = new Map<string, DailyMood>();
  for (const mood of moods) {
    byDay.set(mood.day, mood);
  }

  return base.map((day) => {
    const mood = byDay.get(day.day);
    if (!mood) return day;
    return {
      ...day,
      moodRating: mood.rating,
      moodNote: mood.note,
    };
  });
}

function mergeById<T extends { id: string }>(
  localArr: T[],
  remoteArr: T[],
): T[] {
  const byId = new Map<string, T>();
  for (const item of localArr) {
    byId.set(item.id, item);
  }
  for (const item of remoteArr) {
    byId.set(item.id, item);
  }
  return Array.from(byId.values());
}

function mergeMoodByDay(
  localArr: DailyMood[],
  remoteArr: DailyMood[],
): DailyMood[] {
  const byDay = new Map<string, DailyMood>();
  for (const m of localArr) {
    byDay.set(m.day, m);
  }
  for (const m of remoteArr) {
    byDay.set(m.day, m);
  }
  return Array.from(byDay.values());
}

export default function HealthAwakeningClientPage() {
  const [nowDisplay, setNowDisplay] = useState<string>("");
  const [todayKey, setTodayKey] = useState<string>("");
  const [history, setHistory] = useState<HealthDaySnapshot[]>([]);
  const [sleepSessions, setSleepSessions] = useState<SleepSession[]>([]);
  const [isSleeping, setIsSleeping] = useState<boolean>(false);
  const [waterEntries, setWaterEntries] = useState<WaterEntry[]>([]);
  const [waterContainers, setWaterContainers] = useState<WaterContainer[]>([]);
  const [walkSessions, setWalkSessions] = useState<WalkSession[]>([]);
  const [isWalking, setIsWalking] = useState<boolean>(false);
  const [trainingEntries, setTrainingEntries] = useState<TrainingEntry[]>([]);
  const [dailyMoods, setDailyMoods] = useState<DailyMood[]>([]);
  const [storageStatus, setStorageStatus] =
    useState<string>("Local cache only");

  useEffect(() => {
    const updateClock = () => {
      const now = getHealthNow();
      setNowDisplay(`${now.displayTime} · ${now.dayKey} (Asia/Kuwait)`);
      setTodayKey(now.dayKey);
    };

    const boot = () => {
      const now = getHealthNow();
      setNowDisplay(`${now.displayTime} · ${now.dayKey} (Asia/Kuwait)`);
      setTodayKey(now.dayKey);

      const base = buildMockHealthHistory(now.dayKey);

      const storedSleep = getStoredSleepSessions();
      const activeSleep = getActiveSleep();
      setSleepSessions(storedSleep);
      setIsSleeping(Boolean(activeSleep));

      const containers = getWaterContainers();
      const entries = getWaterEntries();
      setWaterContainers(containers);
      setWaterEntries(entries);

      const storedWalk = getWalkSessions();
      const activeWalk = getActiveWalk();
      setWalkSessions(storedWalk);
      setIsWalking(Boolean(activeWalk));

      const storedTraining = getTrainingEntries();
      setTrainingEntries(storedTraining);

      const storedMoods = getDailyMoods();
      setDailyMoods(storedMoods);

      let shaped = applySleepToHistory(base, storedSleep);
      shaped = applyWaterToHistory(shaped, entries);
      shaped = applyWalkToHistory(shaped, storedWalk);
      shaped = applyTrainingToHistory(shaped, storedTraining);
      shaped = applyMoodToHistory(shaped, storedMoods);

      setHistory(shaped);

      if (hasSupabaseConfig()) {
        setStorageStatus("Syncing with Supabase...");
        fetchRemoteHealthAll()
          .then((remote) => {
            if (!remote) {
              setStorageStatus("Local cache · Supabase unreachable");
              return;
            }

            const mergedSleep = mergeById(storedSleep, remote.sleepSessions);
            const mergedWater = mergeById(entries, remote.waterEntries);
            const mergedWalk = mergeById(storedWalk, remote.walkSessions);
            const mergedTraining = mergeById(
              storedTraining,
              remote.trainingEntries,
            );
            const mergedMoods = mergeMoodByDay(storedMoods, remote.moods);

            setSleepSessions(mergedSleep);
            setWaterEntries(mergedWater);
            setWalkSessions(mergedWalk);
            setTrainingEntries(mergedTraining);
            setDailyMoods(mergedMoods);

            saveStoredSleepSessions(mergedSleep);
            saveWaterEntries(mergedWater);
            saveWalkSessions(mergedWalk);
            saveTrainingEntries(mergedTraining);
            saveDailyMoods(mergedMoods);

            let h = buildMockHealthHistory(now.dayKey);
            h = applySleepToHistory(h, mergedSleep);
            h = applyWaterToHistory(h, mergedWater);
            h = applyWalkToHistory(h, mergedWalk);
            h = applyTrainingToHistory(h, mergedTraining);
            h = applyMoodToHistory(h, mergedMoods);
            setHistory(h);

            return pushRemoteHealthAll({
              sleepSessions: mergedSleep,
              waterEntries: mergedWater,
              walkSessions: mergedWalk,
              trainingEntries: mergedTraining,
              moods: mergedMoods,
            });
          })
          .then((result) => {
            if (!result) return;
            if (result === "ok") {
              setStorageStatus("Supabase + local cache");
            } else {
              setStorageStatus("Local cache · Supabase unreachable");
            }
          })
          .catch(() => {
            setStorageStatus("Local cache · Supabase unreachable");
          });
      }
    };

    boot();
    const id = window.setInterval(updateClock, 60_000);
    return () => window.clearInterval(id);
  }, []);

  const today = history.find((d) => d.day === todayKey) ?? history[0] ?? null;

  const todayTraining = useMemo(() => {
    if (!todayKey) return { planned: 0, actual: 0 };
    const entries = trainingEntries.filter((e) => e.day === todayKey);
    let planned = 0;
    let actual = 0;
    for (const e of entries) {
      planned += e.plannedValue;
      actual += e.actualValue;
    }
    return { planned, actual };
  }, [trainingEntries, todayKey]);

  const todayMood = useMemo(() => {
    if (!todayKey) return null;
    return dailyMoods.find((m) => m.day === todayKey) ?? null;
  }, [dailyMoods, todayKey]);

  const todaySleepMinutes = today?.sleepMinutes ?? 0;
  const todayWaterMl = today?.waterMl ?? 0;
  const todayWalkMinutes = today?.walkMinutes ?? 0;
  const todayTrainingPercent =
    today?.trainingCompletionPercent != null
      ? Math.round(today.trainingCompletionPercent)
      : null;
  const todayMoodRating = todayMood?.rating ?? null;
  const heroDateLabel = today
    ? new Date(`${today.day}T00:00:00`).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "Today";
  const sleepLabel =
    todaySleepMinutes > 0
      ? `${(todaySleepMinutes / 60).toFixed(1)} h sleep`
      : "Add sleep";
  const waterLabel =
    todayWaterMl > 0
      ? `${(todayWaterMl / 1000).toFixed(1)} L water`
      : "Log water";
  const walkLabel =
    todayWalkMinutes > 0 ? `${todayWalkMinutes} min walk` : "Start walking";
  const trainingLabel =
    todayTrainingPercent != null
      ? `${todayTrainingPercent}% plan`
      : "Set training";
  const moodLabel =
    todayMoodRating != null ? `Mood ${todayMoodRating}/5` : "Log mood";

  const syncOutAll = (
    nextSleep: SleepSession[],
    nextWater: WaterEntry[],
    nextWalk: WalkSession[],
    nextTraining: TrainingEntry[],
    nextMoods: DailyMood[],
  ) => {
    if (!hasSupabaseConfig()) return;
    setStorageStatus("Syncing with Supabase...");
    pushRemoteHealthAll({
      sleepSessions: nextSleep,
      waterEntries: nextWater,
      walkSessions: nextWalk,
      trainingEntries: nextTraining,
      moods: nextMoods,
    })
      .then((result) => {
        if (result === "ok") {
          setStorageStatus("Supabase + local cache");
        } else {
          setStorageStatus("Local cache · Supabase unreachable");
        }
      })
      .catch(() => {
        setStorageStatus("Local cache · Supabase unreachable");
      });
  };

  const handleSleepStart = () => {
    if (isSleeping) return;
    const now = getHealthNow();
    setActiveSleep(now.iso);
    setIsSleeping(true);
  };

  const handleWake = () => {
    if (!isSleeping) return;
    const active = getActiveSleep();
    if (!active) {
      setIsSleeping(false);
      return;
    }

    const now = getHealthNow();
    const start = new Date(active.startTimestamp);
    const end = new Date(now.iso);
    const diffMinutes = Math.max(
      0,
      Math.round((end.getTime() - start.getTime()) / 60000),
    );

    const dayKey = chooseSleepDayKey(active.startTimestamp, now.iso);

    const newSession: SleepSession = {
      id: `${Date.now()}`,
      day: dayKey,
      startTimestamp: active.startTimestamp,
      endTimestamp: now.iso,
      durationMinutes: diffMinutes,
    };

    const nextSessions = [...sleepSessions, newSession];
    setSleepSessions(nextSessions);
    saveStoredSleepSessions(nextSessions);
    clearActiveSleep();
    setIsSleeping(false);

    setHistory((prev) => applySleepToHistory(prev, nextSessions));

    syncOutAll(
      nextSessions,
      waterEntries,
      walkSessions,
      trainingEntries,
      dailyMoods,
    );
  };

  const handleAddWaterByContainer = (containerId: string, quantity: number) => {
    if (!quantity || quantity <= 0) return;
    const container = waterContainers.find((c) => c.id === containerId);
    if (!container) return;

    const now = getHealthNow();
    const totalMl = container.sizeMl * quantity;

    const newEntry: WaterEntry = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      day: now.dayKey,
      timestamp: now.iso,
      containerId: container.id,
      quantity,
      totalMl,
    };

    const nextEntries = [...waterEntries, newEntry];
    setWaterEntries(nextEntries);
    saveWaterEntries(nextEntries);

    setHistory((prev) => applyWaterToHistory(prev, nextEntries));

    syncOutAll(
      sleepSessions,
      nextEntries,
      walkSessions,
      trainingEntries,
      dailyMoods,
    );
  };

  const handleAddWaterMl = (ml: number) => {
    if (!ml || ml <= 0) return;
    const now = getHealthNow();

    const newEntry: WaterEntry = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      day: now.dayKey,
      timestamp: now.iso,
      rawMl: ml,
      totalMl: ml,
    };

    const nextEntries = [...waterEntries, newEntry];
    setWaterEntries(nextEntries);
    saveWaterEntries(nextEntries);

    setHistory((prev) => applyWaterToHistory(prev, nextEntries));

    syncOutAll(
      sleepSessions,
      nextEntries,
      walkSessions,
      trainingEntries,
      dailyMoods,
    );
  };

  const handleAddCustomContainer = (name: string, sizeMl: number) => {
    if (!name || !sizeMl || sizeMl <= 0) return;
    const trimmed = name.trim();
    if (!trimmed) return;

    const newContainer: WaterContainer = {
      id: `custom-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      name: trimmed,
      sizeMl,
      isDefault: false,
      isActive: true,
    };

    const nextContainers = [...waterContainers, newContainer];
    setWaterContainers(nextContainers);
    saveWaterContainers(nextContainers);
  };

  const handleWalkStart = () => {
    if (isWalking) return;
    const now = getHealthNow();
    setActiveWalk(now.iso, now.dayKey);
    setIsWalking(true);
  };

  const handleWalkStop = () => {
    if (!isWalking) return;
    const active = getActiveWalk();
    if (!active) {
      setIsWalking(false);
      return;
    }

    const now = getHealthNow();
    const start = new Date(active.startTimestamp);
    const end = new Date(now.iso);
    const diffMinutes = Math.max(
      0,
      Math.round((end.getTime() - start.getTime()) / 60000),
    );

    const newSession: WalkSession = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      day: active.day,
      startTimestamp: active.startTimestamp,
      endTimestamp: now.iso,
      durationMinutes: diffMinutes,
    };

    const nextSessions = [...walkSessions, newSession];
    setWalkSessions(nextSessions);
    saveWalkSessions(nextSessions);
    clearActiveWalk();
    setIsWalking(false);

    setHistory((prev) => applyWalkToHistory(prev, nextSessions));

    syncOutAll(
      sleepSessions,
      waterEntries,
      nextSessions,
      trainingEntries,
      dailyMoods,
    );
  };

  const handleSaveTraining = (planned: number, actual: number) => {
    if (!todayKey) return;
    const nextEntries: TrainingEntry[] = [
      ...trainingEntries.filter((e) => e.day !== todayKey),
      {
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        day: todayKey,
        routineId: "aggregate",
        exerciseId: "aggregate",
        plannedValue: planned,
        actualValue: actual,
      },
    ];
    setTrainingEntries(nextEntries);
    saveTrainingEntries(nextEntries);
    setHistory((prev) => applyTrainingToHistory(prev, nextEntries));

    syncOutAll(
      sleepSessions,
      waterEntries,
      walkSessions,
      nextEntries,
      dailyMoods,
    );
  };

  const handleSaveMood = (rating: number, note: string) => {
    if (!todayKey) return;
    const nextMoods: DailyMood[] = [
      ...dailyMoods.filter((m) => m.day !== todayKey),
      {
        day: todayKey,
        rating,
        note: note || undefined,
      },
    ];
    setDailyMoods(nextMoods);
    saveDailyMoods(nextMoods);
    setHistory((prev) => applyMoodToHistory(prev, nextMoods));

    syncOutAll(
      sleepSessions,
      waterEntries,
      walkSessions,
      trainingEntries,
      nextMoods,
    );
  };

  return (
    <div className="space-y-6 text-[var(--gaia-text-default)]">
      <section className="health-surface relative overflow-hidden p-6 md:p-8">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -left-8 top-6 h-28 w-28 rounded-full bg-[var(--gaia-contrast-bg)]/12 blur-3xl" />
          <div className="absolute right-6 bottom-4 h-28 w-28 rounded-full bg-[var(--gaia-info)]/10 blur-3xl" />
        </div>
        <div className="relative grid items-center gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-5">
            <div className="inline-flex items-center gap-2 rounded-full border gaia-border bg-[var(--gaia-surface-soft)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--gaia-text-muted)]">
              <span className="h-2 w-2 rounded-full bg-[var(--gaia-contrast-bg)]" />
              Gaia Health Core
            </div>
            <div className="space-y-3">
              <h1 className="text-3xl sm:text-4xl font-semibold leading-tight text-[var(--gaia-text-strong)]">
                Calmer health, one glassy dashboard.
              </h1>
              <p className="max-w-2xl text-sm sm:text-base gaia-muted">
                Sleep, water, walking, training, and mood sit on warm glass
                panels. GAIA keeps them synced while you move through the day.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="#today"
                className="health-button inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold uppercase tracking-[0.08em]"
              >
                Check today view
              </Link>
              <Link
                href="/health/food-calendar"
                className="inline-flex items-center gap-2 rounded-full border gaia-border bg-[var(--gaia-surface)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-[var(--gaia-text-strong)] transition hover:bg-[var(--gaia-surface-soft)]"
              >
                Food calendar
              </Link>
              <Link
                href="/health/training-calendar"
                className="inline-flex items-center gap-2 rounded-full border gaia-border bg-[var(--gaia-surface)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-[var(--gaia-text-strong)] transition hover:bg-[var(--gaia-surface-soft)]"
              >
                Training calendar
              </Link>
            </div>
            <div className="flex flex-wrap gap-2 text-[11px] text-[var(--gaia-text-default)]">
              <span className="gaia-chip inline-flex items-center gap-2 rounded-full px-3 py-1 font-semibold">
                <span className="h-2 w-2 rounded-full bg-[var(--gaia-contrast-bg)] animate-pulse" />
                Live data
              </span>
              <span className="gaia-chip inline-flex items-center gap-2 rounded-full px-3 py-1 font-semibold">
                Offline cache ready
              </span>
              <span className="gaia-chip inline-flex items-center gap-2 rounded-full px-3 py-1 font-semibold">
                {storageStatus}
              </span>
            </div>
          </div>
          <div className="relative flex justify-end">
            <div className="absolute -right-6 top-2 h-28 w-28 rounded-full bg-[var(--gaia-contrast-bg)]/10 blur-3xl" />
            <div className="absolute -left-10 bottom-0 h-24 w-24 rounded-full bg-[var(--gaia-info)]/10 blur-2xl" />
            <div className="health-surface-soft relative w-full max-w-[440px] p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold text-[var(--gaia-text-muted)]">
                    Today focus
                  </p>
                  <p className="text-sm font-semibold text-[var(--gaia-text-strong)]">
                    {heroDateLabel}
                  </p>
                  <p className="text-[11px] gaia-muted">
                    GAIA is watching hydration and walks right now.
                  </p>
                </div>
                <span className="inline-flex items-center gap-1 rounded-full border gaia-border bg-[var(--gaia-surface)] px-2 py-0.5 text-[10px] font-semibold text-[var(--gaia-text-muted)]">
                  Live
                </span>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-2xl border gaia-border bg-[var(--gaia-surface)] p-3">
                  <p className="text-[11px] font-semibold text-[var(--gaia-text-muted)]">
                    Water
                  </p>
                  <p className="text-lg font-semibold text-[var(--gaia-text-strong)]">
                    {waterLabel}
                  </p>
                  <p className="text-[11px] gaia-muted">
                    {todayWaterMl > 0
                      ? "Keep sipping across the day."
                      : "Add your first glass."}
                  </p>
                </div>
                <div className="rounded-2xl border gaia-border bg-[var(--gaia-surface)] p-3">
                  <p className="text-[11px] font-semibold text-[var(--gaia-text-muted)]">
                    Sleep
                  </p>
                  <p className="text-lg font-semibold text-[var(--gaia-text-strong)]">
                    {sleepLabel}
                  </p>
                  <p className="text-[11px] gaia-muted">
                    {todaySleepMinutes > 0
                      ? "Great job keeping rest steady."
                      : "Log last night's sleep."}
                  </p>
                </div>
                <div className="rounded-2xl border gaia-border bg-[var(--gaia-surface)] p-3">
                  <p className="text-[11px] font-semibold text-[var(--gaia-text-muted)]">
                    Walking
                  </p>
                  <p className="text-lg font-semibold text-[var(--gaia-text-strong)]">
                    {walkLabel}
                  </p>
                  <p className="text-[11px] gaia-muted">
                    {todayWalkMinutes > 0
                      ? "Light steps keep energy balanced."
                      : "Start a 10 min loop."}
                  </p>
                </div>
                <div className="rounded-2xl border gaia-border bg-[var(--gaia-surface)] p-3">
                  <p className="text-[11px] font-semibold text-[var(--gaia-text-muted)]">
                    Training
                  </p>
                  <p className="text-lg font-semibold text-[var(--gaia-text-strong)]">
                    {trainingLabel}
                  </p>
                  <p className="text-[11px] gaia-muted">
                    {todayTrainingPercent != null
                      ? "Close the plan with one more block."
                      : "Set a plan and let GAIA track it."}
                  </p>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2 text-[11px] text-[var(--gaia-text-default)]">
                <div className="rounded-xl border gaia-border bg-[var(--gaia-surface)] px-3 py-2">
                  Mood check: {moodLabel}
                </div>
                <div className="rounded-xl border gaia-border bg-[var(--gaia-surface)] px-3 py-2">
                  Clock: {nowDisplay || "Loading..."}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {today ? (
        <div
          className="grid gap-4 lg:gap-6 lg:grid-cols-[1.35fr_0.9fr]"
          id="today"
        >
          <TodayView
            today={today}
            isSleeping={isSleeping}
            onSleepStart={handleSleepStart}
            onWake={handleWake}
            waterContainers={waterContainers}
            onAddWaterByContainer={handleAddWaterByContainer}
            onAddWaterMl={handleAddWaterMl}
            onAddCustomWaterContainer={handleAddCustomContainer}
            isWalking={isWalking}
            onWalkStart={handleWalkStart}
            onWalkStop={handleWalkStop}
            todayTrainingPlanned={todayTraining.planned}
            todayTrainingActual={todayTraining.actual}
            onSaveTraining={handleSaveTraining}
            onSaveMood={handleSaveMood}
          />
          <HistoryList days={history} todayKey={todayKey} />
        </div>
      ) : (
        <p className="text-xs md:text-sm gaia-muted">
          Preparing Health Day model...
        </p>
      )}
    </div>
  );
}
