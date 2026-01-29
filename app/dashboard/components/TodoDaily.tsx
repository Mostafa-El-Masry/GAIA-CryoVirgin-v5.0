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

  useEffect(() => {
    setQuickDueDate(today);
  }, [today]);

  const [quickCategory, setQuickCategory] = useState<Category>("life");
  const [quickTitle, setQuickTitle] = useState("");
  const [quickDueDate, setQuickDueDate] = useState<string>(today);
  const allDone = useMemo(
    () =>
      (["life", "work", "distraction"] as Category[]).every(
        (cat) => slotInfo[cat]?.state === "done"
      ),
    [slotInfo]
  );

  return (
    <section className="rounded-2xl border border-[var(--gaia-border)] bg-[var(--gaia-surface-soft)] p-6 shadow-lg">
      <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-[var(--gaia-border)] pb-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-xl font-bold text-[var(--gaia-text-strong)]">
            Daily Focus
          </h2>
          <p className="text-sm text-[var(--gaia-text-muted)]">
            {formatShortDate(today)} · Asia/Kuwait
          </p>
        </div>
        <div className="flex flex-col items-start gap-2 sm:items-end sm:text-right">
          {allDone && (
            <button
              className="group rounded-lg border border-[var(--gaia-border)] bg-[var(--gaia-surface)] px-4 py-2 text-sm font-semibold text-[var(--gaia-text-default)] transition-all hover:bg-[var(--gaia-border)]/40 hover:shadow-sm"
              onClick={advanceToNextDay}
            >
              <span className="inline-flex items-center gap-2">
                Next day
                <span className="transition-transform group-hover:translate-x-1">→</span>
              </span>
            </button>
          )}
          <Link
            href="/TODO"
            className="text-sm font-medium text-[var(--gaia-link)] transition-all hover:underline hover:text-[var(--gaia-link)]/80"
          >
            View full list →
          </Link>
        </div>
      </header>

      <form
        className="mb-6 flex flex-wrap items-center gap-3 rounded-xl border border-[var(--gaia-border)] bg-[var(--gaia-surface)] px-4 py-3 shadow-sm transition-shadow hover:shadow-md"
        onSubmit={(e) => {
          e.preventDefault();
          const title = quickTitle.trim();
          if (!title) return;
          addQuickTask(quickCategory, title, undefined, 2, false, quickDueDate || undefined);
          setQuickTitle("");
          setQuickDueDate(today);
        }}
      >
        <select
          className="rounded-lg border border-[var(--gaia-border)] bg-[var(--gaia-surface-soft)] px-3 py-2 text-sm font-medium text-[var(--gaia-text-default)] transition-colors hover:border-[var(--gaia-contrast-bg)]/50 focus:border-[var(--gaia-contrast-bg)] focus:outline-none focus:ring-2 focus:ring-[var(--gaia-contrast-bg)]/20"
          value={quickCategory}
          onChange={(e) => setQuickCategory(e.target.value as Category)}
        >
          <option value="life">Life</option>
          <option value="work">Work</option>
          <option value="distraction">Distraction</option>
        </select>
        <input
          type="date"
          className="rounded-lg border border-[var(--gaia-border)] bg-[var(--gaia-surface-soft)] px-3 py-2 text-sm text-[var(--gaia-text-default)] transition-colors focus:border-[var(--gaia-contrast-bg)] focus:outline-none focus:ring-2 focus:ring-[var(--gaia-contrast-bg)]/20"
          value={quickDueDate}
          onChange={(e) => setQuickDueDate(e.target.value)}
          title="Due date"
        />
        <input
          className="min-w-[200px] flex-1 rounded-lg border border-[var(--gaia-border)] bg-[var(--gaia-surface-soft)] px-3 py-2 text-sm text-[var(--gaia-text-default)] placeholder-[var(--gaia-text-muted)] transition-colors focus:border-[var(--gaia-contrast-bg)] focus:outline-none focus:ring-2 focus:ring-[var(--gaia-contrast-bg)]/20"
          placeholder="Quick add a task..."
          value={quickTitle}
          onChange={(e) => setQuickTitle(e.target.value)}
        />
        <button
          type="submit"
          className="rounded-lg bg-[var(--gaia-contrast-bg)] px-4 py-2 text-sm font-semibold text-[var(--gaia-contrast-text)] transition-all hover:opacity-90 hover:shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
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
