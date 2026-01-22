"use client";

export function ReviewBadge({ rating }: { rating: number }) {
  if (!rating) return null;
  return (
    <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
      ⭐ {rating.toFixed(1)}
    </div>
  );
}
