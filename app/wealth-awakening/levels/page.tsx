"use client";

import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { useWealthUnlocks } from "../hooks/useWealthUnlocks";
import type {
  WealthState,
  WealthLevelsSnapshot,
  WealthLevelDefinition,
  WealthInstrument,
} from "../lib/types";
import { loadWealthStateWithRemote } from "../lib/wealthStore";
import { buildWealthOverview, getTodayInKuwait } from "../lib/summary";
import {
  buildLevelsSnapshot,
  getPlanDefinitions,
  savePlanDefinitions,
} from "../lib/levels";
import { getExchangeRate } from "../lib/exchangeRate";
import {
  loadRates,
  saveRates,
  YearRate,
  bankRateForYear as getBankRateForYear,
} from "../lib/bankRates";

const surface = "wealth-surface text-[var(--gaia-text-default)]";
const BIRTH_DATE_UTC = new Date(Date.UTC(1991, 7, 10));
const BANK_RATE_BASE_YEAR = 2025;
const BANK_RATE_BASE_PERCENT = 17;
const MIN_ANNUAL_RATE = 10;
const REINVEST_STEP = 1000;

function formatCurrency(value: number, currency: string) {
  if (!Number.isFinite(value)) return "-";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

function formatPercent(value: number | null) {
  if (value === null || !Number.isFinite(value)) return "-";
  return `${value.toFixed(1)}%`;
}

function formatMonths(value: number | null) {
  if (value === null || !Number.isFinite(value)) return "-";
  if (value < 1) return `${value.toFixed(1)} mo`;
  if (value < 10) return `${value.toFixed(1)} mo`;
  return `${value.toFixed(0)} mo`;
}

function useAnimatedNumber(
  value: number | null,
  options?: { enabled?: boolean; durationMs?: number }
): number | null {
  const { enabled = true, durationMs = 1400 } = options ?? {};
  const [display, setDisplay] = useState<number | null>(value);
  const previous = useRef<number | null>(value);
  const frame = useRef<number | null>(null);

  useEffect(() => {
    if (frame.current != null) {
      cancelAnimationFrame(frame.current);
    }

    if (!enabled || value == null || !Number.isFinite(value)) {
      previous.current = value;
      setDisplay(value);
      return undefined;
    }

    const startValue = previous.current;
    if (startValue == null || !Number.isFinite(startValue)) {
      previous.current = value;
      setDisplay(value);
      return undefined;
    }

    if (startValue === value) {
      setDisplay(value);
      return undefined;
    }

    const start = performance.now();
    const delta = value - startValue;

    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / durationMs);
      const eased = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
      setDisplay(startValue + delta * eased);
      if (t < 1) {
        frame.current = requestAnimationFrame(tick);
      } else {
        previous.current = value;
        setDisplay(value);
      }
    };

    frame.current = requestAnimationFrame(tick);

    return () => {
      if (frame.current != null) {
        cancelAnimationFrame(frame.current);
      }
    };
  }, [value, enabled, durationMs]);

  return display;
}

function getGoalProgress(current: number, target: number | null): number {
  if (target == null || target <= 0) return 1;
  if (!Number.isFinite(current)) return 0;
  return Math.min(1, Math.max(0, current / target));
}

type ProgressAccent = {
  bar: string;
  badge: string;
};

function getProgressAccent(progress: number): ProgressAccent {
  if (progress >= 1) {
    return {
      bar: "bg-emerald-300",
      badge: "border-emerald-400/50 text-emerald-200",
    };
  }
  if (progress >= 0.5) {
    return {
      bar: "bg-sky-300",
      badge: "border-sky-400/50 text-sky-200",
    };
  }
  return {
    bar: "bg-amber-300",
    badge: "border-amber-400/50 text-amber-200",
  };
}

type PlanProjectionRow = {
  year: number;
  age: number;
  startBalance: number;
  deposit: number;
  depositYear: number;
  revenue: number;
  endBalance: number;
  rate: number;
  uninvested: number;
  months: {
    month: string;
    age: number;
    startBalance: number;
    deposit: number;
    depositYear: number;
    revenue: number;
    endBalance: number;
    rate: number;
    uninvested: number;
  }[];
};

type RateInstrument = {
  startDate: string;
  termMonths: number;
  annualRatePercent: number;
};

type ProjectionInstrument = RateInstrument & {
  principal: number;
};

type ProjectionColumnKey =
  | "year"
  | "age"
  | "startBalance"
  | "deposit"
  | "depositYear"
  | "revenue"
  | "endBalance"
  | "rate"
  | "uninvested";

const PLAN_PROJECTION_COLUMNS: ProjectionColumnKey[] = [
  "year",
  "age",
  "startBalance",
  "deposit",
  "depositYear",
  "revenue",
  "endBalance",
  "rate",
  "uninvested",
];

const PLAN_PROJECTION_COLUMN_LABELS: Record<ProjectionColumnKey, string> = {
  year: "Year",
  age: "Age",
  startBalance: "Starting balance",
  deposit: "Invested",
  depositYear: "Invested per year",
  revenue: "Revenue",
  endBalance: "Ending balance",
  rate: "Rate",
  uninvested: "Uninvested revenue",
};

const PLAN_PROJECTION_COLUMN_WIDTHS: Record<ProjectionColumnKey, string> = {
  year: "64px",
  age: "54px",
  startBalance: "120px",
  deposit: "120px",
  depositYear: "130px",
  revenue: "110px",
  endBalance: "120px",
  rate: "70px",
  uninvested: "130px",
};

function calculateAge(today: Date, birthDate: Date): number {
  let age = today.getUTCFullYear() - birthDate.getUTCFullYear();
  const hasBirthdayPassed =
    today.getUTCMonth() > birthDate.getUTCMonth() ||
    (today.getUTCMonth() === birthDate.getUTCMonth() &&
      today.getUTCDate() >= birthDate.getUTCDate());
  if (!hasBirthdayPassed) {
    age -= 1;
  }
  return Math.max(0, age);
}

function parseDayKey(day: string): {
  year: number;
  month: number;
  day: number;
} {
  const [y, m, d] = day.split("-").map((v) => parseInt(v, 10));
  return {
    year: Number.isFinite(y) ? y : 1970,
    month: Number.isFinite(m) ? m : 1,
    day: Number.isFinite(d) ? d : 1,
  };
}

function monthsBetween(start: string, end: string): number {
  const s = parseDayKey(start);
  const e = parseDayKey(end);
  return (e.year - s.year) * 12 + (e.month - s.month);
}

function toIsoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function convertToPlanCurrency(
  amount: number,
  currency: string,
  planCurrency: string,
  fxRate: number | null
): number {
  if (currency === planCurrency) return amount;
  if (planCurrency === "EGP" && currency === "KWD" && fxRate) {
    return amount * fxRate;
  }
  if (planCurrency === "KWD" && currency === "EGP" && fxRate) {
    return amount / fxRate;
  }
  return amount;
}

function bankRateForYear(year: number): number {
  return getBankRateForYear(year);
}

function initialRateForInstrument(inst: WealthInstrument): number {
  const storedRate = Number(inst.annualRatePercent) || 0;
  if (storedRate > 0) return storedRate;
  const startYear = parseDayKey(inst.startDate).year;
  return bankRateForYear(startYear);
}

function effectiveRateForMonth(inst: RateInstrument, monthKey: string): number {
  const baseRate = Number(inst.annualRatePercent) || 0;
  const termMonths = Math.max(0, Number(inst.termMonths) || 0);
  if (!inst.startDate || termMonths <= 0) return baseRate;
  const elapsed = monthsBetween(inst.startDate, monthKey);
  if (elapsed < 0) return baseRate;
  const renewalIndex = Math.floor(elapsed / termMonths);
  if (renewalIndex <= 0) return baseRate;
  const start = parseDayKey(inst.startDate);
  const renewalMonths = termMonths * renewalIndex;
  const totalMonths = start.year * 12 + (start.month - 1) + renewalMonths;
  const renewalYear = Math.floor(totalMonths / 12);
  return bankRateForYear(renewalYear);
}

function buildPlanProjectionRows(
  plan: WealthLevelDefinition,
  instruments: WealthInstrument[],
  planCurrency: string,
  fxRate: number | null,
  todayKey: string
): PlanProjectionRow[] {
  const todayDate = new Date(`${todayKey}T00:00:00Z`);
  const projectionInstruments: ProjectionInstrument[] = instruments
    .map((inst) => {
      const principalRaw = Number(inst.principal) || 0;
      if (principalRaw <= 0) return null;
      const termMonths = Math.max(0, Number(inst.termMonths) || 0);
      if (!inst.startDate || termMonths <= 0) return null;
      return {
        principal: convertToPlanCurrency(
          principalRaw,
          inst.currency,
          planCurrency,
          fxRate
        ),
        startDate: inst.startDate,
        termMonths,
        annualRatePercent: initialRateForInstrument(inst),
      };
    })
    .filter((inst): inst is ProjectionInstrument => inst !== null);

  const totalPrincipal = projectionInstruments.reduce(
    (sum, inst) => sum + inst.principal,
    0
  );
  if (totalPrincipal <= 0) return [];
  const baseRate =
    projectionInstruments.reduce(
      (sum, inst) => sum + inst.principal * inst.annualRatePercent,
      0
    ) / totalPrincipal;
  let reinvestBucket = 0;

  const targetSavings = plan.minSavings ?? 0;
  const targetRevenue = plan.minMonthlyRevenue ?? 0;

  const rows: PlanProjectionRow[] = [];
  let currentYear = todayDate.getUTCFullYear();
  let yearRow: PlanProjectionRow | null = null;
  let reached = false;

  const maxMonths = 1200;
  for (let i = 0; i < maxMonths; i += 1) {
    const cursor = new Date(
      Date.UTC(todayDate.getUTCFullYear(), todayDate.getUTCMonth() + i, 1)
    );
    const year = cursor.getUTCFullYear();
    const monthKey = toIsoDate(cursor);

    if (year !== currentYear) {
      if (yearRow) {
        rows.push(yearRow);
      }
      currentYear = year;
      yearRow = null;
    }

    const startPrincipal = projectionInstruments.reduce(
      (sum, inst) => sum + inst.principal,
      0
    );
    const startBalance = startPrincipal + reinvestBucket;
    let eligiblePrincipal = 0;
    let monthlyRevenue = 0;
    for (const inst of projectionInstruments) {
      const elapsed = monthsBetween(inst.startDate, monthKey);
      if (elapsed < 1) continue;
      const rate = effectiveRateForMonth(inst, monthKey);
      eligiblePrincipal += inst.principal;
      monthlyRevenue += (inst.principal * rate) / 100 / 12;
    }
    const effectiveRate =
      eligiblePrincipal > 0
        ? (monthlyRevenue / eligiblePrincipal) * 12 * 100
        : baseRate;
    const bucketTotal = reinvestBucket + monthlyRevenue;
    const investable = Math.floor(bucketTotal / REINVEST_STEP) * REINVEST_STEP;
    reinvestBucket = bucketTotal - investable;
    if (investable > 0) {
      projectionInstruments.push({
        principal: investable,
        startDate: monthKey,
        termMonths: 36,
        annualRatePercent: bankRateForYear(year),
      });
    }
    const endPrincipal = startPrincipal + investable;
    const endBalance = endPrincipal + reinvestBucket;
    const monthLabel = cursor.toLocaleDateString("en-US", { month: "short" });

    if (!yearRow) {
      yearRow = {
        year,
        age: calculateAge(new Date(Date.UTC(year, 11, 31)), BIRTH_DATE_UTC),
        startBalance,
        deposit: endPrincipal,
        depositYear: investable,
        revenue: monthlyRevenue,
        endBalance,
        rate: effectiveRate,
        uninvested: reinvestBucket,
        months: [
          {
            month: monthLabel,
            age: calculateAge(cursor, BIRTH_DATE_UTC),
            startBalance,
            deposit: endPrincipal,
            depositYear: investable,
            revenue: monthlyRevenue,
            endBalance,
            rate: effectiveRate,
            uninvested: reinvestBucket,
          },
        ],
      };
    } else {
      yearRow.deposit = endPrincipal;
      yearRow.depositYear += investable;
      yearRow.revenue += monthlyRevenue;
      yearRow.endBalance = endBalance;
      yearRow.rate = effectiveRate;
      yearRow.uninvested = reinvestBucket;
      yearRow.months.push({
        month: monthLabel,
        age: calculateAge(cursor, BIRTH_DATE_UTC),
        startBalance,
        deposit: endPrincipal,
        depositYear: investable,
        revenue: monthlyRevenue,
        endBalance,
        rate: effectiveRate,
        uninvested: reinvestBucket,
      });
    }

    if (endBalance >= targetSavings && monthlyRevenue >= targetRevenue) {
      reached = true;
      break;
    }
  }

  if (yearRow) {
    rows.push(yearRow);
  }

  if (!reached) {
    return rows;
  }
  return rows;
}

function estimatePlanTargetYear(
  plan: WealthLevelDefinition,
  instruments: WealthInstrument[],
  planCurrency: string,
  fxRate: number | null,
  todayKey: string
): number | null {
  const targetSavings = plan.minSavings ?? 0;
  const targetRevenue = plan.minMonthlyRevenue ?? 0;
  if (targetSavings <= 0 && targetRevenue <= 0) {
    return parseDayKey(todayKey).year;
  }
  const rows = buildPlanProjectionRows(
    plan,
    instruments,
    planCurrency,
    fxRate,
    todayKey
  );
  if (rows.length === 0) return null;
  const lastRow = rows[rows.length - 1];
  const lastMonth = lastRow.months[lastRow.months.length - 1];
  if (!lastMonth) return null;
  const reached =
    lastMonth.endBalance >= targetSavings && lastMonth.revenue >= targetRevenue;
  return reached ? lastRow.year : null;
}

export default function WealthLevelsPage() {
  const { canAccess, stage, totalLessonsCompleted } = useWealthUnlocks();
  if (!canAccess("levels")) {
    return (
      <main className="mx-auto max-w-5xl space-y-4 px-4 py-8 text-slate-100">
        <section className={`${surface} p-8`}>
          <h1 className="text-xl font-semibold text-white">Plans locked</h1>
          <p className="mt-2 text-sm text-slate-300">
            Complete more Academy lessons in Apollo to unlock this part of
            Wealth.
          </p>
          <p className="mt-2 text-xs text-slate-400">
            Lessons completed:{" "}
            <span className="font-semibold text-white">
              {totalLessonsCompleted}
            </span>{" "}
            - Wealth stage{" "}
            <span className="font-semibold text-white">{stage}</span>/5
          </p>
        </section>
      </main>
    );
  }

  const [state, setState] = useState<WealthState | null>(null);
  const [snapshot, setSnapshot] = useState<WealthLevelsSnapshot | null>(null);
  const [planDefinitions, setPlanDefinitions] = useState<
    WealthLevelDefinition[]
  >(() => getPlanDefinitions());
  const [planDraft, setPlanDraft] = useState<WealthLevelDefinition[]>(() =>
    getPlanDefinitions()
  );
  const [isEditingPlans, setIsEditingPlans] = useState(false);
  const [fxRate, setFxRate] = useState<number | null>(null);
  const [expandedYear, setExpandedYear] = useState<number | null>(null);
  const [collapsingYear, setCollapsingYear] = useState<number | null>(null);
  const [planProjectionColumns, setPlanProjectionColumns] = useState<
    ProjectionColumnKey[]
  >(PLAN_PROJECTION_COLUMNS);
  const [draggingColumn, setDraggingColumn] =
    useState<ProjectionColumnKey | null>(null);
  const [dragOverColumn, setDragOverColumn] =
    useState<ProjectionColumnKey | null>(null);
  const [animateNumbers, setAnimateNumbers] = useState(false);
  const planCurrency = "EGP";
  const todayKey = getTodayInKuwait();

  const [fiveYearRates, setFiveYearRates] = useState<YearRate[]>(() =>
    loadRates()
  );

  useEffect(() => {
    setFiveYearRates(loadRates());
  }, []);

  const refreshSnapshot = (nextState: WealthState | null) => {
    if (!nextState) return;
    const today = getTodayInKuwait();
    const todayOverview = buildWealthOverview(nextState, today);
    const snap = buildLevelsSnapshot(todayOverview, { planCurrency });
    setSnapshot(snap);
  };

  useEffect(() => {
    let cancelled = false;

    async function init() {
      const s = await loadWealthStateWithRemote();
      if (cancelled) return;
      setState(s);
      refreshSnapshot(s);
      const plans = getPlanDefinitions();
      setPlanDefinitions(plans);
      setPlanDraft(plans);
    }

    init();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!state) return;
    let cancelled = false;

    async function hydrateFx() {
      const info = await getExchangeRate();
      if (!cancelled) {
        setFxRate(info?.rate ?? null);
        refreshSnapshot(state);
      }
    }

    hydrateFx();

    return () => {
      cancelled = true;
    };
  }, [state]);

  useEffect(() => {
    if (!snapshot || animateNumbers) return;
    const id = requestAnimationFrame(() => setAnimateNumbers(true));
    return () => cancelAnimationFrame(id);
  }, [snapshot, animateNumbers]);

  const currentPlanId = snapshot?.currentLevelId ?? null;
  const currentPlanRows = useMemo(() => {
    if (!state || !currentPlanId) return [] as PlanProjectionRow[];
    const plan = planDefinitions.find((p) => p.id === currentPlanId);
    if (!plan) return [] as PlanProjectionRow[];
    return buildPlanProjectionRows(
      plan,
      state.instruments ?? [],
      planCurrency,
      fxRate,
      todayKey
    );
  }, [state, planDefinitions, planCurrency, fxRate, currentPlanId, todayKey]);

  const planTargetYears = useMemo(() => {
    const targets = new Map<string, number | null>();
    if (!state) return targets;
    const instruments = state.instruments ?? [];
    const plans = isEditingPlans ? planDraft : planDefinitions;
    for (const plan of plans) {
      targets.set(
        plan.id,
        estimatePlanTargetYear(
          plan,
          instruments,
          planCurrency,
          fxRate,
          todayKey
        )
      );
    }
    return targets;
  }, [
    state,
    planDefinitions,
    planDraft,
    isEditingPlans,
    planCurrency,
    fxRate,
    todayKey,
  ]);

  const totalSavings =
    typeof snapshot?.totalSavings === "number" &&
    Number.isFinite(snapshot.totalSavings)
      ? snapshot.totalSavings
      : 0;
  const monthlyRevenue =
    typeof snapshot?.monthlyPassiveIncome === "number"
      ? snapshot.monthlyPassiveIncome
      : 0;
  const monthsSaved =
    typeof snapshot?.monthsOfExpensesSaved === "number" &&
    Number.isFinite(snapshot.monthsOfExpensesSaved)
      ? snapshot.monthsOfExpensesSaved
      : null;
  const animatedSavings = useAnimatedNumber(totalSavings, {
    enabled: animateNumbers,
  });
  const animatedRevenue = useAnimatedNumber(monthlyRevenue, {
    enabled: animateNumbers,
  });
  const animatedMonthsSaved = useAnimatedNumber(monthsSaved, {
    enabled: animateNumbers,
  });

  const planColumnCount = planProjectionColumns.length;

  const getCellClasses = (
    key: ProjectionColumnKey,
    isMonth: boolean
  ): string => {
    const align = key === "year" || key === "age" ? "" : "text-right";
    const base = isMonth ? "py-2" : "py-3";
    if (isMonth) {
      const monthBg = "bg-blue-600/10";
      if (key === "year") {
        return `${base} pr-2 pl-4 text-[11px] text-white ${monthBg} ${align}`.trim();
      }
      if (key === "age") {
        return `${base} px-2 text-[11px] text-white ${monthBg} ${align}`.trim();
      }
      if (key === "deposit" || key === "revenue" || key === "endBalance") {
        return `${base} px-2 text-[11px] font-semibold text-white ${monthBg} ${align}`.trim();
      }
      return `${base} px-2 text-[11px] text-white ${monthBg} ${align}`.trim();
    }

    const hoverBg = "group-hover:bg-blue-600/12";
    if (key === "year") {
      return `${base} pr-2 text-[11px] text-white ${hoverBg}`.trim();
    }
    if (key === "age") {
      return `${base} px-2 text-[11px] text-white ${hoverBg}`.trim();
    }
    if (key === "deposit" || key === "revenue" || key === "endBalance") {
      return `${base} px-2 text-[11px] font-semibold text-white ${hoverBg} ${align}`.trim();
    }
    return `${base} px-2 text-[11px] text-white ${hoverBg} ${align}`.trim();
  };

  const renderYearCell = (key: ProjectionColumnKey, row: PlanProjectionRow) => {
    switch (key) {
      case "year":
        return row.year;
      case "age":
        return row.age;
      case "startBalance":
        return formatCurrency(row.startBalance, planCurrency);
      case "deposit":
        return formatCurrency(row.deposit, planCurrency);
      case "depositYear":
        return formatCurrency(row.depositYear, planCurrency);
      case "revenue":
        return formatCurrency(row.revenue, planCurrency);
      case "endBalance":
        return formatCurrency(row.endBalance, planCurrency);
      case "rate":
        return `${row.rate.toFixed(2)}%`;
      case "uninvested":
        return formatCurrency(row.uninvested, planCurrency);
      default:
        return "";
    }
  };

  const renderMonthCell = (
    key: ProjectionColumnKey,
    month: PlanProjectionRow["months"][number]
  ) => {
    switch (key) {
      case "year":
        return month.month;
      case "age":
        return month.age;
      case "startBalance":
        return formatCurrency(month.startBalance, planCurrency);
      case "deposit":
        return formatCurrency(month.deposit, planCurrency);
      case "depositYear":
        return formatCurrency(month.depositYear, planCurrency);
      case "revenue":
        return formatCurrency(month.revenue, planCurrency);
      case "endBalance":
        return formatCurrency(month.endBalance, planCurrency);
      case "rate":
        return `${month.rate.toFixed(2)}%`;
      case "uninvested":
        return formatCurrency(month.uninvested, planCurrency);
      default:
        return "";
    }
  };

  const handleColumnDrop = (
    sourceKey: ProjectionColumnKey,
    targetKey: ProjectionColumnKey
  ) => {
    if (sourceKey === targetKey) return;
    setPlanProjectionColumns((prev) => {
      const next = prev.filter((key) => key !== sourceKey);
      const targetIndex = next.indexOf(targetKey);
      next.splice(targetIndex, 0, sourceKey);
      return next;
    });
  };

  const startEditingPlans = () => {
    setPlanDraft(planDefinitions.map((plan) => ({ ...plan })));
    setIsEditingPlans(true);
  };

  const cancelEditingPlans = () => {
    setPlanDraft(planDefinitions.map((plan) => ({ ...plan })));
    setIsEditingPlans(false);
  };

  const updatePlanNumber = (
    index: number,
    field: "minSavings" | "minMonthlyRevenue",
    value: string
  ) => {
    const parsed = value === "" ? 0 : Number(value);
    const cleanValue = Number.isFinite(parsed) ? Math.max(0, parsed) : 0;
    setPlanDraft((prev) =>
      prev.map((plan, idx) =>
        idx === index ? { ...plan, [field]: cleanValue } : plan
      )
    );
  };

  const savePlans = () => {
    const saved = savePlanDefinitions(planDraft);
    setPlanDefinitions(saved.map((plan) => ({ ...plan })));
    setPlanDraft(saved.map((plan) => ({ ...plan })));
    setIsEditingPlans(false);
    refreshSnapshot(state);
  };

  if (!state || !snapshot) {
    return (
      <main className="mx-auto max-w-5xl space-y-4 px-4 py-8 text-slate-100">
        <section className={`${surface} p-6 text-sm text-slate-300`}>
          Loading your current plan and coverage...
        </section>
      </main>
    );
  }

  const currentPlan = snapshot.levels.find(
    (lvl) => lvl.id === snapshot.currentLevelId
  );
  const nextPlan = snapshot.levels.find(
    (lvl) => lvl.id === snapshot.nextLevelId
  );

  const targetSavings = currentPlan?.minSavings ?? null;
  const targetRevenue = currentPlan?.minMonthlyRevenue ?? null;

  const savingsGap =
    targetSavings != null ? targetSavings - totalSavings : null;
  const revenueGap =
    targetRevenue != null ? targetRevenue - monthlyRevenue : null;
  const nextPlanReady =
    (savingsGap == null || savingsGap <= 0) &&
    (revenueGap == null || revenueGap <= 0);

  const targetSavingsLabel =
    targetSavings != null && Number.isFinite(targetSavings)
      ? formatCurrency(targetSavings, planCurrency)
      : "Set plan thresholds";
  const targetRevenueLabel =
    targetRevenue != null && Number.isFinite(targetRevenue)
      ? formatCurrency(targetRevenue, planCurrency)
      : "Set plan thresholds";
  const savingsProgress = getGoalProgress(
    animatedSavings ?? totalSavings,
    targetSavings
  );
  const revenueProgress = getGoalProgress(
    animatedRevenue ?? monthlyRevenue,
    targetRevenue
  );
  const savingsAccent = getProgressAccent(savingsProgress);
  const revenueAccent = getProgressAccent(revenueProgress);
  const savingsProgressPercent = Math.round(savingsProgress * 100);
  const revenueProgressPercent = Math.round(revenueProgress * 100);
  const currentSavingsLabel = formatCurrency(
    animatedSavings ?? totalSavings,
    planCurrency
  );
  const currentRevenueLabel =
    monthlyRevenue > 0
      ? formatCurrency(animatedRevenue ?? monthlyRevenue, planCurrency)
      : "Not logged";

  let nextPlanHint: string | null = null;
  if (nextPlan) {
    const hints: string[] = [];
    if (savingsGap != null && savingsGap > 0) {
      hints.push(
        `Add about ${formatCurrency(savingsGap, planCurrency)} more in savings`
      );
    }
    if (revenueGap != null && revenueGap > 0) {
      hints.push(
        `Raise monthly revenue by about ${formatCurrency(
          revenueGap,
          planCurrency
        )}`
      );
    }
    if (hints.length > 0) {
      nextPlanHint = `${hints.join(" and ")} to reach ${nextPlan.shortLabel}.`;
    }
  }

  const showPlanProjectionInline =
    !isEditingPlans && currentPlanRows.length > 0;

  return (
    <main className="mx-auto max-w-6xl space-y-6 px-4 py-8 text-slate-100">
      <header className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-300/80">
            Wall Street Drive
          </p>
          <h1 className="mt-1 text-3xl font-semibold text-white">Plans</h1>
          <p className="mt-2 max-w-3xl text-sm text-slate-300">
            A calm ladder of comfort tiers, driven by your savings and the
            monthly revenue they generate. GAIA uses your real numbers to place
            you on the road.
          </p>
        </div>
      </header>

      <section className={`${surface} p-5 md:p-6`}>
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
              Plan thresholds & next step
            </p>
            <h2 className="text-base font-semibold text-white">Edit plans</h2>
            <p className="text-xs text-slate-400">
              Plans are measured in EGP (converted from your primary currency).
              Both savings and monthly revenue must meet the threshold.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {isEditingPlans ? (
              <>
                <button
                  type="button"
                  onClick={savePlans}
                  className="rounded-lg border border-emerald-500/40 bg-emerald-500/15 px-3 py-1.5 text-[11px] font-semibold text-emerald-100"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={cancelEditingPlans}
                  className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-[11px] font-semibold text-slate-200"
                >
                  Cancel
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={startEditingPlans}
                className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-[11px] font-semibold text-slate-200"
              >
                Edit
              </button>
            )}
          </div>
        </div>
        <div className="mt-4 overflow-hidden rounded-xl border border-slate-800">
          <table className="w-full text-left text-xs text-slate-200">
            <thead className="bg-slate-900/70">
              <tr className="text-[11px] uppercase tracking-wide text-slate-500">
                <th className="px-4 py-2">Plan</th>
                <th className="px-4 py-2">Target savings</th>
                <th className="px-4 py-2">Target monthly revenue</th>
                <th className="px-4 py-2">Est. year</th>
                <th className="px-4 py-2">Est. age</th>
                <th className="px-4 py-2">Narrative</th>
              </tr>
            </thead>
            <tbody>
              {(isEditingPlans ? planDraft : planDefinitions).map(
                (plan, idx) => {
                  const isCurrent = plan.id === snapshot.currentLevelId;
                  const isNext = plan.id === snapshot.nextLevelId;
                  const targetYear = planTargetYears.get(plan.id) ?? null;
                  const targetAge =
                    targetYear != null
                      ? calculateAge(
                          new Date(Date.UTC(targetYear, 11, 31)),
                          BIRTH_DATE_UTC
                        )
                      : null;

                  return (
                    <Fragment key={plan.id}>
                      <tr
                        className={`border-t border-slate-800 ${
                          isCurrent
                            ? "bg-emerald-500/10"
                            : isNext
                            ? "bg-sky-500/10"
                            : ""
                        }`}
                      >
                        <td className="px-4 py-2 text-[11px] font-semibold text-white">
                          <div className="flex flex-wrap items-center gap-2">
                            <span>{plan.shortLabel}</span>
                            {isCurrent && (
                              <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-semibold text-emerald-100">
                                Current
                              </span>
                            )}
                            {isNext && !isCurrent && (
                              <span className="rounded-full bg-sky-500/20 px-2 py-0.5 text-[10px] font-semibold text-sky-100">
                                Next target
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-2 text-[11px]">
                          {isEditingPlans ? (
                            <input
                              type="number"
                              min="0"
                              step="1"
                              value={plan.minSavings ?? 0}
                              onChange={(e) =>
                                updatePlanNumber(
                                  idx,
                                  "minSavings",
                                  e.target.value
                                )
                              }
                              className="w-full rounded-md border border-slate-700 bg-slate-950 px-2 py-1 text-[11px] text-white"
                            />
                          ) : (
                            formatCurrency(plan.minSavings ?? 0, planCurrency)
                          )}
                        </td>
                        <td className="px-4 py-2 text-[11px]">
                          {isEditingPlans ? (
                            <input
                              type="number"
                              min="0"
                              step="1"
                              value={plan.minMonthlyRevenue ?? 0}
                              onChange={(e) =>
                                updatePlanNumber(
                                  idx,
                                  "minMonthlyRevenue",
                                  e.target.value
                                )
                              }
                              className="w-full rounded-md border border-slate-700 bg-slate-950 px-2 py-1 text-[11px] text-white"
                            />
                          ) : (
                            formatCurrency(
                              plan.minMonthlyRevenue ?? 0,
                              planCurrency
                            )
                          )}
                        </td>
                        <td className="px-4 py-2 text-[11px]">
                          {targetYear != null ? targetYear : "-"}
                        </td>
                        <td className="px-4 py-2 text-[11px]">
                          {targetAge != null ? targetAge : "-"}
                        </td>
                        <td className="px-4 py-2 text-[11px] text-slate-300 max-w-[360px] truncate">
                          {plan.description}
                        </td>
                      </tr>
                      {showPlanProjectionInline && isCurrent ? (
                        <tr className="border-t border-slate-800">
                          <td colSpan={6} className="px-4 pb-4">
                            <div className="mt-3 rounded-xl border border-slate-800 bg-slate-900/70 p-4">
                              <div className="mt-3 border-t border-slate-800 pt-3">
                                <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                                  <div
                                    className="w-full rounded-2xl border border-slate-800 bg-slate-900 p-4 text-slate-100"
                                    style={{ fontSize: "calc(1em + 2px)" }}
                                  >
                                    <p className="text-[11px] font-semibold uppercase tracking-wide">
                                      Plan brief
                                    </p>
                                    <div className="mt-3 flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                                      <div>
                                        <p className="text-[11px] font-semibold uppercase tracking-wide">
                                          Current wealth plan
                                        </p>
                                        <h3 className="mt-1 text-lg font-semibold text-slate-100">
                                          {currentPlan?.shortLabel ??
                                            "Need data to place you"}
                                        </h3>
                                        <p
                                          className="mt-2 text-slate-100 text-center self-center capitalize"
                                          style={{
                                            fontFamily:
                                              '"GT Alpina Condensed","Times New Roman",serif',
                                            fontSize: "48px",
                                            lineHeight: "1.05",
                                          }}
                                        >
                                          {currentPlan?.description ??
                                            "Log balances and investments so GAIA can place you on the ladder."}
                                        </p>
                                      </div>
                                    </div>
                                    <div className="mt-4 grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_200px]">
                                      <div className="rounded-xl border border-slate-800 bg-slate-900 px-4 py-3">
                                        <div className="flex items-start justify-between gap-3">
                                          <div>
                                            <p className="text-[11px] uppercase tracking-wide">
                                              Savings goal
                                            </p>
                                            <p className="text-sm font-semibold text-slate-100">
                                              {currentSavingsLabel}
                                            </p>
                                            <p className="text-[11px]">
                                              Target: {targetSavingsLabel}
                                            </p>
                                          </div>
                                          <span
                                            className={`rounded-full border bg-slate-900 px-2 py-1 text-[10px] font-semibold ${savingsAccent.badge}`}
                                          >
                                            {savingsProgressPercent}%
                                          </span>
                                        </div>
                                        <div className="mt-3 h-2 w-full rounded-full bg-slate-800">
                                          <div
                                            className={`h-2 rounded-full ${savingsAccent.bar}`}
                                            style={{
                                              width: `${savingsProgressPercent}%`,
                                            }}
                                          />
                                        </div>
                                        {savingsGap != null &&
                                        savingsGap > 0 ? (
                                          <p className="mt-2 text-[10px]">
                                            ~
                                            {formatCurrency(
                                              savingsGap,
                                              planCurrency
                                            )}{" "}
                                            remaining
                                          </p>
                                        ) : (
                                          <p className="mt-2 text-[10px]">
                                            Goal met
                                          </p>
                                        )}
                                      </div>
                                      <div className="rounded-xl border border-slate-800 bg-slate-900 px-4 py-3">
                                        <div className="flex items-start justify-between gap-3">
                                          <div>
                                            <p className="text-[11px] uppercase tracking-wide">
                                              Monthly revenue goal
                                            </p>
                                            <p className="text-sm font-semibold text-slate-100">
                                              {currentRevenueLabel}
                                            </p>
                                            <p className="text-[11px]">
                                              Target: {targetRevenueLabel}
                                            </p>
                                          </div>
                                          <span
                                            className={`rounded-full border bg-slate-900 px-2 py-1 text-[10px] font-semibold ${revenueAccent.badge}`}
                                          >
                                            {revenueProgressPercent}%
                                          </span>
                                        </div>
                                        <div className="mt-3 h-2 w-full rounded-full bg-slate-800">
                                          <div
                                            className={`h-2 rounded-full ${revenueAccent.bar}`}
                                            style={{
                                              width: `${revenueProgressPercent}%`,
                                            }}
                                          />
                                        </div>
                                        {revenueGap != null &&
                                        revenueGap > 0 ? (
                                          <p className="mt-2 text-[10px]">
                                            ~
                                            {formatCurrency(
                                              revenueGap,
                                              planCurrency
                                            )}{" "}
                                            remaining
                                          </p>
                                        ) : (
                                          <p className="mt-2 text-[10px]">
                                            Goal met
                                          </p>
                                        )}
                                      </div>
                                      <div className="rounded-xl border border-slate-800 bg-slate-900 px-4 py-3">
                                        <p className="text-[11px] uppercase tracking-wide">
                                          Months saved
                                        </p>
                                        <p className="text-sm font-semibold text-slate-100">
                                          {animatedMonthsSaved != null &&
                                          Number.isFinite(animatedMonthsSaved)
                                            ? `${animatedMonthsSaved.toFixed(
                                                1
                                              )} months`
                                            : "Need data"}
                                        </p>
                                        <p className="mt-2 text-[10px]">
                                          Coverage based on logged expenses.
                                        </p>
                                      </div>
                                    </div>
                                    <div className="mt-3 rounded-xl border border-slate-800 bg-slate-900 px-3 py-2">
                                      <p className="text-[10px] font-semibold uppercase tracking-wide">
                                        Plan projections
                                      </p>
                                      <p className="mt-1 text-[11px]">
                                        Path to current target (stops when
                                        savings and revenue targets are met).
                                      </p>
                                      <p className="mt-1 text-[11px]">
                                        Reinvests every {REINVEST_STEP}.
                                        Certificates lock for their term and
                                        renew at the bank rate (17% in 2025, -1%
                                        per year to a 10% floor).
                                      </p>
                                      <div className="mt-3">
                                        <p className="text-[10px] font-semibold uppercase tracking-wide">
                                          Bank rate (next 5 years)
                                        </p>
                                        <div className="mt-2 grid grid-cols-5 gap-2">
                                          {fiveYearRates.map((r, i) => (
                                            <div
                                              key={r.year}
                                              className="rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-200 flex flex-col items-start"
                                            >
                                              <div className="text-[11px] text-slate-400">
                                                {r.year}
                                              </div>
                                              <select
                                                value={String(r.rate)}
                                                onChange={(e) => {
                                                  const val = Number(
                                                    e.target.value
                                                  );
                                                  setFiveYearRates((prev) => {
                                                    const next = prev.slice();
                                                    next[i] = {
                                                      year: r.year,
                                                      rate: Number.isFinite(val)
                                                        ? val
                                                        : 0,
                                                    };
                                                    return next;
                                                  });
                                                }}
                                                className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-2 py-1 text-sm text-white"
                                              >
                                                {Array.from(
                                                  { length: 15 },
                                                  (_, k) => {
                                                    const val = 17 - k * 0.5;
                                                    return (
                                                      <option
                                                        key={String(val)}
                                                        value={String(val)}
                                                      >
                                                        {val % 1 === 0
                                                          ? `${val.toFixed(0)}`
                                                          : `${val.toFixed(1)}`}
                                                      </option>
                                                    );
                                                  }
                                                )}
                                              </select>
                                            </div>
                                          ))}
                                        </div>
                                        <div className="mt-2 flex gap-2">
                                          <button
                                            type="button"
                                            onClick={() => {
                                              saveRates(fiveYearRates);
                                              refreshSnapshot(state);
                                              // reload so projections and other pages pick up new rates
                                              if (
                                                typeof window !== "undefined"
                                              ) {
                                                window.location.reload();
                                              }
                                            }}
                                            className="rounded-lg border border-emerald-500/40 bg-emerald-500/15 px-3 py-1.5 text-[11px] font-semibold text-emerald-100"
                                          >
                                            Save rates
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() => {
                                              const defaults = loadRates();
                                              setFiveYearRates(defaults);
                                              saveRates(defaults);
                                              refreshSnapshot(state);
                                            }}
                                            className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-[11px] font-semibold text-slate-200"
                                          >
                                            Reset
                                          </button>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                <div className="mt-3 overflow-x-hidden">
                                  <table className="min-w-full table-fixed border-separate border-spacing-y-2 text-left text-xs text-white">
                                    <colgroup>
                                      {planProjectionColumns.map((key) => (
                                        <col
                                          key={key}
                                          style={{
                                            width:
                                              PLAN_PROJECTION_COLUMN_WIDTHS[
                                                key
                                              ],
                                          }}
                                        />
                                      ))}
                                    </colgroup>
                                    <thead>
                                      <tr className="text-[11px] uppercase tracking-wide text-white">
                                        {planProjectionColumns.map((key) => {
                                          const isRight =
                                            key !== "year" && key !== "age";
                                          return (
                                            <th
                                              key={key}
                                              draggable
                                              onDragStart={(event) => {
                                                setDraggingColumn(key);
                                                event.dataTransfer.setData(
                                                  "text/plain",
                                                  key
                                                );
                                                event.dataTransfer.effectAllowed =
                                                  "move";
                                              }}
                                              onDragOver={(event) => {
                                                event.preventDefault();
                                                setDragOverColumn(key);
                                              }}
                                              onDragLeave={() =>
                                                setDragOverColumn(null)
                                              }
                                              onDrop={(event) => {
                                                event.preventDefault();
                                                const source =
                                                  draggingColumn ||
                                                  (event.dataTransfer.getData(
                                                    "text/plain"
                                                  ) as ProjectionColumnKey);
                                                if (source) {
                                                  handleColumnDrop(source, key);
                                                }
                                                setDraggingColumn(null);
                                                setDragOverColumn(null);
                                              }}
                                              onDragEnd={() => {
                                                setDraggingColumn(null);
                                                setDragOverColumn(null);
                                              }}
                                              className={`py-2 ${
                                                isRight
                                                  ? "px-2 text-right"
                                                  : "pr-2"
                                              } ${
                                                dragOverColumn === key
                                                  ? "bg-blue-600/10"
                                                  : ""
                                              }`}
                                              title="Drag to reorder columns"
                                            >
                                              {
                                                PLAN_PROJECTION_COLUMN_LABELS[
                                                  key
                                                ]
                                              }
                                            </th>
                                          );
                                        })}
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {currentPlanRows.map((row) => (
                                        <Fragment key={row.year}>
                                          <tr
                                            className="group cursor-pointer text-white transition"
                                            onClick={() =>
                                              setExpandedYear((prev) => {
                                                if (prev === row.year) {
                                                  setCollapsingYear(row.year);
                                                  setTimeout(
                                                    () =>
                                                      setCollapsingYear(null),
                                                    700
                                                  );
                                                  return null;
                                                }
                                                return row.year;
                                              })
                                            }
                                          >
                                            {planProjectionColumns.map(
                                              (key, colIndex) => {
                                                const rounding =
                                                  colIndex === 0
                                                    ? "rounded-l-xl"
                                                    : colIndex ===
                                                      planProjectionColumns.length -
                                                        1
                                                    ? "rounded-r-xl"
                                                    : "";
                                                return (
                                                  <td
                                                    key={key}
                                                    className={`${getCellClasses(
                                                      key,
                                                      false
                                                    )} ${rounding}`}
                                                  >
                                                    {renderYearCell(key, row)}
                                                  </td>
                                                );
                                              }
                                            )}
                                          </tr>
                                          {expandedYear === row.year ||
                                          collapsingYear === row.year ? (
                                            <tr className="border-b border-slate-800">
                                              <td
                                                colSpan={planColumnCount}
                                                className="p-0"
                                              >
                                                <div
                                                  className={`overflow-hidden transition-[max-height,opacity] duration-[700ms] ease-in-out ${
                                                    expandedYear === row.year &&
                                                    collapsingYear !== row.year
                                                      ? "max-h-[720px] opacity-100"
                                                      : "max-h-0 opacity-0"
                                                  }`}
                                                >
                                                  <table className="w-full table-fixed border-separate border-spacing-y-1 text-left text-xs text-white">
                                                    <colgroup>
                                                      {planProjectionColumns.map(
                                                        (key) => (
                                                          <col
                                                            key={key}
                                                            style={{
                                                              width:
                                                                PLAN_PROJECTION_COLUMN_WIDTHS[
                                                                  key
                                                                ],
                                                            }}
                                                          />
                                                        )
                                                      )}
                                                    </colgroup>
                                                    <tbody>
                                                      {row.months.map(
                                                        (month, monthIndex) => (
                                                          <tr
                                                            key={`${row.year}-${monthIndex}-${month.month}`}
                                                            className="border-b border-slate-800 text-slate-300"
                                                          >
                                                            {planProjectionColumns.map(
                                                              (
                                                                key,
                                                                monthColIndex
                                                              ) => {
                                                                const rounding =
                                                                  monthColIndex ===
                                                                  0
                                                                    ? "rounded-l-xl"
                                                                    : monthColIndex ===
                                                                      planProjectionColumns.length -
                                                                        1
                                                                    ? "rounded-r-xl"
                                                                    : "";
                                                                return (
                                                                  <td
                                                                    key={key}
                                                                    className={`${getCellClasses(
                                                                      key,
                                                                      true
                                                                    )} ${rounding}`}
                                                                  >
                                                                    {renderMonthCell(
                                                                      key,
                                                                      month
                                                                    )}
                                                                  </td>
                                                                );
                                                              }
                                                            )}
                                                          </tr>
                                                        )
                                                      )}
                                                    </tbody>
                                                  </table>
                                                </div>
                                              </td>
                                            </tr>
                                          ) : null}
                                        </Fragment>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                                <div className="mt-4 border-t border-slate-800 pt-3">
                                  <h3 className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                                    Coverage
                                  </h3>
                                  <dl className="mt-2 space-y-1 text-xs text-slate-200">
                                    <div className="flex items-center justify-between gap-2">
                                      <dt>Estimated monthly expenses</dt>
                                      <dd className="font-semibold text-white">
                                        {snapshot.estimatedMonthlyExpenses
                                          ? formatCurrency(
                                              snapshot.estimatedMonthlyExpenses,
                                              planCurrency
                                            )
                                          : "-"}
                                      </dd>
                                    </div>
                                    <div className="flex items-center justify-between gap-2">
                                      <dt>Monthly interest (passive)</dt>
                                      <dd className="font-semibold text-white">
                                        {formatCurrency(
                                          snapshot.monthlyPassiveIncome ?? 0,
                                          planCurrency
                                        )}
                                      </dd>
                                    </div>
                                    <div className="flex items-center justify-between gap-2">
                                      <dt>Interest coverage</dt>
                                      <dd className="font-semibold text-white">
                                        {formatPercent(
                                          snapshot.coveragePercent
                                        )}
                                      </dd>
                                    </div>
                                    <div className="flex items-center justify-between gap-2">
                                      <dt>Survivability</dt>
                                      <dd className="font-semibold text-white">
                                        {currentPlan?.survivability ?? "-"}
                                      </dd>
                                    </div>
                                    <div className="flex items-center justify-between gap-2">
                                      <dt>Allowed Enrichment Spending</dt>
                                      <dd className="font-semibold text-white">
                                        {currentPlan?.allowedEnrichment ?? "-"}
                                      </dd>
                                    </div>
                                    <div className="flex items-center justify-between gap-2">
                                      <dt>Calendars unlocked</dt>
                                      <dd className="font-semibold text-white">
                                        {currentPlan?.calendarsUnlocked ?? "-"}
                                      </dd>
                                    </div>
                                  </dl>
                                  <p className="mt-2 text-[11px] text-slate-400">
                                    Coverage is how much of your estimated
                                    monthly expenses could be paid by interest
                                    alone, in EGP.
                                  </p>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      ) : null}
                    </Fragment>
                  );
                }
              )}
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-[11px] text-slate-400">
          Tip: set a threshold to 0 if you want that requirement to be ignored
          for a plan.
        </p>

        <p className="mt-4 text-xs text-slate-400">
          Each plan is a simple checkpoint. You don&apos;t have to race. The
          goal is to know roughly where you stand and what the next gentle
          improvement could be.
        </p>

        {nextPlanHint && (
          <p className="mt-3 text-xs font-medium text-emerald-200">
            {nextPlanHint}
          </p>
        )}
      </section>
    </main>
  );
}
