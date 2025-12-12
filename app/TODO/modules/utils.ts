import type { Task } from "../../dashboard/hooks/useTodoDaily";
import type { SortMode } from "./types";

const KUWAIT_TZ = "Asia/Kuwait";

export function formatShortDate(value?: string | null) {
  if (!value || value === "Unscheduled") return value ?? "Unscheduled";
  try {
    const date = new Date(value + "T00:00:00Z");
    if (Number.isNaN(date.getTime())) return value;
    const dd = String(date.getUTCDate()).padStart(2, "0");
    const mm = String(date.getUTCMonth() + 1).padStart(2, "0");
    const yyyy = date.getUTCFullYear();
    return `${dd} ${mm} ${yyyy}`;
  } catch {
    return value;
  }
}

export function formatFriendlyDate(value?: string | null) {
  if (!value || value === "Unscheduled") return value ?? "Unscheduled";
  try {
    const date = new Date(value + "T00:00:00Z");
    if (Number.isNaN(date.getTime())) return value;
    const dd = String(date.getUTCDate()).padStart(2, "0");
    const month = new Intl.DateTimeFormat("en-GB", {
      month: "short",
      timeZone: "UTC",
    }).format(date);
    const yyyy = date.getUTCFullYear();
    return `${dd} ${month} ${yyyy}`;
  } catch {
    return value;
  }
}

export function parseDate(value?: string | null) {
  if (!value) return null;
  const d = new Date(`${value}T00:00:00`);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function todayInput(): string {
  return new Date().toISOString().slice(0, 10);
}

export function todayInTZ(tz: string = KUWAIT_TZ): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: tz,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const y = parts.find((p) => p.type === "year")?.value ?? "0000";
  const m = parts.find((p) => p.type === "month")?.value ?? "01";
  const d = parts.find((p) => p.type === "day")?.value ?? "01";
  return `${y}-${m}-${d}`;
}

export function compareBySortMode(a: Task, b: Task, mode: SortMode) {
  const ad = parseDate(a.due_date);
  const bd = parseDate(b.due_date);
  if (ad && bd && ad.getTime() !== bd.getTime()) {
    return mode === "latest" ? bd.getTime() - ad.getTime() : ad.getTime() - bd.getTime();
  }
  if (ad && !bd) return -1;
  if (bd && !ad) return 1;
  return mode === "latest"
    ? b.created_at.localeCompare(a.created_at)
    : a.created_at.localeCompare(b.created_at);
}

export function sortTasksByMode(tasks: Task[], mode: SortMode) {
  return tasks.slice().sort((a, b) => compareBySortMode(a, b, mode));
}
