import { useMemo } from "react";
import { gaiaBrain } from "@/gaia-brain";
import { useHealthStore } from "@/app/health-awakening/lib/healthStore";
import { useTimelineStore } from "@/app/timeline/lib/store";
import { useAuth } from "@/app/context/AuthContext";

export function useDailyRitualGate() {
  const health = useHealthStore();
  const timeline = useTimelineStore();
  const { user } = useAuth();

  const decision = useMemo(() => {
    return gaiaBrain("ritual", {
      user,
      health,
      timeline,
    });
  }, [user, health, timeline]);

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
