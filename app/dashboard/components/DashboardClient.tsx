"use client";

import GuardianTodayCard from "@/app/components/guardian/GuardianTodayCard";
import Active from "./Active";
import GuardianNudgeClient from "@/app/components/guardian/GuardianNudgeClient";
import DashboardCorePanel from "@/app/components/dashboard/DashboardCorePanel";
import HealthNudgeClient from "@/app/components/dashboard/HealthNudgeClient";

type DashboardClientProps = {
  completedToday: boolean;
};

export default function DashboardClient({ completedToday }: DashboardClientProps) {
  if (!completedToday) return null;

  return (
    <div className="space-y-8">
      <DashboardCorePanel />
      <HealthNudgeClient />
      <GuardianTodayCard />
      <GuardianNudgeClient />
      <Active />
    </div>
  );
}
