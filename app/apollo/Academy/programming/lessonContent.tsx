"use client";

import { useEffect, useMemo, useState } from "react";
import CodePlayground from "../components/CodePlayground";
import { readJSON, writeJSON } from "@/lib/user-storage";
import {
  StudyDescription,
  QuizConfig,
  PracticePrompt,
  PracticeCheckResult,
} from "./lessonTypes";
import {
  getCapstonePractice,
  getCapstoneQuiz,
  getCapstoneStudy,
  validateCapstonePractice,
} from "./sections/capstone";
import {
  getFoundationsStudy,
  getFoundationsQuiz,
  getFoundationsPractice,
  validateFoundationsPractice,
} from "./sections/foundations";
import {
  getHtmlStudy,
  getHtmlQuiz,
  getHtmlPractice,
  validateHtmlPractice,
} from "./sections/html";
import {
  getCssStudy,
  getCssQuiz,
  getCssPractice,
  validateCssPractice,
} from "./sections/css";
import {
  getJsStudy,
  getJsQuiz,
  getJsPractice,
  validateJsPractice,
} from "./sections/javascript";
import {
  getReactNextPractice,
  getReactNextQuiz,
  getReactNextStudy,
  validateReactNextPractice,
} from "./sections/reactNext";
import {
  getSupabasePractice,
  getSupabaseQuiz,
  getSupabaseStudy,
  validateSupabasePractice,
} from "./sections/supabase";

type TabId = "study" | "quiz" | "practice";

type ProgrammingLessonContentProps = {
  lessonCode: string;
  isCompleted: boolean;
  onLessonCompleted: () => void;
};

const MIN_PRACTICE_LENGTH = 250;

function resolveStudy(lessonCode: string): StudyDescription {
  const resolvers = [
    getFoundationsStudy,
    getHtmlStudy,
    getCssStudy,
    getJsStudy,
    getReactNextStudy,
    getSupabaseStudy,
    getCapstoneStudy,
  ];
  for (const resolver of resolvers) {
    const result = resolver(lessonCode);
    if (result) return result;
  }
  return {
    title: "Lesson coming soon",
    paragraphs: [
      "This lesson path is already planned in your GAIA roadmap, but the detailed content has not been written yet.",
      "For now, you can use this slot as a reminder that you are supposed to study something here, and you can add your own notes in the practice area.",
    ],
  };
}

function resolveQuiz(lessonCode: string): QuizConfig | null {
  const resolvers = [
    getFoundationsQuiz,
    getHtmlQuiz,
    getCssQuiz,
    getJsQuiz,
    getReactNextQuiz,
    getSupabaseQuiz,
    getCapstoneQuiz,
  ];
  for (const resolver of resolvers) {
    const result = resolver(lessonCode);
    if (result) return result;
  }
  return null;
}

function resolvePractice(lessonCode: string): PracticePrompt {
  const resolvers = [
    getFoundationsPractice,
    getHtmlPractice,
    getCssPractice,
    getJsPractice,
    getReactNextPractice,
    getSupabasePractice,
    getCapstonePractice,
  ];
  for (const resolver of resolvers) {
    const result = resolver(lessonCode);
    if (result) return result;
  }
  return {
    title: "Practice coming soon",
    description:
      "This lesson will get a concrete coding or writing practice later. For now, you can write notes here or play in the code playground.",
    instructions: [
      "Write what you already know about this topic.",
      "Add any questions you have so future-you and GAIA can answer them later.",
    ],
  };
}

function resolvePracticeValidation(
  lessonCode: string,
  content: string
): PracticeCheckResult {
  const resolvers = [
    validateFoundationsPractice,
    validateHtmlPractice,
    validateCssPractice,
    validateJsPractice,
    validateReactNextPractice,
    validateSupabasePractice,
    validateCapstonePractice,
  ];
  for (const resolver of resolvers) {
    const result = resolver(lessonCode, content);
    if (result) return result;
  }
  if (content.trim().length < MIN_PRACTICE_LENGTH) {
    return {
      ok: false,
      message:
        "Write a bit more so future-you can really understand it. Aim for at least 250 characters.",
    };
  }
  return { ok: true };
}

const ProgrammingLessonContent = ({
  lessonCode,
  isCompleted,
  onLessonCompleted,
}: ProgrammingLessonContentProps) => {
  const [notes, setNotes] = useState<string>("");
  const notesKey = `gaia.academy.notes.programming.${lessonCode}`;

  useEffect(() => {
    const stored = readJSON<string | null>(notesKey, null);
    if (stored !== null) {
      setNotes(stored);
    } else {
      setNotes("");
    }
  }, [notesKey]);

  const handleNotesChange = (value: string) => {
    setNotes(value);
    writeJSON(notesKey, value);
  };

  const [activeTab, setActiveTab] = useState<TabId>("study");
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [practiceText, setPracticeText] = useState("");
  const [practiceStatus, setPracticeStatus] = useState<
    "idle" | "error" | "success"
  >("idle");
  const [practiceMessage, setPracticeMessage] = useState<string | null>(null);

  const quizConfig = useMemo(() => resolveQuiz(lessonCode), [lessonCode]);
  const study = useMemo(() => resolveStudy(lessonCode), [lessonCode]);
  const practice = useMemo(
    () => resolvePractice(lessonCode),
    [lessonCode]
  );

  const allAnswered =
    !!quizConfig &&
    quizConfig.questions.every(
      (q) => quizAnswers[q.id] && quizAnswers[q.id].length > 0
    );

  const allCorrect =
    !!quizConfig &&
    quizConfig.questions.every(
      (q) => quizAnswers[q.id] === q.correctOptionId
    );

  const handleQuizSubmit = () => {
    if (!quizConfig) return;
    setQuizSubmitted(true);
  };

  const handlePracticeCheck = () => {
    const trimmed = practiceText.trim();

    if (trimmed.length < MIN_PRACTICE_LENGTH) {
      setPracticeStatus("error");
      setPracticeMessage(
        `Write a bit more so future-you can really understand it. Aim for at least ${MIN_PRACTICE_LENGTH} characters.`
      );
      return;
    }

    const validation = resolvePracticeValidation(lessonCode, trimmed);
    if (!validation.ok) {
      setPracticeStatus("error");
      setPracticeMessage(
        validation.message ||
          "Something is still missing. Re-read the instructions and adjust your code/text."
      );
      return;
    }

    if (!allCorrect) {
      setPracticeStatus("error");
      setPracticeMessage(
        "Your practice looks good, but some quiz answers are still incorrect. Go back to the Quiz tab, review the explanations, and try again."
      );
      return;
    }

    setPracticeStatus("success");
    setPracticeMessage(
      "Great. You passed both the quiz and the practice check. This lesson is now marked as completed."
    );

    if (!isCompleted) {
      onLessonCompleted();
    }
  };

  let codeLanguage: "html" | "css" | "js" = "html";
  if (lessonCode.startsWith("3.")) {
    codeLanguage = "css";
  } else if (
    lessonCode.startsWith("4.") ||
    lessonCode.startsWith("5.") ||
    lessonCode.startsWith("6.") ||
    lessonCode.startsWith("7.")
  ) {
    codeLanguage = "js";
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {(["study", "quiz", "practice"] as TabId[]).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`inline-flex items-center justify-center rounded-full px-3 py-1 text-[11px] sm:text-xs font-semibold border ${
              activeTab === tab
                ? "bg-white text-black border-white"
                : "bg-black/40 text-white border-white/20 hover:border-white/40"
            }`}
          >
            {tab === "study" && "1 - Study"}
            {tab === "quiz" && "2 - Quiz"}
            {tab === "practice" && "3 - Practice"}
          </button>
        ))}
      </div>

      {activeTab === "study" && (
        <div className="space-y-3">
          <h3 className="text-sm sm:text-base font-semibold gaia-strong">
            {study.title}
          </h3>
          {study.paragraphs.map((p, idx) => (
            <p key={idx} className="text-xs sm:text-sm gaia-muted">
              {p}
            </p>
          ))}
        </div>
      )}

      {activeTab === "quiz" && (
        <div className="space-y-3">
          {quizConfig ? (
            <>
              <h3 className="text-sm sm:text-base font-semibold gaia-strong">
                {quizConfig.title}
              </h3>
              <div className="space-y-3">
                {quizConfig.questions.map((q, index) => {
                  const selected = quizAnswers[q.id];
                  const isCorrect =
                    selected && selected === q.correctOptionId;
                  const isWrong =
                    quizSubmitted &&
                    selected &&
                    selected !== q.correctOptionId;

                  return (
                    <div
                      key={q.id}
                      className="rounded-xl border border-white/10 bg-black/40 p-3 sm:p-4 space-y-2"
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
                                setPracticeStatus("idle");
                                setPracticeMessage(null);
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
                              ? "text-emerald-300"
                              : isWrong
                              ? "text-amber-300"
                              : "gaia-muted"
                          }`}
                        >
                          {isCorrect
                            ? "Correct."
                            : "Not quite. Read the explanation and try to see the pattern."}
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
                  onClick={handleQuizSubmit}
                  disabled={!quizConfig || !allAnswered}
                  className="inline-flex items-center justify-center rounded-full px-3 py-1 text-[11px] sm:text-xs font-semibold bg-white text-black disabled:bg-white/30 disabled:text-black/50"
                >
                  Check my answers
                </button>
                {quizSubmitted && quizConfig && allCorrect && (
                  <p className="text-[11px] sm:text-xs text-emerald-300">
                    Great. You&apos;re ready to move to practice.
                  </p>
                )}
              </div>
            </>
          ) : (
            <p className="text-xs sm:text-sm gaia-muted">
              A quiz for this lesson is not ready yet. You can switch back to
              Study or Practice for now.
            </p>
          )}
        </div>
      )}

      {activeTab === "practice" && (
        <div className="space-y-3">
          <h3 className="text-sm sm:text-base font-semibold gaia-strong">
            {practice.title}
          </h3>
          <p className="text-xs sm:text-sm gaia-muted">
            {practice.description}
          </p>
          <ul className="list-disc pl-4 space-y-1">
            {practice.instructions.map((item, idx) => (
              <li
                key={idx}
                className="text-[11px] sm:text-xs gaia-muted"
              >
                {item}
              </li>
            ))}
          </ul>

          <textarea
            className="mt-2 h-32 w-full rounded-xl border border-white/15 bg-black/40 p-2 text-xs sm:text-sm text-white outline-none focus:border-white/40"
            placeholder="Write your explanation or code here..."
            value={practiceText}
            onChange={(e) => {
              setPracticeText(e.target.value);
              setPracticeStatus("idle");
              setPracticeMessage(null);
            }}
          />

          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={handlePracticeCheck}
              className="inline-flex items-center justify-center rounded-full px-3 py-1 text-[11px] sm:text-xs font-semibold bg-white text-black"
            >
              Check practice &amp; mark lesson
            </button>
            <p className="text-[11px] sm:text-xs gaia-muted">
              {practiceText.trim().length}/{MIN_PRACTICE_LENGTH} characters
            </p>
          </div>

          {practiceStatus === "error" && practiceMessage && (
            <p className="text-[11px] sm:text-xs text-amber-300">
              {practiceMessage}
            </p>
          )}
          {practiceStatus === "success" && practiceMessage && (
            <p className="text-[11px] sm:text-xs text-emerald-300">
              {practiceMessage}
            </p>
          )}

          <div className="mt-4 rounded-xl border border-white/10 bg-black/40 p-3">
            <p className="text-[11px] sm:text-xs gaia-muted mb-2">
              Optional: play in the code playground for this lesson. For HTML,
              CSS, and JavaScript lessons, try building the structures we
              described above. You can also paste your final code into the
              practice box so GAIA can check it.
            </p>
            <CodePlayground
              language={codeLanguage}
              initialCode={
                codeLanguage === "css"
                  ? "/* Write your CSS here... */\n"
                  : codeLanguage === "js"
                  ? "// Write your JavaScript here...\n"
                  : `<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <title>Practice</title>
  </head>
  <body>
    <h1>Hello Sasa!</h1>
    <p>This is your Academy practice playground.</p>
  </body>
</html>`
              }
            />
          </div>

          <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-3 sm:p-4 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs sm:text-sm font-semibold gaia-strong">
                Your notes for this lesson
              </p>
              <p className="text-[10px] sm:text-xs gaia-muted">
                Saved automatically · stays even if you switch device/session.
              </p>
            </div>
            <textarea
              value={notes}
              onChange={(e) => handleNotesChange(e.target.value)}
              className="mt-1 w-full rounded-xl border border-white/15 bg-black/30 px-3 py-2 text-xs sm:text-sm gaia-strong outline-none focus:border-emerald-400/70 focus:ring-1 focus:ring-emerald-400/50 min-h-[96px]"
              placeholder="Rewrite these ideas in your own words, or paste key code snippets you want future-you to remember."
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ProgrammingLessonContent;
