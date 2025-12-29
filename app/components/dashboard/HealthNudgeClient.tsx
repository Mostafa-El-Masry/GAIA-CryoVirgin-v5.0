"use client";

import React, { useEffect, useState } from "react";

interface HealthSummary {
  date: string;
  totalWaterMl: number;
  totalWalkMinutes: number;
  sleepState: "unknown" | "asleep" | "awake";
}

interface HealthApiResponse {
  ok: boolean;
  summary?: HealthSummary;
  error?: string;
}

interface HealthNudgeClientProps {
  className?: string;
}

// GAIA Level 3 – Dashboard Pulse
// Version 4.2 · Week 2
//
// HealthNudgeClient
// ------------------
// Small floating client component that gently nudges you near the end
// of the day if there are *no* water or walking records yet.
//
// Behaviour:
//   - Runs only on the client, after mount.
//   - If local time is before 20:00 → does nothing.
//   - If localStorage has 'gaia_health_nudge_<YYYY-MM-DD>' → does nothing.
//   - Otherwise calls GET /api/dashboard/health.
//   - If water == 0 → shows a water nudge.
//   - Else if walk == 0 → shows a walk nudge.
//   - After you choose any action (log or "Skip for today") or close
//     the nudge, it sets localStorage for that date so it will not
//     nag you again on the same day.
//
// Writes go through /api/dashboard/health POST with the same actions
// used by HealthQuickCard, plus 'water_skip' / 'walk_skip' for an
// explicit "No, I didn't" that Guardian can see (status = 'skipped').

type NudgeKind = "water" | "walk";

const HealthNudgeClient: React.FC<HealthNudgeClientProps> = ({
  className = "",
}) => {
  const [visible, setVisible] = useState(false);
  const [kind, setKind] = useState<NudgeKind | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const [summary, setSummary] = useState<HealthSummary | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const run = async () => {
      try {
        const now = new Date();
        const hour = now.getHours();
        if (hour < 20) {
          setLoading(false);
          return;
        }
        const dateKey = now.toISOString().slice(0, 10);
        const lsKey = `gaia_health_nudge_${dateKey}`;
        const flag = window.localStorage.getItem(lsKey);
        if (flag) {
          // Already answered/dismissed today
          setLoading(false);
          return;
        }

        const res = await fetch("/api/dashboard/health");
        const data = (await res.json()) as HealthApiResponse;
        if (!data.ok || !data.summary) {
          throw new Error(data.error || "Failed to load health summary.");
        }

        setSummary(data.summary);

        let nextKind: NudgeKind | null = null;
        if (data.summary.totalWaterMl <= 0) {
          nextKind = "water";
        } else if (data.summary.totalWalkMinutes <= 0) {
          nextKind = "walk";
        }

        if (nextKind) {
          setKind(nextKind);
          setVisible(true);
        }
      } catch (err: any) {
        console.warn("[Dashboard] HealthNudgeClient error", err);
        setError(err?.message ?? "Failed to evaluate health nudge.");
      } finally {
        setLoading(false);
      }
    };

    run();
  }, []);

  const persistFlag = (value: string) => {
    if (typeof window === "undefined") return;
    const dateKey = new Date().toISOString().slice(0, 10);
    const lsKey = `gaia_health_nudge_${dateKey}`;
    try {
      window.localStorage.setItem(lsKey, value);
    } catch {
      // ignore
    }
  };

  const close = () => {
    persistFlag("dismissed");
    setVisible(false);
  };

  const finishAndClose = (msg: string) => {
    setMessage(msg);
    persistFlag("done");
    window.setTimeout(() => {
      setVisible(false);
    }, 2600);
  };

  const runAction = async (action: string, msg: string) => {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/dashboard/health", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const data = (await res.json()) as HealthApiResponse;
      if (!data.ok || !data.summary) {
        throw new Error(data.error || "Action failed.");
      }
      setSummary(data.summary);
      finishAndClose(msg);
    } catch (err: any) {
      setError(err?.message ?? "Action failed.");
    } finally {
      setBusy(false);
    }
  };

  if (!visible || !kind) {
    return null;
  }

  const isWater = kind === "water";

  const rootClasses =
    "hidden sm:flex fixed bottom-4 right-4 z-40 max-w-sm rounded-xl border bg-black/90 " +
    "border-sky-800/70 shadow-lg backdrop-blur px-3 py-3 text-[11px] text-zinc-100 " +
    "flex flex-col gap-2 ";

  const title = isWater
    ? "No water logged yet today."
    : "No walking logged yet today.";

  const body = isWater
    ? "Did you drink water today? You can log it now or skip if today was really dry."
    : "Did you walk today? You can log a small amount or tell me it was a full rest day.";

  return (
    <div className={`${rootClasses} ${className}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="space-y-1">
          <p className="text-[10px] uppercase tracking-[0.18em] text-sky-300">
            Dashboard · Nudge
          </p>
          <p className="text-[11px] font-semibold">{title}</p>
          <p className="text-[11px] opacity-80">{body}</p>
        </div>
        <button
          type="button"
          onClick={close}
          className="ml-2 inline-flex h-6 w-6 items-center justify-center rounded-full border border-white/20 text-[11px] opacity-70 hover:opacity-100"
        >
          ×
        </button>
      </div>

      {error && <p className="text-[11px] text-red-400">{error}</p>}

      {message && !error && (
        <p className="text-[11px] text-emerald-300">{message}</p>
      )}

      <div className="mt-1 flex flex-wrap gap-2">
        {isWater ? (
          <>
            <button
              type="button"
              onClick={() =>
                runAction("water_250", "Nice, 250ml logged for today. 💧")
              }
              disabled={busy}
              className="inline-flex items-center justify-center rounded-md border border-sky-500/70 px-2.5 py-1 font-medium hover:bg-sky-500/10 disabled:opacity-60"
            >
              + 250 ml
            </button>
            <button
              type="button"
              onClick={() =>
                runAction(
                  "water_500",
                  "500ml logged. Your body is safer now. 💧"
                )
              }
              disabled={busy}
              className="inline-flex items-center justify-center rounded-md border border-sky-500/70 px-2.5 py-1 font-medium hover:bg-sky-500/10 disabled:opacity-60"
            >
              + 500 ml
            </button>
            <button
              type="button"
              onClick={() =>
                runAction(
                  "water_skip",
                  "Okay, I will remember today as a dry day, not a forgotten day."
                )
              }
              disabled={busy}
              className="inline-flex items-center justify-center rounded-md border border-zinc-500/60 px-2.5 py-1 font-medium hover:bg-zinc-500/10 disabled:opacity-60"
            >
              Skip for today
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={() =>
                runAction(
                  "walk_15",
                  "15 minutes logged. Future you can move more freely. 🚶‍♀️"
                )
              }
              disabled={busy}
              className="inline-flex items-center justify-center rounded-md border border-sky-500/70 px-2.5 py-1 font-medium hover:bg-sky-500/10 disabled:opacity-60"
            >
              + 15 min
            </button>
            <button
              type="button"
              onClick={() =>
                runAction(
                  "walk_30",
                  "30 minutes logged. That’s a strong signal for your heart. 🚶‍♀️"
                )
              }
              disabled={busy}
              className="inline-flex items-center justify-center rounded-md border border-sky-500/70 px-2.5 py-1 font-medium hover:bg-sky-500/10 disabled:opacity-60"
            >
              + 30 min
            </button>
            <button
              type="button"
              onClick={() =>
                runAction(
                  "walk_skip",
                  "Rest days are also allowed. I will remember that you chose to rest."
                )
              }
              disabled={busy}
              className="inline-flex items-center justify-center rounded-md border border-zinc-500/60 px-2.5 py-1 font-medium hover:bg-zinc-500/10 disabled:opacity-60"
            >
              Skip for today
            </button>
          </>
        )}
      </div>

      {summary && (
        <p className="mt-1 text-[10px] opacity-60">
          Today so far · Water: {(summary.totalWaterMl / 1000).toFixed(2)} L ·
          Walk: {summary.totalWalkMinutes} min
        </p>
      )}
    </div>
  );
};

export default HealthNudgeClient;
