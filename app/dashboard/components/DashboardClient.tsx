"use client";

import GuardianTodayCard from "@/app/components/guardian/GuardianTodayCard";
import Active from "./Active";
import { useDailyRitualGate } from "../hooks/useDailyRitualGate";
import Entry from "./Entry";
import TodoDaily from "./TodoDaily";
import GuardianNudgeClient from "@/app/components/guardian/GuardianNudgeClient";
import DashboardCorePanel from "@/app/components/dashboard/DashboardCorePanel";
import HealthNudgeClient from "@/app/components/dashboard/HealthNudgeClient";

export default function DashboardClient() {
  const { completedToday } = useDailyRitualGate();

  return (
    <div className="space-y-8">
      <TodoDaily />

      {completedToday && (
        <>
          <DashboardCorePanel />
          <HealthNudgeClient />
          <GuardianTodayCard />
          <GuardianNudgeClient />
          <Active />
          <Entry />
        </>
      )}
    </div>
  );
}
