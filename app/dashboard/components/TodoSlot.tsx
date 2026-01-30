// app/Dashboard/components/TodoSlot.tsx
"use client";

import { useMemo, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  HeartAddIcon,
  Briefcase02Icon,
  GameController02Icon,
  Delete02Icon,
  CheckmarkCircle02Icon,
  Forward02Icon,
  Calendar02Icon,
} from "@hugeicons/core-free-icons";
import type { Category, SlotState, Task } from "../hooks/useTodoDaily";
import TodoQuickAdd from "./TodoQuickAdd";
import { todayKey } from "@/utils/dates";

type Props = {
  category: Category;
  task: Task | null;
  state: SlotState;
  completedTitle?: string;
  completedDueDate?: string | null;
  today: string;
  onDone: (c: Category) => void;
  onSkip: (c: Category) => void;
  onQuickAdd: (
    c: Category,
    title: string,
    note?: string,
    priority?: 1 | 2 | 3,
    pinned?: boolean
  ) => void;
  onDelete: (taskId: string) => void;
  onEdit: (
    taskId: string,
    patch: Partial<
      Pick<
        Task,
        "title" | "note" | "priority" | "pinned" | "due_date" | "repeat"
      >
    >
  ) => void;
};

export default function TodoSlot(props: Props) {
  const {
    category,
    task: rawTask,
    state: rawState,
    completedTitle,
    completedDueDate,
    today,
    onDone,
    onSkip,
    onQuickAdd,
    onDelete,
    onEdit,
  } = props;
  const [showAdd, setShowAdd] = useState(false);
  const dueDate = rawTask?.due_date ?? completedDueDate ?? null;
  const hasDate = !!dueDate || !!completedTitle;
  const task = hasDate ? rawTask : null;
  const state: SlotState = hasDate ? rawState : "idle";
  const calendarToday = useMemo(() => todayKey(), []);
  const dueLabel = dueDate ? formatDueBadge(dueDate, calendarToday) : null;

  return (
    <div
      className={`rounded-xl border border-[var(--gaia-border)] bg-[var(--gaia-surface)] p-5 shadow-sm transition-all duration-300 hover:shadow-lg hover:border-[var(--gaia-border)]/60 min-h-[18rem] max-h-[18rem] flex flex-col overflow-hidden`}
    >
      <div className="mb-4 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="transition-transform duration-200 hover:scale-110">
            {categoryIcon(category)}
          </div>
          <span className={`font-bold text-lg text-[var(--gaia-text-strong)]`}>
            {labelOf(category)}
          </span>
          {dueLabel && (
            <span className="inline-flex items-center gap-1 rounded-md bg-[var(--gaia-border)] px-2 py-1 text-xs font-medium text-[var(--gaia-text-muted)]">
              <HugeiconsIcon icon={Calendar02Icon} size={14} className="transition-transform hover:scale-110" /> {dueLabel}
            </span>
          )}
        </div>
      </div>

      {state === "pending" && task ? (
        <div className="flex flex-col flex-1 min-h-0">
          <div className="mb-4 flex-1 min-h-0 overflow-hidden">
            <div className="mb-3 line-clamp-2 text-lg font-bold text-[var(--gaia-text-strong)] leading-relaxed">
              {task.title}
            </div>
            {task.note && (
              <p className="text-sm text-[var(--gaia-text-muted)] line-clamp-2 mt-2">
                {task.note}
              </p>
            )}
          </div>
          <div className="flex flex-col gap-2 flex-shrink-0 pt-2">
            <div className="flex items-center justify-around gap-3">
              <button
                className={`group relative flex items-center justify-center w-12 h-12 rounded-full border-2 border-red-500/60 bg-red-500/10 text-red-500 transition-all duration-300 hover:bg-red-500 hover:text-white hover:border-red-500 hover:scale-110 hover:shadow-lg active:scale-95`}
                onClick={() => onDelete(task.id)}
                title="Delete task"
              >
                <HugeiconsIcon 
                  icon={Delete02Icon} 
                  size={20} 
                  className="transition-all duration-300 group-hover:rotate-12" 
                />
              </button>
              <button
                className={`group relative flex items-center justify-center w-12 h-12 rounded-full border-2 border-amber-500/60 bg-amber-500/10 text-amber-500 transition-all duration-300 hover:bg-amber-500 hover:text-white hover:border-amber-500 hover:scale-110 hover:shadow-lg active:scale-95`}
                onClick={() => onSkip(category)}
                title="Skip this task"
              >
                <HugeiconsIcon
                  icon={Forward02Icon}
                  size={20}
                  className="transition-all duration-300 group-hover:translate-x-0.5 group-hover:scale-110"
                />
              </button>
              <button
                className={`group relative flex items-center justify-center w-12 h-12 rounded-full border-2 border-green-500/60 bg-green-500/10 text-green-500 transition-all duration-300 hover:bg-green-500 hover:text-white hover:border-green-500 hover:scale-110 hover:shadow-lg active:scale-95`}
                onClick={() => onDone(category)}
                title="Mark as done"
              >
                <HugeiconsIcon
                  icon={CheckmarkCircle02Icon}
                  size={20}
                  className="transition-all duration-300 group-hover:scale-125 group-hover:rotate-12"
                />
              </button>
            </div>
          </div>
        </div>
      ) : state === "done" ? (
        <div className="flex min-h-12 mt-12 flex-col items-center justify-center rounded-xl border-2 border-green-500/30 bg-green-500/10 px-4 py-6 text-center transition-all duration-300 hover:border-green-500/50 hover:bg-green-500/15">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-green-500/20 px-4 py-2 text-sm font-semibold text-green-600 dark:text-green-400">
            <HugeiconsIcon icon={CheckmarkCircle02Icon} size={20} className="transition-transform hover:scale-110" />
            Done
          </div>
          <p className="text-lg font-semibold text-[var(--gaia-text-strong)]">
            {completedTitle ?? "All done!"}
          </p>
          <p className="mt-2 text-sm text-[var(--gaia-text-muted)]">
            We'll surface tomorrow's tasks automatically.
          </p>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center min-h-[12rem]">
          <div className="mb-4 py-2 text-center text-sm text-[var(--gaia-text-muted)]">
            {labelOf(category)} — No task today
          </div>
          {!showAdd ? (
            <button
              className="group w-full rounded-lg bg-[var(--gaia-contrast-bg)] px-4 py-3 font-semibold text-[var(--gaia-contrast-text)] transition-all duration-300 hover:opacity-90 hover:shadow-md hover:scale-[1.02] active:scale-[0.98]"
              onClick={() => setShowAdd(true)}
            >
              <span className="inline-flex items-center gap-2">
                <span className="text-lg transition-transform group-hover:scale-125">+</span>
                Quick Add
              </span>
            </button>
          ) : (
            <TodoQuickAdd
              category={category}
              onAdd={onQuickAdd}
              onClose={() => setShowAdd(false)}
            />
          )}
        </div>
      )}
    </div>
  );
}

function labelOf(c: Category) {
  if (c === "life") return "Life";
  if (c === "work") return "Work";
  return "Distraction";
}

function formatShortDate(dateStr?: string | null) {
  if (!dateStr) return "Unscheduled";
  try {
    const date = new Date(dateStr + "T00:00:00Z");
    if (Number.isNaN(date.getTime())) return dateStr;
    return new Intl.DateTimeFormat("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(date);
  } catch {
    return dateStr;
  }
}

function formatDueBadge(dateStr?: string | null, todayStr?: string) {
  if (!dateStr) return "Unscheduled";
  const today = todayStr ?? todayKey();
  const parse = (value: string) => {
    const [y, m, d] = value.split("-").map(Number);
    return Date.UTC(y, (m ?? 1) - 1, d ?? 1);
  };
  const todayMs = parse(today);
  const targetMs = parse(dateStr);
  const diff = Math.round((targetMs - todayMs) / 86400000);
  if (diff === 0) return "Today";
  if (diff === 1) return "Tomorrow";
  if (diff === -1) return "Yesterday";
  return formatShortDate(dateStr);
}

function categoryIcon(c: Category) {
  if (c === "life")
    return (
      <HugeiconsIcon 
        icon={HeartAddIcon} 
        size={22} 
        color="#14b8a6" 
        className="transition-all duration-300 hover:scale-125 hover:drop-shadow-lg"
      />
    );
  if (c === "work")
    return (
      <HugeiconsIcon 
        icon={Briefcase02Icon} 
        size={22} 
        color="#6366f1"
        className="transition-all duration-300 hover:scale-125 hover:drop-shadow-lg"
      />
    );
  return (
    <HugeiconsIcon 
      icon={GameController02Icon} 
      size={22} 
      color="#f59e0b"
      className="transition-all duration-300 hover:scale-125 hover:drop-shadow-lg"
    />
  );
}
