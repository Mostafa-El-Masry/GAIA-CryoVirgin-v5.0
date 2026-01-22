"use client";

import { Trash2 } from "lucide-react";
import { deleteMedia, getCurrentUser } from "../lib/videoStore";

export function DeleteButton({
  mediaId,
  ownerId,
  onDeleted,
}: {
  mediaId: string;
  ownerId: string;
  onDeleted: () => void;
}) {
  const onDelete = async () => {
    if (!confirm("Delete this media?")) return;
    await deleteMedia(mediaId);
    onDeleted();
  };

  return (
    <button
      onClick={onDelete}
      className="text-white/80 hover:text-red-500"
      title="Delete"
    >
      <Trash2 size={18} />
    </button>
  );
}
