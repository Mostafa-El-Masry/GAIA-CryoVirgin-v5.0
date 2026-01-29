"use client";

import { useEffect, useState } from "react";
import type {
  WealthOverview,
  WealthState,
  WealthLevelsSnapshot,
  WealthLevelDefinition,
} from "./lib/types";
import { loadWealthState, loadWealthStateWithRemote } from "./lib/wealthStore";
import { buildWealthOverview, getTodayInKuwait } from "./lib/summary";
import { buildLevelsSnapshot } from "./lib/levels";
import { hasSupabaseConfig } from "./lib/remoteWealth";
import { getExchangeRate } from "./lib/exchangeRate";
import WealthSnapshot from "./components/WealthSnapshot";
import WealthMap from "./components/WealthMap";
import QuickLinks from "./components/QuickLinks";
import WealthAlerts from "./components/WealthAlerts";
import BlendsStrip from "./components/BlendsStrip";
import FoodSpendingCard from "./components/FoodSpendingCard";

type FxInfo = {
  rate: number;
  timestamp: number;
  isCached: boolean;
};

const surface = "wealth-surface text-[var(--gaia-text-default)]";

function formatCurrency(value: number, currency: string) {
  if (!Number.isFinite(value)) return "-";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

function getLevelDefinitions(snapshot: WealthLevelsSnapshot | null) {
  if (!snapshot) {
    return {
      current: null as WealthLevelDefinition | null,
      next: null as WealthLevelDefinition | null,
    };
  }
  const current =
    snapshot.currentLevelId != null
      ? (snapshot.levels.find((l) => l.id === snapshot.currentLevelId) ?? null)
      : null;
  const next =
    snapshot.nextLevelId != null
      ? (snapshot.levels.find((l) => l.id === snapshot.nextLevelId) ?? null)
      : null;
  return { current, next };
}

function buildLevelHeadline(snapshot: WealthLevelsSnapshot | null): string {
  if (!snapshot) {
    return "GAIA needs balances and revenue to place you on the comfort ladder.";
  }
  const { current } = getLevelDefinitions(snapshot);
  if (!current) {
    return "You are at the starting line. Once balances and monthly revenue are logged, GAIA will place you on the ladder.";
  }

  const order = current.order ?? 0;
  if (order <= 2) {
    return "You are in the early comfort zone. Focus on building savings and monthly revenue.";
  }
  if (order <= 4) {
    return "You are in the stability-building zone. The focus now is deepening savings and revenue.";
  }
  return "You are in a strong comfort zone. The main work from here is maintenance and gentle optimisation.";
}

function buildPlanHeadline(
  snapshot: WealthLevelsSnapshot | null,
  overview: WealthOverview | null,
): string {
  if (!snapshot || !overview) {
    return "Log balances and investments so GAIA can suggest a concrete next step.";
  }

  const { current, next } = getLevelDefinitions(snapshot);
  const currency = overview.primaryCurrency;
  if (!current) {
    return "Keep logging balances and revenue. GAIA will refine your next step as the picture becomes clearer.";
  }

  const totalSavings = Number.isFinite(snapshot.totalSavings)
    ? snapshot.totalSavings
    : 0;
  const monthlyRevenue = snapshot.monthlyPassiveIncome ?? 0;
  const savingsGap =
    current.minSavings != null ? current.minSavings - totalSavings : null;
  const revenueGap =
    current.minMonthlyRevenue != null
      ? current.minMonthlyRevenue - monthlyRevenue
      : null;

  if (
    (savingsGap == null || savingsGap <= 0) &&
    (revenueGap == null || revenueGap <= 0)
  ) {
    return "You are already at the next plan thresholds. Keep it steady.";
  }

  const parts: string[] = [];
  if (savingsGap != null && savingsGap > 0) {
    parts.push(`add about ${formatCurrency(savingsGap, currency)} in savings`);
  }
  if (revenueGap != null && revenueGap > 0) {
    parts.push(
      `raise monthly revenue by about ${formatCurrency(revenueGap, currency)}`,
    );
  }

  const planName = next?.name || "your next plan";
  return `To reach ${planName}, ${parts.join(" and ")}.`;
}

export default function WealthAwakeningClientPage() {
  const [overview, setOverview] = useState<WealthOverview | null>(null);
  const [levelsSnapshot, setLevelsSnapshot] =
    useState<WealthLevelsSnapshot | null>(null);
  const [syncStatus, setSyncStatus] = useState<
    "syncing" | "synced" | "local-only" | "no-supabase"
  >("syncing");
  const [supabaseEnabled, setSupabaseEnabled] = useState(false);
  const [fxInfo, setFxInfo] = useState<FxInfo | null>(null);

  // Detect whether Supabase is configured on the client
  useEffect(() => {
    setSupabaseEnabled(hasSupabaseConfig());
  }, []);

  // Load Wealth state (local + Supabase) and build overview + levels
  useEffect(() => {
    let cancelled = false;

    async function init() {
      setSyncStatus(supabaseEnabled ? "syncing" : "no-supabase");
      let state: WealthState;
      try {
        state = await loadWealthStateWithRemote();
        if (!supabaseEnabled) {
          setSyncStatus("no-supabase");
        } else {
          setSyncStatus("synced");
        }
      } catch (error) {
        console.warn(
          "Wealth Awakening: falling back to local state only:",
          error,
        );
        state = loadWealthState();
        setSyncStatus(supabaseEnabled ? "local-only" : "no-supabase");
      }

      if (cancelled) return;

      const today = getTodayInKuwait();
      const ov = buildWealthOverview(state, today);
      setOverview(ov);
      const snapshot = buildLevelsSnapshot(ov, { planCurrency: "EGP" });
      setLevelsSnapshot(snapshot);
    }

    init();

    return () => {
      cancelled = true;
    };
  }, [supabaseEnabled]);

  // Load FX rate (KWD -> EGP) with 24h cache
  useEffect(() => {
    let cancelled = false;

    async function hydrateFx() {
      const info = await getExchangeRate();
      if (!cancelled) {
        setFxInfo(info);
      }
    }

    hydrateFx();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!overview) return;
    const snapshot = buildLevelsSnapshot(overview, {
      planCurrency: "EGP",
      fxRate: fxInfo?.rate,
    });
    setLevelsSnapshot(snapshot);
  }, [overview, fxInfo]);

  const syncLabel =
    syncStatus === "syncing"
      ? "Syncing with Supabase..."
      : syncStatus === "synced"
        ? "Synced with Supabase"
        : syncStatus === "local-only"
          ? "Local mode (Supabase unreachable)"
          : "Local cache only";

  const syncTone =
    syncStatus === "synced"
      ? "bg-emerald-500/10 text-emerald-200 border-emerald-500/40"
      : syncStatus === "syncing"
        ? "bg-amber-400/10 text-amber-200 border-amber-400/50"
        : "bg-slate-800/80 text-slate-200 border-slate-700";

  const levelHeadline = buildLevelHeadline(levelsSnapshot);
  const planHeadline = buildPlanHeadline(levelsSnapshot, overview);

  const fxText =
    fxInfo && fxInfo.rate > 0
      ? `1 KWD ~ ${fxInfo.rate.toFixed(2)} EGP | ${
          fxInfo.isCached ? "cached last 24h" : "fresh"
        }`
      : null;

  const primaryCurrency = overview?.primaryCurrency ?? "KWD";
  const monthsSaved = levelsSnapshot?.monthsOfExpensesSaved ?? null;
  const { current: currentPlan, next: nextPlan } =
    getLevelDefinitions(levelsSnapshot);
  const totalSavings = levelsSnapshot?.totalSavings ?? 0;
  const monthlyRevenue = levelsSnapshot?.monthlyPassiveIncome ?? 0;
  const planCurrency = "EGP";

  const savingsLabel =
    totalSavings > 0
      ? formatCurrency(totalSavings, planCurrency)
      : "Not logged";
  const monthlyRevenueLabel =
    monthlyRevenue > 0
      ? formatCurrency(monthlyRevenue, planCurrency)
      : "Not logged";

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

  return (
    <div className="space-y-6 text-[var(--gaia-text-default)]">
      <section className="grid gap-4 xl:grid-cols-[1.6fr_1fr]">
        <div className={`${surface} relative overflow-hidden p-6`}>
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -left-10 top-6 h-32 w-32 rounded-full bg-[var(--gaia-contrast-bg)]/12 blur-3xl" />
            <div className="absolute right-2 bottom-2 h-28 w-28 rounded-full bg-[var(--gaia-info)]/10 blur-3xl" />
          </div>
          <div className="relative flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--gaia-text-muted)]">
                Wealth Awakening
              </p>
              <h1 className="mt-1 text-2xl font-bold text-[var(--gaia-text-strong)] sm:text-3xl">
                Wall Street Drive
              </h1>
              <p className="mt-1 max-w-2xl text-sm gaia-muted">
                You&apos;re almost ready to run with the market. Verify, sync,
                and start compounding your buffers and certificates.
              </p>
            </div>
            <span
              className={`inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-semibold ${syncTone}`}
            >
              <span className="mr-1.5 inline-block h-2 w-2 rounded-full bg-current opacity-70" />
              {syncLabel}
            </span>
          </div>

          <div className="relative mt-5 flex flex-wrap items-center gap-2 text-xs">
            {["Create map", "Verify", "Deposit"].map((step, idx) => {
              const active = idx === 1;
              const done = idx === 0;
              return (
                <div
                  key={step}
                  className={`flex items-center gap-2 rounded-full border px-3 py-1 ${
                    done
                      ? "border-[var(--gaia-contrast-bg)]/50 bg-[var(--gaia-contrast-bg)]/10 text-[var(--gaia-text-strong)]"
                      : active
                        ? "gaia-border bg-[var(--gaia-surface-soft)] text-[var(--gaia-text-strong)]"
                        : "gaia-border bg-[var(--gaia-surface-soft)] text-[var(--gaia-text-muted)]"
                  }`}
                >
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--gaia-surface-soft)] text-[11px] font-bold text-[var(--gaia-text-default)]">
                    {idx + 1}
                  </span>
                  <span className="font-semibold">{step}</span>
                </div>
              );
            })}
          </div>

          <div className="relative mt-5 flex flex-wrap items-center gap-3">
            <button className="px-4 py-2 text-sm font-semibold text-[var(--gaia-text-strong)]">
              Verify & sync
            </button>
            <button className="px-4 py-2 text-sm font-semibold text-[var(--gaia-text-strong)]">
              Add deposit
            </button>
            {fxText && <span className="text-xs gaia-muted">{fxText}</span>}
          </div>
        </div>

        <div className={`${surface} p-6`}>
          <div className="mb-3 rounded-xl border gaia-border bg-[var(--gaia-surface-soft)] p-3 text-xs text-[var(--gaia-text-default)]">
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="text-[11px] uppercase tracking-wide text-[var(--gaia-text-muted)]">
                  Current wealth plan
                </p>
                <h4 className="text-sm font-semibold text-[var(--gaia-text-strong)]">
                  {currentPlan?.shortLabel ?? "Need data to place you"}
                </h4>
                <p className="mt-1 text-[11px] gaia-muted">
                  {currentPlan?.description ??
                    "Log balances and investments so GAIA can place you on the ladder."}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[11px] uppercase tracking-wide text-[var(--gaia-text-muted)]">
                  Next
                </p>
                <p className="text-sm font-semibold text-[var(--gaia-text-strong)]">
                  {nextPlan?.shortLabel ?? "TBD"}
                </p>
                <p className="mt-1 text-[10px] gaia-muted">
                  Savings target: {targetSavingsLabel}
                </p>
                <p className="text-[10px] gaia-muted">
                  Monthly revenue target: {targetRevenueLabel}
                </p>
                <span
                  className={`mt-1 inline-flex rounded-full px-2 py-1 text-[10px] font-semibold ${
                    nextPlanReady
                      ? "bg-emerald-500/15 text-emerald-200 border border-emerald-500/40"
                      : "gaia-border bg-[var(--gaia-surface)] text-[var(--gaia-text-muted)]"
                  }`}
                >
                  {nextPlanReady ? "Ready to move up" : "In progress"}
                </span>
              </div>
            </div>
            <div className="mt-2 grid gap-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              <div className="rounded-lg border gaia-border bg-[var(--gaia-surface)] px-3 py-2">
                <p className="text-[11px] uppercase tracking-wide text-[var(--gaia-text-muted)]">
                  Investment savings (EGP)
                </p>
                <p className="text-sm font-semibold text-[var(--gaia-text-strong)]">
                  {savingsLabel}
                </p>
              </div>
              <div className="rounded-lg border gaia-border bg-[var(--gaia-surface)] px-3 py-2">
                <p className="text-[11px] uppercase tracking-wide text-[var(--gaia-text-muted)]">
                  Months saved
                </p>
                <p className="text-sm font-semibold text-[var(--gaia-text-strong)]">
                  {monthsSaved != null && Number.isFinite(monthsSaved)
                    ? `${monthsSaved.toFixed(1)} months`
                    : "Need data"}
                </p>
              </div>
              <div className="rounded-lg border gaia-border bg-[var(--gaia-surface)] px-3 py-2">
                <p className="text-[11px] uppercase tracking-wide text-[var(--gaia-text-muted)]">
                  Monthly revenue
                </p>
                <p className="text-sm font-semibold text-[var(--gaia-text-strong)]">
                  {monthlyRevenueLabel}
                </p>
                <p className="mt-1 text-[10px] gaia-muted">
                  Estimated investment yield (converted to EGP).
                </p>
              </div>
              <div className="rounded-lg border gaia-border bg-[var(--gaia-surface)] px-3 py-2">
                <p className="text-[11px] uppercase tracking-wide text-[var(--gaia-text-muted)]">
                  Target savings
                </p>
                <p className="text-sm font-semibold text-[var(--gaia-text-strong)]">
                  {targetSavingsLabel}
                </p>
                {savingsGap != null && savingsGap > 0 ? (
                  <p className="text-[10px] gaia-muted">
                    ~{formatCurrency(savingsGap, planCurrency)} to hit the next
                    plan.
                  </p>
                ) : null}
              </div>
              <div className="rounded-lg border gaia-border bg-[var(--gaia-surface)] px-3 py-2">
                <p className="text-[11px] uppercase tracking-wide text-[var(--gaia-text-muted)]">
                  Target monthly revenue
                </p>
                <p className="text-sm font-semibold text-[var(--gaia-text-strong)]">
                  {targetRevenueLabel}
                </p>
                {revenueGap != null && revenueGap > 0 ? (
                  <p className="text-[10px] gaia-muted">
                    ~{formatCurrency(revenueGap, planCurrency)} to hit the next
                    plan.
                  </p>
                ) : null}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--gaia-text-muted)]">
                Plan progress
              </p>
              <h3 className="text-xl font-semibold text-[var(--gaia-text-strong)]">
                Stay on the comfort ladder
              </h3>
            </div>
            <span className="rounded-full bg-[var(--gaia-surface-soft)] px-3 py-1 text-[11px] font-semibold text-[var(--gaia-text-default)]">
              {monthsSaved != null
                ? `${monthsSaved.toFixed(1)} mo saved`
                : "Need data"}
            </span>
          </div>
          <p className="mt-3 text-sm gaia-muted">{levelHeadline}</p>
          <div className="mt-3 rounded-xl border gaia-border bg-[var(--gaia-surface-soft)] p-3 text-xs text-[var(--gaia-text-default)]">
            {planHeadline}
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 text-sm">
            <div className="rounded-xl border gaia-border bg-[var(--gaia-surface-soft)] p-3">
              <p className="text-[11px] uppercase tracking-wide text-[var(--gaia-text-muted)]">
                Primary currency
              </p>
              <p className="text-lg font-semibold text-[var(--gaia-text-strong)]">
                {primaryCurrency}
              </p>
              <p className="text-xs gaia-muted">
                All targets measured here first.
              </p>
            </div>
            <div className="rounded-xl border gaia-border bg-[var(--gaia-surface-soft)] p-3">
              <p className="text-[11px] uppercase tracking-wide text-[var(--gaia-text-muted)]">
                FX cache
              </p>
              <p className="text-lg font-semibold text-[var(--gaia-text-strong)]">
                {fxText ?? "Waiting for latest rate"}
              </p>
              <p className="text-xs gaia-muted">KWD to EGP snapshot.</p>
            </div>
          </div>
        </div>
      </section>

      <section className={`${surface} p-5`}>
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--gaia-text-muted)]">
              Plan thresholds
            </p>
            <h3 className="text-base font-semibold text-[var(--gaia-text-strong)]">
              Comfort ladder
            </h3>
            <p className="text-xs gaia-muted">
              Preview only. Edit thresholds in the Plans tab.
            </p>
          </div>
          <a
            href="/wealth/levels"
            className="wealth-button px-3 py-1 text-[11px] font-semibold text-[var(--gaia-text-strong)]"
          >
            Edit plans
          </a>
        </div>
        <div className="mt-4 overflow-hidden rounded-xl border gaia-border">
          <table className="w-full text-left text-xs text-[var(--gaia-text-default)]">
            <thead className="bg-[var(--gaia-surface-soft)]">
              <tr className="text-[11px] uppercase tracking-wide text-[var(--gaia-text-muted)]">
                <th className="px-4 py-2">Plan</th>
                <th className="px-4 py-2">Target savings</th>
                <th className="px-4 py-2">Target monthly revenue</th>
                <th className="px-4 py-2">
                  Status Trying To Achieve by this Plan
                </th>
              </tr>
            </thead>
            <tbody>
              {(levelsSnapshot?.levels ?? []).map((plan) => (
                <tr key={plan.id} className="border-t gaia-border">
                  <td className="px-4 py-2 text-[11px] font-semibold text-[var(--gaia-text-strong)]">
                    {plan.shortLabel}
                  </td>
                  <td className="px-4 py-2 text-[11px]">
                    {formatCurrency(plan.minSavings ?? 0, planCurrency)}
                  </td>
                  <td className="px-4 py-2 text-[11px]">
                    {formatCurrency(plan.minMonthlyRevenue ?? 0, planCurrency)}
                  </td>
                  <td className="px-4 py-2 text-[11px] gaia-muted">
                    {plan.description}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {!overview ? (
        <section className={`${surface} p-6 text-sm gaia-muted`}>
          Loading your Wealth map and snapshot...
        </section>
      ) : (
        <>
          <section className="grid gap-4 lg:grid-cols-3">
            <div className={`${surface} p-5`}>
              <p className="text-[11px] uppercase tracking-[0.14em] text-[var(--gaia-text-muted)]">
                Net worth
              </p>
              <p className="mt-1 text-2xl font-semibold text-[var(--gaia-text-strong)]">
                {formatCurrency(overview.totalNetWorth, primaryCurrency)}
              </p>
              <p className="mt-2 text-xs text-[var(--gaia-contrast-bg)]">
                {formatCurrency(overview.monthStory.netChange, primaryCurrency)}{" "}
                this month
              </p>
            </div>
            <div className={`${surface} p-5`}>
              <p className="text-[11px] uppercase tracking-[0.14em] text-[var(--gaia-text-muted)]">
                Runway
              </p>
              <p className="mt-1 text-2xl font-semibold text-[var(--gaia-text-strong)]">
                {monthsSaved != null && Number.isFinite(monthsSaved)
                  ? `${monthsSaved.toFixed(1)} months`
                  : "Add expenses"}
              </p>
              <p className="mt-2 text-xs gaia-muted">
                Based on savings in {primaryCurrency}.
              </p>
            </div>
            <div className={`${surface} p-5`}>
              <p className="text-[11px] uppercase tracking-[0.14em] text-[var(--gaia-text-muted)]">
                Sync & safety
              </p>
              <p className="mt-1 text-lg font-semibold text-[var(--gaia-text-strong)]">
                {syncLabel}
              </p>
              <p className="mt-1 text-xs gaia-muted">
                Supabase mirror with local cache for accounts and investments.
              </p>
            </div>
          </section>

          <section>
            <WealthSnapshot overview={overview} />
          </section>

          <div>
            <BlendsStrip snapshot={levelsSnapshot} />
          </div>

          <section className="grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
            <WealthMap overview={overview} />
            <QuickLinks />
          </section>

          <section>
            <WealthAlerts overview={overview} />
          </section>

          <section>
            <FoodSpendingCard />
          </section>
        </>
      )}
    </div>
  );
}
