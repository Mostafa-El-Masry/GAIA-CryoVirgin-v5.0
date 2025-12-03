"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  readJSON,
  writeJSON,
  removeItem,
  onUserStorageReady,
  subscribe as subscribeStorage,
} from "@/lib/user-storage";
import { useAcademyProgress } from "../../useAcademyProgress";
import type { TrackId } from "../../lessonsMap";
import type { ArcDefinition, PathDefinition } from "../types";
import { getLessonContent, type LessonContentData } from "./lessonContent";
import CodePlayground from "../../components/CodePlayground";
import { LessonVideoBlock } from "../../components/LessonVideoBlock";

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

type LessonContentOverride = Partial<LessonContentData>;

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

function mergeLessonContent(
  base: LessonContentData,
  override?: LessonContentOverride | null
): LessonContentData {
  if (!override) return base;

  const study =
    (override.study as Partial<LessonContentData["study"]>) ?? {};
  const practice =
    (override.practice as Partial<LessonContentData["practice"]>) ?? undefined;

  return {
    study: {
      ...base.study,
      ...study,
      title: study.title ?? base.study.title,
      videoUrl:
        typeof study.videoUrl === "string" ? study.videoUrl : base.study.videoUrl,
      paragraphs:
        study.paragraphs && study.paragraphs.length > 0
          ? study.paragraphs
          : base.study.paragraphs,
    },
    quiz: base.quiz,
    practice:
      (base.practice || practice)
        ? {
            ...(base.practice ?? {
              title: "",
              description: "",
              instructions: [],
            }),
            ...(practice ?? {}),
            instructions:
              practice?.instructions && practice.instructions.length > 0
                ? practice.instructions
                : base.practice?.instructions ?? [],
          }
        : null,
  };
}

function formatProgress(completed: number, total: number) {
  if (!total) return "0%";
  return `${Math.round((completed / total) * 100)}%`;
}

function getYoutubeId(url?: string): string | null {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes("youtube.com")) {
      return parsed.searchParams.get("v");
    }
    if (parsed.hostname === "youtu.be") {
      return parsed.pathname.replace("/", "") || null;
    }
  } catch {
    return null;
  }
  return null;
}

export default function LessonPageClient({
  trackId,
  path,
  arcs,
  lessonId,
}: LessonPageClientProps) {
  const { isLessonCompleted, toggleLessonCompleted, markStudyVisit } =
    useAcademyProgress();

  const baseContent = useMemo(
    () => getLessonContent(lessonId, trackId),
    [lessonId, trackId]
  );

  const overrideKey = useMemo(
    () => `gaia.academy.lesson.content.${lessonId}`,
    [lessonId]
  );
  const [override, setOverride] = useState<LessonContentOverride | null>(null);
  const lessonContent = useMemo(
    () => mergeLessonContent(baseContent, override),
    [baseContent, override]
  );

  const [draftStudyTitle, setDraftStudyTitle] = useState(
    baseContent.study.title
  );
  const [draftParagraphs, setDraftParagraphs] = useState(
    baseContent.study.paragraphs.join("\n\n")
  );
  const [draftVideoUrl, setDraftVideoUrl] = useState(
    baseContent.study.videoUrl ?? ""
  );
  const [draftPracticeTitle, setDraftPracticeTitle] = useState(
    baseContent.practice?.title ?? ""
  );
  const [draftPracticeDescription, setDraftPracticeDescription] = useState(
    baseContent.practice?.description ?? ""
  );
  const [draftPracticeInstructions, setDraftPracticeInstructions] = useState(
    (baseContent.practice?.instructions ?? []).join("\n")
  );
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">(
    "idle"
  );
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const [notes, setNotes] = useState<string>("");
  const notesKey = `gaia.academy.notes.${trackId}.${lessonId}`;
  const quizKey = `gaia.academy.quiz.${trackId}.${lessonId}`;
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [testMessage, setTestMessage] = useState<string | null>(null);

  useEffect(() => {
    markStudyVisit(trackId);
  }, [markStudyVisit, trackId]);

  useEffect(() => {
    const loadOverride = () => {
      const stored = readJSON<LessonContentOverride | null>(overrideKey, null);
      setOverride(stored ?? null);
    };

    loadOverride();
    const offReady = onUserStorageReady(loadOverride);
    const offStorage = subscribeStorage(({ key }) => {
      if (key === overrideKey) loadOverride();
    });

    return () => {
      offReady();
      offStorage();
    };
  }, [overrideKey]);

  useEffect(() => {
    const study =
      (override?.study as Partial<LessonContentData["study"]>) ?? {};
    const paragraphs =
      study.paragraphs && study.paragraphs.length > 0
        ? study.paragraphs
        : baseContent.study.paragraphs;
    const practiceSource =
      override?.practice ?? baseContent.practice ?? {
        title: "",
        description: "",
        instructions: [],
      };

    setDraftStudyTitle(study.title ?? baseContent.study.title);
    setDraftParagraphs(paragraphs.join("\n\n"));
    setDraftVideoUrl(study.videoUrl ?? baseContent.study.videoUrl ?? "");
    setDraftPracticeTitle(practiceSource.title ?? "");
    setDraftPracticeDescription(practiceSource.description ?? "");
    setDraftPracticeInstructions((practiceSource.instructions ?? []).join("\n"));
    setSaveStatus("idle");
    setSaveMessage(null);
  }, [lessonId, baseContent, override]);

  const handleSaveOverride = () => {
    setSaveStatus("saving");
    setSaveMessage(null);

    const parsedParagraphs = draftParagraphs
      .split(/\n\s*\n/)
      .map((p) => p.trim())
      .filter(Boolean);

    const parsedInstructions = draftPracticeInstructions
      .split(/\n+/)
      .map((line) => line.trim())
      .filter(Boolean);

    const payload: LessonContentOverride = {
      study: {
        title: draftStudyTitle.trim() || baseContent.study.title,
        paragraphs:
          parsedParagraphs.length > 0
            ? parsedParagraphs
            : baseContent.study.paragraphs,
        videoUrl: draftVideoUrl.trim() || baseContent.study.videoUrl || "",
      },
    };

    if (
      draftPracticeTitle.trim() ||
      draftPracticeDescription.trim() ||
      parsedInstructions.length > 0
    ) {
      payload.practice = {
        title: draftPracticeTitle.trim(),
        description: draftPracticeDescription.trim(),
        instructions: parsedInstructions,
      };
    }

    writeJSON(overrideKey, payload);
    setOverride(payload);
    setSaveStatus("saved");
    setSaveMessage("Saved. Your edits sync across your devices.");
    setTimeout(() => setSaveStatus("idle"), 1200);
  };

  const handleResetOverride = () => {
    removeItem(overrideKey);
    setOverride(null);
    setSaveStatus("idle");
    setSaveMessage("Reverted to the original lesson content.");
  };

  useEffect(() => {
    const loadNotes = () => {
      const stored = readJSON<string | null>(notesKey, null);
      setNotes(stored ?? "");
    };
    const loadQuiz = () => {
      const storedQuiz = readJSON<
        | {
            answers: Record<string, string>;
            submitted: boolean;
            allCorrect: boolean;
          }
        | null
      >(quizKey, null);
      if (storedQuiz?.allCorrect && storedQuiz.answers) {
        setQuizAnswers(storedQuiz.answers);
        setQuizSubmitted(true);
      } else {
        setQuizAnswers({});
        setQuizSubmitted(false);
      }
    };

    loadNotes();
    loadQuiz();

    const offReady = onUserStorageReady(() => {
      loadNotes();
      loadQuiz();
    });
    const offStorage = subscribeStorage(({ key }) => {
      if (key === notesKey) loadNotes();
      if (key === quizKey) loadQuiz();
    });

    return () => {
      offReady();
      offStorage();
    };
  }, [notesKey, quizKey]);

  const handleNotesChange = (value: string) => {
    setNotes(value);
    writeJSON(notesKey, value);
  };

  const flatLessons = useMemo(() => buildFlatLessons(arcs), [arcs]);
  const activeLesson = flatLessons.find((lesson) => lesson.id === lessonId);
  const activeArc = arcs.find((arc) =>
    arc.lessons.some((lesson) => lesson.id === lessonId)
  );

  const videoId = useMemo(
    () => getYoutubeId(lessonContent.study.videoUrl),
    [lessonContent.study.videoUrl]
  );

  const allCorrectNow = useMemo(() => {
    if (!lessonContent.quiz) return false;
    return lessonContent.quiz.questions.every(
      (q) => quizAnswers[q.id] === q.correctOptionId
    );
  }, [lessonContent.quiz, quizAnswers]);

  useEffect(() => {
    if (!lessonContent.quiz) return;
    if (quizSubmitted && allCorrectNow) {
      writeJSON(quizKey, {
        answers: quizAnswers,
        submitted: true,
        allCorrect: true,
      });
    } else {
      removeItem(quizKey);
    }
  }, [quizSubmitted, allCorrectNow, quizAnswers, quizKey, lessonContent.quiz]);

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
  const allCorrect = quizSubmitted && allCorrectNow;

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
    <main className="mx-auto max-w-[90vw] lg:max-w-[75vw] px-4 lg:px-0 py-10 space-y-6">
      <header className="rounded-3xl border gaia-border bg-[var(--gaia-surface)] p-5 sm:p-6 shadow-md space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-1">
            <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-[var(--gaia-text-muted)]">
              {path.title}
            </p>
            <h1 className="text-2xl sm:text-3xl font-semibold text-[var(--gaia-foreground)] leading-tight">
              {activeLesson.title}
            </h1>
            <p className="text-sm text-[var(--gaia-text-muted)]">
              Course {activeArc.label} - Lesson {activeLesson.code}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => toggleLessonCompleted(trackId, lessonId)}
              className={[
                "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs sm:text-sm font-semibold transition shadow-sm",
                activeCompleted
                  ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                  : "gaia-border bg-[var(--gaia-surface-soft)] text-[var(--gaia-text-default)] hover:bg-[var(--gaia-surface-soft)]/80",
              ].join(" ")}
            >
              {activeCompleted ? "Done" : "Mark complete"}
            </button>
            {nextLesson && (
              <Link
                href={`/apollo/academy/Paths/lesson/${nextLesson.id}`}
                className="inline-flex items-center gap-2 rounded-full border gaia-border px-4 py-2 text-xs sm:text-sm font-semibold text-[var(--gaia-foreground)] bg-[var(--gaia-surface-soft)] hover:bg-[var(--gaia-surface)] shadow-sm"
              >
                {"Next lesson ->"}
              </Link>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-2 text-xs sm:text-sm text-[var(--gaia-text-muted)]">
          <span className="inline-flex items-center gap-2 rounded-full border gaia-border px-3 py-1.5 bg-[var(--gaia-surface-soft)]">
            Course: {activeArc.title}
          </span>
          <span className="inline-flex items-center gap-2 rounded-full border gaia-border px-3 py-1.5 bg-[var(--gaia-surface-soft)]">
            Path: {path.title}
          </span>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[320px,minmax(0,1fr)]">
        <aside className="rounded-2xl border gaia-border bg-[var(--gaia-surface)] p-5 space-y-4 shadow-sm h-fit lg:sticky lg:top-6">
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-[var(--gaia-text-muted)]">
                Course outline
              </p>
              <p className="text-sm text-[var(--gaia-text-muted)]">
                Browse lessons and jump around.
              </p>
            </div>
            <Link
              href={`/apollo/academy/Paths/${path.slug}`}
              className="text-xs font-semibold text-[var(--gaia-foreground)] hover:text-info"
            >
              {"Path home ->"}
            </Link>
          </div>

          <div className="space-y-3">
            {arcs.map((arc) => {
              const arcCompleted = arc.lessons.filter((lesson) =>
                isLessonCompleted(trackId, lesson.id)
              ).length;
              const arcTotal = arc.lessons.length;
              const isOpen = openArcIds.has(arc.id);

              return (
                <div
                  key={arc.id}
                  className="rounded-xl border gaia-border bg-[var(--gaia-surface-soft)] shadow-sm overflow-hidden"
                >
                  <button
                    type="button"
                    onClick={() => toggleArc(arc.id)}
                    className="w-full flex items-center justify-between px-3 py-3 text-left hover:bg-[var(--gaia-surface)] transition-colors"
                  >
                    <div className="flex flex-col">
                      <span className="text-[10px] uppercase tracking-[0.18em] text-[var(--gaia-text-muted)]">
                        Course {arc.label}
                      </span>
                      <span className="text-xs font-semibold text-[var(--gaia-foreground)] leading-snug text-left">
                        {arc.title}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-[var(--gaia-text-muted)]">
                      <span>{formatProgress(arcCompleted, arcTotal)}</span>
                      <span
                        className={[
                          "flex h-6 w-6 items-center justify-center rounded-full border text-xs font-semibold",
                          isOpen
                            ? "border-info bg-info/10 text-info"
                            : "gaia-border text-[var(--gaia-text-muted)]",
                        ].join(" ")}
                      >
                        {isOpen ? "-" : "+"}
                      </span>
                    </div>
                  </button>

                  {isOpen && (
                    <div className="border-t gaia-border divide-y divide-slate-100/40">
                      {arc.lessons.map((lesson) => {
                        const isActive = lesson.id === lessonId;
                        const isDone = isLessonCompleted(trackId, lesson.id);
                        return (
                          <Link
                            key={lesson.id}
                            href={`/apollo/academy/Paths/lesson/${lesson.id}`}
                            className={[
                              "flex items-center gap-3 px-3 py-2 text-sm transition-colors",
                              isActive
                                ? "bg-info/10 border-l-2 border-info"
                                : "hover:bg-[var(--gaia-surface)]",
                            ].join(" ")}
                          >
                            <span
                              className={[
                                "flex h-7 w-7 items-center justify-center rounded-full border text-[12px] font-semibold",
                                isDone
                                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                  : "gaia-border text-[var(--gaia-text-muted)] bg-[var(--gaia-surface)]",
                              ].join(" ")}
                            >
                              {lesson.code}
                            </span>
                            <div className="flex flex-col leading-tight text-left">
                              <span
                                className={[
                                  "text-[var(--gaia-foreground)]",
                                  isDone ? "opacity-70" : "font-semibold",
                                ].join(" ")}
                              >
                                {lesson.title}
                              </span>
                              <span className="text-[11px] text-[var(--gaia-text-muted)]">
                                {isDone ? "Completed" : "In progress"}
                              </span>
                            </div>
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

        <section className="rounded-3xl border gaia-border bg-[var(--gaia-surface)] p-5 sm:p-7 space-y-5 shadow-md">
          <div className="rounded-2xl border gaia-border bg-[var(--gaia-surface-soft)] p-4 sm:p-5 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--gaia-text-muted)]">
                  Personal copy
                </p>
                <p className="text-sm text-[var(--gaia-text-muted)]">
                  Edit this lesson text. Saves to your account and syncs across devices.
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs">
                {saveMessage && (
                  <span className="rounded-full bg-[var(--gaia-surface)] px-3 py-1 font-semibold text-[var(--gaia-text-muted)]">
                    {saveMessage}
                  </span>
                )}
                <button
                  type="button"
                  onClick={handleResetOverride}
                  className="rounded-full border gaia-border px-3 py-1 font-semibold text-[var(--gaia-text-default)] hover:bg-[var(--gaia-surface)]"
                >
                  Reset to default
                </button>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-[var(--gaia-text-muted)]">
                  Study title
                </label>
                <input
                  value={draftStudyTitle}
                  onChange={(e) => setDraftStudyTitle(e.target.value)}
                  className="w-full rounded-xl border gaia-border bg-[var(--gaia-surface)] px-3 py-2 text-sm text-[var(--gaia-foreground)] outline-none focus:border-info focus:ring-2 focus:ring-info/30"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-[var(--gaia-text-muted)]">
                  Video URL (YouTube)
                </label>
                <input
                  value={draftVideoUrl}
                  onChange={(e) => setDraftVideoUrl(e.target.value)}
                  placeholder="https://youtube.com/watch?v=..."
                  className="w-full rounded-xl border gaia-border bg-[var(--gaia-surface)] px-3 py-2 text-sm text-[var(--gaia-foreground)] outline-none focus:border-info focus:ring-2 focus:ring-info/30"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-[var(--gaia-text-muted)]">
                Study paragraphs (separate blocks with a blank line)
              </label>
              <textarea
                value={draftParagraphs}
                onChange={(e) => setDraftParagraphs(e.target.value)}
                className="min-h-[140px] w-full rounded-xl border gaia-border bg-[var(--gaia-surface)] px-3 py-3 text-sm text-[var(--gaia-foreground)] outline-none focus:border-info focus:ring-2 focus:ring-info/30"
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-[var(--gaia-text-muted)]">
                  Practice title
                </label>
                <input
                  value={draftPracticeTitle}
                  onChange={(e) => setDraftPracticeTitle(e.target.value)}
                  className="w-full rounded-xl border gaia-border bg-[var(--gaia-surface)] px-3 py-2 text-sm text-[var(--gaia-foreground)] outline-none focus:border-info focus:ring-2 focus:ring-info/30"
                  placeholder="Optional practice title"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-[var(--gaia-text-muted)]">
                  Practice description
                </label>
                <input
                  value={draftPracticeDescription}
                  onChange={(e) => setDraftPracticeDescription(e.target.value)}
                  className="w-full rounded-xl border gaia-border bg-[var(--gaia-surface)] px-3 py-2 text-sm text-[var(--gaia-foreground)] outline-none focus:border-info focus:ring-2 focus:ring-info/30"
                  placeholder="Short description"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-[var(--gaia-text-muted)]">
                Practice steps (one per line)
              </label>
              <textarea
                value={draftPracticeInstructions}
                onChange={(e) => setDraftPracticeInstructions(e.target.value)}
                className="min-h-[120px] w-full rounded-xl border gaia-border bg-[var(--gaia-surface)] px-3 py-3 text-sm text-[var(--gaia-foreground)] outline-none focus:border-info focus:ring-2 focus:ring-info/30"
                placeholder="Write practice steps, each on its own line."
              />
            </div>

            <div className="flex flex-wrap items-center justify-end gap-3 pt-1">
              <span className="text-xs text-[var(--gaia-text-muted)]">
                Changes save to your GAIA storage (cloud + local backup).
              </span>
              <button
                type="button"
                onClick={handleSaveOverride}
                disabled={saveStatus === "saving"}
                className="inline-flex items-center justify-center rounded-full bg-info px-4 py-2 text-xs sm:text-sm font-semibold text-contrast-text shadow-sm hover:shadow-md transition disabled:opacity-60"
              >
                {saveStatus === "saving" ? "Saving..." : "Save lesson copy"}
              </button>
            </div>
          </div>

          {videoId ? (
            <LessonVideoBlock
              title={lessonContent.study.title}
              youtubeId={videoId}
            />
          ) : (
            <div className="rounded-2xl border gaia-border bg-[var(--gaia-surface-soft)] aspect-video overflow-hidden relative flex items-center justify-center text-center">
              <div className="flex flex-col items-center gap-2 text-[var(--gaia-text-muted)]">
                <div className="h-14 w-14 rounded-full border gaia-border bg-[var(--gaia-surface)] shadow-sm flex items-center justify-center text-sm font-semibold text-[var(--gaia-foreground)]">
                  Play
                </div>
                <p className="text-sm text-[var(--gaia-text-muted)]">
                  Lesson video placeholder
                </p>
              </div>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-2 rounded-full border gaia-border bg-[var(--gaia-surface-soft)] p-1 text-sm font-semibold">
            {tabs.map((tab) => {
              const isActive = tab === activeTab;
              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={[
                    "px-4 py-2 rounded-full transition-colors",
                    isActive
                      ? "bg-[var(--gaia-surface)] text-[var(--gaia-foreground)] shadow-sm border gaia-border"
                      : "text-[var(--gaia-text-muted)] hover:text-[var(--gaia-foreground)]",
                  ].join(" ")}
                >
                  {tab === "lesson" && "Lesson"}
                  {tab === "quiz" && "Quiz"}
                  {tab === "downloads" && "Downloads"}
                  {tab === "notes" &&
                    (trackId === "programming" ? "Playground" : "Notes")}
                </button>
              );
            })}
          </div>

          {activeTab === "lesson" && (
            <article className="prose prose-slate max-w-none text-[var(--gaia-text-default)] prose-headings:mt-0 prose-headings:text-[var(--gaia-foreground)] prose-p:leading-7 prose-p:text-[var(--gaia-text-default)] prose-ul:pl-5 prose-li:marker:text-[var(--gaia-text-muted)] prose-strong:text-[var(--gaia-foreground)]">
              <h3 className="text-2xl font-semibold text-[var(--gaia-foreground)] leading-tight">
                {lessonContent.study.title}
              </h3>
              {lessonContent.study.paragraphs.map((paragraph, idx) => (
                <p key={idx}>{paragraph}</p>
              ))}
            </article>
          )}

          {activeTab === "quiz" && (
            <div className="space-y-4 text-sm sm:text-base text-[var(--gaia-text-default)]">
              {lessonContent.quiz ? (
                <>
                  <div className="space-y-1">
                    <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[var(--gaia-text-muted)]">
                      Quick check
                    </p>
                    <h3 className="text-xl sm:text-2xl font-semibold text-[var(--gaia-foreground)] leading-tight">
                      {lessonContent.quiz.title}
                    </h3>
                    <p className="text-sm text-[var(--gaia-text-muted)]">
                      Answer each question and then check for feedback.
                    </p>
                  </div>
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
                          className="rounded-2xl border gaia-border bg-[var(--gaia-surface-soft)] p-4 sm:p-5 shadow-sm space-y-3"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <p className="text-sm sm:text-base font-semibold text-[var(--gaia-foreground)] leading-relaxed">
                              <span className="mr-2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-[var(--gaia-surface)] border gaia-border text-[12px] font-bold">
                                {index + 1}
                              </span>
                              {q.prompt}
                            </p>
                            {quizSubmitted && (
                              <span
                                className={[
                                  "inline-flex h-7 w-7 items-center justify-center rounded-full border text-[12px] font-semibold",
                                  isCorrect
                                    ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                                    : isWrong
                                    ? "border-amber-300 bg-amber-50 text-amber-700"
                                    : "gaia-border text-[var(--gaia-text-muted)]",
                                ].join(" ")}
                              >
                                {isCorrect ? "OK" : isWrong ? "X" : "?"}
                              </span>
                            )}
                          </div>
                          <div className="space-y-2">
                            {q.options.map((opt) => (
                              <label
                                key={opt.id}
                                className={[
                                  "flex items-start gap-3 rounded-lg border border-transparent px-2 py-2 cursor-pointer transition-colors",
                                  selected === opt.id
                                    ? "border-info/60 bg-info/10 text-[var(--gaia-foreground)]"
                                    : "hover:border-[var(--gaia-border)] hover:bg-[var(--gaia-surface)] text-[var(--gaia-text-default)]",
                                ].join(" ")}
                              >
                                <input
                                  type="radio"
                                  name={q.id}
                                  className="mt-1 h-4 w-4 accent-emerald-500"
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
                              className={`text-xs sm:text-sm ${
                                isCorrect
                                  ? "text-emerald-700"
                                  : isWrong
                                  ? "text-amber-700"
                                  : "text-[var(--gaia-text-muted)]"
                              }`}
                            >
                              {isCorrect
                                ? "Correct."
                                : isWrong
                                ? "Not quite. Check the explanation and try again."
                                : "Select an answer to check."}
                            </p>
                          )}
                          {quizSubmitted && q.explanation && (
                            <p className="text-xs sm:text-sm text-[var(--gaia-text-muted)]">
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
                      className="inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-semibold bg-[var(--gaia-foreground)] text-[var(--gaia-contrast-text)] shadow-sm hover:shadow-md transition"
                    >
                      Check answers
                    </button>
                    {allCorrect && (
                      <p className="text-sm font-semibold text-emerald-700">
                        All answers correct.
                      </p>
                    )}
                  </div>
                </>
              ) : (
                <p className="text-sm text-[var(--gaia-text-muted)]">
                  Quiz coming soon for this lesson.
                </p>
              )}
            </div>
          )}

          {activeTab === "downloads" && (
            <div className="space-y-3 text-sm text-[var(--gaia-text-default)]">
              <p className="text-base font-semibold text-[var(--gaia-foreground)]">
                Downloads
              </p>
              <ul className="list-disc pl-5 space-y-2 text-[var(--gaia-text-muted)]">
                <li>Lesson slides (coming soon)</li>
                <li>Worksheet or cheat sheet (coming soon)</li>
              </ul>
            </div>
          )}

          {activeTab === "notes" && (
            <>
              {trackId === "programming" ? (
                <div className="space-y-3 text-sm text-[var(--gaia-text-default)]">
                  <div className="flex items-center justify-between">
                    <p className="text-base font-semibold text-[var(--gaia-foreground)]">
                      Code playground
                    </p>
                    <p className="text-[11px] sm:text-xs text-[var(--gaia-text-muted)]">
                      Practice what you just studied.
                    </p>
                  </div>
                  <CodePlayground
                    initialCode={defaultCodeSnippet}
                    language={codeLanguage}
                  />
                </div>
              ) : (
                <div className="space-y-3 text-sm text-[var(--gaia-text-default)]">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-base font-semibold text-[var(--gaia-foreground)]">
                      Your Notes
                    </p>
                    <p className="text-[11px] sm:text-xs text-[var(--gaia-text-muted)]">
                      Saved automatically - stays even if you switch sessions.
                    </p>
                  </div>
                  <textarea
                    value={notes}
                    onChange={(e) => handleNotesChange(e.target.value)}
                    className="mt-2 w-full rounded-xl border gaia-border bg-[var(--gaia-surface-soft)] px-3 py-3 text-sm text-[var(--gaia-foreground)] outline-none focus:border-info focus:ring-2 focus:ring-info/30 min-h-[220px]"
                    placeholder="Add your own notes, reflections, or code examples for this lesson..."
                  />
                </div>
              )}
            </>
          )}

          <footer className="pt-4 border-t gaia-border flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs sm:text-sm text-[var(--gaia-text-muted)]">
              <span>Course {activeArc.label}</span>
              <span>-</span>
              <span>Lesson {activeLesson.code}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {prevLesson && (
                <Link
                  href={`/apollo/academy/Paths/lesson/${prevLesson.id}`}
                  className="inline-flex items-center justify-center rounded-full border gaia-border bg-[var(--gaia-surface-soft)] px-4 py-2 text-xs sm:text-sm font-semibold text-[var(--gaia-foreground)] hover:bg-[var(--gaia-surface)] shadow-sm"
                >
                  {"<- Previous"}
                </Link>
              )}
              {nextLesson && (
                <Link
                  href={`/apollo/academy/Paths/lesson/${nextLesson.id}`}
                  className="inline-flex items-center justify-center rounded-full border border-info bg-info text-contrast-text px-4 py-2 text-xs sm:text-sm font-semibold shadow-sm hover:shadow-md transition"
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
