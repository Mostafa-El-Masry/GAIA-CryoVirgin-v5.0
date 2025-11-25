// app/hooks/useGaiaFeatureUnlocks.ts
"use client";

import { useMemo } from "react";
import { useAcademyProgress } from "@/app/apollo/academy/useAcademyProgress";

export function useGaiaFeatureUnlocks() {
  const { state } = useAcademyProgress();

  const { totalCompletedLessons, wealthStage, wealthUnlocked } = useMemo(() => {
    const byTrack = state.byTrack ?? {};
    const totalCompletedLessons = Object.values(byTrack).reduce(
      (sum, track) => sum + (track.completedLessonIds?.length ?? 0),
      0
    );

    const wealthStage = Math.min(10, totalCompletedLessons);
    const wealthUnlocked = wealthStage >= 1;

    return { totalCompletedLessons, wealthStage, wealthUnlocked };
  }, [state.byTrack]);

  return {
    totalCompletedLessons,
    wealthStage,
    wealthUnlocked,
  };
}
