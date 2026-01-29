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
    name: "Level 1 — Suffocating",
    shortLabel: "Level 1 — Suffocating",
    order: 1,
    minSavings: 50000,
    minMonthlyRevenue: 1000,
    description: `Income: 1,000 EGP
Savings: 50,000 EGP
Active Project: 100 JavaScript Projects`,
    survivability: "❌ Suffocating",
    allowedEnrichment: "0%",
    calendarsUnlocked: "None",
  },
  {
    id: "L2",
    name: "Level 2 — Choking",
    shortLabel: "Level 2 — Choking",
    order: 2,
    minSavings: 120000,
    minMonthlyRevenue: 2000,
    description: `Income: 2,000 EGP
Savings: 120,000 EGP
Active Project: Inventory Management System`,
    survivability: "❌ Suffocating",
    allowedEnrichment: "5%",
    calendarsUnlocked: "Food & Insulin",
  },
  {
    id: "L3",
    name: "Level 3 — Escaping Poverty",
    shortLabel: "Level 3 — Escaping Poverty",
    order: 3,
    minSavings: 250000,
    minMonthlyRevenue: 4000,
    description: `Income: 4,000 EGP
Savings: 250,000 EGP
Active Project: HR System`,
    survivability: "❌ Unsafe",
    allowedEnrichment: "10%",
    calendarsUnlocked: "Learning",
  },
  {
    id: "L4",
    name: "Level 4 — Pressure Zone",
    shortLabel: "Level 4 — Pressure Zone",
    order: 4,
    minSavings: 400000,
    minMonthlyRevenue: 8000,
    description: `Income: 8,000 EGP
Savings: 400,000 EGP
Active Project: BOS / POS System`,
    survivability: "⚠️ Near survival",
    allowedEnrichment: "15%",
    calendarsUnlocked: "Workout",
  },
  {
    id: "L5",
    name: "Level 5 — Bare Survival",
    shortLabel: "Level 5 — Bare Survival",
    order: 5,
    minSavings: 700000,
    minMonthlyRevenue: 16000,
    description: `Income: 16,000 EGP
Savings: 700,000 EGP
Active Project: Accounting System`,
    survivability: "✅ Surviving",
    allowedEnrichment: "20%",
    calendarsUnlocked: "Sleep & Recovery",
  },
  {
    id: "L6",
    name: "Level 6 — First Enjoyment",
    shortLabel: "Level 6 — First Enjoyment",
    order: 6,
    minSavings: 1200000,
    minMonthlyRevenue: 32000,
    description: `Income: 32,000 EGP
Savings: 1,200,000 EGP
Active Project: Budgeting & Forecasting System`,
    survivability: "🌱 Begin to enjoy",
    allowedEnrichment: "30%",
    calendarsUnlocked: "Mental Health",
  },
  {
    id: "L7",
    name: "Level 7 — Comfortable",
    shortLabel: "Level 7 — Comfortable",
    order: 7,
    minSavings: 2500000,
    minMonthlyRevenue: 64000,
    description: `Income: 64,000 EGP
Savings: 2,500,000 EGP
Active Project: Cashflow & Treasury System`,
    survivability: "✅ Comfortable",
    allowedEnrichment: "40%",
    calendarsUnlocked: "Reading & Deep Thinking",
  },
  {
    id: "L8",
    name: "Level 8 — Secure",
    shortLabel: "Level 8 — Secure",
    order: 8,
    minSavings: 5000000,
    minMonthlyRevenue: 128000,
    description: `Income: 128,000 EGP
Savings: 5,000,000 EGP
Active Project: Assets & Depreciation System`,
    survivability: "🟢 Very secure",
    allowedEnrichment: "50%",
    calendarsUnlocked: "Relationships",
  },
  {
    id: "L9",
    name: "Level 9 — Quiet Wealth",
    shortLabel: "Level 9 — Quiet Wealth",
    order: 9,
    minSavings: 10000000,
    minMonthlyRevenue: 256000,
    description: `Income: 256,000 EGP
Savings: 10,000,000 EGP
Active Project: Compliance & Audit System`,
    survivability: "🟢 Abundant",
    allowedEnrichment: "55%",
    calendarsUnlocked: "Purpose & Meaning",
  },
  {
    id: "L10",
    name: "Level 10 — Sovereign",
    shortLabel: "Level 10 — Sovereign",
    order: 10,
    minSavings: 20000000,
    minMonthlyRevenue: 512000,
    description: `Income: 512,000 EGP
Savings: 20,000,000+ EGP
Active Project: Reporting & Intelligence System`,
    survivability: "🟢 Untouchable",
    allowedEnrichment: "60%",
    calendarsUnlocked: "Legacy & Creation",
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
      name:
        typeof override.name === "string" && override.name.trim()
          ? override.name
          : def.name,
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
    monthlyExpenses > 0 ? totalSavings / monthlyExpenses : null;

  const coveragePercent =
    monthlyExpenses > 0 ? (monthlyPassiveIncome / monthlyExpenses) * 100 : null;

  const snapshotBase: Omit<
    WealthLevelsSnapshot,
    "levels" | "currentLevelId" | "nextLevelId"
  > = {
    totalSavings,
    monthsOfExpensesSaved,
    monthlyPassiveIncome: monthlyPassiveIncome > 0 ? monthlyPassiveIncome : 0,
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
