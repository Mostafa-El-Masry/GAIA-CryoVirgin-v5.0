"use client";

import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  PauseCircleIcon,
  PlayCircleIcon,
  StopIcon,
  VolumeHighIcon,
} from "@hugeicons/core-free-icons";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  readJSON,
  writeJSON,
  removeItem,
  onUserStorageReady,
  subscribe as subscribeStorage,
  setItem,
} from "@/lib/user-storage";
import {
  isSupabaseClientConfigured,
} from "@/lib/supabase-client";
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

const VOICE_PREF_KEY = "gaia.academy.voicePreference";

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

function hashSeed(input: string): number {
  let h = 1779033703 ^ input.length;
  for (let i = 0; i < input.length; i++) {
    h = Math.imul(h ^ input.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return (h >>> 0) || 1;
}

function mulberry32(seed: number): () => number {
  return () => {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
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

  const [override, setOverride] = useState<LessonContentOverride | null>(null);
  const lessonContent = useMemo(
    () => mergeLessonContent(baseContent, override),
    [baseContent, override]
  );
  const quizContent = useMemo(() => {
    if (!lessonContent.quiz) return null;
    const seedBase = `${trackId}:${lessonId}`;
    const questions = lessonContent.quiz.questions.map((q, idx) => {
      const rng = mulberry32(hashSeed(`${seedBase}:${q.id}:${idx}`));
      const shuffled = [...q.options];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(rng() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      return { ...q, options: shuffled };
    });
    return { ...lessonContent.quiz, questions };
  }, [lessonContent.quiz, lessonId, trackId]);

  const isHistoryLesson = trackId === "programming" && lessonId === "prog-0-0";
  const historyTimeline = useMemo(
    () =>
      isHistoryLesson
        ? [
            {
              era: "1843",
              title: "Ada Lovelace",
              note: "Publishes an algorithm for the Analytical Engine — proof that machines can follow instructions.",
            },
            {
              era: "1950s",
              title: "FORTRAN & COBOL",
              note: "First high-level languages make math and business software faster to write than raw machine code.",
            },
            {
              era: "1970s",
              title: "C and UNIX",
              note: "Portability mindset: compile the same logic on many machines and carry your work with you.",
            },
            {
              era: "1990s",
              title: "The Web Stack",
              note: "HTML, CSS, and JavaScript let anyone publish and interact online; browsers become the new runtime.",
            },
            {
              era: "2000s",
              title: "Open Source + Git",
              note: "Sharing code becomes normal; version control and package managers accelerate collaboration.",
            },
            {
              era: "Today",
              title: "Cloud & Frameworks",
              note: "Next.js, Tailwind, Supabase, and npm sit on top of that history so you can ship product ideas fast.",
            },
          ]
        : [],
    [isHistoryLesson]
  );

  const historyThemes = useMemo(
    () =>
      isHistoryLesson
        ? [
            {
              label: "Core principle",
              body: "Programming is clear, ordered instructions. Languages evolve to make those instructions easier to express.",
            },
            {
              label: "Why you care",
              body: "Knowing the arc removes mystery: GAIA is just the newest layer built on a long chain of human-friendly tools.",
            },
            {
              label: "What to do now",
              body: "Write a 10-line timeline in your notes, then explain it out loud. If it feels clear, you are ready to keep going.",
            },
          ]
        : [],
    [isHistoryLesson]
  );

  const [narrationState, setNarrationState] = useState<
    "idle" | "playing" | "paused"
  >("idle");
  const [narrationError, setNarrationError] = useState<string | null>(null);
  const [availableVoices, setAvailableVoices] = useState<
    SpeechSynthesisVoice[]
  >([]);
  const [selectedVoiceId, setSelectedVoiceId] = useState("__auto__");
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">(
    "idle"
  );
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const narrationText = useMemo(
    () =>
      `${lessonContent.study.title}. ${lessonContent.study.paragraphs.join(" ")}`,
    [lessonContent.study.paragraphs, lessonContent.study.title]
  );

  const speechSupported =
    typeof window !== "undefined" && "speechSynthesis" in window;
  const currentUtterance = useRef<SpeechSynthesisUtterance | null>(null);
  const postLessonRun = useCallback(
    async (
      payload: Partial<{
        quizAnswers: Record<string, string>;
        quizCorrect: boolean;
        quizSubmittedAt: string;
        codeLanguage: string;
        codeSubmitted: string;
        codeResult: unknown;
        completedAt: string;
      }>
    ) => {
      try {
        await fetch("/api/academy/lesson-run", {
          method: "POST",
          headers: {
            "content-type": "application/json",
          },
          body: JSON.stringify({
            lessonId,
            trackId,
            ...payload,
          }),
        });
      } catch (error) {
        console.warn("Failed to persist lesson run", error);
      }
    },
    [lessonId, trackId]
  );

  useEffect(() => {
    const applyStoredVoice = () => {
      const stored = readJSON<string | null>(VOICE_PREF_KEY, null);
      if (stored) setSelectedVoiceId(stored);
    };
    applyStoredVoice();
    const offReady = onUserStorageReady(applyStoredVoice);
    const offStorage = subscribeStorage(({ key, value }) => {
      if (key === VOICE_PREF_KEY && typeof value === "string") {
        setSelectedVoiceId(value);
      }
    });
    return () => {
      offReady();
      offStorage();
    };
  }, []);

  const pickVoice = useCallback(() => {
    if (!speechSupported) return null;
    const voices = availableVoices;
    if (!voices?.length) return null;

    if (selectedVoiceId !== "__auto__") {
      const found = voices.find((v) => v.voiceURI === selectedVoiceId);
      if (found) return found;
    }

    const favoredNames = ["female", "woman", "zira", "susan", "eva"];

    const scoreVoice = (voice: SpeechSynthesisVoice) => {
      const name = voice.name.toLowerCase();
      const lang = (voice.lang || "").toLowerCase();
      let score = 0;
      if (favoredNames.some((tag) => name.includes(tag))) score += 100;
      if (lang.startsWith("en")) score += 10;
      return score;
    };

    return voices
      .map((v) => ({ v, score: scoreVoice(v) }))
      .sort((a, b) => b.score - a.score)[0].v;
  }, [availableVoices, selectedVoiceId, speechSupported]);

  const stopNarration = useCallback(() => {
    if (speechSupported) {
      window.speechSynthesis.cancel();
    }
    currentUtterance.current = null;
    setNarrationState("idle");
  }, [speechSupported]);

  const startNarration = useCallback(() => {
    if (!speechSupported) {
      setNarrationError("Audio playback is not available in this browser.");
      return;
    }
    const synth = window.speechSynthesis;
    const preferredVoice = pickVoice();
    const utterance = new SpeechSynthesisUtterance(narrationText);
    utterance.rate = 1;
    utterance.pitch = 1;
    if (preferredVoice) {
      utterance.voice = preferredVoice;
      if (preferredVoice.lang) utterance.lang = preferredVoice.lang;
    }
    utterance.onend = () => {
      currentUtterance.current = null;
      setNarrationState("idle");
    };
    utterance.onerror = () => {
      currentUtterance.current = null;
      setNarrationError("Could not play the lesson audio.");
      setNarrationState("idle");
    };
    setNarrationError(null);
    currentUtterance.current = utterance;
    synth.cancel();
    synth.speak(utterance);
    setNarrationState("playing");
  }, [narrationText, pickVoice, speechSupported]);

  const pauseNarration = useCallback(() => {
    if (!speechSupported) return;
    window.speechSynthesis.pause();
    setNarrationState("paused");
  }, [speechSupported]);

  const resumeNarration = useCallback(() => {
    if (!speechSupported) return;
    window.speechSynthesis.resume();
    setNarrationState("playing");
  }, [speechSupported]);

  const handleToggleReadLesson = useCallback(() => {
    if (narrationState === "idle") {
      startNarration();
    } else if (narrationState === "playing") {
      pauseNarration();
    } else if (narrationState === "paused") {
      resumeNarration();
    }
  }, [narrationState, pauseNarration, resumeNarration, startNarration]);

  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  useEffect(() => {
    const handlePlayable = () => setVideoPlayed(true);
    window.addEventListener("lesson-video-playable", handlePlayable as any);
    return () => {
      window.removeEventListener(
        "lesson-video-playable",
        handlePlayable as any
      );
    };
  }, []);

  useEffect(() => {
    const hydrateLatestRun = async () => {
      try {
        const res = await fetch(
          `/api/academy/lesson-run?lessonId=${encodeURIComponent(lessonId)}`
        );
        if (!res.ok) return;
        const json = (await res.json()) as {
          data?:
            | {
                last_quiz_answers?: Record<string, string> | null;
                last_quiz_correct?: boolean | null;
                quiz_answers?: Record<string, string> | null;
                quiz_correct?: boolean | null;
              }
            | null;
        };
        const answers =
          json.data?.last_quiz_answers ??
          json.data?.quiz_answers ??
          null;
        const correct =
          json.data?.last_quiz_correct ?? json.data?.quiz_correct ?? null;
        if (answers) {
          setQuizAnswers(answers);
          setQuizSubmitted(true);
          if (correct) {
            setSaveMessage("Loaded saved answers from Supabase");
          }
        }
      } catch {
        /* ignore hydrate errors */
      }
    };
    hydrateLatestRun();
  }, [lessonId]);

  useEffect(() => {
    if (!speechSupported) return;
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      setAvailableVoices(voices || []);
    };
    loadVoices();
    window.speechSynthesis.addEventListener?.("voiceschanged", loadVoices);
    return () => {
      window.speechSynthesis.removeEventListener?.("voiceschanged", loadVoices);
    };
  }, [speechSupported]);

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
  const [isEditingLesson, setIsEditingLesson] = useState(false);

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
    let isCancelled = false;

    const loadOverride = async () => {
      try {
        const res = await fetch(
          "/api/academy/lessons?lessonId=" +
            encodeURIComponent(lessonId) +
            "&trackId=" +
            encodeURIComponent(trackId)
        );
        if (!res.ok) {
          console.error("Failed to load lesson override", res.status);
          return;
        }
        const json = (await res.json()) as {
          data?: { content?: LessonContentOverride | null } | null;
        };
        if (isCancelled) return;
        const content = (json?.data?.content ?? null) as LessonContentOverride | null;
        setOverride(content);
      } catch (error) {
        console.error("Error loading lesson override", error);
      }
    };

    loadOverride();

    return () => {
      isCancelled = true;
    };
  }, [lessonId, trackId]);

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
    setIsEditingLesson(false);
  }, [lessonId, baseContent, override]);

  const handleSaveOverride = async () => {
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

    try {
      const res = await fetch("/api/academy/lessons", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          lessonId,
          trackId,
          content: payload,
        }),
      });

      if (!res.ok) {
        throw new Error(`Failed to save lesson override: ${res.status}`);
      }

      const json = (await res.json()) as {
        data?: { content?: LessonContentOverride | null } | null;
      };
      const savedContent =
        (json?.data?.content as LessonContentOverride | null) ?? payload;

      setOverride(savedContent);
      setSaveStatus("saved");
      setSaveMessage(
        "Saved to the Academy lesson table (shared across all users)."
      );
      setIsEditingLesson(false);
    } catch (error) {
      console.error("Failed to save lesson override", error);
      setSaveStatus("idle");
      setSaveMessage(
        "Failed to save lesson. Please check your network or Supabase configuration."
      );
    } finally {
      setTimeout(() => setSaveStatus("idle"), 1200);
    }
  };

  const handleResetOverride = async () => {
    setSaveStatus("saving");
    setSaveMessage(null);

    try {
      const res = await fetch(
        "/api/academy/lessons?lessonId=" + encodeURIComponent(lessonId),
        {
          method: "DELETE",
        }
      );

      if (!res.ok) {
        throw new Error(`Failed to reset lesson override: ${res.status}`);
      }

      setOverride(null);
      setSaveStatus("saved");
      setSaveMessage("Reverted to the original lesson content.");
      setIsEditingLesson(false);
    } catch (error) {
      console.error("Failed to reset lesson override", error);
      setSaveStatus("idle");
      setSaveMessage(
        "Failed to reset lesson. Please check your network or Supabase configuration."
      );
    } finally {
      setTimeout(() => setSaveStatus("idle"), 1200);
    }
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
    if (!quizContent) return false;
    return quizContent.questions.every(
      (q) => quizAnswers[q.id] === q.correctOptionId
    );
  }, [quizContent, quizAnswers]);
  const isPlaygroundLocked = Boolean(
    trackId === "programming" && quizContent && !allCorrectNow
  );
  const [videoPlayed, setVideoPlayed] = useState(false);
  const [codePassed, setCodePassed] = useState(false);
  const [activeCompleted, setActiveCompleted] = useState(
    isLessonCompleted(trackId, lessonId)
  );
  const allCorrect = quizSubmitted && allCorrectNow;

  useEffect(() => {
    if (!activeCompleted && allCorrectNow && videoPlayed && codePassed) {
      toggleLessonCompleted(trackId, lessonId);
      setActiveCompleted(true);
    }
  }, [
    activeCompleted,
    allCorrectNow,
    codePassed,
    videoPlayed,
    lessonId,
    trackId,
    toggleLessonCompleted,
  ]);
  const handleSubmitQuiz = useCallback(() => {
    setQuizSubmitted(true);
    setSaveStatus("saving");
    const payload = {
      quizAnswers,
      quizCorrect: allCorrectNow,
      quizSubmittedAt: new Date().toISOString(),
    };
    void postLessonRun(payload)
      .then(() => {
        setSaveStatus("saved");
        setSaveMessage("Saved to Supabase");
        setTimeout(() => setSaveStatus("idle"), 1200);
      })
      .catch(() => {
        setSaveStatus("idle");
      });
  }, [allCorrectNow, postLessonRun, quizAnswers]);

  useEffect(() => {
    if (!quizContent) return;
    if (quizSubmitted && allCorrectNow) {
      writeJSON(quizKey, {
        answers: quizAnswers,
        submitted: true,
        allCorrect: true,
      });
    } else {
      removeItem(quizKey);
    }
  }, [quizSubmitted, allCorrectNow, quizAnswers, quizKey, quizContent]);

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
  const handlePlaygroundRun = useCallback(
    (code: string) => {
      const result = {
        ok: true,
        message: "Preview updated. Saved to your lesson history.",
      };
      void postLessonRun({
        codeLanguage,
        codeSubmitted: code,
        codeResult: result,
      });
      setCodePassed(true);
      return result;
    },
    [codeLanguage, postLessonRun]
  );
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
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-full border gaia-border bg-[var(--gaia-surface-soft)] px-4 py-2 text-xs sm:text-sm font-semibold text-[var(--gaia-foreground)] hover:bg-[var(--gaia-surface)] shadow-sm"
            >
              Review TODO first
            </Link>
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
          <Link
            href="/TODO"
            className="inline-flex items-center gap-2 rounded-full border gaia-border px-3 py-1.5 bg-[var(--gaia-surface-soft)] text-[var(--gaia-foreground)] hover:bg-[var(--gaia-surface)] font-semibold"
          >
            TODO dashboard
          </Link>
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
              <div className="flex flex-wrap items-center gap-2 text-xs">
                {saveMessage && (
                  <span className="rounded-full bg-[var(--gaia-surface)] px-3 py-1 font-semibold text-[var(--gaia-text-muted)]">
                    {saveMessage}
                  </span>
                )}
                {isEditingLesson ? (
                  <>
                    <button
                      type="button"
                      onClick={handleResetOverride}
                      className="rounded-full border gaia-border px-3 py-1 font-semibold text-[var(--gaia-text-default)] hover:bg-[var(--gaia-surface)]"
                    >
                      Reset to default
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditingLesson(false)}
                      className="rounded-full border gaia-border px-3 py-1 font-semibold text-[var(--gaia-text-default)] hover:bg-[var(--gaia-surface)]"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsEditingLesson(true)}
                    className="rounded-full border gaia-border px-3 py-1 font-semibold text-[var(--gaia-text-default)] hover:bg-[var(--gaia-surface)]"
                  >
                    Edit lesson copy
                  </button>
                )}
              </div>
            </div>

            {isEditingLesson ? (
              <>
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
              </>
            ) : (
              <p className="text-xs text-[var(--gaia-text-muted)]">
                Your lesson copy is hidden until you choose to edit. Click{" "}
                <span className="font-semibold text-[var(--gaia-foreground)]">Edit lesson copy</span> to customize this lesson.
              </p>
            )}
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
              const isLocked = tab === "notes" && isPlaygroundLocked;
              return (
                <button
                  key={tab}
                  type="button"
                  disabled={isLocked}
                  onClick={() => {
                    if (isLocked) return;
                    setActiveTab(tab);
                  }}
                  className={[
                    "px-4 py-2 rounded-full transition-colors",
                    isLocked ? "opacity-50 cursor-not-allowed" : "",
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
          {isPlaygroundLocked && (
            <p className="text-[11px] text-amber-700">
              Complete the quiz correctly to unlock the playground.
            </p>
          )}

          {activeTab === "lesson" && (
            <div className="space-y-4">
              {isHistoryLesson && (
                <div className="rounded-2xl border gaia-border bg-[var(--gaia-surface-soft)] p-4 sm:p-5 shadow-sm space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--gaia-text-muted)]">
                        Course 0 - Lesson 0.0
                      </p>
                      <h3 className="text-xl sm:text-2xl font-semibold text-[var(--gaia-foreground)] leading-tight">
                        Programming history snapshot
                      </h3>
                      <p className="text-sm text-[var(--gaia-text-muted)]">
                        A quick list of milestones so the lesson text below has anchors.
                      </p>
                    </div>
                    <span className="rounded-full border gaia-border px-3 py-1 text-xs font-semibold text-[var(--gaia-text-muted)] bg-[var(--gaia-surface)]">
                      Why this is here
                    </span>
                  </div>

                  <div className="space-y-3">
                    {historyTimeline.map((item, idx) => {
                      const isLast = idx === historyTimeline.length - 1;
                      return (
                        <div key={item.era} className="flex gap-3">
                          <div className="flex flex-col items-center">
                            <span className="h-3 w-3 rounded-full bg-info shadow-sm" />
                            {!isLast && (
                              <span className="flex-1 w-px bg-[var(--gaia-border)]" />
                            )}
                          </div>
                          <div className="flex-1 rounded-xl border gaia-border bg-white/70 px-3 py-3 shadow-[0_1px_4px_rgba(15,23,42,0.08)]">
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--gaia-text-muted)]">
                                {item.era}
                              </span>
                              <span className="rounded-full border gaia-border bg-[var(--gaia-surface)] px-2 py-[2px] text-[11px] font-semibold text-[var(--gaia-text-muted)]">
                                {idx + 1}/{historyTimeline.length}
                              </span>
                            </div>
                            <p className="mt-1 text-sm font-semibold text-[var(--gaia-foreground)]">
                              {item.title}
                            </p>
                            <p className="text-[12px] text-[var(--gaia-text-muted)] leading-relaxed">
                              {item.note}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={handleToggleReadLesson}
                      className="inline-flex h-10 w-10 items-center justify-center rounded-full border gaia-border bg-[var(--gaia-surface)] text-[var(--gaia-foreground)] hover:bg-[var(--gaia-surface-soft)] transition"
                      aria-label={
                        narrationState === "playing"
                          ? "Pause narration"
                          : narrationState === "paused"
                          ? "Resume narration"
                          : "Play narration"
                      }
                    >
                      {narrationState === "playing" ? (
                        <HugeiconsIcon icon={PauseCircleIcon} size={16} />
                      ) : narrationState === "paused" ? (
                        <HugeiconsIcon icon={PlayCircleIcon} size={16} />
                      ) : (
                        <HugeiconsIcon icon={VolumeHighIcon} size={16} />
                      )}
                      </button>
                    {narrationState !== "idle" && (
                      <button
                        type="button"
                        onClick={stopNarration}
                        className="inline-flex items-center gap-1 rounded-full border gaia-border bg-[var(--gaia-surface)] px-2.5 py-1 text-[12px] font-semibold text-[var(--gaia-text-muted)] hover:bg-[var(--gaia-surface-soft)] transition"
                      >
                        <HugeiconsIcon icon={StopIcon} size={14} />
                        <span>Stop</span>
                      </button>
                    )}
                    {!speechSupported && (
                      <span className="text-[11px] text-[var(--gaia-text-muted)]">
                        Audio not supported in this browser.
                      </span>
                    )}
                    {narrationError && (
                      <span className="text-[11px] text-amber-700">
                        {narrationError}
                      </span>
                    )}
                  </div>

                  <div className="rounded-xl border gaia-border bg-[var(--gaia-surface)] px-3 py-3 space-y-1">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--gaia-text-muted)]">
                      Why it matters
                    </p>
                    {historyThemes.map((theme) => (
                      <div key={theme.label} className="flex gap-2 items-start text-sm text-[var(--gaia-text-default)]">
                        <span className="mt-1 h-2 w-2 rounded-full bg-emerald-500" />
                        <div>
                          <p className="font-semibold text-[var(--gaia-foreground)]">{theme.label}</p>
                          <p className="text-[13px] text-[var(--gaia-text-muted)] leading-relaxed">
                            {theme.body}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <article className="prose prose-slate max-w-none text-[var(--gaia-text-default)] prose-headings:mt-0 prose-headings:text-[var(--gaia-foreground)] prose-p:leading-7 prose-p:text-[var(--gaia-text-default)] prose-ul:pl-5 prose-li:marker:text-[var(--gaia-text-muted)] prose-strong:text-[var(--gaia-foreground)]">
                <h3 className="text-2xl font-semibold text-[var(--gaia-foreground)] leading-tight">
                  {lessonContent.study.title}
                </h3>
                {lessonContent.study.paragraphs.map((paragraph, idx) => (
                  <p key={idx}>{paragraph}</p>
                ))}
              </article>
            </div>
          )}

          {activeTab === "quiz" && (
            <div className="space-y-4 text-sm sm:text-base text-[var(--gaia-text-default)]">
              {quizContent ? (
                <>
                  <div className="space-y-1">
                    <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[var(--gaia-text-muted)]">
                      Quick check
                    </p>
                    <h3 className="text-xl sm:text-2xl font-semibold text-[var(--gaia-foreground)] leading-tight">
                      {quizContent.title}
                    </h3>
                    <p className="text-sm text-[var(--gaia-text-muted)]">
                      Answer each question and then check for feedback. Submissions save to your account.
                    </p>
                    {saveMessage && (
                      <p className="text-[11px] font-semibold text-emerald-700">
                        {saveMessage}
                      </p>
                    )}
                  </div>
                  <div className="space-y-3">
                    {quizContent.questions.map((q, index) => {
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
                      onClick={handleSubmitQuiz}
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

          {activeTab === "notes" && !isPlaygroundLocked && (
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
                    {activeCompleted && (
                      <p className="text-[11px] font-semibold text-emerald-700">
                        Lesson marked complete (video + quiz + playground).
                      </p>
                    )}
                  </div>
                  <CodePlayground
                    initialCode={defaultCodeSnippet}
                    language={codeLanguage}
                    onValidate={handlePlaygroundRun}
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
