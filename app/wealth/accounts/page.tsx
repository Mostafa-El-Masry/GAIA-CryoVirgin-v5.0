"use client";

import { useEffect, useMemo, useState } from "react";
import { useWealthUnlocks } from "../hooks/useWealthUnlocks";
import type {
  WealthAccount,
  WealthAccountType,
  WealthState,
} from "../lib/types";
import {
  loadWealthStateWithRemote,
  saveWealthStateWithRemote,
} from "../lib/wealthStore";

type CurrencyTotals = Record<string, number>;

const typeLabels: Record<WealthAccountType, string> = {
  cash: "Cash & buffers",
  certificate: "Certificates / CDs",
  investment: "Investments",
  other: "Other",
};

const surface = "wealth-surface text-[var(--gaia-text-default)]";
const softSurface = "wealth-surface-soft";

function computeCurrencyTotals(accounts: WealthAccount[]): CurrencyTotals {
  const totals: CurrencyTotals = {};
  for (const acc of accounts) {
    totals[acc.currency] = (totals[acc.currency] ?? 0) + acc.currentBalance;
  }
  return totals;
}

function formatCurrency(value: number, currency: string) {
  if (!Number.isFinite(value)) return "-";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

export default function WealthAccountsPage() {
  const { canAccess, stage, totalLessonsCompleted } = useWealthUnlocks();

  const [state, setState] = useState<WealthState | null>(null);
  const [editing, setEditing] = useState<WealthAccount | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const s = await loadWealthStateWithRemote();
        setState(s);
      } catch (err: any) {
        setError(err?.message ?? "Failed to load accounts.");
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  const currencyTotals = useMemo(() => {
    if (!state) return {};
    return computeCurrencyTotals(state.accounts);
  }, [state]);

  const primaryCurrency =
    state?.accounts.find((a) => a.isPrimary)?.currency ||
    state?.accounts[0]?.currency ||
    "KWD";

  const grandTotal =
    primaryCurrency && state
      ? state.accounts
          .filter((a) => a.currency === primaryCurrency)
          .reduce((sum, a) => sum + a.currentBalance, 0)
      : 0;

  if (!canAccess("accounts")) {
    return null;
  }

  function startCreate() {
    setIsNew(true);
    setEditing({
      id: `acc-${Math.random().toString(36).slice(2, 8)}`,
      name: "",
      currency: primaryCurrency || "KWD",
      type: "cash",
      currentBalance: 0,
      note: "",
      isPrimary: false,
    });
  }

  function startCreateSalary() {
    setIsNew(true);
    setEditing({
      id: `acc-${Math.random().toString(36).slice(2, 8)}`,
      name: "Cash income (salary) - monthly",
      currency: primaryCurrency || "KWD",
      type: "cash",
      currentBalance: 0,
      note: "Monthly salary income (cash).",
      isPrimary: false,
    });
  }

  function startEdit(acc: WealthAccount) {
    setIsNew(false);
    setEditing(acc);
  }

  async function handleDelete(id: string) {
    if (!state) return;
    const nextAccounts = state.accounts.filter((a) => a.id !== id);
    const next: WealthState = { ...state, accounts: nextAccounts };
    await saveWealthStateWithRemote(next);
    setState(next);
    if (editing?.id === id) {
      setEditing(null);
      setIsNew(false);
    }
  }

  async function handleSave() {
    if (!state || !editing) return;
    const trimmedName = editing.name.trim();
    if (!trimmedName) return;

    let accounts = state.accounts.slice();
    const existingIdx = accounts.findIndex((a) => a.id === editing.id);

    const payload: WealthAccount = {
      ...editing,
      name: trimmedName,
      currentBalance: Number(editing.currentBalance) || 0,
      note: editing.note?.trim() || "",
    };

    if (payload.isPrimary) {
      accounts = accounts.map((a) => ({ ...a, isPrimary: false }));
    }

    if (existingIdx >= 0) {
      accounts[existingIdx] = payload;
    } else {
      accounts.push(payload);
    }

    const next: WealthState = { ...state, accounts };
    await saveWealthStateWithRemote(next);
    setState(next);
    setEditing(null);
    setIsNew(false);
  }

  if (!state) {
    return (
      <main className="mx-auto max-w-5xl space-y-4 px-4 py-8 text-[var(--gaia-text-default)]">
        <section className={`${surface} p-6 text-sm gaia-muted`}>
          Loading your Wealth accounts from Supabase...
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
            Accounts & balances
          </h1>
          <p className="mt-2 max-w-3xl text-sm gaia-muted">
            These are the places where your money currently lives - cash
            buffers, certificates, and future investment lanes.
          </p>
          {error && <p className="mt-1 text-xs text-rose-300">{error}</p>}
        </div>
      </header>

      <section className={`${surface} space-y-4 p-5 md:p-6`}>
        <div className="grid gap-4 md:grid-cols-[1.2fr_1fr]">
          <div className="rounded-2xl border border-[var(--gaia-contrast-bg)]/40 bg-[var(--gaia-contrast-bg)]/12 p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--gaia-text-muted)]">
                  Main currency stash
                </p>
                <p className="mt-2 text-2xl font-semibold text-[var(--gaia-text-strong)]">
                  {formatCurrency(grandTotal, primaryCurrency)}
                </p>
                <p className="mt-1 text-xs gaia-muted">
                  Sum of all accounts in your primary currency (
                  <span className="font-semibold text-[var(--gaia-text-strong)]">
                    {primaryCurrency}
                  </span>
                  ).
                </p>
              </div>
              <button
                type="button"
                onClick={startCreate}
                className="inline-flex items-center rounded-full border border-[var(--gaia-contrast-bg)]/60 bg-[var(--gaia-contrast-bg)]/12 px-3 py-1.5 text-[11px] font-semibold text-[var(--gaia-text-default)] transition hover:border-[var(--gaia-contrast-bg)]"
              >
                + Add account
              </button>
            </div>
            <div className="mt-3 flex flex-wrap gap-2 text-[11px]">
              <button
                type="button"
                onClick={startCreateSalary}
                className="inline-flex items-center rounded-full border border-[var(--gaia-contrast-bg)]/60 bg-[var(--gaia-contrast-bg)]/8 px-3 py-1.5 font-semibold text-[var(--gaia-text-default)] hover:border-[var(--gaia-contrast-bg)]"
              >
                + Cash income (salary) monthly
              </button>
            </div>
          </div>
          <div className="rounded-2xl border gaia-border bg-[var(--gaia-surface-soft)] p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--gaia-text-muted)]">
              By currency
            </p>
            <ul className="mt-2 space-y-1.5 text-xs text-[var(--gaia-text-default)]">
              {Object.entries(currencyTotals).map(([currency, total]) => (
                <li
                  key={currency}
                  className="flex items-center justify-between"
                >
                  <span className="font-medium text-[var(--gaia-text-strong)]">
                    {currency}
                  </span>
                  <span>{formatCurrency(total, currency)}</span>
                </li>
              ))}
              {Object.keys(currencyTotals).length === 0 && (
                <li className="text-xs gaia-muted">No accounts found yet.</li>
              )}
            </ul>
            <p className="mt-3 text-[11px] gaia-muted">
              Changes save directly to Supabase. No local cache or example data.
            </p>
          </div>
        </div>

        {editing && (
          <div className="rounded-2xl border gaia-border bg-[var(--gaia-surface-soft)] p-4 shadow-inner shadow-black/10">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-sm font-semibold text-[var(--gaia-text-strong)]">
                {isNew ? "Add account" : "Edit account"}
              </h3>
              <div className="flex gap-2 text-[11px]">
                <button
                  type="button"
                  onClick={() => {
                    setEditing(null);
                    setIsNew(false);
                  }}
                  className="rounded-full border gaia-border px-3 py-1 text-[var(--gaia-text-default)] hover:border-[var(--gaia-contrast-bg)]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  className="rounded-full border border-[var(--gaia-contrast-bg)]/60 bg-[var(--gaia-contrast-bg)]/12 px-3 py-1 font-semibold text-[var(--gaia-text-default)] hover:border-[var(--gaia-contrast-bg)]"
                >
                  Save
                </button>
              </div>
            </div>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              <label className="text-xs gaia-muted">
                Name
                <input
                  className="mt-1 w-full rounded-lg border gaia-border bg-[var(--gaia-surface)] px-3 py-2 text-sm text-[var(--gaia-text-default)]"
                  value={editing.name}
                  onChange={(e) =>
                    setEditing((prev) =>
                      prev ? { ...prev, name: e.target.value } : prev,
                    )
                  }
                />
              </label>
              <label className="text-xs gaia-muted">
                Currency
                <input
                  className="mt-1 w-full rounded-lg border gaia-border bg-[var(--gaia-surface)] px-3 py-2 text-sm text-[var(--gaia-text-default)]"
                  value={editing.currency}
                  onChange={(e) =>
                    setEditing((prev) =>
                      prev
                        ? { ...prev, currency: e.target.value.toUpperCase() }
                        : prev,
                    )
                  }
                />
              </label>
              <label className="text-xs gaia-muted">
                Type
                <select
                  className="mt-1 w-full rounded-lg border gaia-border bg-[var(--gaia-surface)] px-3 py-2 text-sm text-[var(--gaia-text-default)]"
                  value={editing.type}
                  onChange={(e) =>
                    setEditing((prev) =>
                      prev
                        ? { ...prev, type: e.target.value as WealthAccountType }
                        : prev,
                    )
                  }
                >
                  <option value="cash">Cash & buffers</option>
                  <option value="certificate">Certificates / CDs</option>
                  <option value="investment">Investments</option>
                  <option value="other">Other</option>
                </select>
              </label>
              <label className="text-xs gaia-muted">
                Current balance
                <input
                  type="number"
                  className="mt-1 w-full rounded-lg border gaia-border bg-[var(--gaia-surface)] px-3 py-2 text-sm text-[var(--gaia-text-default)]"
                  value={editing.currentBalance}
                  onChange={(e) =>
                    setEditing((prev) =>
                      prev
                        ? { ...prev, currentBalance: Number(e.target.value) }
                        : prev,
                    )
                  }
                />
              </label>
              <label className="text-xs gaia-muted md:col-span-2">
                Notes
                <textarea
                  className="mt-1 w-full rounded-lg border gaia-border bg-[var(--gaia-surface)] px-3 py-2 text-sm text-[var(--gaia-text-default)]"
                  rows={2}
                  value={editing.note ?? ""}
                  onChange={(e) =>
                    setEditing((prev) =>
                      prev ? { ...prev, note: e.target.value } : prev,
                    )
                  }
                />
              </label>
              <label className="flex items-center gap-2 text-xs font-semibold text-[var(--gaia-text-default)]">
                <input
                  type="checkbox"
                  checked={editing.isPrimary}
                  onChange={(e) =>
                    setEditing((prev) =>
                      prev ? { ...prev, isPrimary: e.target.checked } : prev,
                    )
                  }
                  className="h-4 w-4 rounded border gaia-border bg-[var(--gaia-surface)]"
                />
                Mark as primary currency
              </label>
            </div>
          </div>
        )}
      </section>

      <section className={`${surface} p-5 md:p-6`}>
        <h2 className="text-sm font-semibold text-[var(--gaia-text-strong)]">
          Account list
        </h2>
        <p className="mt-1 text-xs gaia-muted">
          Each entry shows the account type, currency, and current balance.
        </p>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-left text-xs text-[var(--gaia-text-default)]">
            <thead>
              <tr className="border-b gaia-border text-[11px] uppercase tracking-wide text-[var(--gaia-text-muted)]">
                <th className="py-2 pr-3">Name</th>
                <th className="px-3 py-2">Type</th>
                <th className="px-3 py-2">Currency</th>
                <th className="px-3 py-2 text-right">Current balance</th>
                <th className="px-3 py-2">Notes</th>
                <th className="px-3 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {state.accounts.map((acc: WealthAccount) => (
                <tr
                  key={acc.id}
                  className="border-b gaia-border last:border-b-0"
                >
                  <td className="py-2 pr-3 align-top">
                    <div className="flex flex-col">
                      <span className="font-medium text-[var(--gaia-text-strong)]">
                        {acc.name}
                      </span>
                      {acc.isPrimary && (
                        <span className="mt-0.5 inline-flex w-fit items-center rounded-full bg-[var(--gaia-contrast-bg)]/15 px-2 py-0.5 text-[10px] font-medium text-[var(--gaia-text-default)]">
                          Primary
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-3 py-2 align-top text-[11px] gaia-muted">
                    {typeLabels[acc.type] ?? acc.type}
                  </td>
                  <td className="px-3 py-2 align-top text-[11px] gaia-muted">
                    {acc.currency}
                  </td>
                  <td className="px-3 py-2 align-top text-right text-[11px] font-semibold text-[var(--gaia-text-strong)]">
                    {formatCurrency(acc.currentBalance, acc.currency)}
                  </td>
                  <td className="px-3 py-2 align-top text-[11px] gaia-muted">
                    {acc.note || <span className="opacity-60">-</span>}
                  </td>
                  <td className="px-3 py-2 align-top text-right">
                    <div className="flex justify-end gap-2 text-[11px]">
                      <button
                        type="button"
                        className="rounded-full border gaia-border px-2 py-1 text-[var(--gaia-text-default)] hover:border-[var(--gaia-contrast-bg)]"
                        onClick={() => startEdit(acc)}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="rounded-full border border-rose-500/40 px-2 py-1 text-rose-200 hover:border-rose-400"
                        onClick={() => handleDelete(acc.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {state.accounts.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="py-4 text-center text-xs gaia-muted"
                  >
                    No accounts defined yet. In Week 6+ you&apos;ll be able to
                    wire in your real map here.
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
