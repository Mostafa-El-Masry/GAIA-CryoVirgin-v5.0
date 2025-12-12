// app/TODO/modules/TaskDraggable.tsx
"use client";

import { useEffect, useRef } from "react";
import type { ReactNode } from "react";
import { draggable, dropTargetForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import type { Category, Task } from "../../dashboard/hooks/useTodoDaily";
import type { DragState, DropTarget } from "./types";

type TaskDraggableProps = {
  task: Task;
  category: Category;
  className?: string;
  onReorder: (
    category: Category,
    sourceId: string,
    targetId: string | null,
    position: "before" | "after"
  ) => void;
  setDragging: (state: DragState) => void;
  setDropTarget: (state: DropTarget) => void;
  children: ReactNode;
};

export function TaskDraggable({
  task,
  category,
  className,
  onReorder,
  setDragging,
  setDropTarget,
  children,
}: TaskDraggableProps) {
  const ref = useRef<HTMLLIElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const cleanupDraggable = draggable({
      element: el,
      getInitialData: () => ({ taskId: task.id, category }),
      onDragStart: () => setDragging({ id: task.id, category }),
      onDrop: () => {
        setDragging(null);
        setDropTarget(null);
      },
    });

    const cleanupDropTarget = dropTargetForElements({
      element: el,
      getData: ({ input }) => {
        if (!ref.current) return {};
        const { top, height } = ref.current.getBoundingClientRect();
        const before = input.clientY < top + height / 2;
        return {
          taskId: task.id,
          category,
          position: before ? "before" : "after",
        };
      },
      canDrop: ({ source }) =>
        (source.data as any)?.category === category &&
        (source.data as any)?.taskId !== task.id,
      onDragEnter: ({ self }) => {
        const pos = (self.data as any)?.position === "before" ? "before" : "after";
        setDropTarget({ id: task.id, category, position: pos });
      },
      onDragLeave: () => setDropTarget(null),
      onDrop: ({ source, self }) => {
        const sourceId = (source.data as any)?.taskId as string | undefined;
        const pos = (self.data as any)?.position === "before" ? "before" : "after";
        if (sourceId) {
          onReorder(category, sourceId, task.id, pos);
        }
        setDropTarget(null);
      },
    });

    return () => {
      cleanupDraggable();
      cleanupDropTarget();
    };
  }, [task.id, category, onReorder, setDragging, setDropTarget]);

  return (
    <li ref={ref} className={className}>
      {children}
    </li>
  );
}
