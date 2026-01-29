import { useMemo } from "react";
import { gaiaBrain } from "@/gaia-brain";
import { useHealthStore } from "@/app/health/lib/healthStore";
import { useTimelineStore } from "@/app/timeline/lib/store";

export function useDailyRitualGate() {
  const health = useHealthStore();
  const timeline = useTimelineStore();

  const decision = useMemo(() => {
    return gaiaBrain("ritual", {
      health,
      timeline,
    });
  }, [health, timeline]);

  const d = decision as any;
  const completedToday = Boolean(d?.completedToday ?? false);
  const ready = Boolean(d?.allowed ?? false);

  return {
    completedToday,
    ready,
    allowed: d?.allowed,
    reason: d?.reason,
  };
}
