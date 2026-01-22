"use client";

import { useSearchParams } from "next/navigation";

export function FilterBar() {
  const params = useSearchParams();
  const active = params.get("sort") || "latest";

  const base =
    "px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-200";
  const activeCls = "bg-white text-black shadow-md scale-105";
  const inactiveCls =
    "bg-white/10 text-white hover:bg-white/20 hover:scale-105";

  return (
    <div className="sticky top-16 z-30">
      <div className="flex gap-2 items-center backdrop-blur-xl bg-black/40 p-2 rounded-full w-fit mx-auto shadow-lg">
        <a
          href="?sort=views"
          className={`${base} ${active === "views" ? activeCls : inactiveCls}`}
        >
          Most Viewed
        </a>

        <a
          href="?sort=latest"
          className={`${base} ${active === "latest" ? activeCls : inactiveCls}`}
        >
          Latest
        </a>

        <a
          href="?sort=oldest"
          className={`${base} ${active === "oldest" ? activeCls : inactiveCls}`}
        >
          Oldest
        </a>
      </div>
    </div>
  );
}
