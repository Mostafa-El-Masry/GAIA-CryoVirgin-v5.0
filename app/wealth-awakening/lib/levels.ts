import type {
  WealthLevelsSnapshot,
  WealthLevelDefinition,
  WealthOverview,
  WealthFlow,
  MonthKey,
} from "./types";
import { readJSON, writeJSON } from "@/lib/user-storage";
import { getTodayInKuwait } from "./summary";
import { estimateMonthlyInterest } from "./projections";

type PlanSnapshotOptions = {
  planCurrency?: string;
  fxRate?: number;
};

type StoredRate = {
  rate: number;
  timestamp: number;
};

const PLANS_STORAGE_KEY = "wealth_plans_definitions_v3";
const FX_STORAGE_KEY = "wealth_awakening_fx_egp_per_kwd";

export const DEFAULT_PLAN_DEFINITIONS: WealthLevelDefinition[] = [
  {
    id: "L1",
    name: "Poor",
    shortLabel: "Plan J - Poor",
    order: 1,
    minSavings: 50000,
    minMonthlyRevenue: 0,
    description:
      "Barely surviving. Living paycheck to paycheck, no emergency savings.",
  },
  {
    id: "L2",
    name: "Struggling",
    shortLabel: "Plan I - Struggling",
    order: 2,
    minSavings: 200000,
    minMonthlyRevenue: 0,
    description:
      "Can cover small emergencies, but one big issue is dangerous.",
  },
  {
    id: "L3",
    name: "Survivor",
    shortLabel: "Plan H - Survivor",
    order: 3,
    minSavings: 500000,
    minMonthlyRevenue: 0,
    description:
      "Has basic savings, maybe can invest small. Still vulnerable to shocks.",
  },
  {
    id: "L4",
    name: "Stable",
    shortLabel: "Plan G - Stable",
    order: 4,
    minSavings: 1000000,
    minMonthlyRevenue: 0,
    description:
      "First big milestone. Can survive without income for a while.",
  },
  {
    id: "L5",
    name: "Comfortable",
    shortLabel: "Plan F - Comfortable",
    order: 5,
    minSavings: 2500000,
    minMonthlyRevenue: 0,
    description:
      "Can invest meaningfully. Lifestyle upgrades possible.",
  },
  {
    id: "L6",
    name: "Secure",
    shortLabel: "Plan E - Secure",
    order: 6,
    minSavings: 5000000,
    minMonthlyRevenue: 0,
    description:
      "Serious buffer. Investment income can match a middle-class salary.",
  },
  {
    id: "L7",
    name: "Prosperous",
    shortLabel: "Plan D - Prosperous",
    order: 7,
    minSavings: 10000000,
    minMonthlyRevenue: 0,
    description:
      "Financial independence in Egypt. Returns can cover most lifestyles.",
  },
  {
    id: "L8",
    name: "Rich",
    shortLabel: "Plan C - Rich",
    order: 8,
    minSavings: 25000000,
    minMonthlyRevenue: 0,
    description:
      "Considered rich by Egyptian standards. Property, cars, travel comfortably.",
  },
  {
    id: "L9",
    name: "Very rich",
    shortLabel: "Plan B - Very rich",
    order: 9,
    minSavings: 100000000,
    minMonthlyRevenue: 0,
    description:
      "Upper-class. Multiple assets and aggressive investing.",
  },
  {
    id: "L10",
    name: "Wealthy",
    shortLabel: "Plan A - Wealthy",
    order: 10,
    minSavings: 100000000,
    minMonthlyRevenue: 0,
    description:
      "Beyond personal needs. Generational wealth or investor scale.",
  },
];

function normalizeNumber(value: unknown, fallback: number): number {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return fallback;
  return Math.max(0, numeric);
}

function isLegacyShortLabel(label: string): boolean {
  return /^level\s*\d+/i.test(label.trim());
}

function getCachedEgpPerKwd(): number | null {
  const stored = readJSON<StoredRate | null>(FX_STORAGE_KEY, null);
  if (!stored || !Number.isFinite(stored.rate) || stored.rate <= 0) return null;
  return stored.rate;
}

function resolveConversionRate(
  primaryCurrency: string,
  planCurrency: string,
  fxRate?: number,
): number {
  if (primaryCurrency === planCurrency) return 1;
  if (planCurrency === "EGP" && primaryCurrency === "KWD") {
    const rate = fxRate ?? getCachedEgpPerKwd();
    if (rate && Number.isFinite(rate) && rate > 0) {
      return rate;
    }
  }
  return 1;
}

function getConversionRateForCurrency(
  fromCurrency: string,
  planCurrency: string,
  primaryCurrency: string,
  fxRate?: number,
): number | null {
  if (fromCurrency === planCurrency) return 1;
  if (fromCurrency === primaryCurrency) {
    return resolveConversionRate(primaryCurrency, planCurrency, fxRate);
  }
  if (planCurrency === "EGP" && fromCurrency === "KWD") {
    const rate = fxRate ?? getCachedEgpPerKwd();
    if (rate && Number.isFinite(rate) && rate > 0) {
      return rate;
    }
  }
  return null;
}

function mergePlanDefinitions(
  overrides: WealthLevelDefinition[] | null,
): WealthLevelDefinition[] {
  if (!Array.isArray(overrides) || overrides.length === 0) {
    return [...DEFAULT_PLAN_DEFINITIONS].sort((a, b) => a.order - b.order);
  }

  const byId = new Map(overrides.map((level) => [level.id, level]));

  return DEFAULT_PLAN_DEFINITIONS.map((def) => {
    const override = byId.get(def.id);
    if (!override) return def;

    return {
      ...def,
      name: typeof override.name === "string" && override.name.trim() ? override.name : def.name,
      shortLabel:
        typeof override.shortLabel === "string" &&
        override.shortLabel.trim() &&
        !isLegacyShortLabel(override.shortLabel)
          ? override.shortLabel
          : def.shortLabel,
      description:
        typeof override.description === "string" && override.description.trim()
          ? override.description
          : def.description,
      minSavings: normalizeNumber(override.minSavings, def.minSavings ?? 0),
      minMonthlyRevenue: normalizeNumber(
        override.minMonthlyRevenue,
        def.minMonthlyRevenue ?? 0,
      ),
    };
  }).sort((a, b) => a.order - b.order);
}

export function getPlanDefinitions(): WealthLevelDefinition[] {
  if (typeof window === "undefined") {
    return [...DEFAULT_PLAN_DEFINITIONS].sort((a, b) => a.order - b.order);
  }
  const stored = readJSON<WealthLevelDefinition[] | null>(
    PLANS_STORAGE_KEY,
    null,
  );
  return mergePlanDefinitions(stored);
}

export function savePlanDefinitions(
  levels: WealthLevelDefinition[],
): WealthLevelDefinition[] {
  const merged = mergePlanDefinitions(levels);
  writeJSON(PLANS_STORAGE_KEY, merged);
  return merged;
}

export function resetPlanDefinitions(): WealthLevelDefinition[] {
  writeJSON(PLANS_STORAGE_KEY, DEFAULT_PLAN_DEFINITIONS);
  return [...DEFAULT_PLAN_DEFINITIONS].sort((a, b) => a.order - b.order);
}

function toMonthKey(day: string): MonthKey {
  return day.slice(0, 7);
}

function sumBy<T>(items: T[], fn: (item: T) => number): number {
  return items.reduce((acc, item) => acc + fn(item), 0);
}

function flowsForMonth(flows: WealthFlow[], monthKey: MonthKey): WealthFlow[] {
  return flows.filter((f) => toMonthKey(f.date) === monthKey);
}

export function buildLevelsSnapshot(
  overview: WealthOverview,
  options: PlanSnapshotOptions = {},
): WealthLevelsSnapshot {
  const today = getTodayInKuwait();
  const monthKey = toMonthKey(today);
  const levels = getPlanDefinitions();
  const planCurrency = options.planCurrency ?? overview.primaryCurrency;
  const conversionRate = resolveConversionRate(
    overview.primaryCurrency,
    planCurrency,
    options.fxRate,
  );
  const toPlanCurrency = (value: number) => value * conversionRate;

  const flowsThisMonth = flowsForMonth(overview.flows, monthKey);

  // Estimate monthly expenses in primary currency
  const monthlyExpensesPrimary = sumBy(
    flowsThisMonth.filter(
      (f) => f.kind === "expense" && f.currency === overview.primaryCurrency,
    ),
    (f) => f.amount,
  );
  const monthlyExpenses = toPlanCurrency(monthlyExpensesPrimary);

  let monthlyPassiveIncomeFromInstruments = 0;
  let totalInstrumentSavings = 0;
  for (const inst of overview.instruments) {
    const rate = getConversionRateForCurrency(
      inst.currency,
      planCurrency,
      overview.primaryCurrency,
      options.fxRate,
    );
    if (!rate) continue;
    totalInstrumentSavings += inst.principal * rate;
    monthlyPassiveIncomeFromInstruments += estimateMonthlyInterest(inst) * rate;
  }

  const monthlyPassiveIncome = monthlyPassiveIncomeFromInstruments;
  const totalSavings = totalInstrumentSavings;

  const monthsOfExpensesSaved =
    monthlyExpenses > 0
      ? totalSavings / monthlyExpenses
      : null;

  const coveragePercent =
    monthlyExpenses > 0
      ? (monthlyPassiveIncome / monthlyExpenses) * 100
      : null;

  const snapshotBase: Omit<WealthLevelsSnapshot, "levels" | "currentLevelId" | "nextLevelId"> =
    {
      totalSavings,
      monthsOfExpensesSaved,
      monthlyPassiveIncome:
        monthlyPassiveIncome > 0 ? monthlyPassiveIncome : 0,
      estimatedMonthlyExpenses: monthlyExpenses > 0 ? monthlyExpenses : null,
      coveragePercent,
    };

  // Determine current plan by target thresholds (upper bounds).
  let current: WealthLevelDefinition | null = null;
  for (const level of levels) {
    const savingsTarget = level.minSavings ?? Number.POSITIVE_INFINITY;
    const revenueTarget = level.minMonthlyRevenue ?? 0;
    const meetsSavingsTarget = totalSavings >= savingsTarget;
    const meetsRevenueTarget = monthlyPassiveIncome >= revenueTarget;

    if (!meetsSavingsTarget || !meetsRevenueTarget) {
      current = level;
      break;
    }
    current = level;
  }

  // Next plan: smallest plan with higher order than current (or first one if none yet)
  let next: WealthLevelDefinition | null = null;
  if (!current) {
    next = levels[0] ?? null;
  } else {
    next = levels.find((lvl) => lvl.order === current.order + 1) ?? null;
  }

  return {
    ...snapshotBase,
    levels,
    currentLevelId: current?.id ?? null,
    nextLevelId: next?.id ?? null,
  };
}
