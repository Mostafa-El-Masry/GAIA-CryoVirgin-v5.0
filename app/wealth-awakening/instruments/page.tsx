"use client";

import { useEffect, useMemo, useState } from "react";
import { useWealthUnlocks } from "../hooks/useWealthUnlocks";
import type {
  WealthInstrument,
  WealthState,
  PayoutFrequency,
} from "../lib/types";
import {
  loadWealthStateWithRemote,
  saveWealthStateWithRemote,
  importLegacyWealthStateToSupabase,
} from "../lib/wealthStore";
import { hasSupabaseConfig } from "../lib/remoteWealth";
import { getExchangeRate } from "../lib/exchangeRate";
import { buildInstrumentAutoFlows, mergeInstrumentFlows } from "../lib/instrumentFlows";
import {
  estimateMonthlyInterest,
  estimateTotalInterestOverHorizon,
} from "../lib/projections";
import { getTodayInKuwait } from "../lib/summary";

const surface = "wealth-surface text-[var(--gaia-text-default)]";

function computeEndDate(startDate: string, termMonths: number): string {
  if (!startDate) return "-";
  try {
    const d = new Date(`${startDate}T00:00:00Z`);
    if (Number.isNaN(d.getTime())) return "-";
    d.setUTCMonth(d.getUTCMonth() + (termMonths || 0));
    d.setUTCDate(d.getUTCDate() - 1);
    return d.toISOString().slice(0, 10);
  } catch {
    return "-";
  }
}

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
        <h1 className="mb-2 text-xl font-semibold text-white">
          Certificates & investments locked
        </h1>
        <p className="mb-3 text-sm text-slate-300">
          Complete more Academy lessons in Apollo to unlock this part of Wealth.
        </p>
        <p className="text-xs text-slate-400">
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

function WealthInstrumentsContent() {
  const [state, setState] = useState<WealthState | null>(null);
  const [editing, setEditing] = useState<WealthInstrument | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const supabaseReady = hasSupabaseConfig();

  useEffect(() => {
    const load = async () => {
      try {
        const s = await loadWealthStateWithRemote();
        setState(s);
      } catch (err: any) {
        setError(err?.message ?? "Failed to load investments.");
      }
    };
    void load();
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

  if (!state) {
    return (
      <main className="mx-auto max-w-5xl space-y-4 px-4 py-8 text-slate-100">
        <section className={`${surface} p-6 text-sm text-slate-300`}>
          Loading your investments from Supabase...
        </section>
      </main>
    );
  }

  return (
    <main className="mx-auto w-[75vw] space-y-6 px-4 py-8 text-[var(--gaia-text-default)]">
      <header className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--gaia-text-muted)]">
            Wall Street Drive
          </p>
          <h1 className="mt-1 text-3xl font-semibold text-[var(--gaia-text-strong)]">
            Certificates & investments
          </h1>
          <p className="mt-2 max-w-3xl text-sm gaia-muted">
            Long-term deposits, CDs, and other investments that generate
            interest for you. For now, GAIA uses a simple monthly-interest
            estimate without complex compounding.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 text-[11px]">
          {error && <span className="text-rose-300">{error}</span>}
          {syncStatus && !error && (
            <span className="text-emerald-300">{syncStatus}</span>
          )}
          {supabaseReady && (
            <button
              type="button"
              disabled={syncing}
              onClick={async () => {
                if (!state) return;
                setSyncing(true);
                setError(null);
                setSyncStatus(null);
                try {
                  const hasData = Boolean(
                    state.accounts.length || state.instruments.length || state.flows.length
                  );
                  if (!hasData) {
                    const legacy = await importLegacyWealthStateToSupabase();
                    if (!legacy.ok) {
                      setError(legacy.message);
                      return;
                    }
                    if (legacy.state) {
                      setState(legacy.state);
                    }
                    setSyncStatus(legacy.message);
                    return;
                  }
                  await saveWealthStateWithRemote(state);
                  const refreshed = await loadWealthStateWithRemote();
                  setState(refreshed);
                  setSyncStatus("Synced to Supabase.");
                } catch (err: any) {
                  setError(err?.message ?? "Failed to sync to Supabase.");
                } finally {
                  setSyncing(false);
                }
              }}
              className="inline-flex items-center rounded-full border border-[var(--gaia-contrast-bg)]/40 bg-[var(--gaia-contrast-bg)]/8 px-3 py-1.5 font-semibold text-[var(--gaia-text-default)] hover:border-[var(--gaia-contrast-bg)] disabled:opacity-60"
            >
              {syncing ? "Syncing..." : "Sync now"}
            </button>
          )}
          <button
            type="button"
            onClick={() => {
              if (!state) return;
              const last = state.instruments[state.instruments.length - 1];
              const template: WealthInstrument =
                last ?? {
                  id: "",
                  accountId: "",
                  accountNumber: "",
                  bankName: "",
                  revenueFrequency: "",
                  reference: "",
                  name: "Certificate",
                  currency: "EGP",
                  principal: 0,
                  startDate: today,
                  termMonths: 36,
                  annualRatePercent: 0,
                  payoutFrequency: "monthly-interest" as PayoutFrequency,
                  autoRenew: false,
                  note: "",
                };
              const newInst: WealthInstrument = {
                ...template,
                id: `inst-${Math.random().toString(36).slice(2, 8)}`,
              };
              setState((prev) =>
                prev ? { ...prev, instruments: [...prev.instruments, newInst] } : prev
              );
              setEditing(newInst);
              setIsNew(true);
              setError(null);
            }}
            className="inline-flex items-center rounded-full border border-[var(--gaia-contrast-bg)]/60 bg-[var(--gaia-contrast-bg)]/12 px-3 py-1.5 font-semibold text-[var(--gaia-text-default)] hover:border-[var(--gaia-contrast-bg)]"
          >
            + Add certificate
          </button>
        </div>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        <article className={`${surface} p-4`}>
          <h2 className="text-xs font-semibold uppercase tracking-wide text-[var(--gaia-text-muted)]">
            Portfolio overview
          </h2>
          <p className="mt-2 text-xs gaia-muted">
            Overview of your investments by currency. All numbers are rough,
            on-purpose-simple estimates.
          </p>
        </article>

        <article className={`${surface} p-4 md:col-span-2`}>
          <h3 className="text-xs font-semibold uppercase tracking-wide text-[var(--gaia-text-muted)]">
            By currency
          </h3>
          <div className="mt-2 grid gap-3 md:grid-cols-2">
            {Array.from(portfolioByCurrency.entries()).map(
              ([currency, agg]) => (
                <div
                  key={currency}
                  className="rounded-xl border gaia-border bg-[var(--gaia-surface-soft)] p-3 text-xs text-[var(--gaia-text-default)]"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold uppercase tracking-wide gaia-muted">
                      {currency}
                    </span>
                    <span className="text-[11px] gaia-muted">
                      ~monthly interest
                    </span>
                  </div>
                  <p className="mt-1 text-sm font-semibold text-[var(--gaia-text-strong)]">
                    {formatCurrency(agg.monthlyInterest, currency)} / month
                  </p>
                  <p className="mt-0.5 text-[11px] gaia-muted">
                    Principal parked:{" "}
                    <span className="font-semibold text-[var(--gaia-text-strong)]">
                      {formatCurrency(agg.principal, currency)}
                    </span>
                  </p>
                  <p className="mt-0.5 text-[11px] gaia-muted">
                    Roughly{" "}
                    <span className="font-semibold text-[var(--gaia-text-strong)]">
                      {formatCurrency(agg.interest12m, currency)}
                    </span>{" "}
                    over the next 12 months if nothing changes.
                  </p>
                </div>
              )
            )}
            {portfolioByCurrency.size === 0 && (
              <p className="text-xs gaia-muted">
                No investments defined yet. Later you&apos;ll be able to add
                real certificates here.
              </p>
            )}
          </div>
        </article>
      </section>

      <section className={`${surface} p-5 md:p-6`}>
        <h2 className="text-sm font-semibold text-[var(--gaia-text-strong)]">
          Investments list
        </h2>
        <p className="mt-1 text-xs gaia-muted">
          Each row is a single certificate or investment, with a simple
          monthly-interest estimate and rough 12-month projection.
        </p>
        {!supabaseReady && (
          <p className="mt-2 text-xs text-amber-600">
            Supabase credentials not detected (using browser storage). Add
            NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to
            persist remotely.
          </p>
        )}
        {error && <p className="mt-2 text-xs text-rose-600">{error}</p>}
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-left text-xs text-[var(--gaia-text-default)]">
            <thead>
              <tr className="border-b gaia-border text-[11px] uppercase tracking-wide text-[var(--gaia-text-muted)]">
                <th className="py-2 pr-3">Name</th>
                <th className="px-3 py-2">Reference</th>
                <th className="px-3 py-2">Account #</th>
                <th className="px-3 py-2">Bank</th>
                <th className="px-3 py-2">Currency</th>
                <th className="px-3 py-2 text-right">Principal</th>
                <th className="px-3 py-2 text-right">Annual rate</th>
                <th className="px-3 py-2 text-right">Term</th>
                <th className="px-3 py-2 text-right">Start date</th>
                <th className="px-3 py-2 text-right">End date</th>
                <th className="px-3 py-2 text-right">Revenue freq</th>
                <th className="px-3 py-2 text-right">Monthly interest</th>
                <th className="px-3 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {instruments.map((inst: WealthInstrument) => {
                const isEditingRow = editing?.id === inst.id;
                const draft = isEditingRow ? editing : inst;
                const monthly = estimateMonthlyInterest(draft);
                const endLabel = computeEndDate(
                  draft.startDate,
                  draft.termMonths
                );

                return (
                  <tr
                    key={inst.id}
                    className="border-b gaia-border last:border-b-0"
                  >
                    <td className="py-2 pr-3 align-top">
                      <div className="flex flex-col">
                        {isEditingRow ? (
                          <input
                            className="w-full rounded-md border gaia-border bg-[var(--gaia-surface)] px-2 py-1 text-[11px] text-[var(--gaia-text-default)]"
                            value={draft.name}
                            onChange={(e) =>
                              setEditing((prev) =>
                                prev ? { ...prev, name: e.target.value } : prev
                              )
                            }
                          />
                        ) : (
                          <span className="font-medium text-[var(--gaia-text-strong)]">
                            {inst.name}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-2 align-top text-[11px] text-[var(--gaia-text-default)]">
                      {isEditingRow ? (
                        <input
                          className="w-full rounded-md border gaia-border bg-[var(--gaia-surface)] px-2 py-1 text-[11px] text-[var(--gaia-text-default)]"
                          value={draft.reference ?? ""}
                          onChange={(e) =>
                            setEditing((prev) =>
                              prev
                                ? { ...prev, reference: e.target.value }
                                : prev
                            )
                          }
                          placeholder="Ref #"
                        />
                      ) : (
                        inst.reference || <span className="opacity-60">-</span>
                      )}
                    </td>
                    <td className="px-3 py-2 align-top text-[11px] text-[var(--gaia-text-default)]">
                      {isEditingRow ? (
                        <input
                          className="w-full rounded-md border gaia-border bg-[var(--gaia-surface)] px-2 py-1 text-[11px] text-[var(--gaia-text-default)]"
                          value={draft.accountNumber ?? ""}
                          onChange={(e) =>
                            setEditing((prev) =>
                              prev
                                ? { ...prev, accountNumber: e.target.value }
                                : prev
                            )
                          }
                          placeholder="Account #"
                        />
                      ) : (
                        draft.accountNumber || <span className="opacity-60">-</span>
                      )}
                    </td>
                    <td className="px-3 py-2 align-top text-[11px] text-[var(--gaia-text-default)]">
                      {isEditingRow ? (
                        <input
                          className="w-full rounded-md border gaia-border bg-[var(--gaia-surface)] px-2 py-1 text-[11px] text-[var(--gaia-text-default)]"
                          value={draft.bankName ?? ""}
                          onChange={(e) =>
                            setEditing((prev) =>
                              prev ? { ...prev, bankName: e.target.value } : prev
                            )
                          }
                          placeholder="Bank name"
                        />
                      ) : (
                        draft.bankName || <span className="opacity-60">-</span>
                      )}
                    </td>
                    <td className="px-3 py-2 align-top text-[11px] text-[var(--gaia-text-default)]">
                      {isEditingRow ? (
                        <input
                          className="w-full rounded-md border gaia-border bg-[var(--gaia-surface)] px-2 py-1 text-[11px] text-[var(--gaia-text-default)]"
                          value={draft.currency}
                          onChange={(e) =>
                            setEditing((prev) =>
                              prev
                                ? {
                                    ...prev,
                                    currency: e.target.value.toUpperCase(),
                                  }
                                : prev
                            )
                          }
                        />
                      ) : (
                        draft.currency
                      )}
                    </td>
                    <td className="px-3 py-2 align-top text-right text-[11px] font-semibold text-[var(--gaia-text-strong)]">
                      {isEditingRow ? (
                        <input
                          type="number"
                          className="w-28 rounded-md border gaia-border bg-[var(--gaia-surface)] px-2 py-1 text-[11px] text-[var(--gaia-text-default)] text-right"
                          value={draft.principal}
                          onChange={(e) =>
                            setEditing((prev) =>
                              prev
                                ? { ...prev, principal: Number(e.target.value) }
                                : prev
                            )
                          }
                        />
                      ) : (
                        formatCurrency(draft.principal, draft.currency)
                      )}
                    </td>
                    <td className="px-3 py-2 align-top text-right text-[11px] text-[var(--gaia-text-default)]">
                      {isEditingRow ? (
                        <input
                          type="number"
                          className="w-16 rounded-md border gaia-border bg-[var(--gaia-surface)] px-2 py-1 text-[11px] text-[var(--gaia-text-default)] text-right"
                          value={draft.annualRatePercent}
                          onChange={(e) =>
                            setEditing((prev) =>
                              prev
                                ? {
                                    ...prev,
                                    annualRatePercent: Number(e.target.value),
                                  }
                                : prev
                            )
                          }
                        />
                      ) : (
                        `${draft.annualRatePercent.toFixed(2)}%`
                      )}
                    </td>
                    <td className="px-3 py-2 align-top text-right text-[11px] text-[var(--gaia-text-default)]">
                      {isEditingRow ? (
                        <input
                          type="number"
                          className="w-12 rounded-md border gaia-border bg-[var(--gaia-surface)] px-2 py-1 text-[11px] text-[var(--gaia-text-default)] text-right"
                          value={draft.termMonths}
                          onChange={(e) =>
                            setEditing((prev) =>
                              prev
                                ? {
                                    ...prev,
                                    termMonths: Number(e.target.value),
                                  }
                                : prev
                            )
                          }
                        />
                      ) : (
                        `${draft.termMonths} m`
                      )}
                    </td>
                    <td className="px-3 py-2 align-top text-right text-[11px] text-[var(--gaia-text-default)]">
                      {isEditingRow ? (
                        <input
                          className="w-28 rounded-md border gaia-border bg-[var(--gaia-surface)] px-2 py-1 text-[11px] text-[var(--gaia-text-default)] text-right"
                          value={draft.startDate}
                          onChange={(e) =>
                            setEditing((prev) =>
                              prev
                                ? { ...prev, startDate: e.target.value }
                                : prev
                            )
                          }
                        />
                      ) : (
                        draft.startDate
                      )}
                    </td>
                    <td className="px-3 py-2 align-top text-right text-[11px] text-[var(--gaia-text-default)]">
                      {endLabel}
                    </td>
                    <td className="px-3 py-2 align-top text-right text-[11px] text-[var(--gaia-text-default)]">
                      {isEditingRow ? (
                        <select
                          className="w-full rounded-md border gaia-border bg-[var(--gaia-surface)] px-2 py-1 text-[11px] text-[var(--gaia-text-default)]"
                          value={draft.revenueFrequency ?? ""}
                          onChange={(e) =>
                            setEditing((prev) =>
                              prev ? { ...prev, revenueFrequency: e.target.value } : prev
                            )
                          }
                        >
                          <option value="">Select</option>
                          <option value="daily">Daily</option>
                          <option value="monthly">Monthly</option>
                          <option value="yearly">Yearly</option>
                        </select>
                      ) : (
                        draft.revenueFrequency || <span className="opacity-60">-</span>
                      )}
                    </td>
                    <td className="px-3 py-2 align-top text-right text-[11px] font-semibold text-[var(--gaia-text-strong)]">
                      {formatCurrency(monthly, draft.currency)}
                    </td>
                    <td className="px-3 py-2 align-top text-right">
                      {isEditingRow ? (
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            className="rounded-full border gaia-border px-2 py-1 text-[11px] text-[var(--gaia-text-default)] hover:border-[var(--gaia-contrast-bg)]"
                            onClick={() => {
                              if (isNew && state) {
                                setState((prev) =>
                                  prev
                                    ? {
                                        ...prev,
                                        instruments: prev.instruments.filter(
                                          (i) => i.id !== inst.id
                                        ),
                                      }
                                    : prev
                                );
                              }
                              setEditing(null);
                              setIsNew(false);
                              setError(null);
                            }}
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            disabled={saving}
                            className="rounded-full border border-[var(--gaia-contrast-bg)]/60 bg-[var(--gaia-contrast-bg)]/12 px-2 py-1 text-[11px] font-semibold text-[var(--gaia-text-default)] hover:border-[var(--gaia-contrast-bg)] disabled:opacity-60"
                            onClick={async () => {
                              if (!state || !editing) return;
                              const name = editing.name.trim();
                              if (!name) {
                                setError("Name is required.");
                                return;
                              }
                              setSaving(true);
                              setError(null);
                              const payload: WealthInstrument = {
                                ...editing,
                                name,
                                currency:
                                  editing.currency.trim().toUpperCase() ||
                                  "EGP",
                                principal: Number(editing.principal) || 0,
                                termMonths: Number(editing.termMonths) || 36,
                                annualRatePercent:
                                  Number(editing.annualRatePercent) || 0,
                                payoutFrequency:
                                  editing.payoutFrequency || "monthly-interest",
                                note: editing.note?.trim() || "",
                              };

                              const instrumentsNext = state.instruments.slice();
                              const existingIdx = instrumentsNext.findIndex(
                                (i) => i.id === payload.id
                              );
                              if (existingIdx >= 0) {
                                instrumentsNext[existingIdx] = payload;
                              } else {
                                instrumentsNext.push(payload);
                              }

                              const fxInfo = await getExchangeRate();
                              const autoFlows = buildInstrumentAutoFlows(
                                payload,
                                fxInfo.rate,
                                today,
                              );
                              const flowsNext = mergeInstrumentFlows(
                                state.flows,
                                payload.id,
                                autoFlows,
                              );
                              const next: WealthState = {
                                ...state,
                                instruments: instrumentsNext,
                                flows: flowsNext,
                              };
                              try {
                                await saveWealthStateWithRemote(next);
                                setState(next);
                                setEditing(null);
                                setIsNew(false);
                              } catch (err: any) {
                                setError(
                                  err?.message ?? "Failed to save certificate."
                                );
                              } finally {
                                setSaving(false);
                              }
                            }}
                          >
                            {saving ? "Saving..." : "Save"}
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            className="rounded-full border border-[var(--gaia-contrast-bg)]/50 px-2 py-1 text-[11px] text-[var(--gaia-text-default)] hover:border-[var(--gaia-contrast-bg)]"
                            onClick={() => {
                              setIsNew(false);
                              setEditing(inst);
                            }}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            aria-label="Delete certificate"
                            className="inline-flex items-center justify-center rounded-full border border-rose-400/60 px-2 py-1 text-[11px] text-rose-600 hover:border-rose-500"
                            onClick={async () => {
                              if (!state) return;
                              const next: WealthState = {
                                ...state,
                                instruments: state.instruments.filter((i) => i.id !== inst.id),
                                flows: state.flows.filter((flow) => flow.instrumentId !== inst.id),
                              };
                              try {
                                await saveWealthStateWithRemote(next);
                                setState(next);
                                if (editing?.id === inst.id) {
                                  setEditing(null);
                                  setIsNew(false);
                                }
                              } catch (err: any) {
                                setError(err?.message ?? "Failed to delete certificate.");
                              }
                            }}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              className="h-3.5 w-3.5"
                              fill="currentColor"
                            >
                              <path d="M9 10a1 1 0 0 1 1 1v6a1 1 0 1 1-2 0v-6a1 1 0 0 1 1-1Zm4 0a1 1 0 0 1 1 1v6a1 1 0 1 1-2 0v-6a1 1 0 0 1 1-1Z" />
                              <path
                                fillRule="evenodd"
                                d="M5 6a1 1 0 0 1 1-1h3.5l.433-.866A1 1 0 0 1 10.83 3h2.34a1 1 0 0 1 .897.534L14.5 5H18a1 1 0 1 1 0 2h-.143l-.715 11.437A2 2 0 0 1 15.146 20H8.854a2 2 0 0 1-1.996-1.563L6.143 7H6a1 1 0 0 1-1-1Zm3.143 1 0 .001L8 7l.714 11.4a.5.5 0 0 0 .498.4h6.576a.5.5 0 0 0 .498-.4L17 7h-8.857Z"
                              />
                            </svg>
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
              {instruments.length === 0 && (
                <tr>
                  <td
                    colSpan={13}
                    className="py-4 text-center text-xs gaia-muted"
                  >
                    No investments defined yet. In later weeks, you&apos;ll be
                    able to add your real certificates here.
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
    return (
      <LockedState
        stage={stage}
        totalLessonsCompleted={totalLessonsCompleted}
      />
    );
  }

  return <WealthInstrumentsContent />;
}
