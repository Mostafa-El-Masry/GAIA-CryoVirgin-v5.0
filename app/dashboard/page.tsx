"use client";

import TodoDaily from "./components/TodoDaily";

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
        <h1 className="text-2xl font-extrabold tracking-wide">Dashboard</h1>
        
        <TodoDaily />
      </div>
    </main>
  );
}
