"use client";

import { useEffect, useMemo, useState } from "react";
import { useWealthUnlocks } from "../hooks/useWealthUnlocks";
import type { WealthInstrument, WealthState } from "../lib/types";
import { loadWealthState, resetWealthState } from "../lib/wealthStore";
import {
  estimateMonthlyInterest,
  estimateTotalInterestOverHorizon,
  instrumentEndMonth,
  monthLabel,
} from "../lib/projections";
import { getTodayInKuwait } from "../lib/summary";

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

function LockedState({
  stage,
  totalLessonsCompleted,
}: {
  stage: number;
  totalLessonsCompleted: number;
}) {
  return (
    <main className="mx-auto max-w-5xl space-y-4 px-4 py-8 text-[var(--gaia-text-default)]">
      <section className={`${surface} p-8`}>
        <h1 className="mb-2 text-xl font-semibold text-white">Certificates & instruments locked</h1>
        <p className="mb-3 text-sm text-slate-300">
          Complete more Academy lessons in Apollo to unlock this part of Wealth.
        </p>
        <p className="text-xs text-slate-400">
          Lessons completed: <span className="font-semibold text-white">{totalLessonsCompleted}</span>{" "}
          - Wealth stage <span className="font-semibold text-white">{stage}</span>/5
        </p>
      </section>
    </main>
  );
}

function WealthInstrumentsContent() {
  const [state, setState] = useState<WealthState | null>(null);

  useEffect(() => {
    const s = loadWealthState();
    setState(s);
  }, []);

  const today = getTodayInKuwait();
  const instruments = state?.instruments ?? [];

  const portfolioByCurrency = useMemo(() => {
    const map = new Map<
      string,
      { principal: number; monthlyInterest: number; interest12m: number }
    >();
    for (const inst of instruments) {
      const monthly = estimateMonthlyInterest(inst);
      const total12 = estimateTotalInterestOverHorizon(inst, 12, today);
      const entry = map.get(inst.currency) ?? {
        principal: 0,
        monthlyInterest: 0,
        interest12m: 0,
      };
      entry.principal += inst.principal;
      entry.monthlyInterest += monthly;
      entry.interest12m += total12;
      map.set(inst.currency, entry);
    }
    return map;
  }, [instruments, today]);

  function handleReset() {
    const fresh = resetWealthState();
    setState(fresh);
  }

  if (!state) {
    return (
      <main className="mx-auto max-w-5xl space-y-4 px-4 py-8 text-slate-100">
        <section className={`${surface} p-6 text-sm text-slate-300`}>
          Loading your instruments from local cache...
        </section>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl space-y-6 px-4 py-8 text-[var(--gaia-text-default)]">
      <header className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--gaia-text-muted)]">
            Wall Street Drive
          </p>
          <h1 className="mt-1 text-3xl font-semibold text-[var(--gaia-text-strong)]">
            Certificates & instruments
          </h1>
          <p className="mt-2 max-w-3xl text-sm gaia-muted">
            Long-term deposits, CDs, and other instruments that generate interest for you. For now,
            GAIA uses a simple monthly-interest estimate without complex compounding.
          </p>
        </div>
        <button
          type="button"
          onClick={handleReset}
          className="mt-3 inline-flex items-center justify-center rounded-full border border-slate-700 bg-slate-900/80 px-3 py-1.5 text-xs font-medium text-slate-200 shadow-sm transition hover:border-emerald-400 hover:text-white md:mt-0"
        >
          Reset example data
        </button>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        <article className={`${surface} p-4`}>
          <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Portfolio overview
          </h2>
          <p className="mt-2 text-xs text-slate-300">
            Overview of your instruments by currency. All numbers are rough, on-purpose-simple
            estimates.
          </p>
        </article>

        <article className={`${surface} p-4 md:col-span-2`}>
          <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            By currency
          </h3>
          <div className="mt-2 grid gap-3 md:grid-cols-2">
            {Array.from(portfolioByCurrency.entries()).map(([currency, agg]) => (
              <div
                key={currency}
                className="rounded-xl border border-slate-800 bg-slate-900/80 p-3 text-xs text-slate-200"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                    {currency}
                  </span>
                  <span className="text-[11px] text-slate-500">~monthly interest</span>
                </div>
                <p className="mt-1 text-sm font-semibold text-white">
                  {formatCurrency(agg.monthlyInterest, currency)} / month
                </p>
                <p className="mt-0.5 text-[11px] text-slate-400">
                  Principal parked:{" "}
                  <span className="font-semibold text-white">
                    {formatCurrency(agg.principal, currency)}
                  </span>
                </p>
                <p className="mt-0.5 text-[11px] text-slate-400">
                  Roughly{" "}
                  <span className="font-semibold text-white">
                    {formatCurrency(agg.interest12m, currency)}
                  </span>{" "}
                  over the next 12 months if nothing changes.
                </p>
              </div>
            ))}
            {portfolioByCurrency.size === 0 && (
              <p className="text-xs text-slate-400">
                No instruments defined yet. Later you&apos;ll be able to add real certificates here.
              </p>
            )}
          </div>
        </article>
      </section>

      <section className={`${surface} p-5 md:p-6`}>
        <h2 className="text-sm font-semibold text-white">Instruments list</h2>
        <p className="mt-1 text-xs text-slate-400">
          Each row is a single certificate or instrument, with a simple monthly-interest estimate
          and rough 12-month projection.
        </p>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-left text-xs text-slate-200">
            <thead>
              <tr className="border-b border-slate-800 text-[11px] uppercase tracking-wide text-slate-500">
                <th className="py-2 pr-3">Name</th>
                <th className="px-3 py-2">Currency</th>
                <th className="px-3 py-2 text-right">Principal</th>
                <th className="px-3 py-2 text-right">Annual rate</th>
                <th className="px-3 py-2 text-right">Term</th>
                <th className="px-3 py-2 text-right">Monthly interest (approx)</th>
                <th className="px-3 py-2 text-right">Next 12m (approx)</th>
                <th className="px-3 py-2">Notes</th>
              </tr>
            </thead>
            <tbody>
              {instruments.map((inst: WealthInstrument) => {
                const monthly = estimateMonthlyInterest(inst);
                const total12 = estimateTotalInterestOverHorizon(inst, 12, today);
                const endMonth = instrumentEndMonth(inst);

                return (
                  <tr key={inst.id} className="border-b border-slate-800 last:border-b-0">
                    <td className="py-2 pr-3 align-top">
                      <div className="flex flex-col">
                        <span className="font-medium text-white">{inst.name}</span>
                        <span className="mt-0.5 text-[11px] text-slate-500">
                          Ends around {monthLabel(endMonth)}
                        </span>
                      </div>
                    </td>
                    <td className="px-3 py-2 align-top text-[11px] text-slate-400">
                      {inst.currency}
                    </td>
                    <td className="px-3 py-2 align-top text-right text-[11px] font-semibold text-white">
                      {formatCurrency(inst.principal, inst.currency)}
                    </td>
                    <td className="px-3 py-2 align-top text-right text-[11px] text-slate-300">
                      {inst.annualRatePercent.toFixed(2)}%
                    </td>
                    <td className="px-3 py-2 align-top text-right text-[11px] text-slate-300">
                      {inst.termMonths} m
                    </td>
                    <td className="px-3 py-2 align-top text-right text-[11px] font-semibold text-white">
                      {formatCurrency(monthly, inst.currency)}
                    </td>
                    <td className="px-3 py-2 align-top text-right text-[11px] font-semibold text-white">
                      {formatCurrency(total12, inst.currency)}
                    </td>
                    <td className="px-3 py-2 align-top text-[11px] text-slate-500">
                      {inst.note || <span className="opacity-60">-</span>}
                    </td>
                  </tr>
                );
              })}
              {instruments.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-4 text-center text-xs text-slate-400">
                    No instruments defined yet. In later weeks, you&apos;ll be able to add your real
                    certificates here.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}

export default function WealthInstrumentsPage() {
  const { canAccess, stage, totalLessonsCompleted } = useWealthUnlocks();

  if (!canAccess("instruments")) {
    return <LockedState stage={stage} totalLessonsCompleted={totalLessonsCompleted} />;
  }

  return <WealthInstrumentsContent />;
}
