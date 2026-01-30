"use client";

import TodoDaily from "./components/TodoDaily";
import ActivityFeed from "./widgets/ActivityFeed";
import WealthSpark from "./widgets/WealthSpark";
import WeightSpark from "./widgets/WeightSpark";

/**
 * Dashboard Page
 * Shows daily todos - one task per category (life, work, distraction) for today
 */
export default function DashboardPage() {
  return (
    <main className="min-h-screen gaia-surface">
      <div className="fixed left-4 top-4 z-40">
        <a
          href="/"
          className="gaia-glass-strong gaia-border inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm font-semibold"
        >
          ⟵ GAIA
        </a>
      </div>

      <div className="mx-auto max-w-6xl space-y-4 p-4 pt-20">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-extrabold tracking-wide">Dashboard</h1>
          <a
            href="/dashboard/calendars"
            className="gaia-glass-strong gaia-border inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium hover:opacity-90"
          >
            Calendars →
          </a>
        </div>

        <TodoDaily />

        <div className="grid gap-6 sm:grid-cols-1 lg:grid-cols-3">
          <section className="gaia-glass-strong gaia-border rounded-lg border p-4">
            <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide gaia-muted">Recent activity</h2>
            <ActivityFeed />
          </section>
          <section className="gaia-glass-strong gaia-border rounded-lg border p-4">
            <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide gaia-muted">Wealth</h2>
            <WealthSpark />
          </section>
          <section className="gaia-glass-strong gaia-border rounded-lg border p-4">
            <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide gaia-muted">Weight</h2>
            <WeightSpark />
          </section>
        </div>
      </div>
    </main>
  );
}
