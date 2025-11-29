"use client";

import { allPaths } from "./index";
import { PathCard } from "./PathCard";

export default function AcademyPathsHome() {
  const sorted = [...allPaths].sort((a, b) => a.order - b.order);

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:py-10 space-y-6">
      {/* Top panel, similar feel to Academy daily card */}
      <section className="rounded-2xl gaia-panel-soft border gaia-border p-4 sm:p-5 shadow-sm space-y-2">
        <p className="text-xs gaia-muted">Apollo Academy · Paths</p>
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-semibold tracking-tight">
          Browse all learning paths
        </h1>
        <p className="text-sm sm:text-base gaia-muted">
          Choose where you want to invest your next focused block — Self-Repair, Programming,
          or Accounting. Each path will later unlock more of GAIA.
        </p>
      </section>

      {/* Grid of paths using the same style as the main Academy cards */}
      <section>
        <h2 className="text-center sm:text-left text-sm font-semibold gaia-strong">
          Available paths
        </h2>
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
          {sorted.map((path) => (
            <PathCard key={path.id} path={path} />
          ))}
        </div>
      </section>
    </main>
  );
}
