"use client";

import Link from "next/link";
import type { PathDefinition } from "./types";

type PathCardProps = {
  path: PathDefinition;
};

const PATH_EXTRA: Record<
  string,
  { level: string; duration: string; tag: string; accent: string }
> = {
  "self-repair": {
    level: "Foundations",
    duration: "Flexible time",
    tag: "Self-work",
    accent: "SR",
  },
  programming: {
    level: "Beginner",
    duration: "Approx. 50 hours",
    tag: "Dev path",
    accent: "DEV",
  },
  accounting: {
    level: "Intermediate",
    duration: "Approx. 40 hours",
    tag: "Finance path",
    accent: "ACC",
  },
};

export function PathCard({ path }: PathCardProps) {
  const extra = PATH_EXTRA[path.id] ?? {
    level: "All levels",
    duration: "Flexible time",
    tag: "Path",
    accent: path.title.charAt(0).toUpperCase(),
  };

  return (
    <Link
      href={`/apollo/academy/Paths/${path.slug}`}
      className="block rounded-[24px] bg-white text-slate-900 shadow-[0_10px_30px_rgba(15,23,42,0.18)] overflow-hidden hover:shadow-[0_14px_40px_rgba(15,23,42,0.28)] transition-shadow duration-200"
    >
      {/* Top image / banner */}
      <div className="relative h-24 sm:h-28 w-full overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-tr from-sky-500 via-indigo-500 to-fuchsia-500" />

        {/* Soft noise overlay */}
        <div className="absolute inset-0 opacity-40 mix-blend-soft-light bg-[radial-gradient(circle_at_0_0,#ffffff40,transparent_60%),radial-gradient(circle_at_100%_100%,#ffffff33,transparent_55%)]" />

        {/* Small GAIA-style badge */}
        <div className="absolute left-4 bottom-3 flex items-center gap-2">
          <div className="h-9 w-9 rounded-2xl bg-white/95 text-slate-900 flex items-center justify-center text-xs font-semibold shadow-md">
            {extra.accent}
          </div>
          <span className="rounded-full bg-black/20 px-3 py-1 text-[11px] font-medium text-white backdrop-blur">
            Apollo Path
          </span>
        </div>

        {/* Favorite icon */}
        <div className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-xs font-semibold text-slate-800">
          ♥
        </div>
      </div>

      {/* Main content */}
      <div className="px-4 pt-4 pb-3 sm:px-5 sm:pt-5 sm:pb-4">
        <h3 className="text-base sm:text-lg font-semibold text-slate-900">
          {path.title}
        </h3>
        <p className="mt-2 line-clamp-3 text-xs sm:text-sm text-slate-600">
          {path.shortDescription}
        </p>

        <p className="mt-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-sky-600">
          {extra.tag}
        </p>
      </div>

      {/* Bottom meta bar */}
      <div className="flex items-center justify-between gap-3 border-t border-slate-100 bg-slate-50 px-4 py-2.5 text-[11px] sm:text-xs text-slate-500">
        <div className="flex items-center gap-1.5">
          <span className="inline-block h-1.5 w-4 rounded-full bg-slate-400" />
          <span>{extra.level}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-slate-400" />
          <span>{extra.duration}</span>
        </div>
      </div>
    </Link>
  );
}
