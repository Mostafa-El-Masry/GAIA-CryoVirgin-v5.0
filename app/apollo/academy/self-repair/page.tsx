"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { useAcademyProgress } from "../useAcademyProgress";

type LessonContent = {
  intro: string;
  actions: string[];
  prompts: string[];
  safeguard?: string;
};

type Lesson = {
  id: string;
  arcId: string;
  code: string;
  title: string;
  estimate: string;
  content?: LessonContent;
};

type Arc = {
  id: string;
  label: string;
  title: string;
  focus: string;
  lessons: Lesson[];
};

const lessonContent: Record<string, LessonContent> = {
  "self-1-1": {
    intro:
      "Get a clean snapshot of how your days actually run so you can see where you lose energy.",
    actions: [
      "Track three days in a simple table: bed time, wake time, meals, caffeine, screen time, and energy (1-10).",
      "Mark any pain spikes, anxiety peaks, or focus dips with a quick note about what happened right before.",
      "Highlight one pattern that repeats (sleep timing, skipping meals, doom scrolling).",
    ],
    prompts: [
      'What does a "good" day look like now versus a rough one?',
      "Where do you usually lose the thread: morning, afternoon, or evening?",
      "Which tiny change would remove the most friction tomorrow?",
    ],
    safeguard:
      "If tracking feels heavy, do it once per day in three bullet points instead of minute by minute.",
  },
  "self-1-2": {
    intro:
      "Install one reliable daily anchor that survives bad days and keeps you pointed at recovery.",
    actions: [
      "Pick one anchor that takes 5-10 minutes (sunlight walk, protein breakfast, or one glass of water before screens).",
      "Define the minimum version for bad days and the normal version for average days.",
      "Place the anchor in your calendar with a reminder and a visible cue (post-it or phone alarm).",
    ],
    prompts: [
      "Which anchor would reduce the most chaos if it fired every day?",
      "What blocks stopped you before (time, supplies, mood)? How will you sidestep them?",
      "How will you know the anchor is working after one week?",
    ],
    safeguard:
      "If you miss a day, restart the next one without doubling it. The win is consistency, not intensity.",
  },
  "self-1-3": {
    intro:
      "Move gently to signal safety to your body without triggering perfectionism or injury.",
    actions: [
      "Choose one 10-15 minute walk route you can do without planning.",
      "Add a five minute stretch sequence (neck, shoulders, hips, calves) you can play while one song runs.",
      "Set two movement windows in your week (for example Tue/Thu) and one optional weekend bonus.",
    ],
    prompts: [
      "What movements feel good versus punishing?",
      "When in the day do you feel most willing to move, even slightly?",
      "How will you notice early fatigue signals and slow down instead of quitting?",
    ],
    safeguard:
      "If you are sore or low, swap to breath work or a five minute floor stretch instead of skipping entirely.",
  },
  "self-1-4": {
    intro:
      'Design a "bad day" script so you know exactly what minimums to do and what to avoid.',
    actions: [
      "Write a 10 line protocol: wake steps, hydration, one safe meal, one short movement, one person to message.",
      "List three things to avoid on bad days (news, arguments, caffeine spikes).",
      "Pre-pack a small kit: shelf stable snacks, electrolytes, a warm layer, headphones with a calming playlist.",
    ],
    prompts: [
      "What usually makes bad days spiral faster?",
      "Who can you update with a one line check-in so you are not invisible?",
      'What proves you have done "enough" for today, even if nothing else moves?',
    ],
    safeguard:
      "If you cannot do the full protocol, do the first two lines only: drink water and send the check-in message.",
  },
};

const arcs: Arc[] = [
  {
    id: "self-1-basics",
    label: "Arc 1",
    title: "Stabilizing the Basics",
    focus:
      "Sleep, food, basic movement, and tiny daily anchors. No perfection, just a steady baseline that keeps you upright.",
    lessons: [
      {
        id: "self-1-1",
        arcId: "self-1-basics",
        code: "1.1",
        title: "Mapping Your Current Rhythm (Sleep, Food, Energy)",
        estimate: "45 min reflection",
        content: lessonContent["self-1-1"],
      },
      {
        id: "self-1-2",
        arcId: "self-1-basics",
        code: "1.2",
        title: "Designing One Small Daily Anchor",
        estimate: "45 min reflection",
        content: lessonContent["self-1-2"],
      },
      {
        id: "self-1-3",
        arcId: "self-1-basics",
        code: "1.3",
        title: "Gentle Movement: Walks, Stretching, and Realistic Goals",
        estimate: "45 min reflection",
        content: lessonContent["self-1-3"],
      },
      {
        id: "self-1-4",
        arcId: "self-1-basics",
        code: "1.4",
        title: "Bad Days Protocol: Minimum Baseline to Not Collapse",
        estimate: "45 min reflection",
        content: lessonContent["self-1-4"],
      },
    ],
  },
  {
    id: "self-2-voice",
    label: "Arc 2",
    title: "The Inner Voice",
    focus:
      "Notice the inner attacker, separate it from reality, and slowly replace automatic self-hate with more honest, kinder thoughts.",
    lessons: [
      {
        id: "self-2-1",
        arcId: "self-2-voice",
        code: "2.1",
        title: "Catching the Inner Attacker in Real Sentences",
        estimate: "50 min reflection",
      },
      {
        id: "self-2-2",
        arcId: "self-2-voice",
        code: "2.2",
        title: "Separating Facts from Attacks",
        estimate: "50 min reflection",
      },
      {
        id: "self-2-3",
        arcId: "self-2-voice",
        code: "2.3",
        title: "Building a More Honest, Kinder Counter-Voice",
        estimate: "50 min reflection",
      },
      {
        id: "self-2-4",
        arcId: "self-2-voice",
        code: "2.4",
        title: "Responding to Shame Without Disappearing",
        estimate: "50 min reflection",
      },
    ],
  },
  {
    id: "self-3-people",
    label: "Arc 3",
    title: "People and Boundaries",
    focus:
      "Understand which relationships drain you and which support you, and practice tiny boundaries so you do not feel like a toy or a burden.",
    lessons: [
      {
        id: "self-3-1",
        arcId: "self-3-people",
        code: "3.1",
        title: "Mapping Draining vs Supportive People",
        estimate: "50 min reflection",
      },
      {
        id: "self-3-2",
        arcId: "self-3-people",
        code: "3.2",
        title: "Tiny Boundaries: Delays, Shorter Calls, Less Explaining",
        estimate: "50 min reflection",
      },
      {
        id: "self-3-3",
        arcId: "self-3-people",
        code: "3.3",
        title: "Guilt vs Responsibility",
        estimate: "50 min reflection",
      },
      {
        id: "self-3-4",
        arcId: "self-3-people",
        code: "3.4",
        title: "Protecting Your Energy Around Family and Work",
        estimate: "50 min reflection",
      },
    ],
  },
  {
    id: "self-4-meaning",
    label: "Arc 4",
    title: "Meaning and GAIA",
    focus:
      "Use GAIA as a map instead of a stick to beat yourself with. Connect your studies and work to a bigger story that makes sense.",
    lessons: [
      {
        id: "self-4-1",
        arcId: "self-4-meaning",
        code: "4.1",
        title: "Reframing GAIA: From Self-Attack to Self-Support",
        estimate: "45 min reflection",
      },
      {
        id: "self-4-2",
        arcId: "self-4-meaning",
        code: "4.2",
        title: "Connecting Study Paths to Real Future Scenarios",
        estimate: "45 min reflection",
      },
      {
        id: "self-4-3",
        arcId: "self-4-meaning",
        code: "4.3",
        title: "Designing Rituals that Make You Feel Like a Person, Not a Machine",
        estimate: "45 min reflection",
      },
    ],
  },
  {
    id: "self-5-relapse",
    label: "Arc 5",
    title: "Relapse and Maintenance Plan",
    focus:
      "Design what you will do on bad days before they happen: who to talk to, what to avoid, and which tiny steps help you not disappear.",
    lessons: [
      {
        id: "self-5-1",
        arcId: "self-5-relapse",
        code: "5.1",
        title: "Defining Your Early Warning Signs",
        estimate: "45 min reflection",
      },
      {
        id: "self-5-2",
        arcId: "self-5-relapse",
        code: "5.2",
        title: "Building a Personal Emergency List (People, Actions, Words)",
        estimate: "45 min reflection",
      },
      {
        id: "self-5-3",
        arcId: "self-5-relapse",
        code: "5.3",
        title: "Review and Adjust: Keeping the Plan Realistic",
        estimate: "45 min reflection",
      },
    ],
  },
];

const totalLessons = arcs.reduce((sum, arc) => sum + arc.lessons.length, 0);

export default function SelfRepairTrackPage() {
  const { isLessonCompleted, toggleLessonCompleted, markStudyVisit } =
    useAcademyProgress();
  const pathname = usePathname();
  const [activeLessonId, setActiveLessonId] = useState<string | null>(
    arcs[0]?.lessons[0]?.id ?? null
  );
  const [activeArcFilter, setActiveArcFilter] = useState<string>("all");

  useEffect(() => {
    markStudyVisit("self-repair");
  }, [markStudyVisit]);

  const allLessons = useMemo(() => arcs.flatMap((arc) => arc.lessons), []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const hash = window.location.hash.replace("#", "");
    if (hash && allLessons.some((lesson) => lesson.id === hash)) {
      setActiveLessonId(hash);
      setActiveArcFilter("all");
      return;
    }
    const lastSegment = pathname?.split("/").filter(Boolean).pop();
    if (lastSegment && allLessons.some((lesson) => lesson.id === lastSegment)) {
      setActiveLessonId(lastSegment);
      setActiveArcFilter("all");
    }
  }, [allLessons, pathname]);

  const activeLesson =
    activeLessonId && allLessons.find((lesson) => lesson.id === activeLessonId);
  const completionCount = allLessons.filter((lesson) =>
    isLessonCompleted("self-repair", lesson.id)
  ).length;
  const completionPercent =
    totalLessons === 0
      ? 0
      : Math.round((completionCount / totalLessons) * 100);

  const arcFilters = useMemo(
    () => [{ id: "all", label: "All arcs" }, ...arcs.map((arc) => ({ id: arc.id, label: arc.label }))],
    []
  );

  const visibleArcs =
    activeArcFilter === "all"
      ? arcs
      : arcs.filter((arc) => arc.id === activeArcFilter);

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 space-y-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <p className="text-[11px] sm:text-xs font-semibold uppercase tracking-[0.22em] gaia-muted">
            Academy - Self-Repair path
          </p>
          <h1 className="text-xl sm:text-2xl font-semibold gaia-strong">
            Self-Repair - Rebuilding Me
          </h1>
          <p className="text-sm gaia-muted max-w-2xl">
            Stabilize body, voice, and story while you keep studying and working. Fridays are reserved for this path.
          </p>
          <p className="text-xs gaia-muted">
            Total planned reflections: <span className="gaia-strong">{totalLessons}</span>. Repeat the lessons that help.
          </p>
        </div>

        <div className="inline-flex items-center gap-3 rounded-full border gaia-border gaia-ink-soft px-3 py-2 text-xs sm:text-sm shadow-sm">
          <div className="flex flex-col">
            <span className="gaia-muted text-[11px] uppercase tracking-[0.22em]">
              Overall progress
            </span>
            <span className="gaia-strong text-sm">
              {completionCount}/{totalLessons} lessons - {completionPercent}%
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

            {!activeLesson && (
        <section className="space-y-4">
                  {visibleArcs.map((arc) => (
                    <article
                      key={arc.id}
                      className="rounded-2xl gaia-panel-soft p-4 sm:p-5 shadow-sm border gaia-border"
                    >
                      <div className="flex items-center gap-3">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] rounded-full px-2 py-0.5 text-contrast-text bg-info">
                          {arc.label}
                        </p>
                        <h2 className="mt-0 text-sm font-semibold gaia-strong">
                          {arc.title}
                        </h2>
                      </div>
                      <p className="mt-2 text-xs gaia-muted">{arc.focus}</p>

                      <ul className="mt-3 space-y-1.5 text-xs gaia-muted">
                        {arc.lessons.map((lesson) => {
                          const completed = isLessonCompleted("self-repair", lesson.id);
                          const isActive = lesson.id === activeLessonId;
                          return (
                            <li
                              id={lesson.id}
                              key={lesson.id}
                              className={`flex flex-col gap-2 rounded-xl border gaia-border px-3 py-2 ${
                                completed ? "bg-info/10" : "gaia-ink-soft"
                              } ${isActive ? "ring-2 ring-info/60" : ""}`}
                            >
                              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                <button
                                  type="button"
                                  onClick={() => setActiveLessonId(lesson.id)}
                                  className="flex w-full items-center justify-between gap-3 text-left"
                                >
                                  <div className="flex items-center gap-3">
                                    <span
                                      className={`inline-flex items-center justify-center text-[11px] font-semibold rounded-full px-2 py-0.5 w-10 ${
                                        completed
                                          ? "bg-info text-contrast-text"
                                          : "bg-info/10 text-info"
                                      }`}
                                    >
                                      {lesson.code}
                                    </span>
                                    <span className="flex-1 text-[13px] sm:text-sm gaia-strong">
                                      {lesson.title}
                                    </span>
                                  </div>
                                  <span className="text-[11px] font-semibold gaia-muted">
                                    {lesson.content ? lesson.estimate : "0 min (MBT)"}
                                  </span>
                                </button>

                                <div className="flex items-center gap-2">
                                  <span className="text-[11px] gaia-muted">
                                    {completed ? "Completed" : "Mark done"}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      toggleLessonCompleted("self-repair", lesson.id)
                                    }
                                    className={`inline-flex h-8 w-8 items-center justify-center rounded-full border ${
                                      completed
                                        ? "bg-info text-contrast-text border-info"
                                        : "gaia-border gaia-hover-soft"
                                    }`}
                                    aria-label={
                                      completed
                                        ? "Mark lesson incomplete"
                                        : "Mark lesson complete"
                                    }
                                  >
                                    {completed ? "✓" : ""}
                                  </button>
                                </div>
                              </div>
                            </li>
                          );
                        })}
                      </ul>
                    </article>
                  ))}
                </section>
      )}

      {activeLesson && (
        <section className="rounded-2xl border gaia-border p-4 sm:p-5 shadow-sm space-y-3">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] gaia-muted">
                    Lesson workspace
                  </p>
                  <button
                    type="button"
                    onClick={() => setActiveLessonId(null)}
                    className="inline-flex items-center gap-1 rounded-full border gaia-border gaia-ink-soft px-3 py-1 text-[11px] sm:text-xs"
                  >
                    ← Back to Self-Repair list
                  </button>
                  {activeLesson ? (
                    <>
                      <div className="space-y-1">
                        <p className="text-xs gaia-muted">Active lesson</p>
                        <h3 className="text-lg font-semibold gaia-strong">
                          {activeLesson.code} - {activeLesson.title}
                        </h3>
                        <p className="text-xs gaia-muted">
                          Estimate: {activeLesson.content ? activeLesson.estimate : "0 min (MBT)"}
                        </p>
                      </div>

                      {activeLesson.content ? (
                        <div className="space-y-3 text-sm gaia-muted">
                          <p className="gaia-strong text-sm">
                            {activeLesson.content.intro}
                          </p>
                          <div>
                            <p className="text-xs font-semibold gaia-muted uppercase tracking-[0.12em]">
                              Do this now
                            </p>
                            <ul className="mt-1 list-disc space-y-1 pl-4">
                              {activeLesson.content.actions.map((item) => (
                                <li key={item}>{item}</li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <p className="text-xs font-semibold gaia-muted uppercase tracking-[0.12em]">
                              Journal prompts
                            </p>
                            <ul className="mt-1 list-disc space-y-1 pl-4">
                              {activeLesson.content.prompts.map((item) => (
                                <li key={item}>{item}</li>
                              ))}
                            </ul>
                          </div>
                          {activeLesson.content.safeguard ? (
                            <div className="rounded-lg gaia-ink-faint border gaia-border px-3 py-2 text-xs">
                              Safety net: {activeLesson.content.safeguard}
                            </div>
                          ) : null}
                        </div>
                      ) : (
                        <div className="text-sm gaia-muted">
                          Content for this arc is coming soon. Use the checklist on the left to mark progress and add your own notes.
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={() => {
                          if (!activeLesson) return;
                          toggleLessonCompleted("self-repair", activeLesson.id);
                        }}
                        className="w-full rounded-lg gaia-contrast px-3 py-2 text-sm font-semibold shadow-sm transition hover:shadow-md"
                      >
                        {isLessonCompleted("self-repair", activeLesson.id)
                          ? "Mark as incomplete"
                          : "Mark lesson as done"}
                      </button>
                    </>
                  ) : (
                    <p className="text-sm gaia-muted">
                      Select a lesson to load its checklist and prompts.
                    </p>
                  )}
                </section>
      )}

    </main>
  );
}
