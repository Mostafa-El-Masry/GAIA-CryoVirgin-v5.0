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
  options?: { enabled?: boolean; durationMs?: number },
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
  fxRate: number | null,
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
  todayKey: string,
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
          fxRate,
        ),
        startDate: inst.startDate,
        termMonths,
        annualRatePercent: initialRateForInstrument(inst),
      };
    })
    .filter((inst): inst is ProjectionInstrument => inst !== null);

  const totalPrincipal = projectionInstruments.reduce(
    (sum, inst) => sum + inst.principal,
    0,
  );
  if (totalPrincipal <= 0) return [];
  const baseRate =
    projectionInstruments.reduce(
      (sum, inst) => sum + inst.principal * inst.annualRatePercent,
      0,
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
      Date.UTC(todayDate.getUTCFullYear(), todayDate.getUTCMonth() + i, 1),
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
      0,
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
  todayKey: string,
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
    todayKey,
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
    return null;
  }

  const [state, setState] = useState<WealthState | null>(null);
  const [snapshot, setSnapshot] = useState<WealthLevelsSnapshot | null>(null);
  const [planDefinitions, setPlanDefinitions] = useState<
    WealthLevelDefinition[]
  >(() => getPlanDefinitions());
  const [planDraft, setPlanDraft] = useState<WealthLevelDefinition[]>(() =>
    getPlanDefinitions(),
  );
  const [isEditingPlans, setIsEditingPlans] = useState(false);
  const [fxRate, setFxRate] = useState<number | null>(null);
  const [expandedYear, setExpandedYear] = useState<number | null>(null);
  const [collapsingYear, setCollapsingYear] = useState<number | null>(null);
  const [expandedPlanId, setExpandedPlanId] = useState<string | null>(null);
  const [expandedPlanProjectionRows, setExpandedPlanProjectionRows] = useState<
    PlanProjectionRow[]
  >([]);
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

  // Calculate projections only when a plan is expanded
  useEffect(() => {
    if (expandedPlanId && state) {
      const plan = planDefinitions.find((p) => p.id === expandedPlanId);
      if (plan) {
        const rows = buildPlanProjectionRows(
          plan,
          state.instruments ?? [],
          planCurrency,
          fxRate,
          todayKey,
        );
        setExpandedPlanProjectionRows(rows);
      }
    } else {
      setExpandedPlanProjectionRows([]);
    }
  }, [expandedPlanId, state, planDefinitions, planCurrency, fxRate, todayKey]);

  const [fiveYearRates, setFiveYearRates] = useState<YearRate[]>(() =>
    loadRates(),
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
      todayKey,
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
          todayKey,
        ),
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
    isMonth: boolean,
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
    month: PlanProjectionRow["months"][number],
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
    targetKey: ProjectionColumnKey,
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
    value: string,
  ) => {
    const parsed = value === "" ? 0 : Number(value);
    const cleanValue = Number.isFinite(parsed) ? Math.max(0, parsed) : 0;
    setPlanDraft((prev) =>
      prev.map((plan, idx) =>
        idx === index ? { ...plan, [field]: cleanValue } : plan,
      ),
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
    (lvl) => lvl.id === snapshot.currentLevelId,
  );
  const nextPlan = snapshot.levels.find(
    (lvl) => lvl.id === snapshot.nextLevelId,
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
    targetSavings,
  );
  const revenueProgress = getGoalProgress(
    animatedRevenue ?? monthlyRevenue,
    targetRevenue,
  );
  const savingsAccent = getProgressAccent(savingsProgress);
  const revenueAccent = getProgressAccent(revenueProgress);
  const savingsProgressPercent = Math.round(savingsProgress * 100);
  const revenueProgressPercent = Math.round(revenueProgress * 100);
  const currentSavingsLabel = formatCurrency(
    animatedSavings ?? totalSavings,
    planCurrency,
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
        `Add about ${formatCurrency(savingsGap, planCurrency)} more in savings`,
      );
    }
    if (revenueGap != null && revenueGap > 0) {
      hints.push(
        `Raise monthly revenue by about ${formatCurrency(
          revenueGap,
          planCurrency,
        )}`,
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
        <div className="mt-4 space-y-3">
          {(isEditingPlans ? planDraft : planDefinitions).map((plan, idx) => {
            const isCurrent = plan.id === snapshot.currentLevelId;
            const isNext = plan.id === snapshot.nextLevelId;
            const isExpanded = expandedPlanId === plan.id;
            const targetYear = planTargetYears.get(plan.id) ?? null;
            const targetAge =
              targetYear != null
                ? calculateAge(
                    new Date(Date.UTC(targetYear, 11, 31)),
                    BIRTH_DATE_UTC,
                  )
                : null;

            return (
              <div
                key={plan.id}
                className={`rounded-xl border overflow-hidden transition-all duration-[1500ms] ${
                  isCurrent
                    ? "border-emerald-500/30 bg-emerald-50/5 shadow-lg shadow-emerald-500/10"
                    : isNext
                      ? "border-sky-500/30 bg-sky-50/5 shadow-lg shadow-sky-500/10"
                      : "border-slate-300 bg-white hover:border-slate-400"
                }`}
              >
                <button
                  type="button"
                  onClick={() => setExpandedPlanId(isExpanded ? null : plan.id)}
                  className={`w-full px-6 py-4 text-left transition-all duration-[1500ms] ${
                    isExpanded
                      ? "bg-slate-100/60"
                      : isCurrent
                        ? "hover:bg-emerald-50/20"
                        : isNext
                          ? "hover:bg-sky-50/20"
                          : "hover:bg-slate-50/40"
                  }`}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex flex-col gap-2 flex-1">
                      <div className="flex items-center gap-3">
                        <span
                          className={`text-lg font-bold ${
                            isCurrent
                              ? "text-emerald-300"
                              : isNext
                                ? "text-sky-300"
                                : "text-white"
                          }`}
                        >
                          {plan.shortLabel}
                        </span>
                        {isCurrent && (
                          <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-100 border border-emerald-500/30">
                            Current Plan
                          </span>
                        )}
                        {isNext && !isCurrent && (
                          <span className="rounded-full bg-sky-500/20 px-3 py-1 text-xs font-semibold text-sky-100 border border-sky-500/30">
                            Next Target
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-slate-300 flex gap-6 flex-wrap">
                        <span className="flex items-center gap-1">
                          <span className="text-slate-400">Savings:</span>
                          <span className="font-semibold text-white">
                            {formatCurrency(plan.minSavings ?? 0, planCurrency)}
                          </span>
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="text-slate-400">Revenue:</span>
                          <span className="font-semibold text-white">
                            {formatCurrency(
                              plan.minMonthlyRevenue ?? 0,
                              planCurrency,
                            )}
                          </span>
                        </span>
                        {targetYear && (
                          <span className="flex items-center gap-1">
                            <span className="text-slate-400">
                              Est. completion:
                            </span>
                            <span className="font-semibold text-white">
                              {targetYear}{" "}
                              {targetAge != null && `(age ${targetAge})`}
                            </span>
                          </span>
                        )}
                      </div>
                    </div>
                    <div
                      className={`transition-transform duration-[1500ms] ${isExpanded ? "rotate-180" : ""}`}
                    >
                      <svg
                        className={`w-6 h-6 ${
                          isCurrent
                            ? "text-emerald-400"
                            : isNext
                              ? "text-sky-400"
                              : "text-slate-400"
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 14l-7 7m0 0l-7-7m7 7V3"
                        />
                      </svg>
                    </div>
                  </div>
                </button>

                <div
                  className={`border-t border-slate-300/50 transition-all duration-[1500ms] ${isExpanded ? "max-h-[3000px] opacity-100" : "max-h-0 opacity-0 overflow-hidden"}`}
                >
                  {/* Plan Description */}
                  <div className="p-6 border-b border-slate-300/30">
                    <div className="flex items-center gap-2 mb-3">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          isCurrent
                            ? "bg-emerald-400"
                            : isNext
                              ? "bg-sky-400"
                              : "bg-slate-400"
                        }`}
                      ></div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                        Plan Details
                      </p>
                    </div>
                    <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                      {plan.description}
                    </p>
                  </div>

                  {/* Coverage Information */}
                  <div className="p-6 border-b border-slate-300/30">
                    <div className="flex items-center gap-2 mb-4">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          isCurrent
                            ? "bg-emerald-400"
                            : isNext
                              ? "bg-sky-400"
                              : "bg-slate-400"
                        }`}
                      ></div>
                      <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                        Coverage Analysis
                      </h3>
                    </div>
                    <div className="overflow-x-auto rounded-lg border border-slate-300">
                      <table className="w-full text-sm">
                        <thead className="bg-slate-100/50">
                          <tr>
                            <th className="px-4 py-3 text-left font-semibold text-slate-700 border-r border-slate-300">
                              Metric
                            </th>
                            <th className="px-4 py-3 text-left font-semibold text-slate-700">
                              Value
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="border-b border-slate-300/50 bg-slate-50/20 hover:bg-slate-100/40 transition-colors">
                            <td className="px-4 py-3 text-slate-800 font-medium border-r border-slate-300/30">
                              Estimated monthly expenses
                            </td>
                            <td className="px-4 py-3 text-slate-800 font-bold">
                              {snapshot.estimatedMonthlyExpenses
                                ? formatCurrency(
                                    snapshot.estimatedMonthlyExpenses,
                                    planCurrency,
                                  )
                                : "-"}
                            </td>
                          </tr>
                          <tr className="border-b border-slate-300/50 bg-white hover:bg-slate-100/40 transition-colors">
                            <td className="px-4 py-3 text-slate-800 font-medium border-r border-slate-300/30">
                              Monthly passive income
                            </td>
                            <td className="px-4 py-3 text-slate-800 font-bold">
                              {formatCurrency(
                                snapshot.monthlyPassiveIncome ?? 0,
                                planCurrency,
                              )}
                            </td>
                          </tr>
                          <tr className="border-b border-slate-300/50 bg-slate-50/20 hover:bg-slate-100/40 transition-colors">
                            <td className="px-4 py-3 text-slate-800 font-medium border-r border-slate-300/30">
                              Coverage ratio
                            </td>
                            <td className="px-4 py-3 text-slate-800 font-bold">
                              {formatPercent(snapshot.coveragePercent)}
                            </td>
                          </tr>
                          <tr className="border-b border-slate-300/50 bg-white hover:bg-slate-100/40 transition-colors">
                            <td className="px-4 py-3 text-slate-800 font-medium border-r border-slate-300/30">
                              Survivability
                            </td>
                            <td className="px-4 py-3 text-slate-800 font-bold">
                              {plan.survivability}
                            </td>
                          </tr>
                          <tr className="border-b border-slate-300/50 bg-slate-50/20 hover:bg-slate-100/40 transition-colors">
                            <td className="px-4 py-3 text-slate-800 font-medium border-r border-slate-300/30">
                              Enrichment spending allowed
                            </td>
                            <td className="px-4 py-3 text-slate-800 font-bold">
                              {plan.allowedEnrichment}
                            </td>
                          </tr>
                          <tr className="bg-white hover:bg-slate-100/40 transition-colors">
                            <td className="px-4 py-3 text-slate-800 font-medium border-r border-slate-300/30">
                              Calendars unlocked
                            </td>
                            <td className="px-4 py-3 text-slate-800 font-bold">
                              {plan.calendarsUnlocked}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    <p className="mt-4 text-xs text-slate-600 leading-relaxed">
                      Coverage shows how much of your estimated monthly expenses
                      could be paid by passive income alone.
                    </p>
                  </div>

                  {/* Projection Table */}
                  {isExpanded && expandedPlanProjectionRows.length > 0 && (
                    <div className="p-6">
                      <div className="flex items-center gap-2 mb-4">
                        <div
                          className={`w-2 h-2 rounded-full ${
                            isCurrent
                              ? "bg-emerald-400"
                              : isNext
                                ? "bg-sky-400"
                                : "bg-slate-400"
                          }`}
                        ></div>
                        <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                          Wealth Projection
                        </h3>
                      </div>
                      <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/80 p-3 m-2">
                        <table className="min-w-full text-left text-xs text-slate-200 rounded-lg overflow-hidden">
                          <thead>
                            <tr className="border-b border-slate-800 text-[11px] uppercase tracking-wide text-slate-500">
                              {planProjectionColumns.map((key) => (
                                <th
                                  key={key}
                                  className={`px-3 py-2 m-2 text-left border-r border-slate-800 last:border-r-0 ${
                                    key === "year" || key === "age"
                                      ? "text-center"
                                      : "text-right"
                                  }`}
                                  style={{
                                    width: PLAN_PROJECTION_COLUMN_WIDTHS[key],
                                  }}
                                >
                                  {PLAN_PROJECTION_COLUMN_LABELS[key]}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {expandedPlanProjectionRows.map((row, rowIdx) => (
                              <Fragment key={`${row.year}-${rowIdx}`}>
                                {/* Year Row */}
                                <tr
                                  className="border-b border-slate-800 last:border-b-0 cursor-pointer py-3 m-2 rounded-md"
                                  onClick={() =>
                                    setExpandedYear(
                                      expandedYear === row.year
                                        ? null
                                        : row.year,
                                    )
                                  }
                                >
                                  {planProjectionColumns.map((key) => (
                                    <td
                                      key={key}
                                      className={`px-3 py-3 m-2 rounded-md text-white border-r border-slate-800 last:border-r-0 ${
                                        key === "year" || key === "age"
                                          ? "text-center"
                                          : "text-right"
                                      }`}
                                    >
                                      {renderYearCell(key, row)}
                                    </td>
                                  ))}
                                </tr>
                                {/* Month Rows */}
                                {expandedYear === row.year &&
                                  row.months.map((month, monthIdx) => (
                                    <tr
                                      key={`${row.year}-${monthIdx}`}
                                      className="bg-blue-600/10 border-b border-slate-800 last:border-b-0 py-3 m-2 rounded-md"
                                    >
                                      {planProjectionColumns.map((key) => (
                                        <td
                                          key={key}
                                          className={`px-3  py-3 m-2 rounded-md text-slate-200 border-r border-slate-800 last:border-r-0 ${
                                            key === "year" || key === "age"
                                              ? "text-center"
                                              : "text-right"
                                          }`}
                                        >
                                          {renderMonthCell(key, month)}
                                        </td>
                                      ))}
                                    </tr>
                                  ))}
                              </Fragment>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <div className="mt-3 flex items-center justify-between text-xs text-slate-600">
                        <span>Click on any year to expand monthly details</span>
                        <button
                          type="button"
                          onClick={() =>
                            setExpandedYear(
                              expandedYear === null
                                ? (expandedPlanProjectionRows[0]?.year ?? null)
                                : null,
                            )
                          }
                          className="text-slate-600 hover:text-slate-800 underline"
                        >
                          {expandedYear ? "Collapse all" : "Expand first year"}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
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
