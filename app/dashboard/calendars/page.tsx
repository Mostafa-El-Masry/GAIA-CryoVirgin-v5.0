"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import type { ComponentType } from "react";
import { useMemo, useState } from "react";

type CalendarKey = "health" | "training" | "learning";

type CalendarView = {
  id: CalendarKey;
  label: string;
  subtitle: string;
  href: string;
  Component: ComponentType;
};

function CalendarLoading() {
  return (
    <div className="flex min-h-[320px] items-center justify-center rounded-xl border border-[var(--gaia-border)] bg-[var(--gaia-surface-soft)] text-sm text-[var(--gaia-text-muted)]">
      Loading calendar...
    </div>
  );
}

const HealthCalendar = dynamic(
  () => import("@/app/health/food-calendar/page"),
  {
    ssr: false,
    loading: CalendarLoading,
  },
);

const LearningCalendar = dynamic(
  () => import("@/app/apollo/academy/calendar/page"),
  {
    ssr: false,
    loading: CalendarLoading,
  },
);

const TrainingCalendar = dynamic(
  () => import("@/app/health/training-calendar/page"),
  {
    ssr: false,
    loading: CalendarLoading,
  },
);

export default function DashboardCalendarsPage() {
  const [active, setActive] = useState<CalendarKey>("health");

  const views: CalendarView[] = useMemo(
    () => [
      {
        id: "health",
        label: "Health calendar",
        subtitle: "Food rotation, hydration, and training slots",
        href: "/health/food-calendar",
        Component: HealthCalendar,
      },
      {
        id: "training",
        label: "Training calendar",
        subtitle: "Planned vs actual training volume by day",
        href: "/health/training-calendar",
        Component: TrainingCalendar,
      },
      {
        id: "learning",
        label: "Learning calendar",
        subtitle: "Academy cadence by day with rotated tracks",
        href: "/apollo/academy/calendar",
        Component: LearningCalendar,
      },
    ],
    [],
  );

  const current = views.find((v) => v.id === active) ?? views[0];
  const CurrentComponent = current.Component;

  return (
    <main className="mx-auto w-[100vw] px-4 py-8">
      <header className="mb-8 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--gaia-text-muted)]">
            Calendar hub
          </p>
          <h1 className="text-3xl font-bold text-[var(--gaia-text-strong)]">
            All calendars in one place
          </h1>
          <p className="text-sm gaia-muted">
            Switch between health and learning calendars without leaving the
            dashboard.
          </p>
        </div>
        <Link
          href="/dashboard"
          className="inline-flex items-center justify-center rounded-lg border border-[var(--gaia-border)] bg-[var(--gaia-surface-soft)] px-4 py-2 text-sm font-semibold text-[var(--gaia-text-default)] transition hover:bg-[var(--gaia-border)]/30"
        >
          Back to dashboard
        </Link>
      </header>

      <div className="grid gap-6 lg:grid-cols-[220px,1fr]">
        <nav className="rounded-2xl border border-[var(--gaia-border)] bg-[var(--gaia-surface-soft)] p-4">
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--gaia-text-muted)]">
            Calendars
          </p>
          <div className="space-y-2">
            {views.map((view) => {
              const isActive = view.id === current.id;
              return (
                <button
                  key={view.id}
                  type="button"
                  onClick={() => setActive(view.id)}
                  className={`w-full rounded-xl border px-3 py-3 text-left transition focus:outline-none focus:ring-2 focus:ring-[var(--gaia-contrast-bg)]/30 ${
                    isActive
                      ? "border-[var(--gaia-contrast-bg)] bg-[var(--gaia-contrast-bg)]/10 text-[var(--gaia-text-strong)]"
                      : "border-[var(--gaia-border)] bg-[var(--gaia-surface)] text-[var(--gaia-text-default)] hover:border-[var(--gaia-contrast-bg)]/50"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-semibold">{view.label}</span>
                    {isActive && (
                      <span className="h-2 w-2 rounded-full bg-[var(--gaia-contrast-bg)]" />
                    )}
                  </div>
                  <p className="mt-1 text-xs text-[var(--gaia-text-muted)]">
                    {view.subtitle}
                  </p>
                </button>
              );
            })}
          </div>
        </nav>

        <section className="rounded-2xl border border-[var(--gaia-border)] bg-[var(--gaia-surface)] p-4 shadow-sm">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--gaia-text-muted)]">
                Active calendar
              </p>
              <h2 className="text-xl font-semibold text-[var(--gaia-text-strong)]">
                {current.label}
              </h2>
              <p className="text-sm text-[var(--gaia-text-muted)]">
                {current.subtitle}
              </p>
            </div>
            <Link
              href={current.href}
              className="inline-flex items-center justify-center rounded-full bg-[var(--gaia-contrast-bg)] px-4 py-2 text-xs font-semibold text-[var(--gaia-contrast-text)] shadow hover:opacity-90"
            >
              Open full page &gt;
            </Link>
          </div>

          <div className="mt-4 overflow-hidden rounded-xl border border-[var(--gaia-border)] bg-[var(--gaia-surface-soft)]">
            <div
              className="calendar-embed w-full max-w-full overflow-x-auto"
              key={current.id}
            >
              <CurrentComponent />
            </div>
          </div>
        </section>
      </div>

      <style jsx global>{`
        .calendar-embed [class*="w-[90vw]"] {
          width: 100% !important;
          max-width: 100% !important;
          margin-left: auto;
          margin-right: auto;
        }
      `}</style>
    </main>
  );
}
