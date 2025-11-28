"use client";

import { useEffect, useMemo, useState } from "react";
import { useAcademyProgress } from "../useAcademyProgress";
import { programmingLessons, type TrackId } from "../lessonsMap";
import ProgrammingLessonContent from "./lessonContent";

type Lesson = {
  id: string;
  code: string;
  title: string;
  estimate: string;
  arcId: string;
};

type Section = {
  id: string;
  label: string;
  title: string;
  focus: string;
  lessons: Lesson[];
};

const makeLesson = (code: string, estimate: string, arcId: string): Lesson => {
  const meta = programmingLessons.find(
    (l) => l.code === code && l.trackId === "programming"
  );

  if (!meta) {
    return {
      id: `missing-${code}`,
      code,
      title: `Missing lesson for code ${code}`,
      estimate,
      arcId,
    };
  }

  return {
    id: meta.id,
    code: meta.code,
    title: meta.title,
    estimate,
    arcId,
  };
};

const sections: Section[] = [
  {
    id: "prerequisites",
    label: "Prerequisites",
    title: "Setup and web orientation",
    focus:
      "Light prep: basic computer comfort, what the web is, and how to install the tools you will use in every lesson.",
    lessons: [
      makeLesson("0.1", "20 min", "prerequisites"),
      makeLesson("0.2", "25 min", "prerequisites"),
      makeLesson("0.3", "20 min", "prerequisites"),
      makeLesson("0.4", "25 min", "prerequisites"),
      makeLesson("0.5", "20 min", "prerequisites"),
      makeLesson("0.6", "25 min", "prerequisites"),
    ],
  },
  {
    id: "git",
    label: "Git basics",
    title: "Version control and safety net",
    focus:
      "Set up Git, learn the core commands, and make your first commits so every future project has a safety net.",
    lessons: [
      makeLesson("0.7", "25 min", "git"),
      makeLesson("0.8", "30 min", "git"),
      makeLesson("0.9", "35 min", "git"),
    ],
  },
  {
    id: "foundations",
    label: "Foundations",
    title: "First steps and mental model",
    focus:
      "See the whole map: how the web works, your tools, and a learning rhythm that respects your energy.",
    lessons: [
      makeLesson("1.1", "40 min", "foundations"),
      makeLesson("1.2", "60 min", "foundations"),
      makeLesson("1.3", "60 min", "foundations"),
    ],
  },
  {
    id: "html",
    label: "HTML",
    title: "Structure and meaning",
    focus:
      "Learn how to structure pages with clean, semantic HTML that GAIA can understand easily later.",
    lessons: [
      makeLesson("2.0", "50 min", "html"),
      makeLesson("2.6", "40 min", "html"),
      makeLesson("2.7", "40 min", "html"),
      makeLesson("2.8", "40 min", "html"),
      makeLesson("2.9", "40 min", "html"),
      makeLesson("2.10", "45 min", "html"),
      makeLesson("2.11", "30 min", "html"),
      makeLesson("2.12", "90 min", "html"),
      makeLesson("2.1", "55 min", "html"),
      makeLesson("2.2", "60 min", "html"),
      makeLesson("2.3", "55 min", "html"),
      makeLesson("2.4", "55 min", "html"),
      makeLesson("2.5", "75 min", "html"),
    ],
  },
  {
    id: "css",
    label: "CSS / Tailwind",
    title: "Styling and layouts",
    focus:
      "Control layout, spacing, and typography, then move into faster styling with Tailwind.",
    lessons: [
      makeLesson("3.7", "45 min", "css"),
      makeLesson("3.8", "45 min", "css"),
      makeLesson("3.9", "40 min", "css"),
      makeLesson("3.10", "45 min", "css"),
      makeLesson("3.1", "70 min", "css"),
      makeLesson("3.2", "70 min", "css"),
      makeLesson("3.3", "75 min", "css"),
      makeLesson("3.4", "80 min", "css"),
      makeLesson("3.5", "75 min", "css"),
      makeLesson("3.6", "80 min", "css"),
    ],
  },
  {
    id: "javascript",
    label: "JavaScript",
    title: "Logic and interaction",
    focus:
      "Build the logic layer so you can interact with users, data, and APIs in GAIA-style apps.",
    lessons: [
      makeLesson("4.1", "80 min", "javascript"),
      makeLesson("4.2", "80 min", "javascript"),
      makeLesson("4.3", "90 min", "javascript"),
      makeLesson("4.4", "90 min", "javascript"),
      makeLesson("4.5", "95 min", "javascript"),
      makeLesson("4.6", "95 min", "javascript"),
      makeLesson("4.7", "95 min", "javascript"),
    ],
  },
  {
    id: "react-next",
    label: "React / Next.js",
    title: "Components and pages",
    focus:
      "Move from static pages to interactive apps using React and Next.js like GAIA itself.",
    lessons: [
      makeLesson("5.1", "95 min", "react-next"),
      makeLesson("5.2", "100 min", "react-next"),
      makeLesson("5.3", "110 min", "react-next"),
      makeLesson("5.4", "120 min", "react-next"),
      makeLesson("5.5", "120 min", "react-next"),
    ],
  },
  {
    id: "supabase",
    label: "Supabase",
    title: "Data and auth",
    focus:
      "Store your data remotely and keep it in sync, just like GAIA Awakening will do.",
    lessons: [
      makeLesson("6.1", "90 min", "supabase"),
      makeLesson("6.2", "100 min", "supabase"),
      makeLesson("6.3", "120 min", "supabase"),
      makeLesson("6.4", "130 min", "supabase"),
    ],
  },
  {
    id: "capstone",
    label: "Capstone",
    title: "Small GAIA-style project",
    focus:
      "Plan, build, and polish a small GAIA-style app and connect it into the main system.",
    lessons: [
      makeLesson("7.1", "120 min", "capstone"),
      makeLesson("7.2", "180 min", "capstone"),
      makeLesson("7.3", "180 min", "capstone"),
      makeLesson("7.4", "180 min", "capstone"),
    ],
  },
];

const arcFilters: { id: "all" | Section["id"]; label: string }[] = [
  { id: "all", label: "All" },
  { id: "prerequisites", label: "Prerequisites" },
  { id: "git", label: "Git basics" },
  { id: "foundations", label: "Foundations" },
  { id: "html", label: "HTML" },
  { id: "css", label: "CSS / Tailwind" },
  { id: "javascript", label: "JavaScript" },
  { id: "react-next", label: "React / Next.js" },
  { id: "supabase", label: "Supabase" },
  { id: "capstone", label: "Capstone" },
];

function isLessonLocked(
  lesson: Lesson,
  allLessons: Lesson[],
  isLessonCompleted: (trackId: TrackId, lessonId: string) => boolean
): boolean {
  const index = allLessons.findIndex((l) => l.id === lesson.id);
  if (index <= 0) return false;
  const previous = allLessons.slice(0, index);
  return previous.some((prev) => !isLessonCompleted("programming", prev.id));
}

export default function ProgrammingTrackPage() {
  const { isLessonCompleted, toggleLessonCompleted, markStudyVisit } =
    useAcademyProgress();
  const [activeLessonId, setActiveLessonId] = useState<string | null>(null);
  const [showSections, setShowSections] = useState<boolean>(true);
  const [activeArcFilter, setActiveArcFilter] = useState<
    "all" | Section["id"]
  >("all");

  useEffect(() => {
    markStudyVisit("programming");
  }, [markStudyVisit]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const hash = window.location.hash.replace("#", "");
    if (hash) {
      setActiveLessonId(hash);
      setShowSections(false);
    }
  }, []);

  const allLessons: Lesson[] = useMemo(
    () => sections.flatMap((section) => section.lessons),
    []
  );

  const activeLesson =
    activeLessonId && allLessons.find((l) => l.id === activeLessonId);

  const totalProgrammingLessons = allLessons.length;
  const completedCount = allLessons.filter((lesson) =>
    isLessonCompleted("programming", lesson.id)
  ).length;
  const completionPercent =
    totalProgrammingLessons === 0
      ? 0
      : Math.round((completedCount / totalProgrammingLessons) * 100);

  const visibleSections =
    activeArcFilter === "all"
      ? sections
      : sections.filter((s) => s.id === activeArcFilter);

  return (
    <main className="mx-auto max-w-5xl px-3 sm:px-4 py-6 space-y-4 sm:space-y-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] sm:text-xs font-semibold uppercase tracking-[0.22em] gaia-muted">
            Academy - Programming path
          </p>
          <h1 className="mt-1 text-lg sm:text-2xl font-semibold gaia-strong">
            Web Developer Track
          </h1>
          <p className="mt-1 text-xs sm:text-sm gaia-muted max-w-xl">
            From true beginner to building GAIA-style apps: HTML, CSS, JS,
            React, Next.js, and Supabase - all paced for your energy and time.
          </p>
        </div>

        <div className="inline-flex items-center gap-3 rounded-full border gaia-border gaia-ink-soft px-3 py-2 text-xs sm:text-sm shadow-sm">
          <div className="flex flex-col">
            <span className="gaia-muted text-[11px] uppercase tracking-[0.22em]">
              Overall progress
            </span>
            <span className="gaia-strong text-sm">
              {completedCount}/{totalProgrammingLessons} lessons -{" "}
              {completionPercent}%
            </span>
          </div>
        </div>
      </header>

      <div className="flex flex-wrap gap-2">
        {arcFilters.map((filter) => (
          <button
            key={filter.id}
            type="button"
            onClick={() => setActiveArcFilter(filter.id)}
            className={`inline-flex items-center justify-center rounded-full px-3 py-1 text-[11px] sm:text-xs font-semibold border transition ${
              activeArcFilter === filter.id
                ? "gaia-contrast shadow-sm"
                : "gaia-ink-soft gaia-border gaia-hover-soft"
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      <section className="space-y-4 mt-2">
        <article className="rounded-2xl gaia-panel-soft p-4 sm:p-5 shadow-sm border gaia-border">
          {activeLesson ? (
            <div className="space-y-3">
              <p className="text-[11px] sm:text-xs gaia-muted uppercase tracking-[0.22em]">
                Currently studying
              </p>
              <h2 className="text-base sm:text-lg font-semibold gaia-strong">
                {activeLesson.code} - {activeLesson.title}
              </h2>
              <ProgrammingLessonContent
                lessonCode={activeLesson.code}
                isCompleted={isLessonCompleted("programming", activeLesson.id)}
                onLessonCompleted={() => {
                  if (!isLessonCompleted("programming", activeLesson.id)) {
                    toggleLessonCompleted("programming", activeLesson.id);
                  }
                }}
              />
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-[11px] sm:text-xs gaia-muted uppercase tracking-[0.22em]">
                Lesson viewer
              </p>
              <p className="text-sm sm:text-base gaia-muted">
                Choose a lesson from the list below or use the{" "}
                <span className="gaia-strong">Start today&apos;s session</span>{" "}
                button in the Academy dashboard to jump straight into a
                recommended lesson.
              </p>
            </div>
          )}
        </article>

        {activeLesson && (
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setShowSections((prev) => !prev)}
              className="mt-2 inline-flex items-center justify-center rounded-full px-3 py-1 text-[11px] sm:text-xs font-semibold gaia-ink-soft border gaia-border shadow-sm transition hover:shadow-md gaia-focus"
            >
              {showSections ? "Hide lesson list" : "Show lesson list"}
            </button>
          </div>
        )}

        {showSections && (
          <>
            {visibleSections.map((section) => (
              <article
                key={section.id}
                className="rounded-2xl gaia-panel-soft p-4 sm:p-5 shadow-sm border gaia-border"
              >
                <p className="text-[11px] sm:text-xs font-semibold uppercase tracking-[0.22em] gaia-muted">
                  {section.label}
                </p>
                <h2 className="mt-1 text-sm sm:text-base font-semibold gaia-strong">
                  {section.title}
                </h2>
                <p className="mt-2 text-xs sm:text-sm gaia-muted">
                  {section.focus}
                </p>

                <ul className="mt-3 space-y-1.5 text-xs sm:text-sm gaia-muted">
                  {section.lessons.map((lesson) => {
                    const locked = isLessonLocked(
                      lesson,
                      allLessons,
                      isLessonCompleted
                    );
                    const completed = isLessonCompleted(
                      "programming",
                      lesson.id
                    );

                    return (
                      <li
                        id={lesson.id}
                        key={lesson.id}
                        className={`flex items-baseline justify-between gap-2 border-b gaia-border pb-1 last:border-b-0 last:pb-0 ${
                          locked
                            ? "opacity-50 cursor-not-allowed"
                            : "cursor-pointer gaia-hover-soft"
                        }`}
                        onClick={() => {
                          if (locked) return;
                          setActiveLessonId(lesson.id);
                          setShowSections(false);
                        }}
                      >
                        <span
                          className={`inline-flex h-5 w-5 items-center justify-center rounded-full border gaia-border text-[11px] sm:text-xs ${
                            completed
                              ? "gaia-contrast font-semibold"
                              : "gaia-ink-faint"
                          }`}
                          aria-hidden="true"
                        >
                          {completed ? "OK" : locked ? "*" : ""}
                        </span>

                        <span className="gaia-strong text-[11px] sm:text-xs w-10">
                          {lesson.code}
                        </span>
                        <span className="flex-1">{lesson.title}</span>
                        <span className="text-[11px] sm:text-xs">
                          {lesson.estimate}
                        </span>
                      </li>
                    );
                  })}
                </ul>

                <p className="mt-2 text-[11px] sm:text-xs gaia-muted">
                  You must complete each lesson in order. Locked lessons will
                  unlock automatically when previous lessons are completed.
                </p>
              </article>
            ))}
          </>
        )}
      </section>
    </main>
  );
}
