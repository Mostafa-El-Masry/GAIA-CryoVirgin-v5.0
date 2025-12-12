import type { Category } from "../../dashboard/hooks/useTodoDaily";

export type StatusTone = "pending" | "done" | "skipped";
export type StatusResolution = { label: string; tone: StatusTone; dateLabel: string };
export type DragState = { id: string; category: Category } | null;
export type DropTarget = {
  category: Category;
  id: string | null;
  position: "before" | "after";
} | null;
export type SortMode = "latest" | "oldest";
