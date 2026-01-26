import { useMemo } from "react";
import { gaiaBrain } from "@/gaia-brain";
import { useTimelineStore } from "@/app/timeline/lib/store";

export function useGaiaFeatureUnlocks() {
  const timeline = useTimelineStore();

  const decision = useMemo(() => {
    return gaiaBrain("progression", {
      timeline,
    });
  }, [timeline]);

  const d = decision as any;

  const isFeatureUnlocked = (key: string) => Boolean(d?.allowed);
  const totalLessonsCompleted = (d && (d.totalLessonsCompleted ?? 0)) as number;

  const featureUnlocks = {
    gallery: isFeatureUnlocked("gallery"),
  };

  const wealthUnlocked = isFeatureUnlocked("wealth");
  const wealthStage = d?.wealthStage ?? 0;
  const accountsUnlocked = isFeatureUnlocked("accounts");

  return {
    // backward-compatible shape expected by callers
    isFeatureUnlocked,
    totalLessonsCompleted,
    allowedGalleryMediaCount: 999,
    featureUnlocks,
    wealthUnlocked,
    wealthStage,
    accountsUnlocked,
    state: d?.state ?? {},
    // also provide older fields
    allowed: d?.allowed,
    reason: d?.reason,
  };
}
