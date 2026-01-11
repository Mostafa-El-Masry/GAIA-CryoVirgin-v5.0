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
    description: `This level is about not collapsing.
You are not building a life yet — you are protecting it.
Discipline here is quiet and invisible.`,
    survivability: "❌ Suffocating",
    allowedEnrichment: "0% (Every pound is defensive.)",
    calendarsUnlocked: "❌ None",
  },
  {
    id: "L2",
    name: "Level 2 — Choking",
    shortLabel: "Level 2 — Choking",
    order: 2,
    minSavings: 120000,
    minMonthlyRevenue: 2000,
    description: `Your body comes first.
Stabilizing food and insulin reduces chaos everywhere else.
This is the first act of self-respect.`,
    survivability: "❌ Suffocating",
    allowedEnrichment: "5% (≈100 EGP)",
    calendarsUnlocked: "✅ Food & Insulin Calendar",
  },
  {
    id: "L3",
    name: "Level 3 — Escaping Poverty",
    shortLabel: "Level 3 — Escaping Poverty",
    order: 3,
    minSavings: 250000,
    minMonthlyRevenue: 4000,
    description: `You are still poor, but no longer stagnant.
You invest in skills because future income is the exit.
Hope becomes structured.`,
    survivability: "❌ Unsafe",
    allowedEnrichment: "10% (≈400 EGP)",
    calendarsUnlocked: "✅ Learning Calendar",
  },
  {
    id: "L4",
    name: "Level 4 — Pressure Zone",
    shortLabel: "Level 4 — Pressure Zone",
    order: 4,
    minSavings: 400000,
    minMonthlyRevenue: 8000,
    description: `Strength becomes necessary, not optional.
Your body stops being neglected.
Energy starts to rise.`,
    survivability: "⚠️ Near survival",
    allowedEnrichment: "15% (≈1,200 EGP)",
    calendarsUnlocked: "✅ Workout / Physical Training Calendar",
  },
  {
    id: "L5",
    name: "Level 5 — Bare Survival",
    shortLabel: "Level 5 — Bare Survival",
    order: 5,
    minSavings: 700000,
    minMonthlyRevenue: 16000,
    description: `You protect rest like income.
Burnout is no longer allowed.
Life becomes sustainable.`,
    survivability: "✅ Surviving",
    allowedEnrichment: "20% (≈3,200 EGP)",
    calendarsUnlocked: "✅ Sleep & Recovery Calendar",
  },
  {
    id: "L6",
    name: "Level 6 — First Enjoyment",
    shortLabel: "Level 6 — First Enjoyment",
    order: 6,
    minSavings: 1200000,
    minMonthlyRevenue: 32000,
    description: `You stop surviving your thoughts.
Healing becomes intentional.
You begin living inside your body, not outside it.`,
    survivability: "🌱 Begin to enjoy",
    allowedEnrichment: "30% (≈9,600 EGP)",
    calendarsUnlocked: "✅ Mental Health / Emotional Regulation Calendar",
  },
  {
    id: "L7",
    name: "Level 7 — Comfortable",
    shortLabel: "Level 7 — Comfortable",
    order: 7,
    minSavings: 2500000,
    minMonthlyRevenue: 64000,
    description: `Your mind expands beyond urgency.
You read to grow, not escape.
Wisdom starts compounding.`,
    survivability: "✅ Comfortable",
    allowedEnrichment: "40% (≈25,600 EGP)",
    calendarsUnlocked: "✅ Reading & Deep Thinking Calendar",
  },
  {
    id: "L8",
    name: "Level 8 — Secure",
    shortLabel: "Level 8 — Secure",
    order: 8,
    minSavings: 5000000,
    minMonthlyRevenue: 128000,
    description: `You invest in people intentionally.
Boundaries replace obligation.
Connection becomes nourishing.`,
    survivability: "🟢 Very secure",
    allowedEnrichment: "50% (≈64,000 EGP)",
    calendarsUnlocked: "✅ Relationships & Social Health Calendar",
  },
  {
    id: "L9",
    name: "Level 9 — Quiet Wealth",
    shortLabel: "Level 9 — Quiet Wealth",
    order: 9,
    minSavings: 10000000,
    minMonthlyRevenue: 256000,
    description: `You ask “why” more than “how much.”
Your actions start to ripple outward.
Life gains depth.`,
    survivability: "🟢 Abundant",
    allowedEnrichment: "55% (≈140,800 EGP)",
    calendarsUnlocked: "✅ Purpose / Meaning / Contribution Calendar",
  },
  {
    id: "L10",
    name: "Level 10 — Sovereign",
    shortLabel: "Level 10 — Sovereign",
    order: 10,
    minSavings: 20000000,
    minMonthlyRevenue: 512000,
    description: `You are no longer waiting for life to begin.
You are shaping it.
Money serves meaning.`,
    survivability: "🟢 Untouchable",
    allowedEnrichment: "60% (≈307,200 EGP)",
    calendarsUnlocked: "✅ Legacy / Creation / Long-Term Vision Calendar",
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
  fxRate?: number
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
  fxRate?: number
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
  overrides: WealthLevelDefinition[] | null
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
        def.minMonthlyRevenue ?? 0
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
    null
  );
  return mergePlanDefinitions(stored);
}

export function savePlanDefinitions(
  levels: WealthLevelDefinition[]
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
  options: PlanSnapshotOptions = {}
): WealthLevelsSnapshot {
  const today = getTodayInKuwait();
  const monthKey = toMonthKey(today);
  const levels = getPlanDefinitions();
  const planCurrency = options.planCurrency ?? overview.primaryCurrency;
  const conversionRate = resolveConversionRate(
    overview.primaryCurrency,
    planCurrency,
    options.fxRate
  );
  const toPlanCurrency = (value: number) => value * conversionRate;

  const flowsThisMonth = flowsForMonth(overview.flows, monthKey);

  // Estimate monthly expenses in primary currency
  const monthlyExpensesPrimary = sumBy(
    flowsThisMonth.filter(
      (f) => f.kind === "expense" && f.currency === overview.primaryCurrency
    ),
    (f) => f.amount
  );
  const monthlyExpenses = toPlanCurrency(monthlyExpensesPrimary);

  let monthlyPassiveIncomeFromInstruments = 0;
  let totalInstrumentSavings = 0;
  for (const inst of overview.instruments) {
    const rate = getConversionRateForCurrency(
      inst.currency,
      planCurrency,
      overview.primaryCurrency,
      options.fxRate
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
