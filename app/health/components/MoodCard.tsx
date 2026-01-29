import type { FC, FormEvent } from "react";
import { useState, useEffect } from "react";
import DaySnapshotCard from "./DaySnapshotCard";

interface MoodCardProps {
  rating: number | null;
  note?: string;
  onSave: (rating: number, note: string) => void;
}

const MoodCard: FC<MoodCardProps> = ({ rating, note, onSave }) => {
  const [selected, setSelected] = useState<number>(rating ?? 0);
  const [draftNote, setDraftNote] = useState<string>(note ?? "");

  useEffect(() => {
    setSelected(rating ?? 0);
  }, [rating]);

  useEffect(() => {
    setDraftNote(note ?? "");
  }, [note]);

  const value = rating == null ? "--/5" : `${rating}/5`;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!selected || selected < 1 || selected > 5) return;
    onSave(selected, draftNote.trim());
  };

  return (
    <DaySnapshotCard
      title="Mood"
      value={value}
      subtitle="Simple daily mood + short note."
      footer={
        <form onSubmit={handleSubmit} className="flex flex-col items-center gap-3">
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setSelected(n)}
                className={`flex h-9 w-9 items-center justify-center rounded-full border text-sm transition-colors ${
                  selected === n
                    ? "border-[var(--gaia-contrast-bg)] bg-[var(--gaia-contrast-bg)]/15 text-[var(--gaia-text-strong)]"
                    : "gaia-border bg-[var(--gaia-surface-soft)] text-[var(--gaia-text-default)]"
                }`}
              >
                {n}
              </button>
            ))}
          </div>
          <input
            type="text"
            value={draftNote}
            onChange={(e) => setDraftNote(e.target.value)}
            placeholder="Short mood note"
            className="gaia-input gaia-focus w-full rounded-lg px-3 py-2 text-sm"
          />
          <button
            type="submit"
            className="health-button w-full md:w-auto px-5 py-2 text-xs font-semibold md:text-sm"
          >
            Save mood
          </button>
        </form>
      }
    />
  );
};

export default MoodCard;
