"use client";

import { useEffect, useMemo, useState } from "react";
import { useWealthUnlocks } from "../hooks/useWealthUnlocks";
import type { WealthFlow, WealthState } from "../lib/types";
import { loadWealthStateWithRemote, saveWealthStateWithRemote } from "../lib/wealthStore";
import { getTodayInKuwait } from "../lib/summary";

type PurchaseForm = {
  date: string;
  amount: string;
  currency: string;
  description: string;
};

const surface = "wealth-surface text-[var(--gaia-text-default)]";

const emptyForm: PurchaseForm = {
  date: "",
  amount: "",
  currency: "",
  description: "",
};

function normalizeDescription(value: string | undefined) {
  return (value ?? "").trim().toLowerCase();
}

function toMonthIndex(date: string): number | null {
  const [yearRaw, monthRaw] = date.split("-");
  const year = Number(yearRaw);
  const month = Number(monthRaw);
  if (!Number.isFinite(year) || !Number.isFinite(month) || month < 1 || month > 12) {
    return null;
  }
  return year * 12 + (month - 1);
}

function buildRecurringKey(flow: WealthFlow): string {
  const amountKey = Number.isFinite(flow.amount) ? flow.amount.toFixed(2) : "0.00";
  const currencyKey = flow.currency.trim().toUpperCase() || "KWD";
  const descriptionKey = normalizeDescription(flow.description) || "(no-desc)";
  return `${descriptionKey}__${amountKey}__${currencyKey}`;
}

function formatCurrency(value: number, currency: string) {
  if (!Number.isFinite(value)) return "-";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

function generateId(prefix: string): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now()}`;
}

export default function WealthPurchasesPage() {
  const { canAccess, stage, totalLessonsCompleted } = useWealthUnlocks();
  if (!canAccess("flows")) {
    return (
      <main className="mx-auto max-w-5xl space-y-4 px-4 py-8 text-[var(--gaia-text-default)]">
        <section className={`${surface} p-8`}>
          <h1 className="mb-2 text-xl font-semibold text-white">Purchases locked</h1>
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

  const [state, setState] = useState<WealthState | null>(null);
  const [form, setForm] = useState<PurchaseForm>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const s = await loadWealthStateWithRemote();
        setState(s);
      } catch (err: any) {
        setError(err?.message ?? "Failed to load purchases.");
      }
    };
    void load();
  }, []);

  const purchases = useMemo(() => {
    if (!state) return [];
    const expenseFlows = state.flows.filter((flow) => flow.kind === "expense");
    const monthlyKeys = new Set<string>();
    const monthsByKey = new Map<string, Set<number>>();

    for (const flow of expenseFlows) {
      const monthIndex = toMonthIndex(flow.date);
      if (monthIndex === null) continue;
      const key = buildRecurringKey(flow);
      const set = monthsByKey.get(key) ?? new Set<number>();
      set.add(monthIndex);
      monthsByKey.set(key, set);
    }

    for (const [key, months] of monthsByKey.entries()) {
      if (months.size >= 2) {
        monthlyKeys.add(key);
      }
    }

    return expenseFlows
      .filter((flow) => !monthlyKeys.has(buildRecurringKey(flow)))
      .slice()
      .sort((a, b) => (a.date > b.date ? -1 : a.date < b.date ? 1 : 0));
  }, [state]);

  const primaryCurrency =
    state?.accounts.find((a) => a.isPrimary)?.currency ||
    state?.accounts[0]?.currency ||
    purchases[0]?.currency ||
    "KWD";

  const totalSpent = useMemo(() => {
    return purchases.reduce((sum, flow) => sum + flow.amount, 0);
  }, [purchases]);

  function handleFormChange<K extends keyof PurchaseForm>(key: K, value: PurchaseForm[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function startEdit(flow: WealthFlow) {
    setEditingId(flow.id);
    setForm({
      date: flow.date,
      amount: String(flow.amount),
      currency: flow.currency,
      description: flow.description ?? "",
    });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(emptyForm);
    setError(null);
  }

  async function handleDelete(flowId: string) {
    if (!state) return;
    const next: WealthState = {
      ...state,
      flows: state.flows.filter((flow) => flow.id !== flowId),
    };
    setState(next);
    await saveWealthStateWithRemote(next);
    if (editingId === flowId) {
      cancelEdit();
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!state) return;
    setError(null);

    const amount = Number(form.amount);
    if (!Number.isFinite(amount) || amount <= 0) {
      setError("Amount must be a positive number.");
      return;
    }

    const date = form.date || getTodayInKuwait();
    const currency = form.currency.trim().toUpperCase() || primaryCurrency;
    const description = form.description.trim();

    let nextFlows = state.flows.slice();

    if (editingId) {
      const existing = nextFlows.find((flow) => flow.id === editingId);
      const payload: WealthFlow = {
        ...(existing ?? {
          id: editingId,
          accountId: null,
          instrumentId: null,
          kind: "expense",
          amount,
          currency,
          date,
        }),
        date,
        amount,
        currency,
        kind: "expense",
        description: description || undefined,
      };
      nextFlows = nextFlows.map((flow) => (flow.id === editingId ? payload : flow));
    } else {
      const payload: WealthFlow = {
        id: generateId("purchase"),
        date,
        accountId: null,
        instrumentId: null,
        kind: "expense",
        amount,
        currency,
        description: description || undefined,
      };
      nextFlows.push(payload);
    }

    const next: WealthState = { ...state, flows: nextFlows };
    setSaving(true);
    try {
      await saveWealthStateWithRemote(next);
      setState(next);
      setForm(emptyForm);
      setEditingId(null);
    } catch (err: any) {
      setError(err?.message ?? "Failed to save purchase.");
    } finally {
      setSaving(false);
    }
  }

  if (!state) {
    return (
      <main className="mx-auto max-w-5xl space-y-4 px-4 py-8 text-[var(--gaia-text-default)]">
        <section className={`${surface} p-6 text-sm gaia-muted`}>
          Loading your purchases...
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
            Purchases
          </h1>
          <p className="mt-2 max-w-3xl text-sm gaia-muted">
            Track day-to-day spending. Every purchase is stored as an expense flow so your wealth
            story stays accurate.
          </p>
        </div>
        <div className="text-right text-xs gaia-muted">
          <p>Total purchases: <span className="font-semibold text-[var(--gaia-text-strong)]">{purchases.length}</span></p>
          <p className="mt-1">
            Total spent:{" "}
            <span className="font-semibold text-[var(--gaia-text-strong)]">
              {formatCurrency(totalSpent, primaryCurrency)}
            </span>
          </p>
        </div>
      </header>

      <section className="grid gap-6 md:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <article className={`${surface} p-5 md:p-6`}>
          <h2 className="text-sm font-semibold text-[var(--gaia-text-strong)]">
            Purchase list
          </h2>
          <p className="mt-1 text-xs gaia-muted">
            Quick view of everything logged as a purchase (expense).
          </p>
          {error && <p className="mt-2 text-xs text-rose-300">{error}</p>}
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-left text-xs text-[var(--gaia-text-default)]">
              <thead>
                <tr className="border-b gaia-border text-[11px] uppercase tracking-wide text-[var(--gaia-text-muted)]">
                  <th className="py-2 pr-3">Date</th>
                  <th className="px-3 py-2">Purchase</th>
                  <th className="px-3 py-2 text-right">Amount</th>
                  <th className="px-3 py-2">Currency</th>
                  <th className="px-3 py-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {purchases.map((flow) => (
                  <tr key={flow.id} className="border-b gaia-border last:border-b-0">
                    <td className="py-2 pr-3 align-top text-[11px] gaia-muted">
                      {flow.date}
                    </td>
                    <td className="px-3 py-2 align-top text-[11px] text-[var(--gaia-text-default)]">
                      {flow.description || <span className="opacity-60">-</span>}
                    </td>
                    <td className="px-3 py-2 align-top text-right text-[11px] font-semibold text-[var(--gaia-text-strong)]">
                      {formatCurrency(flow.amount, flow.currency)}
                    </td>
                    <td className="px-3 py-2 align-top text-[11px] gaia-muted">
                      {flow.currency}
                    </td>
                    <td className="px-3 py-2 align-top text-right">
                      <div className="flex justify-end gap-2 text-[11px]">
                        <button
                          type="button"
                          className="rounded-full border gaia-border px-2 py-1 text-[var(--gaia-text-default)] hover:border-[var(--gaia-contrast-bg)]"
                          onClick={() => startEdit(flow)}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="rounded-full border border-rose-500/40 px-2 py-1 text-rose-200 hover:border-rose-400"
                          onClick={() => handleDelete(flow.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {purchases.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-4 text-center text-xs gaia-muted">
                      No purchases logged yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </article>

        <article className={`${surface} p-5 md:p-6`}>
          <h2 className="text-sm font-semibold text-[var(--gaia-text-strong)]">
            {editingId ? "Edit purchase" : "Add purchase"}
          </h2>
          <p className="mt-1 text-xs gaia-muted">
            Log a single purchase. This will show up in your monthly flows as an expense.
          </p>
          <form className="mt-4 space-y-3" onSubmit={handleSubmit}>
            <label className="block text-xs gaia-muted">
              Date
              <input
                type="date"
                value={form.date}
                onChange={(e) => handleFormChange("date", e.target.value)}
                className="mt-1 w-full rounded-xl border gaia-border bg-[var(--gaia-surface)] px-3 py-2 text-xs text-[var(--gaia-text-default)]"
              />
            </label>
            <label className="block text-xs gaia-muted">
              Purchase details
              <input
                type="text"
                value={form.description}
                onChange={(e) => handleFormChange("description", e.target.value)}
                className="mt-1 w-full rounded-xl border gaia-border bg-[var(--gaia-surface)] px-3 py-2 text-xs text-[var(--gaia-text-default)]"
                placeholder="Example: Groceries, Amazon, New monitor"
              />
            </label>
            <div className="flex gap-3">
              <label className="flex-1 text-xs gaia-muted">
                Amount
                <input
                  type="number"
                  step="0.01"
                  value={form.amount}
                  onChange={(e) => handleFormChange("amount", e.target.value)}
                  className="mt-1 w-full rounded-xl border gaia-border bg-[var(--gaia-surface)] px-3 py-2 text-xs text-[var(--gaia-text-default)]"
                  placeholder="0.00"
                />
              </label>
              <label className="w-24 text-xs gaia-muted">
                Currency
                <input
                  type="text"
                  value={form.currency}
                  onChange={(e) => handleFormChange("currency", e.target.value.toUpperCase())}
                  className="mt-1 w-full rounded-xl border gaia-border bg-[var(--gaia-surface)] px-3 py-2 text-xs text-[var(--gaia-text-default)]"
                  placeholder={primaryCurrency}
                />
              </label>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="submit"
                className="inline-flex items-center justify-center rounded-full border border-[var(--gaia-contrast-bg)]/60 bg-[var(--gaia-contrast-bg)]/12 px-4 py-2 text-xs font-semibold text-[var(--gaia-text-default)] transition hover:border-[var(--gaia-contrast-bg)] disabled:opacity-60"
                disabled={!form.amount || saving}
              >
                {saving ? (editingId ? "Saving..." : "Adding...") : editingId ? "Save changes" : "Add purchase"}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="rounded-full border gaia-border px-3 py-2 text-xs text-[var(--gaia-text-default)] hover:border-[var(--gaia-contrast-bg)]"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </article>
      </section>
    </main>
  );
}
