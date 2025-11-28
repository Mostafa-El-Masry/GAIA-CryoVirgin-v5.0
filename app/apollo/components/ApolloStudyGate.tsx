"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useGaiaFeatureUnlocks } from "@/app/hooks/useGaiaFeatureUnlocks";

type ApolloStudyGateProps = {
  children: ReactNode;
  featureLabel?: string;
  fallback?: ReactNode;
};

const MIN_LESSONS = 3;

export default function ApolloStudyGate({
  children,
  featureLabel,
  fallback,
}: ApolloStudyGateProps) {
  const { totalCompletedLessons } = useGaiaFeatureUnlocks();
  const unlocked = totalCompletedLessons >= MIN_LESSONS;

  if (unlocked) {
    return <>{children}</>;
  }

  if (fallback) return <>{fallback}</>;

  const label = featureLabel ?? "this area";

  return (
    <div className="rounded-2xl border gaia-border gaia-panel-soft p-4 sm:p-5 shadow-sm space-y-2">
      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] gaia-muted">
        Locked
      </p>
      <h3 className="text-lg font-semibold gaia-strong">
        Complete {MIN_LESSONS} lessons to unlock {label}.
      </h3>
      <p className="text-sm gaia-muted">
        You have finished {totalCompletedLessons} so far. Work through Academy
        first, then Archives, Labs, and Ask ChatGPT will open automatically.
      </p>
      <Link
        href="/apollo/academy"
        className="inline-flex items-center rounded-lg gaia-contrast px-3 py-2 text-sm font-semibold shadow-sm transition hover:shadow-md"
      >
        Go to Academy
      </Link>
    </div>
  );
}
