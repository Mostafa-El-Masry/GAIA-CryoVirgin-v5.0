"use client";

import { useEffect, useState } from "react";
import type {
  WealthOverview,
  WealthState,
  WealthLevelsSnapshot,
  WealthLevelDefinition,
} from "./lib/types";
import {
  loadWealthState,
  loadWealthStateWithRemote,
} from "./lib/wealthStore";
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

const surface =
  "rounded-2xl border gaia-border bg-[var(--gaia-surface)] text-[var(--gaia-text-default)] shadow-[0_18px_60px_rgba(0,0,0,0.18)]";

function formatCurrency(value: number, currency: string) {
  if (!Number.isFinite(value)) return "-";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

const MONTHLY_STATUS_ROWS = [
  { range: "Under 45,000 EGP", status: "Poor" },
  { range: "45,000 – 90,000 EGP", status: "Low-income" },
  { range: "90,000 – 135,000 EGP", status: "Stably paid" },
  { range: "135,000 – 180,000 EGP", status: "Middle class" },
  { range: "180,000 – 270,000 EGP", status: "Comfortable" },
  { range: "270,000 – 360,000 EGP", status: "Upper-middle class" },
  { range: "360,000 – 750,000 EGP", status: "Wealthy" },
  { range: "750,000 – 2,400,000 EGP", status: "Rich" },
];

const ANNUAL_STATUS_ROWS = [
  { range: "30M – 60M EGP / year", status: "Millionaire" },
  { range: "60M – 900M EGP / year", status: "Multi-millionaire" },
  { range: "900M – 30B EGP / year", status: "Ultra-rich" },
  { range: "30B – 60B EGP / year", status: "Billionaire" },
  { range: "More than 60B EGP / year", status: "Multi-billionaire" },
];

function getLevelDefinitions(snapshot: WealthLevelsSnapshot | null) {
  if (!snapshot) {
    return {
      current: null as WealthLevelDefinition | null,
      next: null as WealthLevelDefinition | null,
    };
  }
  const current =
    snapshot.currentLevelId != null
      ? snapshot.levels.find((l) => l.id === snapshot.currentLevelId) ?? null
      : null;
  const next =
    snapshot.nextLevelId != null
      ? snapshot.levels.find((l) => l.id === snapshot.nextLevelId) ?? null
      : null;
  return { current, next };
}

function buildLevelHeadline(snapshot: WealthLevelsSnapshot | null): string {
  if (!snapshot) {
    return "GAIA needs at least one month of expenses to place you on the ladder.";
  }
  const { current } = getLevelDefinitions(snapshot);
  if (!current) {
    return "You are at the starting line. Once expenses and interest are logged for at least one month, GAIA will place you on the ladder.";
  }

  const order = current.order ?? 0;
  if (order <= 2) {
    return "You are in the early buffer zone. This is still a 'poor' level, but it is a starting point, not a verdict.";
  }
  if (order <= 4) {
    return "You are in the stability-building zone. You are no longer at the very bottom; the focus now is deepening your runway.";
  }
  return "You are in a strong stability / wealth zone. The main work from here is maintenance and gentle optimisation, not stress.";
}

function buildPlanHeadline(
  snapshot: WealthLevelsSnapshot | null,
  overview: WealthOverview | null,
): string {
  if (!snapshot || !overview) {
    return "Log grouped expenses and any interest events for at least one month so GAIA can suggest a concrete next step.";
  }

  const { next } = getLevelDefinitions(snapshot);
  const monthsSaved = snapshot.monthsOfExpensesSaved;
  const expenses = snapshot.estimatedMonthlyExpenses;
  const currency = overview.primaryCurrency;

  if (
    !next ||
    monthsSaved == null ||
    !Number.isFinite(monthsSaved) ||
    !expenses ||
    !Number.isFinite(expenses)
  ) {
    return "Keep logging income, deposits, expenses, and interest. GAIA will refine your next step as the picture becomes clearer.";
  }

  const targetMonths = next.minMonthsOfExpenses ?? monthsSaved;
  if (!Number.isFinite(targetMonths) || targetMonths <= monthsSaved) {
    return "You are very close to the next level. A few more consistent months of saving will push you over the line.";
  }

  const deltaMonths = targetMonths - monthsSaved;
  const additionalNeeded = deltaMonths * expenses;

  const formattedNeeded = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(additionalNeeded);

  const levelName = next.name || "your next level";

  return `If you can add roughly ${formattedNeeded} into your buffers / certificates over time, you will cross into ${levelName}. Small, repeatable moves are enough.`;
}

function passiveTargetEgpForOrder(order: number | null): number {
  if (order === null || !Number.isFinite(order)) return 1000;
  if (order <= 2) return 1000; // early breathing
  if (order <= 4) return 3000; // stabilise
  if (order <= 6) return 5000; // secure
  return 10000; // grow
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
  const [openStatusTable, setOpenStatusTable] = useState<"monthly" | "annual" | null>(null);

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
        console.warn("Wealth Awakening: falling back to local state only:", error);
        state = loadWealthState();
        setSyncStatus(supabaseEnabled ? "local-only" : "no-supabase");
      }

      if (cancelled) return;

      const today = getTodayInKuwait();
      const ov = buildWealthOverview(state, today);
      setOverview(ov);
      const snapshot = buildLevelsSnapshot(ov);
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
  const { current: currentLevel, next: nextLevel } = getLevelDefinitions(levelsSnapshot);
  const monthlyPassive = levelsSnapshot?.monthlyPassiveIncome ?? null;
  const displayCurrency =
    overview?.accounts?.some((a) => a.currency === "EGP") ||
    overview?.instruments?.some((i) => i.currency === "EGP")
      ? "EGP"
      : primaryCurrency;
  const certificatePrincipal =
    overview?.instruments?.reduce((sum, inst) => sum + inst.principal, 0) ?? 0;
  const investmentPrincipal =
    overview?.accounts
      .filter((a) => a.type === "investment")
      .reduce((sum, a) => sum + a.currentBalance, 0) ?? 0;
  const savingsPrincipal = certificatePrincipal + investmentPrincipal;
  const savingsLabel =
    savingsPrincipal > 0
      ? formatCurrency(savingsPrincipal, displayCurrency)
      : "Not logged";
  const targetMonths = nextLevel?.minMonthsOfExpenses ?? null;
  const targetSavings =
    targetMonths && levelsSnapshot?.estimatedMonthlyExpenses
      ? targetMonths * levelsSnapshot.estimatedMonthlyExpenses
      : null;
  const targetPassive =
    levelsSnapshot?.estimatedMonthlyExpenses && nextLevel?.minInterestCoveragePercent
      ? (levelsSnapshot.estimatedMonthlyExpenses *
          nextLevel.minInterestCoveragePercent) /
        100
      : null;
  const targetSavingsLabel =
    targetSavings && Number.isFinite(targetSavings)
      ? formatCurrency(targetSavings, displayCurrency)
      : "Set expenses first";
  const targetPassiveLabel =
    targetPassive && Number.isFinite(targetPassive)
      ? formatCurrency(targetPassive, displayCurrency)
      : "Set expenses first";
  const planTargetEgp = passiveTargetEgpForOrder(currentLevel?.order ?? null);
  const planTargetLabel = formatCurrency(planTargetEgp, "EGP");
  const planComplete =
    monthlyPassive != null &&
    displayCurrency === "EGP" &&
    monthlyPassive >= planTargetEgp;
  const planRemaining =
    monthlyPassive != null && displayCurrency === "EGP"
      ? planTargetEgp - monthlyPassive
      : null;
  const planRemainingLabel =
    planRemaining != null && planRemaining > 0
      ? formatCurrency(planRemaining, "EGP")
      : "0";

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
                You&apos;re almost ready to run with the market. Verify, sync, and
                start compounding your buffers and certificates.
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
            <button className="rounded-full bg-[var(--gaia-contrast-bg)] px-4 py-2 text-sm font-semibold text-[var(--gaia-contrast-text)] shadow-lg shadow-[var(--gaia-contrast-bg)]/25 transition hover:brightness-110">
              Verify & sync
            </button>
            <button className="rounded-full border gaia-border bg-[var(--gaia-surface-soft)] px-4 py-2 text-sm font-semibold text-[var(--gaia-text-default)] transition hover:border-[var(--gaia-contrast-bg)]">
              Add deposit
            </button>
            {fxText && (
              <span className="text-xs gaia-muted">{fxText}</span>
            )}
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
                  {currentLevel?.shortLabel ?? "Need data to place you"}
                </h4>
                <p className="mt-1 text-[11px] gaia-muted">
                  {currentLevel?.description ??
                    "Log expenses and deposits so GAIA can place you on the ladder."}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[11px] uppercase tracking-wide text-[var(--gaia-text-muted)]">
                  Next
                </p>
                <p className="text-sm font-semibold text-[var(--gaia-text-strong)]">
                  {nextLevel?.shortLabel ?? "TBD"}
                </p>
                <p className="mt-1 text-[10px] gaia-muted">
                  Passive target: {planTargetLabel}
                </p>
                <span
                  className={`mt-1 inline-flex rounded-full px-2 py-1 text-[10px] font-semibold ${
                    planComplete
                      ? "bg-emerald-500/15 text-emerald-200 border border-emerald-500/40"
                      : "gaia-border bg-[var(--gaia-surface)] text-[var(--gaia-text-muted)]"
                  }`}
                >
                  {planComplete ? "Target reached" : "Target pending"}
                </span>
              </div>
            </div>
            <div className="mt-2 grid gap-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              <div className="rounded-lg border gaia-border bg-[var(--gaia-surface)] px-3 py-2">
                <p className="text-[11px] uppercase tracking-wide text-[var(--gaia-text-muted)]">
                  Savings (certs + investments)
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
                  Passive / month
                </p>
                <p className="text-sm font-semibold text-[var(--gaia-text-strong)]">
                  {monthlyPassive != null
                    ? formatCurrency(monthlyPassive, displayCurrency)
                    : "Not logged"}
                </p>
                <p className="mt-1 text-[10px] gaia-muted">
                  Includes estimated certificate yield (all currencies).
                </p>
              </div>
              <div className="rounded-lg border gaia-border bg-[var(--gaia-surface)] px-3 py-2">
                <p className="text-[11px] uppercase tracking-wide text-[var(--gaia-text-muted)]">
                  Target savings
                </p>
                <p className="text-sm font-semibold text-[var(--gaia-text-strong)]">
                  {targetSavingsLabel}
                </p>
              </div>
              <div className="rounded-lg border gaia-border bg-[var(--gaia-surface)] px-3 py-2">
                <p className="text-[11px] uppercase tracking-wide text-[var(--gaia-text-muted)]">
                  Target passive / month
                </p>
                <p className="text-sm font-semibold text-[var(--gaia-text-strong)]">
                  {targetPassiveLabel}
                </p>
                <p className="mt-1 text-[10px] gaia-muted">Plan target (hardcoded EGP): {planTargetLabel}</p>
                {planComplete ? (
                  <p className="text-[10px] text-emerald-300">Target hit. Ready to move up.</p>
                ) : displayCurrency === "EGP" && planRemaining != null ? (
                  <p className="text-[10px] gaia-muted">
                    ~{planRemainingLabel} to hit plan target.
                  </p>
                ) : null}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--gaia-text-muted)]">
                Level & plan
              </p>
              <h3 className="text-xl font-semibold text-[var(--gaia-text-strong)]">
                Stay on the ladder
              </h3>
            </div>
            <span className="rounded-full bg-[var(--gaia-surface-soft)] px-3 py-1 text-[11px] font-semibold text-[var(--gaia-text-default)]">
              {monthsSaved != null ? `${monthsSaved.toFixed(1)} mo saved` : "Need data"}
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
              <p className="text-xs gaia-muted">All targets measured here first.</p>
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

      <section className="grid gap-4 md:grid-cols-2">
        <article className={`${surface} overflow-hidden`}>
          <button
            type="button"
            onClick={() =>
              setOpenStatusTable((prev) => (prev === "monthly" ? null : "monthly"))
            }
            aria-expanded={openStatusTable === "monthly"}
            className="flex w-full items-center justify-between px-5 py-4 text-left transition hover:bg-[var(--gaia-surface-soft)]"
          >
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--gaia-text-muted)]">
                Plans · Target saving ladder
              </p>
              <h3 className="text-base font-semibold text-[var(--gaia-text-strong)]">
                Monthly target saving status (EGP)
              </h3>
              <p className="text-xs gaia-muted">
                Quick reference for planning. Only one table stays open at a time.
              </p>
            </div>
            <span className="text-sm text-[var(--gaia-text-muted)]">
              {openStatusTable === "monthly" ? "▾" : "▸"}
            </span>
          </button>
          {openStatusTable === "monthly" && (
            <div className="border-t gaia-border px-5 py-4">
              <table className="w-full text-left text-xs text-[var(--gaia-text-default)]">
                <thead>
                  <tr className="text-[11px] uppercase tracking-wide text-[var(--gaia-text-muted)]">
                    <th className="py-2 pr-3">Target saving</th>
                    <th className="px-3 py-2">Financial status</th>
                  </tr>
                </thead>
                <tbody>
                  {MONTHLY_STATUS_ROWS.map((row) => (
                    <tr key={row.range} className="border-b gaia-border last:border-b-0">
                      <td className="py-2 pr-3 text-[11px] font-semibold text-[var(--gaia-text-strong)]">
                        {row.range}
                      </td>
                      <td className="px-3 py-2 text-[11px] text-[var(--gaia-text-default)]">
                        {row.status}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </article>

        <article className={`${surface} overflow-hidden`}>
          <button
            type="button"
            onClick={() =>
              setOpenStatusTable((prev) => (prev === "annual" ? null : "annual"))
            }
            aria-expanded={openStatusTable === "annual"}
            className="flex w-full items-center justify-between px-5 py-4 text-left transition hover:bg-[var(--gaia-surface-soft)]"
          >
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--gaia-text-muted)]">
                Plans · Target saving ladder
              </p>
              <h3 className="text-base font-semibold text-[var(--gaia-text-strong)]">
                Annual target saving status (EGP)
              </h3>
              <p className="text-xs gaia-muted">
                Collapsed by default; click to toggle. Switching auto-closes the other table.
              </p>
            </div>
            <span className="text-sm text-[var(--gaia-text-muted)]">
              {openStatusTable === "annual" ? "▾" : "▸"}
            </span>
          </button>
          {openStatusTable === "annual" && (
            <div className="border-t gaia-border px-5 py-4">
              <table className="w-full text-left text-xs text-[var(--gaia-text-default)]">
                <thead>
                  <tr className="text-[11px] uppercase tracking-wide text-[var(--gaia-text-muted)]">
                    <th className="py-2 pr-3">Target saving</th>
                    <th className="px-3 py-2">Financial status</th>
                  </tr>
                </thead>
                <tbody>
                  {ANNUAL_STATUS_ROWS.map((row) => (
                    <tr key={row.range} className="border-b gaia-border last:border-b-0">
                      <td className="py-2 pr-3 text-[11px] font-semibold text-[var(--gaia-text-strong)]">
                        {row.range}
                      </td>
                      <td className="px-3 py-2 text-[11px] text-[var(--gaia-text-default)]">
                        {row.status}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </article>
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
                {formatCurrency(overview.monthStory.netChange, primaryCurrency)} this month
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
                Supabase mirror with local cache always on.
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
