"use client";

import { useState } from "react";
import { updateMediaTitle } from "../lib/videoStore";
import { Pencil } from "lucide-react";

export function EditableTitle({
  mediaId,
  initialTitle,
}: {
  mediaId: string;
  initialTitle?: string;
}) {
  const [title, setTitle] = useState(initialTitle || "");
  const [editing, setEditing] = useState(false);

  const save = async () => {
    setEditing(false);
    await updateMediaTitle(mediaId, title.trim());
  };

  if (editing) {
    return (
      <input
        autoFocus
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onBlur={save}
        onKeyDown={(e) => e.key === "Enter" && save()}
        className="bg-transparent border-b border-white/40 text-white text-sm outline-none w-full"
        placeholder="Untitled"
      />
    );
  }

  return (
    <button
      onClick={() => setEditing(true)}
      className="flex items-center gap-2 text-white text-sm opacity-90 hover:opacity-100"
    >
      <span className="truncate max-w-[220px]">{title || "Untitled"}</span>
      <Pencil size={14} />
    </button>
  );
}
