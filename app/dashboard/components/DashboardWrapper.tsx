"use client";

import dynamic from "next/dynamic";
import TodoDaily from "./TodoDaily";
import { useDailyRitualGate } from "../hooks/useDailyRitualGate";

const DashboardClient = dynamic(() => import("./DashboardClient"), {
  ssr: false,
});

export default function DashboardWrapper() {
  const { completedToday, ready } = useDailyRitualGate();

  return (
    <div className="space-y-8">
      <TodoDaily />
      {ready && <DashboardClient completedToday={completedToday ?? false} ready={ready} />}
    </div>
  );
}
