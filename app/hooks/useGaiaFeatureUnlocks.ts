// app/hooks/useGaiaFeatureUnlocks.ts
"use client";

import { useMemo } from "react";
import { useAcademyProgress } from "@/app/apollo/academy/useAcademyProgress";

export type GaiaFeatureId =
  | "wealth"
  | "health"
  | "timeline"
  | "accounts"
  | "guardian"
  | "eleuthia"
  | "settings"
  | "gallery";

const UNLOCK_ALL_FEATURES = true;

export function useGaiaFeatureUnlocks() {
  const { state } = useAcademyProgress();

  const { totalLessonsCompleted, featureUnlocks, allowedGalleryMediaCount } =
    useMemo(() => {
      const trackIds = Object.keys(state.byTrack) as Array<
        keyof typeof state.byTrack
      >;

      let total = 0;
      for (const id of trackIds) {
        total += state.byTrack[id]?.completedLessonIds.length ?? 0;
      }

      const baseUnlocks: Record<GaiaFeatureId, boolean> = {
        wealth: total >= 1,
        health: total >= 2,
        timeline: total >= 3,
        accounts: total >= 4,
        guardian: total >= 5,
        eleuthia: total >= 6,
        settings: total >= 7,
        gallery: total >= 11,
      };

      const baseAllowedGalleryMediaCount = total > 10 ? total - 10 : 0;

      if (UNLOCK_ALL_FEATURES) {
        const unlockedAll: Record<GaiaFeatureId, boolean> = {
          wealth: true,
          health: true,
          timeline: true,
          accounts: true,
          guardian: true,
          eleuthia: true,
          settings: true,
          gallery: true,
        };

        return {
          totalLessonsCompleted: Math.max(total, 12),
          featureUnlocks: unlockedAll,
          allowedGalleryMediaCount: Number.MAX_SAFE_INTEGER,
        };
      }

      return {
        totalLessonsCompleted: total,
        featureUnlocks: baseUnlocks,
        allowedGalleryMediaCount: baseAllowedGalleryMediaCount,
      };
    }, [state.byTrack]);

  const isFeatureUnlocked = (id: GaiaFeatureId) => featureUnlocks[id];
  const wealthUnlocked = featureUnlocks.wealth;
  const wealthStage = Math.min(totalLessonsCompleted, 10);

  return { 
    state, 
    totalLessonsCompleted, 
    featureUnlocks, 
    isFeatureUnlocked, 
    allowedGalleryMediaCount,
    wealthUnlocked,
    wealthStage
  };
}
