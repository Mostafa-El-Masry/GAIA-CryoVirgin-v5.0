"use client";

import Link from "next/link";
import { useMemo } from "react";

const DAY_HEADERS: { label: string; jsDay: number }[] = [
  { label: "Sat", jsDay: 6 },
  { label: "Sun", jsDay: 0 },
  { label: "Mon", jsDay: 1 },
  { label: "Tue", jsDay: 2 },
  { label: "Wed", jsDay: 3 },
  { label: "Thu", jsDay: 4 },
  { label: "Fri", jsDay: 5 },
];

export default function AcademyMonthlyCalendarPage() {
  const today = useMemo(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return now;
  }, []);

  const year = today.getFullYear();
  const month = today.getMonth(); // 0-based
  const monthStart = new Date(year, month, 1);
  const nextMonthStart = new Date(year, month + 1, 1);
  const daysInMonth = Math.round(
    (Number(nextMonthStart) - Number(monthStart)) / (1000 * 60 * 60 * 24)
  );

  const firstJsDay = monthStart.getDay(); // 0 Sun ... 6 Sat
  const leadEmpty = DAY_HEADERS.findIndex((h) => h.jsDay === firstJsDay);

  type DayCell = {
    date: Date;
    dayNum: number;
  };

  const dayCells: DayCell[] = [];
  for (let i = 0; i < daysInMonth; i++) {
    const d = new Date(year, month, i + 1);
    d.setHours(0, 0, 0, 0);
    dayCells.push({
      date: d,
      dayNum: i + 1,
    });
  }

  const paddedCells: (DayCell | null)[] = [
    ...Array(Math.max(0, leadEmpty)).fill(null),
    ...dayCells,
  ];
  while (paddedCells.length % 7 !== 0) {
    paddedCells.push(null);
  }

  const monthName = today.toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });

  function isSameDay(a: Date, b: Date): boolean {
    return (
      a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate()
    );
  }

  function weekdayLabel(d: Date): string {
    return d.toLocaleDateString(undefined, { weekday: "short" });
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-slate-50 to-slate-100 py-6">
      <main className="mx-auto max-w-6xl px-4 sm:px-6 space-y-4">
        <header className="flex items-center justify-between gap-2">
          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900">
              Monthly calendar
            </h1>
            <p className="text-sm text-slate-600">
              {monthName} ·{" "}
              <span className="text-xs text-slate-500">
                View your whole month at a glance.
              </span>
            </p>
          </div>
          <Link
            href="/apollo/academy"
            className="text-xs text-slate-600 hover:text-slate-800 underline"
          >
            Back to dashboard
          </Link>
        </header>

        {/* Desktop / large layout */}
        <section className="hidden sm:block rounded-2xl border border-slate-200 bg-white/90 px-4 py-4 shadow-sm">
          <div className="grid grid-cols-7 gap-2 text-center text-[11px] font-semibold text-slate-500 mb-2">
            {DAY_HEADERS.map((h) => (
              <div key={h.label}>{h.label}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-2 text-xs">
            {paddedCells.map((cell, idx) => {
              if (!cell) {
                return (
                  <div
                    key={idx}
                    className="h-20 rounded-xl border border-dashed border-slate-100 bg-slate-50/40"
                  />
                );
              }

              const isToday = isSameDay(cell.date, today);

              return (
                <div
                  key={cell.dayNum}
                  className={`h-20 rounded-xl border px-2 py-1 flex flex-col items-start justify-between text-left ${
                    isToday
                      ? "border-emerald-500 bg-emerald-50"
                      : "border-slate-200 bg-white"
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-[11px] font-semibold text-slate-800">
                      {cell.dayNum}
                    </span>
                    {isToday && (
                      <span className="text-[10px] text-emerald-700 font-medium">
                        Today
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-[10px] text-slate-400">
                    {weekdayLabel(cell.date)}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Mobile layout: one day per row */}
        <section className="sm:hidden rounded-2xl border border-slate-200 bg-white/90 px-3 py-3 shadow-sm space-y-2">
          {dayCells.map((cell) => {
            const isToday = isSameDay(cell.date, today);
            const weekday = weekdayLabel(cell.date);

            return (
              <div
                key={cell.dayNum}
                className={`flex items-center justify-between rounded-xl border px-3 py-2 ${
                  isToday
                    ? "border-emerald-500 bg-emerald-50"
                    : "border-slate-200 bg-white"
                }`}
              >
                <div>
                  <p className="text-xs font-semibold text-slate-900">
                    {cell.dayNum} · {weekday}
                  </p>
                </div>
              </div>
            );
          })}
        </section>
      </main>
    </div>
  );
}
