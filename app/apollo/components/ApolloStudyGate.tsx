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
  const { totalLessonsCompleted } = useGaiaFeatureUnlocks();
  const unlocked = totalLessonsCompleted >= MIN_LESSONS;

  if (unlocked) {
    return <>{children}</>;
  }

  if (fallback) return <>{fallback}</>;

  const label = featureLabel ?? "this area";

  return (
    <div className="rounded-2xl border border-slate-200 bg-white/90 p-4 sm:p-5 shadow-sm space-y-2">
      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
        Locked
      </p>
      <h3 className="text-lg font-semibold text-slate-900">
        Complete {MIN_LESSONS} lessons to unlock {label}.
      </h3>
      <p className="text-sm text-slate-600">
        You have finished {totalLessonsCompleted} so far. Work through Academy
        first, then Archives, Labs, and Ask ChatGPT will open automatically.
      </p>
      <Link
        href="/apollo/academy"
        className="inline-flex items-center rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
      >
        Go to Academy
      </Link>
    </div>
  );
}
