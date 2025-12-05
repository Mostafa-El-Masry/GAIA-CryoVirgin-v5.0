"use client";

import { useEffect, useMemo, useState } from "react";
import { useWealthUnlocks } from "../hooks/useWealthUnlocks";
import type { WealthState, WealthLevelsSnapshot } from "../lib/types";
import { loadWealthState } from "../lib/wealthStore";
import { buildWealthOverview, getTodayInKuwait } from "../lib/summary";
import { buildLevelsSnapshot } from "../lib/levels";

const surface =
  "rounded-2xl border border-slate-800 bg-slate-900/80 shadow-[0_18px_60px_rgba(0,0,0,0.45)]";

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

export default function WealthLevelsPage() {
  const { canAccess, stage, totalLessonsCompleted } = useWealthUnlocks();
  if (!canAccess("levels")) {
    return (
      <main className="mx-auto max-w-5xl space-y-4 px-4 py-8 text-slate-100">
        <section className={`${surface} p-8`}>
          <h1 className="text-xl font-semibold text-white">Wealth levels locked</h1>
          <p className="mt-2 text-sm text-slate-300">
            Complete more Academy lessons in Apollo to unlock this part of Wealth.
          </p>
          <p className="mt-2 text-xs text-slate-400">
            Lessons completed: <span className="font-semibold text-white">{totalLessonsCompleted}</span>{" "}
            - Wealth stage <span className="font-semibold text-white">{stage}</span>/5
          </p>
        </section>
      </main>
    );
  }

  const [state, setState] = useState<WealthState | null>(null);
  const [snapshot, setSnapshot] = useState<WealthLevelsSnapshot | null>(null);

  useEffect(() => {
    const s = loadWealthState();
    setState(s);
    const today = getTodayInKuwait();
    const todayOverview = buildWealthOverview(s, today);
    const snap = buildLevelsSnapshot(todayOverview);
    setSnapshot(snap);
  }, []);

  const primaryCurrency = useMemo(() => {
    if (!state) return "KWD";
    return (
      state.accounts.find((a) => a.isPrimary)?.currency ||
      state.accounts[0]?.currency ||
      "KWD"
    );
  }, [state]);

  if (!state || !snapshot) {
    return (
      <main className="mx-auto max-w-5xl space-y-4 px-4 py-8 text-slate-100">
        <section className={`${surface} p-6 text-sm text-slate-300`}>
          Loading your current level and coverage from local cache...
        </section>
      </main>
    );
  }

  const currentLevel = snapshot.levels.find((lvl) => lvl.id === snapshot.currentLevelId);
  const nextLevel = snapshot.levels.find((lvl) => lvl.id === snapshot.nextLevelId);

  const totalPrimaryStash = state.accounts
    .filter((a) => a.currency === primaryCurrency)
    .reduce((sum, a) => sum + a.currentBalance, 0);

  let nextLevelHint: string | null = null;
  if (nextLevel && snapshot.estimatedMonthlyExpenses && snapshot.monthsOfExpensesSaved !== null) {
    const targetMonths = nextLevel.minMonthsOfExpenses ?? snapshot.monthsOfExpensesSaved;
    const targetSavings = targetMonths * snapshot.estimatedMonthlyExpenses;
    const needMore = targetSavings - totalPrimaryStash;
    if (needMore > 0) {
      nextLevelHint = `You are roughly ${formatCurrency(needMore, primaryCurrency)} away from the savings side of ${nextLevel.shortLabel}.`;
    }
  }

  return (
    <main className="mx-auto max-w-6xl space-y-6 px-4 py-8 text-slate-100">
      <header className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-300/80">
            Wall Street Drive
          </p>
          <h1 className="mt-1 text-3xl font-semibold text-white">Wealth levels</h1>
          <p className="mt-2 max-w-3xl text-sm text-slate-300">
            A calm ladder from Thin buffer to Interest cover, driven by your real numbers. GAIA
            looks at your savings, typical expenses, and interest to place you on the road.
          </p>
        </div>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        <article className={`${surface} p-4`}>
          <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Current level
          </h2>
          <p className="mt-2 text-sm font-semibold text-white">
            {currentLevel ? currentLevel.shortLabel : "Not enough data yet"}
          </p>
          <p className="mt-1 text-xs text-slate-400">
            {currentLevel
              ? currentLevel.description
              : "Once GAIA sees at least one month of expenses, it will place you on the ladder."}
          </p>
        </article>

        <article className={`${surface} p-4`}>
          <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Coverage
          </h2>
          <dl className="mt-2 space-y-1 text-xs text-slate-200">
            <div className="flex items-center justify-between gap-2">
              <dt>Estimated monthly expenses</dt>
              <dd className="font-semibold text-white">
                {snapshot.estimatedMonthlyExpenses
                  ? formatCurrency(snapshot.estimatedMonthlyExpenses, primaryCurrency)
                  : "-"}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-2">
              <dt>Monthly interest (passive)</dt>
              <dd className="font-semibold text-white">
                {formatCurrency(snapshot.monthlyPassiveIncome ?? 0, primaryCurrency)}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-2">
              <dt>Interest coverage</dt>
              <dd className="font-semibold text-white">
                {formatPercent(snapshot.coveragePercent)}
              </dd>
            </div>
          </dl>
          <p className="mt-2 text-[11px] text-slate-400">
            Coverage is how much of your estimated monthly expenses could be paid by interest alone,
            in your primary currency.
          </p>
        </article>

        <article className={`${surface} p-4`}>
          <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Runway
          </h2>
          <dl className="mt-2 space-y-1 text-xs text-slate-200">
            <div className="flex items-center justify-between gap-2">
              <dt>Savings in primary currency</dt>
              <dd className="font-semibold text-white">
                {formatCurrency(totalPrimaryStash, primaryCurrency)}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-2">
              <dt>Months of expenses saved</dt>
              <dd className="font-semibold text-white">
                {formatMonths(snapshot.monthsOfExpensesSaved)}
              </dd>
            </div>
          </dl>
          <p className="mt-2 text-[11px] text-slate-400">
            This is an approximate runway in your primary currency only. Other currencies and assets
            add extra safety on top.
          </p>
        </article>
      </section>

      <section className={`${surface} p-5 md:p-6`}>
        <h2 className="text-sm font-semibold text-white">Ladder & next step</h2>
        <p className="mt-1 text-xs text-slate-400">
          Each level is a simple checkpoint. You don&apos;t have to race. The goal is to know roughly
          where you stand and what the next gentle improvement could be.
        </p>

        {nextLevelHint && (
          <p className="mt-3 text-xs font-medium text-emerald-200">{nextLevelHint}</p>
        )}

        <div className="mt-4 space-y-2">
          {snapshot.levels.map((level) => {
            const isCurrent = level.id === snapshot.currentLevelId;
            const isNext = level.id === snapshot.nextLevelId;

            return (
              <div
                key={level.id}
                className={`flex items-start gap-3 rounded-xl border px-3 py-2 text-xs ${
                  isCurrent
                    ? "border-emerald-500/70 bg-emerald-500/10"
                    : isNext
                    ? "border-sky-500/70 bg-sky-500/10"
                    : "border-slate-800 bg-slate-900/80"
                }`}
              >
                <div className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-slate-900 text-[11px] font-semibold text-slate-200">
                  {level.order}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-white">{level.shortLabel}</span>
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
                  <p className="mt-0.5 text-[11px] text-slate-300">{level.description}</p>
                  <p className="mt-0.5 text-[11px] text-slate-400">
                    {level.minMonthsOfExpenses != null && (
                      <span>
                        - Aim for at least{" "}
                        <span className="font-semibold text-white">{level.minMonthsOfExpenses} months</span>{" "}
                        of expenses saved.
                      </span>
                    )}{" "}
                    {level.minInterestCoveragePercent != null && (
                      <span>
                        - Interest covering around{" "}
                        <span className="font-semibold text-white">
                          {level.minInterestCoveragePercent}%
                        </span>{" "}
                        of your monthly costs.
                      </span>
                    )}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
}
