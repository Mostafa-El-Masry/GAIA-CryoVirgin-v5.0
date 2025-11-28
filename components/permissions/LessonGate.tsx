"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useGaiaFeatureUnlocks } from "@/app/hooks/useGaiaFeatureUnlocks";

type LessonGateProps = {
  children: ReactNode;
  minLessons?: number;
  featureLabel?: string;
  fallback?: ReactNode;
};

export default function LessonGate({
  children,
  minLessons = 3,
  featureLabel,
  fallback,
}: LessonGateProps) {
  const { totalLessonsCompleted } = useGaiaFeatureUnlocks();
  const unlocked = totalLessonsCompleted >= minLessons;

  if (unlocked) return <>{children}</>;
  if (fallback) return <>{fallback}</>;

  const label = featureLabel ?? "this area";

  return (
    <div className="mx-auto max-w-3xl rounded-2xl border gaia-border gaia-panel-soft p-5 shadow-sm space-y-3 text-center">
      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] gaia-muted">
        Locked
      </p>
      <h3 className="text-lg font-semibold gaia-strong">
        Complete {minLessons} lessons to unlock {label}.
      </h3>
      <p className="text-sm gaia-muted">
        You have finished {totalLessonsCompleted}. Finish a few Academy lessons,
        then this section will open automatically.
      </p>
      <div className="flex items-center justify-center gap-3">
        <Link
          href="/apollo/academy"
          className="inline-flex items-center rounded-lg gaia-contrast px-3 py-2 text-sm font-semibold shadow-sm transition hover:shadow-md"
        >
          Go to Academy
        </Link>
      </div>
    </div>
  );
}
