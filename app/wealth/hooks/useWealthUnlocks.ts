// app/wealth/hooks/useWealthUnlocks.ts
"use client";

import { useMemo } from "react";
import { useAcademyProgress } from "@/app/apollo/academy/useAcademyProgress";

export type WealthFeatureId =
  | "accounts"
  | "instruments"
  | "flows"
  | "levels"
  | "projections";

export type WealthUnlockState = {
  totalLessonsCompleted: number;
  stage: number; // 0-5
  unlocked: Record<WealthFeatureId, boolean>;
};

const UNLOCK_ALL_WEALTH = true;

export function useWealthUnlocks(): WealthUnlockState & {
  canAccess: (id: WealthFeatureId) => boolean;
} {
  const { state } = useAcademyProgress();

  const { totalLessonsCompleted, stage, unlocked } = useMemo(() => {
    const trackIds = Object.keys(state.byTrack) as Array<
      keyof typeof state.byTrack
    >;

    let total = 0;
    for (const id of trackIds) {
      total += state.byTrack[id]?.completedLessonIds.length ?? 0;
    }

    let stage = 0;
    if (total >= 1) stage = 1;
    if (total >= 2) stage = 2;
    if (total >= 3) stage = 3;
    if (total >= 4) stage = 4;
    if (total >= 5) stage = 5;

    const baseUnlocked: Record<WealthFeatureId, boolean> = {
      accounts: stage >= 1,
      instruments: stage >= 2,
      flows: stage >= 3,
      levels: stage >= 4,
      projections: stage >= 5,
    };

    if (UNLOCK_ALL_WEALTH) {
      const unlockedAll: Record<WealthFeatureId, boolean> = {
        accounts: true,
        instruments: true,
        flows: true,
        levels: true,
        projections: true,
      };

      return {
        totalLessonsCompleted: Math.max(total, 5),
        stage: 5,
        unlocked: unlockedAll,
      };
    }

    return { totalLessonsCompleted: total, stage, unlocked: baseUnlocked };
  }, [state.byTrack]);

  const canAccess = (id: WealthFeatureId) => unlocked[id];

  return { totalLessonsCompleted, stage, unlocked, canAccess };
}
