"use client";

import { useEffect, useMemo, useState } from "react";
import { SEED_FOOD_ITEMS } from "./../lib/foodLibrary";

const DAY_HEADERS: { label: string; jsDay: number }[] = [
  { label: "SUN", jsDay: 0 },
  { label: "MON", jsDay: 1 },
  { label: "TUE", jsDay: 2 },
  { label: "WED", jsDay: 3 },
  { label: "THU", jsDay: 4 },
  { label: "FRI", jsDay: 5 },
  { label: "SAT", jsDay: 6 },
];

type FoodOption = {
  id: string;
  label: string;
  kcal: number;
};

const FOOD_OPTIONS: FoodOption[] = SEED_FOOD_ITEMS.map((item) => ({
  id: item.id,
  label: `${item.label} (~${item.kcal} kcal)`,
  kcal: item.kcal,
}));

// Default GAIA lunch used on locked Friday plan days.
const DEFAULT_PLAN_FOOD_ID = "half-chicken-rice-fries";

const STORAGE_KEY = "gaia-health-food-plan-v1";
const FOLLOW_STORAGE_KEY = "gaia-health-food-plan-follow-v1";
const PEPSI_STORAGE_KEY = "gaia-health-food-plan-pepsi-v1";
const PLAN_LEVEL_STORAGE_KEY = "gaia-food-plan-level-v1";
const MAX_PEPSI_FOR_FULL_SCORE = 2; // max cans on a GAIA day to still get full credit
const DAILY_KCAL_TARGET = 1900; // provisional maintenance estimate for 34y, 70kg, 166cm, sedentary
const PEPSI_KCAL_PER_CAN = 150; // ~150 kcal per 350ml can


// Programme start – we don't plan GAIA days before this date.
const FOOD_SCHEDULE_START_ISO = "2026-01-01";

type StoredSelections = Record<string, string | undefined>;
type StoredFollowMap = Record<string, boolean | undefined>;
type StoredPepsiMap = Record<string, number | undefined>;

type DayCell = {
  date: Date;
  iso: string;
  dayNum: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  isPlanDay: boolean;
};

function createDateFromIso(iso: string): Date {
  const [y, m, d] = iso.split("-").map((x) => parseInt(x, 10));
  return new Date(y, m - 1, d);
}

function isoFromDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

// Sunday-based week start so columns align with SUN..SAT header
function getWeekStart(date: Date): Date {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  const day = copy.getDay(); // 0 Sun ... 6 Sat
  copy.setDate(copy.getDate() - day);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

// Always include Friday as primary GAIA day, then add extra days
// in this order when the plan level goes up.
const EXTRA_PLAN_DAY_ORDER: number[] = [2, 0, 3, 1, 4, 6]; // Tue, Sun, Wed, Mon, Thu, Sat

function getPlanDaysForWeek(weekStart: Date, planLevel: number): string[] {
  const scheduleStart = createDateFromIso(FOOD_SCHEDULE_START_ISO);
  const clampedLevel = Math.max(1, Math.min(7, planLevel));

  const candidateDays: { iso: string; dayOfWeek: number }[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    d.setHours(0, 0, 0, 0);
    candidateDays.push({ iso: isoFromDate(d), dayOfWeek: d.getDay() });
  }

  const planIsos: string[] = [];

  // 1) Friday – primary GAIA day, only if we are at level >= 1.
  if (clampedLevel >= 1) {
    const fridayCandidate = candidateDays.find((c) => c.dayOfWeek === 5);
    if (fridayCandidate) {
      const fridayDate = createDateFromIso(fridayCandidate.iso);
      if (fridayDate >= scheduleStart) {
        planIsos.push(fridayCandidate.iso);
      }
    }
  }

  // 2) Extra plan days depending on level.
  for (const dayOfWeek of EXTRA_PLAN_DAY_ORDER) {
    if (planIsos.length >= clampedLevel) break;
    const candidate = candidateDays.find((c) => c.dayOfWeek === dayOfWeek);
    if (!candidate) continue;
    const candidateDate = createDateFromIso(candidate.iso);
    if (candidateDate < scheduleStart) continue;
    if (!planIsos.includes(candidate.iso)) {
      planIsos.push(candidate.iso);
    }
  }

  return planIsos;
}

function buildMonthCells(viewDate: Date, planLevel: number): DayCell[] {
  const scheduleStart = createDateFromIso(FOOD_SCHEDULE_START_ISO);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const isoToday = isoFromDate(today);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const monthStart = new Date(year, month, 1);
  const nextMonthStart = new Date(year, month + 1, 1);
  const daysInMonth = Math.round(
    (Number(nextMonthStart) - Number(monthStart)) / (1000 * 60 * 60 * 24)
  );

  const firstJsDay = monthStart.getDay(); // 0 Sun..6 Sat
  const leadEmpty = firstJsDay;

  const cells: DayCell[] = [];

  for (let i = 0; i < daysInMonth; i++) {
    const d = new Date(year, month, i + 1);
    d.setHours(0, 0, 0, 0);
    const iso = isoFromDate(d);

    const weekStart = getWeekStart(d);
    const planIsosForWeek = getPlanDaysForWeek(weekStart, planLevel);
    const isPlanDay = planIsosForWeek.includes(iso) && d >= scheduleStart;

    cells.push({
      date: d,
      iso,
      dayNum: i + 1,
      isCurrentMonth: true,
      isToday: iso === isoToday,
      isPlanDay,
    });
  }

  const padded: (DayCell | null)[] = [
    ...Array(Math.max(0, leadEmpty)).fill(null),
    ...cells,
  ];
  while (padded.length % 7 !== 0) {
    padded.push(null);
  }

  return padded.map((cell) => {
    if (!cell) {
      return {
        date: new Date(0),
        iso: "",
        dayNum: 0,
        isCurrentMonth: false,
        isToday: false,
        isPlanDay: false,
      };
    }
    return cell;
  });
}

export default function FoodCalendarPage() {
  const [viewDate, setViewDate] = useState<Date>(() => {
    const start = createDateFromIso(FOOD_SCHEDULE_START_ISO);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (today < start) return start;
    return today;
  });

  const [selections, setSelections] = useState<StoredSelections>({});
  const [followMap, setFollowMap] = useState<StoredFollowMap>({});
  const [pepsiMap, setPepsiMap] = useState<StoredPepsiMap>({});
  const [planLevel, setPlanLevel] = useState<number>(1);

  // Load saved plan level + selections + follow + Pepsi.
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const rawSelections = window.localStorage.getItem(STORAGE_KEY);
      if (rawSelections) {
        const parsed = JSON.parse(rawSelections) as StoredSelections;
        setSelections(parsed || {});
      }
    } catch {
      //
    }

    try {
      const rawFollow = window.localStorage.getItem(FOLLOW_STORAGE_KEY);
      if (rawFollow) {
        const parsed = JSON.parse(rawFollow) as StoredFollowMap;
        setFollowMap(parsed || {});
      }
    } catch {
      //
    }

    try {
      const rawPepsi = window.localStorage.getItem(PEPSI_STORAGE_KEY);
      if (rawPepsi) {
        const parsed = JSON.parse(rawPepsi) as StoredPepsiMap;
        setPepsiMap(parsed || {});
      }
    } catch {
      //
    }

    try {
      const rawLevel = window.localStorage.getItem(PLAN_LEVEL_STORAGE_KEY);
      if (rawLevel) {
        const parsedLevel = parseInt(rawLevel, 10);
        if (!Number.isNaN(parsedLevel) && parsedLevel >= 1 && parsedLevel <= 7) {
          setPlanLevel(parsedLevel);
        }
      }
    } catch {
      //
    }
  }, []);

  // Persist plan level.
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(
        PLAN_LEVEL_STORAGE_KEY,
        String(Math.max(1, Math.min(7, planLevel)))
      );
    } catch {
      //
    }
  }, [planLevel]);

  // Persist selections / follow / Pepsi.
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(selections));
    } catch {
      //
    }
  }, [selections]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(FOLLOW_STORAGE_KEY, JSON.stringify(followMap));
    } catch {
      //
    }
  }, [followMap]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(PEPSI_STORAGE_KEY, JSON.stringify(pepsiMap));
    } catch {
      //
    }
  }, [pepsiMap]);

  const cells = useMemo(
    () => buildMonthCells(viewDate, planLevel),
    [viewDate, planLevel]
  );

  const defaultPlanFood = useMemo(() => {
    const found =
      FOOD_OPTIONS.find((opt) => opt.id === DEFAULT_PLAN_FOOD_ID) ??
      FOOD_OPTIONS[0];
    return found;
  }, []);

  // Ensure locked Friday GAIA days always have a default plan food.
  useEffect(() => {
    if (!defaultPlanFood) return;
    setSelections((prev) => {
      const updated: StoredSelections = { ...prev };
      let changed = false;

      for (const cell of cells) {
        if (!cell.isCurrentMonth || !cell.isPlanDay || !cell.iso) continue;
        const isFriday = cell.date.getDay() === 5;
        if (!isFriday) continue;
        if (!updated[cell.iso]) {
          updated[cell.iso] = defaultPlanFood.id;
          changed = true;
        }
      }

      if (!changed) return prev;
      return updated;
    });
  }, [cells, defaultPlanFood]);

  const monthLabel = useMemo(
    () =>
      viewDate.toLocaleDateString(undefined, {
        month: "long",
        year: "numeric",
      }),
    [viewDate]
  );

  const handleSelectChange = (iso: string, foodId: string) => {
    setSelections((prev) => ({
      ...prev,
      [iso]: foodId || undefined,
    }));
  };

  const handleToggleFollow = (iso: string) => {
    setFollowMap((prev) => ({
      ...prev,
      [iso]: !prev[iso],
    }));
  };

  const handlePepsiChange = (iso: string, raw: string) => {
    const value = raw === "" ? 0 : Number(raw);
    const safe = Number.isNaN(value) ? 0 : Math.min(Math.max(0, value), 10);
    setPepsiMap((prev) => ({
      ...prev,
      [iso]: safe,
    }));
  };

  const goToPrevMonth = () => {
    setViewDate((prev) => {
      const d = new Date(prev);
      d.setMonth(d.getMonth() - 1);
      return d;
    });
  };

  const goToNextMonth = () => {
    setViewDate((prev) => {
      const d = new Date(prev);
      d.setMonth(d.getMonth() + 1);
      return d;
    });
  };

  // Monthly adherence calculation for GAIA plan days (lunch only).
  const monthPlanStats = useMemo(() => {
    const monthPlanIsos: string[] = [];
    for (const cell of cells) {
      if (!cell.isCurrentMonth || !cell.isPlanDay || !cell.iso) continue;
      monthPlanIsos.push(cell.iso);
    }
    if (monthPlanIsos.length === 0) {
      return {
        totalPlanDays: 0,
        completedPlanDays: 0,
        adherencePercent: 100,
      };
    }
    let completed = 0;
    for (const iso of monthPlanIsos) {
      const followed = !!followMap[iso];
      const pepsiCount = pepsiMap[iso] ?? 0;
      if (followed && pepsiCount <= MAX_PEPSI_FOR_FULL_SCORE) {
        completed += 1;
      }
    }
    const pct = Math.round((completed / monthPlanIsos.length) * 100);
    return {
      totalPlanDays: monthPlanIsos.length,
      completedPlanDays: completed,
      adherencePercent: pct,
    };
  }, [cells, followMap, pepsiMap]);

  const { totalPlanDays, completedPlanDays, adherencePercent } = monthPlanStats;

  const canUpgrade =
    adherencePercent >= 80 && totalPlanDays > 0 && planLevel < 7;

  const handleUpgradePlan = () => {
    if (!canUpgrade) return;
    setPlanLevel((prev) => Math.max(1, Math.min(7, prev + 1)));
  };

  return (
    <div className="mx-auto flex w-[90vw] max-w-none flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Food Calendar · GAIA Plan Days
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-slate-600">
            Starting from January, GAIA schedules
            <span className="font-semibold"> Friday</span> as your primary
            GAIA-plan lunch each week. The current level keeps a fixed number of
            GAIA-plan days per week across all months until you upgrade the
            plan.
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Friday lunches are locked and set by GAIA so you can focus on
            following them. Other days remain flexible: you choose the food,
            track Pepsi, and GAIA tracks adherence.
          </p>
        </div>

        <div className="flex flex-col items-end gap-2 text-right">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={goToPrevMonth}
              className="inline-flex items-center rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
            >
              ← Prev
            </button>
            <div className="rounded-full border border-slate-200 bg-white px-4 py-1 text-xs font-semibold text-slate-800 shadow-sm">
              {monthLabel}
            </div>
            <button
              type="button"
              onClick={goToNextMonth}
              className="inline-flex items-center rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
            >
              Next →
            </button>
          </div>
          <div className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[11px] font-semibold text-emerald-800 shadow-sm">
            Current GAIA level: {planLevel} day
            {planLevel > 1 ? "s" : ""} per week
          </div>
        </div>
      </header>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,1.8fr),minmax(0,1fr)]">
        <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-[0_10px_30px_rgba(15,23,42,0.08)] sm:p-6">
          <div className="mb-3 grid grid-cols-7 gap-2 text-center text-[11px] font-semibold tracking-wide text-slate-500">
            {DAY_HEADERS.map((h) => (
              <div key={h.label}>{h.label}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-2 text-xs">
            {cells.map((cell, idx) => {
              if (!cell.isCurrentMonth) {
                return (
                  <div
                    key={`empty-${idx}`}
                    className="h-28 rounded-2xl border border-dashed border-slate-100 bg-slate-50"
                  />
                );
              }

              const isFriday = cell.date.getDay() === 5;
              const isLockedPlanDay = cell.isPlanDay && isFriday;

              const selectedId =
                selections[cell.iso] ??
                (isLockedPlanDay && defaultPlanFood
                  ? defaultPlanFood.id
                  : "");
              const selectedFood = FOOD_OPTIONS.find(
                (o) => o.id === selectedId
              );
              const followed = !!followMap[cell.iso];
              const pepsiCount = pepsiMap[cell.iso] ?? 0;

              const baseBg = cell.isPlanDay ? "#ecfdf3" : "#f9fafb";
              const borderColor = cell.isPlanDay ? "#22c55e" : "#e5e7eb";

              return (
                <div
                  key={cell.iso}
                  className="flex h-32 flex-col justify-between rounded-2xl border p-2 shadow-[0_8px_18px_rgba(15,23,42,0.06)]"
                  style={{ backgroundColor: baseBg, borderColor }}
                >
                  <div className="flex items-center justify-between text-[11px] font-semibold text-slate-800">
                    <span>{cell.dayNum}</span>
                    {cell.isToday && (
                      <span className="rounded-full bg-slate-900 px-2 py-0.5 text-[9px] font-semibold text-white">
                        Today
                      </span>
                    )}
                    {cell.isPlanDay && (
                      <span className="rounded-full bg-emerald-600/10 px-2 py-0.5 text-[9px] font-semibold text-emerald-700">
                        GAIA plan
                      </span>
                    )}
                  </div>

                  <div className="space-y-1 text-[10px] text-slate-700">
                    <div className="flex items-center justify-between">
                      <span>
                        {cell.date.toLocaleDateString(undefined, {
                          weekday: "short",
                        })}
                      </span>
                      {selectedFood && (
                        <span className="text-[9px] text-slate-500">
                          ≈ {selectedFood.kcal} kcal
                        </span>
                      )}
                    </div>

                    {isLockedPlanDay && defaultPlanFood ? (
                      <div className="mt-1 rounded-xl border border-emerald-500/80 bg-emerald-50 px-2 py-1 text-[10px] text-emerald-800">
                        <div className="font-semibold">GAIA lunch (locked)</div>
                        <div>{defaultPlanFood.label}</div>
                      </div>
                    ) : (
                      <select
                        className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-2 py-1 text-[10px] text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        value={selectedId}
                        onChange={(e) =>
                          handleSelectChange(cell.iso, e.target.value)
                        }
                      >
                        <option value="">— choose lunch —</option>
                        {FOOD_OPTIONS.map((opt) => (
                          <option key={opt.id} value={opt.id}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    )}

                    {cell.isPlanDay && (
                      <label className="mt-1 flex items-center gap-1 text-[9px] text-slate-600">
                        <input
                          type="checkbox"
                          className="h-3 w-3 rounded border-slate-300"
                          checked={followed}
                          onChange={() => handleToggleFollow(cell.iso)}
                        />
                        <span>I followed the plan today</span>
                      </label>
                    )}

                    <div className="mt-1 flex items-center justify-between text-[9px] text-slate-600">
                      <span>Pepsi (cans)</span>
                      <input
                        type="number"
                        min={0}
                        max={10}
                        step={1}
                        value={pepsiCount}
                        onChange={(e) =>
                          handlePepsiChange(cell.iso, e.target.value)
                        }
                        className="w-12 rounded-lg border border-slate-200 bg-white px-1 py-0.5 text-right text-[9px] focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>

                    <div className="mt-1 flex items-center justify-between text-[9px] text-slate-700">
                      <span>Total (lunch + Pepsi)</span>
                      <span>
                        ≈{" "}
                        {((selectedFood?.kcal ?? 0) +
                          (pepsiCount || 0) * PEPSI_KCAL_PER_CAN) || 0}{" "}
                        / {DAILY_KCAL_TARGET} kcal
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <aside className="space-y-4 rounded-3xl border border-slate-200 bg-white p-4 text-sm text-slate-700 shadow-[0_10px_30px_rgba(15,23,42,0.08)] sm:p-6">

          <div className="rounded-2xl border border-slate-100 bg-slate-50 px-3 py-2 text-[11px] text-slate-700">
            <div className="font-semibold text-slate-900">Daily calorie target (temporary)</div>
            <div>
              ≈ {DAILY_KCAL_TARGET} kcal per day, based on 34y · 70kg · 166cm · desk job.
              This is a maintenance estimate while we start training and learning the pattern.
            </div>
          </div>

          <h2 className="text-sm font-semibold text-slate-900">
            Monthly adherence (lunch, GAIA plan days only)
          </h2>
          <p className="text-xs text-slate-600">
            For now, each GAIA plan day counts as
            <span className="font-semibold"> 1 point</span> if you both{" "}
            <span className="font-semibold">follow the plan</span> and keep{" "}
            <span className="font-semibold">Pepsi ≤ {MAX_PEPSI_FOR_FULL_SCORE}</span>{" "}
            cans on that day.
          </p>
          <ul className="ml-4 list-disc space-y-1 text-xs text-slate-600">
            <li>Total GAIA plan days this month: {totalPlanDays}</li>
            <li>Plan days fully completed: {completedPlanDays}</li>
            <li>
              Adherence:
              <span className="font-semibold">
                {Number.isNaN(adherencePercent) ? 0 : adherencePercent}%
              </span>
            </li>
          </ul>
          {canUpgrade && (
            <button
              type="button"
              onClick={handleUpgradePlan}
              className="mt-2 inline-flex items-center rounded-full bg-emerald-600 px-4 py-1 text-[11px] font-semibold text-white shadow-sm hover:bg-emerald-700"
            >
              Upgrade GAIA plan (add one day/week)
            </button>
          )}
          {!canUpgrade && (
            <p className="mt-2 text-[11px] text-slate-500">
              When your adherence for a month reaches{" "}
              <span className="font-semibold">80% or more</span>, you&apos;ll be
              able to upgrade the GAIA plan and add one more planned lunch day
              per week (up to 7 days). Until then, the level stays fixed so the
              calendar doesn&apos;t jump ahead.
            </p>
          )}

          <h3 className="pt-2 text-sm font-semibold text-slate-900">
            How the cadence works
          </h3>
          <ul className="ml-4 list-disc space-y-1 text-xs text-slate-600">
            <li>Programme starts from January (FOOD_SCHEDULE_START_ISO).</li>
            <li>
              Friday is always a GAIA-plan lunch and is locked to GAIA&apos;s
              default healthy meal.
            </li>
            <li>
              Your current level controls how many total GAIA-plan days per week
              you have. Level 1 = Friday only. Higher levels add days in this
              order: Tuesday, Sunday, Wednesday, Monday, Thursday, Saturday.
            </li>
            <li>
              A GAIA day only &quot;counts&quot; if you followed the plan and
              kept Pepsi at or below {MAX_PEPSI_FOR_FULL_SCORE} cans.
            </li>
            <li>
              Future versions of the E-Table will add more detailed scoring
              (portions, insulin, etc.) so the 10% improvements can be based on
              both how many days are planned and how strict each day is.
            </li>
          </ul>
        </aside>
      </section>
    </div>
  );
}
