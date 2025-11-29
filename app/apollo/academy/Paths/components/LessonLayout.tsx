"use client";

import { useState } from "react";
import { LessonSidebar, type LessonNavItem } from "./LessonSidebar";

type LessonLayoutProps = {
  pathTitle: string;
  courseTitle: string;
  lessonTitle: string;
  durationLabel?: string;
  lessons: LessonNavItem[];
  activeLessonId: string;
};

type TabId = "lesson" | "downloads" | "quiz";

export function LessonLayout({
  pathTitle,
  courseTitle,
  lessonTitle,
  durationLabel = "Flexible time",
  lessons,
  activeLessonId,
}: LessonLayoutProps) {
  const [activeTab, setActiveTab] = useState<TabId>("lesson");

  return (
    <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:py-10">
      <div className="grid gap-6 lg:grid-cols-[280px,minmax(0,1fr)]">
        <LessonSidebar
          pathTitle={pathTitle}
          courseTitle={courseTitle}
          lessons={lessons}
          activeLessonId={activeLessonId}
          completionLabel="Preview · UI only"
        />

        <section className="rounded-2xl gaia-panel-soft border gaia-border p-4 sm:p-5 lg:p-6 flex flex-col gap-4">
          <header className="space-y-1">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] gaia-muted">
              Lesson
            </p>
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h1 className="text-lg sm:text-xl lg:text-2xl font-semibold gaia-strong">
                {lessonTitle}
              </h1>
              <p className="text-xs sm:text-sm gaia-muted">{durationLabel}</p>
            </div>
          </header>

          <nav className="flex flex-wrap gap-2 border-b gaia-border pb-2 text-xs sm:text-sm">
            {[
              { id: "lesson", label: "Lesson" },
              { id: "downloads", label: "Downloads" },
              { id: "quiz", label: "Quiz" },
            ].map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as TabId)}
                  className={[
                    "px-3 py-1.5 rounded-full border text-xs sm:text-sm font-medium transition",
                    isActive
                      ? "border-info bg-info text-contrast-text"
                      : "gaia-border gaia-ink-soft",
                  ].join(" ")}
                >
                  {tab.label}
                </button>
              );
            })}
          </nav>

          <div className="space-y-4">
            {/* Video area */}
            <div className="rounded-2xl border gaia-border bg-black/70 aspect-video flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center">
                <button
                  type="button"
                  className="h-16 w-16 rounded-full bg-white/95 text-black flex items-center justify-center text-sm font-semibold shadow-lg"
                >
                  ▶
                </button>
              </div>
            </div>

            {/* Tab content */}
            {activeTab === "lesson" && (
              <div className="space-y-2 text-sm sm:text-base gaia-muted">
                <p>
                  This is a <strong>lesson layout preview</strong>. Later, this
                  area will show your real lesson text, examples, and
                  reflections.
                </p>
                <p>
                  For now, we are only shaping the <strong>UI structure</strong>
                  : sidebar, video width, and navigation controls.
                </p>
              </div>
            )}

            {activeTab === "downloads" && (
              <div className="space-y-2 text-sm sm:text-base gaia-muted">
                <p>Downloads section preview.</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Worksheet.pdf</li>
                  <li>Example-notes.md</li>
                </ul>
              </div>
            )}

            {activeTab === "quiz" && (
              <div className="space-y-3">
                <p className="text-sm sm:text-base gaia-strong">Quiz preview</p>
                <p className="text-sm sm:text-base gaia-muted">
                  Which option best matches what we are trying to build in GAIA
                  Academy?
                </p>
                <div className="space-y-2 text-sm sm:text-base">
                  <label className="flex items-start gap-2">
                    <input type="radio" name="preview-quiz" className="mt-1" />
                    <span>Something that feels cramped, small, and hard to read.</span>
                  </label>
                  <label className="flex items-start gap-2">
                    <input type="radio" name="preview-quiz" className="mt-1" />
                    <span>A clear, calm space where lessons are easy to follow.</span>
                  </label>
                  <label className="flex items-start gap-2">
                    <input type="radio" name="preview-quiz" className="mt-1" />
                    <span>Just a list of text with no structure.</span>
                  </label>
                </div>
              </div>
            )}
          </div>

          <footer className="mt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-3 border-t gaia-border">
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-full border gaia-border px-4 py-1.5 text-xs sm:text-sm font-medium gaia-strong gaia-ink-soft"
            >
              ← Previous
            </button>
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-full border border-info bg-info text-contrast-text px-5 py-1.5 text-xs sm:text-sm font-semibold shadow-sm hover:shadow-md transition"
            >
              Next →
            </button>
          </footer>
        </section>
      </div>
    </main>
  );
}
