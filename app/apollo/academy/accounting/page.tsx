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
    id: "acc-1-foundations",
    label: "Arc 1",
    title: "Foundations & Reset",
    focus:
      "Rebuild your base in double-entry, core concepts, and everyday language. Translate theory into the reality of your current job.",
    lessons: [
      {
        id: "acc-1-1",
        code: "1.1",
        title: "Accounting Equation & Double-Entry Logic",
        estimate: "120 min",
      },
      {
        id: "acc-1-2",
        code: "1.2",
        title: "Debits & Credits in Practice",
        estimate: "120 min",
      },
      {
        id: "acc-1-3",
        code: "1.3",
        title: "Chart of Accounts and Account Types",
        estimate: "120 min",
      },
      {
        id: "acc-1-4",
        code: "1.4",
        title: "Journals, Ledgers, and Posting Flow",
        estimate: "120 min",
      },
      {
        id: "acc-1-5",
        code: "1.5",
        title: "Trial Balance and Basic Self-Checks",
        estimate: "120 min",
      },
    ],
  },
  {
    id: "acc-2-statements",
    label: "Arc 2",
    title: "Financial Statements with Confidence",
    focus:
      "Read and understand the balance sheet, P&L, and cash flows without panic. Connect each line to the real-world activity behind it.",
    lessons: [
      {
        id: "acc-2-1",
        code: "2.1",
        title: "Balance Sheet Structure and Logic",
        estimate: "120 min",
      },
      {
        id: "acc-2-2",
        code: "2.2",
        title: "Income Statement Structure and Logic",
        estimate: "120 min",
      },
      {
        id: "acc-2-3",
        code: "2.3",
        title: "Cash Flow Basics",
        estimate: "120 min",
      },
      {
        id: "acc-2-4",
        code: "2.4",
        title: "Linking Balance Sheet and P&L",
        estimate: "120 min",
      },
      {
        id: "acc-2-5",
        code: "2.5",
        title: "Common Statement Mistakes and How to Spot Them",
        estimate: "120 min",
      },
    ],
  },
  {
    id: "acc-3-tools",
    label: "Arc 3",
    title: "Tools, Systems & Clean Data",
    focus:
      "Tame Excel/Sheets and your accounting software. Design checklists, templates, and routines that make monthly work calmer and more predictable.",
    lessons: [
      {
        id: "acc-3-1",
        code: "3.1",
        title: "Excel / Sheets Basics for Accounting",
        estimate: "120 min",
      },
      {
        id: "acc-3-2",
        code: "3.2",
        title: "Templates and Schedules for Recurring Work",
        estimate: "120 min",
      },
      {
        id: "acc-3-3",
        code: "3.3",
        title: "Importing and Cleaning Data",
        estimate: "120 min",
      },
      {
        id: "acc-3-4",
        code: "3.4",
        title: "Reconciliations: Bank, Vendors, and Customers",
        estimate: "120 min",
      },
      {
        id: "acc-3-5",
        code: "3.5",
        title: "Monthly Close Checklist",
        estimate: "120 min",
      },
      {
        id: "acc-3-6",
        code: "3.6",
        title: "Documentation and Workpapers",
        estimate: "120 min",
      },
    ],
  },
  {
    id: "acc-4-analysis",
    label: "Arc 4",
    title: "Analysis, Closing & Explaining Numbers",
    focus:
      "Do basic variance analysis, closing procedures, and learn how to explain numbers simply to non-accountants — including bad news.",
    lessons: [
      {
        id: "acc-4-1",
        code: "4.1",
        title: "Variance Analysis Basics",
        estimate: "120 min",
      },
      {
        id: "acc-4-2",
        code: "4.2",
        title: "Margins and Key Ratios",
        estimate: "120 min",
      },
      {
        id: "acc-4-3",
        code: "4.3",
        title: "Year-End Adjustments and Provisions",
        estimate: "120 min",
      },
      {
        id: "acc-4-4",
        code: "4.4",
        title: "Accruals and Cut-off",
        estimate: "120 min",
      },
      {
        id: "acc-4-5",
        code: "4.5",
        title: "Explaining Numbers to Non-Accountants",
        estimate: "120 min",
      },
      {
        id: "acc-4-6",
        code: "4.6",
        title: "Handling Questions and Pressure in Reviews",
        estimate: "120 min",
      },
    ],
  },
  {
    id: "acc-5-gaia-center",
    label: "Arc 5",
    title: "GAIA Accounting Center Preparation",
    focus:
      "Turn your day-to-day pain points into GAIA features. Capture what you wish an assistant would do so the future Accounting Center is built on real needs.",
    lessons: [
      {
        id: "acc-5-1",
        code: "5.1",
        title: "Mapping Your Current Pain Points",
        estimate: "120 min",
      },
      {
        id: "acc-5-2",
        code: "5.2",
        title: "Defining Ideal Workflows",
        estimate: "120 min",
      },
      {
        id: "acc-5-3",
        code: "5.3",
        title: "Designing GAIA Helpers and Checks",
        estimate: "120 min",
      },
      {
        id: "acc-5-4",
        code: "5.4",
        title: "Turning Pain Points into Features and Rules",
        estimate: "120 min",
      },
    ],
  },
];

const totalLessons = arcs.reduce((sum, arc) => sum + arc.lessons.length, 0);

export default function AccountingTrackPage() {
  const { isLessonCompleted, toggleLessonCompleted, markStudyVisit } =
    useAcademyProgress();

  useEffect(() => {
    markStudyVisit("accounting");
  }, [markStudyVisit]);
  const totalMonths = "≈ 18 months at your current 3 days/week rhythm";

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 space-y-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold">
          Accounting · Keeper of Numbers
        </h1>
        <p className="text-sm gaia-muted max-w-2xl">
          This track is about taking back control at work. You&apos;re not bad
          at accounting — you&apos;ve been working under stress and chaos. Here,
          we rebuild the base slowly and deliberately, using your real job as
          practice.
        </p>
        <p className="text-xs gaia-muted mt-1">
          Total planned lessons:{" "}
          <span className="gaia-strong">{totalLessons}</span> · Planned path:{" "}
          <span className="gaia-strong">{totalMonths}</span>
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
            <h2 className="mt-1 text-sm font-semibold gaia-strong">
              {arc.title}
            </h2>
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
                    onClick={() =>
                      toggleLessonCompleted("accounting", lesson.id)
                    }
                    className="flex w-full items-baseline justify-between gap-2 text-left"
                  >
                    <span className="text-[11px] w-4">
                      {isLessonCompleted("accounting", lesson.id) ? "✓" : ""}
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
