"use client";

import { useEffect } from "react";
import { useAcademyProgress } from "../useAcademyProgress";
type Lesson = {
  id: string;
  code: string;
  title: string;
  estimate: string;
};

type Arc = {
  id: string;
  label: string;
  title: string;
  focus: string;
  lessons: Lesson[];
};

const arcs: Arc[] = [
  {
    id: "self-1-basics",
    label: "Arc 1",
    title: "Stabilizing the Basics",
    focus:
      "Sleep, food, basic movement, and very small daily anchors. No perfection — just getting your body and days to a more stable baseline.",
    lessons: [
      {
        id: "self-1-1",
        code: "1.1",
        title: "Mapping Your Current Rhythm (Sleep, Food, Energy)",
        estimate: "30 min",
      },
      {
        id: "self-1-2",
        code: "1.2",
        title: "Designing One Small Daily Anchor",
        estimate: "30 min",
      },
      {
        id: "self-1-3",
        code: "1.3",
        title: "Gentle Movement: Walks, Stretching, and Realistic Goals",
        estimate: "30 min",
      },
      {
        id: "self-1-4",
        code: "1.4",
        title: "Bad Days Protocol: Minimum Baseline to Not Collapse",
        estimate: "30 min",
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
        code: "2.1",
        title: "Catching the Inner Attacker in Real Sentences",
        estimate: "30 min",
      },
      {
        id: "self-2-2",
        code: "2.2",
        title: "Separating Facts from Attacks",
        estimate: "30 min",
      },
      {
        id: "self-2-3",
        code: "2.3",
        title: "Building a More Honest, Kinder Counter-Voice",
        estimate: "30 min",
      },
      {
        id: "self-2-4",
        code: "2.4",
        title: "Responding to Shame Without Disappearing",
        estimate: "30 min",
      },
    ],
  },
  {
    id: "self-3-people",
    label: "Arc 3",
    title: "People & Boundaries",
    focus:
      "Understand which relationships drain you and which support you, and practice tiny boundaries so you don&apos;t feel like a toy or a burden.",
    lessons: [
      {
        id: "self-3-1",
        code: "3.1",
        title: "Mapping Draining vs Supportive People",
        estimate: "30 min",
      },
      {
        id: "self-3-2",
        code: "3.2",
        title: "Tiny Boundaries: Delays, Shorter Calls, Less Explaining",
        estimate: "30 min",
      },
      {
        id: "self-3-3",
        code: "3.3",
        title: "Guilt vs Responsibility",
        estimate: "30 min",
      },
      {
        id: "self-3-4",
        code: "3.4",
        title: "Protecting Your Energy Around Family and Work",
        estimate: "30 min",
      },
    ],
  },
  {
    id: "self-4-meaning",
    label: "Arc 4",
    title: "Meaning & GAIA",
    focus:
      "Use GAIA as a life map instead of a stick to beat yourself with. Connect your studies and work to a bigger story that makes sense.",
    lessons: [
      {
        id: "self-4-1",
        code: "4.1",
        title: "Reframing GAIA: From Self-Attack to Self-Support",
        estimate: "30 min",
      },
      {
        id: "self-4-2",
        code: "4.2",
        title: "Connecting Study Paths to Real Future Scenarios",
        estimate: "30 min",
      },
      {
        id: "self-4-3",
        code: "4.3",
        title: "Designing Rituals that Make You Feel Like a Person, Not a Machine",
        estimate: "30 min",
      },
    ],
  },
  {
    id: "self-5-relapse",
    label: "Arc 5",
    title: "Relapse & Maintenance Plan",
    focus:
      "Design what you&apos;ll do on bad days before they happen: who to talk to, what to avoid, and which tiny steps help you not disappear.",
    lessons: [
      {
        id: "self-5-1",
        code: "5.1",
        title: "Defining Your Early Warning Signs",
        estimate: "30 min",
      },
      {
        id: "self-5-2",
        code: "5.2",
        title: "Building a Personal Emergency List (People, Actions, Words)",
        estimate: "30 min",
      },
      {
        id: "self-5-3",
        code: "5.3",
        title: "Review & Adjust: Keeping the Plan Realistic",
        estimate: "30 min",
      },
    ],
  },
];

const totalLessons = arcs.reduce(
  (sum, arc) => sum + arc.lessons.length,
  0
);

export default function SelfRepairTrackPage() {
  const { isLessonCompleted, toggleLessonCompleted, markStudyVisit } = useAcademyProgress();

  useEffect(() => {
    markStudyVisit("self-repair");
  }, [markStudyVisit]);
  return (
    <main className="mx-auto max-w-6xl px-4 py-8 space-y-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold">Self-Repair · Rebuilding Me</h1>
        <p className="text-sm gaia-muted max-w-2xl">
          This track has no fixed end date. It&apos;s the quiet work of taking yourself seriously
          again — body, mind, and story — while you keep studying and working.
        </p>
        <p className="text-xs gaia-muted mt-1">
          Total planned reflections / lessons:{" "}
          <span className="gaia-strong">{totalLessons}</span>. You keep Fridays free from heavy
          studying and use them for this path: reflection, walks, reading, and honest check-ins.
        </p>
      </header>

      <section className="space-y-4">
        {arcs.map((arc) => (
          <article
            key={arc.id}
            className="rounded-2xl gaia-panel-soft p-4 sm:p-5 shadow-sm border border-white/5"
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] gaia-muted">
              {arc.label}
            </p>
            <h2 className="mt-1 text-sm font-semibold gaia-strong">{arc.title}</h2>
            <p className="mt-2 text-xs gaia-muted">{arc.focus}</p>

            <ul className="mt-3 space-y-1.5 text-xs gaia-muted">
              {arc.lessons.map((lesson) => (
                <li
                  id={lesson.id}
                  key={lesson.id}
                  className="flex items-baseline justify-between gap-2 border-b border-white/5 pb-1 last:border-b-0 last:pb-0"
                >
                  <button
                    type="button"
                    onClick={() => toggleLessonCompleted("self-repair", lesson.id)}
                    className="flex w-full items-baseline justify-between gap-2 text-left"
                  >
                    <span className="text-[11px] w-4">
                      {isLessonCompleted("self-repair", lesson.id) ? "✓" : ""}
                    </span>
                    <span className="gaia-strong text-[11px] w-10">
                      {lesson.code}
                    </span>
                    <span className="flex-1">{lesson.title}</span>
                    <span className="text-[11px]">{lesson.estimate}</span>
                  </button>
                </li>
              ))}
            </ul>
          </article>
        ))}
      </section>
    </main>
  );
}
