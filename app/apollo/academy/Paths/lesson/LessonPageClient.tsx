"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { readJSON, writeJSON } from "@/lib/user-storage";
import { useAcademyProgress } from "../../useAcademyProgress";
import type { TrackId } from "../../lessonsMap";
import type { ArcDefinition, PathDefinition } from "../types";
import { getLessonContent } from "./lessonContent";
import CodePlayground from "../../components/CodePlayground";

type LessonPageClientProps = {
  trackId: TrackId;
  path: PathDefinition;
  arcs: ArcDefinition[];
  lessonId: string;
};

type TabId = "lesson" | "quiz" | "downloads" | "notes";

type FlatLesson = {
  id: string;
  code: string;
  title: string;
  status: string;
  arcId: string;
  arcLabel: string;
  arcTitle: string;
};

function buildFlatLessons(arcs: ArcDefinition[]): FlatLesson[] {
  return arcs.flatMap((arc) =>
    arc.lessons.map((lesson) => ({
      id: lesson.id,
      code: lesson.code,
      title: lesson.title,
      status: lesson.status,
      arcId: arc.id,
      arcLabel: arc.label,
      arcTitle: arc.title,
    }))
  );
}

function formatProgress(completed: number, total: number) {
  if (!total) return "0%";
  return `${Math.round((completed / total) * 100)}%`;
}

export default function LessonPageClient({
  trackId,
  path,
  arcs,
  lessonId,
}: LessonPageClientProps) {
  const { isLessonCompleted, toggleLessonCompleted, markStudyVisit } =
    useAcademyProgress();

  const [notes, setNotes] = useState<string>("");
  const notesKey = `gaia.academy.notes.${trackId}.${lessonId}`;
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [testMessage, setTestMessage] = useState<string | null>(null);

  useEffect(() => {
    markStudyVisit(trackId);
  }, [markStudyVisit, trackId]);

  useEffect(() => {
    const stored = readJSON<string | null>(notesKey, null);
    if (stored !== null) {
      setNotes(stored);
    } else {
      setNotes("");
    }
    setQuizAnswers({});
    setQuizSubmitted(false);
  }, [notesKey]);

  const handleNotesChange = (value: string) => {
    setNotes(value);
    writeJSON(notesKey, value);
  };

  const flatLessons = useMemo(() => buildFlatLessons(arcs), [arcs]);
  const activeLesson = flatLessons.find((lesson) => lesson.id === lessonId);
  const activeArc = arcs.find((arc) =>
    arc.lessons.some((lesson) => lesson.id === lessonId)
  );

  const lessonContent = useMemo(
    () => getLessonContent(lessonId, trackId),
    [lessonId, trackId]
  );

  const codeLanguage: "html" | "css" | "js" = useMemo(() => {
    if (trackId !== "programming") return "html";
    const major = Number(activeLesson?.code?.split(".")[0] ?? 0);
    if (major === 3) return "css";
    if (major >= 4) return "js";
    return "html";
  }, [trackId, activeLesson]);

  const defaultCodeSnippet =
    codeLanguage === "css"
      ? "/* Try your CSS here */\n.preview-target {\n  padding: 12px;\n  background: #eef2ff;\n  border-radius: 12px;\n}\n"
      : codeLanguage === "js"
      ? "// Write a quick JS experiment here\nconsole.log('Hello from this lesson');\n"
      : `<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <title>Lesson practice</title>
  </head>
  <body>
    <h1>Hello from this lesson</h1>
    <p>Edit this HTML to practice.</p>
  </body>
</html>`;

  const [openArcIds, setOpenArcIds] = useState<Set<string>>(() => {
    if (activeArc?.id) return new Set([activeArc.id]);
    return new Set(arcs.map((arc) => arc.id));
  });
  const tabs: TabId[] =
    trackId === "programming"
      ? ["lesson", "quiz", "notes"]
      : ["lesson", "downloads", "notes"];

  const [activeTab, setActiveTab] = useState<TabId>(tabs[0]);

  useEffect(() => {
    if (!tabs.includes(activeTab)) {
      setActiveTab(tabs[0]);
    }
  }, [tabs, activeTab]);

  const orderedLessons = flatLessons;
  const activeIndex = orderedLessons.findIndex(
    (lesson) => lesson.id === lessonId
  );
  const prevLesson = activeIndex > 0 ? orderedLessons[activeIndex - 1] : null;
  const nextLesson =
    activeIndex >= 0 && activeIndex < orderedLessons.length - 1
      ? orderedLessons[activeIndex + 1]
      : null;

  if (!activeLesson || !activeArc) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-10">
        <div className="rounded-2xl border gaia-border gaia-panel-soft p-6 space-y-3 text-center">
          <p className="text-sm font-semibold gaia-strong">Lesson not found</p>
          <p className="text-xs gaia-muted">
            This lesson ID is not part of the current Academy Paths setup.
          </p>
          <Link
            href="/apollo/academy/Paths"
            className="inline-flex items-center justify-center rounded-full border gaia-border px-4 py-2 text-xs font-semibold"
          >
            Back to Paths
          </Link>
        </div>
      </main>
    );
  }

  const activeCompleted = isLessonCompleted(trackId, lessonId);

  const toggleArc = (arcId: string) => {
    setOpenArcIds((prev) => {
      const next = new Set(prev);
      if (next.has(arcId)) {
        next.delete(arcId);
      } else {
        next.add(arcId);
      }
      return next;
    });
  };

  return (
    <main className="mx-auto max-w-[75vw] px-4 py-8 sm:px-6 lg:py-10 space-y-6">
      <header className="rounded-2xl gaia-panel-soft border gaia-border p-4 sm:p-5 shadow-sm space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] gaia-muted">
              {path.title}
            </p>
            <h1 className="text-xl sm:text-2xl font-semibold gaia-strong">
              {activeLesson.title}
            </h1>
            <p className="text-xs gaia-muted">
              Course {activeArc.label} - Lesson {activeLesson.code}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => toggleLessonCompleted(trackId, lessonId)}
              className={[
                "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold transition",
                activeCompleted
                  ? "border-emerald-400 bg-emerald-400/10 text-emerald-50"
                  : "gaia-border gaia-ink-soft",
              ].join(" ")}
            >
              <span className="text-[13px]">
                {activeCompleted ? "done" : "pending"}
              </span>
              {activeCompleted ? "Mark as incomplete" : "Mark complete"}
            </button>
            {nextLesson && (
              <Link
                href={`/apollo/academy/Paths/lesson/${nextLesson.id}`}
                className="inline-flex items-center gap-2 rounded-full border gaia-border px-3 py-1.5 text-xs font-semibold gaia-ink-soft"
              >
                {"Next lesson ->"}
              </Link>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-3 text-[11px] sm:text-xs gaia-muted">
          <span className="inline-flex items-center gap-1 rounded-full border gaia-border px-3 py-1">
            Course: {activeArc.title}
          </span>
          <span className="inline-flex items-center gap-1 rounded-full border gaia-border px-3 py-1">
            Path: {path.title}
          </span>
        </div>
      </header>

      <div className="grid gap-5 lg:grid-cols-[360px,minmax(0,1fr)]">
        <aside className="rounded-2xl gaia-panel-soft border gaia-border bg-white p-4 sm:p-5 space-y-3 h-fit">
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] gaia-muted">
                Course outline
              </p>
              <p className="text-xs gaia-muted">
                Browse lessons and jump around.
              </p>
            </div>
            <Link
              href={`/apollo/academy/Paths/${path.slug}`}
              className="text-[11px] font-semibold gaia-ink-soft"
            >
              {"Path home ->"}
            </Link>
          </div>

          <div className="space-y-2">
            {arcs.map((arc) => {
              const arcCompleted = arc.lessons.filter((lesson) =>
                isLessonCompleted(trackId, lesson.id)
              ).length;
              const arcTotal = arc.lessons.length;
              const isOpen = openArcIds.has(arc.id);

              return (
                <div
                  key={arc.id}
                  className="rounded-xl border gaia-border bg-white/5 shadow-sm overflow-hidden"
                >
                  <button
                    type="button"
                    onClick={() => toggleArc(arc.id)}
                    className="w-full flex items-center justify-between px-3 py-2 text-left"
                  >
                    <div className="flex flex-col">
                      <span className="text-[10px] uppercase tracking-[0.18em] gaia-muted">
                        Course {arc.label}
                      </span>
                      <span className="text-xs font-semibold gaia-strong leading-snug text-left">
                        {arc.title}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] gaia-muted">
                      <span>{formatProgress(arcCompleted, arcTotal)}</span>
                      <span
                        className={[
                          "flex h-6 w-6 items-center justify-center rounded-full border text-xs",
                          isOpen
                            ? "border-info bg-info/10 text-info"
                            : "gaia-border",
                        ].join(" ")}
                      >
                        {isOpen ? "-" : "+"}
                      </span>
                    </div>
                  </button>

                  {isOpen && (
                    <div className="border-t gaia-border divide-y divide-slate-100/20">
                      {arc.lessons.map((lesson) => {
                        const isActive = lesson.id === lessonId;
                        const isDone = isLessonCompleted(trackId, lesson.id);
                        return (
                          <Link
                            key={lesson.id}
                            href={`/apollo/academy/Paths/lesson/${lesson.id}`}
                            className={[
                              "flex items-center gap-3 px-3 py-2 text-xs transition",
                              isActive
                                ? "bg-info/10 border-l-2 border-info"
                                : "hover:bg-white/5",
                            ].join(" ")}
                          >
                            <span
                              className={[
                                "flex h-6 w-6 items-center justify-center rounded-full border text-[11px] font-semibold",
                                isDone
                                  ? "border-emerald-400 bg-emerald-400/10 text-emerald-200"
                                  : "gaia-border gaia-muted",
                              ].join(" ")}
                            >
                              {lesson.code}
                            </span>
                            <span
                              className={[
                                "leading-snug text-left break-words",
                                isDone
                                  ? "gaia-muted line-through"
                                  : "gaia-strong",
                              ].join(" ")}
                            >
                              {lesson.title}
                            </span>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </aside>

        <section className="rounded-2xl gaia-panel-soft border gaia-border p-4 sm:p-6 space-y-4 shadow-sm">
          <div className="rounded-xl border gaia-border bg-black/70 aspect-video overflow-hidden relative">
            <div className="absolute inset-0 flex items-center justify-center">
              <button
                type="button"
                className="h-16 w-16 rounded-full bg-white/95 text-black flex items-center justify-center text-sm font-semibold shadow-lg"
              >
                Play
              </button>
            </div>
          </div>

          <div className="border-b gaia-border flex gap-3 text-sm">
            {tabs.map((tab) => {
              const isActive = tab === activeTab;
              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={[
                    "px-3 py-2 font-semibold transition",
                    isActive
                      ? "border-b-2 border-info text-info"
                      : "gaia-muted hover:text-info",
                  ].join(" ")}
                >
                  {tab === "lesson" && "Lesson"}
                  {tab === "quiz" && "Quiz"}
                  {tab === "downloads" && "Downloads"}
                  {tab === "notes" && "Notes"}
                </button>
              );
            })}
          </div>

          {activeTab === "lesson" && (
            <div className="space-y-4 text-sm sm:text-base gaia-muted leading-relaxed">
              <div className="space-y-3">
                <h3 className="text-base sm:text-lg font-semibold gaia-strong">
                  {lessonContent.study.title}
                </h3>
                <div className="space-y-3">
                  {lessonContent.study.paragraphs.map((paragraph, idx) => (
                    <p key={idx} className="leading-relaxed">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === "quiz" && (
            <div className="space-y-3 text-sm sm:text-base gaia-muted">
              {lessonContent.quiz ? (
                <>
                  <h3 className="text-base sm:text-lg font-semibold gaia-strong">
                    {lessonContent.quiz.title}
                  </h3>
                  <div className="space-y-3">
                    {lessonContent.quiz.questions.map((q, index) => {
                      const selected = quizAnswers[q.id];
                      const isCorrect =
                        quizSubmitted && selected === q.correctOptionId;
                      const isWrong =
                        quizSubmitted &&
                        selected &&
                        selected !== q.correctOptionId;
                      return (
                        <div
                          key={q.id}
                          className="rounded-xl border gaia-border gaia-panel-soft p-3 sm:p-4 space-y-2"
                        >
                          <p className="text-xs sm:text-sm gaia-strong">
                            Q{index + 1}. {q.prompt}
                          </p>
                          <div className="space-y-1.5">
                            {q.options.map((opt) => (
                              <label
                                key={opt.id}
                                className="flex items-center gap-2 text-[11px] sm:text-xs gaia-muted cursor-pointer"
                              >
                                <input
                                  type="radio"
                                  name={q.id}
                                  className="h-3 w-3"
                                  checked={selected === opt.id}
                                  onChange={() => {
                                    setQuizAnswers((prev) => ({
                                      ...prev,
                                      [q.id]: opt.id,
                                    }));
                                    setQuizSubmitted(false);
                                  }}
                                />
                                <span>{opt.label}</span>
                              </label>
                            ))}
                          </div>
                          {quizSubmitted && (
                            <p
                              className={`text-[11px] sm:text-xs ${
                                isCorrect
                                  ? "text-emerald-600"
                                  : isWrong
                                  ? "text-amber-600"
                                  : "gaia-muted"
                              }`}
                            >
                              {isCorrect
                                ? "Correct."
                                : isWrong
                                ? "Not quite. Check the explanation and try again."
                                : "Select an answer to check."}
                            </p>
                          )}
                          {quizSubmitted && (
                            <p className="text-[11px] sm:text-xs gaia-muted">
                              {q.explanation}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setQuizSubmitted(true)}
                      className="inline-flex items-center justify-center rounded-full px-3 py-1 text-[11px] sm:text-xs font-semibold bg-white text-black"
                    >
                      Check answers
                    </button>
                    {quizSubmitted &&
                      lessonContent.quiz.questions.every(
                        (q) => quizAnswers[q.id] === q.correctOptionId
                      ) && (
                        <p className="text-[11px] sm:text-xs text-emerald-600">
                          Great. All answers correct.
                        </p>
                      )}
                  </div>
                </>
              ) : (
                <p className="text-xs sm:text-sm gaia-muted">
                  Quiz coming soon for this lesson.
                </p>
              )}
            </div>
          )}

          {activeTab === "downloads" && (
            <div className="space-y-2 text-sm gaia-muted">
              <p className="gaia-strong text-base">Downloads</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Lesson slides (coming soon)</li>
                <li>Worksheet or cheat sheet (coming soon)</li>
              </ul>
            </div>
          )}

          {activeTab === "notes" && (
            <div className="space-y-2 text-sm gaia-muted">
              <div className="flex items-center justify-between gap-2">
                <p className="gaia-strong text-base">Your Notes</p>
                <p className="text-[10px] sm:text-xs gaia-muted">
                  Saved automatically - stays even if you switch sessions.
                </p>
              </div>
              <textarea
                value={notes}
                onChange={(e) => handleNotesChange(e.target.value)}
                className="mt-2 w-full rounded-xl border border-white/15 bg-black/30 px-3 py-2 text-xs sm:text-sm gaia-strong outline-none focus:border-emerald-400/70 focus:ring-1 focus:ring-emerald-400/50 min-h-[200px]"
                placeholder="Add your own notes, reflections, or code examples for this lesson..."
              />

              {trackId === "programming" && (
                <div className="space-y-3 pt-3 border-t gaia-border">
                  <div className="flex items-center justify-between">
                    <p className="gaia-strong text-base">Code playground</p>
                    <p className="text-[10px] sm:text-xs gaia-muted">
                      Preview and test quick snippets.
                    </p>
                  </div>
                  <CodePlayground
                    initialCode={defaultCodeSnippet}
                    language={codeLanguage}
                  />

                  <div className="rounded-xl border gaia-border gaia-panel-soft p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="gaia-strong text-sm">Quick test</p>
                      <span className="text-[10px] gaia-muted">
                        Placeholder tests
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setTestMessage(
                          "Basic test runner coming soon. For now, use this space to sanity-check your snippet."
                        )
                      }
                      className="inline-flex items-center justify-center rounded-full border gaia-border px-3 py-1 text-[11px] sm:text-xs font-semibold gaia-ink-soft"
                    >
                      Run test
                    </button>
                    {testMessage && (
                      <p className="text-[11px] sm:text-xs gaia-muted">
                        {testMessage}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          <footer className="pt-3 border-t gaia-border flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-[11px] sm:text-xs gaia-muted">
              <span>Course {activeArc.label}</span>
              <span>-</span>
              <span>Lesson {activeLesson.code}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {prevLesson && (
                <Link
                  href={`/apollo/academy/Paths/lesson/${prevLesson.id}`}
                  className="inline-flex items-center justify-center rounded-full border gaia-border px-4 py-1.5 text-xs font-semibold gaia-ink-soft"
                >
                  {"<- Previous"}
                </Link>
              )}
              {nextLesson && (
                <Link
                  href={`/apollo/academy/Paths/lesson/${nextLesson.id}`}
                  className="inline-flex items-center justify-center rounded-full border border-info bg-info text-contrast-text px-4 py-1.5 text-xs font-semibold shadow-sm hover:shadow-md transition"
                >
                  {"Next ->"}
                </Link>
              )}
            </div>
          </footer>
        </section>
      </div>
    </main>
  );
}
