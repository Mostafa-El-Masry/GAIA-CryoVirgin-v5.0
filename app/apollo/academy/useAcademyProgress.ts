"use client";

import { useCallback, useEffect, useState } from "react";
import {
  readJSON,
  writeJSON,
  subscribe,
  waitForUserStorage,
} from "@/lib/user-storage";
import type { TrackId } from "./lessonsMap";

export type TrackProgress = {
  completedLessonIds: string[];
  startedOn?: string; // YYYY-MM-DD
  lastStudyDate?: string; // YYYY-MM-DD (most recent date you studied this track)
  studyHistory?: string[]; // sorted list of unique YYYY-MM-DD dates
};

export type AcademyProgressState = {
  byTrack: Record<TrackId, TrackProgress>;
};

const STORAGE_KEY = "gaia_academy_progress_v1";

const EMPTY_STATE: AcademyProgressState = {
  byTrack: {
    programming: { completedLessonIds: [] },
    accounting: { completedLessonIds: [] },
    "self-repair": { completedLessonIds: [] },
  },
};

function normalizeHistory(history: string[] | undefined): string[] {
  if (!history || history.length === 0) return [];
  const unique = Array.from(new Set(history.filter(Boolean)));
  unique.sort();
  return unique;
}

function safeParseState(raw: unknown): AcademyProgressState {
  if (!raw || typeof raw !== "object") return EMPTY_STATE;
  try {
    const parsed = raw as AcademyProgressState;
    if (!parsed.byTrack) return EMPTY_STATE;

    const programming = parsed.byTrack.programming ?? { completedLessonIds: [] };
    const accounting = parsed.byTrack.accounting ?? { completedLessonIds: [] };
    const selfRepair = parsed.byTrack["self-repair"] ?? {
      completedLessonIds: [],
    };

    return {
      byTrack: {
        programming: {
          completedLessonIds: programming.completedLessonIds ?? [],
          startedOn: programming.startedOn,
          lastStudyDate: programming.lastStudyDate,
          studyHistory: normalizeHistory(programming.studyHistory),
        },
        accounting: {
          completedLessonIds: accounting.completedLessonIds ?? [],
          startedOn: accounting.startedOn,
          lastStudyDate: accounting.lastStudyDate,
          studyHistory: normalizeHistory(accounting.studyHistory),
        },
        "self-repair": {
          completedLessonIds: selfRepair.completedLessonIds ?? [],
          startedOn: selfRepair.startedOn,
          lastStudyDate: selfRepair.lastStudyDate,
          studyHistory: normalizeHistory(selfRepair.studyHistory),
        },
      },
    };
  } catch {
    return EMPTY_STATE;
  }
}

function todayIsoDate(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function useAcademyProgress() {
  const [state, setState] = useState<AcademyProgressState>(EMPTY_STATE);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      await waitForUserStorage();
      if (cancelled) return;

      const stored = readJSON<AcademyProgressState>(STORAGE_KEY, EMPTY_STATE);
      setState(safeParseState(stored));
    }

    init();

    const unsubscribe = subscribe((detail) => {
      if (detail.key !== STORAGE_KEY) return;
      setState((prev) => {
        const nextRaw = readJSON<AcademyProgressState>(
          STORAGE_KEY,
          prev ?? EMPTY_STATE
        );
        return safeParseState(nextRaw);
      });
    });

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, []);

  const updateState = useCallback(
    (updater: (prev: AcademyProgressState) => AcademyProgressState) => {
      setState((prev) => {
        const base = prev ?? EMPTY_STATE;
        const next = updater(base);
        writeJSON(STORAGE_KEY, next);
        return next;
      });
    },
    []
  );

  const markStudyVisit = useCallback(
    (trackId: TrackId) => {
      updateState((prev) => {
        const today = todayIsoDate();
        const existing = prev.byTrack[trackId] ?? {
          completedLessonIds: [],
        };

        const history = normalizeHistory([
          ...(existing.studyHistory ?? []),
          today,
        ]);

        return {
          byTrack: {
            ...prev.byTrack,
            [trackId]: {
              ...existing,
              startedOn: existing.startedOn ?? today,
              lastStudyDate: today,
              studyHistory: history,
            },
          },
        };
      });
    },
    [updateState]
  );

  const toggleLessonCompleted = useCallback(
    (trackId: TrackId, lessonId: string) => {
      updateState((prev) => {
        const today = todayIsoDate();
        const existing = prev.byTrack[trackId] ?? {
          completedLessonIds: [],
        };

        const already = existing.completedLessonIds.includes(lessonId);
        const nextCompleted = already
          ? existing.completedLessonIds.filter((id) => id !== lessonId)
          : [...existing.completedLessonIds, lessonId];

        const history = normalizeHistory([
          ...(existing.studyHistory ?? []),
          today,
        ]);

        return {
          byTrack: {
            ...prev.byTrack,
            [trackId]: {
              ...existing,
              completedLessonIds: nextCompleted,
              startedOn: existing.startedOn ?? today,
              lastStudyDate: today,
              studyHistory: history,
            },
          },
        };
      });
    },
    [updateState]
  );

  const isLessonCompleted = useCallback(
    (trackId: TrackId, lessonId: string) => {
      const track = state.byTrack[trackId];
      return track?.completedLessonIds.includes(lessonId) ?? false;
    },
    [state.byTrack]
  );

  return {
    state,
    isLessonCompleted,
    toggleLessonCompleted,
    markStudyVisit,
  };
}
