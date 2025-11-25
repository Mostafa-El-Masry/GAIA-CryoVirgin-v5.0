"use client";

import WealthAwakeningClientPage from "./ClientPage";
import { useGaiaFeatureUnlocks } from "@/app/hooks/useGaiaFeatureUnlocks";

export default function WealthGateWrapper() {
  const { wealthUnlocked, wealthStage, totalCompletedLessons } =
    useGaiaFeatureUnlocks();

  if (!wealthUnlocked) {
    return (
      <main className="mx-auto w-[70vw] px-3 sm:px-4 py-8 space-y-4">
        <header className="space-y-1">
          <p className="text-[11px] sm:text-xs font-semibold uppercase tracking-[0.22em] gaia-muted">
            Wealth · Locked
          </p>
          <h1 className="text-xl sm:text-2xl font-semibold gaia-strong">
            Keep studying in Apollo to unlock Wealth.
          </h1>
          <p className="text-sm sm:text-base gaia-muted">
            Wealth awakens only after you complete at least one lesson in Apollo
            Academy. Any track counts – Programming, Accounting, or Self‑Repair.
          </p>
        </header>

        <section className="rounded-2xl border border-[var(--gaia-border)] bg-[var(--gaia-surface-soft)] p-4 sm:p-6 shadow-lg space-y-3">
          <p className="text-xs sm:text-sm gaia-muted">
            Completed lessons so far:{" "}
            <span className="font-semibold gaia-strong">
              {totalCompletedLessons}
            </span>
          </p>
          <p className="text-xs sm:text-sm gaia-muted">
            Wealth stage:{" "}
            <span className="font-semibold gaia-strong">
              {wealthStage} / 10
            </span>
          </p>
          <p className="text-[11px] sm:text-xs gaia-muted">
            Each lesson moves you one step closer to fully unlocking your Wealth
            map. For now, focus on finishing today&apos;s ritual and one lesson
            in Apollo.
          </p>
        </section>
      </main>
    );
  }

  return <WealthAwakeningClientPage />;
}
