"use client";

import Link from "next/link";
import { useState } from "react";
import type { PathDefinition } from "../types";
import { lessonsByTrack, type TrackId, type LessonMeta } from "../../lessonsMap";

type Props = {
  trackId: TrackId;
  path: PathDefinition;
};

type CourseLesson = {
  id: string;
  code: string;
  title: string;
  minutes: number;
};

type Course = {
  section: string;
  label: string;
  title: string;
  summary: string;
  lessons: CourseLesson[];
  totalMinutes: number;
};

const SELF_REPAIR_MINUTES: Record<string, number> = {
  "1.1": 30,
  "1.2": 25,
  "1.3": 25,
  "1.4": 30,
};

const LEVEL_BY_TRACK: Record<TrackId, string> = {
  programming: "Beginner",
  accounting: "Intermediate",
  "self-repair": "Gentle foundations",
};

const TAG_BY_TRACK: Record<TrackId, string> = {
  programming: "Dev path",
  accounting: "Finance path",
  "self-repair": "Self-work",
};

const SKILLS_BY_TRACK: Record<TrackId, string[]> = {
  programming: [
    "HTML",
    "CSS",
    "JavaScript",
    "Git & GitHub",
    "React / Next.js",
    "Supabase basics",
  ],
  accounting: [
    "Double-entry",
    "Financial statements",
    "Trial balance checks",
    "Accrual vs cash",
  ],
  "self-repair": [
    "Energy mapping",
    "Tiny anchors",
    "Softening self-attack",
    "Boundaries & people",
    "Emergency plan",
  ],
};

const COURSE_META: Record<TrackId, { section: string; title: string; summary: string }[]> =
  {
    programming: [
      {
        section: "0",
        title: "Environment & Comfort with Your Machine",
        summary:
          "Get comfortable with files, folders, VS Code, the terminal, Git, and how the web works before you touch real projects.",
      },
      {
        section: "1",
        title: "Programming Mindset & Study System",
        summary:
          "Learn how to study without burning out, how to use GAIA as a study companion, and how to keep progress realistic.",
      },
      {
        section: "2",
        title: "HTML Foundations",
        summary:
          "Build the skeleton of web pages: structure, text, lists, links, images, and simple layouts.",
      },
      {
        section: "3",
        title: "CSS & Tailwind Foundations",
        summary:
          "Understand the box model, layout, responsive design, and how Tailwind fits into your projects.",
      },
      {
        section: "4",
        title: "JavaScript Essentials",
        summary:
          "Learn the JS basics you need for GAIA: variables, conditions, loops, functions, and working with the DOM.",
      },
      {
        section: "5",
        title: "React & Next.js",
        summary:
          "Move from static pages to components and routes, and connect them to GAIA-style layouts.",
      },
      {
        section: "6",
        title: "Supabase & Data",
        summary:
          "Connect your apps to a real database, save data, and fetch it back safely for GAIA Awakening.",
      },
      {
        section: "7",
        title: "Capstone & Integration",
        summary:
          "Pull everything together into a small end-to-end project connected to your GAIA roadmap.",
      },
    ],
    accounting: [
      {
        section: "1",
        title: "Core Accounting Logic",
        summary:
          "Refresh the accounting equation, debits and credits, chart of accounts, and how journals flow into ledgers.",
      },
      {
        section: "2",
        title: "Financial Statements",
        summary:
          "Rebuild your understanding of balance sheet, income statement, and cash flow, including how they connect.",
      },
      {
        section: "3",
        title: "Operational Accounting",
        summary:
          "Look at day-to-day entries, accruals, and adjustments similar to what you do in real work.",
      },
      {
        section: "4",
        title: "Controls & Reviews",
        summary:
          "Focus on checks, reconciliations, and how to spot errors before they hit the statements.",
      },
      {
        section: "5",
        title: "Towards GAIA Accounting Center",
        summary:
          "Sketch how these skills will connect to future GAIA modules for salary, payroll, and QuickBooks reviews.",
      },
    ],
    "self-repair": [
      {
        section: "1",
        title: "Rebuild Me: Stabilizing the Basics",
        summary:
          "Map your current rhythm, add one tiny anchor, reconnect to movement, and define a bad-days baseline.",
      },
      {
        section: "2",
        title: "Softening the Inner Attacker",
        summary:
          "Catch harsh thoughts, separate facts from attacks, and practice answering yourself with more honest kindness.",
      },
      {
        section: "3",
        title: "Boundaries & People",
        summary:
          "Understand which people drain or support you, and experiment with tiny boundaries to protect your energy.",
      },
      {
        section: "4",
        title: "Reframing GAIA & Your Future",
        summary:
          "Rebuild how you see GAIA and your learning paths so they feel like support, not punishment.",
      },
      {
        section: "5",
        title: "Emergency Plans & Early Warnings",
        summary:
          "Notice early warning signs, design an emergency list, and keep the plan realistic for real bad days.",
      },
    ],
  };

function getLessonMinutes(trackId: TrackId, code: string): number {
  if (trackId === "self-repair") {
    return SELF_REPAIR_MINUTES[code] ?? 0;
  }
  // For now other tracks have no detailed timings yet.
  return 0;
}

function buildCourses(trackId: TrackId): Course[] {
  const allLessons = lessonsByTrack[trackId] ?? [];
  const meta = COURSE_META[trackId] ?? [];
  const bySection = new Map<string, LessonMeta[]>();

  for (const lesson of allLessons) {
    const section = lesson.code.split(".")[0] ?? "";
    if (!bySection.has(section)) bySection.set(section, []);
    bySection.get(section)!.push(lesson);
  }

  const courses: Course[] = meta.map((courseMeta, index) => {
    const sectionLessons = (bySection.get(courseMeta.section) ?? []).slice();
    sectionLessons.sort((a, b) => {
      const [aMajor, aMinor] = a.code.split(".").map(Number);
      const [bMajor, bMinor] = b.code.split(".").map(Number);
      if (aMajor !== bMajor) return aMajor - bMajor;
      return (aMinor || 0) - (bMinor || 0);
    });

    const lessons: CourseLesson[] = sectionLessons.map((lesson, idx) => ({
      id: lesson.id,
      code: lesson.code,
      title: lesson.title,
      minutes: getLessonMinutes(trackId, lesson.code),
    }));

    const totalMinutes = lessons.reduce((sum, l) => sum + (l.minutes || 0), 0);

    return {
      section: courseMeta.section,
      label: `Course ${index + 1}`,
      title: courseMeta.title,
      summary: courseMeta.summary,
      lessons,
      totalMinutes,
    };
  });

  return courses;
}

function formatTotalDuration(totalMinutes: number): string {
  if (!totalMinutes || totalMinutes <= 0) return "Flexible time";
  if (totalMinutes < 60) return `${totalMinutes} minutes`;
  const hours = totalMinutes / 60;
  if (hours < 1.5) return "About 1 hour";
  if (hours < 2.5) return "About 2 hours";
  return `About ${Math.round(hours)} hours`;
}

export function PathCurriculum({ trackId, path }: Props) {
  const courses = buildCourses(trackId);
  const [openSection, setOpenSection] = useState<string | null>(
    courses[0]?.section ?? null,
  );

  const totalMinutes = courses.reduce((sum, c) => sum + c.totalMinutes, 0);
  const durationLabel = formatTotalDuration(totalMinutes);
  const levelLabel = LEVEL_BY_TRACK[trackId];
  const tagLabel = TAG_BY_TRACK[trackId];
  const skills = SKILLS_BY_TRACK[trackId] ?? [];

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-10 lg:py-12">
      {/* Hero / overview */}
      <header className="space-y-4 mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
          Apollo Academy · Path overview
        </p>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight text-slate-900">
          {path.title}
        </h1>
        <p className="max-w-3xl text-sm sm:text-base text-slate-600">
          {path.shortDescription}
        </p>

        <div className="mt-3 flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs sm:text-sm text-slate-600">
          <span className="inline-flex items-center rounded-full bg-amber-50 px-3 py-1 text-[11px] font-medium text-amber-700 border border-amber-100">
            {tagLabel}
          </span>
          <span className="inline-flex items-center gap-1">
            Level: {levelLabel}
          </span>
          <span className="inline-flex items-center gap-1">
            Duration: {durationLabel}
          </span>
          <span className="inline-flex items-center gap-1">
            Pacing: personal pace
          </span>
        </div>
      </header>

      {/* Skills list (small chips) */}
      {skills.length > 0 && (
        <section className="mb-8">
          <h2 className="mb-3 text-sm sm:text-base font-semibold text-slate-900">
            Skills you will lean into
          </h2>
          <div className="flex flex-wrap gap-2">
            {skills.map((skill) => (
              <span
                key={skill}
                className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] sm:text-xs text-slate-700"
              >
                {skill}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Courses accordion */}
      <section className="border-t border-slate-200 pt-6">
        <h2 className="mb-4 text-sm sm:text-base font-semibold text-slate-900">
          Course structure
        </h2>

        <div className="space-y-3">
          {courses.map((course) => {
            const isOpen = openSection === course.section;
            return (
              <div
                key={course.section}
                className={`rounded-xl border bg-white transition shadow-sm ${
                  isOpen
                    ? "border-sky-400 shadow-[0_10px_28px_rgba(15,23,42,0.12)]"
                    : "border-slate-200 hover:border-slate-300"
                }`}
              >
                <button
                  type="button"
                  className="flex w-full items-center justify-between gap-4 px-4 py-3 sm:px-6 sm:py-4"
                  onClick={() => setOpenSection(isOpen ? null : course.section)}
                >
                  <div className="flex flex-col items-start gap-1 text-left">
                    <div className="inline-flex items-center gap-2 rounded-full bg-slate-50 px-2.5 py-1 text-[11px] font-semibold text-slate-500">
                      <span className="uppercase tracking-[0.16em] text-slate-500">
                        {course.label}
                      </span>
                    </div>
                    <p className="text-sm sm:text-base font-semibold text-slate-900">
                      {course.title}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 text-[11px] sm:text-xs text-slate-600">
                    {course.totalMinutes > 0 && (
                      <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 font-semibold text-slate-700">
                        {course.totalMinutes} min
                      </span>
                    )}
                    <span
                      className={`inline-flex h-7 w-7 items-center justify-center rounded-full border text-slate-600 text-sm ${
                        isOpen
                          ? "border-sky-400 bg-sky-50 text-sky-600"
                          : "border-slate-200 bg-white"
                      }`}
                    >
                      {isOpen ? "-" : "+"}
                    </span>
                  </div>
                </button>

                {isOpen && (
                  <div className="border-t border-slate-200 px-4 py-4 sm:px-6 sm:py-5 space-y-4">
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                      {course.summary}
                    </p>
                    {course.lessons.length > 0 && (
                      <div className="divide-y divide-slate-100 rounded-xl border border-slate-100 bg-slate-50/70">
                        {course.lessons.map((lesson, idx) => (
                          <Link
                            key={lesson.id}
                            href={`/apollo/academy/Paths/lesson/${lesson.id}`}
                            className="flex items-center justify-between gap-3 px-4 py-3 sm:px-5 sm:py-3.5 hover:bg-white transition"
                          >
                            <div className="flex items-center gap-3">
                              <div className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-[11px] font-semibold text-slate-700">
                                L{idx + 1}
                              </div>
                              <div className="flex flex-col">
                                <span className="text-xs sm:text-sm font-medium text-slate-900">
                                  {lesson.title}
                                </span>
                                <span className="text-[11px] text-slate-500">
                                  Lesson {lesson.code}
                                </span>
                              </div>
                            </div>

                            {lesson.minutes > 0 && (
                              <div className="flex items-center gap-1 text-[11px] sm:text-xs text-slate-600 font-semibold">
                                {lesson.minutes} min
                              </div>
                            )}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
}
