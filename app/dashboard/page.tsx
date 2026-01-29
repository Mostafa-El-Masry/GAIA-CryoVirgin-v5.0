"use client";

import { useEffect, useState } from "react";
import OverviewCards from "./components/OverviewCards";
import QuickActions from "./components/QuickActions";
import WeightSpark from "./widgets/WeightSpark";
import WealthSpark from "./widgets/WealthSpark";
import ActivityFeed from "./widgets/ActivityFeed";
import TodoDaily from "./components/TodoDaily";
import DashboardWrapper from "./components/DashboardWrapper";

/**
 * Dashboard Page
 * Main dashboard view combining overview cards, widgets, and daily tasks
 */
export default function DashboardPage() {
  const [now, setNow] = useState<string>("");

  useEffect(() => {
    setNow(new Date().toLocaleString());
  }, []);

  return (
    <main className="min-h-screen gaia-surface">
      {/* GAIA back to intro */}
      <div className="fixed left-4 top-4 z-40">
        <a
          href="/"
          className="gaia-glass-strong gaia-border inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm font-semibold"
        >
          ⟵ GAIA
        </a>
      </div>

      <div className="mx-auto max-w-6xl space-y-4 p-4 pt-20">
        <div className="flex items-end justify-between">
          <h1 className="text-2xl font-extrabold tracking-wide">Dashboard</h1>
          <div className="text-xs gaia-muted">Updated: {now || "—"}</div>
        </div>

        {/* Daily Todo Section */}
        <TodoDaily />

        {/* Overview Cards */}
        <OverviewCards />

        {/* Mini widgets row */}
        <div className="grid gap-4 md:grid-cols-2">
          <div className="gaia-panel rounded-xl border p-4 shadow-sm">
            <div className="mb-2 flex items-center justify-between">
              <div className="font-semibold">Weight trend</div>
              <a href="/health" className="text-xs underline">
                Open Health
              </a>
            </div>
            <WeightSpark />
          </div>

          <div className="gaia-panel rounded-xl border p-4 shadow-sm">
            <div className="mb-2 flex items-center justify-between">
              <div className="font-semibold">Wealth trend</div>
              <a href="/wealth" className="text-xs underline">
                Open Wealth
              </a>
            </div>
            <WealthSpark />
          </div>
        </div>

        {/* Activity feed */}
        <div className="gaia-panel rounded-xl border p-4 shadow-sm">
          <div className="mb-2 flex items-center justify-between">
            <div className="font-semibold">Recent activity</div>
            <a href="/timeline" className="text-xs underline">
              Open Timeline
            </a>
          </div>
          <ActivityFeed />
        </div>

        <QuickActions />

        {/* Additional dashboard content (guardian, health nudges, etc.) */}
        <DashboardWrapper />
      </div>
    </main>
  );
}
