// app/health-awakening/HealthGateWrapper.tsx
"use client";

import { useGaiaFeatureUnlocks } from "@/app/hooks/useGaiaFeatureUnlocks";
import HealthAwakeningClientPage from "./ClientPage";

export default function HealthGateWrapper() {
  const { isFeatureUnlocked, totalLessonsCompleted } = useGaiaFeatureUnlocks();
  const unlocked = isFeatureUnlocked("health");
  // TEMP: force-unlock Health for review; set back to false when done.
  const forceUnlock = true;

  if (!unlocked && !forceUnlock) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-8">
        <section className="rounded-3xl border border-[var(--gaia-border)] bg-[var(--gaia-surface-soft)] p-8 shadow-lg">
          <h1 className="text-2xl font-semibold text-[var(--gaia-text-strong)] mb-2">
            Health locked · keep learning
          </h1>
          <p className="text-sm text-[var(--gaia-text-muted)] mb-3">
            Finish more Academy lessons in Apollo to unlock GAIA&apos;s Health Core.
          </p>
          <p className="text-xs text-[var(--gaia-text-muted)]">
            Lessons completed so far:{" "}
            <span className="font-semibold">{totalLessonsCompleted}</span>
          </p>
        </section>
      </main>
    );
  }

  return <HealthAwakeningClientPage />;
}
