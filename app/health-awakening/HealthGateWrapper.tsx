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
        <section className="health-surface p-8">
          <h1 className="mb-2 text-2xl font-semibold text-[var(--gaia-text-strong)]">
            Health locked · keep learning
          </h1>
          <p className="mb-3 text-sm gaia-muted">
            Finish more Academy lessons in Apollo to unlock GAIA&apos;s Health Core.
          </p>
          <p className="text-xs gaia-muted">
            Lessons completed so far:{" "}
            <span className="font-semibold">{totalLessonsCompleted}</span>
          </p>
        </section>
      </main>
    );
  }

  return <HealthAwakeningClientPage />;
}
