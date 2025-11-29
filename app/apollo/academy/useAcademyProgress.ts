"use client";

import { useCallback, useEffect, useState } from "react";
import { isSupabaseClientConfigured, supabaseClient } from "@/lib/supabase-client";
import type { TrackId } from "./lessonsMap";

type TrackProgress = {
  completedLessonIds: string[];
  startedOn?: string; // YYYY-MM-DD
  lastStudyDate?: string; // YYYY-MM-DD
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

function safeParseState(raw: unknown): AcademyProgressState {
  if (!raw || typeof raw !== "object") return EMPTY_STATE;
  try {
    const parsed = raw as AcademyProgressState;
    if (!parsed.byTrack) return EMPTY_STATE;
    return {
      byTrack: {
        programming: {
          completedLessonIds:
            parsed.byTrack.programming?.completedLessonIds ?? [],
          startedOn: parsed.byTrack.programming?.startedOn,
          lastStudyDate: parsed.byTrack.programming?.lastStudyDate,
        },
        accounting: {
          completedLessonIds:
            parsed.byTrack.accounting?.completedLessonIds ?? [],
          startedOn: parsed.byTrack.accounting?.startedOn,
          lastStudyDate: parsed.byTrack.accounting?.lastStudyDate,
        },
        "self-repair": {
          completedLessonIds:
            parsed.byTrack["self-repair"]?.completedLessonIds ?? [],
          startedOn: parsed.byTrack["self-repair"]?.startedOn,
          lastStudyDate: parsed.byTrack["self-repair"]?.lastStudyDate,
        },
      },
    };
  } catch {
    return EMPTY_STATE;
  }
}

function loadInitialState(): AcademyProgressState {
  if (typeof window === "undefined") return EMPTY_STATE;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY_STATE;
    const parsed = JSON.parse(raw);
    return safeParseState(parsed);
  } catch {
    return EMPTY_STATE;
  }
}

function todayIsoDate(): string {
  const d = new Date();
  return d.toISOString().slice(0, 10);
}

const ENABLE_SUPABASE =
  typeof process !== "undefined" &&
  process.env.NEXT_PUBLIC_GAIA_ENABLE_ACADEMY_SUPABASE === "1";

async function syncProgressToSupabase(state: AcademyProgressState) {
  try {
    if (!ENABLE_SUPABASE) return;
    if (!isSupabaseClientConfigured || !supabaseClient) return;
    const client = supabaseClient;
    // This assumes you have created a table like:
    // create table guardian_academy_progress (
    //   user_id uuid primary key,
    //   progress_json jsonb not null,
    //   updated_at timestamptz not null default now()
    // );
    const {
      data: { user },
    } = await client.auth.getUser();
    if (!user) return;

    await client.from("guardian_academy_progress").upsert(
      {
        user_id: user.id,
        progress_json: state,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    );
  } catch (error) {
    console.warn("[Academy] Failed to sync progress to Supabase", error);
  }
}

export function useAcademyProgress() {
  const [state, setState] = useState<AcademyProgressState>(EMPTY_STATE);

  // Load from localStorage on first client render
  useEffect(() => {
    if (typeof window === "undefined") return;
    setState(loadInitialState());
  }, []);

  // Persist to localStorage whenever state changes
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // ignore
    }
    // Fire-and-forget Supabase sync
    if (ENABLE_SUPABASE) {
      void syncProgressToSupabase(state);
    }
  }, [state]);

  const toggleLessonCompleted = useCallback(
    (trackId: TrackId, lessonId: string) => {
      setState((prev) => {
        const today = todayIsoDate();
        const track = prev.byTrack[trackId] ?? {
          completedLessonIds: [],
        };
        const already = track.completedLessonIds.includes(lessonId);
        const nextCompleted = already
          ? track.completedLessonIds.filter((id) => id !== lessonId)
          : [...track.completedLessonIds, lessonId];

        return {
          byTrack: {
            ...prev.byTrack,
            [trackId]: {
              completedLessonIds: nextCompleted,
              startedOn: track.startedOn ?? today,
              lastStudyDate: today,
            },
          },
        };
      });
    },
    []
  );

  const markStudyVisit = useCallback((trackId: TrackId) => {
    setState((prev) => {
      const today = todayIsoDate();
      const track = prev.byTrack[trackId] ?? {
        completedLessonIds: [],
      };
      return {
        byTrack: {
          ...prev.byTrack,
          [trackId]: {
            ...track,
            startedOn: track.startedOn ?? today,
            lastStudyDate: today,
          },
        },
      };
    });
  }, []);

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