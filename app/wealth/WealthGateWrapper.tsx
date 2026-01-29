"use client";

import WealthAwakeningClientPage from "./ClientPage";
import { useGaiaFeatureUnlocks } from "@/app/hooks/useGaiaFeatureUnlocks";

export default function WealthGateWrapper() {
  const { wealthUnlocked, wealthStage, totalLessonsCompleted } =
    useGaiaFeatureUnlocks();

  // TEMP: force-unlock Wealth for review; set back to false when done.
  const forceUnlock = true;

  if (!wealthUnlocked && !forceUnlock) {
    return (
      <main className="mx-auto max-w-3xl space-y-4 px-4 py-8 text-[var(--gaia-text-default)]">
        <header className="space-y-1">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-emerald-300/80">
            Wealth Locked
          </p>
          <h1 className="text-2xl font-semibold text-[var(--gaia-text-strong)]">
            Keep studying in Apollo to unlock Wealth.
          </h1>
          <p className="text-sm gaia-muted">
            Wealth awakens only after you complete at least one lesson in Apollo
            Academy. Any track counts - Programming, Accounting, or Self-Repair.
          </p>
        </header>

        <section className="wealth-surface space-y-3 p-5 text-[var(--gaia-text-default)]">
          <p className="text-sm gaia-muted">
            Completed lessons so far:{" "}
            <span className="font-semibold text-[var(--gaia-text-strong)]">
              {totalLessonsCompleted}
            </span>
          </p>
          <p className="text-sm gaia-muted">
            Wealth stage:{" "}
            <span className="font-semibold text-[var(--gaia-text-strong)]">
              {wealthStage} / 10
            </span>
          </p>
          <p className="text-xs gaia-muted">
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
