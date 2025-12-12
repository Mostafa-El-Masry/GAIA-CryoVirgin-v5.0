"use client";

import React, { useMemo } from "react";
import {
  lessonsByTrack,
  type LessonMeta,
  type TrackId,
} from "@/app/apollo/academy/lessonsMap";
import { useGaiaFeatureUnlocks } from "@/app/hooks/useGaiaFeatureUnlocks";

type FeatureRow = {
  id: string;
  label: string;
  requiredLessons: number;
};

const TRACK_LABELS: Record<TrackId, { short: string; full: string }> = {
  programming: { short: "prog", full: "Programming" },
  accounting: { short: "accounting", full: "Accounting" },
  "self-repair": { short: "self-repair", full: "Self-repair" },
};

const GAIA_FEATURES: FeatureRow[] = [
  { id: "wealth", label: "Wealth", requiredLessons: 1 },
  { id: "health", label: "Health", requiredLessons: 2 },
  { id: "timeline", label: "Timeline", requiredLessons: 3 },
  { id: "accounts", label: "Accounts", requiredLessons: 4 },
  { id: "guardian", label: "Guardian", requiredLessons: 5 },
  { id: "eleuthia", label: "ELEUTHIA", requiredLessons: 6 },
  { id: "settings", label: "Settings", requiredLessons: 7 },
  { id: "gallery", label: "Gallery", requiredLessons: 11 },
];

const TRACK_ORDER: TrackId[] = ["programming", "accounting", "self-repair"];

function findLessonMeta(trackId: TrackId, lessonId: string): LessonMeta | null {
  const meta = lessonsByTrack[trackId].find((lesson) => lesson.id === lessonId);
  return meta ?? null;
}

export default function FeatureUnlocksTab() {
  const { state, totalLessonsCompleted } = useGaiaFeatureUnlocks();

  const completedLessons = useMemo(() => {
    const collected: LessonMeta[] = [];
    for (const trackId of TRACK_ORDER) {
      const completedIds = state.byTrack[trackId]?.completedLessonIds ?? [];
      for (const lessonId of completedIds) {
        const meta = findLessonMeta(trackId, lessonId);
        if (meta) {
          collected.push(meta);
        }
      }
    }
    return collected;
  }, [state.byTrack]);

  const rows = useMemo(
    () =>
      GAIA_FEATURES.map((feature) => {
        const lessonIndex = feature.requiredLessons - 1;
        const lesson = completedLessons[lessonIndex] ?? null;
        return { ...feature, lesson };
      }),
    [completedLessons]
  );

  return (
    <section className="space-y-3 rounded-lg border gaia-border p-4">
      <header className="space-y-1">
        <h2 className="font-medium">GAIA feature unlocks</h2>
        <p className="text-sm gaia-muted">
          Each GAIA feature opens after a total number of Academy lessons. This
          table lists the milestone lessons counted toward each unlock (by path
          type) so you can see what opened each feature.
        </p>
        <p className="text-xs gaia-muted">
          Progress shown: {totalLessonsCompleted} lesson
          {totalLessonsCompleted === 1 ? "" : "s"} completed across all paths.
        </p>
      </header>

      <div className="overflow-hidden rounded-lg border gaia-border">
        <div className="grid grid-cols-[1.2fr_1.6fr_0.6fr] bg-[var(--gaia-surface-soft)] px-3 py-2 text-xs font-semibold uppercase tracking-wide gaia-muted">
          <span>Feature</span>
          <span>Lesson milestone</span>
          <span className="text-right">Path</span>
        </div>

        <div className="divide-y gaia-border">
          {rows.map((row) => {
            const lesson = row.lesson;
            const path =
              lesson && TRACK_LABELS[lesson.trackId]
                ? TRACK_LABELS[lesson.trackId]
                : null;

            return (
              <div
                key={row.id}
                className="grid grid-cols-[1.2fr_1.6fr_0.6fr] items-start gap-2 px-3 py-3 text-sm"
              >
                <div className="space-y-0.5">
                  <p className="font-semibold">{row.label}</p>
                  <p className="text-xs gaia-muted">
                    Unlocks after {row.requiredLessons}{" "}
                    {row.requiredLessons === 1 ? "lesson" : "lessons"} total
                    (any path).
                  </p>
                </div>

                <div className="space-y-0.5">
                  {lesson ? (
                    <>
                      <p className="font-medium leading-tight">
                        {lesson.title}
                      </p>
                      <p className="text-xs gaia-muted">
                        Lesson ID {lesson.code} · Counts as milestone #
                        {row.requiredLessons}
                      </p>
                    </>
                  ) : (
                    <p className="text-sm gaia-muted">
                      Complete any lesson to reach this milestone.
                    </p>
                  )}
                </div>

                <div className="flex justify-end">
                  {path ? (
                    <span className="rounded-full border px-2 py-0.5 text-xs gaia-border gaia-hover-soft">
                      {path.short}
                    </span>
                  ) : (
                    <span className="text-xs gaia-muted">Any</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <p className="text-xs gaia-muted">
        Milestones use total lesson count; the list above uses your stored
        completions (grouped by path order) to show which lessons have counted
        toward each unlock.
      </p>
    </section>
  );
}
