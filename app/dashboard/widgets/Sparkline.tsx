"use client";

/**
 * Lightweight SVG sparkline (no libs). Normalizes values to fit height.
 */

type SparklineProps = {
  points: number[];
  width?: number;
  height?: number;
  className?: string;
};

export default function Sparkline({
  points,
  width = 320,
  height = 64,
  className,
}: SparklineProps) {
  if (!points.length) return <div className="text-sm gaia-muted">No data</div>;

  const min = Math.min(...points);
  const max = Math.max(...points);
  const norm = (v: number) => (max === min ? 0.5 : (v - min) / (max - min));
  const step = points.length > 1 ? width / (points.length - 1) : width;
  const d = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${i * step},${(1 - norm(p)) * height}`)
    .join(" ");

  return (
    <svg width={width} height={height} className={className ?? "block"}>
      <path d={d} fill="none" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}
