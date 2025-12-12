// app/TODO/modules/DuePicker.tsx
"use client";

import { useRef } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Calendar02Icon } from "@hugeicons/core-free-icons";
import { formatFriendlyDate } from "./utils";

type DuePickerProps = {
  value: string;
  min?: string;
  max?: string;
  onChange: (next: string) => void;
};

export function DuePicker({ value, min, max, onChange }: DuePickerProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const label = formatFriendlyDate(value) ?? "Unscheduled";
  return (
    <div className="flex items-center gap-2">
      <input
        ref={inputRef}
        type="date"
        lang="en-GB"
        className="sr-only"
        value={value}
        min={min}
        max={max}
        onChange={(e) => onChange(e.target.value)}
      />
      <button
        type="button"
        className="inline-flex items-center gap-2 rounded-lg bg-[var(--gaia-surface)] px-2.5 py-1.5 text-xs font-semibold text-[var(--gaia-text-default)] transition hover:ring-1 hover:ring-[var(--gaia-contrast-bg)]"
        onClick={() => {
          const el = inputRef.current;
          if (!el) return;
          if (typeof (el as any).showPicker === "function") {
            (el as any).showPicker();
          } else {
            el.focus();
            el.click();
          }
        }}
        aria-label="Edit due date"
      >
        <HugeiconsIcon icon={Calendar02Icon} size={14} color="var(--gaia-text-default)" />
        <span>{label}</span>
      </button>
    </div>
  );
}
