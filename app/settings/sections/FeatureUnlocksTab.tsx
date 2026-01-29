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

type FeatureComponent = {
  id: string;
  label: string;
};

type FeatureRowWithLesson = FeatureRow & {
  lesson: LessonMeta | null;
  trackId: TrackId | null;
  components?: FeatureComponentWithLesson[];
};

type FeatureComponentWithLesson = FeatureComponent & {
  lesson: LessonMeta | null;
  trackId: TrackId | null;
  milestoneNumber: number;
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
  { id: "instagram", label: "Instagram", requiredLessons: 11 },
];

const FEATURE_COMPONENTS: Partial<
  Record<FeatureRow["id"], FeatureComponent[]>
> = {
  wealth: [
    { id: "wealth-cashflow", label: "Cashflow snapshot" },
    { id: "wealth-accounts", label: "Accounts & balances" },
    { id: "wealth-progress", label: "Wealth progress graphs" },
  ],
  health: [
    { id: "health-water", label: "Hydration quick actions" },
    { id: "health-move", label: "Walking / movement tracker" },
    { id: "health-sleep", label: "Sleep state" },
  ],
  timeline: [
    { id: "timeline-feed", label: "Timeline feed" },
    { id: "timeline-milestones", label: "Milestone cards" },
    { id: "timeline-export", label: "Exports & print" },
  ],
  accounts: [
    { id: "accounts-sync", label: "Account sync" },
    { id: "accounts-statements", label: "Statements view" },
    { id: "accounts-alerts", label: "Alerts & notifications" },
  ],
  guardian: [
    { id: "guardian-checkins", label: "Daily check-ins" },
    { id: "guardian-rules", label: "Safety rules" },
    { id: "guardian-incidents", label: "Incident log" },
  ],
  eleuthia: [
    { id: "eleuthia-sandbox", label: "Sandbox commands" },
    { id: "eleuthia-automations", label: "Automations" },
    { id: "eleuthia-labs", label: "Labs & experiments" },
  ],
  settings: [
    { id: "settings-profile", label: "Profile & identity" },
    { id: "settings-notifications", label: "Notifications" },
    { id: "settings-integrations", label: "Integrations" },
  ],
  instagram: [
    { id: "instagram-feed", label: "Memory feed" },
    { id: "instagram-upload", label: "Uploads" },
    { id: "instagram-collections", label: "Collections" },
  ],
};

const TRACK_ORDER: TrackId[] = ["programming", "accounting", "self-repair"];

function findLessonMeta(trackId: TrackId, lessonId: string): LessonMeta | null {
  const meta = lessonsByTrack[trackId].find((lesson) => lesson.id === lessonId);
  return meta ?? null;
}

export default function FeatureUnlocksTab() {
  const { state, totalLessonsCompleted } = useGaiaFeatureUnlocks();

  const completedLessons = useMemo(() => {
    const byTrack: Record<TrackId, LessonMeta[]> = {
      programming: [],
      accounting: [],
      "self-repair": [],
    };

    for (const trackId of TRACK_ORDER) {
      const completedIds = state.byTrack[trackId]?.completedLessonIds ?? [];
      for (const lessonId of completedIds) {
        const meta = findLessonMeta(trackId, lessonId);
        if (meta) {
          byTrack[trackId].push(meta);
        }
      }
    }

    // Round-robin the paths so milestones mirror the calendar cadence,
    // falling back to the next lesson in each path if not completed yet.
    const maxMilestones = Math.max(
      ...GAIA_FEATURES.map((feature) => feature.requiredLessons),
    );
    const pointer: Record<TrackId, number> = {
      programming: 0,
      accounting: 0,
      "self-repair": 0,
    };

    const interleaved: { trackId: TrackId; lesson: LessonMeta | null }[] = [];

    for (let i = 0; i < maxMilestones; i++) {
      const trackId = TRACK_ORDER[i % TRACK_ORDER.length];
      const index = pointer[trackId];
      const completed = byTrack[trackId][index];
      const fallback = lessonsByTrack[trackId]?.[index];

      interleaved.push({
        trackId,
        lesson: completed ?? fallback ?? null,
      });

      pointer[trackId] = index + 1;
    }

    return interleaved;
  }, [state.byTrack]);

  const rows = useMemo(
    () =>
      GAIA_FEATURES.map<FeatureRowWithLesson>((feature) => {
        const baseIndex = feature.requiredLessons - 1;
        const milestone = completedLessons[baseIndex] ?? null;
        const components = FEATURE_COMPONENTS[feature.id];

        if (components && components.length > 0) {
          const mapped = components.map((component, idx) => {
            const componentMilestone =
              completedLessons[baseIndex + idx] ?? null;
            return {
              ...component,
              lesson: componentMilestone?.lesson ?? null,
              trackId: componentMilestone?.trackId ?? null,
              milestoneNumber: feature.requiredLessons + idx,
            };
          });

          return {
            ...feature,
            lesson: milestone?.lesson ?? null,
            trackId: milestone?.trackId ?? null,
            components: mapped,
          };
        }

        return {
          ...feature,
          lesson: milestone?.lesson ?? null,
          trackId: milestone?.trackId ?? null,
        };
      }),
    [completedLessons],
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
            const pathKey = row.trackId ?? lesson?.trackId ?? null;
            const path = pathKey ? (TRACK_LABELS[pathKey] ?? null) : null;
            const isComponentized =
              Array.isArray(row.components) && row.components.length > 0;

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
                  {isComponentized ? (
                    <div className="space-y-1.5">
                      <p className="text-xs gaia-muted">
                        This feature unlocks in components. Each additional
                        lesson opens the next piece.
                      </p>
                      {row.components?.map((component) => {
                        const componentPath = component.trackId
                          ? TRACK_LABELS[component.trackId]
                          : null;
                        const unlocked = !!component.lesson;
                        return (
                          <div
                            key={component.id}
                            className="flex items-start justify-between rounded-md border gaia-border px-2 py-1.5"
                          >
                            <div className="space-y-0.5 pr-2">
                              <p className="text-xs font-semibold">
                                {component.label}
                              </p>
                              <p className="text-[11px] gaia-muted">
                                {component.lesson ? (
                                  <>
                                    Unlocked by {component.lesson.code} — counts
                                    as milestone #{component.milestoneNumber}
                                  </>
                                ) : (
                                  <>
                                    Pending milestone #
                                    {component.milestoneNumber}
                                  </>
                                )}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <span
                                className={`text-[11px] font-semibold ${
                                  unlocked ? "text-emerald-600" : "gaia-muted"
                                }`}
                              >
                                {unlocked ? "Unlocked" : "Locked"}
                              </span>
                              {componentPath ? (
                                <span className="rounded-full border px-2 py-0.5 text-[10px] gaia-border gaia-hover-soft">
                                  {componentPath.short}
                                </span>
                              ) : null}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : lesson ? (
                    <>
                      <p className="font-medium leading-tight">
                        {lesson.title}
                      </p>
                      <p className="text-xs gaia-muted">
                        Lesson ID {lesson.code} - counts as milestone #
                        {row.requiredLessons}
                      </p>
                    </>
                  ) : (
                    <p className="text-sm gaia-muted">
                      {path
                        ? `Complete the next ${path.full} lesson to reach this milestone.`
                        : "Complete any lesson to reach this milestone."}
                    </p>
                  )}
                </div>

                <div className="flex justify-end">
                  {isComponentized ? (
                    <span className="text-xs gaia-muted">Per component</span>
                  ) : path ? (
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
