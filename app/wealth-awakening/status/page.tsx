"use client";

import { useEffect, useState } from "react";
import type { WealthState } from "../lib/types";
import { loadWealthState } from "../lib/wealthStore";
import { hasSupabaseConfig, fetchRemoteWealthAll } from "../lib/remoteWealth";

type RemoteStatus =
  | { mode: "not-configured" }
  | { mode: "checking" }
  | { mode: "ok"; state: WealthState }
  | { mode: "error"; message: string };

const surface =
  "rounded-2xl border border-slate-800 bg-slate-900/80 shadow-[0_18px_60px_rgba(0,0,0,0.45)]";

function countSummary(state: WealthState | null) {
  if (!state) {
    return { accounts: 0, instruments: 0, flows: 0 };
  }
  return {
    accounts: state.accounts.length,
    instruments: state.instruments.length,
    flows: state.flows.length,
  };
}

export default function WealthStatusPage() {
  const [localState, setLocalState] = useState<WealthState | null>(null);
  const [remoteStatus, setRemoteStatus] = useState<RemoteStatus>(
    hasSupabaseConfig() ? { mode: "checking" } : { mode: "not-configured" },
  );
  const [checkedAt, setCheckedAt] = useState<string | null>(null);

  useEffect(() => {
    const local = loadWealthState();
    setLocalState(local);
  }, []);

  async function handleCheckRemote() {
    if (!hasSupabaseConfig()) {
      setRemoteStatus({
        mode: "error",
        message: "Supabase is not configured on this client.",
      });
      return;
    }

    setRemoteStatus({ mode: "checking" });
    setCheckedAt(new Date().toLocaleString());

    const remote = await fetchRemoteWealthAll();
    if (!remote) {
      setRemoteStatus({
        mode: "error",
        message: "GAIA could not fetch Wealth data from Supabase. Check URL, anon key, and tables.",
      });
      return;
    }

    setRemoteStatus({ mode: "ok", state: remote });
  }

  const localCounts = countSummary(localState);
  const remoteCounts =
    remoteStatus.mode === "ok" ? countSummary(remoteStatus.state) : null;

  const rowsMatch =
    remoteCounts &&
    remoteCounts.accounts === localCounts.accounts &&
    remoteCounts.instruments === localCounts.instruments &&
    remoteCounts.flows === localCounts.flows;

  return (
    <main className="mx-auto max-w-6xl space-y-6 px-4 py-8 text-slate-100">
      <header className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-300/80">
            Wall Street Drive
          </p>
          <h1 className="mt-1 text-3xl font-semibold text-white">Wealth data status</h1>
          <p className="mt-2 max-w-3xl text-sm text-slate-300">
            A small diagnostics screen showing what GAIA sees in your local Wealth cache and, if
            configured, in Supabase.
          </p>
        </div>
      </header>

      <section className="grid gap-4 md:grid-cols-2">
        <article className={`${surface} p-4`}>
          <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Local cache
          </h2>
          <p className="mt-1 text-xs text-slate-300">
            Stored under{" "}
            <code className="rounded bg-slate-800 px-1 py-0.5 text-slate-200">
              gaia_wealth_awakening_state_v1
            </code>{" "}
            in your browser.
          </p>
          <dl className="mt-3 space-y-1 text-xs text-slate-200">
            <div className="flex items-center justify-between gap-2">
              <dt>Accounts</dt>
              <dd className="font-semibold text-white">{localCounts.accounts}</dd>
            </div>
            <div className="flex items-center justify-between gap-2">
              <dt>Investments</dt>
              <dd className="font-semibold text-white">{localCounts.instruments}</dd>
            </div>
            <div className="flex items-center justify-between gap-2">
              <dt>Flows</dt>
              <dd className="font-semibold text-white">{localCounts.flows}</dd>
            </div>
          </dl>
          <p className="mt-3 text-[11px] text-slate-400">
            Local data is always the first source GAIA uses, even when Supabase is offline.
          </p>
        </article>

        <article className={`${surface} p-4`}>
          <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Supabase
          </h2>

          {remoteStatus.mode === "not-configured" && (
            <p className="mt-2 text-xs text-slate-300">
              Supabase is not configured on this client. Set{" "}
              <code className="rounded bg-slate-800 px-1 py-0.5 text-slate-200">
                NEXT_PUBLIC_SUPABASE_URL
              </code>{" "}
              and{" "}
              <code className="rounded bg-slate-800 px-1 py-0.5 text-slate-200">
                NEXT_PUBLIC_SUPABASE_ANON_KEY
              </code>{" "}
              in your <code>.env.local</code>, then reload.
            </p>
          )}

          {remoteStatus.mode === "checking" && (
            <p className="mt-2 text-xs text-slate-300">
              Checking Supabase tables for Wealth data...
            </p>
          )}

          {remoteStatus.mode === "error" && (
            <p className="mt-2 text-xs text-rose-300">{remoteStatus.message}</p>
          )}

          {remoteStatus.mode === "ok" && remoteCounts && (
            <>
              <dl className="mt-3 space-y-1 text-xs text-slate-200">
                <div className="flex items-center justify-between gap-2">
                  <dt>Accounts</dt>
                  <dd className="font-semibold text-white">{remoteCounts.accounts}</dd>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <dt>Investments</dt>
                  <dd className="font-semibold text-white">{remoteCounts.instruments}</dd>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <dt>Flows</dt>
                  <dd className="font-semibold text-white">{remoteCounts.flows}</dd>
                </div>
              </dl>
              <p className="mt-3 text-[11px] text-slate-400">
                Last check: {checkedAt || "just now"}.
              </p>
              {rowsMatch ? (
                <p className="mt-1 text-[11px] font-semibold text-emerald-200">
                  Local and Supabase row counts match for all Wealth tables.
                </p>
              ) : (
                <p className="mt-1 text-[11px] font-semibold text-amber-200">
                  Row counts differ between local and Supabase. This can happen while edits are in
                  progress; GAIA will gradually sync them.
                </p>
              )}
            </>
          )}

          <button
            type="button"
            onClick={handleCheckRemote}
            className="mt-3 inline-flex items-center justify-center rounded-full bg-emerald-500 px-4 py-2 text-xs font-semibold text-black shadow-lg shadow-emerald-500/30 transition hover:bg-emerald-400"
          >
            Check Supabase now
          </button>
        </article>
      </section>
    </main>
  );
}
