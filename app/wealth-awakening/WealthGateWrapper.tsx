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
      <main className="mx-auto max-w-3xl space-y-4 px-4 py-8 text-slate-100">
        <header className="space-y-1">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-emerald-300/80">
            Wealth Locked
          </p>
          <h1 className="text-2xl font-semibold text-white">
            Keep studying in Apollo to unlock Wealth.
          </h1>
          <p className="text-sm text-slate-300">
            Wealth awakens only after you complete at least one lesson in Apollo
            Academy. Any track counts - Programming, Accounting, or Self-Repair.
          </p>
        </header>

        <section className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-[0_18px_60px_rgba(0,0,0,0.45)] space-y-3">
          <p className="text-sm text-slate-300">
            Completed lessons so far:{" "}
            <span className="font-semibold text-white">
              {totalLessonsCompleted}
            </span>
          </p>
          <p className="text-sm text-slate-300">
            Wealth stage:{" "}
            <span className="font-semibold text-white">{wealthStage} / 10</span>
          </p>
          <p className="text-xs text-slate-400">
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
