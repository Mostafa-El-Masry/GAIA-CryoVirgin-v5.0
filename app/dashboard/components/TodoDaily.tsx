// app/Dashboard/components/TodoDaily.tsx
"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useTodoDaily } from "../hooks/useTodoDaily";
import type { Category } from "../hooks/useTodoDaily";
import TodoSlot from "./TodoSlot";

export default function TodoDaily() {
  const [storageStatus, setStorageStatus] = useState({ synced: true, hasTasks: false });
  const {
    today,
    slotInfo,
    tasks,
    addQuickTask,
    markDone,
    skipTask,
    deleteTask,
    editTask,
    advanceToNextDay,
  } = useTodoDaily();

  useEffect(() => {
    setStorageStatus({ synced: true, hasTasks: tasks.length > 0 });
  }, [tasks]);

  const [quickCategory, setQuickCategory] = useState<Category>("life");
  const [quickTitle, setQuickTitle] = useState("");
  const allDone = useMemo(
    () =>
      (["life", "work", "distraction"] as Category[]).every(
        (cat) => slotInfo[cat]?.state === "done"
      ),
    [slotInfo]
  );

  return (
    <section className="rounded-2xl border border-[var(--gaia-border)] bg-[var(--gaia-surface-soft)] p-6 shadow-lg">
      <header className="mb-6 flex items-center justify-between border-b border-[var(--gaia-border)] pb-4">
        <div className="flex flex-col gap-1">
          <p className="text-sm text-[var(--gaia-text-muted)]">
            {formatShortDate(today)} · Asia/Kuwait
          </p>
          <p className="text-xs text-[var(--gaia-text-muted)]">
            {storageStatus.synced ? "Synced with Supabase" : "Syncing..."} · {storageStatus.hasTasks ? "Cloud copy" : "No tasks yet"}
          </p>
        </div>
        <div className="flex flex-col items-end gap-2 text-right">
          <span className="inline-block rounded-lg bg-[var(--gaia-contrast-bg)] px-3 py-1 text-sm font-semibold text-[var(--gaia-contrast-text)]">
            Today's Focus
          </span>
          {allDone && (
            <button
              className="rounded-full border border-[var(--gaia-border)] px-3 py-1 text-xs font-semibold text-[var(--gaia-text-default)] transition-colors hover:bg-[var(--gaia-border)]/40"
              onClick={advanceToNextDay}
            >
              Next day →
            </button>
          )}
          <Link
            href="/TODO"
            className="text-sm font-semibold text-[var(--gaia-link)] hover:underline"
          >
            View full list →
          </Link>
        </div>
      </header>

      <form
        className="mb-5 flex flex-wrap items-center gap-3 rounded-xl border border-[var(--gaia-border)] bg-[var(--gaia-surface)] px-4 py-3"
        onSubmit={(e) => {
          e.preventDefault();
          const title = quickTitle.trim();
          if (!title) return;
          addQuickTask(quickCategory, title);
          setQuickTitle("");
        }}
      >
        <select
          className="rounded-lg border border-[var(--gaia-border)] bg-[var(--gaia-surface-soft)] px-3 py-2 text-sm text-[var(--gaia-text-default)]"
          value={quickCategory}
          onChange={(e) => setQuickCategory(e.target.value as Category)}
        >
          <option value="life">Life</option>
          <option value="work">Work</option>
          <option value="distraction">Distraction</option>
        </select>
        <input
          className="min-w-[200px] flex-1 rounded-lg border border-[var(--gaia-border)] bg-[var(--gaia-surface-soft)] px-3 py-2 text-sm text-[var(--gaia-text-default)] placeholder-[var(--gaia-text-muted)] focus:border-[var(--gaia-contrast-bg)] focus:outline-none focus:ring-2 focus:ring-[var(--gaia-contrast-bg)]/20"
          placeholder="Quick add a task for today..."
          value={quickTitle}
          onChange={(e) => setQuickTitle(e.target.value)}
        />
        <button
          type="submit"
          className="rounded-lg bg-[var(--gaia-contrast-bg)] px-4 py-2 text-sm font-semibold text-[var(--gaia-contrast-text)] transition-opacity hover:opacity-90 disabled:opacity-60"
          disabled={!quickTitle.trim()}
        >
          Add
        </button>
      </form>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        <TodoSlot
          category="life"
          task={slotInfo.life.task}
          state={slotInfo.life.state}
          completedTitle={slotInfo.life.completedTitle}
          completedDueDate={slotInfo.life.completedDueDate}
          onDone={markDone}
          onSkip={skipTask}
          onQuickAdd={addQuickTask}
          onDelete={deleteTask}
          onEdit={editTask}
          today={today}
        />
        <TodoSlot
          category="work"
          task={slotInfo.work.task}
          state={slotInfo.work.state}
          completedTitle={slotInfo.work.completedTitle}
          completedDueDate={slotInfo.work.completedDueDate}
          onDone={markDone}
          onSkip={skipTask}
          onQuickAdd={addQuickTask}
          onDelete={deleteTask}
          onEdit={editTask}
          today={today}
        />
        <TodoSlot
          category="distraction"
          task={slotInfo.distraction.task}
          state={slotInfo.distraction.state}
          completedTitle={slotInfo.distraction.completedTitle}
          completedDueDate={slotInfo.distraction.completedDueDate}
          onDone={markDone}
          onSkip={skipTask}
          onQuickAdd={addQuickTask}
          onDelete={deleteTask}
          onEdit={editTask}
          today={today}
        />
      </div>
    </section>
  );
}

function formatShortDate(value?: string | null) {
  if (!value) return "";
  try {
    const date = new Date(value + "T00:00:00Z");
    if (Number.isNaN(date.getTime())) return value;
    return new Intl.DateTimeFormat("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(date);
  } catch {
    return value;
  }
}
