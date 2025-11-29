"use client";

import Link from "next/link";
import { allPaths } from "./index";

export default function AcademyPathsHome() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-10 lg:py-12">
      <header className="mb-8 space-y-2 sm:space-y-3">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight">
          Apollo Academy · Paths
        </h1>
        <p className="text-base sm:text-lg text-gray-400">
          All your learning paths in one place. Choose a path to dive into its arcs
          and lessons.
        </p>
      </header>

      <section className="grid gap-6 sm:grid-cols-2">
        {allPaths
          .slice()
          .sort((a, b) => a.order - b.order)
          .map((path) => (
            <Link
              key={path.id}
              href={`/apollo/Academy/Paths/${path.slug}`}
              className="group rounded-2xl border border-gray-800 bg-black/40 p-4 sm:p-5 lg:p-6 shadow-sm transition hover:border-emerald-400 hover:bg-black/70"
            >
              <h2 className="mb-2 text-lg sm:text-xl font-semibold tracking-tight group-hover:text-emerald-300">
                {path.title}
              </h2>
              <p className="mb-3 text-sm sm:text-base text-gray-400">
                {path.shortDescription}
              </p>
              <p className="text-xs sm:text-sm font-medium text-emerald-300">
                Open path →
              </p>
            </Link>
          ))}
      </section>
    </main>
  );
}
